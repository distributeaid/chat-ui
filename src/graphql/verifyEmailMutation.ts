import gql from 'graphql-tag'

export const verifyEmailMutation = gql`
	mutation verifyEmail($email: String!, $code: String!) {
		verifyEmail(email: $email, code: $code)
	}
`

export type VerifyEmailMutationResult = {
	verifyEmail: boolean
}

export type VerifyEmailMutationVariables = {
	email: string
	code: string
}
