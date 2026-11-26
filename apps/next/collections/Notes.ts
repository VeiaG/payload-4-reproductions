import type { CollectionConfig, Where } from 'payload'

// Nobody may read notes. The clause is a module constant, so every request gets the same object.
const NOBODY: Where = { id: { in: [] } }

export const Notes: CollectionConfig = {
	slug: 'notes',
	admin: { useAsTitle: 'text' },
	access: { read: () => NOBODY },
	fields: [{ name: 'text', type: 'text' }],
}
