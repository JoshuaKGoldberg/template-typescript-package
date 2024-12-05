// @ts-expect-error -- https://github.com/egoist/parse-package-name/issues/30
import { parse as parsePackageName } from "parse-package-name";
import { z } from "zod";

import { base } from "../base.js";
import { blockCSpell } from "./blockCSpell.js";
import { blockDevelopmentDocs } from "./blockDevelopmentDocs.js";
import { blockGitHubActionsCI } from "./blockGitHubActionsCI.js";
import { blockPackageJson } from "./blockPackageJson.js";
import { blockVSCode } from "./blockVSCode.js";
import { getPackageDependencies } from "./packageData.js";

const zRuleOptions = z.union([
	z.literal("error"),
	z.literal("off"),
	z.literal("warn"),
	z.union([
		z.tuple([z.union([z.literal("error"), z.literal("warn")]), z.unknown()]),
		z.tuple([
			z.union([z.literal("error"), z.literal("warn")]),
			z.unknown(),
			z.unknown(),
		]),
	]),
]);

const zExtensionRules = z.union([
	z.record(z.string(), zRuleOptions),
	z.array(
		z.object({
			comment: z.string().optional(),
			entries: z.record(z.string(), zRuleOptions),
		}),
	),
]);

const zExtension = z.object({
	extends: z.array(z.string()).optional(),
	files: z.array(z.string()).optional(),
	languageOptions: z.unknown().optional(),
	linterOptions: z.unknown().optional(),
	plugins: z.record(z.string(), z.string()).optional(),
	rules: zExtensionRules.optional(),
	settings: z.record(z.string(), z.unknown()).optional(),
});

const zPackageImport = z.object({
	source: z.string(),
	specifier: z.string(),
	types: z.boolean().optional(),
});

export const blockESLint = base.createBlock({
	about: {
		name: "ESLint",
	},
	addons: {
		beforeLint: z.string().optional(),
		extensions: z.array(z.union([z.string(), zExtension])).default([]),
		ignores: z.array(z.string()).default([]),
		imports: z.array(zPackageImport).default([]),
		rules: zExtensionRules.optional(),
		settings: z.record(z.string(), z.unknown()).optional(),
	},
	build({ addons, options }) {
		const { extensions, ignores, imports, rules, settings } = addons;

		const importLines = [
			'import eslint from "@eslint/js";',
			'import tseslint from "typescript-eslint";',
			...imports.map(
				(packageImport) =>
					`import ${packageImport.specifier} from "${packageImport.source}"`,
			),
		].sort((a, b) =>
			a.replace(/.+from/, "").localeCompare(b.replace(/.+from/, "")),
		);

		const ignoreLines = ["lib", "node_modules", "pnpm-lock.yaml", ...ignores]
			.map((ignore) => JSON.stringify(ignore))
			.sort();

		const extensionLines = [
			printExtension({
				extends: [
					"tseslint.configs.strictTypeChecked",
					"tseslint.configs.stylisticTypeChecked",
				],
				files: ["**/*.js", "**/*.ts"],
				languageOptions: {
					parserOptions: {
						projectService: {
							allowDefaultProject: ["*.config.*s"],
						},
						tsconfigRootDir: "import.meta.dirname",
					},
				},
				...(rules && { rules }),
				...(settings && { settings }),
			}),
			...extensions.map((extension) =>
				typeof extension === "string" ? extension : printExtension(extension),
			),
		]
			.sort((a, b) => processForSort(a).localeCompare(processForSort(b)))
			.map((t) => t);

		function processForSort(line: string) {
			if (line.startsWith("...") || /\w+/.test(line[0])) {
				return `A\n${line.replaceAll(/\W+/g, "")}`;
			}

			return `B\n${(/files: (.+)/.exec(line)?.[1] ?? line).replaceAll(/\W+/g, "")}`;
		}

		return {
			addons: [
				blockDevelopmentDocs({
					sections: {
						Linting: {
							contents: {
								after: [
									`
For example, ESLint can be run with \`--fix\` to auto-fix some lint rule complaints:

\`\`\`shell
pnpm run lint --fix
\`\`\`
`,
									...(addons.beforeLint ? [addons.beforeLint] : []),
								],
								before: `
This package includes several forms of linting to enforce consistent code quality and styling.
Each should be shown in VS Code, and can be run manually on the command-line:
`,
								items: [
									`- \`pnpm lint\` ([ESLint](https://eslint.org) with [typescript-eslint](https://typescript-eslint.io)): Lints JavaScript and TypeScript source files`,
								],
								plural: `Read the individual documentation for each linter to understand how it can be configured and used best.`,
							},
						},
					},
				}),
				blockGitHubActionsCI({
					jobs: [
						{
							name: "Lint",
							steps: [
								...(options.bin ? [{ run: "pnpm build" }] : []),
								{ run: "pnpm lint" },
							],
						},
					],
				}),
				blockPackageJson({
					properties: {
						devDependencies: getPackageDependencies(
							"@eslint/js",
							"@types/node",
							"eslint",
							"typescript-eslint",
							...imports.flatMap(({ source, types }) => {
								// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- https://github.com/egoist/parse-package-name/issues/30
								const { name } = parsePackageName(source) as { name: string };
								return types ? [name, `@types/${name}`] : [name];
							}),
						),
						scripts: {
							lint: "eslint . --max-warnings 0",
						},
					},
				}),
				blockVSCode({
					extensions: ["dbaeumer.vscode-eslint"],
					settings: {
						"editor.codeActionsOnSave": {
							"source.fixAll.eslint": "explicit",
						},
						"eslint.probe": [
							"javascript",
							"javascriptreact",
							"json",
							"jsonc",
							"markdown",
							"typescript",
							"typescriptreact",
							"yaml",
						],
						"eslint.rules.customizations": [{ rule: "*", severity: "warn" }],
					},
				}),
			],
			files: {
				"eslint.config.js": `${importLines.join("\n")}

export default tseslint.config(
	{
		ignores: [${ignoreLines.join(", ")}]
	},
	${printExtension({
		linterOptions: { reportUnusedDisableDirectives: "error" },
	})},
	eslint.configs.recommended,
	${extensionLines.join(",		")}
);`,
			},
		};
	},
});

function printExtension(extension: z.infer<typeof zExtension>) {
	return [
		"{",
		extension.extends && `extends: [${extension.extends.join(", ")}],`,
		extension.files &&
			`files: [${extension.files.map((glob) => JSON.stringify(glob)).join(", ")}],`,
		extension.languageOptions &&
			`languageOptions: ${JSON.stringify(extension.languageOptions).replace('"import.meta.dirname"', "import.meta.dirname")},`,
		extension.linterOptions &&
			`linterOptions: ${JSON.stringify(extension.linterOptions)}`,
		extension.rules && `rules: ${printExtensionRules(extension.rules)},`,
		extension.settings && `settings: ${JSON.stringify(extension.settings)},`,
		"}",
	]
		.filter(Boolean)
		.join(" ");
}

function printExtensionRules(rules: z.infer<typeof zExtensionRules>) {
	if (!Array.isArray(rules)) {
		return JSON.stringify(rules);
	}

	return [
		"{\n",
		...rules.flatMap((group, i) => [
			`${i === 0 ? "" : "\n"}${group.comment ? `// ${group.comment}\n` : ""}`,
			...Object.entries(group.entries).map(
				([ruleName, options]) =>
					`\t\t\t"${ruleName}": ${JSON.stringify(options, null, 4)},\n`,
			),
		]),
		"\t\t}\n",
	].join("");
}
