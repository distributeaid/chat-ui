import * as React from 'react'
import { useState, useEffect } from 'react'
import { formatDistance } from 'date-fns'
import { enGB } from 'date-fns/locale'

const d = (from: Date) => formatDistance(from, new Date(), { locale: enGB })

export const TimeAgo = ({ from, ...props }: { from: Date }) => {
	const [ago, setTimeAgo] = useState<string>(d(from))

	useEffect(() => {
		const i = setInterval(() => {
			setTimeAgo(d(from))
		}, 60000)
		return () => {
			clearInterval(i)
		}
	})

	return (
		<time dateTime={from.toISOString()} {...props}>
			{ago}
		</time>
	)
}
