import { z } from "zod";

import { base } from "../base.js";
import { blockCSpell } from "./blockCSpell.js";
import { blockDevelopmentDocs } from "./blockDevelopmentDocs.js";
import { blockESLint } from "./blockESLint.js";
import { blockGitHubActionsCI } from "./blockGitHubActionsCI.js";
import { blockGitignore } from "./blockGitignore.js";
import { blockPackageJson } from "./blockPackageJson.js";
import { blockPrettier } from "./blockPrettier.js";
import { blockTSup } from "./blockTSup.js";
import { blockVSCode } from "./blockVSCode.js";
import { getPackageDependencies } from "./packageData.js";

export const blockVitest = base.createBlock({
	about: {
		name: "Vitest",
	},
	addons: {
		coverage: z
			.object({
				directory: z.string(),
				flags: z.string().optional(),
			})
			.default({ directory: "coverage" }),
		exclude: z.array(z.string()).default([]),
		include: z.array(z.string()).default([]),
	},
	build({ addons }) {
		const { coverage, exclude = [], include = [] } = addons;
		const excludeText = JSON.stringify(exclude);
		const includeText = JSON.stringify(include);

		return {
			addons: [
				blockCSpell({
					ignorePaths: [coverage.directory],
				}),
				blockESLint({
					extensions: [
						{
							extends: ["vitest.configs.recommended"],
							files: ["**/*.test.*"],
							rules: [
								{
									entries: {
										"@typescript-eslint/no-unsafe-assignment": "off",
									},
								},
							],
						},
					],
					ignores: [coverage.directory, "**/*.snap"],
					imports: [{ source: "@vitest/eslint-plugin", specifier: "vitest" }],
				}),
				blockDevelopmentDocs({
					sections: {
						Testing: {
							contents: `
[Vitest](https://vitest.dev) is used for tests.
You can run it locally on the command-line:

\`\`\`shell
pnpm run test
\`\`\`

Add the \`--coverage\` flag to compute test coverage and place reports in the \`coverage/\` directory:

\`\`\`shell
pnpm run test --coverage
\`\`\`

Note that [console-fail-test](https://github.com/JoshuaKGoldberg/console-fail-test) is enabled for all test runs.
Calls to \`console.log\`, \`console.warn\`, and other console methods will cause a test to fail.


		`,
						},
					},
				}),
				blockGitignore({
					ignores: [`/${coverage.directory}`],
				}),
				blockGitHubActionsCI({
					jobs: [
						{
							name: "Test",
							steps: [
								{ run: "pnpm run test --coverage" },
								{
									if: "always()",
									uses: "codecov/codecov-action@v3",
									...(coverage.flags && { with: { flags: coverage.flags } }),
								},
							],
						},
					],
				}),
				blockPackageJson({
					properties: {
						devDependencies: getPackageDependencies(
							"@vitest/coverage-v8",
							"@vitest/eslint-plugin",
							"console-fail-test",
							"vitest",
						),
						scripts: {
							test: "vitest",
						},
					},
				}),
				blockPrettier({
					ignores: [`/${coverage.directory}`],
				}),
				blockTSup({
					entry: ["!src/**/*.test.*"],
				}),
				blockVSCode({
					debuggers: [
						{
							args: ["run", "${relativeFile}"],
							autoAttachChildProcesses: true,
							console: "integratedTerminal",
							name: "Debug Current Test File",
							program: "${workspaceRoot}/node_modules/vitest/vitest.mjs",
							request: "launch",
							skipFiles: ["<node_internals>/**", "**/node_modules/**"],
							smartStep: true,
							type: "node",
						},
					],
					extensions: ["vitest.explorer"],
				}),
			],
			files: {
				"vitest.config.ts": `import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		coverage: {
			all: true,
			exclude: ${excludeText},
			include: ${includeText},
			reporter: ["html", "lcov"],
		},
		exclude: [${excludeText.slice(1, excludeText.length - 1)}, "node_modules"],
		setupFiles: ["console-fail-test/setup"],
	},
});
	`,
			},
		};
	},
});
