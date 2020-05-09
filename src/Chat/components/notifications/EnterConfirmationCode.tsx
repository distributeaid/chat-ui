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

const isValid = (code: string) => /[a-z]{8}-[a-z]{8}-[a-z]{8}/.test(code)

export const EnterConfirmationCode = ({
	onCode,
	email,
}: {
	email: string
	onCode: (code: string) => void
}) => {
	const [code, setCode] = useState('')
	return (
		<Wrapper>
			<form
				onSubmit={(e) => {
					e.preventDefault()
				}}
			>
				<Legend>Confirmation code</Legend>
				<p>
					Please enter the confirmation sent to your email <code>{email}</code>.
				</p>
				<FieldSet>
					<Label htmlFor="code">Code</Label>
					<InputWithButton>
						<TextInput
							type="text"
							id="code"
							required
							onChange={({ target: { value } }) => {
								setCode(value)
							}}
							value={code}
						/>
						<button
							disabled={!isValid(code)}
							onClick={() => {
								onCode(code)
							}}
						>
							confirm
						</button>
					</InputWithButton>
				</FieldSet>
			</form>
		</Wrapper>
	)
}
