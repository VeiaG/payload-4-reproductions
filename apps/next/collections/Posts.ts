import type { CollectionConfig, Where } from 'payload'

// Posts without a title, or with one: every post. A module constant, like NOBODY in Notes.ts.
const ANY_POST: Where = { or: [{ title: { equals: null } }, { title: { exists: true } }] }

export const Posts: CollectionConfig = {
	slug: 'posts',
	admin: { useAsTitle: 'title' },
	access: { read: () => ANY_POST },
	fields: [
		{ name: 'title', type: 'text', required: true },
		{ name: 'content', type: 'richText' },
	],
}
