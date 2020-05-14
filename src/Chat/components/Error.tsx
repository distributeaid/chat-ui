import * as React from 'react'
import styled from 'styled-components'
import { ErrorInfo } from '../Twilio/api'
import { useState } from 'react'
import { UIButton } from './ChannelView'

import CloseIcon from 'feather-icons/dist/icons/x-square.svg'

const Header = styled.div`
	background-color: #fa0000;
	color: #ffffff;
	font-weight: 300;
	width: 100%;
	button {
		position: relative;
		opacity: 0.75;
		float: right;
		margin-top: -0.25rem;
	}
`

const Text = styled.div`
	margin: 0;
	padding: 0.5rem 0.25rem 0.5rem 0.5rem;
`

export const Error = ({ type, message }: ErrorInfo) => {
	const [visible, setVisible] = useState(true)
	if (!visible) return null
	else
		return (
			<Header>
				<Text>
					<UIButton
						type="button"
						onClick={() => {
							setVisible(false)
						}}
					>
						<CloseIcon />
					</UIButton>
					<strong>{type}:</strong> {message}
					<br />
					<small>
						UI version: <code>{GLOBAL_VERSION}</code>
					</small>
				</Text>
			</Header>
		)
}
