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
	if (totalDocs === 0) {
		await payload.create({ collection: 'users', data: DEV_USER, overrideAccess: true })
		payload.logger.info(`Seeded ${DEV_USER.email} / ${DEV_USER.password}`)
	}

	// Saving any non-empty value sends the transform array to the json validator as `{ uri, schema }`.
	const doc = await payload.create({
		collection: 'json-transforms',
		data: { tags: ['a', 'b'] },
		overrideAccess: true,
	})
	payload.logger.info(`[repro] json-transforms: saved ${doc.id}`)
}
