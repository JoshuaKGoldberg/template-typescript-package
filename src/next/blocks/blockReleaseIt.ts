import { createSoloWorkflowFile } from "../../steps/writing/creation/dotGitHub/createSoloWorkflowFile.js";
import { base } from "../base.js";
import { blockCSpell } from "./blockCSpell.js";
import { blockPackageJson } from "./blockPackageJson.js";

export const blockReleaseIt = base.createBlock({
	about: {
		name: "release-it",
	},
	build({ options }) {
		return {
			addons: [
				blockPackageJson({
					properties: {
						publishConfig: {
							provenance: true,
						},
					},
				}),
			],
			files: {
				".github": {
					workflows: {
						"post-release.yml": createSoloWorkflowFile({
							name: "Post Release",
							on: {
								release: {
									types: ["published"],
								},
							},
							steps: [
								{ uses: "actions/checkout@v4", with: { "fetch-depth": 0 } },
								{
									run: `echo "npm_version=$(npm pkg get version | tr -d '"')" >> "$GITHUB_ENV"`,
								},
								{
									uses: "apexskier/github-release-commenter@v1",
									with: {
										"comment-template": `
							:tada: This is included in version {release_link} :tada:

							The release is available on:

							* [GitHub releases](https://github.com/${options.owner}/${options.repository}/releases/tag/{release_tag})
							* [npm package (@latest dist-tag)](https://www.npmjs.com/package/${options.repository}/v/\${{ env.npm_version }})

							Cheers! 📦🚀
						`,
										GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
									},
								},
							],
						}),
						"release.yml": createSoloWorkflowFile({
							concurrency: {
								group: "${{ github.workflow }}",
							},
							name: "Release",
							on: {
								push: {
									branches: ["main"],
								},
							},
							permissions: {
								contents: "write",
								"id-token": "write",
							},
							steps: [
								{
									uses: "actions/checkout@v4",
									with: {
										"fetch-depth": 0,
										ref: "main",
									},
								},
								{
									uses: "./.github/actions/prepare",
								},
								{
									run: "pnpm build",
								},
								{
									env: {
										GITHUB_TOKEN: "${{ secrets.ACCESS_TOKEN }}",
										NPM_TOKEN: "${{ secrets.NPM_TOKEN }}",
									},
									uses: "JoshuaKGoldberg/release-it-action@v0.2.2",
								},
							],
						}),
					},
				},
				".release-it.json": JSON.stringify({
					git: {
						commitMessage: "chore: release v${version}",
						requireCommits: true,
					},
					github: {
						autoGenerate: true,
						release: true,
						releaseName: "v${version}",
					},
					npm: {
						publishArgs: [`--access ${options.access}`, "--provenance"],
					},
					plugins: {
						"@release-it/conventional-changelog": {
							infile: "CHANGELOG.md",
							preset: "angular",
						},
					},
				}),
			},
		};
	},
});
