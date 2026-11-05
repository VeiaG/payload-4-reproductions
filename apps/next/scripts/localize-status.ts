/**
 * Runs the predefined `localize-status` migration on documents stored in Payload 3's shape and
 * compares them with the same history created on Payload 4.
 *
 *   pnpm exec payload run ./scripts/localize-status.ts                  # MongoDB (in-memory)
 *   DEV_DB=sqlite pnpm exec payload run ./scripts/localize-status.ts    # SQLite (fresh file each run)
 *   DEV_DB=postgres pnpm exec payload run ./scripts/localize-status.ts  # Postgres (`docker compose up -d`)
 *
 * Against a real `payload migrate` (SQL): LS_STEP=setup, then `payload migrate:create --file
 * @payloadcms/db-<adapter>/localize-status` + `payload migrate`, then LS_STEP=report.
 *
 * Two documents:
 * - "draft on top": published in en + de, then an unpublished draft edit in en
 * - "en only": published, with content only in en (de reads it through fallback on Payload 3)
 */
import { sql } from '@payloadcms/db-sqlite'
import { getPayload, type PayloadRequest } from 'payload'

import config from '../payload.config'

const payload = await getPayload({ config })
const req = { payload } as PayloadRequest
const isPostgres = payload.db.name === 'postgres'
const isSql = isPostgres || payload.db.name === 'sqlite'
const at = (min: number) => new Date(Date.UTC(2026, 0, 1, 0, min))

type V3Version = { minute: number; status: 'draft' | 'published'; title: Record<string, string> }
type V3Doc = { status: 'draft' | 'published'; title: Record<string, string>; versions: V3Version[] }

const draftOnTop: V3Doc = {
	status: 'published',
	title: { de: 'PD DE', en: 'PD EN' },
	versions: [
		{ minute: 0, status: 'published', title: { de: 'PD DE', en: 'PD EN' } },
		{ minute: 1, status: 'published', title: { de: 'PD DE', en: 'PD EN' } },
		{ minute: 2, status: 'draft', title: { de: 'PD DE', en: 'PD EN (unpublished edit)' } },
	],
}
const enOnly: V3Doc = {
	status: 'published',
	title: { en: 'EN only' },
	versions: [{ minute: 0, status: 'published', title: { en: 'EN only' } }],
}

// --- Payload 3 data --------------------------------------------------------------------------------

/** `setup`: write v3 data and stop. `report`: only print the result (after a real `payload migrate`). */
const step = process.env.LS_STEP as 'report' | 'setup' | undefined

let setupV3: () => Promise<void>
let existingIds: () => Promise<(number | string)[]>
let insertV3: (doc: V3Doc) => Promise<number | string>
let readMain: (id: number | string) => Promise<unknown>
let migrate: () => Promise<void>

