import { testBlock } from "create-testers";
import { describe, expect, it } from "vitest";

import { blockAllContributors } from "./blockAllContributors.js";
import { optionsBase } from "./options.fakes.js";

describe("blockAllContributors", () => {
	it("defaults contributors to [] when not provided", () => {
		const creation = testBlock(blockAllContributors, { options: optionsBase });

		expect(creation).toMatchInlineSnapshot(`
			{
			  "addons": [
			    {
			      "addons": {
			        "sections": undefined,
			      },
			      "block": [Function],
			    },
			    {
			      "addons": {
			        "secrets": [
			          {
			            "description": "a GitHub PAT with repo and workflow permissions",
			            "name": "ACCESS_TOKEN",
			          },
			        ],
			      },
			      "block": [Function],
			    },
			  ],
			  "files": {
			    ".all-contributorsrc": "{"badgeTemplate":"\\t<a href=\\"#contributors\\" target=\\"_blank\\"><img alt=\\"👪 All Contributors: <%= contributors.length %>\\" src=\\"https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-<%= contributors.length %>-21bb42.svg\\" /></a>","contributors":[],"contributorsSortAlphabetically":true,"projectName":"test-repository","projectOwner":"test-owner"}",
			    ".github": {
			      "workflows": {
			        "contributors.yml": "jobs:
			  contributors:
			    runs-on: ubuntu-latest
			    steps:
			      - uses: actions/checkout@v4
			        with:
			          fetch-depth: 0
			      - uses: ./.github/actions/prepare
			      - env:
			          GITHUB_TOKEN: \${{ secrets.ACCESS_TOKEN }}
			        uses: JoshuaKGoldberg/all-contributors-auto-action@v0.5.0

			name: Contributors

			on:
			  push:
			    branches:
			      - main
			",
			      },
			    },
			  },
			  "scripts": [
			    {
			      "commands": [
			        "pnpx all-contributors-cli add test-owner code,content,doc,ideas,infra,maintenance,projectManagement,tool",
			      ],
			      "phase": 3,
			    },
			  ],
			}
		`);
	});

	it("includes contributors when provided", () => {
		const creation = testBlock(blockAllContributors, {
			options: {
				...optionsBase,
				contributors: [
					{
						avatar_url: "https://avatars.githubusercontent.com/u/3335181?v=4",
						contributions: ["bug", "ideas"],
						login: "JoshuaKGoldberg",
						name: "Josh Goldberg",
						profile: "http://www.joshuakgoldberg.com",
					},
				],
			},
		});

		expect(creation).toMatchInlineSnapshot(`
			{
			  "addons": [
			    {
			      "addons": {
			        "sections": [
			          "## Contributors

			<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
			<!-- prettier-ignore-start -->
			<!-- markdownlint-disable -->
			<table>
			  <tbody>
			    <tr>
			      <td align="center" valign="top" width="14.28%"><a href="http://www.joshuakgoldberg.com"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg"/><br /><sub><b>Josh Goldberg</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/create-typescript-app/issues?q=author%3AJoshuaKGoldberg" title="Bug reports">🐛</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a></td>
			    </tr>
			  </tbody>
			</table>

			<!-- markdownlint-restore -->
			<!-- prettier-ignore-end -->

			<!-- ALL-CONTRIBUTORS-LIST:END -->",
			        ],
			      },
			      "block": [Function],
			    },
			    {
			      "addons": {
			        "secrets": [
			          {
			            "description": "a GitHub PAT with repo and workflow permissions",
			            "name": "ACCESS_TOKEN",
			          },
			        ],
			      },
			      "block": [Function],
			    },
			  ],
			  "files": {
			    ".all-contributorsrc": "{"badgeTemplate":"\\t<a href=\\"#contributors\\" target=\\"_blank\\"><img alt=\\"👪 All Contributors: <%= contributors.length %>\\" src=\\"https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-<%= contributors.length %>-21bb42.svg\\" /></a>","contributors":[{"avatar_url":"https://avatars.githubusercontent.com/u/3335181?v=4","contributions":["bug","ideas"],"login":"JoshuaKGoldberg","name":"Josh Goldberg","profile":"http://www.joshuakgoldberg.com"}],"contributorsSortAlphabetically":true,"projectName":"test-repository","projectOwner":"test-owner"}",
			    ".github": {
			      "workflows": {
			        "contributors.yml": "jobs:
			  contributors:
			    runs-on: ubuntu-latest
			    steps:
			      - uses: actions/checkout@v4
			        with:
			          fetch-depth: 0
			      - uses: ./.github/actions/prepare
			      - env:
			          GITHUB_TOKEN: \${{ secrets.ACCESS_TOKEN }}
			        uses: JoshuaKGoldberg/all-contributors-auto-action@v0.5.0

			name: Contributors

			on:
			  push:
			    branches:
			      - main
			",
			      },
			    },
			  },
			  "scripts": [
			    {
			      "commands": [
			        "pnpx all-contributors-cli add test-owner code,content,doc,ideas,infra,maintenance,projectManagement,tool",
			      ],
			      "phase": 3,
			    },
			  ],
			}
		`);
	});
});
