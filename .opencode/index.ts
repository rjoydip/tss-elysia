export * from "./plugins/index.js";

// Version export
export const VERSION = "0.0.0";

// Plugin metadata
export const metadata = {
  name: "tss-elysia-opencode",
  version: VERSION,
  description: "Tss Elysia plugin for OpenCode",
  features: {
    agents: 12,
    commands: 28,
    skills: 7,
    configAssets: true,
    hookEvents: [
      "file.edited",
      "tool.execute.before",
      "tool.execute.after",
      "session.created",
      "session.idle",
      "session.deleted",
      "file.watcher.updated",
      "permission.ask",
      "todo.updated",
      "shell.env",
      "experimental.session.compacting",
    ],
    customTools: [
      "run-tests",
      "check-coverage",
      "security-audit",
      "format-code",
      "lint-check",
      "git-summary",
      "project",
    ],
  },
};