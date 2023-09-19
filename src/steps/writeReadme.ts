import fs from "node:fs/promises";

import { readFileSafe } from "../shared/readFileSafe.js";
import { Options } from "../shared/types.js";
import { findExistingBadges } from "./findExistingBadges.js";
import { generateTopContent } from "./generateTopContent.js";
import { endOfReadmeNotice } from "./updateReadme.js";

const contributorsIndicator = `<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->`;

function generateAllContributorsContent(options: Options) {
	return [
		`## Contributors`,
		``,
		`<!-- spellchecker: disable -->`,
		contributorsIndicator,
		`<!-- prettier-ignore-start -->`,
		!options.excludeLintMd && `<!-- markdownlint-disable -->`,
		`<table>`,
		`<!-- (this will be filled in by all-contributors) -->`,
		`</table>`,
		``,
		!options.excludeLintMd && `<!-- markdownlint-restore -->`,
		`<!-- prettier-ignore-end -->`,
		``,
		`<!-- ALL-CONTRIBUTORS-LIST:END -->`,
		`<!-- spellchecker: enable -->`,
	]
		.filter(Boolean)
		.join("\n");
}

export async function writeReadme(options: Options) {
	const allContributorsContent =
		!options.excludeContributors && generateAllContributorsContent(options);
	let contents = await readFileSafe("README.md", "");
	if (!contents) {
		await fs.writeFile(
			"README.md",
			[
				generateTopContent(options, []),
				allContributorsContent,
				endOfReadmeNotice,
			]
				.filter(Boolean)
				.join("\n\n"),
		);
		return;
	}

	const endOfH1 = findH1Close(contents);

	contents = [
		generateTopContent(options, findExistingBadges(contents)),
		contents.slice(endOfH1),
	]
		.join("")
		.replace(/\[!\[.+\]\(.+\)\]\(.+\)/g, "")
		.replace(/!\[.+\]\(.+\)/g, "")
		.replaceAll("\r", "")
		.replaceAll("\n\n\n", "\n\n");

	if (allContributorsContent && !contents.includes(contributorsIndicator)) {
		contents = [contents, allContributorsContent].join("\n\n");
	}

	if (!contents.includes(endOfReadmeNotice)) {
		contents = [contents, endOfReadmeNotice].join("\n\n");
	}

	await fs.writeFile("README.md", contents);
}

function findH1Close(contents: string) {
	const markdownMatch = contents.match(/^#.+/);
	if (markdownMatch) {
		return (markdownMatch.index ?? 0) + markdownMatch[0].length;
	}

	return contents.indexOf("</h1>") + "</h1>".length;
}
