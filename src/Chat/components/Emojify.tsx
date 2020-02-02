import * as React from 'react'
import { parse } from 'twemoji'
import styled from 'styled-components'

export const WithTwemoji = styled.span`
	img.emoji {
		height: 1em;
		width: 1em;
		margin: 0 0.05em 0 0.1em;
		vertical-align: -0.1em;
	}
`

export const convert = (text: string) =>
	parse(text, {
		folder: 'svg',
		ext: '.svg',
	})

export const emojify = (text: string) => (
	<WithTwemoji
		dangerouslySetInnerHTML={{
			__html: convert(text),
		}}
	/>
)
