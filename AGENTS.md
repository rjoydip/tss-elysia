# AGENTS.md

This file contains guidelines for AI coding agents working in this repository.

## AI/LLM Coding Standards

All AI-generated code must adhere to these standards:

### Code Commenting Requirements

- **Always add meaningful comments** to all new or modified code
- Explain **why** (intent/purpose), not just **what** (mechanics)
- Add function-level comments describing:
  - Purpose of the function
  - Input parameters and their meaning
  - Return value and its meaning
  - Any side effects or edge cases
- Add comments to complex logic, business rules, or non-obvious implementations
- Comment any workarounds or temporary solutions with explanation

### Code Quality Standards

- **Naming**: Use meaningful, descriptive names for variables, functions, and types
- **Modularity**: Keep functions small and focused (single responsibility)
- **Error Handling**: Always handle errors appropriately (try/catch, error boundaries)
- **Type Safety**: Use explicit types; avoid `any`, prefer `unknown` or proper generics
- **Testing**: Write tests for new features and bug fixes

### Consistency Rules

- **Match existing patterns**: Follow the project's code style and structure
- **Reuse utilities**: Use existing helpers/utilities instead of duplicating code
- **Formatting**: Always run `bun run fmt` before completing any task
- **Linting**: Run `bun run lint:fix` to auto-fix issues
- **Type Checking**: Ensure `bun run typecheck` passes
- **Dead Code Prevention**: Run lint and typecheck to detect unused code before committing

### Dead Code Prevention

This project enforces dead code detection via:

| Tool       | Configuration                                            | Detects                   |
| ---------- | -------------------------------------------------------- | ------------------------- |
| TypeScript | `tsconfig.json` - `noUnusedLocals`, `noUnusedParameters` | Unused locals, parameters |
| oxlint     | `.oxlintrc.json` - `no-unused-vars`, `no-unused-imports` | Unused variables, imports |

**Before committing, always verify no dead code:**

```bash
bun run lint     # Check for unused code warnings
bun run typecheck  # TypeScript unused detection
bun run lint:fix  # Auto-fix safe unused items
```

### Agent Behavior

When generating or modifying code, the AI agent must:

1. **Always add comments** - No uncommented code should be committed
2. **Refactor for clarity** - Add missing comments when modifying existing code
3. **Follow standards** - Strictly adhere to these coding guidelines
4. **Verify changes** - Run lint, fmt, and typecheck before finishing
5. **Keep responses concise** - Answer directly without unnecessary preamble

---

## Quick Reference

All necessary information is in [README.md](./README.md), including:

- Commands (dev, build, lint, fmt, typecheck, etc.)
- Tech stack overview
- Project structure
- Code style guidelines (formatting, linting, TypeScript, naming, imports, React patterns, error handling, CSS, validation)
- Git workflow and pre-commit hooks
- Common issues

## Recommended Workflow

1. For any task, first check [PLAN.md](./.artifacts/PLAN.md) to see if it's already planned
2. For non-trivial tasks, create a plan using PLAN.md template
3. Create/edit code
4. Run `bun run fmt` to ensure formatting
5. Run `bun run lint:fix` to auto-fix issues
6. Run `bun run typecheck` to verify types
7. Run `bun test` to verify unit test
8. Run `bun run test:e2e` to verify E2E test
9. Once changes are complete, verify and update PLAN.md (mark completed tasks/goals)
10. Commit changes (hooks will verify)

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
DATABASE_PATH=.artifacts
DATABASE_NAME=tss-elysia.db
AUTH_SECRET=your-secret-key
GITHUB_TOKEN=ghp_xxx  # For GitHub MCP integration
```

### Key Variables

| Variable        | Default         | Description                     |
| --------------- | --------------- | ------------------------------- |
| `DATABASE_PATH` | `.artifacts`    | SQLite database path            |
| `DATABASE_NAME` | `tss-elysia.db` | SQLite database name            |
| `PORT`          | `3000`          | Server port                     |
| `HOST`          | `localhost`     | Server host                     |
| `GITHUB_TOKEN`  | -               | GitHub token for MCP (optional) |

## MCP Tools

This project includes MCP (Model Context Protocol) servers for enhanced capabilities:

| Tool              | Purpose                         | Requirement         |
| ----------------- | ------------------------------- | ------------------- |
| `chrome-devtools` | Browser automation & testing    | Auto-configured     |
| `github`          | GitHub issues, PRs, repos       | `GITHUB_TOKEN` env  |
| `filesystem`      | Enhanced file operations in src | Auto-configured     |
| `sqlite`          | Database queries                | Database must exist |

---

## Release Process Guidelines

For AI agents, follow these guidelines when working with releases:

### Always Use Changesets

- **Never manually bump version numbers** in `package.json`
- Always use `bun changeset add` to create changesets
- This ensures proper versioning and CHANGELOG entries
- Changesets are required for any release

### Release Workflow

The automated release workflow (`.github/workflows/release.yml`) runs on push to `main`:

1. **Validation**: Checks working tree is clean, changesets exist
2. **Quality**: Lint, typecheck, tests
3. **Security**: Audit
4. **Build**: Application build
5. **Version**: Bump version, update CHANGELOG
6. **Tag**: Create git tag (e.g., `v1.2.0`)
7. **Release**: Create GitHub Release

### Manual Release

For manual releases, use the release script:

```bash
# Full release with all validations
bun run release

# Preview without making changes
bun run release --dry-run

# Skip quality checks (not recommended)
bun run release --skip-tests
```

### Versioning Rules

- Follow [SemVer](https://semver.org/) (MAJOR.MINOR.PATCH)
- Use changeset bump types:
  - `patch` for bug fixes
  - `minor` for new features (backward compatible)
  - `major` for breaking changes

### For Contributors

When making changes that should be released:

1. Create a changeset: `bun changeset add`
2. Select the package and bump type
3. Write a clear description
4. Commit with conventional commit message
5. Push - CI will handle the rest

### Documentation Updates

When releasing, always update documentation:

- Update CHANGELOG.md with release notes
- Update version references in docs if needed
- Ensure CONTRIBUTING.md reflects current process