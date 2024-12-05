import { base } from "../base.js";
import { blockPrettier } from "./blockPrettier.js";

export const blockPrettierPluginCurly = base.createBlock({
	about: {
		name: "Prettier Plugin Curly",
	},
	build() {
		return {
			addons: [
				blockPrettier({
					plugins: ["prettier-plugin-curly"],
				}),
			],
		};
	},
});
