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
