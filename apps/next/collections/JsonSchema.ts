import type { CollectionConfig, JSONField } from 'payload'

/** `{ a: number }`, required. */
export const schema: NonNullable<JSONField['jsonSchema']>['schema'] = {
	type: 'object',
	properties: { a: { type: 'number' } },
	required: ['a'],
}

/**
 * The "Remote JSON Schema" form from the docs (`uri` + `fileMatch`, no `schema`). A `data:` URI keeps
 * the repro offline; Node's `fetch` serves it like any URL.
 */
export const remoteUri = `data:application/json,${encodeURIComponent(JSON.stringify(schema))}`

/** Control: the "Local JSON Schema" form from the docs. Invalid data is rejected. */
export const JsonLocal: CollectionConfig = {
	slug: 'json-local',
	fields: [
		{
			name: 'data',
			type: 'json',
			jsonSchema: { uri: 'a://b/data.json', fileMatch: ['a://b/data.json'], schema },
		},
	],
}

/** Bug: the documented remote form. Invalid data is saved. */
export const JsonRemote: CollectionConfig = {
	slug: 'json-remote',
	fields: [
		{
			name: 'data',
			type: 'json',
			// @ts-expect-error -- `schema` is required by the type, although the docs' remote example omits it
			jsonSchema: { uri: remoteUri, fileMatch: [remoteUri] },
		},
	],
}
