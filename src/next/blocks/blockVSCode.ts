import { z } from "zod";

import { base } from "../base.js";
import { sortObject } from "../utils/sortObject.js";
import { blockDevelopmentDocs } from "./blockDevelopmentDocs.js";

export const blockVSCode = base.createBlock({
	about: {
		name: "VS Code",
	},
	addons: {
		debuggers: z
			.array(
				z.intersection(
					z.record(z.string(), z.unknown()),
					z.object({ name: z.string() }),
				),
			)
			.optional(),
		extensions: z.array(z.string()).optional(),
		settings: z.record(z.string(), z.unknown()).default({}),
		tasks: z
			.array(
				z.intersection(
					z.object({ detail: z.string() }),
					z.record(z.string(), z.unknown()),
				),
			)
			.optional(),
	},
	build({ addons, options }) {
		const { debuggers, extensions, settings, tasks } = addons;

		return {
			addons: [
				blockDevelopmentDocs({
					sections: {
						Building: {
							innerSections: options.bin
								? [
										{
											contents: `
This repository includes a [VS Code launch configuration](https://code.visualstudio.com/docs/editor/debugging) for debugging.
To debug a \`bin\` app, add a breakpoint to your code, then run _Debug Program_ from the VS Code Debug panel (or press F5).
VS Code will automatically run the \`build\` task in the background before running \`${options.bin}\`.
`,
											heading: "Built App Debugging",
										},
									]
								: [],
						},
						Testing: {
							innerSections: [
								{
									contents: `
This repository includes a [VS Code launch configuration](https://code.visualstudio.com/docs/editor/debugging) for debugging unit tests.
To launch it, open a test file, then run _Debug Current Test File_ from the VS Code Debug panel (or press F5).
`,
									heading: "Debugging Tests",
								},
							],
						},
					},
				}),
			],
			files: {
				".vscode": {
					"extensions.json":
						extensions &&
						JSON.stringify({
							recommendations: [...extensions].sort(),
						}),
					"launch.json":
						debuggers &&
						JSON.stringify({
							configurations: [...debuggers].sort((a, b) =>
								a.name.localeCompare(b.name),
							),
							version: "0.2.0",
						}),
					"settings.json": JSON.stringify(
						sortObject({
							"editor.formatOnSave": true,
							"editor.rulers": [80],
							...settings,
						}),
					),
					"tasks.json":
						tasks &&
						JSON.stringify({
							tasks: tasks.sort((a, b) => a.detail.localeCompare(b.detail)),
							version: "2.0.0",
						}),
				},
			},
		};
	},
});
