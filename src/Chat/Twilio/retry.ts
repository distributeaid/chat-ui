import { Either, isRight, left } from 'fp-ts/lib/Either'
import { ErrorInfo } from './api'

const backoff = (
	times: number,
	fn: () => Promise<Either<any, any>>,
	resolve: (value: any) => void,
	reject: (error: Error) => void,
	onRetry?: (numTry: number) => void,
	numTry = 1,
): void => {
	fn()
		.then((e) => {
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
				onRetry?.(numTry + 1)
				backoff(times, fn, resolve, reject, onRetry, numTry + 1)
			}, 1000)
		})
		.catch(reject)
}

type RetriedAsyncFunction<R, T extends () => Promise<Either<ErrorInfo, R>>> = (
	fn: T,
) => Promise<Either<ErrorInfo, R>>
type BoundRetry<
	F extends () => Promise<Either<any, any>>
> = F extends RetriedAsyncFunction<infer R, any>
	? Promise<Either<ErrorInfo, R>>
	: never
export const retry = (numTries: number, onRetry?: (numTry: number) => void) => <
	F extends () => Promise<Either<any, any>>
>(
	fn: F,
): BoundRetry<F> =>
	(new Promise((resolve, reject) =>
		backoff(numTries, fn, resolve, reject, onRetry),
	) as any) as BoundRetry<F>
