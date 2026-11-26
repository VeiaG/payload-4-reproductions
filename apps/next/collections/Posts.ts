import type { CollectionConfig, Field } from 'payload'

const whenShown = { condition: (data: Record<string, unknown>) => Boolean(data.showDetails) }

// A row without a condition of its own, whose fields are all conditional.
const detailsRow = (prefix: string): Field => ({
	type: 'row',
	fields: [
		{ name: `${prefix}A`, type: 'text', admin: whenShown },
		{ name: `${prefix}B`, type: 'text', admin: whenShown },
	],
})

export const Posts: CollectionConfig = {
	slug: 'posts',
	admin: { useAsTitle: 'title' },
	fields: [
		{ name: 'title', type: 'text', required: true },
		{ name: 'showDetails', type: 'checkbox' },
		detailsRow('first'),
		detailsRow('second'),
		{ name: 'after', type: 'text' },
		{ name: 'content', type: 'richText' },
	],
}
