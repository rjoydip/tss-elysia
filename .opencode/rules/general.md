# General Rules

- Always check AGENTS.md and README.md for project-specific guidelines
- Follow the recommended workflow: lint:fix → typecheck → fmt → commit
- Use skill tool when available tasks match skill descriptions
- Keep responses concise (1-3 sentences unless detail is requested)
- Never commit secrets or keys to the repository
- Always verify changes with tests when applicable
- Always run dead code checks before committing: `bun run lint` and `bun run typecheck`

## Planning

- For any non-trivial task, use PLAN.md as a template to outline the work
- Keep PLAN.md updated as tasks progress
- Reference PLAN.md in commit messages when applicable

## Dead Code Prevention

Before committing, always verify no dead code:

```bash
bun run lint     # Check for unused code warnings
bun run typecheck  # TypeScript unused detection
bun run lint:fix  # Auto-fix safe unused items
```

This project enforces dead code detection via:

- TypeScript: `noUnusedLocals`, `noUnusedParameters` in tsconfig.json
- oxlint: `no-unused-vars`, `no-unused-imports` in .oxlintrc.json
