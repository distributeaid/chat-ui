import styled from 'styled-components'

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	font-weight: 300;
	align-items: center;
	width: 100%;
	height: 40px;
	cursor: pointer;
`

export const OtherChannelHeader = styled(Header)`
	font-style: italic;
`

export const Title = styled.div`
	margin: 0.5rem 0.5rem 0.5rem 1rem;
`

export const Footer = styled(Header)`
	background-color: #d8d8d8;
`

export const TextButton = styled.button`
	background-color: transparent;
	border: 0;
	margin: 0;
	padding: 0;
	color: #1c465a;
	text-decoration: underline;
	width: 100%;
	text-align: center;
	cursor: pointer;
`
export const UIButton = styled.button`
	border: 0;
	background-color: transparent;
	height: 24px;
	width: 24px;
	color: inherit;
	cursor: pointer;
	padding: 0;
	margin: 0;
`
export const Controls = styled.div`
	padding: 0;
	margin: 0;
    display: flex;
	margin-right: 1rem;
	${UIButton} + ${UIButton} {
		margin-left: 0.5rem;
	}
`
export const Button = styled.button`
	background-color: transparent;
	border: 1px solid;
	height: 30px;
	margin: 0.5rem;
`
export const SendButton = styled.button`
	border: 0;
	background-color: transparent;
	height: 30px;
	width: 30px;
	margin-left: 0.5rem;
	margin-right: 1rem;
	cursor: pointer;
	color: #5eb114;
	&:disabled {
		color: #989898;
	}
`

export const MessageInput = styled.input`
	flex-grow: 1;
	background-color: #fff;
	border: 1px solid;
	height: 28px;
	padding: 0 0.5rem;
	margin-left: 1rem;
	&:disabled {
		color: #989898;
		background-color: #d0d0d0;
		border-color: #bfbfbf;
	}
`

export const MessageListContainer = styled.div`
	width: 350px;
	background-color: #fff;
`

export const MessageList = styled.div`
	min-height: 200px;
	max-height: 500px;
	border-right: 1px solid #ccc;
	border-left: 1px solid #ccc;
	overflow-y: scroll;
`
