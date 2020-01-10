import gql from 'graphql-tag'

export const createChatTokenMutation = gql`
	mutation createChatToken($deviceId: ID!) {
		createChatToken(deviceId: $deviceId) {
			identity
			jwt
		}
	}
`

export type ChatToken = {
	identity: string
	jwt: string
}

export type ChatTokenMutationResult = {
	createChatToken: ChatToken
}

export type ChatTokenVariables = {
	deviceId: string
}
