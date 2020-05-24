import * as React from 'react'
import { ErrorInfo } from '../Twilio/api'
import { useState } from 'react'
import { ClosableError } from './ClosableNote'

export const Error = ({ type, message }: ErrorInfo) => {
	const [visible, setVisible] = useState(true)
	if (!visible) return null
	return (
		<ClosableError onClosed={() => setVisible(false)}>
			<strong>{type}:</strong> {message}
		</ClosableError>
	)
}
