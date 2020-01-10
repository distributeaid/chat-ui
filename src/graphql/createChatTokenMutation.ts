import gql from 'graphql-tag'

export const createChatTokenMutation = gql`
	mutation createChatToken($deviceId: ID!, $identity: ID!) {
		createChatToken(deviceId: $deviceId, identity: $identity) {
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
	identity: string
}
