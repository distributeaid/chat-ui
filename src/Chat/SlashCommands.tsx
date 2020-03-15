import * as React from 'react'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { Message } from 'twilio-chat/lib/message'
import { Status } from './components/StatusItem'
import { v4 } from 'uuid'
import * as TE from 'fp-ts/lib/TaskEither'
import { verifyToken } from './Twilio/api'
import { pipe } from 'fp-ts/lib/pipeable'

export enum SlashCommand {
	HELP = 'help',
	ME = 'me',
	JOIN = 'join',
	NICK = 'nick',
}

type UpdateMessages = React.Dispatch<
	React.SetStateAction<{
		messages: (
			| {
					message: Message
			  }
			| {
					status: Status
			  }
		)[]
		lastIndex?: number | undefined
	}>
>

const logError = (err: Error) => {
	console.error(err)
}

export const SlashCommandHandler = ({
	apollo,
	updateMessages,
	token,
	onSwitchChannel,
	onChangeNick,
}: {
	apollo: ApolloClient<NormalizedCacheObject>
	updateMessages: UpdateMessages
	onSwitchChannel: (channel: string) => void
	onChangeNick: (nick: string) => void
	token: string
}) => (cmd: SlashCommand, arg?: string) => {
	const showMessage = (message: string | React.ReactNode) =>
		updateMessages(prevMessages => ({
			...prevMessages,
			messages: [
				...prevMessages.messages,
				{
					sid: v4(),
					status: {
						message,
						timestamp: new Date(),
					},
				},
			],
		}))

	switch (cmd) {
		case SlashCommand.HELP:
			showMessage(
				<p>
					/me: show information about you
					<br />
					/join <code>&lt;channel&gt;</code>: join another channel
					<br />
					/nick <code>&lt;nickname&gt;</code>: set your nickname
				</p>,
			)
			break
		case SlashCommand.JOIN:
			console.log(token)
			if (!arg || !arg.length) {
				showMessage(
					<p>
						You must provide a channel name, e.g.:{' '}
						<code>/join some-channel</code>!
					</p>,
				)
				return
			}
			showMessage(
				<p>
					Joining <code>{arg}</code>...
				</p>,
			)
			pipe(
				verifyToken({ apollo, token }),
				TE.map(({ contexts }) => {
					if (!contexts.includes(arg)) {
						showMessage(
							<p>
								You are not allowed to join the channel <code>{arg}</code>.
								<br />
								These are the cannels join can join: {contexts.join(', ')}
							</p>,
						)
						return
					}
					onSwitchChannel(arg)
				}),
				TE.mapLeft(err => {
					showMessage(`Failed to verify token: ${err.message}`)
				}),
			)().catch(logError)
			break
		case SlashCommand.NICK:
			onChangeNick(arg as string)
			break
		case SlashCommand.ME:
			pipe(
				verifyToken({ apollo, token }),
				TE.map(({ identity, contexts }) => {
					showMessage(
						`Hey ${identity}, you are allowed to access these channels: ${contexts.join(
							',',
						)}.`,
					)
				}),
				TE.mapLeft(err => {
					showMessage(`Failed to verify token: ${err.message}`)
				}),
			)().catch(logError)
	}
}
