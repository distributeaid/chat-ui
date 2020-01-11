import gql from 'graphql-tag'

export const verifyTokenQuery = gql`
	query verifyToken($token: ID!) {
		verifyToken(token: $token) {
			identity
			contexts
		}
	}
`

export type VerifyTokenQueryResult = {
	verifyToken: {
		identity: string
		contexts: string[]
	}
}

export type VerifyTokenVariables = {
	token: string
}
