declare module '*.svg' {
	const content: React.StatelessComponent<React.SVGAttributes<SVGElement>>
	export default content
}
/**
 * This string is replaced through webpack.
 */
declare const GLOBAL_VERSION: string
