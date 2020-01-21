import styled from 'styled-components'

export const Header = styled.div`
	display: flex;
	justify-content: space-between;
	font-weight: 300;
	font-family: 'Inter', sans-serif;
	align-items: center;
	width: 100%;
	height: 40px;
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
	font-family: 'Inter', sans-serif;
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

export const Button = styled.button`
	font-family: 'Inter', sans-serif;
	background-color: transparent;
	border: 1px solid;
	height: 30px;
	margin: 0.5rem;
`

export const MinimizeButton = styled(Button)`
	width: 30px;
	border-color: #fff;
	${Header} & {
		color: inherit;
	}
`

export const SendButton = styled(Button)`
	background-color: #fff;
	margin-left: 0.5rem;
`

export const MessageInput = styled.input`
	flex-grow: 1;
	font-family: 'Inter', sans-serif;
	background-color: #fff;
	border: 1px solid;
	height: 28px;
	padding: 0 0.5rem;
	margin-left: 0.5rem;
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
