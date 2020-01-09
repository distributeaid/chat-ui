import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Chat } from './Chat/Chat'

export const chat = ({ context }: { context: string }) => {
	const div = document.createElement('div')
	div.id = 'distribute-aid-chat'
	document.documentElement.appendChild(div)
	ReactDOM.render(<Chat context={context} />, div)
}

;(window as any).DAChat = chat
