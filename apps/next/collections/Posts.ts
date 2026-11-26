import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
	slug: 'posts',
	admin: { useAsTitle: 'title' },
	// Autosave is what sends the server's copy of the rich text back to the editor.
	versions: { drafts: { autosave: { interval: 375 } } },
	fields: [
		{ name: 'title', type: 'text' },
		{
			name: 'content',
			type: 'richText',
			editor: lexicalEditor({
				features: ({ defaultFeatures }) => [
					...defaultFeatures,
					BlocksFeature({
						inlineBlocks: [
							// Breaks: `computed` gets its value from an afterRead hook, so the autosaved
							// document has a key the editor's node doesn't.
							{
								slug: 'withAfterRead',
								fields: [
									{ name: 'text', type: 'text' },
									{ name: 'computed', type: 'text', hooks: { afterRead: [() => 'computed'] } },
								],
							},
							// Control: the same block without the hook works.
							{ slug: 'plain', fields: [{ name: 'text', type: 'text' }] },
						],
					}),
				],
			}),
		},
	],
}
