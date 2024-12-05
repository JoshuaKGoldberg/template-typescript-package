import { base } from "../base.js";
import { blockESLint } from "./blockESLint.js";

export const blockESLintPackageJson = base.createBlock({
	about: {
		name: "ESLint package.json Plugin",
	},
	build() {
		return {
			addons: [
				blockESLint({
					extensions: ["packageJson"],
					imports: [
						{
							source: "eslint-plugin-package-json/configs/recommended",
							specifier: "packageJson",
						},
					],
				}),
			],
		};
	},
});
