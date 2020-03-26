import * as React from 'react'
import { useState, useEffect } from 'react'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Error } from '../components/Error'
import { ChannelView } from './ChannelView'
import { Channel } from 'twilio-chat/lib/channel'
import { Client } from 'twilio-chat'
import { ChatWidget } from '../components/ChatWidget'
import { Notice } from '../components/Notice'
import { connectToChannel, ErrorInfo } from './api'
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
	const [error, setError] = useState<ErrorInfo>()
	const [selectedChannel, setSelectedChannel] = useState<string>(context)
	const [channelConnection, setConnectedChannel] = useState<
		{ channel: Channel; client: Client; token: string } | undefined
	>()
	const [joinedChannels, setJoinedChannels] = useState<string[]>([
		...new Set(['general', context]),
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
			<Notice>
				<strong>Preview!</strong> This is a development preview of the chat.
				Please report all issues in the{' '}
				<a
					href={'https://distribute-aid.slack.com/archives/C010UBFU0P9'}
					target={'_blank'}
					rel={'noopener noreferrer'}
				>
					<code>#dev-chat</code>
				</a>{' '}
				channel in our{' '}
				<a
					href={'https://distribute-aid.slack.com/'}
					target={'_blank'}
					rel={'noopener noreferrer'}
				>
					Slack
				</a>
				.
			</Notice>
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
				onChangeNick={nick => {
					console.log(`Changing nick ...`, nick)
					if (channelConnection) {
						channelConnection.client.user
							.updateFriendlyName(nick)
							.then(() => {
								console.log(`Updated nick to ${nick}.`)
							})
							.catch(error => {
								setError({
									type: 'InternalError',
									message: error.message,
								})
							})
					}
				}}
				onCloseChannel={channel => {
					setJoinedChannels(joinedChannels.filter(c => c !== channel))
				}}
			/>
			{error && <Error type={error.type} message={error.message} />}
		</ChatWidget>
	)
}
