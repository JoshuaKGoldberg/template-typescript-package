import * as prompts from "@clack/prompts";
import chalk from "chalk";
import * as fs from "fs/promises";
import path from "node:path";
import * as process from "node:process";

import { logLine } from "../shared/cli/lines.js";
import { filterPromptCancel } from "../shared/prompts.js";
import { Mode, PromptedOptions } from "../shared/types.js";

// Custom error class for invalid mode
class InvalidModeError extends Error {
    constructor(mode) {
        super(`Unknown --mode: ${mode}. Allowed modes are: ${allowedModes.join(", ")}.`);
        this.name = "InvalidModeError";
    }
}

const allowedModes = ["create", "initialize", "migrate"] as Mode[];

// Check if a value is a valid mode
function isMode(input: boolean | string): input is Mode {
    return allowedModes.includes(input as Mode);
}

function label(base: string, text: string) {
    return `${chalk.bold(base)} ${text}`;
}

export interface PromptedMode {
    mode: Mode | undefined;
    options?: PromptedOptions;
}

async function promptForMode(input: boolean | string | undefined): Promise<PromptedMode> {
    // Validate input mode
    if (input) {
        if (!isMode(input)) {
            throw new InvalidModeError(input);
        }
        return { mode: input };
    }

    const dir = await fs.readdir(".");

    if (dir.length === 0) {
        const mode = filterPromptCancel(
            (await prompts.select({
                message: chalk.blue("How would you like to use the template?"),
                options: [
                    {
                        label: label(
                            "create",
                            "a new repository in the current empty directory",
                        ),
                        value: "create-current",
                    },
                    {
                        label: label("create", "a new repository in a new child directory"),
                        value: "create-child",
                    },
                ],
            })) as string,
        );

        const directory = path.basename(process.cwd());

        return {
            mode: "create",
            ...(mode === "create-current" && {
                options: {
                    directory: ".",
                    repository: directory,
                },
            }),
        };
    }

    if (dir.includes(".git")) {
        return {
            mode: filterPromptCancel(
                (await prompts.select({
                    initialValue: "migrate" as Mode,
                    message: chalk.blue("How would you like to use the template?"),
                    options: [
                        {
                            label: label("create", "a new repository in a child directory"),
                            value: "create",
                        },
                        {
                            label: label(
                                "initialize",
                                "a freshly cloned repository in the current directory",
                            ),
                            value: "initialize",
                        },
                        {
                            label: label(
                                "migrate",
                                "the existing repository in the current directory",
                            ),
                            value: "migrate",
                        },
                    ],
                })) as Mode,
            ),
        };
    }

    logLine();
    logLine(
        chalk.gray(
            "Defaulting to --mode create because the directory contains children and isn't a Git repository.",
        ),
    );

    return {
        mode: "create",
    };
}

export { promptForMode };
