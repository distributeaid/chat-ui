import * as React from 'react'
import styled from 'styled-components'

const Header = styled.div`
	background-color: #fa0000;
	color: #ffffff;
	font-weight: 300;
	font-family: 'Inter', sans-serif;
	width: 100%;
	padding: 0.5rem 0.5rem 0.5rem 1rem;
`

export const Error = ({ type, message }: { type: string; message: string }) => (
	<Header>
		<strong>{type}:</strong>
		{message}
	</Header>
)
