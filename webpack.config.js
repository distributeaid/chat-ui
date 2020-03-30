const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')
const webpack = require('webpack')

let v = 'unknown'
try {
	v = fs.readFileSync(path.join(process.cwd(), '.version')).trim()
} catch {
	v = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')))
		.version
}

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
				GLOBAL_VERSION: JSON.stringify(v),
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
					const html = fs.readFileSync(
						path.join(process.cwd(), 'web', 'index.html'),
						'utf-8',
					)
					const tpl = Handlebars.compile(html)
					res.set('Content-Type', 'text/html')
					res.send(tpl(process.env))
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
				GLOBAL_VERSION: JSON.stringify(v),
			}),
		],
	},
]
