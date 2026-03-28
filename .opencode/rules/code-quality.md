# Code Quality Rules

## TypeScript

- Always use explicit types for function parameters and return types
- Avoid `any` - use `unknown` or proper generics instead
- Enable strict mode in tsconfig.json

## Dead Code Prevention

- Never commit unused imports, variables, or parameters
- Enable `noUnusedLocals` and `noUnusedParameters` in tsconfig.json
- Configure oxlint rules `no-unused-vars` and `no-unused-imports`
- Run `bun run lint` and `bun run typecheck` before committing
- Use `bun run lint:fix` to auto-fix safe unused items

## Code Style

- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Extract repeated code into reusable functions
- Avoid deeply nested conditionals

## Error Handling

- Always handle errors appropriately (try/catch, error boundaries)
- Never swallow errors without logging
- Use custom error classes for domain-specific errors

## Testing

- Write tests for new features and bug fixes
- Follow existing test patterns in the codebase
- Use descriptive test names that explain what is being tested

## Security

- Never hardcode secrets, API keys, or credentials
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Sanitize user-generated content to prevent XSS
