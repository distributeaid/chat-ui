import * as React from 'react'
import styled from 'styled-components'
import { ErrorInfo } from '../Twilio/api'

const Header = styled.div`
	background-color: #fa0000;
	color: #ffffff;
	font-weight: 300;
	width: 100%;
`

const Text = styled.p`
	margin: 0;
	padding: 0.5rem 0.5rem 0.5rem 1rem;
`

export const Error = ({ type, message }: ErrorInfo) => (
	<Header>
		<Text>
			<strong>{type}:</strong> {message}
		</Text>
	</Header>
)
