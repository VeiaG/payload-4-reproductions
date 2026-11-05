import type { CollectionConfig } from 'payload'

/**
 * The example from the v4 migration guide ("Field schema configuration now reflects JSON Schema"),
 * verbatim: a json field whose `typescriptSchema` became `jsonSchema`.
 */
export const JsonTransforms: CollectionConfig = {
	slug: 'json-transforms',
	fields: [
		{
			name: 'tags',
			type: 'json',
			// @ts-expect-error `JSONField['jsonSchema']` is `{ uri, fileMatch, schema }`, not the transform array
			jsonSchema: [() => ({ type: 'array', items: { type: 'string' } })],
		},
	],
}
