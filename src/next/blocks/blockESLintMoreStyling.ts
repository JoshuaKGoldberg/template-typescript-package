import { base } from "../base.js";
import { blockESLint } from "./blockESLint.js";

export const blockESLintMoreStyling = base.createBlock({
	about: {
		name: "ESLint More Styling",
	},
	build() {
		return {
			addons: [
				blockESLint({
					rules: [
						{
							comment: "Stylistic concerns that don't interfere with Prettier",
							entries: {
								"logical-assignment-operators": [
									"error",
									"always",
									{ enforceForIfStatements: true },
								],
								"no-useless-rename": "error",
								"object-shorthand": "error",
								"operator-assignment": "error",
							},
						},
					],
				}),
			],
		};
	},
});
