const webpack = require('webpack')
const { html, getVersion } = require('./scripts/html')
const gitHubUrl = require('./package.json').homepage

const VERSION = getVersion()

const cfg = {
	entry: {
		main: './src/index.tsx',
		chatbutton: './src/chatbutton.ts',
		demo: './src/demo.tsx',
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts(x?)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
					},
				],
			},
			{
				test: /\.svg$/,
				use: ['@svgr/webpack'],
			},
		],
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'twilio-chat': ['Twilio', 'Chat'],
		twemoji: 'twemoji',
	},
}

module.exports = [
	{
		...cfg,
		mode: 'production',
		name: 'production',
		plugins: [
			new webpack.DefinePlugin({
				GLOBAL_IS_PRODUCTION: JSON.stringify(true),
				GLOBAL_VERSION: JSON.stringify(VERSION),
				GLOBAL_GITHUB_URL: JSON.stringify(gitHubUrl),
			}),
		],
	},
	{
		...cfg,
		name: 'development',
		mode: 'development',
		devtool: 'source-map',
		devServer: {
			contentBase: './web',
			before: (app, server, compiler) => {
				app.get('/', (req, res) => {
					res.set('Content-Type', 'text/html')
					res.send(
						html({
							GRAPHQL_API_ENDPOINT: process.env.GRAPHQL_API_ENDPOINT,
							GRAPHQL_API_KEY: process.env.GRAPHQL_API_KEY,
							VERSION,
							IS_PRODUCTION: JSON.stringify(false),
						}),
					)
				})
			},
		},
		module: {
			rules: [
				...cfg.module.rules,
				{
					enforce: 'pre',
					test: /\.js$/,
					loader: 'source-map-loader',
				},
			],
		},
		plugins: [
			new webpack.DefinePlugin({
				GLOBAL_IS_PRODUCTION: JSON.stringify(false),
				GLOBAL_VERSION: JSON.stringify(VERSION),
				GLOBAL_GITHUB_URL: JSON.stringify(gitHubUrl),
			}),
		],
	},
]
