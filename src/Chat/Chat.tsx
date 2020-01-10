import * as React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { MessageItem, Message as MessageItemMessage } from './MessageItem'
import { StatusItem, Status } from './StatusItem'
import { Channel } from 'twilio-chat/lib/channel'
import { Message } from 'twilio-chat/lib/message'
import { Member } from 'twilio-chat/lib/member'
import { v4 } from 'uuid'

const Header = styled.div`
	background-color: #3543ec;
	color: #ffffff;
	display: flex;
	justify-content: space-between;
	font-weight: 300;
	font-family: 'Inter', sans-serif;
	align-items: center;
	width: 100%;
`

const Title = styled.div`
	margin: 0.5rem 0.5rem 0.5rem 1rem;
`

const Button = styled.button`
	font-family: 'Inter', sans-serif;
	background-color: transparent;
	border: 1px solid;
	height: 30px;
	margin: 0.5rem;
`

const MinimizeButton = styled(Button)`
	width: 30px;
	border-color: #fff;
	${Header} & {
		color: inherit;
	}
`

const Footer = styled(Header)`
	background-color: #d8d8d8;
`

const SendButton = styled(Button)`
	background-color: #fff;
	margin-left: 0.5rem;
`

const MessageInput = styled.input`
	flex-grow: 1;
	font-family: 'Inter', sans-serif;
	background-color: #fff;
	border: 1px solid;
	height: 28px;
	padding: 0 0.5rem;
	margin-left: 0.5rem;
`

const MessageListContainer = styled.div`
	width: 100%;
	background-color: #fff;
`

const MessageList = styled.div`
	min-height: 200px;
	max-height: 500px;
	border-right: 1px solid #ccc;
	border-left: 1px solid #ccc;
	overflow-y: scroll;
`

export const Chat = ({
	channel,
	identity,
}: {
	channel: Channel
	identity: string
}) => {
	const storageKey = `DAChat:minimized:${channel.uniqueName}`
	const [isMinimized, minimize] = useState<boolean>(
		window.localStorage.getItem(storageKey) === '1',
	)
	const memoMinimized = (state: boolean) => {
		window.localStorage.setItem(storageKey, state ? '1' : '0')
		minimize(state)
	}
	const [message, setMessage] = useState<string>('')
	const [messages, updateMessages] = useState<
		(
			| { sid: string; message: MessageItemMessage }
			| { sid: string; status: Status }
		)[]
	>([])

	const messageListRef = React.createRef<HTMLDivElement>()
	let currentMessageListRef = messageListRef.current

	const sendMessage = () => {
		channel.sendMessage(message).catch(err => {
			console.error(err)
			setMessage(message)
		})
		setMessage('')
		currentMessageListRef = messageListRef.current
		setTimeout(() => {
			if (currentMessageListRef) {
				currentMessageListRef.scrollTop = currentMessageListRef.scrollHeight
			}
		}, 250)
	}

	const toMessage = (message: Message) => ({
		sid: message.sid,
		message: {
			timestamp: message.timestamp,
			from: message.author,
			message: message.body,
			fromUser: message.author === identity,
		},
	})

	const newMessageHandler = (message: Message) => {
		updateMessages(prevMessages => [...prevMessages, toMessage(message)])
	}

	const memberJoinedHandler = (member: Member) => {
		updateMessages(prevMessages => [
			...prevMessages,
			{
				sid: v4(),
				status: {
					message: `${member.identity} joined.`,
					timestamp: new Date(),
				},
			},
		])
	}

	const memberLeftHandler = (member: Member) => {
		updateMessages(prevMessages => [
			...prevMessages,
			{
				sid: v4(),
				status: {
					message: `${member.identity} left.`,
					timestamp: new Date(),
				},
			},
		])
	}

	useEffect(() => {
		channel.on('messageAdded', newMessageHandler)
		channel.on('memberJoined', memberJoinedHandler)
		channel.on('memberLeft', memberLeftHandler)
		return () => {
			channel.removeListener('messageAdded', newMessageHandler)
			channel.removeListener('memberJoined', memberJoinedHandler)
			channel.removeListener('memberLeft', memberLeftHandler)
		}
	}, [channel])

	return (
		<>
			<Header>
				<Title>
					Chat: <strong>#{channel.uniqueName}</strong>
				</Title>
				{!isMinimized && (
					<MinimizeButton
						onClick={() => {
							memoMinimized(true)
						}}
					>
						_
					</MinimizeButton>
				)}
				{isMinimized && (
					<MinimizeButton
						onClick={() => {
							memoMinimized(false)
						}}
					>
						+
					</MinimizeButton>
				)}
			</Header>
			{!isMinimized && (
				<>
					<MessageListContainer>
						<MessageList ref={messageListRef}>
							{messages.map(m =>
								'status' in m ? (
									<StatusItem key={m.sid} status={m.status} />
								) : (
									<MessageItem key={m.sid} message={m.message} />
								),
							)}
						</MessageList>
					</MessageListContainer>
					<Footer>
						<MessageInput
							placeholder="Write something here..."
							value={message}
							onChange={({ target: { value } }) => {
								setMessage(value)
							}}
							onKeyUp={({ keyCode }) => {
								if (keyCode === 13 && message.length > 0) {
									sendMessage()
								}
							}}
						/>
						<SendButton disabled={!(message.length > 0)} onClick={sendMessage}>
							send
						</SendButton>
					</Footer>
				</>
			)}
		</>
	)
}
