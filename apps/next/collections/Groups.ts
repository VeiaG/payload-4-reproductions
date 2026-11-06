import type { CollectionConfig, Field } from 'payload'

const pair = (prefix: string): Field[] => [
	{ name: `${prefix}Text`, type: 'text' },
	{ name: `${prefix}Number`, type: 'number' },
]

/**
 * Every kind of group the admin renders, alone and nested, to look for the group's border
 * overlapping its label. `related` points at this collection, so the same layouts can be opened
 * in a document drawer (click the relationship value → edit).
 */
export const Groups: CollectionConfig = {
	slug: 'groups',
	admin: { useAsTitle: 'title' },
	fields: [
		{ name: 'title', type: 'text' },
		{
			name: 'related',
			type: 'relationship',
			relationTo: 'groups',
			admin: { description: 'Pick a document, then open it in a drawer from the value.' },
		},

		// Top level
		{ name: 'named', type: 'group', fields: pair('named') },
		{
			name: 'namedDescribed',
			type: 'group',
			label: 'Named group with a label and description',
			admin: { description: 'A description under the group label.' },
			fields: pair('described'),
		},
		{
			name: 'namedLongLabel',
			type: 'group',
			label:
				'Named group with a very long label that should wrap onto a second line in a narrow window',
			fields: pair('longLabel'),
		},
		{ name: 'namedNoLabel', type: 'group', label: false, fields: pair('noLabel') },
		{ name: 'namedHideGutter', type: 'group', admin: { hideGutter: true }, fields: pair('noGutter') },
		{ type: 'group', label: 'Unnamed group with a label', fields: pair('unnamed') },
		{ type: 'group', fields: pair('unnamedNoLabel') },
		{ name: 'readOnlyGroup', type: 'group', admin: { readOnly: true }, fields: pair('readOnly') },
		{
			name: 'requiredInside',
			type: 'group',
			admin: { description: 'Save empty to see the error state.' },
			fields: [{ name: 'requiredText', type: 'text', required: true }],
		},

		// First child types right under the label
		{
			name: 'firstRow',
			type: 'group',
			label: 'Group whose first child is a row',
			fields: [
				{
					type: 'row',
					fields: [
						{ name: 'left', type: 'text', admin: { width: '50%' } },
						{ name: 'right', type: 'text', admin: { width: '50%' } },
					],
				},
			],
		},
		{
			name: 'firstCheckbox',
			type: 'group',
			label: 'Group whose first child is a checkbox',
			fields: [{ name: 'flag', type: 'checkbox' }, { name: 'after', type: 'text' }],
		},
		{
			name: 'firstArray',
			type: 'group',
			label: 'Group whose first child is an array',
			fields: [{ name: 'items', type: 'array', fields: [{ name: 'item', type: 'text' }] }],
		},

		// Nesting
		{
			name: 'level1',
			type: 'group',
			label: 'Level 1',
			admin: { description: 'Groups in groups, three levels deep.' },
			fields: [
				{ name: 'level1Text', type: 'text' },
				{
					name: 'level2',
					type: 'group',
					label: 'Level 2',
					admin: { description: 'Second level.' },
					fields: [
						{ name: 'level2Text', type: 'text' },
						{
							name: 'level3',
							type: 'group',
							label: 'Level 3',
							admin: { description: 'Third level.' },
							fields: pair('level3'),
						},
						{ name: 'level2After', type: 'text' },
					],
				},
				{ type: 'group', label: 'Unnamed group in a named group', fields: pair('unnamedIn') },
				{ name: 'level2NoLabel', type: 'group', label: false, fields: pair('level2NoLabel') },
			],
		},
		{
			name: 'directNest',
			type: 'group',
			label: 'Group whose first child is a group',
			fields: [
				{
					name: 'inner',
					type: 'group',
					label: 'Inner group (first child)',
					fields: [
						{ name: 'innermost', type: 'group', label: 'Innermost group', fields: pair('innermost') },
					],
				},
			],
		},

		// Inside other containers
		{
			type: 'row',
			fields: [
				{ name: 'rowGroupA', type: 'group', admin: { width: '50%' }, fields: pair('rowA') },
				{ name: 'rowGroupB', type: 'group', admin: { width: '50%' }, fields: pair('rowB') },
			],
		},
		{
			type: 'collapsible',
			label: 'Collapsible with groups',
			fields: [
				{ name: 'inCollapsible', type: 'group', fields: pair('collapsible') },
				{
					name: 'inCollapsibleNested',
					type: 'group',
					fields: [{ name: 'deep', type: 'group', fields: pair('collapsibleDeep') }],
				},
			],
		},
		{
			type: 'tabs',
			tabs: [
				{
					label: 'Unnamed tab',
					fields: [
						{ name: 'inTab', type: 'group', fields: pair('tab') },
						{
							name: 'inTabNested',
							type: 'group',
							fields: [{ name: 'deep', type: 'group', fields: pair('tabDeep') }],
						},
					],
				},
				{
					name: 'namedTab',
					label: 'Named tab',
					fields: [{ name: 'inNamedTab', type: 'group', fields: pair('namedTab') }],
				},
			],
		},
		{
			name: 'rows',
			type: 'array',
			fields: [
				{ name: 'rowTitle', type: 'text' },
				{ name: 'inArray', type: 'group', fields: pair('array') },
				{
					name: 'inArrayNested',
					type: 'group',
					fields: [{ name: 'deep', type: 'group', fields: pair('arrayDeep') }],
				},
			],
		},
		{
			name: 'blocks',
			type: 'blocks',
			blocks: [
				{
					slug: 'groupBlock',
					fields: [
						{ name: 'inBlock', type: 'group', fields: pair('block') },
						{
							name: 'inBlockNested',
							type: 'group',
							fields: [{ name: 'deep', type: 'group', fields: pair('blockDeep') }],
						},
					],
				},
			],
		},

		// Sidebar
		{
			name: 'sidebarGroup',
			type: 'group',
			admin: { position: 'sidebar', description: 'A group in the sidebar.' },
			fields: [
				{ name: 'sidebarText', type: 'text' },
				{ name: 'sidebarNested', type: 'group', fields: pair('sidebarNested') },
			],
		},
	],
}
