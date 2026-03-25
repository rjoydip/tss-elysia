# tss-elysia

[![React Doctor](https://www.react.doctor/share/badge?p=tss-elysia&s=98&w=3&f=3)](https://www.react.doctor/share?p=tss-elysia&s=98&w=3&f=3)

A full-stack TypeScript application using TanStack Start, Elysia, React 19, and Bun.

## Quick Start

```bash
bun install
bun run dev
```

## Commands

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `bun run dev`          | Start Vite dev server                    |
| `bun run build`        | Build for production                     |
| `bun run start`        | Run production server                    |
| `bun run lint`         | Run oxlint with GitHub format            |
| `bun run lint:ci`      | Lint + format check (CI mode)            |
| `bun run lint:fix`     | Auto-fix lint issues and format          |
| `bun run fmt`          | Format code with oxfmt                   |
| `bun run fmt:check`    | Check formatting without fixing          |
| `bun run typecheck`    | TypeScript type checking (tsgo --noEmit) |
| `bun run react:doctor` | React doctor diagnostics                 |
| `bun run changeset`    | Create a changeset                       |
| `bun run prepare`      | Install git hooks                        |
| `bun run test:unit`    | Unit tests with Bun                      |
| `bun run test:e2e`     | E2E tests with Playwright                |
| `bun run test:load`    | Load tests with k6                       |

> Before load test make sure to ran vite preview `bun preview --host`

## Documentation

Detailed documentation available in `docs/`:

- [API Reference](docs/api-reference.md)
- [Development](docs/development.md)
- [Testing](docs/testing.md)
- [Environment Variables](docs/environment-variables.md)
- [Project Overview](docs/project-overview.md)

## Tech Stack

- **Framework**: TanStack Start
- **Server**: Elysia
- **Runtime**: Bun
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Validation**: Zod v4

## Project Structure

```bash
src/
  routes/           # File-based routing (TanStack Start)
    __root.tsx      # Root route
    index.tsx       # Home route
  router.tsx        # Router configuration
  styles/
    app.css         # Global styles
server.ts           # Tanstack server entry
vite.config.ts      # Vite configuration
tsconfig.json       # TypeScript configuration
```

## Code Style

### Formatting

- Use **oxfmt** for code formatting (configured in `.oxfmtrc.json`)
- Run `bun run fmt` before committing

### Linting

- Uses **oxlint** with plugins: `unicorn`, `typescript`, `oxc`
- Configuration in `.oxlintrc.json`

### TypeScript

- Path alias: `~/*` maps to `./src/*`
- JSX mode: `react-jsx`

### Naming Conventions

- **Components**: PascalCase (e.g., `RootDocument`)
- **Files**: kebab-case for routes (e.g., `__root.tsx`)
- **Utilities**: camelCase (e.g., `getRouter()`)
- **Constants**: SCREAMING_SNAKE_CASE

### Imports

- Use path alias `~/*` for src imports (e.g., `import appCss from "~/styles/app.css?url"`)
- CSS imports require `?url` suffix for Vite

### React Patterns

- Functional components with TypeScript
- Use `createRootRoute`, `createRoute` from `@tanstack/react-router`
- Use `<Link>` for navigation, `<HeadContent />`, `<Scripts />` in root layout
- Include `<TanStackRouterDevtools>` in development (bottom-right)

### Error Handling

- Use `defaultErrorComponent` and `defaultNotFoundComponent` in router config
- Return proper HTTP status codes in server handlers

### CSS

- Tailwind CSS v4 with Vite plugin
- Import with `@import "tailwindcss";` in `app.css`

### Validation

- Uses **Zod v4** for runtime validation
- Prefer Zod schemas over custom validation logic

## Git Workflow

- Pre-commit hooks run: `lint`, `typecheck`, `react:doctor`
- Use changesets for version management:

  ```bash
  bun run changeset   # Create changeset
  bun run version     # Update versions
  bun run release     # Publish to npm
  ```

## Common Issues

- If imports fail, ensure `bun install` has run
- Path alias `~/*` requires TypeScript paths configuration
- CSS files must use `?url` suffix for Vite's asset handling

## For AI Agents

For detailed agent coding guidelines, see [AGENTS.md](./AGENTS.md).
