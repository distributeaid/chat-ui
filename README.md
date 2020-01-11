# Distribute Aid in-app-chat UI

[![GitHub Package Registry version](https://img.shields.io/github/release/distributeaid/chat-ui.svg?label=GPR&logo=github)](https://github.com/distributeaid/chat-ui/packages/101337)
[![GitHub Actions](https://github.com/distributeaid/chat-ui/workflows/Test%20and%20Release/badge.svg)](https://github.com/distributeaid/chat-ui/actions)
[![Greenkeeper badge](https://badges.greenkeeper.io/distributeaid/chat-ui.svg)](https://greenkeeper.io/)
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
