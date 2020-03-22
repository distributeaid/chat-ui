import * as React from 'react'
import { useState, useEffect, useLayoutEffect } from 'react'
import { MessageItem, stringToColor } from '../components/MessageItem'
import { StatusItem, Status } from '../components/StatusItem'
import { Channel } from 'twilio-chat/lib/channel'
import { Client, User } from 'twilio-chat'
import { Message } from 'twilio-chat/lib/message'
import { Member } from 'twilio-chat/lib/member'
import { v4 } from 'uuid'
import { SlashCommandHandler, SlashCommand } from '../SlashCommands'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
	Header,
	Title,
	Footer,
	UIButton,
	MessageListContainer,
	MessageList,
	TextButton,
	MessageInput,
	SendButton,
	OtherChannelHeader,
	Controls,
} from '../components/ChannelView'
import { UserDescriptor } from 'twilio-chat/lib/userdescriptor'
import { SubscribeToChannel } from '../notifications/SubscribeToChannel'

import CloseIcon from 'feather-icons/dist/icons/x-square.svg'
import MinimizeIcon from 'feather-icons/dist/icons/minimize.svg'
import MaximizeIcon from 'feather-icons/dist/icons/maximize.svg'
import SendIcon from 'feather-icons/dist/icons/send.svg'
import AlertIcon from 'feather-icons/dist/icons/bell.svg'

type AuthorMap = { [key: string]: User }
type AuthorNicks = { [key: string]: string | undefined }

