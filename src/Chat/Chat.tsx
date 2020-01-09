import * as React from 'react'
import { useState } from 'react'
import styled from 'styled-components'
import { v4 } from 'uuid'
import { MessageItem } from './MessageItem'

const ChatWidget = styled.div`
	@import url('https://rsms.me/inter/inter.css');
	position: absolute;
	z-index: 9999;
	right: 1rem;
	bottom: 1rem;
	font-family: 'Inter', sans-serif;
	max-width: 350px;
`

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
`

export type Message = {
	from: string
	message: string
	id: string
	sent: boolean
	createdAt: Date
	fromUser?: true
}

const MessageList = styled.div`
	min-height: 200px;
	max-height: 500px;
	border-right: 1px solid #ccc;
	border-left: 1px solid #ccc;
	overflow-y: scroll;
`

export const Chat = ({ context }: { context: string }) => {
	const storageKey = `DAChat:minimized:${context}`
	const [isMinimized, minimize] = useState<boolean>(
		window.localStorage.getItem(storageKey) === '1',
	)
	const memoMinimized = (state: boolean) => {
		window.localStorage.setItem(storageKey, state ? '1' : '0')
		minimize(state)
	}
	const [message, setMessage] = useState<string>('')
	const [messages, updateMessages] = useState<Message[]>([
		{
			id: v4(),
			sent: false,
			message: 'This is a sample message, which should span multiple lines.',
			createdAt: new Date(),
			from: 'John',
		},
		{
			id: v4(),
			sent: false,
			message:
				'This is another sample message, which should span multiple lines. This is another sample message, which should span multiple lines.',
			createdAt: new Date(),
			from: 'Jane',
		},

		{
			id: v4(),
			sent: false,
			message: 'This is a sample message from you.',
			createdAt: new Date(),
			from: 'You',
			fromUser: true,
		},
		{
			id: v4(),
			sent: false,
			message:
				'This is another sample message, which should span multiple lines. This is another sample message, which should span multiple lines.',
			createdAt: new Date(),
			from: 'Jane',
		},
		{
			id: v4(),
			sent: false,
			message:
				'This is another sample message, which should span multiple lines. This is another sample message, which should span multiple lines.',
			createdAt: new Date(),
			from: 'Jane',
		},
		{
			id: v4(),
			sent: false,
			message:
				'This is another sample message, which should span multiple lines. This is another sample message, which should span multiple lines.',
			createdAt: new Date(),
			from: 'Jane',
		},
		{
			id: v4(),
			sent: false,
			message:
				'This is another sample message, which should span multiple lines. This is another sample message, which should span multiple lines.',
			createdAt: new Date(),
			from: 'Jane',
		},
		{
			id: v4(),
			sent: false,
			message:
				'This is another sample message, which should span multiple lines. This is another sample message, which should span multiple lines.',
			createdAt: new Date(),
			from: 'Jane',
		},
	])

	const messageListRef = React.createRef<HTMLDivElement>()
	let currentMessageListRef = messageListRef.current

	const sendMessage = () => {
		updateMessages([
			...messages,
			{
				id: v4(),
				sent: false,
				message,
				createdAt: new Date(),
				from: 'You',
				fromUser: true,
			},
		])
		setMessage('')
		currentMessageListRef = messageListRef.current
		setTimeout(() => {
			if (currentMessageListRef) {
				currentMessageListRef.scrollTop = currentMessageListRef.scrollHeight
			}
		}, 250)
	}
	return (
		<ChatWidget>
			<Header>
				<Title>
					Chat context: <code>{context}</code>
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
							{messages.map(m => (
								<MessageItem key={m.id} message={m} />
							))}
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
		</ChatWidget>
	)
}
