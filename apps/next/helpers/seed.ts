import type { Payload } from 'payload'

export const DEV_USER = { email: 'dev@payloadcms.com', password: 'password' } as const

/**
 * Creates the auto-login user on first boot. Add reproduction data here. Payload 4's Local API
 * enforces access control by default, so seeding opts out explicitly.
 */
export const seed = async (payload: Payload): Promise<void> => {
	const { totalDocs } = await payload.count({
		collection: 'users',
		overrideAccess: true,
		where: { email: { equals: DEV_USER.email } },
	})
	if (totalDocs > 0) return

	await payload.create({ collection: 'users', data: DEV_USER, overrideAccess: true })
	payload.logger.info(`Seeded ${DEV_USER.email} / ${DEV_USER.password}`)
}
