const webpack = require('webpack')

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
	},
	plugins: [
		// See https://date-fns.org/v2.9.0/docs/webpack
		new webpack.ContextReplacementPlugin(
			/date\-fns[\/\\]/,
			new RegExp(`[/\\\\\](${['en'].join('|')})[/\\\\\]`),
		),
	],
}

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
