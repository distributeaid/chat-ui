import gql from 'graphql-tag'

export const updateNickMutation = gql`
	mutation updateNick($nick: String!, $token: ID!) {
		updateNick(nick: $nick, token: $token)
	}
`

export type UpdateNickMutationResult = {
	updateNick: {
		identity: string
		contexts: string[]
	}
}

export type UpdateNickVariables = {
	token: string
	nick: string
}
