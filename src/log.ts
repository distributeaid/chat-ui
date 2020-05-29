export const log = (...args: any): void =>
	console.log(
		'%cChat',
		'background-color: #3543ec; color: #ffffff; padding: 0.25rem;',
		...args,
	)
