import type { CollectionConfig } from 'payload'

/** A native form taller than the viewport, to open in a document drawer. */
export const LongForm: CollectionConfig = {
	slug: 'long-form',
	fields: Array.from({ length: 30 }, (_, i) => ({ name: `field${i + 1}`, type: 'text' as const })),
}

/** Its relationship field's "create new" button opens `long-form` in a native document drawer. */
export const DrawerHost: CollectionConfig = {
	slug: 'drawer-host',
	fields: [{ name: 'related', type: 'relationship', relationTo: 'long-form' }],
}
