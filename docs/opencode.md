# OpenCode Configuration

This document describes the OpenCode agent configuration for this project.

## Overview

The project uses a multi-agent setup with MiniMax and NVIDIA models for different development tasks. The configuration includes custom tools, plugins, commands, and agents.

## Agents

| Agent       | Type     | Model                 | Description                            |
| ----------- | -------- | --------------------- | -------------------------------------- |
| `build`     | Primary  | MiniMax M2.5 Free     | Default development agent              |
| `secondary` | Primary  | MiMo V2 Omni Free     | Fallback/alternative agent             |
| `mimo-pro`  | SubAgent | Mimo V2 Pro Free      | Specialized subagent for complex tasks |
| `nemotron`  | SubAgent | Nemotron 3 Super Free | Reasoning and analysis subagent        |

## Usage

### Switching Between Primary Agents

Press **Tab** to cycle between `build` and `secondary` agents during a session.

### Invoking Subagents

Use **@ mention** in your messages to invoke subagents:

```bash
@mimo-pro help me with this complex refactoring
@nemotron analyze this code for potential issues
```

## Provider Setup

### Required API Keys

Run the `/connect` command in OpenCode to add the following credentials:

| Provider | Models Used                          |
| -------- | ------------------------------------ |
| MiniMax  | M2.5 Free, MiMo V2 Omni, Mimo V2 Pro |
| NVIDIA   | Nemotron 3 Super Free                |

### Connecting Credentials

```bash
# In OpenCode TUI
/connect
```

Then select the provider and enter your API key when prompted.

## Configuration

The agent configuration is stored in `.opencode/opencode.json`:

```json
{
  "model": "opencode/minimax-m2.5-free",
  "small_model": "opencode/mimo-v2-omni-free",
  "agent": {
    "build": {
      "description": "Default primary agent for development work",
      "mode": "primary",
      "model": "opencode/minimax-m2.5-free"
    },
    "secondary": {
      "description": "Fallback model when primary is unavailable",
      "mode": "primary",
      "model": "opencode/mimo-v2-omni-free"
    },
    "mimo-pro": {
      "description": "Specialized subagent for complex tasks",
      "mode": "subagent",
      "model": "opencode/mimo-v2-pro-free"
    },
    "nemotron": {
      "description": "Subagent with fallback capability for reasoning tasks",
      "mode": "subagent",
      "model": "opencode/nemotron-3-super-free"
    }
  }
}
```

## Custom Tools

The project provides custom tools for development workflows:

| Tool             | Description                        |
| ---------------- | ---------------------------------- |
| `run-tests`      | Run the test suite with options    |
| `check-coverage` | Check test coverage thresholds     |
| `security-audit` | Run security audit (deps, secrets) |
| `format-code`    | Detect and format code             |
| `lint-check`     | Detect linter and run check/fix    |
| `git-summary`    | Generate git summary with stats    |
| `project`        | Get project information            |

## Plugins

The project includes custom plugins for enhanced functionality:

| Plugin             | Description                                      |
| ------------------ | ------------------------------------------------ |
| `tss-elysia-hooks` | Custom hook events for file editing, tools, etc. |
| `env-protection`   | Environment variable protection                  |
| `compaction`       | Session compaction handling                      |

### Hook Events

The plugin supports the following hook events:

- `file.edited` - When a file is edited
- `tool.execute.before` - Before tool execution
- `tool.execute.after` - After tool execution
- `session.created` - Session created
- `session.idle` - Session idle
- `session.deleted` - Session deleted
- `file.watcher.updated` - File watcher updates
- `permission.ask` - Permission requests
- `todo.updated` - Todo updates
- `shell.env` - Shell environment
- `experimental.session.compacting` - Session compaction

## Commands

