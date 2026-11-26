import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block, CollectionConfig, Field } from 'payload'

const asyncField: Field = {
	name: 'note',
	type: 'text',
	admin: { components: { Field: '/components/AsyncServerField#AsyncServerField' } },
}

const group: Field = { name: 'size', type: 'group', fields: [{ name: 'mobile', type: 'number' }] }

const inlineBlocks: Block[] = [
	{ slug: 'asyncAndGroup', fields: [asyncField, group] },
	{ slug: 'asyncOnly', fields: [asyncField] },
	{ slug: 'groupOnly', fields: [group] },
]

export const Posts: CollectionConfig = {
	slug: 'posts',
	admin: { useAsTitle: 'title' },
	fields: [
		{ name: 'title', type: 'text' },
		{
			name: 'content',
			type: 'richText',
			editor: lexicalEditor({
				features: ({ defaultFeatures }) => [...defaultFeatures, BlocksFeature({ inlineBlocks })],
			}),
		},
	],
}
