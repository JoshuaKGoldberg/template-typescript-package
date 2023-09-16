import { describe, expect, it } from "vitest";

import { getVersionFromPackageJson } from "./packageJson.js";

describe("Get version number from package.json", () => {
	it("Returns a string representing a version number when given a valid package.json URL", async () => {
		const version = await getVersionFromPackageJson();

		expect(version).toBeTypeOf("string");

		if (typeof version === "string") {
			expect(version.split(".").length).toEqual(3);
		}
	});
});