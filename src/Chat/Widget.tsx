import * as React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
	createChatTokenMutation,
	ChatTokenMutationResult,
	ChatTokenVariables,
} from '../graphql/createChatTokenMutation'
import { Loading } from './Loading'
import { Error } from './Error'
import { Chat } from './Chat'
import * as Twilio from 'twilio-chat'
import { Channel } from 'twilio-chat/lib/channel'

const ChatWidget = styled.div`
	@import url('https://rsms.me/inter/inter.css');
	position: absolute;
	z-index: 9999;
	right: 1rem;
	bottom: 1rem;
	font-family: 'Inter', sans-serif;
	max-width: 350px;
`

export const Widget = ({
	context,
	apollo,
	deviceId,
}: {
	context: string
	deviceId: string
	apollo: ApolloClient<NormalizedCacheObject>
}) => {
	const [error, setError] = useState<{ type: string; message: string }>()
	const [channelConnection, setChannelConnection] = useState<{
		channel: Channel
		identity: string
	}>()

	useEffect(() => {
		apollo
			.mutate<ChatTokenMutationResult, ChatTokenVariables>({
				mutation: createChatTokenMutation,
				variables: { deviceId },
			})
			.then(({ data }) => {
				if (!data) {
					setError({
						type: 'ApplicationError',
						message: 'Creating chat token failed! (No response returned.)',
					})
					return
				}
				const {
					createChatToken: { identity, jwt },
				} = data
				console.log('DAChat:identity', identity)
				console.log('DAChat:jwt', jwt)
				return Twilio.Client.create(jwt).then(client => {
					if (!client) {
						setError({
							type: 'IntegrationError',
							message: 'Creating chat client failed!',
						})
						return
					}
					return client
						.getChannelByUniqueName(context)
						.then(async channel => {
							console.log(channel)
							return channel.join()
						})
						.then(async channel => {
							setChannelConnection({
								channel,
								identity,
							})
						})
				})
			})
			.catch(err => {
				setError({
					type: err.name,
					message: err.message,
				})
			})
	}, [deviceId, apollo])

	return (
		<ChatWidget>
			{channelConnection && (
				<Chat
					channel={channelConnection.channel}
					identity={channelConnection.identity}
				/>
			)}
			{!error && !channelConnection && <Loading />}
			{error && <Error type={error.type} message={error.message} />}
		</ChatWidget>
	)
}
