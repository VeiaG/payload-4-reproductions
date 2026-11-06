import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Reference } from './collections/Reference'
import { Users } from './collections/Users'
import { startMemoryMongo } from './helpers/memoryDb'
import { DEV_USER, seed } from './helpers/seed'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const useDb = process.env.DEV_DB === 'sqlite' ? 'sqlite' : 'mongo'
const autoGenerate = process.env.PAYLOAD_SKIP_AUTOGEN !== '1'

const sqliteUrl = (): string => {
	const folder = path.resolve(dirname, '.sqlite')
	mkdirSync(folder, { recursive: true })
	return `file:${path.join(folder, 'payload.db')}`
}

/**
 * Shared by both dev apps: Next.js serves it directly, TanStack Start (`apps/tanstack`) imports it
 * and swaps only the import map file. `DEV_DB=sqlite` switches the database.
 */
export default buildConfig({
	secret: process.env.PAYLOAD_SECRET ?? 'dev-secret-not-for-prod',
	db:
		useDb === 'sqlite'
			? sqliteAdapter({ client: { url: process.env.DATABASE_URI_SQLITE ?? sqliteUrl() } })
			: mongooseAdapter({ ensureIndexes: true, url: process.env.DATABASE_URI_MONGO ?? (await startMemoryMongo()) }),
	editor: lexicalEditor(),
	collections: [Users, Media, Posts, Reference],
	globals: [],
	admin: {
		user: Users.slug,
		autoLogin: { email: DEV_USER.email, password: DEV_USER.password },
		importMap: {
			autoGenerate,
			baseDir: path.resolve(dirname),
		},
	},
	typescript: {
		autoGenerate,
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
	telemetry: false,
	onInit: async (payload) => {
		await seed(payload)
	},
})
