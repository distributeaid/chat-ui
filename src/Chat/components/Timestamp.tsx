import * as React from 'react'

export const Timestamp = ({ from, ...props }: { from: Date }) => (
	<time dateTime={from.toISOString()} {...props}>
		{from.toLocaleTimeString()} {from.toLocaleDateString()}
	</time>
)
