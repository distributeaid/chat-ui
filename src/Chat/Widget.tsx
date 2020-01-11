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
import { log } from '../log'

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
		apollo
			.mutate<ChatTokenMutationResult, ChatTokenVariables>({
				mutation: createChatTokenMutation,
				variables: { deviceId, token },
			})
			.then(({ data }) => {
				if (!data) {
					setError({
						type: 'ApplicationError',
						message: 'Creating chat token failed! (No response returned.)',
					})
					return
				}
				const { createChatToken: chatToken } = data
				log({ chatToken })
				return Twilio.Client.create(chatToken).then(client => {
					if (!client) {
						setError({
							type: 'IntegrationError',
							message: 'Creating chat client failed!',
						})
						return
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
						.then(channel => {
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
					apollo={apollo}
					token={token}
				/>
			)}
			{!error && !channelConnection && <Loading />}
			{error && <Error type={error.type} message={error.message} />}
		</ChatWidget>
	)
}
