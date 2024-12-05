import { base } from "../base.js";
import { blockESLint } from "./blockESLint.js";

export const blockESLintJSONC = base.createBlock({
	about: {
		name: "ESLint JSONC Plugin",
	},
	build() {
		return {
			addons: [
				blockESLint({
					extensions: [`jsonc.configs["flat/recommended-with-json"]`],
					imports: [{ source: "eslint-plugin-jsonc", specifier: "jsonc" }],
				}),
			],
		};
	},
});
