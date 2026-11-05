/**
 * Runs the predefined `localize-status` migration on a document stored in Payload 3's shape and
 * compares it with the same history created on Payload 4.
 *
 *   pnpm --filter @repro/next exec payload run ./scripts/localize-status.ts
 */
import { migrateLocalizeStatus } from '@payloadcms/db-mongodb/migration-utils'
import { getPayload, type PayloadRequest } from 'payload'

import config from '../payload.config'

const payload = await getPayload({ config })
const db = payload.db.connection.db!
const main = db.collection('docs')
const versions = db.collection('_docs_versions')
const at = (min: number) => new Date(Date.UTC(2026, 0, 1, 0, min))
const title = { de: 'PD DE', en: 'PD EN' }
await main.deleteMany({})
await versions.deleteMany({})

// --- Payload 3 data: published in en + de, then an unpublished draft edit on top -------------
// Main doc keeps the published content and scalar `_status: 'published'`; the draft lives only in
// the newest version.
const { insertedId: id } = await main.insertOne({ _status: 'published', createdAt: at(0), title, updatedAt: at(1) })
await versions.insertMany([
	{ autosave: false, createdAt: at(0), latest: false, parent: id, updatedAt: at(0), version: { _status: 'published', createdAt: at(0), title, updatedAt: at(0) } },
	{ autosave: false, createdAt: at(1), latest: false, parent: id, updatedAt: at(1), version: { _status: 'published', createdAt: at(0), title, updatedAt: at(1) } },
	{ autosave: false, createdAt: at(2), latest: true, parent: id, updatedAt: at(2), version: { _status: 'draft', createdAt: at(0), title: { de: 'PD DE', en: 'PD EN (unpublished edit)' }, updatedAt: at(2) } },
])
const before = await main.findOne({ _id: id })

await migrateLocalizeStatus({ payload, req: { payload } as PayloadRequest })

const after = await main.findOne({ _id: id })
const publishedAfter = await payload.find({ collection: 'docs', overrideAccess: true, locale: 'en', where: { _status: { equals: 'published' } } })

// --- Control: the same history on Payload 4 ------------------------------------------------------
const v4 = await payload.create({ collection: 'docs', overrideAccess: true, data: { _status: 'published', title: 'PD EN' }, locale: 'en' })
await payload.update({ id: v4.id, collection: 'docs', overrideAccess: true, data: { _status: 'published', title: 'PD DE' }, locale: 'de' })
await payload.update({ id: v4.id, collection: 'docs', overrideAccess: true, data: { title: 'PD EN (unpublished edit)' }, draft: true, locale: 'en' })
const v4Main = await payload.db.collections.docs.findById(v4.id).lean()

const show = (doc: unknown) => JSON.stringify(doc && { _status: (doc as { _status: unknown })._status, title: (doc as { title: unknown }).title })
console.log('\n[v3 data] main doc before migration:', show(before))
console.log('[v3 data] main doc after migration: ', show(after))
console.log('[v3 data] find _status=published (en) after migration:', publishedAfter.docs.filter((d) => String(d.id) === String(id)).length, 'of 1')
console.log('[v4 control] main doc after the same history:', show(v4Main))
process.exit(0)
