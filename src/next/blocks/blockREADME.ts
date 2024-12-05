import { z } from "zod";

import { base } from "../base.js";

export const blockREADME = base.createBlock({
	about: {
		name: "README.md",
	},
	addons: {
		notices: z.array(z.string()).default([]),
	},
	build({ addons, options }) {
		const { notices } = addons;

		return {
			files: {
				"README.md": `<h1 align="center">${options.title}</h1>

<p align="center">${options.description}</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<!-- prettier-ignore-end -->
	<a href="https://github.com/${options.owner}/${options.repository}/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://codecov.io/gh/${options.owner}/${options.repository}" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/${options.owner}/${options.repository}?label=%F0%9F%A7%AA%20coverage" /></a>
	<a href="https://github.com/${options.owner}/${options.repository}/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
	<a href="http://npmjs.com/package/${options.repository}"><img alt="📦 npm version" src="https://img.shields.io/npm/v/${options.repository}?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

${options.logo ? `<img align="right" alt="${options.logo.alt}" src="${options.logo.src}">` : ""}

## Usage

\`\`\`shell
npm i ${options.repository}
\`\`\`
\`\`\`ts
import { greet } from "${options.repository}";

greet("Hello, world! 💖");
\`\`\`

## Development

See [\`.github/CONTRIBUTING.md\`](./.github/CONTRIBUTING.md), then [\`.github/DEVELOPMENT.md\`](./.github/DEVELOPMENT.md).
Thanks! 💖

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->
${notices.length ? `\n${notices.map((notice) => notice.trim()).join("\n\n")}` : ""}`,
			},
		};
	},
});