export const ChannelView = ({
	channelConnection,
	identity,
	apollo,
	token,
	onSwitchChannel,
	joinedChannels,
	selectedChannel,
	onCloseChannel,
	onChangeNick,
}: {
	channelConnection?: { channel: Channel; client: Client }
	identity: string
	apollo: ApolloClient<NormalizedCacheObject>
	token: string
	selectedChannel: string
	joinedChannels: string[]
	onSwitchChannel: (channel: string) => void
	onChangeNick: (nick: string) => void
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
		messages: ({ message: Message } | { status: Status })[]
		lastIndex?: number
	}>({
		messages: [
			{
				status: {
					message: `Hint: type /help to list available commands.`,
					timestamp: new Date(),
				},
			},
		],
	})

	const [authorSubscriptions, setAuthorSubscriptions] = useState<AuthorMap>({})
	const [authorNicks, setAuthorNicks] = useState<AuthorNicks>({})
	useEffect(() => {
		;() => {
			Object.values(authorSubscriptions).map(async author =>
				author.unsubscribe(),
			)
		}
	})

	const [notificationSettingsVisible, showNotificationSettings] = useState<
		boolean
	>(false)

	const onSlashCommand = SlashCommandHandler({
		apollo,
		updateMessages,
		token,
		onSwitchChannel,
		onChangeNick,
	})
	const sendMessage = (channelConnection: Channel) => {
		const [cmd, ...args] = message.split(' ')
		switch (cmd) {
			case '/me':
				onSlashCommand(SlashCommand.ME)
				break
			case '/help':
				onSlashCommand(SlashCommand.HELP)
				break
			case '/join':
				onSlashCommand(SlashCommand.JOIN, args[0])
				break
			case '/nick':
				setAuthorNicks(previous => ({
					...previous,
					[identity]: args.join(' '),
				}))
				onSlashCommand(SlashCommand.NICK, args.join(' '))
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

	const userChangedNickHandler = ({
		updateReasons,
		user,
	}: User.UpdatedEventArgs) => {
		if (updateReasons.includes('friendlyName')) {
			updateMessages(prevMessages => ({
				...prevMessages,
				messages: [
					...prevMessages.messages,
					{
						sid: v4(),
						status: {
							message: (
								<>
									User <em>{authorNicks[user.identity] || user.identity}</em>{' '}
									changed their name to <em>{user.friendlyName}</em>.
								</>
							),
							timestamp: new Date(),
						},
					},
				],
			}))
			setAuthorNicks(authorNicks => ({
				...authorNicks,
				[user.identity]: user.friendlyName,
			}))
		}
	}

	const newMessageHandler = (message: Message) => {
		updateMessages(prevMessages => ({
			...prevMessages,
			messages: [...prevMessages.messages, { message }],
			lastIndex: prevMessages.lastIndex
				? prevMessages.lastIndex
				: message.index,
		}))
		if (!authorNicks[message.author]) {
			channelConnection?.client
				.getUserDescriptor(message.author)
				.then(async d => {
					const user = await d.subscribe()
					user.on('updated', userChangedNickHandler)
					setAuthorNicks(previous => ({
						...previous,
						[message.author]: d.friendlyName,
					}))
					setAuthorSubscriptions(previous => ({
						...previous,
						[message.author]: user,
					}))
				})
				.catch(err => {
					console.error(err)
				})
		}
	}

	const messageRemovedHandler = (message: Message) => {
		updateMessages(prevMessages => ({
			...prevMessages,
			messages: prevMessages.messages.filter(
				m => 'status' in m || m.message.sid !== message.sid,
			),
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
			channelConnection.channel.on('messageAdded', newMessageHandler)
			channelConnection.channel.on('messageRemoved', messageRemovedHandler)
			channelConnection.channel.on('memberJoined', memberJoinedHandler)
			channelConnection.channel.on('memberLeft', memberLeftHandler)
			return () => {
				channelConnection.channel.removeListener(
					'messageAdded',
					newMessageHandler,
				)
				channelConnection.channel.removeListener(
					'messageRemoved',
					messageRemovedHandler,
				)
				channelConnection.channel.removeListener(
					'memberJoined',
					memberJoinedHandler,
				)
				channelConnection.channel.removeListener(
					'memberLeft',
					memberLeftHandler,
				)
			}
		}
		return () => {
			// pass
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

	const [initialLoad, setInitialLoad] = useState<boolean>(true)
	const loadOlderMessages = (channel: Channel, scrollToBeginning = true) => {
		if (scrollToBeginning) {
			setScrollTo('beginning')
		}
		channel
			.getMessages(10, messages.lastIndex && messages.lastIndex - 1)
			.then(async messages => {
				setInitialLoad(false)
				updateMessages(prevMessages => ({
					...prevMessages,
					messages: [
						...messages.items.map(message => ({ message })),
						...prevMessages.messages,
					],
					lastIndex: messages.items[0]?.index ?? undefined,
				}))
				return Promise.all(
					[...new Set(messages.items.map(message => message.author))]
						.filter(
							identity => !Object.keys(authorSubscriptions).includes(identity),
						)
						.map(async author =>
							channelConnection?.client.getUserDescriptor(author),
						),
				)
			})
			.then(async newAuthorDescriptors =>
				Promise.all(
					(newAuthorDescriptors.filter(
						f => f,
					) as UserDescriptor[]).map(async a => a.subscribe()),
				),
			)
			.then(async newAuthorSubscriptions => {
				const subs = newAuthorSubscriptions.reduce((authors, user) => {
					user.on('updated', userChangedNickHandler)
					return {
						...authors,
						[user.identity]: user,
					}
				}, {} as AuthorMap)
				setAuthorSubscriptions(subs)
				setAuthorNicks({
					...authorNicks,
					...Object.values(subs).reduce(
						(nicks, user) => ({ ...nicks, [user.identity]: user.friendlyName }),
						{},
					),
				})
			})
			.catch(err => {
				console.error(err)
				setInitialLoad(false)
			})
	}

	useEffect(() => {
		if (channelConnection) {
			loadOlderMessages(channelConnection.channel, false)
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
						<Controls>
							<UIButton
								title={'Close channel'}
								onClick={e => {
									e.stopPropagation()
									onCloseChannel(otherChannel)
								}}
							>
								<CloseIcon />
							</UIButton>
						</Controls>
					</OtherChannelHeader>
				))}
			<Header
				style={stringToColor(selectedChannel)}
				onClick={() => memoMinimized(!isMinimized)}
			>
				<Title>
					Chat: <strong>#{selectedChannel}</strong>
				</Title>
				<Controls>
					<UIButton
						title={'Enable offline notifications'}
						onClick={e => {
							e.stopPropagation()
							showNotificationSettings(visible => !visible)
						}}
					>
						<AlertIcon />
					</UIButton>
					{!isMinimized && (
						<UIButton
							title={'Minimize channel'}
							onClick={() => {
								memoMinimized(true)
							}}
						>
							<MinimizeIcon />
						</UIButton>
					)}
					{isMinimized && (
						<UIButton
							title={'Maximize channel'}
							onClick={() => {
								memoMinimized(false)
							}}
						>
							<MaximizeIcon />
						</UIButton>
					)}
					{joinedChannels.length > 1 && (
						<UIButton
							title={'Close channel'}
							onClick={e => {
								e.stopPropagation()
								onSwitchChannel(
									joinedChannels.find(c => c !== selectedChannel) as string,
								)
								onCloseChannel(selectedChannel)
							}}
						>
							<CloseIcon />
						</UIButton>
					)}
				</Controls>
			</Header>
			{channelConnection && notificationSettingsVisible && (
				<SubscribeToChannel
					channel={channelConnection.channel}
					apollo={apollo}
					token={token}
				/>
			)}
			{!isMinimized && (
				<>
					<MessageListContainer>
						<MessageList ref={messageListRef}>
							{channelConnection && (
								<TextButton
									onClick={() => loadOlderMessages(channelConnection.channel)}
								>
									Load older messages
								</TextButton>
							)}
							{initialLoad && (
								<StatusItem
									status={{
										message: 'Loading messages...',
										timestamp: new Date(),
									}}
								/>
							)}
							{messages.messages.map((m, i) =>
								'status' in m ? (
									<StatusItem key={i} status={m.status} />
								) : (
									<MessageItem
										key={m.message.sid}
										message={{
											timestamp: m.message.timestamp,
											from: m.message.author,
											message: m.message.body,
											fromUser: m.message.author === identity,
										}}
										nick={authorNicks[m.message.author]}
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
										onDelete={() => {
											if (confirm('Really delete this message?')) {
												console.log(`Deleting message ${m.message.sid}`)
												m.message
													.remove()
													.then(() => {
														console.log('Removed')
													})
													.catch(console.error)
											}
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
									channelConnection && sendMessage(channelConnection.channel)
								}
							}}
						/>
						<SendButton
							disabled={!channelConnection || !(message.length > 0)}
							onClick={() =>
								channelConnection && sendMessage(channelConnection.channel)
							}
						>
							<SendIcon />
						</SendButton>
					</Footer>
				</>
			)}
		</>
	)
}
