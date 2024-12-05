import { base } from "../base.js";
import { blockESLint } from "./blockESLint.js";

export const blockESLintMarkdown = base.createBlock({
	about: {
		name: "ESLint Markdown Plugin",
	},
	build() {
		return {
			addons: [
				blockESLint({
					extensions: ["markdown.configs.recommended"],
					imports: [
						{
							source: "eslint-plugin-markdown",
							specifier: "markdown",
							types: true,
						},
					],
				}),
			],
		};
	},
});
