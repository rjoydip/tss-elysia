---
title: Development
description: Set up and run the development environment
---

## Development

## Setup

```bash
bun install
```

## Running Development Server

```bash
bun run dev
```

Starts Vite dev server with:

- Hot Module Replacement (**HMR**)
- TanStack Router code generation
- Vite middleware integration

Use environment variables to customize:

```bash
bun run --env-file=.env dev
```

Or create a `.env` file (see [Environment Variables](/docs/guides/environment-variables.md)).

## Testing

### Unit Tests (Bun)

```bash
bun run test:unit              # Run all tests
bun run test:watch      # Watch mode
bun run test:coverage   # With coverage
```

Test files: `test/*.test.ts`

### E2E Tests (Playwright)

```bash
bun run test:e2e        # Run E2E tests
bun run test:e2e:ui     # Run with interactive UI
bun run test:e2e:headed # Run headed (visible browser)
bun run test:e2e:report # View HTML report
```

Test files: `.e2e/*.test.ts`

### Load Tests (k6)

```bash
bun run test:load        # Smoke test (/api endpoint)
bun run test:load:api    # API load test
bun run test:load:stress # Stress test
```

Test files: `test/load-tests/*.js`

### Test Commands

| Command             | Description          |
| ------------------- | -------------------- |
| `bun run test:unit` | Unit tests           |
| `bun run test:e2e`  | E2E tests            |
| `bun run test:load` | Load tests           |
| `bun run lint:fix`  | Auto-fix lint issues |
| `bun run typecheck` | Type checking        |

## Security

### Running Security Audit

```bash
bun run security     # Run security audit
```

The security audit uses Bun's built-in vulnerability scanner to check dependencies for known vulnerabilities.

### CI Security Scanning

Security scans run automatically in GitHub Actions on every PR and push to main. The scan includes:

- Dependency vulnerability scanning
- Advisory database checks

## Building

```bash
bun run build     # Production build
bun run start    # Run production server
```

## Project Structure

```bash
src/
├── config/            # Central config (API name, rate limits, CORS, helmet)
│   └── index.ts
├── env.ts              # Isomorphic env fetching with type-safe validation
├── lib/                # Library code
│   ├── auth/          # Better Auth
│   │   ├── index.ts   # Server auth instance
│   │   └── client.ts  # Client auth hooks and methods
│   └── db/           # Database (Drizzle + SQLite)
│       ├── index.ts
│       └── schema.ts
├── logger.ts           # Logger configuration
├── middlewares/        # Middleware implementations
│   ├── cors.ts       # CORS headers
│   ├── helmet.ts     # Security headers
│   ├── rate-limit.ts # Rate limiting
│   └── index.ts      # Export barrel
├── router.tsx         # TanStack Router configuration
├── routeTree.gen.ts  # Auto-generated route tree
├── routes/           # File-based routing
│   ├── __root.tsx   # Root route
│   ├── index.tsx    # Home route
│   ├── auth/        # Auth routes
│   ├── profile/     # Profile route
│   ├── settings/    # Settings route
│   ├── docs/        # Documentation routes
│   ├── blog/        # Blog routes
│   ├── changelog/   # Changelog routes
│   ├── status/      # Status page routes
│   └── api/         # API routes
│       ├── $.ts     # API catch-all
│       └── auth/    # Auth routes
│           └── $.ts
├── server.ts         # TanStack Start server entry
├── types/            # TypeScript type definitions
│   └── subscription.ts
├── utils.ts          # Utility functions
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── auth/        # Auth components
│   ├── profile/     # Profile components
│   ├── settings/    # Settings components
│   ├── header.tsx   # Common header
│   ├── footer.tsx   # Common footer
│   ├── branding.tsx # Branding component
│   └── theme/       # Theme components
└── styles/
    └── app.css      # Global styles
```

## Test Structure

```bash
test/                  # Unit tests (Bun)
├── components/        # Component unit tests
│   ├── ui.test.tsx       # Button, Badge, Card, Separator
│   ├── ui-additional.test.tsx # Label, Switch, Skeleton, Input, Tabs, Accordion
│   ├── header.test.tsx  # Header component
│   ├── branding.test.tsx # Branding component
│   └── footer.test.tsx  # Footer component
├── routes/            # Route tests
├── db.test.ts        # Database tests
├── auth.test.ts      # Auth tests
└── fixtures/         # Test fixtures
    └── db.ts

.e2e/                 # E2E tests (Playwright)
├── ui/               # UI E2E tests
│   ├── auth.spec.ts      # Authentication tests
│   ├── components.spec.ts # UI component tests
│   ├── navigation.spec.ts # Navigation tests
│   ├── docs.spec.ts      # Documentation tests
│   ├── root.spec.ts      # Landing page tests
│   ├── status.spec.ts   # Status page tests
│   ├── blog.spec.ts     # Blog tests
│   └── changelog.spec.ts # Changelog tests
├── api/              # API E2E tests
│   └── endpoints.spec.ts # API endpoints
└── config.ts         # E2E configuration
```

## Code Generation

The `routeTree.gen.ts` file is auto-generated by TanStack Router. Run `bun run dev` to generate it.

## Middleware Development

To add a new middleware:

1. Create `src/middlewares/<name>.ts`
2. Export an Elysia instance
3. Import in `src/server.ts`
4. Add to `src/middlewares/index.ts` exports

## API Development

Add routes in `src/routes/api/$.ts`:

```typescript
app.get("/endpoint", ({ set }) => {
  set.headers["Content-Type"] = "application/json";
  return { data: "value" };
});
```

## Environment Variables

Create `.env` for local development:

```bash
HOST=localhost
PORT=3000
VITE_API_URL=http://localhost:3000/api
```

See [Environment Variables](/docs/guides/environment-variables.md) for details.