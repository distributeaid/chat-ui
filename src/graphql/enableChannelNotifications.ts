import gql from 'graphql-tag'

export const enableChannelNotificationsMutation = gql`
	mutation enableChannelNotifications(
		$channel: ID!
		$email: String!
		$token: ID!
	) {
		enableChannelNotifications(
			channel: $channel
			email: $email
			token: $token
		) {
			emailVerified
		}
	}
`

export type EnableChannelNotificationsMutationResult = {
	enableChannelNotifications: {
		emailVerified: boolean
	}
}

export type EnableChannelNotificationsMutationVariables = {
	channel: string
	email: string
	token: string
}
