import * as React from 'react'
import { useState, useEffect } from 'react'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Loading } from '../components/Loading'
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
	const [channelConnection, setChannelConnection] = useState<{
		channel: Channel
		identity: string
	}>()

	useEffect(() => {
		connectToChannel({
			apollo,
			context,
			deviceId,
			token,
		})
			.then(maybeConnection => {
				if (isLeft(maybeConnection)) {
					setError(maybeConnection.left)
				} else {
					setChannelConnection({
						identity,
						channel: maybeConnection.right.channel,
					})
				}
			})
			.catch(error => {
				setError({
					type: 'InternalError',
					message: error.message,
				})
			})
	}, [deviceId, apollo])

	return (
		<ChatWidget>
			{channelConnection && (
				<ChannelView
					key={channelConnection.channel.sid}
					channel={channelConnection.channel}
					identity={channelConnection.identity}
					apollo={apollo}
					token={token}
					onSwitchChannel={channel => {
						// FIXME: Implement
						console.log(`Switching channel ...`, channel)
					}}
				/>
			)}
			{!error && !channelConnection && <Loading />}
			{error && <Error type={error.type} message={error.message} />}
		</ChatWidget>
	)
}
