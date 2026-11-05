import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharedConfig from '../../next/payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * The shared config (`apps/next/payload.config.ts`) served by TanStack Start. Only the import map
 * file moves: this app keeps its own next to its routes, generated against the same `baseDir`, so
 * component paths in the shared config keep resolving from `apps/next/`.
 */
const config = await sharedConfig

export default {
	...config,
	admin: {
		...config.admin,
		importMap: {
			...config.admin.importMap,
			importMapFile: path.resolve(dirname, 'app/_payload/importMap.js'),
		},
	},
}
