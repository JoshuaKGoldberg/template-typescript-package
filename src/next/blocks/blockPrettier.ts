import { z } from "zod";

import { base } from "../base.js";
import { blockCSpell } from "./blockCSpell.js";
import { blockDevelopmentDocs } from "./blockDevelopmentDocs.js";
import { blockGitHubActionsCI } from "./blockGitHubActionsCI.js";
import { blockPackageJson } from "./blockPackageJson.js";
import { blockVSCode } from "./blockVSCode.js";
import { getPackageDependencies } from "./packageData.js";

export const blockPrettier = base.createBlock({
	about: {
		name: "Prettier",
	},
	addons: {
		ignores: z.array(z.string()).default([]),
		overrides: z
			.array(
				z.object({
					files: z.string(),
					options: z.object({
						parser: z.string(),
					}),
				}),
			)
			.default([]),
		plugins: z.array(z.string()).default([]),
	},
	build({ addons }) {
		const { ignores, overrides, plugins } = addons;

		return {
			addons: [
				blockDevelopmentDocs({
					sections: {
						Formatting: {
							contents: `
[Prettier](https://prettier.io) is used to format code.
It should be applied automatically when you save files in VS Code or make a Git commit.

To manually reformat all files, you can run:

\`\`\`shell
pnpm format --write
\`\`\`
`,
						},
					},
				}),
				blockGitHubActionsCI({
					jobs: [
						{
							name: "Prettier",
							steps: [{ run: "pnpm format --list-different" }],
						},
					],
				}),
				blockPackageJson({
					properties: {
						devDependencies: getPackageDependencies(
							...plugins,
							"husky",
							"lint-staged",
						),
						"lint-staged": {
							"*": "prettier --ignore-unknown --write",
						},
						scripts: {
							format: "prettier .",
							prepare: "husky",
						},
					},
				}),
				blockVSCode({
					extensions: ["esbenp.prettier-vscode"],
					settings: { "editor.defaultFormatter": "esbenp.prettier-vscode" },
				}),
			],
			commands: [
				{
					phase: 2, // TODO: ???
					script: "pnpm format --write",
				},
			],
			files: {
				".husky": {
					".gitignore": "_",
					"pre-commit": "npx lint-staged",
				},
				".prettierignore": ["/.husky", "/lib", "/pnpm-lock.yaml", ...ignores]
					.sort()
					.join("\n"),
				".prettierrc.json": JSON.stringify({
					$schema: "http://json.schemastore.org/prettierrc",
					...(overrides.length && { overrides: overrides.sort() }),
					...(plugins.length && { plugins: plugins.sort() }),
					useTabs: true,
				}),
			},
		};
	},
});
