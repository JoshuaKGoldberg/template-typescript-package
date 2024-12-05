import { z } from "zod";

import { base } from "../base.js";
import { blockCSpell } from "./blockCSpell.js";
import { blockREADME } from "./blockREADME.js";

export const blockTemplatedBy = base.createBlock({
	about: {
		name: "Templated By Notice",
	},
	addons: {
		notices: z.array(z.string()).default([]),
	},
	build() {
		return {
			addons: [
				blockREADME({
					notices: [
						`
<!-- You can remove this notice if you don't want it 🙂 no worries! -->

> 💙 This package was templated with [\`create-typescript-app\`](https://github.com/JoshuaKGoldberg/create-typescript-app).
`,
					],
				}),
			],
		};
	},
});
