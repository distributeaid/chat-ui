import * as React from 'react'
import styled from 'styled-components'

const Header = styled.div`
	background-color: #3543ec;
	color: #ffffff;
	font-weight: 300;
	font-family: 'Inter', sans-serif;
	width: 100%;
`
const Text = styled.p`
	margin: 0;
	padding: 0.5rem 0.5rem 0.5rem 1rem;
`

export const Loading = () => (
	<Header>
		<Text>Loading ...</Text>
	</Header>
)
