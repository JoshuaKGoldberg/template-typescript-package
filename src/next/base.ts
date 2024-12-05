import { BaseOptionsFor, createBase } from "create";
import { execaCommand } from "execa";
import gitRemoteOriginUrl from "git-remote-origin-url";
import gitUrlParse from "git-url-parse";
import lazyValue from "lazy-value";
import npmUser from "npm-user";
import { z } from "zod";

import { parsePackageAuthor } from "../shared/options/createOptionDefaults/parsePackageAuthor.js";
import { readDefaultsFromReadme } from "../shared/options/createOptionDefaults/readDefaultsFromReadme.js";
import { readEmails } from "../shared/options/createOptionDefaults/readEmails.js";
import { readFunding } from "../shared/options/createOptionDefaults/readFunding.js";
import { readGuide } from "../shared/options/createOptionDefaults/readGuide.js";
import { readPackageData } from "../shared/packages.js";
import { tryCatchLazyValueAsync } from "../shared/tryCatchLazyValueAsync.js";
import { AllContributorsData } from "../shared/types.js";
import { inputJSONFile } from "./inputs/inputJSONFile.js";
import { inputTextFile } from "./inputs/inputTextFile.js";

export const base = createBase({
	options: {
		access: z.union([z.literal("public"), z.literal("restricted")]).optional(),
		author: z.string().optional(),
		bin: z.string().optional(),
		contributors: z
			.array(
				z.object({
					avatar_url: z.string(),
					contributions: z.array(z.string()),
					login: z.string(),
					name: z.string(),
					profile: z.string(),
				}),
			)
			.optional(),
		description: z.string(),
		documentation: z.string().optional(),
		email: z
			.union([
				z.string(),
				z.object({
					github: z.string(),
					npm: z.string(),
				}),
			])
			.transform((email) =>
				typeof email === "string" ? { github: email, npm: email } : email,
			),
		funding: z.string().optional(),
		guide: z
			.object({
				href: z.string(),
				title: z.string(),
			})
			.optional(),
		hideTemplatedBy: z.boolean().optional(),
		keywords: z.array(z.string()).optional(),
		login: z.string().optional(),
		logo: z
			.object({
				alt: z.string(),
				src: z.string(),
			})
			.optional(),
		node: z
			.object({
				minimum: z.string(),
				pinned: z.string().optional(),
			})
			.optional(),
		owner: z.string(),
		packageData: z
			.object({
				dependencies: z.record(z.string(), z.string()).optional(),
				devDependencies: z.record(z.string(), z.string()).optional(),
				scripts: z.record(z.string(), z.string()).optional(),
			})
			.optional(),
		preserveGeneratedFrom: z.boolean().optional(),
		repository: z.string(),
		title: z.string(),
		version: z.string().optional(),
	},
	read({ options, take }) {
		const allContributors = lazyValue(async () => {
			const contributions = (await take(inputJSONFile, {
				filePath: ".all-contributorsrc",
			})) as AllContributorsData | undefined;

			return contributions?.contributors;
		});

		const documentation = lazyValue(
			async () =>
				await take(inputTextFile, {
					filePath: ".github/DEVELOPMENT.md",
				}),
		);

		const nvmrc = lazyValue(
			async () =>
				await take(inputTextFile, {
					filePath: ".nvmrc",
				}),
		);

		// TODO: Make these all use take

		const gitDefaults = tryCatchLazyValueAsync(async () =>
			gitUrlParse(await gitRemoteOriginUrl()),
		);

		const npmDefaults = tryCatchLazyValueAsync(async () => {
			const whoami = (await execaCommand(`npm whoami`)).stdout;
			return whoami ? await npmUser(whoami) : undefined;
		});

		const packageData = lazyValue(readPackageData);
		const packageAuthor = lazyValue(async () =>
			parsePackageAuthor(await packageData()),
		);

		const author = lazyValue(async () =>
			(
				(await packageAuthor()).author ??
				(await npmDefaults())?.name ??
				options.owner
			)?.toLowerCase(),
		);

		const version = lazyValue(async () => (await packageData()).version);

		return {
			author,
			bin: async () => (await packageData()).bin,
			contributors: allContributors,
			description: async () => (await packageData()).description,
			documentation,
			email: async () => readEmails(npmDefaults, packageAuthor),
			funding: readFunding,
			guide: readGuide,
			login: author,
			node: async () => ({
				minimum: (await packageData()).engines?.node ?? "18.3.0",
				pinned: (await nvmrc()) ?? "20.18.0",
			}),
			owner: async () =>
				(await gitDefaults())?.organization ?? (await packageAuthor()).author,
			packageData: async () => {
				const original = await packageData();

				return {
					dependencies: original.dependencies,
					devDependencies: original.devDependencies,
					scripts: original.scripts,
				};
			},
			repository: async () =>
				options.repository ??
				(await gitDefaults())?.name ??
				(await packageData()).name,
			...readDefaultsFromReadme(),
			version,
		};
	},
});

export type BaseOptions = BaseOptionsFor<typeof base>;
