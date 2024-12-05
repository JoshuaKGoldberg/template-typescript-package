import { base } from "../base.js";
import { blockPrettier } from "./blockPrettier.js";

export const blockPrettierPluginSh = base.createBlock({
	about: {
		name: "Prettier Plugin Sh",
	},
	build() {
		return {
			addons: [
				blockPrettier({
					plugins: ["prettier-plugin-sh"],
				}),
			],
		};
	},
});
