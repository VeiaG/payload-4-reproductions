import type { AdminViewServerProps } from 'payload'

import { Gutter } from '@payloadcms/ui'
import { DefaultTemplate } from '@payloadcms/ui/rsc'

import { HeaderActionOnMount, SetActionsLater } from '../components/HeaderAction'

/**
 * A custom root view (no server `viewActions`). `HeaderActionOnMount` should put a "Set on mount"
 * button into `.app-header__actions`; it doesn't. `SetActionsLater` does the same on click and works.
 */
export const ActionsView = ({ initPageResult, params, searchParams }: AdminViewServerProps) => {
	const { locale, permissions, req, visibleEntities } = initPageResult
	return (
		<DefaultTemplate
			i18n={req.i18n}
			locale={locale}
			params={params}
			payload={req.payload}
			permissions={permissions}
			req={req}
			searchParams={searchParams}
			user={req.user ?? undefined}
			visibleEntities={visibleEntities}
		>
			<Gutter>
				<h1>setViewActions on mount</h1>
				<p>Expected a "Set on mount" button in the header actions. Click below to set it after mount instead.</p>
				<HeaderActionOnMount />
				<SetActionsLater />
			</Gutter>
		</DefaultTemplate>
	)
}
