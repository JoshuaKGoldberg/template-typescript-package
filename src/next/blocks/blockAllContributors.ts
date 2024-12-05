import { createSoloWorkflowFile } from "../../steps/writing/creation/dotGitHub/createSoloWorkflowFile.js";
import { base } from "../base.js";
import { blockCSpell } from "./blockCSpell.js";
import { blockPrettier } from "./blockPrettier.js";

export const blockAllContributors = base.createBlock({
	about: {
		name: "AllContributors",
	},
	build({ options }) {
		return {
			addons: [
				blockCSpell({
					ignorePaths: [".all-contributorsrc"],
				}),
				blockPrettier({
					ignores: ["/.all-contributorsrc"],
				}),
			],
			commands:
				options.login === "JoshuaKGoldberg"
					? [`npx -y all-contributors-cli add JoshuaKGoldberg tool`]
					: undefined,
			files: {
				".all-contributorsrc": JSON.stringify({
					badgeTemplate:
						'	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: <%= contributors.length %>" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-<%= contributors.length %>-21bb42.svg" /></a>',
					commit: false,
					commitConvention: "angular",
					commitType: "docs",
					contributors: options.contributors ?? [],
					contributorsPerLine: 7,
					contributorsSortAlphabetically: true,
					files: ["README.md"],
					imageSize: 100,
					projectName: options.repository,
					projectOwner: options.owner,
					repoHost: "https://github.com",
					repoType: "github",
				}),
				".github": {
					workflows: {
						"contributors.yml": createSoloWorkflowFile({
							name: "Contributors",
							on: {
								push: {
									branches: ["main"],
								},
							},
							steps: [
								{ uses: "actions/checkout@v4", with: { "fetch-depth": 0 } },
								{ uses: "./.github/actions/prepare" },
								{
									env: { GITHUB_TOKEN: "${{ secrets.ACCESS_TOKEN }}" },
									uses: `JoshuaKGoldberg/all-contributors-auto-action@v0.5.0`,
								},
							],
						}),
					},
				},
			},
		};
	},
});
