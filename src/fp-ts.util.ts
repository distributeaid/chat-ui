import { TaskEither, taskEither } from 'fp-ts/lib/TaskEither'
import { Option } from 'fp-ts/lib/Option'
import { getOptionM } from 'fp-ts/lib/OptionT'

const M = getOptionM(taskEither)
export const getOrElse = <E, A>(
	onNone: () => TaskEither<E, A>,
): ((ma: TaskEither<E, Option<A>>) => TaskEither<E, A>) => ma =>
	M.getOrElse(ma, onNone)
