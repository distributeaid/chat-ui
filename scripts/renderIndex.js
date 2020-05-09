const { html, getVersion } = require('./html')

process.stdout.write(
	html({
		VERSION: getVersion(),
		IS_PRODUCTION: JSON.stringify(true),
		SITE_DIR: process.env.SITE_DIR,
		GRAPHQL_API_ENDPOINT: process.env.GRAPHQL_API_ENDPOINT,
		GRAPHQL_API_KEY: process.env.GRAPHQL_API_KEY,
	}),
)
