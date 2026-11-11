import type { CollectionConfig } from 'payload'

/**
 * `REPRO_STEP=2` makes `subtitle` required (SQLite has to rebuild the table) and adds `summary`
 * (a new column) in the same change.
 */
const step2 = process.env.REPRO_STEP === '2'

export const Posts: CollectionConfig = {
	slug: 'posts',
	admin: { useAsTitle: 'title' },
	fields: [
		{ name: 'title', type: 'text', required: true },
		{ name: 'content', type: 'richText' },
		{ name: 'subtitle', type: 'text', required: step2 },
		...(step2 ? [{ name: 'summary', type: 'text' as const }] : []),
	],
}
