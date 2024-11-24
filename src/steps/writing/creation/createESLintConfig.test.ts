import { describe, expect, it } from "vitest";

import { Options } from "../../../shared/types.js";
import { createESLintConfig } from "./createESLintConfig.js";

function fakeOptions(getExcludeValue: (exclusionName: string) => boolean) {
	return {
		access: "public",
		author: "TestAuthor",
		base: "everything",
		description: "Test description.",
		directory: ".",
		email: {
			github: "github@email.com",
			npm: "npm@email.com",
		},
		...Object.fromEntries(
			[
				"excludeCompliance",
				"excludeAllContributors",
				"excludeLintESLint",
				"excludeLintJSDoc",
				"excludeLintJson",
				"excludeLintKnip",
				"excludeLintMd",
				"excludeLintPackageJson",
				"excludeLintPackages",
				"excludeLintPerfectionist",
				"excludeLintRegex",
				"excludeLintSpelling",
				"excludeLintStrict",
				"excludeLintStylistic",
				"excludeLintYml",
				"excludeReleases",
				"excludeRenovate",
				"excludeTests",
			].map((key) => [key, getExcludeValue(key)]),
		),
		mode: "create",
		owner: "TestOwner",
		repository: "test-repository",
		skipGitHubApi: true,
		skipInstall: true,
		skipRemoval: true,
		title: "Test Title",
	} satisfies Options;
}

describe("createESLintConfig", () => {
	it("creates a minimal config when all exclusions are enabled", async () => {
		expect(await createESLintConfig(fakeOptions(() => true)))
			.toMatchInlineSnapshot(`
				"import eslint from "@eslint/js";
				import n from "eslint-plugin-n";
				import tseslint from "typescript-eslint";

				export default tseslint.config(
					{
						ignores: ["**/*.snap", "lib", "node_modules", "pnpm-lock.yaml"],
					},
					{
						linterOptions: {
							reportUnusedDisableDirectives: "error",
						},
					},
					eslint.configs.recommended,
					n.configs["flat/recommended"],
					{
						extends: tseslint.configs.recommendedTypeChecked,
						files: ["**/*.js", "**/*.ts"],
						languageOptions: {
							parserOptions: {
								projectService: { allowDefaultProject: ["*.config.*s"] },
							},
						},
						rules: {
							// These on-by-default rules work well for this repo if configured.
						},
					},
					{
						files: ["*.jsonc"],
						rules: {
							"jsonc/comma-dangle": "off",
							"jsonc/no-comments": "off",
							"jsonc/sort-keys": "error",
						},
					},
					{
						extends: [tseslint.configs.disableTypeChecked],
						files: ["**/*.md/*.ts"],
					},
				);
				"
			`);
	});

	it("creates a full config when all exclusions are disabled", async () => {
		expect(await createESLintConfig(fakeOptions(() => false)))
			.toMatchInlineSnapshot(`
				"import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
				import eslint from "@eslint/js";
				import vitest from "@vitest/eslint-plugin";
				import jsdoc from "eslint-plugin-jsdoc";
				import jsonc from "eslint-plugin-jsonc";
				import markdown from "eslint-plugin-markdown";
				import n from "eslint-plugin-n";
				import packageJson from "eslint-plugin-package-json/configs/recommended";
				import perfectionist from "eslint-plugin-perfectionist";
				import * as regexp from "eslint-plugin-regexp";
				import yml from "eslint-plugin-yml";
				import tseslint from "typescript-eslint";

				export default tseslint.config(
					{
						ignores: ["**/*.snap", "coverage", "lib", "node_modules", "pnpm-lock.yaml"],
					},
					{
						linterOptions: {
							reportUnusedDisableDirectives: "error",
						},
					},
					eslint.configs.recommended,
					...jsonc.configs["flat/recommended-with-json"],
					...markdown.configs.recommended,
					...yml.configs["flat/recommended"],
					...yml.configs["flat/prettier"],
					comments.recommended,
					jsdoc.configs["flat/contents-typescript-error"],
					jsdoc.configs["flat/logical-typescript-error"],
					jsdoc.configs["flat/stylistic-typescript-error"],
					n.configs["flat/recommended"],
					packageJson,
					perfectionist.configs["recommended-natural"],
					regexp.configs["flat/recommended"],
					{
						extends: [
							...tseslint.configs.strictTypeChecked,
							...tseslint.configs.stylisticTypeChecked,
						],
						files: ["**/*.js", "**/*.ts"],
						languageOptions: {
							parserOptions: {
								projectService: { allowDefaultProject: ["*.config.*s"] },
							},
						},
						rules: {
							// These off-by-default rules work well for this repo and we like them on.
							"logical-assignment-operators": [
								"error",
								"always",
								{
									enforceForIfStatements: true,
								},
							],
							"operator-assignment": "error",

							// These on-by-default rules don't work well for this repo and we like them off.
							"jsdoc/lines-before-block": "off",

							// These on-by-default rules work well for this repo if configured.
							"perfectionist/sort-objects": [
								"error",
								{
									order: "asc",
									partitionByComment: true,
									type: "natural",
								},
							],

							// Stylistic concerns that don't interfere with Prettier
							"no-useless-rename": "error",
							"object-shorthand": "error",
						},
					},
					{
						files: ["*.jsonc"],
						rules: {
							"jsonc/comma-dangle": "off",
							"jsonc/no-comments": "off",
							"jsonc/sort-keys": "error",
						},
					},
					{
						extends: [tseslint.configs.disableTypeChecked],
						files: ["**/*.md/*.ts"],
					},
					{
						extends: [vitest.configs.recommended],
						files: ["**/*.test.*"],
						rules: {
							"@typescript-eslint/no-unsafe-assignment": "off",
							"@typescript-eslint/no-unsafe-call": "off",
						},
					},
					{
						files: ["**/*.{yml,yaml}"],
						rules: {
							"yml/file-extension": ["error", { extension: "yml" }],
							"yml/sort-keys": [
								"error",
								{ order: { type: "asc" }, pathPattern: "^.*$" },
							],
							"yml/sort-sequence-values": [
								"error",
								{ order: { type: "asc" }, pathPattern: "^.*$" },
							],
						},
					},
				);
				"
			`);
	});
});
