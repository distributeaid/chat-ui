import * as React from 'react'
import { useState, useEffect, useLayoutEffect } from 'react'
import {
	MessageItem,
	Message as MessageItemMessage,
} from '../components/MessageItem'
import { StatusItem, Status } from '../components/StatusItem'
import { Channel } from 'twilio-chat/lib/channel'
import { Message } from 'twilio-chat/lib/message'
import { Member } from 'twilio-chat/lib/member'
import { v4 } from 'uuid'
import { SlashCommandHandler, SlashCommand } from '../SlashCommands'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
	Header,
	Title,
	Footer,
	MinimizeButton,
	MessageListContainer,
	MessageList,
	TextButton,
	MessageInput,
	SendButton,
} from '../components/ChannelView'

export const ChannelView = ({
	channel,
	identity,
	apollo,
	token,
}: {
	channel: Channel
	identity: string
	apollo: ApolloClient<NormalizedCacheObject>
	token: string
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
	}>({
		messages: [
			{
				sid: v4(),
				status: {
					message: `Hint: type /help to list available commands.`,
					timestamp: new Date(),
				},
			},
		],
	})

	const onSlashCommand = SlashCommandHandler({ apollo, updateMessages, token })
	const sendMessage = () => {
		switch (message) {
			case '/me':
				onSlashCommand(SlashCommand.ME)
				break
			case '/help':
				onSlashCommand(SlashCommand.HELP)
				break
			default:
				channel.sendMessage(message).catch(err => {
					console.error(err)
					setMessage(message)
				})
		}
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
