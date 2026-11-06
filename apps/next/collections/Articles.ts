import type { CollectionConfig } from 'payload'

/** Drafts + localized fields, so `localizeStatus` is on (the v4 default). */
export const Articles: CollectionConfig = {
	slug: 'articles',
	// `REPRO_AUTHORSHIP=0` drops createdBy/updatedBy: then B's draft save keeps `en` published.
	authorship: process.env.REPRO_AUTHORSHIP !== '0',
	versions: { drafts: true },
	fields: [
		{ name: 'title', type: 'text', localized: true },
		{ name: 'subtitle', type: 'text', localized: true },
	],
}
