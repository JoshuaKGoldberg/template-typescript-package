import { base } from "../base.js";

export const blockRenovate = base.createBlock({
	about: {
		name: "Renovate",
	},
	build() {
		return {
			files: {
				".github": {
					"renovate.json": JSON.stringify({
						$schema: "https://docs.renovatebot.com/renovate-schema.json",
						automerge: true,
						extends: ["config:best-practices", "replacements:all"],
						ignoreDeps: ["codecov/codecov-action"],
						labels: ["dependencies"],
						minimumReleaseAge: "7 days",
						patch: { enabled: false },
						postUpdateOptions: ["pnpmDedupe"],
					}),
				},
			},
		};
	},
});
