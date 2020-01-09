import * as React from 'react'

export const Hello = ({
	compiler,
	framework,
}: {
	compiler: string
	framework: string
}) => (
	<h1>
		Hello from {compiler} and {framework}!
	</h1>
)
