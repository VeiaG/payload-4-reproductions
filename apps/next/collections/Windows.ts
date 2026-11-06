import type { CollectionConfig } from 'payload'

/**
 * Ticking "Announce" reveals a date field with an `admin.description`. On TanStack Start, the
 * first time this happens after a page load, the whole form resets to its initial state.
 * "End at time" reveals a plain date field (no description) and works on both frameworks.
 */
export const Windows: CollectionConfig = {
	slug: 'windows',
	admin: { useAsTitle: 'title' },
	fields: [
		{ name: 'title', type: 'text' },
		{ name: 'endAtTime', type: 'checkbox', defaultValue: false },
		{
			name: 'endsAt',
			type: 'date',
			admin: { condition: (_, siblingData) => siblingData?.endAtTime === true },
		},
		{ name: 'announce', type: 'checkbox' },
		{
			name: 'announceAt',
			type: 'date',
			admin: {
				description: 'When the banner starts announcing.',
				condition: (_, siblingData) => siblingData?.announce === true,
			},
		},
		{
			name: 'bannerText',
			type: 'richText',
			admin: { condition: (_, siblingData) => siblingData?.announce === true },
		},
		{
			type: 'tabs',
			tabs: [
				{ label: 'Main', fields: [{ name: 'note', type: 'text' }] },
				{
					label: 'Banner',
					admin: { condition: (data) => data?.announce === true },
					fields: [{ name: 'banner', type: 'richText' }],
				},
			],
		},
	],
}
