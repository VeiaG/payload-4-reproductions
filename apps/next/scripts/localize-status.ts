/**
 * Runs the predefined `localize-status` migration on documents stored in Payload 3's shape and
 * compares them with the same history created on Payload 4.
 *
 *   pnpm exec payload run ./scripts/localize-status.ts                  # MongoDB (in-memory)
 *   DEV_DB=sqlite pnpm exec payload run ./scripts/localize-status.ts    # SQLite (same code as Postgres)
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
const isSqlite = payload.db.name === 'sqlite'
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

let insertV3: (doc: V3Doc) => Promise<number | string>
let readMain: (id: number | string) => Promise<unknown>
let migrate: () => Promise<void>

if (isSqlite) {
	const db = (payload.db as unknown as { drizzle: { all: (q: unknown) => Promise<any[]>; run: (q: unknown) => Promise<unknown> } }).drizzle
	const run = (q: string) => db.run(sql.raw(q))
	const dropColumn = async (table: string, column: string) => {
		const indexes = await db.all(sql.raw(`SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='${table}'`))
		for (const i of indexes) if (String(i.sql).includes(column)) await run(`DROP INDEX "${i.name}"`)
		await run(`ALTER TABLE "${table}" DROP COLUMN ${column}`)
	}
	// Turn the v4 schema back into v3's: scalar `_status` on the main and versions tables.
	for (const t of ['docs_locales', '_docs_v_locales', '_docs_v', 'docs']) await run(`DELETE FROM "${t}"`)
	await dropColumn('docs_locales', '_status')
	await dropColumn('_docs_v_locales', 'version__status')
	await run(`ALTER TABLE "docs" ADD COLUMN _status TEXT`)
	await run(`ALTER TABLE "_docs_v" ADD COLUMN version__status TEXT`)

	insertV3 = async (doc) => {
		const [{ id }] = await db.all(sql.raw(`INSERT INTO docs (_status, created_at, updated_at) VALUES ('${doc.status}', '${at(0).toISOString()}', '${at(0).toISOString()}') RETURNING id`))
		for (const [locale, title] of Object.entries(doc.title)) await run(`INSERT INTO docs_locales (title, _locale, _parent_id) VALUES ('${title}', '${locale}', ${id})`)
		for (const v of doc.versions) {
			const ts = at(v.minute).toISOString()
			const [{ id: vid }] = await db.all(sql.raw(`INSERT INTO _docs_v (parent_id, version__status, version_created_at, version_updated_at, created_at, updated_at, latest) VALUES (${id}, '${v.status}', '${ts}', '${ts}', '${ts}', '${ts}', ${v === doc.versions.at(-1) ? 1 : 0}) RETURNING id`))
			for (const [locale, title] of Object.entries(v.title)) await run(`INSERT INTO _docs_v_locales (version_title, _locale, _parent_id) VALUES ('${title}', '${locale}', ${vid})`)
		}
		return id
	}
	readMain = async (id) => {
		const cols = await db.all(sql.raw(`SELECT name FROM pragma_table_info('docs') WHERE name = '_status'`))
		if (cols.length) {
			// v3 shape: scalar status on the main table
			const [{ _status }] = await db.all(sql.raw(`SELECT _status FROM docs WHERE id = ${id}`))
			const rows = await db.all(sql.raw(`SELECT _locale, title FROM docs_locales WHERE _parent_id = ${id} ORDER BY _locale`))
			return { _status, locales: Object.fromEntries(rows.map((r) => [r._locale, { title: r.title }])) }
		}
		const rows = await db.all(sql.raw(`SELECT _locale, title, _status FROM docs_locales WHERE _parent_id = ${id} ORDER BY _locale`))
		return { locales: Object.fromEntries(rows.map((r) => [r._locale, { _status: r._status, title: r.title }])) }
	}
	const { migrateLocalizeStatus } = await import('@payloadcms/db-sqlite/migration-utils')
	migrate = () => migrateLocalizeStatus({ db, payload, req } as never)
} else {
	const conn = payload.db.connection.db!
	const main = conn.collection('docs')
	const versions = conn.collection('_docs_versions')
	await main.deleteMany({})
	await versions.deleteMany({})

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

const draftOnTopId = await insertV3(draftOnTop)
const enOnlyId = await insertV3(enOnly)
console.log(`\n=== ${payload.db.name}: Payload 3 data, before migration`)
console.log(`draft on top: ${JSON.stringify(await readMain(draftOnTopId))}`)
console.log(`en only:      ${JSON.stringify(await readMain(enOnlyId))}`)

await migrate()

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
