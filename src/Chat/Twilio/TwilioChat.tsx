import * as React from 'react'
import { useState, useEffect } from 'react'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Error } from '../components/Error'
import { ChannelView } from './ChannelView'
import { Channel } from 'twilio-chat/lib/channel'
import { Client } from 'twilio-chat'
import { ChatWidget } from '../components/ChatWidget'
import { DevNotice, DevNoticeToggle } from '../components/Notice'
import { connectToChannel, ErrorInfo } from './api'
import { isLeft } from 'fp-ts/lib/Either'
import { retry } from './retry'

export const TwilioChat = ({
	context,
	apollo,
	deviceId,
	token,
}: {
	context: string
	deviceId: string
	apollo: ApolloClient<NormalizedCacheObject>
	token: string
}) => {
	const identity = JSON.parse(atob(token.split('.')[1])).sub
	const [error, setError] = useState<ErrorInfo>()
	const [selectedChannel, setSelectedChannel] = useState<string>(context)
	const [channelConnection, setConnectedChannel] = useState<
		{ channel: Channel; client: Client; token: string } | undefined
	>()
	const [joinedChannels, setJoinedChannels] = useState<string[]>([
		...new Set(['general', context]),
	])
	const [devNoteClosed, setDevNoteClosed] = useState<boolean>(
		window.localStorage.getItem('dachat:devnote:closed') === '1',
	)

	const connect = async (context: string) => {
		setSelectedChannel(context)
		setConnectedChannel(undefined)
		setJoinedChannels([...new Set([...joinedChannels, context])])
		return retry(3, (numTry) =>
			console.debug(`Retry ${numTry} to connect to channel ${context}...`),
		)(async () =>
			connectToChannel({
				apollo,
				context,
				deviceId,
				token,
			}),
		).then((maybeConnection) => {
			if (isLeft(maybeConnection)) {
				console.error({
					connectError: maybeConnection,
				})
				setError(maybeConnection.left)
			} else {
				setConnectedChannel(maybeConnection.right)
			}
		})
	}

	useEffect(() => {
		connect(context).catch((error) => {
			setError({
				type: 'InternalError',
				message: error.message,
			})
		})
	}, [])

	return (
		<ChatWidget>
			{!devNoteClosed && (
				<DevNotice
					onClosed={() => {
						window.localStorage.setItem('dachat:devnote:closed', '1')
						setDevNoteClosed(true)
					}}
				/>
			)}
			<ChannelView
				key={selectedChannel}
				channelConnection={channelConnection}
				selectedChannel={selectedChannel}
				identity={identity}
				apollo={apollo}
				token={token}
				joinedChannels={joinedChannels}
				onSwitchChannel={(channel) => {
					console.log(`Switching channel ...`, channel)
					connect(channel).catch((error) => {
						setError({
							type: 'InternalError',
							message: error.message,
						})
					})
				}}
				onChangeNick={(nick) => {
					console.log(`Changing nick ...`, nick)
					if (channelConnection) {
						channelConnection.client.user
							.updateFriendlyName(nick)
							.then(() => {
								console.log(`Updated nick to ${nick}.`)
							})
							.catch((error) => {
								setError({
									type: 'InternalError',
									message: error.message,
								})
							})
					}
				}}
				onCloseChannel={(channel) => {
					setJoinedChannels(joinedChannels.filter((c) => c !== channel))
				}}
				headerExtras={
					<>
						<DevNoticeToggle
							style={{ opacity: devNoteClosed ? 1 : 0.5 }}
							onClick={(e) => {
								e.stopPropagation()
								setDevNoteClosed((closed) => {
									window.localStorage.setItem(
										'dachat:devnote:closed',
										closed ? '0' : '1',
									)
									return !closed
								})
							}}
						/>
					</>
				}
			/>
			{error && <Error type={error.type} message={error.message} />}
		</ChatWidget>
	)
}
