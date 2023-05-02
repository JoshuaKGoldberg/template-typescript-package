import { GreetOptions } from "./types.js";

/**
 *
 * @param options - The options for the greeting, or the message to greet.
 */
export function greet(options: GreetOptions | string) {
	const {
		logger = console.log.bind(console),
		message,
		times = 1,
	} = typeof options === "string" ? { message: options } : options;

	for (let i = 0; i < times; i += 1) {
		logger(message);
	}
}
