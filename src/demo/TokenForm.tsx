import * as React from 'react'

const parseToken = (token: string) => {
	try {
		const [header, payload] = token.split('.')
		return {
			header: JSON.parse(atob(header)),
			payload: JSON.parse(atob(payload)),
		}
	} catch (err) {
		console.error(err)
		return {
			header: {},
			payload: {},
		}
	}
}

const Token = ({ header, payload }: { header: object; payload: object }) => (
	<>
		<pre>{JSON.stringify(header, null, 2)}</pre>
		<pre>{JSON.stringify(payload, null, 2)}</pre>
	</>
)

export const TokenForm = ({
	onToken,
}: {
	onToken: (token: string) => void
}) => {
	const [token, updateToken] = React.useState(
		window.localStorage.getItem('token') || '',
	)
	const [hasChat, setHasChat] = React.useState(false)
	const memoToken = (token: string) => {
		window.localStorage.setItem('token', token)
		updateToken(token)
	}

	React.useEffect(() => {
		if (token && !hasChat) {
			setHasChat(true)
			onToken(token)
		}
	})

	return (
		<form onSubmit={e => e.preventDefault()}>
			<fieldset>
				<legend>Token</legend>
				<textarea
					style={{ width: '100%' }}
					placeholder={'Paste your token here'}
					value={token}
					onChange={({ target: { value } }) => memoToken(value)}
				></textarea>
				{token.length > 0 && <Token {...parseToken(token)} />}
			</fieldset>
		</form>
	)
}
