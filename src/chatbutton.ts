const imageUrl =
		'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLW1lc3NhZ2UtY2lyY2xlIj48cGF0aCBkPSJNMjEgMTEuNWE4LjM4IDguMzggMCAwIDEtLjkgMy44IDguNSA4LjUgMCAwIDEtNy42IDQuNyA4LjM4IDguMzggMCAwIDEtMy44LS45TDMgMjFsMS45LTUuN2E4LjM4IDguMzggMCAwIDEtLjktMy44IDguNSA4LjUgMCAwIDEgNC43LTcuNiA4LjM4IDguMzggMCAwIDEgMy44LS45aC41YTguNDggOC40OCAwIDAgMSA4IDh2LjV6Ij48L3BhdGg+PC9zdmc+' // base64 -w0 <feather icon chat bubble white>
;(window as any).DAChatButton = (onClick: (remove: () => void) => void) => {
	console.log('Chat', GLOBAL_VERSION)
	const button = document.createElement('button')
	button.id = 'distribute-aid-chat-button'
	const img = document.createElement('img')
	img.src = imageUrl
	button.appendChild(img)
	button.title = 'Launch chat!'
	button.onclick = () => {
		button.disabled = true
		onClick(() => {
			button.remove()
		})
	}
	document.body.appendChild(button)
	const style = document.createElement('style')
	style.type = 'text/css'
	style.textContent = `#distribute-aid-chat-button {
        background-color: #3777ec;
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        border-radius: 100%;
        padding: 1rem 1rem 0.7rem 1rem;
        box-shadow: 0px 0px 10px 0px #0000008f;
        cursor: pointer;
    }
    #distribute-aid-chat-button:disabled {
        background-color: #b7b7b7;
    }
    `
	document.head.appendChild(style)
}
