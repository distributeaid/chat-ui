import * as React from 'react'
import { useState } from 'react'
import { Channel } from 'twilio-chat/lib/channel'
import { EnterEmailForNotification } from '../components/notifications/EnterEmailForNotification'
import { EnterConfirmationCode } from '../components/notifications/EnterConfirmationCode'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
	enableChannelNotifications,
	ErrorInfo,
	verifyEmail,
} from '../Twilio/api'
import { pipe } from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import { Error } from '../components/Error'
import { Wrapper } from '../components/notifications/elements'

export const SubscribeToChannel = ({
	channel,
	apollo,
	token,
}: {
	channel: Channel
	apollo: ApolloClient<NormalizedCacheObject>
	token: string
}) => {
	const [email, setEmail] = useState<string>()
	const [error, setError] = useState<ErrorInfo>()
	const [subscribing, setSubscribing] = useState<boolean>(false)
	const [confirming, setConfirming] = useState<boolean>(false)
	const [subscribed, setSubscribed] = useState<boolean>(false)
	const [verified, setVerified] = useState<boolean>(false)

	return (
		<>
			{error && <Error type={error.type} message={error.message} />}
			{confirming && <Wrapper>Confirming ...</Wrapper>}
			{subscribed && email && !verified && (
				<EnterConfirmationCode
					email={email}
					onCode={code => {
						console.log(code)
						setConfirming(true)
						pipe(
							verifyEmail({
								apollo,
								email,
								code,
							}),
							TE.map(verified => {
								setConfirming(false)
								if (verified) {
									setVerified(verified)
								} else {
									setError({
										type: 'BadRequest',
										message: `Failed to verify email ${email} with code ${code}!`,
									})
								}
							}),
							TE.mapLeft(setError),
						)().catch(setError)
					}}
				/>
			)}
			{subscribing && <Wrapper>Subscribing ...</Wrapper>}
			{!subscribed && !subscribing && (
				<EnterEmailForNotification
					channel={channel}
					onEmail={email => {
						setEmail(email)
						setSubscribing(true)
						pipe(
							enableChannelNotifications({
								apollo,
								token,
								channel: channel.uniqueName,
								email,
							}),
							TE.map(({ emailVerified }) => {
								setSubscribed(true)
								setSubscribing(false)
								if (emailVerified) {
									setVerified(true)
								}
							}),
							TE.mapLeft(setError),
						)().catch(setError)
					}}
				/>
			)}
		</>
	)
}
