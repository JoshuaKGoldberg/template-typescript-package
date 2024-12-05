import { CreatedFileEntry } from "create";
import { Document, spellCheckDocument } from "cspell-lib";
import path from "node:path";
import { z } from "zod";

import { base } from "../base.js";
import { blockDevelopmentDocs } from "./blockDevelopmentDocs.js";
import { blockGitHubActionsCI } from "./blockGitHubActionsCI.js";
import { blockPackageJson } from "./blockPackageJson.js";
import { blockVSCode } from "./blockVSCode.js";
import { getPackageDependencies } from "./packageData.js";

function createCSpellSettings(ignores: string[], words: string[]) {
	return {
		dictionaries: ["npm", "node", "typescript"],
		ignorePaths: [
			".github",
			"CHANGELOG.md",
			"lib",
			"node_modules",
			"pnpm-lock.yaml",
			...ignores,
		].sort(),
		...(words.length && { words: words.sort() }),
	};
}

export const blockCSpell = base.createBlock({
	about: {
		name: "CSpell",
	},
	addons: {
		ignorePaths: z.array(z.string()).default([]),
		words: z.array(z.string()).default([]),
	},
	build({ addons }) {
		const { ignorePaths, words } = addons;

		return {
			addons: [
				blockDevelopmentDocs({
					sections: {
						Linting: {
							contents: {
								items: [
									`- \`pnpm lint:spelling\` ([cspell](https://cspell.org)): Spell checks across all source files`,
								],
							},
						},
					},
				}),
				blockVSCode({
					extensions: ["streetsidesoftware.code-spell-checker"],
				}),
				blockGitHubActionsCI({
					jobs: [
						{
							name: "Lint Spelling",
							steps: [{ run: "pnpm lint:spelling" }],
						},
					],
				}),
				blockPackageJson({
					properties: {
						scripts: {
							"lint:spelling": 'cspell "**" ".github/**/*"',
						},
					},
				}),
			],
			files: {
				"cspell.json": JSON.stringify(createCSpellSettings(ignorePaths, words)),
			},
			package: {
				devDependencies: getPackageDependencies("cspell"),
				scripts: {
					"lint:spelling": 'cspell "**" ".github/**/*"',
				},
			},
		};
	},
	// Unhappy note from Josh (December 2024): this is kludge. I don't like it.
	// CSpell can theoretically pick up on words in Addons from other Blocks.
	// But if those Addons are only conditionally added, then blockCSpell won't
	// have any way of knowing to add to ignorePaths/words.
	// BUT we don't need this (yet?), because cspell ignores dotfiles by default.
	// Phew.
	async finalize({ addons, created }) {
		const { ignorePaths: ignores, words } = addons;
		const allDocuments = filesToCSpellDocuments(created.files);
		const cspellSettings = createCSpellSettings(ignores, words);
		const relevantDocuments = allDocuments.filter(
			(document) =>
				!document.uri.startsWith(".") &&
				!cspellSettings.ignorePaths.some((ignore) =>
					document.uri.startsWith(ignore),
				),
		);
		const spellCheckResults = await Promise.all(
			relevantDocuments.map((document) =>
				spellCheckDocument(document, { noConfigSearch: true }, cspellSettings),
			),
		);
		const unknownWords = spellCheckResults.flatMap((result) =>
			result.issues
				.filter((issue) => !issue.isFound)
				.map((issue) => issue.text),
		);
		return {
			files: {
				"cspell.json": JSON.stringify(
					createCSpellSettings(
						ignores,
						Array.from(new Set([...unknownWords, ...words])),
					),
				),
			},
		};
	},
});

function filesToCSpellDocuments(files: CreatedFileEntry, directory = "") {
	const documents: Document[] = [];
	const entries = Object.entries(files) as [string, CreatedFileEntry][];

	for (const [key, value] of entries) {
		const uri = path.join(directory, key);

		if (typeof value === "string") {
			documents.push({
				text: value,
				uri,
			});
		} else if (typeof value === "object") {
			documents.push(...filesToCSpellDocuments(value, uri));
		}
	}

	return documents;
}
