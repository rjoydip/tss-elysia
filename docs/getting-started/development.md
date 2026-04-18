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
bun test:unit              # Run all tests
bun test:unit --watch      # Watch mode
bun test:unit --coverage   # With coverage
bun test:unit test/config/docs.test.ts  # Run specific test file
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

Test files: `.k6/*.js`

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
│   ├── index.ts
│   └── docs.ts        # Documentation config (docMap, globKeyToDocPath, etc.)
├── hooks/             # Custom React hooks
│   └── use-mobile.ts
├── lib/                # Library code
│   ├── auth/          # Better Auth
│   │   ├── index.ts   # Server auth instance
│   │   └── client.ts  # Client auth hooks and methods
│   ├── db/           # Database (Drizzle + SQLite)
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── heartbeat.ts
│   ├── redis/        # Redis cache and Pub/Sub (Bun native)
│   │   ├── index.ts   # Client singleton, health check
│   │   └── pubsub.ts  # Typed channels and helpers
│   ├── mcp/          # MCP server modules
│   │   ├── server.ts
│   │   ├── auth.ts
│   │   ├── api-keys.ts
│   │   ├── rate-limit.ts
│   │   ├── transport.ts
│   │   ├── client/    # MCP client
│   │   └── tools/     # MCP tools
│   │       ├── catalog.ts
│   │       └── users.ts
│   ├── cache/        # Cache utilities
│   ├── realtime/      # WebSocket realtime
│   ├── rate-limit/   # Rate limiting implementation
│   ├── store/        # State management
│   │   ├── auth.ts
│   │   ├── preferences.ts
│   │   └── status.ts
│   ├── blog/         # Blog data
│   ├── changelog/    # Changelog data
│   └── logger.ts     # Logger configuration
├── middlewares/        # Middleware implementations
│   ├── cors.ts       # CORS headers
│   ├── helmet.ts     # Security headers
│   ├── rate-limit.ts # Rate limiting
│   └── index.ts      # Export barrel
├── plugins/           # Elysia plugins
├── router.tsx         # TanStack Router configuration
├── routeTree.gen.ts  # Auto-generated route tree
├── routes/           # File-based routing
│   ├── __root.tsx   # Root route
│   ├── index.tsx    # Home route
│   ├── (auth)/      # Auth routes (sign-in, sign-up, OTP)
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── otp.tsx
│   ├── (errors)/    # Error pages (401, 403, 404, 500, 503)
│   ├── account/     # Account routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── verify-email.tsx
│   ├── profile.tsx  # Profile page (wrapped with AuthGuard)
│   ├── settings.tsx # Settings page (wrapped with AuthGuard)
│   ├── docs.tsx     # Documentation layout
│   ├── docs.$.tsx   # Documentation catch-all
│   ├── blog.tsx     # Blog routes
│   ├── changelog.tsx # Changelog routes
│   ├── status.tsx   # Health monitoring dashboard
│   ├── _authenticated/ # Protected routes (all wrapped with AuthGuard)
│   │   ├── route.tsx   # Auth layout wrapper
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── users/
│   │   ├── chats/
│   │   ├── apps/
│   │   ├── help-center/
│   │   ├── errors/
│   │   └── settings/   # Settings sub-routes
│   └── api/         # API routes
│       ├── $.ts     # API catch-all
│       ├── auth/    # Auth routes
│       ├── mcp/    # MCP API routes
│       └── modules/ # API modules
├── server.ts         # TanStack Start server entry
├── types/            # TypeScript type definitions
│   └── subscription.ts
├── styles/
│   └── app.css      # Global styles (Tailwind CSS v4)
├── env.ts            # Type-safe environment configuration
├── logger.ts         # Logger configuration
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── auth/        # Auth components
│   │   ├── form/    # Auth form components (login, register, forgot-password)
│   │   ├── auth-guard.tsx  # Route protection component
│   │   ├── branding.tsx
│   │   └── footer.tsx
│   ├── docs/        # Documentation components
│   ├── profile/     # Profile components
│   ├── settings/    # Settings components
│   ├── layout/      # Layout components (app-sidebar, header, etc.)
│   ├── header.tsx  # Common header
│   ├── footer.tsx  # Common footer
│   ├── branding.tsx
│   └── theme/      # Theme components
└── utils.ts         # Utility functions
```

## Test Structure

```bash
test/                  # Unit tests (Bun)
├── config/           # Configuration tests
│   ├── docs.test.ts  # Docs config tests
│   ├── env.test.ts   # Environment config tests
│   └── index.test.ts # App config tests
├── middlewares/      # Middleware tests
│   ├── cors.test.ts  # CORS tests
│   ├── helmet.test.ts # Helmet tests
│   └── index.test.ts # Middleware index tests
├── hooks/            # Hook tests
│   └── use-mobile.test.ts
├── lib/              # Library tests
│   ├── auth/        # Auth tests
│   ├── db.test.ts   # Database tests
│   ├── logger.test.ts # Logger tests
│   ├── mcp/         # MCP tests
│   │   ├── api-keys.test.ts
│   │   ├── rate-limit.test.ts
│   │   └── tools/
│   │       ├── catalog.test.ts
│   │       └── users.test.ts
│   ├── redis/       # Redis tests
│   │   ├── redis.test.ts
│   │   └── pubsub.test.ts
│   ├── store/       # Store tests
│   │   ├── auth.test.ts
│   │   ├── preferences.test.ts
│   │   └── status.test.ts
│   ├── cache/       # Cache tests
│   └── realtime/    # Realtime tests
├── routes/           # Route tests
│   ├── status.test.ts # Status page tests
│   ├── api/         # API route tests
│   │   ├── core.test.ts
│   │   ├── auth/   # Auth API tests
│   │   ├── mcp/    # MCP API tests
│   │   └── modules.test.ts
│   ├── profile.test.ts
│   └── settings.test.ts
├── components/       # Component tests
│   ├── ui/          # UI component tests
│   ├── header.test.tsx
│   ├── footer.test.tsx
│   ├── branding.test.tsx
│   └── theme/       # Theme tests

.e2e/                 # E2E tests (Playwright)
├── ui/               # UI E2E tests (split by component)
│   ├── button.spec.ts
│   ├── input.spec.ts
│   ├── auth.spec.ts
│   ├── navigation.spec.ts
│   ├── mobile.spec.ts
│   └── ...
├── api/              # API E2E tests
│   ├── endpoints.spec.ts
│   ├── redis-health.spec.ts
│   └── openapi.spec.ts
├── routes/           # Route E2E tests
│   ├── auth.spec.ts
│   ├── profile.spec.ts
│   ├── settings.spec.ts
│   ├── docs.spec.ts
│   ├── blog.spec.ts
│   ├── changelog.spec.ts
│   └── status.spec.ts
├── middlewares/      # Middleware tests
│   ├── rate-limit.spec.ts
│   ├── cors.spec.ts
│   ├── helmet.spec.ts
│   └── trace.spec.ts
├── realtime/         # WebSocket tests
│   └── websocket.spec.ts
├── auth.spec.ts      # Auth flow tests
├── _config.ts        # E2E configuration
├── _setup.ts         # Global setup
└── _teardown.ts      # Global teardown
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