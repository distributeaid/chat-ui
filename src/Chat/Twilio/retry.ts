import { Either, isRight, left } from 'fp-ts/lib/Either'
import { ErrorInfo } from './api'

const backoff = <R, T extends () => Promise<Either<ErrorInfo, R>>>(
	times: number,
	fn: T,
	resolve: (value: Either<ErrorInfo, R>) => void,
	reject: (error: Error) => void,
	onRetry?: (numTry: number) => void,
	numTry = 1,
): void => {
	fn()
		.then(e => {
			if (isRight(e)) {
				return resolve(e)
			}
			if (numTry >= times) {
				return resolve(
					left({
						type: 'RETRY_FAILED',
						message: `Max retries reached (${times})!`,
					}),
				)
			}
			setTimeout(() => {
				onRetry && onRetry(numTry + 1)
				backoff(times, fn, resolve, reject, onRetry, numTry + 1)
			}, 1000)
		})
		.catch(reject)
}

export const retry = <R>(
	times: number,
	onRetry?: (numTry: number) => void,
) => async (fn: () => Promise<Either<ErrorInfo, R>>) =>
	new Promise<Either<ErrorInfo, R>>((resolve, reject) =>
		backoff(times, fn, resolve, reject, onRetry),
	)
