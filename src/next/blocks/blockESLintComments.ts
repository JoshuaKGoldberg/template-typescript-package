import { base } from "../base.js";
import { blockESLint } from "./blockESLint.js";

export const blockESLintComments = base.createBlock({
	about: {
		name: "ESLint Comments Plugin",
	},
	build() {
		return {
			addons: [
				blockESLint({
					extensions: ["comments.recommended"],
					imports: [
						{
							source: "@eslint-community/eslint-plugin-eslint-comments/configs",
							specifier: "comments",
						},
					],
				}),
			],
		};
	},
});
