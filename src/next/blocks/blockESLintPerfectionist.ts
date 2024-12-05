import { base } from "../base.js";
import { blockESLint } from "./blockESLint.js";

export const blockESLintPerfectionist = base.createBlock({
	about: {
		name: "ESLint Perfectionist Plugin",
	},
	build() {
		return {
			addons: [
				blockESLint({
					extensions: [`perfectionist.configs["recommended-natural"]`],
					imports: [
						{
							source: "eslint-plugin-perfectionist",
							specifier: "perfectionist",
						},
					],
					settings: {
						perfectionist: {
							partitionByComment: true,
							type: "natural",
						},
					},
				}),
			],
		};
	},
});
