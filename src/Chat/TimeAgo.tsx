import * as React from 'react'

export const TimeAgo = ({ from, ...props }: { from: Date }) => (
	<time dateTime={from.toISOString()} {...props}>
		{from.toLocaleTimeString()} {from.toLocaleDateString()}
	</time>
)
