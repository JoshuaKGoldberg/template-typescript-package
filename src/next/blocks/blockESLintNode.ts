import { base } from "../base.js";
import { blockESLint } from "./blockESLint.js";

export const blockESLintNode = base.createBlock({
	about: {
		name: "ESLint Node Plugin",
	},
	build({ options }) {
		return {
			addons: [
				blockESLint({
					extensions: [
						'n.configs["flat/recommended"]',
						{
							extends: ["tseslint.configs.disableTypeChecked"],
							files: ["**/*.md/*.ts"],
							rules: {
								"n/no-missing-import": [
									"error",
									{ allowModules: [options.repository] },
								],
							},
						},
					],
					imports: [{ source: "eslint-plugin-n", specifier: "n" }],
				}),
			],
		};
	},
});
