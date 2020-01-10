import * as React from 'react'
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
	createChatTokenMutation,
	ChatTokenMutationResult,
	ChatTokenVariables,
	ChatToken,
} from '../graphql/createChatTokenMutation'
import { Loading } from './Loading'
import { Error } from './Error'
import { Chat } from './Chat'
import * as Twilio from 'twilio-chat'

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
	const [chatToken, setChatToken] = useState<ChatToken>()
	const [error, setError] = useState<{ type: string; message: string }>()

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
				setChatToken({
					identity,
					jwt,
				})
				return Twilio.Client.create(jwt)
			})
			.then(client => {
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
					.then(res => {
						const logEvent = (name: string) => (...args: any) =>
							console.log(name, ...args)
						res.on('messageAdded', logEvent('messageAdded')) // When another member sends a message to the channel you are connected to.
						res.on('typingStarted', logEvent('typingStarted')) // When another member is typing a message on the channel that you are connected to.
						res.on('typingEnded', logEvent('typingEnded')) // When another member stops typing a message on the channel that you are connected to.
						res.on('memberJoined', logEvent('memberJoined')) // When another member joins the channel that you are connected to.
						res.on('memberLeft', logEvent('memberLeft')) // When another member leaves the channel that you are connected to.
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
			{chatToken && <Chat context={context} />}
			{!chatToken && <Loading />}
			{error && <Error type={error.type} message={error.message} />}
		</ChatWidget>
	)
}
