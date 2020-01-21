import * as React from 'react'
import { useState, useEffect, useLayoutEffect } from 'react'
import {
	MessageItem,
	Message as MessageItemMessage,
	stringToColor,
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
	OtherChannelHeader,
} from '../components/ChannelView'

export const ChannelView = ({
	channelConnection,
	identity,
	apollo,
	token,
	onSwitchChannel,
	joinedChannels,
	selectedChannel,
	onCloseChannel,
}: {
	channelConnection?: Channel
	identity: string
	apollo: ApolloClient<NormalizedCacheObject>
	token: string
	selectedChannel: string
	joinedChannels: string[]
	onSwitchChannel: (channel: string) => void
	onCloseChannel: (channel: string) => void
}) => {
	const storageKey = `DAChat:minimized`
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

	const onSlashCommand = SlashCommandHandler({
		apollo,
		updateMessages,
		token,
		onSwitchChannel,
	})
	const sendMessage = (channelConnection: Channel) => {
		const [cmd, ...arg] = message.split(' ')
		switch (cmd) {
			case '/me':
				onSlashCommand(SlashCommand.ME)
				break
			case '/help':
				onSlashCommand(SlashCommand.HELP)
				break
			case '/join':
				onSlashCommand(SlashCommand.JOIN, arg[0])
				break
			default:
				if (message.startsWith('/')) {
					onSlashCommand(SlashCommand.HELP)
				} else {
					channelConnection.sendMessage(message).catch(err => {
						console.error(err)
						setMessage(message)
					})
				}
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
		if (channelConnection) {
			channelConnection.on('messageAdded', newMessageHandler)
			channelConnection.on('memberJoined', memberJoinedHandler)
			channelConnection.on('memberLeft', memberLeftHandler)
			return () => {
				channelConnection.removeListener('messageAdded', newMessageHandler)
				channelConnection.removeListener('memberJoined', memberJoinedHandler)
				channelConnection.removeListener('memberLeft', memberLeftHandler)
			}
		}
	}, [channelConnection])

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

	const loadOlderMessages = (channel: Channel, scrollToBeginning = true) => {
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
					lastIndex: messages.items[0]?.index ?? undefined,
				}))
			})
			.catch(err => {
				console.error(err)
			})
	}

	useEffect(() => {
		if (channelConnection) {
			loadOlderMessages(channelConnection, false)
		}
	}, [channelConnection])

	return (
		<>
			{joinedChannels
				.filter(c => c !== selectedChannel)
				.map(otherChannel => (
					<OtherChannelHeader
						key={otherChannel}
						onClick={() => {
							onSwitchChannel(otherChannel)
							memoMinimized(false)
						}}
						style={stringToColor(otherChannel)}
					>
						<Title>#{otherChannel}</Title>
						<MinimizeButton
							onClick={e => {
								e.stopPropagation()
								onCloseChannel(otherChannel)
							}}
						>
							X
						</MinimizeButton>
					</OtherChannelHeader>
				))}
			<Header
				style={stringToColor(selectedChannel)}
				onClick={() => memoMinimized(!isMinimized)}
			>
				<Title>
					Chat: <strong>#{selectedChannel}</strong>
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
							{channelConnection && (
								<TextButton
									onClick={() => loadOlderMessages(channelConnection)}
								>
									Load older messages
								</TextButton>
							)}
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
							disabled={!channelConnection}
							onKeyUp={({ keyCode }) => {
								if (keyCode === 13 && message.length > 0) {
									channelConnection && sendMessage(channelConnection)
								}
							}}
						/>
						<SendButton
							disabled={!channelConnection || !(message.length > 0)}
							onClick={() =>
								channelConnection && sendMessage(channelConnection)
							}
						>
							send
						</SendButton>
					</Footer>
				</>
			)}
		</>
	)
}
