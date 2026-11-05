'use client'
import { Button, Drawer, useModal } from '@payloadcms/ui'

export const LONG_DRAWER_SLUG = 'repro-long-drawer'

/** A side drawer taller than the viewport, ending in a `position: sticky; bottom: 0` footer. */
export const LongDrawer = () => {
	const { openModal } = useModal()
	return (
		<>
			<Button id="open-long-drawer" onClick={() => openModal(LONG_DRAWER_SLUG)}>
				Open long drawer
			</Button>
			<Drawer className="repro-long-drawer" slug={LONG_DRAWER_SLUG} title="Long drawer">
				{Array.from({ length: 60 }, (_, i) => (
					<p key={i}>Row {i + 1}</p>
				))}
				<div
					id="sticky-footer"
					style={{ background: 'tomato', bottom: 0, padding: 12, position: 'sticky' }}
				>
					Sticky footer (should stay at the bottom of the viewport)
				</div>
			</Drawer>
		</>
	)
}
