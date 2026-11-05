'use client'
import { Button, useActions } from '@payloadcms/ui'
import { useEffect } from 'react'

const action = (label: string) => ({
	repro: (
		<Button buttonStyle="primary" id="repro-header-action" size="medium">
			{label}
		</Button>
	),
})

/** Bug: sets a header action on mount. `ActionsProvider`'s reset effect runs after it and wipes it. */
export const HeaderActionOnMount = () => {
	const { setViewActions } = useActions()
	useEffect(() => {
		setViewActions(action('Set on mount'))
		return () => setViewActions({})
	}, [setViewActions])
	return null
}

/** Control: the same call after mount works. */
export const SetActionsLater = () => {
	const { setViewActions } = useActions()
	return (
		<Button buttonStyle="secondary" id="set-actions-later" onClick={() => setViewActions(action('Set after mount'))}>
			Set actions now
		</Button>
	)
}
