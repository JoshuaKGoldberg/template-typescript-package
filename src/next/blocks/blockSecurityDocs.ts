import { base } from "../base.js";

export const blockSecurityDocs = base.createBlock({
	about: {
		name: "Security Docs",
	},
	build({ options }) {
		return {
			files: {
				".github": {
					"SECURITY.md": `# Security Policy

We take all security vulnerabilities seriously.
If you have a vulnerability or other security issues to disclose:

- Thank you very much, please do!
- Please send them to us by emailing \`${options.email.github}\`

We appreciate your efforts and responsible disclosure and will make every effort to acknowledge your contributions.
`,
				},
			},
		};
	},
});
