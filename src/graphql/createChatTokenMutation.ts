import gql from 'graphql-tag'

export const createChatTokenMutation = gql`
	mutation createChatToken($deviceId: ID!, $token: ID!) {
		createChatToken(deviceId: $deviceId, token: $token)
	}
`

export type ChatTokenMutationResult = {
	createChatToken: string
}

export type ChatTokenVariables = {
	deviceId: string
	token: string
}
