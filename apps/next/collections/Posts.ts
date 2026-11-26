import type { CollectionConfig, Tab } from 'payload'

// A wide strip of tabs: its min-content is wider than the main column of a drawer.
const tabLabels = ['Overview', 'Biography', 'Contacts', 'Licences', 'Classification', 'Results', 'History', 'Settings']
const tabs: Tab[] = tabLabels.map((label) => ({
	label,
	fields: [{ name: `${label.toLowerCase()}Note`, type: 'text' }],
}))

export const Posts: CollectionConfig = {
	slug: 'posts',
	admin: { useAsTitle: 'title' },
	fields: [
		{ name: 'title', type: 'text', required: true },
		{ type: 'tabs', tabs },
		{ name: 'related', type: 'relationship', relationTo: 'posts' },
		{ name: 'status', type: 'text', admin: { position: 'sidebar', description: 'A sidebar field: its right edge should stay inside the drawer.' } },
	],
}
