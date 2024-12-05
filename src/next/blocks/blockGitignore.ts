import { z } from "zod";

import { formatIgnoreFile } from "../../steps/writing/creation/formatters/formatIgnoreFile.js";
import { base } from "../base.js";

export const blockGitignore = base.createBlock({
	about: {
		name: "Gitignore",
	},
	addons: {
		ignores: z.array(z.string()).default([]),
	},
	build({ addons }) {
		const { ignores } = addons;

		return {
			files: {
				".gitignore": formatIgnoreFile(["/node_modules", ...ignores].sort()),
			},
		};
	},
});
