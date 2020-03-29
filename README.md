# Distribute Aid in-app-chat UI

[![GitHub Package Registry version](https://img.shields.io/github/release/distributeaid/chat-ui.svg?label=GPR&logo=github)](https://github.com/distributeaid/chat-ui/packages/101337)
[![GitHub Actions](https://github.com/distributeaid/chat-ui/workflows/Test%20and%20Release/badge.svg)](https://github.com/distributeaid/chat-ui/actions)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This provides the UI for the in-app-chat as a standalone micro-frontend.

## Installation

    npm ci

## Configuration

Provide the integration API's settings in the environment variables:

    export GRAPHQL_API_ENDPOINT=https://xxx.appsync-api.yyy.amazonaws.com/graphql
    export GRAPHQL_API_KEY=xxx-yyy

## Development

Start the development server

    npm start

### Tokens

The chat expects a valid JWT which will be verified by the integration, follow
[the instructions here](https://github.com/distributeaid/twilio-integration#generating-keypairs)
to create a token.

## Lazy loading the Chat widget

The Chat UI provides a light-weight chat button which can be shown to the user
which only has a weight of 4KB (a loader for JS files and the chat icon), only
after the user clicks the button, the JavaScript for the entire chat widget will
be loaded. A cookie will remember whether the chat should be open.

![vokoscreenNG-2020-02-02_00-44-23](https://github.com/distributeaid/chat-ui/releases/download/v1.17.1/vokoscreenNG-2020-02-02_00-44-23.webm)

The small chat button is only show if a localStorage setting is enabled:
`window.localStorage.setItem('DAChat:enabled', '1')`, this way we can test the
feature without needing a feature flag in the toolbox.

## UI and features

> **Note:** This documentation is for version
> [1.17.1](https://github.com/distributeaid/chat-ui/releases/tag/v1.17.1) of the
> chat-ui.

### Getting started

#### Enabling the chat for your browser

> **Note:** The chat feature is hidden by default, and the following steps need
> to done only once, but for every browser you are using.

1. Go to <https://toolbox.distributeaid.org/>
1. Log in
1. Open the browser console (by pressing F12).
1. Copy the following line and paste it in the command line:
   `window.localStorage.setItem('DAChat:enabled', '1')`
1. Press Enter.
1. Press F12 again to close the browser console.
1. Reload the page.

The chat button will now show up.

![Enabling the chat for your browser](/uploads/6b9ec99b78e323add8bcba925ce8544e/vokoscreenNG-2020-02-09_16-58-32.webm)

### Opening the chat

Click the blue chat icon to open the chat window.

> **Note:** If this is the first time, it may take a few seconds to load the
> client, however this will only happen once, and cached so that on subsequent
> page loads the chat will be available immediately.

The chat window will open and you will be able to chat in the `#general` and the
`#random` channel.

### Error on first connect: `Failed to join channel "general"`

You may see an error message at the bottom of the chat UI:

<img src="https://github.com/distributeaid/chat-ui/releases/download/v1.17.1//Image_URL.png" width=350 alt="Error on first login" />

This is known and on the todo list, simply reload the page and the error should
go away.

### Writing chat messages

Enter your message in the input field on the bottom, press enter or click the
send icon. Markdown is supported.

You can delete messages by clicking the delete icon.

![Writing chat messages](https://github.com/distributeaid/chat-ui/releases/download/v1.17.1//vokoscreenNG-2020-02-09_17-17-37.webm)

### Switching channels

Click on the top bars to switch between your channels:

![Switching channels](https://github.com/distributeaid/chat-ui/releases/download/v1.17.1//vokoscreenNG-2020-02-09_17-07-38.webm)

### Leave a channel

Click the close icon to leave a channel. For now, the channel will be restored
on the next page reload. You cannot leave the last remaining channel.

![Leave a channel](https://github.com/distributeaid/chat-ui/releases/download/v1.17.1//vokoscreenNG-2020-02-09_17-10-17.webm)

### Minimize Chat

Click the minimize icon to minimize the chat UI:

![Minimize Chat](https://github.com/distributeaid/chat-ui/releases/download/v1.17.1//vokoscreenNG-2020-02-09_17-11-09.webm)

### Slash Commands

The chat supports slash commands which you run by typing `/` and a command. Try
`/help`, it will list all available commands.

![Slash Commands](https://github.com/distributeaid/chat-ui/releases/download/v1.17.1//vokoscreenNG-2020-02-09_17-15-19.webm)
