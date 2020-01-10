import * as React from 'react'
import styled from 'styled-components'

const Header = styled.div`
	background-color: #fa0000;
	color: #ffffff;
	font-weight: 300;
	font-family: 'Inter', sans-serif;
	width: 100%;
`

const Text = styled.p`
	margin: 0;
	padding: 0.5rem 0.5rem 0.5rem 1rem;
`

export const Error = ({ type, message }: { type: string; message: string }) => (
	<Header>
		<Text>
			<strong>{type}:</strong> {message}
		</Text>
	</Header>
)