Available commands in `.opencode/commands/`:

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `plan`            | Create/edit task plans        |
| `verify`          | Verify code changes           |
| `test-coverage`   | Check test coverage           |
| `e2e`             | Run end-to-end tests          |
| `code-review`     | Run code review               |
| `security`        | Run security audit            |
| `quality-gate`    | Run quality gates             |
| `refactor-clean`  | Clean up refactored code      |
| `build-fix`       | Fix build errors              |
| `tdd`             | Test-driven development       |
| `checkpoint`      | Create code checkpoints       |
| `loop-start`      | Start development loop        |
| `loop-status`     | Check loop status             |
| `evolve`          | Evolve code incrementally     |
| `orchestrate`     | Orchestrate multi-agent tasks |
| `skill-create`    | Create new skills             |
| `update-docs`     | Update documentation          |
| `update-codemaps` | Update code maps              |
| `learn`           | Learn from codebase           |
| `instinct-export` | Export instincts              |
| `instinct-import` | Import instincts              |
| `model-route`     | Route to specific models      |
| `setup-pm`        | Setup package manager         |
| `eval`            | Evaluate expressions          |
| `harness-audit`   | Audit test harness            |
| `rust-build`      | Rust build tasks              |
| `rust-review`     | Rust code review              |
| `rust-test`       | Rust tests                    |

## Subagents

Available subagents in `.opencode/agents/`:

| Agent                  | Description                      |
| ---------------------- | -------------------------------- |
| `architect`            | Architecture design and planning |
| `build-error-resolver` | Resolve build errors             |
| `code-reviewer`        | Code quality review              |
| `database-reviewer`    | Database schema review           |
| `doc-updater`          | Documentation updates            |
| `e2e-runner`           | End-to-end test execution        |
| `planner`              | Task planning and breakdown      |
| `refactor-cleaner`     | Refactoring and code cleanup     |
| `rust-reviewer`        | Rust code review                 |
| `rust-build-resolver`  | Rust build error resolution      |
| `security-reviewer`    | Security vulnerability review    |
| `tdd-guide`            | Test-driven development guidance |

## Rules

Code quality rules are stored in `.opencode/rules/`:

| Rule File         | Description               |
| ----------------- | ------------------------- |
| `general.md`      | General coding guidelines |
| `commit.md`       | Commit message guidelines |
| `code-quality.md` | Code quality standards    |

### Key Rules

- Always check `AGENTS.md` and `README.md` for project-specific guidelines
- Follow the recommended workflow: `lint:fix` → `typecheck` → `fmt`
- Use skill tool when available tasks match skill descriptions
- Keep responses concise (1-3 sentences unless detail is requested)
- Never commit secrets or keys to the repository
- Always verify changes with tests when applicable

### Dead Code Prevention

Before committing, always verify no dead code:

```bash
bun run lint      # Check for unused code warnings
bun run typecheck # TypeScript unused detection
bun run lint:fix  # Auto-fix safe unused items
```

This project enforces dead code detection via:

- TypeScript: `noUnusedLocals`, `noUnusedParameters` in tsconfig.json
- oxlint: `no-unused-vars`, `no-unused-imports` in .oxlintrc.json

## LSP Configuration

The project uses the following Language Server Protocol (LSP) servers:

| Server      | Languages Supported           |
| ----------- | ----------------------------- |
| TypeScript  | TypeScript, JavaScript, React |
| JSON        | JSON, JSONC                   |
| TailwindCSS | Tailwind CSS, CSS             |
| HTML        | HTML, Handlebars, Razor       |
| CSS         | CSS, SCSS, Less               |
| YAML        | YAML                          |

## MCP Servers

Model Context Protocol servers for enhanced capabilities:

| Server            | Purpose                      | Requirement         |
| ----------------- | ---------------------------- | ------------------- |
| `chrome-devtools` | Browser automation & testing | Auto-configured     |
| `github`          | GitHub issues, PRs, repos    | `GITHUB_TOKEN` env  |
| `filesystem`      | Enhanced file operations     | Auto-configured     |
| `sqlite`          | Database queries             | Database must exist |

## Best Practices

- Use `build` for most development tasks
- Use `secondary` when `build` is unavailable or for variety
- Invoke `@mimo-pro` for complex refactoring or challenging problems
- Invoke `@nemotron` for code analysis and reasoning tasks
- For non-trivial tasks, use PLAN.md to outline the work
- Always run lint, typecheck, and fmt before committing