# Commit Guidelines

## When to Commit

- Commit when user explicitly requests it
- Never commit spontaneously without permission

## Commit Message Format

Follow Conventional Commits:

| Type       | Description                             |
| ---------- | --------------------------------------- |
| `feat`     | New feature                             |
| `fix`      | Bug fix                                 |
| `docs`     | Documentation changes                   |
| `style`    | Code style (formatting, no logic)       |
| `refactor` | Code change that neither fixes nor adds |
| `test`     | Adding or updating tests                |
| `chore`    | Maintenance tasks                       |
| `ci`       | CI/CD changes                           |

## Before Committing

Always run these checks first:

1. `bun run lint:fix`
2. `bun run typecheck`
3. `bun run fmt`

### Dead Code Prevention

This project enforces dead code detection. Always verify no unused code before committing:

```bash
bun run lint     # Check for unused variables/imports
bun run typecheck  # Check for unused locals/parameters
bun run lint:fix  # Auto-fix safe unused items
```

Tools used:

- **TypeScript**: `noUnusedLocals`, `noUnusedParameters` in tsconfig.json
- **oxlint**: `no-unused-vars`, `no-unused-imports` in .oxlintrc.json

## Git Safety

- NEVER force push to main/master
- NEVER use --amend unless explicitly requested
- NEVER skip hooks (--no-verify)
