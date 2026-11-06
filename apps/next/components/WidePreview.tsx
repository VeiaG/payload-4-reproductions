'use client'

/**
 * A custom `filePreview` whose content is wider than the panel (think spreadsheet grid,
 * wide table, canvas). It scrolls inside its own box, so it should never widen the panel.
 */
export const WidePreview = () => (
	<div style={{ height: '100%', overflow: 'auto' }}>
		<div
			style={{
				background: 'linear-gradient(90deg, #eee, #999)',
				height: 400,
				width: 2400,
			}}
		/>
	</div>
)
