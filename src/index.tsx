import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { v4 } from 'uuid'
import { Widget } from './Chat/Widget'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { log } from './log'

export const chat = ({
	context,
	apiEndpoint,
	apiKey,
	token,
}: {
	context: string
	apiEndpoint: string
	apiKey: string
	token: string
}) => {
	const div = document.createElement('div')
	div.id = 'distribute-aid-chat'
	document.documentElement.appendChild(div)

	const httpLink = createHttpLink({
		uri: apiEndpoint,
		headers: {
			'x-api-key': apiKey,
		},
	})

	const client = new ApolloClient({
		link: httpLink,
		cache: new InMemoryCache(),
	})

	const deviceId = v4()

	log({ apiEndpoint, apiKey, deviceId, token })

	ReactDOM.render(
		<Widget
			context={context}
			apollo={client}
			deviceId={deviceId}
			token={token}
		/>,
		div,
	)
}
;(window as any).DAChat = chat
