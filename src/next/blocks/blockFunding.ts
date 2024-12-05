import { formatYaml } from "../../steps/writing/creation/formatters/formatYaml.js";
import { base } from "../base.js";

export const blockFunding = base.createBlock({
	about: {
		name: "Funding",
	},
	build({ options }) {
		return {
			files: {
				".github": {
					"FUNDING.yml":
						options.funding && formatYaml({ github: options.funding }),
				},
			},
		};
	},
});
