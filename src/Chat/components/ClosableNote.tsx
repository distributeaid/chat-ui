import * as React from 'react'
import styled from 'styled-components'
import { UIButton } from './ChannelView'

import CloseIcon from 'feather-icons/dist/icons/x-square.svg'

const Notice = styled.div`
	background-color: #ffec8e;
	padding: 0.5rem;
	color: #000000cc;
	position: relative;
	padding-right: 30px;
	button {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		opacity: 0.75;
	}
`

const Error = styled(Notice)`
	background-color: #fa0000;
	color: #ffffff;
`

const Footer = ({
	onClosed,
}: React.PropsWithChildren<{ onClosed: () => void }>) => (
	<>
		<br />
		<small>
			Version: <code>{GLOBAL_VERSION}</code>
		</small>
		<UIButton
			type="button"
			onClick={() => {
				onClosed()
			}}
		>
			<CloseIcon />
		</UIButton>
	</>
)

export const ClosableNote = ({
	onClosed,
	children,
}: React.PropsWithChildren<{ onClosed: () => void }>) => (
	<Notice>
		{children}
		<Footer onClosed={onClosed} />
	</Notice>
)

export const ClosableError = ({
	onClosed,
	children,
}: React.PropsWithChildren<{ onClosed: () => void }>) => (
	<Error>
		{children}
		<Footer onClosed={onClosed} />
	</Error>
)
