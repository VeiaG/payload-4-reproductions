import type { AdminViewServerProps } from 'payload'

/** Prints the `searchParams` the framework adapter hands to a custom admin view. */
export const SearchParamsView = ({ searchParams }: AdminViewServerProps) => (
	<div style={{ padding: 40 }}>
		<h1>searchParams</h1>
		<pre id="search-params">{JSON.stringify(searchParams)}</pre>
	</div>
)
