import * as React from 'react'
import { useLayoutEffect } from 'react'
import styled from 'styled-components'
import { TimeAgo } from './TimeAgo'

const MessageView = styled.div`
	border-radius: 10px;
	background-color: #dbedff;
	margin: 1rem 4rem 1rem 1rem;
`

const UserMessageView = styled(MessageView)`
	margin: 1rem 1rem 1rem 4rem;
	background-color: #dbfff7;
`

const Text = styled.div`
	font-size: 95%;
	padding: 0.5rem 0.5rem 0 0.5rem;
`

const Meta = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	font-size: 80%;
	font-weight: 300;
	margin: 0 0.5rem 0.5rem 0.5rem;
	padding-bottom: 0.5rem;
	opacity: 0.85;
`

const From = styled.div`
	font-size: 80%;
	font-weight: 300;
	padding: 0.5rem 0.5rem 0 0.5rem;
	opacity: 0.85;
`

const GreenIndicator = styled.span`
	:after {
		content: '';
	}
	border-radius: 100%;
	border: 0;
	width: 10px;
	height: 10px;
	display: inline-block;
	background-color: #0f0;
	margin-left: 0.25rem;
`

const RedIndicator = styled(GreenIndicator)`
	background-color: #f00;
`

export const Status = ({ sent }: { sent: boolean }) =>
	sent ? <GreenIndicator /> : <RedIndicator />

export type Message = {
	from: string
	message: string
	timestamp: Date
	fromUser?: boolean
}

// See https://www.designedbyaturtle.co.uk/convert-string-to-hexidecimal-colour-with-javascript-vanilla/

const hashString = (str: string) => {
	let hash = 0,
		i,
		chr
	if (str.length === 0) return hash
	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i)
		hash = (hash << 5) - hash + chr
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}

// Convert an int to hexadecimal with a max length
// of six characters.
const intToARGB = (i: number) => {
	let hex =
		((i >> 24) & 0xff).toString(16) +
		((i >> 16) & 0xff).toString(16) +
		((i >> 8) & 0xff).toString(16) +
		(i & 0xff).toString(16)
	// Sometimes the string returned will be too short so we
	// add zeros to pad it out, which later get removed if
	// the length is greater than six.
	hex += '000000'
	return hex.substring(0, 6)
}

/**
 * From this W3C document: http://www.webmasterworld.com/r.cgi?f=88&d=9769&url=http://www.w3.org/TR/AERT#color-contrast
 *
 * Color brightness is determined by the following formula:
 * ((Red value X 299) + (Green value X 587) + (Blue value X 114)) / 1000
 *
 * @see https://codepen.io/davidhalford/pen/ywEva
 */
const contrast = (hex: string) => {
	const hRed = parseInt(hex.substring(0, 2), 16)
	const hGreen = parseInt(hex.substring(2, 4), 16)
	const hBlue = parseInt(hex.substring(4, 6), 16)
	const cBrightness = (hRed * 299 + hGreen * 587 + hBlue * 114) / 1000
	const threshold = 130 /* about half of 256. Lower threshold equals more dark text on dark background  */
	if (cBrightness > threshold) {
		return false
	} else {
		return true
	}
}

export const MessageItem = ({
	message: { from, message, timestamp, fromUser },
	onRendered,
}: {
	message: Message
	onRendered: () => void
}) => {
	const V = fromUser ? UserMessageView : MessageView

	useLayoutEffect(() => {
		onRendered()
	})

	const userColor = intToARGB(hashString(from))
	return (
		<V
			style={{
				backgroundColor: `#${userColor}${contrast(userColor) ? 'FF' : '80'}`,
				color: `${contrast(userColor) ? 'white' : 'black'}`,
			}}
		>
			<From>{from}</From>
			<Text>{message}</Text>
			<Meta>
				<TimeAgo from={timestamp} />
			</Meta>
		</V>
	)
}