if (isSql) {
	const drizzle = (payload.db as unknown as { drizzle: any }).drizzle
	const all = async (q: string): Promise<any[]> =>
		isPostgres ? (await drizzle.execute(sql.raw(q))).rows : drizzle.all(sql.raw(q))
	const run = (q: string) => all(q)
	const dropColumn = async (table: string, column: string) => {
		if (!isPostgres) {
			// SQLite refuses to drop a column that an index still references
			const indexes = await all(`SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='${table}'`)
			for (const i of indexes) if (String(i.sql).includes(column)) await run(`DROP INDEX "${i.name}"`)
		}
		await run(`ALTER TABLE "${table}" DROP COLUMN ${column}`)
	}
	const hasColumn = async (table: string, column: string) =>
		(isPostgres
			? await all(`SELECT 1 FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`)
			: await all(`SELECT name FROM pragma_table_info('${table}') WHERE name = '${column}'`)
		).length > 0

	// Turn the v4 schema back into v3's: scalar `_status` on the main and versions tables.
	setupV3 = async () => {
		for (const t of ['docs_locales', '_docs_v_locales', '_docs_v', 'docs']) await run(`DELETE FROM "${t}"`)
		await dropColumn('docs_locales', '_status')
		await dropColumn('_docs_v_locales', 'version__status')
		await run(`ALTER TABLE "docs" ADD COLUMN _status ${isPostgres ? '"enum_docs_status"' : 'TEXT'}`)
		await run(`ALTER TABLE "_docs_v" ADD COLUMN version__status ${isPostgres ? '"enum__docs_v_version_status"' : 'TEXT'}`)
	}
	existingIds = async () => (await all(`SELECT id FROM docs ORDER BY id`)).map((r) => r.id)

	insertV3 = async (doc) => {
		const [{ id }] = await all(`INSERT INTO docs (_status, created_at, updated_at) VALUES ('${doc.status}', '${at(0).toISOString()}', '${at(0).toISOString()}') RETURNING id`)
		for (const [locale, title] of Object.entries(doc.title)) await run(`INSERT INTO docs_locales (title, _locale, _parent_id) VALUES ('${title}', '${locale}', ${id})`)
		for (const v of doc.versions) {
			const ts = at(v.minute).toISOString()
			const latest = v === doc.versions.at(-1)
			const [{ id: vid }] = await all(`INSERT INTO _docs_v (parent_id, version__status, version_created_at, version_updated_at, created_at, updated_at, latest) VALUES (${id}, '${v.status}', '${ts}', '${ts}', '${ts}', '${ts}', ${isPostgres ? latest : Number(latest)}) RETURNING id`)
			for (const [locale, title] of Object.entries(v.title)) await run(`INSERT INTO _docs_v_locales (version_title, _locale, _parent_id) VALUES ('${title}', '${locale}', ${vid})`)
		}
		return id
	}
	readMain = async (id) => {
		if (await hasColumn('docs', '_status')) {
			// v3 shape: scalar status on the main table
			const [{ _status }] = await all(`SELECT _status FROM docs WHERE id = ${id}`)
			const rows = await all(`SELECT _locale, title FROM docs_locales WHERE _parent_id = ${id} ORDER BY _locale`)
			return { _status, locales: Object.fromEntries(rows.map((r) => [r._locale, { title: r.title }])) }
		}
		const rows = await all(`SELECT _locale, title, _status FROM docs_locales WHERE _parent_id = ${id} ORDER BY _locale`)
		return { locales: Object.fromEntries(rows.map((r) => [r._locale, { _status: r._status, title: r.title }])) }
	}
	// `payload migrate` passes `db: await getTransaction(payload.db, req)`: the drizzle instance.
	// The Postgres migration crashes with that ("query.getSQL is not a function", it calls the
	// adapter's `db.execute({ drizzle, sql })`), so it gets the adapter here, as in migrations-postgres/.
	if (isPostgres) {
		const { migrateLocalizeStatus } = await import('@payloadcms/db-postgres/migration-utils')
		migrate = () => migrateLocalizeStatus({ db: payload.db, payload, req, sql } as never)
	} else {
		const { migrateLocalizeStatus } = await import('@payloadcms/db-sqlite/migration-utils')
		migrate = () => migrateLocalizeStatus({ db: drizzle, payload, req } as never)
	}
} else {
	const conn = payload.db.connection.db!
	const main = conn.collection('docs')
	const versions = conn.collection('_docs_versions')
	setupV3 = async () => {
		await main.deleteMany({})
		await versions.deleteMany({})
	}
	existingIds = async () => (await main.find({}, { sort: { _id: 1 } }).toArray()).map((d) => String(d._id))

	insertV3 = async (doc) => {
		const { insertedId: id } = await main.insertOne({ _status: doc.status, createdAt: at(0), title: doc.title, updatedAt: at(0) })
		await versions.insertMany(
			doc.versions.map((v) => ({
				autosave: false,
				createdAt: at(v.minute),
				latest: v === doc.versions.at(-1),
				parent: id,
				updatedAt: at(v.minute),
				version: { _status: v.status, createdAt: at(0), title: v.title, updatedAt: at(v.minute) },
			})),
		)
		return String(id)
	}
	readMain = async (id) => {
		const doc = await payload.db.collections.docs.findById(id).lean()
		return { _status: doc?._status, title: doc?.title }
	}
	const { migrateLocalizeStatus } = await import('@payloadcms/db-mongodb/migration-utils')
	migrate = () => migrateLocalizeStatus({ payload, req })
}

const publishedIn = async (id: number | string, locale: 'de' | 'en') => {
	const { docs } = await payload.find({ collection: 'docs', locale, overrideAccess: true, where: { _status: { equals: 'published' } } })
	return docs.some((d) => String(d.id) === String(id)) ? 'found' : 'missing'
}
const report = async (label: string, id: number | string) =>
	console.log(`${label}\n  main doc: ${JSON.stringify(await readMain(id))}\n  find _status=published: en ${await publishedIn(id, 'en')}, de ${await publishedIn(id, 'de')}`)

let draftOnTopId: number | string
let enOnlyId: number | string
if (step === 'report') {
	;[draftOnTopId, enOnlyId] = (await existingIds()) as [number | string, number | string]
} else {
	await setupV3()
	draftOnTopId = await insertV3(draftOnTop)
	enOnlyId = await insertV3(enOnly)
	console.log(`\n=== ${payload.db.name}: Payload 3 data, before migration`)
	console.log(`draft on top: ${JSON.stringify(await readMain(draftOnTopId))}`)
	console.log(`en only:      ${JSON.stringify(await readMain(enOnlyId))}`)
	if (step === 'setup') process.exit(0)
	await migrate()
}

console.log(`\n=== ${payload.db.name}: Payload 3 data, after migrateLocalizeStatus`)
await report('draft on top', draftOnTopId)
await report('en only', enOnlyId)

// --- Control: the same histories on Payload 4 ------------------------------------------------------
const a = await payload.create({ collection: 'docs', data: { _status: 'published', title: 'PD EN' }, locale: 'en', overrideAccess: true })
await payload.update({ id: a.id, collection: 'docs', data: { _status: 'published', title: 'PD DE' }, locale: 'de', overrideAccess: true })
await payload.update({ id: a.id, collection: 'docs', data: { title: 'PD EN (unpublished edit)' }, draft: true, locale: 'en', overrideAccess: true })
const b = await payload.create({ collection: 'docs', data: { _status: 'published', title: 'EN only' }, locale: 'en', overrideAccess: true })

console.log(`\n=== ${payload.db.name}: Payload 4 control, same histories`)
await report('draft on top', a.id)
await report('en only', b.id)
process.exit(0)
