import type { ServerAdapter } from 'payload'

import config from '@payload-config'
import { cookies, headers } from 'next/headers'
import { getExistingAuthToken, refresh } from 'payload/auth'

/**
 * Same cookie store as `nextServerAdapter` in `@payloadcms/next` (which can't be imported
 * into a route handler): `getAll()` plus `get()`, backed by `next/headers`.
 */
const serverAdapter = {
	getCookies: async () => {
		const store = await cookies()
		return {
			get: (name: string) => {
				const cookie = store.get(name)
				return cookie ? { name: cookie.name, value: cookie.value } : undefined
			},
			getAll: () => store.getAll().map(({ name, value }) => ({ name, value })),
			set: (name: string, value: string, options?: object) => store.set(name, value, options),
		}
	},
	getHeaders: () => headers(),
	setCookie: async (name: string, value: string, options?: object) => {
		;(await cookies()).set(name, value, options)
	},
} as unknown as ServerAdapter

/**
 * Calls the `refresh` server function, so the request's own cookies and `Authorization`
 * header decide what it does. Also reports which cookie `getExistingAuthToken` matched.
 */
export const GET = async () => {
	const resolved = await config
	const existing = await getExistingAuthToken({ cookiePrefix: resolved.cookiePrefix, serverAdapter })
	try {
		return Response.json({ existing: existing?.name ?? null, refresh: await refresh({ config, serverAdapter }) })
	} catch (error) {
		return Response.json({ existing: existing?.name ?? null, threw: (error as Error).message })
	}
}
