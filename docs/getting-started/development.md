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
bun test              # Run all tests
bun test --watch      # Watch mode
bun test --coverage   # With coverage
bun test test/config/docs.test.ts  # Run specific test file
```

Test files: `test/**/*.test.ts`

### E2E Tests (Playwright)

```bash
bun run test:e2e              # Run all E2E tests
bun run test:e2e -- .e2e/ui/  # Run UI tests only
bun run test:e2e -- .e2e/api/ # Run API tests only
```

Test files: `.e2e/**/*.spec.ts`

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
│   └── redis/        # Redis cache and Pub/Sub (Bun native)
│       ├── index.ts   # Client singleton, health check
│       └── pubsub.ts  # Typed channels and helpers
│   └── mcp/          # MCP server modules
│       ├── server.ts
│       ├── auth.ts
│       ├── api-keys.ts
│       ├── rate-limit.ts
│       ├── transport.ts
│       └── tools/
├── lib/logger.ts       # Logger configuration
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
│   ├── account/     # Account routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── verify-email.tsx
│   ├── profile.tsx  # Profile page
│   ├── settings.tsx # Settings page
│   ├── docs.tsx     # Documentation layout
│   ├── docs.$.tsx   # Documentation catch-all
│   ├── blog.tsx     # Blog routes
│   ├── changelog.tsx # Changelog routes
│   ├── status.tsx   # Health monitoring dashboard
│   └── api/         # API routes
│       ├── $.ts     # API catch-all
│       └── auth/    # Auth routes
│           └── $.ts
│       └── mcp/     # MCP API routes
│           ├── $.ts
│           └── -keys.ts
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
├── config/           # Configuration tests
│   ├── docs.test.ts  # Docs config tests
│   └── index.test.ts # App config tests
├── middlewares/      # Middleware tests
│   ├── cors.test.ts  # CORS tests
│   ├── helmet.test.ts # Helmet tests
│   └── index.test.ts # Middleware index tests
├── hooks/            # Hook tests
├── lib/              # Library tests
├── routes/           # Route tests
│   └── status.test.ts # Status page tests
├── store/            # Store tests
├── components/       # Component tests
│   └── ui/          # UI component tests
├── db.test.ts        # Database tests
├── lib/auth.test.ts  # Auth tests
├── routes/api/mcp/   # MCP API route tests
│   ├── $.test.ts
│   └── keys.test.ts
├── lib/mcp/          # MCP unit tests
│   ├── api-keys.test.ts
│   ├── rate-limit.test.ts
│   └── tools/
│       └── catalog.test.ts
└── fixtures/         # Test fixtures
    └── db.ts

.e2e/                 # E2E tests (Playwright)
├── ui/               # UI E2E tests (split by component)
│   ├── auth.spec.ts      # Authentication tests
│   ├── button.spec.ts   # Button tests
│   ├── input.spec.ts    # Input tests
│   ├── navigation.spec.ts # Navigation tests
│   ├── docs.spec.ts      # Documentation tests
│   ├── root.spec.ts      # Landing page tests
│   ├── status.spec.ts   # Status page tests
│   ├── blog.spec.ts     # Blog tests
│   └── ...
├── api/              # API E2E tests
│   ├── endpoints.spec.ts # API endpoints
│   └── middlewares.spec.ts # Middleware tests
├── middlewares/       # Middleware-specific tests
│   └── rate-limit.spec.ts # Rate limit tests
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

Add routes in `src/routes/api/$.ts` or split feature routes under `src/routes/api/<feature>/` (for example `src/routes/api/mcp/$.ts`):

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