import { z } from "zod";

import { base } from "../base.js";
import { blockDevelopmentDocs } from "./blockDevelopmentDocs.js";
import { blockESLint } from "./blockESLint.js";
import { blockGitHubActionsCI } from "./blockGitHubActionsCI.js";
import { blockPackageJson } from "./blockPackageJson.js";
import { getPackageDependencies } from "./packageData.js";

export const blockTSup = base.createBlock({
	about: {
		name: "tsup",
	},
	addons: {
		entry: z.array(z.string()).default([]),
	},
	build({ addons }) {
		const { entry } = addons;

		return {
			addons: [
				blockDevelopmentDocs({
					sections: {
						Building: {
							contents: `
Run [**tsup**](https://tsup.egoist.dev) locally to build source files from \`src/\` into output files in \`lib/\`:

\`\`\`shell
pnpm build
\`\`\`

Add \`--watch\` to run the builder in a watch mode that continuously cleans and recreates \`lib/\` as you save files:

\`\`\`shell
pnpm build --watch
\`\`\`
`,
						},
					},
				}),
				blockESLint({
					beforeLint: `Note that you'll need to run \`pnpm build\` before \`pnpm lint\` so that lint rules which check the file system can pick up on any built files.`,
				}),
				blockGitHubActionsCI({
					jobs: [
						{
							name: "Build",
							steps: [{ run: "pnpm build" }, { run: "node ./lib/index.js" }],
						},
					],
				}),
				blockPackageJson({
					properties: {
						devDependencies: getPackageDependencies("tsup"),
						scripts: {
							build: "tsup",
						},
					},
				}),
			],
			files: {
				"tsup.config.ts": `import { defineConfig } from "tsup";

export default defineConfig({
	bundle: false,
	clean: true,
	dts: true,
	entry: ${JSON.stringify(["src/**/*.ts", ...entry])},
	format: "esm",
	outDir: "lib",
	sourcemap: true,
});
`,
			},
		};
	},
});
