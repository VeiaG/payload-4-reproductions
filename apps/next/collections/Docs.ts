import type { CollectionConfig } from 'payload'

/** Drafts + a localized field: Payload 4 stores `_status` per locale (`localizeStatus`). */
export const Docs: CollectionConfig = {
	slug: 'docs',
	versions: { drafts: true },
	fields: [{ name: 'title', type: 'text', localized: true }],
}
