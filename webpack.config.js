const webpack = require('webpack')
const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')

const cfg = {
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
		],
	},
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'twilio-chat': ['Twilio', 'Chat'],
	},
}

const replaceEnv = html =>
	Object.entries(process.env).reduce((html, [k, v]) => html.replace(``), html)

module.exports = [
	{
		...cfg,
		mode: 'production',
		name: 'production',
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
	},
]
