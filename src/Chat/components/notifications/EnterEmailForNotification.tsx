import * as React from 'react'
import { useState } from 'react'
import {
	FieldSet,
	InputWithButton,
	Label,
	Legend,
	TextInput,
	Wrapper,
} from './elements'
import { Channel } from 'twilio-chat/lib/channel'

const isValid = (email: string) => /.@./.test(email)

export const EnterEmailForNotification = ({
	channel,
	onEmail,
}: {
	channel: Channel
	onEmail: (email: string) => void
}) => {
	const [email, setEmail] = useState(
		window.localStorage.getItem('dachat:notification:email') || '',
	)
	return (
		<Wrapper>
			<form
				onSubmit={(e) => {
					e.preventDefault()
				}}
			>
				<Legend>Notification settings</Legend>
				<p>
					You can enable email notifications for new messages in the channel{' '}
					<em>{channel.uniqueName}</em> when you are offline.
				</p>
				<FieldSet>
					<Label htmlFor="email">Email</Label>
					<InputWithButton>
						<TextInput
							type="email"
							id="email"
							required
							onChange={({ target: { value } }) => {
								setEmail(value)
							}}
							value={email}
						/>
						<button
							disabled={!isValid(email)}
							onClick={() => {
								onEmail(email)
								window.localStorage.setItem('dachat:notification:email', email)
							}}
						>
							subscribe
						</button>
					</InputWithButton>
				</FieldSet>
			</form>
		</Wrapper>
	)
}
