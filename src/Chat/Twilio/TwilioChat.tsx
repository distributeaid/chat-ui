import * as React from 'react'
import { useState, useEffect } from 'react'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
	createChatTokenMutation,
	ChatTokenMutationResult,
	ChatTokenVariables,
} from '../../graphql/createChatTokenMutation'
import { Loading } from '../components/Loading'
import { Error } from '../components/Error'
import { ChannelView } from './ChannelView'
import * as Twilio from 'twilio-chat'
import { Channel } from 'twilio-chat/lib/channel'
import { log } from '../../log'
import { ChatWidget } from '../components/ChatWidget'
import { Either, left, right } from 'fp-ts/lib/Either'
import { TaskEither } from 'fp-ts/lib/TaskEither'

type ErrorInfo = {
	type: string,
	message: string
}

const connectToChannel = ({
	apollo,
	context,
	deviceId,
	token
}: { context: string, deviceId: string, token: string, apollo: ApolloClient<NormalizedCacheObject> }): Promise<TaskEither<ErrorInfo, {
	channel: Channel
}>> => apollo
	.mutate<ChatTokenMutationResult, ChatTokenVariables>({
		mutation: createChatTokenMutation,
		variables: { deviceId, token },
	})
	.then(({ data }) => {
		if (!data) {
			return left({
				type: 'ApplicationError',
				message: 'Creating chat token failed! (No response returned.)',
			})
		}
		const { createChatToken: chatToken } = data
		log({ chatToken })
		return Twilio.Client
			.create(chatToken)
			.then(client => {
				if (!client) {
					return left({
						type: 'IntegrationError',
						message: 'Creating chat client failed!',
					})
				}
				return client
					.getSubscribedChannels()
					.then(channels =>
						channels.items.find(({ uniqueName }) => uniqueName === context),
					)
					.then(
						channel =>
							channel ||
							client
								.getChannelByUniqueName(context)
								.then(async channel => channel.join()),
					)
					.then(channel => right({
						channel,
					}))
			})
	})
	.catch(err => right({
		type: err.name,
		message: err.message,
	}))

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
