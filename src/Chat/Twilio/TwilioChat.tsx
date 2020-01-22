import * as React from 'react'
import { useState, useEffect } from 'react'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Error } from '../components/Error'
import { ChannelView } from './ChannelView'
import { Channel } from 'twilio-chat/lib/channel'
import { ChatWidget } from '../components/ChatWidget'
import { connectToChannel } from './api'
import { isLeft } from 'fp-ts/lib/Either'

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
	const [error, setError] = useState<{ type: string; message: string }>()
	const [selectedChannel, setSelectedChannel] = useState<string>(context)
	const [channelConnection, setConnectedChannel] = useState<
		Channel | undefined
	>()
	const [joinedChannels, setJoinedChannels] = useState<string[]>([
		...new Set(['general', 'random', context]),
	])

	const connect = async (context: string) => {
		setSelectedChannel(context)
		setConnectedChannel(undefined)
		setJoinedChannels([...new Set([...joinedChannels, context])])
		return connectToChannel({
			apollo,
			context,
			deviceId,
			token,
		}).then(maybeConnection => {
			if (isLeft(maybeConnection)) {
				setError(maybeConnection.left)
			} else {
				setConnectedChannel(maybeConnection.right)
			}
		})
	}

	useEffect(() => {
		connect(context).catch(error => {
			setError({
				type: 'InternalError',
				message: error.message,
			})
		})
	}, [])

	return (
		<ChatWidget>
			<ChannelView
				key={selectedChannel}
				channelConnection={channelConnection}
				selectedChannel={selectedChannel}
				identity={identity}
				apollo={apollo}
				token={token}
				joinedChannels={joinedChannels}
				onSwitchChannel={channel => {
					console.log(`Switching channel ...`, channel)
					connect(channel).catch(error => {
						setError({
							type: 'InternalError',
							message: error.message,
						})
					})
				}}
				onCloseChannel={channel => {
					setJoinedChannels(joinedChannels.filter(c => c !== channel))
				}}
			/>
			{error && <Error type={error.type} message={error.message} />}
		</ChatWidget>
	)
}