import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
	createChatTokenMutation,
	ChatTokenMutationResult,
	ChatTokenVariables,
} from '../../graphql/createChatTokenMutation'
import * as Twilio from 'twilio-chat'
import { Channel } from 'twilio-chat/lib/channel'
import { log } from '../../log'
import { Either, left, right, isLeft } from 'fp-ts/lib/Either'
import { tryCatch } from 'fp-ts/lib/TaskEither'

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
}): Promise<Either<
	ErrorInfo,
	{
		channel: Channel
	}
>> => {
	const maybeToken = await createChatToken({ apollo, deviceId, token })()
	if (isLeft(maybeToken)) return maybeToken
	const chatToken = maybeToken.right
	log({ chatToken })

	const client = await Twilio.Client.create(chatToken)
	if (!client) {
		return left({
			type: 'IntegrationError',
			message: 'Creating chat client failed!',
		})
	}
	const channels = await client.getSubscribedChannels()

	let channel = channels.items.find(({ uniqueName }) => uniqueName === context)
	if (!channel) {
		channel = await client.getChannelByUniqueName(context)
		await channel.join()
	}
	return right({
		channel,
	})
}
