import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CollectionConfig } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
	slug: 'media',
	access: { read: () => true },
	upload: { staticDir: path.resolve(dirname, '../media') },
	fields: [{ name: 'alt', type: 'text' }],
}
