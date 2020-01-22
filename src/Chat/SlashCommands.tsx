import * as React from 'react'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Message as MessageItemMessage } from './components/MessageItem'
import { Status } from './components/StatusItem'
import { v4 } from 'uuid'
import {
	verifyTokenQuery,
	VerifyTokenQueryResult,
	VerifyTokenVariables,
} from '../graphql/verifyTokenQuery'

export enum SlashCommand {
	HELP = 'help',
	ME = 'me',
	JOIN = 'join',
}

type UpdateMessages = React.Dispatch<
	React.SetStateAction<{
		messages: (
			| {
					sid: string
					message: MessageItemMessage
			  }
			| {
					sid: string
					status: Status
			  }
		)[]
		lastIndex?: number | undefined
	}>
>

export const SlashCommandHandler = ({
	apollo,
	updateMessages,
	token,
	onSwitchChannel,
}: {
	apollo: ApolloClient<NormalizedCacheObject>
	updateMessages: UpdateMessages
	onSwitchChannel: (channel: string) => void
	token: string
}) => (cmd: SlashCommand, arg?: string) => {
	switch (cmd) {
		case SlashCommand.HELP:
			updateMessages(prevMessages => ({
				...prevMessages,
				messages: [
					...prevMessages.messages,
					{
						sid: v4(),
						status: {
							message: (
								<p>
									/me: show information about you
									<br />
									/join <code>&lt;channel&gt;</code>: join another channel
								</p>
							),
							timestamp: new Date(),
						},
					},
				],
			}))
			break
		case SlashCommand.JOIN:
			onSwitchChannel(arg as string)
			break
		case SlashCommand.ME:
			apollo
				.query<VerifyTokenQueryResult, VerifyTokenVariables>({
					query: verifyTokenQuery,
					variables: { token },
				})
				.then(({ data }) => {
					if (!data) {
						updateMessages(prevMessages => ({
							...prevMessages,
							messages: [
								...prevMessages.messages,
								{
									sid: v4(),
									status: {
										message: `Failed to verify token!`,
										timestamp: new Date(),
									},
								},
							],
						}))
					} else {
						const { identity, contexts } = data.verifyToken
						updateMessages(prevMessages => ({
							...prevMessages,
							messages: [
								...prevMessages.messages,
								{
									sid: v4(),
									status: {
										message: `Hey ${identity}, you are allowed to access these channels: ${contexts.join(
											',',
										)}.`,
										timestamp: new Date(),
									},
								},
							],
						}))
					}
				})
				.catch(err => {
					updateMessages(prevMessages => ({
						...prevMessages,
						messages: [
							...prevMessages.messages,
							{
								sid: v4(),
								status: {
									message: `Failed to verify token: ${err.message}`,
									timestamp: new Date(),
								},
							},
						],
					}))
				})
	}
}