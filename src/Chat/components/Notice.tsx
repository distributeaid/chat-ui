import * as React from 'react'
import styled from 'styled-components'
import { UIButton } from './ChannelView'
import { ClosableNote } from './ClosableNote'

import HelpIcon from 'feather-icons/dist/icons/help-circle.svg'

const NoticeIcon = styled(HelpIcon)`
	color: #ffec8e;
`

export const DevNoticeToggle = (
	props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) => (
	<UIButton {...props}>
		<NoticeIcon />
	</UIButton>
)

export const DevNotice = ({ onClosed }: { onClosed: () => void }) => (
	<ClosableNote onClosed={onClosed}>
		This is a <strong>development preview</strong> of the chat.
		<br />
		Please provide your feedback in the{' '}
		<a
			href={'https://distribute-aid.slack.com/archives/C010UBFU0P9'}
			target={'_blank'}
			rel={'noopener noreferrer'}
		>
			<code>#dev-chat</code>
		</a>{' '}
		channel in our{' '}
		<a
			href={'https://distribute-aid.slack.com/'}
			target={'_blank'}
			rel={'noopener noreferrer'}
		>
			Slack
		</a>
		.<br />
		Please report issues on{' '}
		<a
			href={'https://github.com/distributeaid/chat-ui/issues/new'}
			target={'_blank'}
			rel={'noopener noreferrer'}
		>
			GitHub
		</a>
		.
	</ClosableNote>
)
