import type { CollectionConfig } from 'payload'

/**
 * No live preview, no `admin.preview`, no scheduled publish: `.doc-controls__icon-buttons` renders
 * empty, and the Marker sits 16px from Save instead of 8px.
 */
export const Posts: CollectionConfig = {
	slug: 'posts',
	admin: {
		useAsTitle: 'title',
		components: { edit: { beforeDocumentControls: ['/components/Marker#Marker'] } },
	},
	fields: [
		{ name: 'title', type: 'text', required: true },
		{ name: 'content', type: 'richText' },
	],
}

/** Same, plus `admin.preview`: the wrapper holds the Preview button and every gap is 8px. */
export const PostsWithPreview: CollectionConfig = {
	slug: 'posts-with-preview',
	admin: {
		useAsTitle: 'title',
		preview: () => 'https://example.com',
		components: { edit: { beforeDocumentControls: ['/components/Marker#Marker'] } },
	},
	fields: [{ name: 'title', type: 'text', required: true }],
}
