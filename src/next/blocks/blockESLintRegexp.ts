import { base } from "../base.js";
import { blockESLint } from "./blockESLint.js";

export const blockESLintRegexp = base.createBlock({
	about: {
		name: "ESLint Regexp Plugin",
	},
	build() {
		return {
			addons: [
				blockESLint({
					extensions: [`regexp.configs["flat/recommended"]`],
					imports: [
						{ source: "eslint-plugin-regexp", specifier: "* as regexp" },
					],
				}),
			],
		};
	},
});
