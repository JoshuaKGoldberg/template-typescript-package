import { z } from "zod";

import { base } from "../base.js";
import { blockCSpell } from "./blockCSpell.js";
import { blockDevelopmentDocs } from "./blockDevelopmentDocs.js";
import { blockGitHubActionsCI } from "./blockGitHubActionsCI.js";
import { blockPackageJson } from "./blockPackageJson.js";
import { blockVSCode } from "./blockVSCode.js";
import { getPackageDependencies } from "./packageData.js";

export const blockMarkdownlint = base.createBlock({
	about: {
		name: "Markdownlint",
	},
	addons: {
		ignores: z.array(z.string()).default([]),
	},
	build({ addons }) {
		const { ignores } = addons;

		return {
			addons: [
				blockDevelopmentDocs({
					sections: {
						Linting: {
							contents: {
								items: [
									`- \`pnpm lint:md\` ([Markdownlint](https://github.com/DavidAnson/markdownlint)): Checks Markdown source files`,
								],
							},
						},
					},
				}),
				blockGitHubActionsCI({
					jobs: [
						{
							name: "Lint Markdown",
							steps: [{ run: "pnpm lint:md" }],
						},
					],
				}),
				blockPackageJson({
					properties: {
						devDependencies: getPackageDependencies(
							"markdownlint",
							"markdownlint-cli",
							"sentences-per-line",
						),
						scripts: {
							"lint:md":
								'markdownlint "**/*.md" ".github/**/*.md" --rules sentences-per-line',
						},
					},
				}),
				blockVSCode({
					extensions: ["DavidAnson.vscode-markdownlint"],
				}),
			],
			files: {
				".markdownlint.json": JSON.stringify({
					extends: "markdownlint/style/prettier",
					"first-line-h1": false,
					"no-inline-html": false,
				}),
				".markdownlintignore": [
					".github/CODE_OF_CONDUCT.md",
					"CHANGELOG.md",
					"node_modules/",
					...ignores,
				]
					.sort()
					.join("\n"),
			},
		};
	},
});
