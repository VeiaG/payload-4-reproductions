import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionConfig } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
	slug: 'media',
	access: { read: () => true },
	upload: {
		staticDir: path.resolve(dirname, '../media'),
		admin: { components: { filePreview: '/components/WidePreview#WidePreview' } },
	},
	fields: [{ name: 'alt', type: 'text' }],
}
