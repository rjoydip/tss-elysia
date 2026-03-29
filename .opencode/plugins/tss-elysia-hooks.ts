/**
 * TSS Elysia Plugin Hooks for OpenCode
 *
 * OpenCode's plugin system is MORE sophisticated with 20+ events
 *
 * Hook Event Mapping:
 * - PreToolUse → tool.execute.before
 * - PostToolUse → tool.execute.after
 * - Stop → session.idle / session.status
 * - SessionStart → session.created
 * - SessionEnd → session.deleted
 */

import type { PluginInput } from "@opencode-ai/plugin";

export const TEHooksPlugin = async ({ client, $, directory, worktree }: PluginInput) => {
  type HookProfile = "minimal" | "standard" | "strict";

  // Track files edited in current session for console.log audit
  const editedFiles = new Set<string>();

  // Helper to call the SDK's log API with correct signature
  const log = (level: "debug" | "info" | "warn" | "error", message: string) =>
    client.app.log({ body: { service: "te", level, message } });

  const normalizeProfile = (value: string | undefined): HookProfile => {
    if (value === "minimal" || value === "strict") return value;
    return "standard";
  };

  const currentProfile = normalizeProfile(process.env.TE_HOOK_PROFILE);
  const disabledHooks = new Set(
    (process.env.TE_DISABLED_HOOKS || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

  const profileOrder: Record<HookProfile, number> = {
    minimal: 0,
    standard: 1,
    strict: 2,
  };

  const profileAllowed = (required: HookProfile | HookProfile[]): boolean => {
    if (Array.isArray(required)) {
      return required.some((entry) => profileOrder[currentProfile] >= profileOrder[entry]);
    }
    return profileOrder[currentProfile] >= profileOrder[required];
  };

  const hookEnabled = (
    hookId: string,
    requiredProfile: HookProfile | HookProfile[] = "standard",
  ): boolean => {
    if (disabledHooks.has(hookId)) return false;
    return profileAllowed(requiredProfile);
  };

  return {
    /**
     * Oxfmt Auto-Format Hook
     *
     * Triggers: After any JS/TS/JSX/TSX file is edited
     * Action: Runs oxfmt --write on the file
     */
    "file.edited": async (event: { path: string }) => {
      // Track edited files for console.log audit
      editedFiles.add(event.path);

      // Auto-format JS/TS files
      if (hookEnabled("post:edit:format", ["strict"]) && event.path.match(/\.(ts|tsx|js|jsx)$/)) {
        try {
          await $`bunx oxfmt ${event.path} 2>/dev/null`;
          log("info", `[TE] Formatted: ${event.path}`);
        } catch {
          // Oxfmt not installed or failed - silently continue
        }
      }

      // Console.log warning check
      if (
        hookEnabled("post:edit:console-warn", ["standard", "strict"]) &&
        event.path.match(/\.(ts|tsx|js|jsx)$/)
      ) {
        try {
          const result = await $`grep -n "console\\.log" ${event.path} 2>/dev/null`.text();
          if (result.trim()) {
            const lines = result.trim().split("\n").length;
            log(
              "warn",
              `[TE] console.log found in ${event.path} (${lines} occurrence${lines > 1 ? "s" : ""})`,
            );
          }
        } catch {
          // No console.log found (grep returns non-zero) - this is good
        }
      }
    },

    /**
     * TypeScript Check Hook
     *
     * Triggers: After edit tool completes on .ts/.tsx files
     * Action: Runs tsc --noEmit to check for type errors
     */
    "tool.execute.after": async (input: { tool: string; args?: { filePath?: string } }) => {
      // Check if a TypeScript file was edited
      if (
        hookEnabled("post:edit:typecheck", ["strict"]) &&
        input.tool === "edit" &&
        input.args?.filePath?.match(/\.tsx?$/)
      ) {
        try {
          await $`bun run typecheck 2>&1`;
          log("info", "[TE] TypeScript check passed");
        } catch (error: unknown) {
          const err = error as { stdout?: string };
          log("warn", "[TE] TypeScript errors detected:");
          if (err.stdout) {
            // Log first few errors
            const errors = err.stdout.split("\n").slice(0, 5);
            errors.forEach((line: string) => log("warn", `  ${line}`));
          }
        }
      }

      // PR creation logging
      if (
        hookEnabled("post:bash:pr-created", ["standard", "strict"]) &&
        input.tool === "bash" &&
        input.args?.toString().includes("gh pr create")
      ) {
        log("info", "[TE] PR created - check GitHub Actions status");
      }
    },

    /**
     * Pre-Tool Security Check
     *
     * Triggers: Before tool execution
     * Action: Warns about potential security issues
     */
    "tool.execute.before": async (input: { tool: string; args?: Record<string, unknown> }) => {
      // Git push review reminder
      if (
        hookEnabled("pre:bash:git-push-reminder", "strict") &&
        input.tool === "bash" &&
        input.args?.toString().includes("git push")
      ) {
        log("info", "[TE] Remember to review changes before pushing: git diff origin/main...HEAD");
      }

      // Block creation of unnecessary documentation files
      if (
        hookEnabled("pre:write:doc-file-warning", ["standard", "strict"]) &&
        input.tool === "write" &&
        input.args?.filePath &&
        typeof input.args.filePath === "string"
      ) {
        const filePath = input.args.filePath;
        if (
          filePath.match(/\.(md|txt)$/i) &&
          !filePath.includes("README") &&
          !filePath.includes("CHANGELOG") &&
          !filePath.includes("LICENSE") &&
          !filePath.includes("CONTRIBUTING")
        ) {
          log("warn", `[TE] Creating ${filePath} - consider if this documentation is necessary`);
        }
      }

      // Long-running command reminder
      if (hookEnabled("pre:bash:tmux-reminder", "strict") && input.tool === "bash") {
        const cmd = String(input.args?.command || input.args || "");
        if (
          cmd.match(/^(npm|pnpm|yarn|bun)\s+(install|build|test|run)/) ||
          cmd.match(/^cargo\s+(build|test|run)/)
        ) {
          log("info", "[TE] Long-running command detected - consider using background execution");
        }
      }
    },

    /**
     * Session Created Hook
     *
     * Triggers: When a new session starts
     * Action: Loads context and displays welcome message
     */
    "session.created": async () => {
      if (!hookEnabled("session:start", ["minimal", "standard", "strict"])) return;

      log("info", `[TE] Session started - profile=${currentProfile}`);

      // Check for project-specific context files
      try {
        const hasOpencodeMd = await $`test -f ${worktree}/OPENCODE.md && echo "yes"`.text();
        if (hasOpencodeMd.trim() === "yes") {
          log("info", "[TE] Found OPENCODE.md - loading project context");
        }
      } catch {
        // No OPENCODE.md found
      }
    },

    /**
     * Session Idle Hook
     *
     * Triggers: When session becomes idle (task completed)
     * Action: Runs console.log audit on all edited files
     */
    "session.idle": async () => {
      if (!hookEnabled("stop:check-console-log", ["minimal", "standard", "strict"])) return;
      if (editedFiles.size === 0) return;

      log("info", "[TE] Session idle - running console.log audit");

      let totalConsoleLogCount = 0;
      const filesWithConsoleLogs: string[] = [];

      for (const file of editedFiles) {
        if (!file.match(/\.(ts|tsx|js|jsx)$/)) continue;

        try {
          const result = await $`grep -c "console\\.log" ${file} 2>/dev/null`.text();
          const count = parseInt(result.trim(), 10);
          if (count > 0) {
            totalConsoleLogCount += count;
            filesWithConsoleLogs.push(file);
          }
        } catch {
          // No console.log found
        }
      }

      if (totalConsoleLogCount > 0) {
        log(
          "warn",
          `[TE] Audit: ${totalConsoleLogCount} console.log statement(s) in ${filesWithConsoleLogs.length} file(s)`,
        );
        filesWithConsoleLogs.forEach((f) => log("warn", `  - ${f}`));
        log("warn", "[TE] Remove console.log statements before committing");
      } else {
        log("info", "[TE] Audit passed: No console.log statements found");
      }

      // Desktop notification (macOS)
      try {
        await $`osascript -e 'display notification "Task completed!" with title "OpenCode TE"' 2>/dev/null`;
      } catch {
        // Notification not supported or failed
      }

      // Clear tracked files for next task
      editedFiles.clear();
    },

    /**
     * Session Deleted Hook
     *
     * Triggers: When session ends
     * Action: Final cleanup and state saving
     */
    "session.deleted": async () => {
      if (!hookEnabled("session:end-marker", ["minimal", "standard", "strict"])) return;
      log("info", "[TE] Session ended - cleaning up");
      editedFiles.clear();
    },

    /**
     * File Watcher Hook
     * OpenCode-only feature
     *
     * Triggers: When file system changes are detected
     * Action: Updates tracking
     */
    "file.watcher.updated": async (event: { path: string; type: string }) => {
      if (event.type === "change" && event.path.match(/\.(ts|tsx|js|jsx)$/)) {
        editedFiles.add(event.path);
      }
    },

    /**
     * Todo Updated Hook
     * OpenCode-only feature
     *
     * Triggers: When todo list is updated
     * Action: Logs progress
     */
    "todo.updated": async (event: { todos: Array<{ text: string; done: boolean }> }) => {
      const completed = event.todos.filter((t) => t.done).length;
      const total = event.todos.length;
      if (total > 0) {
        log("info", `[TE] Progress: ${completed}/${total} tasks completed`);
      }
    },

    /**
     * Shell Environment Hook
     * OpenCode-specific: Inject environment variables into shell commands
     *
     * Triggers: Before shell command execution
     * Action: Sets PROJECT_ROOT, PACKAGE_MANAGER, DETECTED_LANGUAGES, TE_VERSION
     */
    "shell.env": async () => {
      const env: Record<string, string> = {
        TE_VERSION: "0.0.0",
        TE_PLUGIN: "true",
        TE_HOOK_PROFILE: currentProfile,
        TE_DISABLED_HOOKS: process.env.TE_DISABLED_HOOKS || "",
        PROJECT_ROOT: worktree || directory,
      };

      // Detect package manager
      const lockfiles: Record<string, string> = {
        "bun.lock": "bun",
        "pnpm-lock.yaml": "pnpm",
        "yarn.lock": "yarn",
        "package-lock.json": "npm",
      };
      for (const [lockfile, pm] of Object.entries(lockfiles)) {
        try {
          await $`test -f ${worktree}/${lockfile}`;
          env.PACKAGE_MANAGER = pm;
          break;
        } catch {
          // Not found, try next
        }
      }

      // Detect languages
      const langDetectors: Record<string, string> = {
        "tsconfig.json": "typescript",
        "pyproject.toml": "python",
        "Cargo.toml": "rust",
      };
      const detected: string[] = [];
      for (const [file, lang] of Object.entries(langDetectors)) {
        try {
          await $`test -f ${worktree}/${file}`;
          detected.push(lang);
        } catch {
          // Not found
        }
      }
      if (detected.length > 0) {
        env.DETECTED_LANGUAGES = detected.join(",");
        env.PRIMARY_LANGUAGE = detected[0];
      }

      return env;
    },

    /**
     * Session Compacting Hook
     * OpenCode-specific: Control context compaction behavior
     *
     * Triggers: Before context compaction
     * Action: Push TE context block and custom compaction prompt
     */
    "experimental.session.compacting": async () => {
      const contextBlock = [
        "# TE Context (preserve across compaction)",
        "",
        "## Active Plugin: TSS Elysia v0.0.0",
        "- Hooks: file.edited, tool.execute.before/after, session.created/idle/deleted, shell.env, compacting, permission.ask",
        "- Tools: run-tests, check-coverage, security-audit, format-code, lint-check, git-summary",
        "- Agents: 11 specialized (planner, architect, tdd-guide, code-reviewer, security-reviewer, build-error-resolver, e2e-runner, refactor-cleaner, doc-updater, database-reviewer, python-reviewer)",
        "",
        "## Key Principles",
        "- TDD: write tests first, 90%+ coverage",
        "- Immutability: never mutate, always return new copies",
        "- Security: validate inputs, no hardcoded secrets",
        "",
      ];

      // Include recently edited files
      if (editedFiles.size > 0) {
        contextBlock.push("## Recently Edited Files");
        for (const f of editedFiles) {
          contextBlock.push(`- ${f}`);
        }
        contextBlock.push("");
      }

      return {
        context: contextBlock.join("\n"),
        compaction_prompt:
          "Focus on preserving: 1) Current task status and progress, 2) Key decisions made, 3) Files created/modified, 4) Remaining work items, 5) Any security concerns flagged. Discard: verbose tool outputs, intermediate exploration, redundant file listings.",
      };
    },

    /**
     * Permission Auto-Approve Hook
     * OpenCode-specific: Auto-approve safe operations
     *
     * Triggers: When permission is requested
     * Action: Auto-approve reads, formatters, and test commands; log all for audit
     */
    "permission.ask": async (event: { tool: string; args: unknown }) => {
      log("info", `[TE] Permission requested for: ${event.tool}`);

      const cmd = String((event.args as Record<string, unknown>)?.command || event.args || "");

      // Auto-approve: read/search tools
      if (["read", "glob", "grep", "search", "list"].includes(event.tool)) {
        return { approved: true, reason: "Read-only operation" };
      }

      // Auto-approve: formatters
      if (event.tool === "bash" && /^(bunx )?(oxfmt|black|rustfmt|swift-format)/.test(cmd)) {
        return { approved: true, reason: "Formatter execution" };
      }

      // Auto-approve: test execution
      if (
        event.tool === "bash" &&
        /^(bun test|bunx vitest|bunx jest|pytest|cargo test)/.test(cmd)
      ) {
        return { approved: true, reason: "Test execution" };
      }

      // Everything else: let user decide
      return { approved: undefined };
    },
  };
};

export default TEHooksPlugin;
