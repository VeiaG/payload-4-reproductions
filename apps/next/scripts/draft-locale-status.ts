/**
 * User A publishes an article in every locale. User B saves a draft that only changes
 * the German `subtitle`. Expected: `{ en: 'published', de: 'draft' }`. Actual: every
 * locale is `draft`, because the authorship hook changes the non-localized `updatedBy`,
 * which `hasNonLocalizedDataChanged` counts as a shared content change.
 *
 * Run: cd apps/next && PAYLOAD_SKIP_AUTOGEN=1 pnpm exec payload run ./scripts/draft-locale-status.ts
 */
import { getPayload } from 'payload'

import config from '../payload.config'

const payload = await getPayload({ config })

const userFor = async (email: string) => {
	const existing = await payload.find({
		collection: 'users',
		limit: 1,
		overrideAccess: true,
		where: { email: { equals: email } },
	})
	const doc =
		existing.docs[0] ??
		(await payload.create({
			collection: 'users',
			data: { email, password: 'repro-test-password' },
			overrideAccess: true,
		}))
	return { ...doc, collection: 'users' as const }
}

const userA = await userFor('a@repro.test')
const userB = await userFor('b@repro.test')

const status = async (id: number | string) => {
	const doc = await payload.findByID({
		id,
		collection: 'articles',
		draft: true,
		locale: 'all',
		overrideAccess: true,
	})
	return JSON.stringify(doc._status)
}

const run = async (label: string, saver: typeof userA) => {
	const doc = await payload.create({
		collection: 'articles',
		data: { _status: 'published', title: 'Hello' },
		overrideAccess: true,
		publishAllLocales: true,
		user: userA,
	})
	const before = await status(doc.id)

	await payload.update({
		id: doc.id,
		collection: 'articles',
		data: { subtitle: 'Nur Deutsch' },
		draft: true,
		locale: 'de',
		overrideAccess: true,
		user: saver,
	})

	console.log(`[${payload.db.name}] ${label}: before ${before} → after ${await status(doc.id)}`)
}

await run('A publishes, B saves a de draft', userB)
await run('A publishes, A saves a de draft', userA)
process.exit(0)
