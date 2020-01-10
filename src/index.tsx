import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { v4 } from 'uuid'
import { Widget } from './Chat/Widget'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'

export const chat = ({ context }: { context: string }) => {
	const div = document.createElement('div')
	div.id = 'distribute-aid-chat'
	document.documentElement.appendChild(div)

	const httpLink = createHttpLink({
		uri: process.env.GRAPHQL_API_ENDPOINT,
		headers: {
			'x-api-key': process.env.GRAPHQL_API_KEY,
		},
	})

	const client = new ApolloClient({
		link: httpLink,
		cache: new InMemoryCache(),
	})

	const deviceId = v4()

	console.log('DAChat', {
		endpoint: process.env.GRAPHQL_API_ENDPOINT,
		apiKey: process.env.GRAPHQL_API_KEY,
		deviceId,
	})

	ReactDOM.render(
		<Widget context={context} apollo={client} deviceId={deviceId} />,
		div,
	)
}
;(window as any).DAChat = chat
