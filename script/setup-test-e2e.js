/* global $ */

import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";

const description = "New Description Test";
const owner = "NewOwnerTest";
const title = "New Title Test";
const repository = "new-repository-test";

const result =
	await $`pnpm run setup --description ${description} --owner ${owner} --title ${title} --repository ${repository} --skip-api`;
console.log("Result from pnpm run setup:", result);

const newPackageJson = JSON.parse(
	(await readFile("./package.json")).toString()
);
console.log("New package JSON:", newPackageJson);

assert.equal(newPackageJson.description, description);
assert.equal(newPackageJson.name, repository);

for (const search of [
	`/JoshuaKGoldberg/`,
	"template-typescript-node-package",
]) {
	const grepResult =
		await $`grep --exclude script/setup.js --exclude script/setup-test-e2e.js --exclude-dir node_modules -i ${search} *.* **/*.*`;
	assert.equal(
		grepResult.stdout.trim(),
		`README.md:> 💙 This package is based on [@JoshuaKGoldberg](https://github.com/JoshuaKGoldberg)'s [template-typescript-node-package](https://github.com/JoshuaKGoldberg/template-typescript-node-package).`
	);
}

try {
	await $`pnpm lint:knip`;
} catch (error) {
	console.error("Error running lint:knip:", error);
	process.exitCode = 1;
}
