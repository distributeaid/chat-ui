import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
	createChatTokenMutation,
	ChatTokenMutationResult,
	ChatTokenVariables,
} from '../../graphql/createChatTokenMutation'
import * as Twilio from 'twilio-chat'
import { Channel } from 'twilio-chat/lib/channel'
import { Either } from 'fp-ts/lib/Either'
import { tryCatch, chain } from 'fp-ts/lib/TaskEither'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'
import { Option, fromNullable } from 'fp-ts/lib/Option'
import { Paginator } from 'twilio-chat/lib/interfaces/paginator'
import { getOrElse } from '../../fp-ts.util'

type ErrorInfo = {
	type: string
	message: string
}

const createChatToken = ({
	apollo,
	deviceId,
	token,
}: {
	deviceId: string
	token: string
	apollo: ApolloClient<NormalizedCacheObject>
}) =>
	tryCatch<ErrorInfo, string>(
		async () =>
			apollo
				.mutate<ChatTokenMutationResult, ChatTokenVariables>({
					mutation: createChatTokenMutation,
					variables: { deviceId, token },
				})
				.then(({ data }) => {
					if (!data) {
						throw new Error(
							'Creating chat token failed! (No response returned.)',
						)
					}
					return data.createChatToken
				}),
		reason => ({
			type: 'IntegrationError',
			message: `Creating chat token failed: ${(reason as Error).message}`,
		}),
	)

const createClient = (chatToken: string) =>
	tryCatch<ErrorInfo, Twilio.Client>(
		async () => Twilio.Client.create(chatToken),
		reason => ({
			type: 'IntegrationError',
			message: `Creating chat client failed: ${(reason as Error).message}`,
		}),
	)

const fetchSubscribedChannels = (client: Twilio.Client) =>
	tryCatch<ErrorInfo, Paginator<Channel>>(
		async () => client.getSubscribedChannels(),
		reason => ({
			type: 'IntegrationError',
			message: `Failed to fetch subscribed channels: ${
				(reason as Error).message
			}`,
		}),
	)

const joinChannel = ({
	client,
	channel,
}: {
	client: Twilio.Client
	channel: string
}) => () =>
	tryCatch<ErrorInfo, Channel>(
		async () =>
			client.getChannelByUniqueName(channel).then(async c => c.join()),
		reason => ({
			type: 'IntegrationError',
			message: `Failed to join channel "${channel}": ${
				(reason as Error).message
			}`,
		}),
	)

const maybeAlreadyJoinedChannel = (context: string) => (
	channels: Paginator<Channel>,
): Option<Channel> =>
	fromNullable(channels.items.find(({ uniqueName }) => uniqueName === context))

export const connectToChannel = async ({
	apollo,
	context,
	deviceId,
	token,
}: {
	context: string
	deviceId: string
	token: string
	apollo: ApolloClient<NormalizedCacheObject>
}): Promise<Either<ErrorInfo, Channel>> =>
	pipe(
		TE.right({ apollo, deviceId, token }),
		chain(createChatToken),
		chain(createClient),
		chain(client =>
			pipe(
				fetchSubscribedChannels(client),
				TE.map(maybeAlreadyJoinedChannel(context)),
				getOrElse(joinChannel({ client, channel: context })),
			),
		),
	)()
