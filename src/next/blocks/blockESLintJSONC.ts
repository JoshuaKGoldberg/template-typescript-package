import { base } from "../base.js";
import { blockESLint } from "./blockESLint.js";

export const blockESLintJSONC = base.createBlock({
	about: {
		name: "ESLint JSONC Plugin",
	},
	produce() {
		return {
			addons: [
				blockESLint({
					extensions: [
						`...jsonc.configs["flat/recommended-with-json"]`,
						{
							files: ["*.jsonc"],
							rules: {
								"jsonc/comma-dangle": "off",
								"jsonc/no-comments": "off",
								"jsonc/sort-keys": "error",
							},
						},
					],
					imports: [{ source: "eslint-plugin-jsonc", specifier: "jsonc" }],
				}),
			],
		};
	},
});