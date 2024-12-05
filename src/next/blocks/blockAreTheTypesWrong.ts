import { base } from "../base.js";
import { blockGitHubActionsCI } from "./blockGitHubActionsCI.js";

export const blockAreTheTypesWrong = base.createBlock({
	about: {
		name: "README.md",
	},
	build() {
		return {
			addons: [
				blockGitHubActionsCI({
					jobs: [
						{
							name: "Are The Types Wrong?",
							steps: [
								{
									run: "npx --yes @arethetypeswrong/cli --pack . --ignore-rules cjs-resolves-to-esm",
								},
							],
						},
					],
				}),
			],
		};
	},
});
