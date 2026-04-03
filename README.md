# tss-elysia

[![React Doctor](https://www.react.doctor/share/badge?p=tss-elysia&s=98&w=3&f=3)](https://www.react.doctor/share?p=tss-elysia&s=98&w=3&f=3)
[![License](https://img.shields.io/github/license/rjoydip/tss-elysia)](https://github.com/rjoydip/tss-elysia/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.2+-green)](https://bun.sh)

A full-stack TypeScript application using TanStack Start, Elysia, React 19, and Bun.

> **Project Roadmap**: See [PLAN.md](./.artifacts/PLAN.md) for detailed feature planning and progress tracking.

## Quick Start

```bash
bun install
bun run dev
```

## Commands

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `bun run setup`        | Run full project setup (recommended)     |
| `bun run cleanup`      | Clean up build/test artifacts            |
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

### Setup Script

Run once after cloning the project to set up everything:

```bash
bun run setup
```

What it does:

1. Checks Bun runtime is installed
2. Installs project dependencies
3. Creates `.env` from `.env.example`
4. Generates database schema and runs migrations
5. Seeds the database with initial data
6. Sets up git hooks
7. Runs typecheck to verify setup

Options:

- `--skip-db` - Skip database setup (if you want to set it up manually)

### Cleanup Script

Clean up build artifacts, test results, and temporary files:

```bash
bun run cleanup
```

Options:

- `--dry-run` - Show what would be deleted without actually deleting
- `--keep-db` - Preserve database files (`.artifacts/*.db`)
- `--full` - Full reset including `node_modules` (rarely needed)

> **Note:** Executable files like `k9.exe` in `.artifacts/` are automatically preserved during cleanup.
> Before load test make sure to ran vite preview `bun preview --host`

## Documentation

Detailed documentation available in `docs/`:

| Document                                                      | Description                  |
| ------------------------------------------------------------- | ---------------------------- |
| [API Reference](docs/api/overview.md)                         | API endpoints and usage      |
| [Architecture](docs/getting-started/architecture.md)          | System architecture overview |
| [Authentication](docs/auth/overview.md)                       | Auth setup and configuration |
| [CI/CD](docs/infra/ci-cd.md)                                  | CI/CD pipelines and releases |
| [Development](docs/getting-started/development.md)            | Development guide            |
| [Docker](docs/infra/docker.md)                                | Docker deployment guide      |
| [Environment Variables](docs/guides/environment-variables.md) | Environment configuration    |
| [Middleware](docs/guides/middleware.md)                       | Middleware documentation     |
| [Overview](docs/guides/overview.md)                           | Project introduction         |
| [Testing](docs/guides/testing.md)                             | Testing guide                |
| [Troubleshooting](docs/guides/troubleshooting.md)             | Common issues and solutions  |

## Tech Stack

- **Framework**: TanStack Start
- **Server**: Elysia
- **Runtime**: Bun
- **UI**: React 19 + TypeScript
- **Form**: Tanstack Form
- **State Management**: TanStack Store
- **Function Execution Timing**: Tanstack Pacer
- **Styling**: Tailwind CSS v4

## Project Structure

```bash
src/
├── config/             # Central configuration (logger, rate-limit, cors, helmet)
│   └── index.ts
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   │   ├── accordion.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   └── tabs.tsx
│   ├── auth/          # Auth components
│   │   ├── form/       # Auth form components
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── auth-guard.tsx   # Route protection component
│   │   ├── branding.tsx     # Branding component
│   │   └── footer.tsx       # Common footer
│   ├── profile/       # Profile components
│   │   └── profile-page.tsx
│   ├── settings/      # Settings components
│   │   ├── account-settings.tsx
│   │   ├── email-change-form.tsx
│   │   ├── password-change-form.tsx
│   │   ├── preferences-settings.tsx
│   │   ├── session-settings.tsx
│   │   └── settings-page.tsx
│   ├── header.tsx     # Common header
│   ├── footer.tsx     # Common footer
│   ├── branding.tsx   # Branding component
│   ├── code-highlight.tsx # Code highlighting component
│   └── theme/         # Theme components
│       ├── provider.tsx
│       ├── toggle.tsx
│       └── context.tsx
├── env.ts             # Isomorphic env fetching with type-safe validation
├── lib/               # Library code
│   ├── auth/          # Authentication (Better Auth)
│   │   ├── index.ts   # Server auth instance
│   │   └── client.ts  # Client auth hooks and methods
│   ├── db/            # Database (Drizzle + SQLite)
│   │   ├── index.ts
│   │   └── schema.ts
│   └── utils.ts       # Utility functions (cn, etc.)
├── logger.ts          # Logger configuration
├── middlewares/       # Middleware implementations
│   ├── cors.ts        # CORS headers
│   ├── helmet.ts      # Security headers
│   ├── index.ts       # Export barrel
│   └── rate-limit.ts  # Rate limiting
├── router.tsx         # TanStack Router configuration
├── routeTree.gen.ts   # Auto-generated route tree
├── routes/            # File-based routing (TanStack Start)
│   ├── __root.tsx     # Root route
│   ├── index.tsx      # Home route
│   ├── account/       # Account routes
│   │   ├── login.tsx  # Login page (/account/login)
│   │   ├── register.tsx # Register page (/account/register)
│   │   ├── forgot-password.tsx # Forgot password page (/account/forgot-password)
│   │   └── verify-email.tsx # Email verification (/account/verify-email)
│   ├── profile/       # Profile routes
│   │   └── index.tsx  # Profile page (/profile)
│   ├── settings/      # Settings routes
│   │   └── index.tsx  # Settings page (/settings)
│   ├── docs/          # Documentation routes
│   ├── blog/          # Blog routes
│   ├── changelog/    # Changelog routes
│   ├── status/       # Status page routes
│   └── api/          # API routes
│       ├── $.ts       # API catch-all route
│       └── auth/      # Auth routes (Better Auth)
│           └── $.ts
├── server.ts          # TanStack Start server entry
├── types/             # TypeScript type definitions
│   └── subscription.ts
├── utils.ts           # Utility functions
└── styles/
    └── app.css        # Global styles
vite.config.ts         # Vite configuration
tsconfig.json          # TypeScript configuration
```

## Test Structure

```bash
test/                  # Unit tests (Bun)
├── components/        # Component unit tests
│   ├── ui.test.tsx       # UI components (Button, Badge, Card, Separator)
│   ├── ui-additional.test.tsx # Additional UI (Label, Switch, Skeleton, Input, Tabs, Accordion)
│   ├── header.test.tsx   # Header component tests
│   ├── branding.test.tsx # Branding component tests
│   └── footer.test.tsx   # Footer component tests
├── routes/            # Route tests
├── db.test.ts         # Database tests
├── auth.test.ts      # Auth tests
└── fixtures/          # Test fixtures
    └── db.ts

.e2e/                 # E2E tests (Playwright)
├── ui/               # UI E2E tests
│   ├── auth.spec.ts      # Authentication tests
│   ├── components.spec.ts # UI component tests
│   ├── navigation.spec.ts # Navigation tests
│   ├── docs.spec.ts      # Documentation page tests
│   ├── root.spec.ts      # Landing page tests
│   ├── status.spec.ts   # Status page tests
│   ├── blog.spec.ts      # Blog page tests
│   └── changelog.spec.ts # Changelog page tests
├── api/              # API E2E tests
│   └── endpoints.spec.ts # API endpoint tests
└── config.ts         # E2E configuration
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

## Troubleshooting

For more detailed troubleshooting guide, see [Troubleshooting](docs/guides/troubleshooting.md).

Common issues:

- If imports fail, ensure `bun install` has run
- Path alias `~/*` requires TypeScript paths configuration
- CSS files must use `?url` suffix for Vite's asset handling

## For AI Agents

For detailed agent coding guidelines, see [AGENTS.md](./AGENTS.md).

For feature planning and progress tracking, see [PLAN.md](./.artifacts/PLAN.md).