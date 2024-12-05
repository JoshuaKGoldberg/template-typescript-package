import jsYaml from "js-yaml";
import { z } from "zod";

import { createMultiWorkflowFile } from "../../steps/writing/creation/dotGitHub/createMultiWorkflowFile.js";
import { createSoloWorkflowFile } from "../../steps/writing/creation/dotGitHub/createSoloWorkflowFile.js";
import { base } from "../base.js";

export const blockGitHubActionsCI = base.createBlock({
	about: {
		name: "GitHub Actions CI",
	},
	addons: {
		jobs: z
			.array(
				z.object({
					name: z.string(),
					steps: z.array(
						z.intersection(
							z.object({
								if: z.string().optional(),
								with: z.record(z.string(), z.string()).optional(),
							}),
							z.union([
								z.object({ run: z.string() }),
								z.object({ uses: z.string() }),
							]),
						),
					),
				}),
			)
			.optional(),
	},
	build({ addons }) {
		const { jobs } = addons;

		return {
			files: {
				".github": {
					actions: {
						prepare: {
							"action.yml": jsYaml
								.dump({
									description: "Prepares the repo for a typical CI job",
									name: "Prepare",
									runs: {
										steps: [
											{
												uses: "pnpm/action-setup@v4",
												with: { version: 9 },
											},
											{
												uses: "actions/setup-node@v4",
												with: { cache: "pnpm", "node-version": "20" },
											},
											{
												run: "pnpm install --frozen-lockfile",
												shell: "bash",
											},
										],
										using: "composite",
									},
								})
								.replaceAll(/\n(\S)/g, "\n\n$1"),
						},
					},
					workflows: {
						"accessibility-alt-text-bot.yml": createSoloWorkflowFile({
							if: "${{ !endsWith(github.actor, '[bot]') }}",
							name: "Accessibility Alt Text Bot",
							on: {
								issue_comment: {
									types: ["created", "edited"],
								},
								issues: {
									types: ["edited", "opened"],
								},
								pull_request: {
									types: ["edited", "opened"],
								},
							},
							permissions: {
								issues: "write",
								"pull-requests": "write",
							},
							steps: [
								{
									uses: "github/accessibility-alt-text-bot@v1.4.0",
								},
							],
						}),
						"ci.yml":
							jobs &&
							createMultiWorkflowFile({
								jobs: jobs.sort((a, b) => a.name.localeCompare(b.name)),
								name: "CI",
							}),
						"pr-review-requested.yml": createSoloWorkflowFile({
							name: "PR Review Requested",
							on: {
								pull_request_target: {
									types: ["review_requested"],
								},
							},
							permissions: {
								"pull-requests": "write",
							},
							steps: [
								{
									uses: "actions-ecosystem/action-remove-labels@v1",
									with: {
										labels: "status: waiting for author",
									},
								},
								{
									if: "failure()",
									run: 'echo "Don\'t worry if the previous step failed."\necho "See https://github.com/actions-ecosystem/action-remove-labels/issues/221."\n',
								},
							],
						}),
					},
				},
			},
		};
	},
});
