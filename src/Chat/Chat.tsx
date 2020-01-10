import * as React from 'react'
import { useState, useEffect, useLayoutEffect } from 'react'
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

const TextButton = styled.button`
	font-family: 'Inter', sans-serif;
	background-color: transparent;
	border: 0;
	margin: 0;
	padding: 0;
	color: #1c465a;
	text-decoration: underline;
	width: 100%;
	text-align: center;
	cursor: pointer;
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
	const [messages, updateMessages] = useState<{
		messages: (
			| { sid: string; message: MessageItemMessage }
			| { sid: string; status: Status }
		)[]
		lastIndex?: number
	}>({ messages: [] })

	const sendMessage = () => {
		channel.sendMessage(message).catch(err => {
			console.error(err)
			setMessage(message)
		})
		setMessage('')
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
		updateMessages(prevMessages => ({
			...prevMessages,
			messages: [...prevMessages.messages, toMessage(message)],
			lastIndex: prevMessages.lastIndex
				? prevMessages.lastIndex
				: message.index,
		}))
	}

	const memberJoinedHandler = (member: Member) => {
		updateMessages(prevMessages => ({
			...prevMessages,
			messages: [
				...prevMessages.messages,
				{
					sid: v4(),
					status: {
						message: `${member.identity} joined.`,
						timestamp: new Date(),
					},
				},
			],
		}))
	}

	const memberLeftHandler = (member: Member) => {
		updateMessages(prevMessages => ({
			...prevMessages,
			messages: [
				...prevMessages.messages,
				{
					sid: v4(),
					status: {
						message: `${member.identity} left.`,
						timestamp: new Date(),
					},
				},
			],
		}))
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

	const messageListRef = React.createRef<HTMLDivElement>()
	let scrollToTimeout: number
	const [scrollTo, setScrollTo] = useState<'beginning' | 'end' | 'undefined'>(
		'end',
	)

	useLayoutEffect(() => {
		messageListRef.current?.addEventListener('scroll', () => {
			if (messageListRef.current) {
				if (messageListRef.current.scrollTop === 0) {
					setScrollTo('beginning')
				} else if (
					messageListRef.current.scrollTop +
						messageListRef.current.clientHeight ===
					messageListRef.current.scrollHeight
				) {
					setScrollTo('end')
				} else {
					setScrollTo('undefined')
				}
			}
		})
	})

	const loadOlderMessages = (scrollToBeginning = true) => {
		if (scrollToBeginning) {
			setScrollTo('beginning')
		}
		channel
			.getMessages(10, messages.lastIndex && messages.lastIndex - 1)
			.then(messages => {
				updateMessages(prevMessages => ({
					...prevMessages,
					messages: [
						...messages.items.map(toMessage),
						...prevMessages.messages,
					],
					lastIndex: messages.items[0].index,
				}))
			})
			.catch(err => {
				console.error(err)
			})
	}

	useEffect(() => {
		loadOlderMessages(false)
	}, [])

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
							<TextButton onClick={() => loadOlderMessages()}>
								Load older messages
							</TextButton>
							{messages.messages.map(m =>
								'status' in m ? (
									<StatusItem key={m.sid} status={m.status} />
								) : (
									<MessageItem
										key={m.sid}
										message={m.message}
										onRendered={() => {
											// Scroll to the last item in the list
											// if not at beginning
											if (scrollTo !== 'end') return
											if (scrollToTimeout) {
												clearTimeout(scrollToTimeout)
											}
											scrollToTimeout = setTimeout(() => {
												if (messageListRef.current) {
													messageListRef.current.scrollTop =
														messageListRef.current.scrollHeight
												}
											}, 250)
										}}
									/>
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
