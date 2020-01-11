import * as React from 'react'
import styled from 'styled-components'

const StatusView = styled.div`
	margin: 1rem;
	opacity: 0.8;
`

const Text = styled.div`
	font-size: 80%;
	font-style: italic;
`

export type Status = {
	message: string
	timestamp: Date
}

export const StatusItem = ({ status: { message } }: { status: Status }) => {
	return (
		<StatusView>
			<Text>{message}</Text>
		</StatusView>
	)
}
