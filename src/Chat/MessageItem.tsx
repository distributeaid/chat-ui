import * as React from 'react'
import styled from 'styled-components'
import { Message } from './Chat'
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
	margin: 0.5rem 0.5rem 0.5rem 0.5rem;
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

const Status = ({ sent }: { sent: boolean }) =>
	sent ? <GreenIndicator /> : <RedIndicator />

export const MessageItem = ({
	message: { from, sent, message, createdAt, fromUser },
}: {
	message: Message
}) => {
	const V = fromUser ? UserMessageView : MessageView
	return (
		<V>
			<From>{from}</From>
			<Text>{message}</Text>
			<Meta>
				<TimeAgo from={createdAt} />
				{fromUser && <Status sent={sent} />}
			</Meta>
		</V>
	)
}
