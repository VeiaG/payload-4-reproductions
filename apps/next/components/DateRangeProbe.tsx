'use client'
import { DatePicker } from '@payloadcms/ui'
import { useState } from 'react'

type Range = [Date | null, Date | null]

const show = ([start, end]: Range) =>
	`${start?.toDateString() ?? '-'} → ${end?.toDateString() ?? '-'}`

/**
 * Two `DatePicker`s in react-datepicker's range mode, turned on through `overrides`.
 * A: through the `onChange` prop. B: same, plus `overrides.onChange`, which is spread after
 * Payload's own handler and bypasses it.
 */
export const DateRangeProbe = () => {
	const [a, setA] = useState<Range>([null, null])
	const [b, setB] = useState<Range>([null, null])

	return (
		<div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
			<div id="range-a">
				<p>A: onChange prop. Range: {show(a)}</p>
				<DatePicker
					onChange={(value) => setA(value as unknown as Range)}
					overrides={{ endDate: a[1], selectsRange: true, startDate: a[0] }}
					value={a[0] ?? undefined}
				/>
			</div>
			<div id="range-b">
				<p>B: overrides.onChange. Range: {show(b)}</p>
				<DatePicker
					overrides={{
						endDate: b[1],
						onChange: (value: Range) => setB(value),
						selectsRange: true,
						startDate: b[0],
					}}
					value={b[0] ?? undefined}
				/>
			</div>
		</div>
	)
}
