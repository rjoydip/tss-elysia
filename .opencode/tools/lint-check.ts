/**
 * TE Custom Tool: Lint Check
 *
 * Detects the appropriate linter and returns a runnable lint command.
 */

import { tool } from "@opencode-ai/plugin/tool";
import * as path from "path";
import * as fs from "fs";

type Linter = "biome" | "oxlint" | "ruff" | "pylint";

export default tool({
  description: "Detect linter for a target path and return command for check/fix runs.",
  args: {
    target: tool.schema
      .string()
      .optional()
      .describe("File or directory to lint (default: current directory)"),
    fix: tool.schema.boolean().optional().describe("Enable auto-fix mode"),
    linter: tool.schema
      .enum(["biome", "oxlint", "ruff", "pylint"])
      .optional()
      .describe("Optional linter override"),
  },
  async execute(args, context) {
    const cwd = context.worktree || context.directory;
    const target = args.target || ".";
    const fix = args.fix ?? false;
    const detected = args.linter || detectLinter(cwd);

    const command = buildLintCommand(detected, target, fix);
    return JSON.stringify({
      success: true,
      linter: detected,
      command,
      instructions: `Run this command:\n\n${command}`,
    });
  },
});

function detectLinter(cwd: string): Linter {
  if (fs.existsSync(path.join(cwd, "biome.json")) || fs.existsSync(path.join(cwd, "biome.jsonc"))) {
    return "biome";
  }

  const oxlintConfigs = [
    ".oxlintrc",
    ".oxlintrc.json",
    ".oxlintrc.jsonc",
    ".oxlintrc.yaml",
    ".oxlintrc.yml",
    "oxlintrc",
    "oxlintrc.json",
    "oxlintrc.jsonc",
  ];
  if (oxlintConfigs.some((name) => fs.existsSync(path.join(cwd, name)))) {
    return "oxlint";
  }

  const pyprojectPath = path.join(cwd, "pyproject.toml");
  if (fs.existsSync(pyprojectPath)) {
    try {
      const content = fs.readFileSync(pyprojectPath, "utf-8");
      if (content.includes("ruff")) return "ruff";
    } catch {
      // ignore read errors and keep fallback logic
    }
  }

  return "oxlint";
}

function buildLintCommand(linter: Linter, target: string, fix: boolean): string {
  if (linter === "biome") return `bunx @biomejs/biome lint${fix ? " --write" : ""} ${target}`;
  if (linter === "oxlint") return `bunx oxlint${fix ? " --fix" : ""} ${target}`;
  if (linter === "ruff") return `ruff check${fix ? " --fix" : ""} ${target}`;
  if (linter === "pylint") return `pylint ${target}`;
  return `bunx ${linter} ${target}`;
}
