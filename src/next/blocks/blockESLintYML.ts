import { schema } from "../schema.js";
import { blockESLint } from "./blockESLint.js";

export const blockESLintYML = schema.createBlock({
	about: {
		name: "ESLint YML Plugin",
	},
	produce() {
		return {
			addons: [
				blockESLint({
					extensions: [
						'...yml.configs["flat/recommended"]',
						'...yml.configs["flat/prettier"]',
						{
							files: ["**/*.{yml,yaml}"],
							rules: {
								"yml/file-extension": ["error", { extension: "yml" }],
								"yml/sort-keys": [
									"error",
									{
										order: { type: "asc" },
										pathPattern: "^.*$",
									},
								],
								"yml/sort-sequence-values": [
									"error",
									{
										order: { type: "asc" },
										pathPattern: "^.*$",
									},
								],
							},
						},
					],
					imports: [{ source: "eslint-plugin-yml", specifier: "yml" }],
				}),
			],
		};
	},
});
