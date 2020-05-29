export const log = (...args: any): void =>
	console.log(
		'%cChat',
		'background-color: #3543ec; color: #ffffff; padding: 0.25rem;',
		...args,
	)

export const logError = (...args: any): void =>
	console.error(
		'%cChat%cError',
		'background-color: #3543ec; color: #ffffff; padding: 0.25rem;',
		'background-color: #A50203; color: #ffffff; padding: 0.25rem;',
		...args,
	)

export const logDebug = (...args: any): void =>
	console.debug(
		'%cChat%cDebug',
		'background-color: #3543ec; color: #ffffff; padding: 0.25rem;',
		'color: #FF69B4; padding: 0.25rem;',
		...args,
	)
