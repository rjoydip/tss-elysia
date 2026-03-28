/**
 * TE Custom Tool: Format Code
 *
 * Returns the formatter command that should be run for a given file.
 * This avoids shell execution assumptions while still giving precise guidance.
 */

import { tool } from "@opencode-ai/plugin/tool";
import * as path from "path";
import * as fs from "fs";

type Formatter = "oxlint" | "oxfmt" | "black" | "rustfmt";

export default tool({
  description:
    "Detect formatter for a file and return the exact command to run (Oxlint, oxfmt, Black, rustfmt).",
  args: {
    filePath: tool.schema.string().describe("Path to the file to format"),
    formatter: tool.schema
      .enum(["oxlint", "oxfmt", "black", "rustfmt"])
      .optional()
      .describe("Optional formatter override"),
  },
  async execute(args, context) {
    const cwd = context.worktree || context.directory;
    const ext = args.filePath.split(".").pop()?.toLowerCase() || "";
    const detected = args.formatter || detectFormatter(cwd, ext);

    if (!detected) {
      return JSON.stringify({
        success: false,
        message: `No formatter detected for .${ext} files`,
      });
    }

    const command = buildFormatterCommand(detected, args.filePath);
    return JSON.stringify({
      success: true,
      formatter: detected,
      command,
      instructions: `Run this command:\n\n${command}`,
    });
  },
});

function detectFormatter(cwd: string, ext: string): Formatter | null {
  if (["ts", "tsx", "js", "jsx", "json", "css", "scss", "md", "yaml", "yml"].includes(ext)) {
    if (
      fs.existsSync(path.join(cwd, ".oxlintrc.json")) ||
      fs.existsSync(path.join(cwd, ".oxlintrc.jsonc"))
    ) {
      return "oxlint";
    }
    return "oxfmt";
  }
  if (["py", "pyi"].includes(ext)) return "black";
  if (ext === "rs") return "rustfmt";
  return null;
}

function buildFormatterCommand(formatter: Formatter, filePath: string): string {
  const commands: Record<Formatter, string> = {
    oxlint: `bunx oxlint ${filePath}`,
    oxfmt: `bunx oxfmt ${filePath}`,
    black: `bunx black ${filePath}`,
    rustfmt: `bunx rustfmt ${filePath}`,
  };
  return commands[formatter];
}
