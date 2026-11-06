import config from '@payload-config'
import { getPayload } from 'payload'

import { DEV_USER } from '../../../../helpers/seed'

/** Gives the seeded dev user a known API key (test value, local only). */
export const GET = async () => {
	const payload = await getPayload({ config })
	const { docs } = await payload.find({
		collection: 'users',
		limit: 1,
		overrideAccess: true,
		where: { email: { equals: DEV_USER.email } },
	})
	await payload.update({
		id: docs[0]!.id,
		collection: 'users',
		data: { apiKey: 'repro-test-api-key', enableAPIKey: true },
		overrideAccess: true,
	})
	return Response.json({ ok: true })
}
