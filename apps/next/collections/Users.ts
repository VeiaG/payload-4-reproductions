import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
	slug: 'users',
	// `REPRO_USE_SESSIONS=0` turns sessions off (the case where `refresh` writes a cookie).
	auth: { useAPIKey: true, useSessions: process.env.REPRO_USE_SESSIONS !== '0' },
	admin: { useAsTitle: 'email' },
	fields: [],
}
