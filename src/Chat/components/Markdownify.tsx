import * as React from 'react'
import { Converter } from 'showdown'
import { convert, WithTwemoji } from './Emojify'
import styled from 'styled-components'

// See https://github.com/showdownjs/showdown#valid-options
const converter = new Converter({
	simplifiedAutoLink: true,
	excludeTrailingPunctuationFromURLs: true,
	strikethrough: true,
	ghCodeBlocks: false,
	simpleLineBreaks: true,
	openLinksInNewWindow: true,
})

const FromMarkdown = styled(WithTwemoji)`
	p {
		padding: 0.5rem;
		margin: 0;
	}
	code {
		color: inherit;
		padding: 0.15rem;
		border-radius: 4px;
		font-weight: bold;
		text-shadow: 1px 1px 2px #000000dd;
		background-color: transparent;
		font-size: 85%;
		line-height: 1;
	}
	img {
		max-width: 100%;
	}
`

export const markdownify = (text: string) => (
	<FromMarkdown
		dangerouslySetInnerHTML={{
			__html: converter.makeHtml(convert(text)),
		}}
	/>
)
