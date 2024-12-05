import { $ } from "execa";

import { readPackageData, removeDependencies } from "../shared/packages.js";

export async function uninstallPackages(offline: boolean | undefined) {
	const packageData = await readPackageData();

	await removeDependencies(
		[
			"@clack/prompts",
			"all-contributors-for-repository",
			"chalk",
			"cspell-lib",
			"execa",
			"get-github-auth-token",
			"git-remote-origin-url",
			"git-url-parse",
			"js-yaml",
			"lazy-value",
			"npm-user",
			"octokit",
			"parse-author",
			"prettier",
			"replace-in-file",
			"rimraf",
			"sort-package-json",
			"title-case",
			"zod",
			"zod-validation-error",
		],
		packageData.dependencies,
	);

	await removeDependencies(
		[
			"@octokit/request-error",
			"@types/git-url-parse",
			"@types/js-yaml",
			"@types/parse-author",
			"all-contributors-cli",
			"c8",
			"eslint-config-prettier",
			"globby",
			"tsx",
		],
		packageData.devDependencies,
		"-D",
	);

	await $`pnpm add prettier -D${offline ? " --offline" : ""}`;
}
