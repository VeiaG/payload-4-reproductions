import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { withPayload } from '@payloadcms/tanstack-start'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import rsc from '@vitejs/plugin-rsc'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** The TanStack Start dev app, on :3001 so it can run next to the Next.js one. */
export default defineConfig(
	withPayload(
		({ pluginOptions }) => ({
			plugins: [
				rsc(pluginOptions.rsc),
				tanstackStart(pluginOptions.tanstackStart),
				viteReact(pluginOptions.react),
			],
			resolve: {
				alias: {
					'@/': `${path.resolve(dirname, 'src')}/`,
				},
			},
			server: {
				port: Number(process.env.PORT ?? 3001),
				warmup: {
					clientFiles: [
						'./src/app/__root.tsx',
						'./src/app/_payload.tsx',
						'./src/app/_payload/admin.index.tsx',
						'./src/app/_payload/admin.$.tsx',
					],
				},
			},
		}),
		{
			// The in-memory MongoDB (`apps/next/helpers/memoryDb.ts`) is CommonJS, which the RSC
			// plugin's CJS-to-ESM rewrite breaks; Node loads it as is instead. Dev serve only.
			devServerExternalPackages: ['mongodb-memory-server', 'mongodb-memory-server-core'],
			payloadConfigPath: path.resolve(dirname, 'src', 'payload.config.ts'),
		}
	)
)
