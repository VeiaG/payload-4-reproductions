/** A 32px square in `beforeDocumentControls`, so the gap to the Save button is easy to measure. */
export const Marker = () => (
	<div
		data-testid="marker"
		style={{ background: 'tomato', height: 32, width: 32 }}
		title="beforeDocumentControls marker"
	/>
)
