import { z } from "zod";

import { base } from "../base.js";
import { blockCSpell } from "./blockCSpell.js";
import { blockDevelopmentDocs } from "./blockDevelopmentDocs.js";
import { blockESLint } from "./blockESLint.js";
import { blockGitHubActionsCI } from "./blockGitHubActionsCI.js";
import { blockGitignore } from "./blockGitignore.js";
import { blockPackageJson } from "./blockPackageJson.js";
import { blockTSup } from "./blockTSup.js";
import { blockVSCode } from "./blockVSCode.js";

export const blockVitest = base.createBlock({
	about: {
		name: "Vitest",
	},
	args: {
		exclude: z.array(z.string()).optional(),
		include: z.array(z.string()).optional(),
	},
	produce({ args }) {
		const { exclude = [], include = [] } = args;
		const excludeText = JSON.stringify(exclude);
		const includeText = JSON.stringify(include);

		return {
			addons: [
				blockCSpell({
					ignores: ["coverage"],
				}),
				blockESLint({
					extensions: [
						{
							extends: ["vitest.configs.recommended"],
							files: ["**/*.test.*"],
							rules: {
								"@typescript-eslint/no-unsafe-assignment": "off",
								"@typescript-eslint/no-unsafe-call": "off",
							},
						},
					],
					ignores: ["coverage", "**/*.snap"],
					imports: [{ source: "@vitest/eslint-plugin", specifier: "vitest" }],
				}),
				blockDevelopmentDocs({
					sections: {
						Testing: `
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
		
		### Debugging Tests
		
		This repository includes a [VS Code launch configuration](https://code.visualstudio.com/docs/editor/debugging) for debugging unit tests.
		To launch it, open a test file, then run _Debug Current Test File_ from the VS Code Debug panel (or press F5).
		`,
					},
				}),
				blockGitignore({
					ignores: ["coverage"],
				}),
				blockGitHubActionsCI({
					jobs: [
						{
							name: "Test",
							steps: [
								{ run: "pnpm run test --coverage" },
								{ uses: "codecov/codecov-action@v3" },
							],
						},
					],
				}),
				blockPackageJson({
					properties: {
						devDependencies: {
							"@vitest/coverage-v8": "latest",
							"@vitest/eslint-plugin": "latest",
							"console-fail-test": "latest",
							vitest: "latest",
						},
						scripts: {
							test: "vitest",
						},
					},
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
