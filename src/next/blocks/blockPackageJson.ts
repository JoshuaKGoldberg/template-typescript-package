import sortPackageJson from "sort-package-json";
import { z } from "zod";

import { base } from "../base.js";

export const blockPackageJson = base.createBlock({
	about: {
		name: "Package JSON",
	},
	addons: {
		// TODO: Find a zod package for this?
		properties: z
			.intersection(
				z.object({
					dependencies: z.record(z.string(), z.string()).optional(),
					devDependencies: z.record(z.string(), z.string()).optional(),
					files: z.array(z.string()).optional(),
					peerDependencies: z.record(z.string(), z.string()).optional(),
					scripts: z.record(z.string(), z.string()).optional(),
				}),
				z.record(z.string(), z.unknown()),
			)
			.default({}),
	},
	build({ addons, options }) {
		return {
			commands: [
				{
					phase: 0, // TODO: ???
					script: "pnpm i",
				},
			],
			files: {
				"package.json": sortPackageJson(
					JSON.stringify({
						...addons.properties,
						author: { email: options.email.npm, name: options.author },
						bin: options.bin,
						dependencies: {
							...options.packageData?.dependencies,
							...addons.properties.dependencies,
						},
						description: options.description,
						devDependencies: {
							...options.packageData?.devDependencies,
							...addons.properties.devDependencies,
						},
						files: [
							options.bin?.replace(/^\.\//, ""),
							...(addons.properties.files ?? []),
							"package.json",
							"README.md",
						]
							.filter(Boolean)
							.sort(),
						keywords: options.keywords?.flatMap((keyword) =>
							keyword.split(/ /),
						),
						license: "MIT",
						main: "./lib/index.js",
						name: options.repository,
						repository: {
							type: "git",
							url: `https://github.com/${options.owner}/${options.repository}`,
						},
						scripts: {
							...options.packageData?.scripts,
							...addons.properties.scripts,
						},
						type: "module",
						version: options.version ?? "0.0.0",
					}),
				),
			},
		};
	},
});
