import { base } from "../base.js";

export const blockGitHubPRTemplate = base.createBlock({
	about: {
		name: "GitHub Issue Templates",
	},
	build({ options }) {
		return {
			files: {
				".github": {
					"PULL_REQUEST_TEMPLATE.md": `<!-- 👋 Hi, thanks for sending a PR to ${options.repository}! 💖.
Please fill out all fields below and make sure each item is true and [x] checked.
Otherwise we may not be able to review your PR. -->

## PR Checklist

- [ ] Addresses an existing open issue: fixes #000
- [ ] That issue was marked as [\`status: accepting prs\`](https://github.com/${options.owner}/${options.repository}/issues?q=is%3Aopen+is%3Aissue+label%3A%22status%3A+accepting+prs%22)
- [ ] Steps in [CONTRIBUTING.md](https://github.com/${options.owner}/${options.repository}/blob/main/.github/CONTRIBUTING.md) were taken

## Overview

<!-- Description of what is changed and how the code change does that. -->
`,
				},
			},
		};
	},
});
