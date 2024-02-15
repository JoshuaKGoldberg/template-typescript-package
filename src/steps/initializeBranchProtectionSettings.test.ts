import { Octokit } from "octokit";
import { MockInstance, describe, expect, it, vi } from "vitest";

import { Options } from "../shared/types.js";
import { initializeBranchProtectionSettings } from "./initializeGitHubRepository/initializeBranchProtectionSettings.js";

const createMockOctokit = (request: MockInstance) =>
	({
		request,
	}) as unknown as Octokit;

const stubValues = {
	access: "public",
	description: "",
	directory: "",
	email: {
		github: "",
		npm: "",
	},
	mode: "create",
	owner: "",
	repository: "",
	title: "",
} satisfies Options;

describe("migrateBranchProtectionSettings", () => {
	it("does not throw when the request receives a non-error response", async () => {
		const mockRequest = vi.fn().mockResolvedValue({ status: 200 });

		await expect(
			initializeBranchProtectionSettings(
				createMockOctokit(mockRequest),
				stubValues,
			),
		).resolves.not.toThrow();

		expect(mockRequest.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "PUT /repos///branches/main/protection",
			    {
			      "allow_deletions": false,
			      "allow_force_pushes": true,
			      "allow_fork_pushes": false,
			      "allow_fork_syncing": true,
			      "block_creations": false,
			      "branch": "main",
			      "enforce_admins": false,
			      "owner": "",
			      "repo": "",
			      "required_conversation_resolution": true,
			      "required_linear_history": false,
			      "required_pull_request_reviews": null,
			      "required_status_checks": {
			        "checks": [
			          {
			            "context": "build",
			          },
			          {
			            "context": "lint",
			          },
			          {
			            "context": "prettier",
			          },
			          {
			            "context": "compliance",
			          },
			          {
			            "context": "lint_knip",
			          },
			          {
			            "context": "lint_markdown",
			          },
			          {
			            "context": "lint_packages",
			          },
			          {
			            "context": "lint_spelling",
			          },
			          {
			            "context": "test",
			          },
			        ],
			        "strict": false,
			      },
			      "restrictions": null,
			    },
			  ],
			]
		`);
	});

	it("returns false when the request receives a 403 response", async () => {
		const mockRequest = vi.fn().mockRejectedValue({ status: 403 });

		const actual = await initializeBranchProtectionSettings(
			createMockOctokit(mockRequest),
			stubValues,
		);

		expect(actual).toBe(false);
	});

	it("throws the error when the request throws with a non-403 response", async () => {
		const error = { status: 404 };
		const mockRequest = vi.fn().mockRejectedValue(error);

		await expect(() =>
			initializeBranchProtectionSettings(
				createMockOctokit(mockRequest),
				stubValues,
			),
		).rejects.toBe(error);
	});

	it("doesn't create workflows for excluded options when specified", async () => {
		const mockRequest = vi.fn().mockResolvedValue({ status: 200 });

		await initializeBranchProtectionSettings(createMockOctokit(mockRequest), {
			...stubValues,
			excludeCompliance: true,
			excludeLintKnip: true,
			excludeLintMd: true,
			excludeLintPackages: true,
			excludeLintSpelling: true,
			excludeTests: true,
		});

		expect(mockRequest.mock.calls).toMatchInlineSnapshot(`
			[
			  [
			    "PUT /repos///branches/main/protection",
			    {
			      "allow_deletions": false,
			      "allow_force_pushes": true,
			      "allow_fork_pushes": false,
			      "allow_fork_syncing": true,
			      "block_creations": false,
			      "branch": "main",
			      "enforce_admins": false,
			      "owner": "",
			      "repo": "",
			      "required_conversation_resolution": true,
			      "required_linear_history": false,
			      "required_pull_request_reviews": null,
			      "required_status_checks": {
			        "checks": [
			          {
			            "context": "build",
			          },
			          {
			            "context": "lint",
			          },
			          {
			            "context": "prettier",
			          },
			        ],
			        "strict": false,
			      },
			      "restrictions": null,
			    },
			  ],
			]
		`);
	});
});
