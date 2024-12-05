import { base } from "../base.js";
import { blockPackageJson } from "./blockPackageJson.js";
import { blockPrettier } from "./blockPrettier.js";

export const blockNvmrc = base.createBlock({
	about: {
		name: "Nvmrc",
	},
	build({ options }) {
		return {
			addons: [
				blockPrettier({
					overrides: [{ files: ".nvmrc", options: { parser: "yaml" } }],
				}),
				...(options.node
					? [
							blockPackageJson({
								properties: {
									engines: {
										node: options.node.minimum,
									},
								},
							}),
						]
					: []),
			],
			...(options.node?.pinned && {
				files: {
					".nvmrc": `${options.node.pinned}\n`,
				},
			}),
		};
	},
});
