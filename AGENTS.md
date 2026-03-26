# AGENTS.md

This file contains guidelines for AI coding agents working in this repository.

## Quick Reference

All necessary information is in [README.md](./README.md), including:

- Commands (dev, build, lint, fmt, typecheck, etc.)
- Tech stack overview
- Project structure
- Code style guidelines (formatting, linting, TypeScript, naming, imports, React patterns, error handling, CSS, validation)
- Git workflow and pre-commit hooks
- Common issues

## Recommended Workflow

1. Create/edit code
2. Run `bun run lint:fix` to auto-fix issues
3. Run `bun run typecheck` to verify types
4. Run `bun run fmt` to ensure formatting
5. Commit changes (hooks will verify)

## Skills & Agents

This project uses a skill-based architecture. Skills are located in `.agents/skills/`.

### Available Skills

| Skill              | Description                    | Usage                        |
| ------------------ | ------------------------------ | ---------------------------- |
| `expect`           | Adversarial browser testing    | Test changes in real browser |
| `land-pr`          | Land a PR with proper workflow | Merge PRs to main            |
| `code-review`      | Code quality review            | Review PRs and code          |
| `docs-writer`      | Documentation creation         | Write/update docs            |
| `security-auditor` | Security audit                 | Find vulnerabilities         |

### Loading Skills

Use the `skill` tool to load a skill when a task matches its description:

```bash
Load skill "expect" for browser testing
Load skill "land-pr" for PR merging
```

## Environment Configuration

Database configuration is managed via environment variables:

```bash
# .env file
DATABASE_NAME=.artifacts/tss-elysia.db
AUTH_SECRET=your-secret-key
```

### Key Variables

| Variable        | Default                    | Description          |
| --------------- | -------------------------- | -------------------- |
| `DATABASE_NAME` | `.artifacts/tss-elysia.db` | SQLite database path |
| `PORT`          | `3000`                     | Server port          |
| `HOST`          | `localhost`                | Server host          |
