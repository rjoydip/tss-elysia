# Environment Variables

This project uses type-safe environment variables with isomorphic fetching, supporting both client and server environments.

## Server Configuration

| Variable        | Default         | Description                              |
| --------------- | --------------- | ---------------------------------------- |
| `HOST`          | `localhost`     | Server host                              |
| `PORT`          | `3000`          | Server port                              |
| `VITE_API_URL`  | Dynamic         | Client API URL for Eden Treaty           |
| `DATABASE_PATH` | `.artifacts`    | SQLite database file path                |
| `DATABASE_NAME` | `tss-elysia.db` | SQLite database file name                |
| `DATABASE_URL`  | -               | Database connection URL (future use)     |
| `AUTH_SECRET`   | Auto-generated  | Authentication secret for session tokens |

## Database Configuration

| Variable        | Default         | Description                  |
| --------------- | --------------- | ---------------------------- |
| `DATABASE_PATH` | `.artifacts`    | Path to SQLite database file |
| `DATABASE_NAME` | `tss-elysia.db` | Path to SQLite database name |

The database path can be customized via environment variables:

```bash
# Use custom database location
DATABASE_NAME=./custom/path/database.db bun run dev

# Use in-memory database for testing
DATABASE_NAME=:memory: bun run dev
```

## E2E Testing Configuration

E2E configuration is centralized in `.e2e/config.ts` and consumed by both `playwright.config.ts` and test files.

| Variable          | Default                    | Description              |
| ----------------- | -------------------------- | ------------------------ |
| `E2E_HOST`        | `localhost`                | E2E test server host     |
| `E2E_PORT`        | `3000`                     | E2E test server port     |
| `E2E_BASE_URL`    | Dynamic                    | Full URL for E2E tests   |
| `BETTER_AUTH_URL` | `${E2E_BASE_URL}/api/auth` | Auth service URL for E2E |

```typescript
// .e2e/config.ts
const host = process.env.E2E_HOST || process.env.HOST || "localhost";
const port = process.env.E2E_PORT || process.env.PORT || "3000";

export const E2E_BASE_URL = process.env.E2E_BASE_URL || `http://${host}:${port}`;
export const E2E_HOST = host;
export const E2E_PORT = port;
```

## Environment Files

Create a `.env` file in the project root:

```bash
# .env
HOST=localhost
PORT=3000
```

## Setup

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

## Isomorphic Env Fetching

The project uses `src/_env.ts` for type-safe environment variables that work in both client and server contexts:

```typescript
// src/_env.ts
export const env = await _createEnv({
  client: {
    VITE_API_URL: t.String(), // Client-only vars
    DATABASE_NAME: t.String(), // Available on both client and server
  },
  server: {
    API_URL: t.String(), // Server-only vars
    BETTER_AUTH_URL: t.String(),
    BETTER_AUTH_SECRET: t.String(),
    DATABASE_URL: t.String(),
    DATABASE_PATH: t.String(),
    PORT: t.Number(),
  },
  runtimeEnv: () => ({
    VITE_API_URL: _getEnv("VITE_API_URL", ""),
    API_URL: _getEnv("API_URL", "http://localhost:3000/api"),
    BETTER_AUTH_URL: _getEnv("BETTER_AUTH_URL", "http://localhost:3000/api/auth"),
    BETTER_AUTH_SECRET: _getAuthSecret(),
    DATABASE_URL: _getEnv("DATABASE_URL", ""),
    DATABASE_PATH: _getEnv("DATABASE_PATH", ".artifacts"),
    DATABASE_NAME: _getEnv("DATABASE_NAME", "tss-elysia.db"),
    PORT: parseInt(_getEnv("PORT", "3000"), 10),
  }),
});
```

### Database Setup

The database path is configurable via `DATABASE_NAME`:

```bash
# Default location
DATABASE_PATH=.artifacts DATABASE_NAME=tss-elysia.db bun run db:migrate

# Custom location
DATABASE_PATH=.artifacts DATABASE_NAME=production.db bun run db:migrate

# In-memory (for testing)
DATABASE_NAME=:memory: bun run seed
```

After setting `DATABASE_NAME`, run migrations and seed:

```bash
DATABASE_PATH=.artifacts DATABASE_NAME=tss-elysia.db bun run db:migrate
DATABASE_PATH=.artifacts DATABASE_NAME=tss-elysia.db bun run db:seed
```

### Client Environment Variables

Client-side variables must be prefixed with `VITE_`:

```typescript
// Access in client code
import { env } from "~/_env";

console.log(env.VITE_API_URL); // Available in browser
// env.AUTH_SECRET would throw - server-only
```

#### Eden Treaty Dynamic URL

The client-side API client uses a dynamic URL resolution:

1. First checks `VITE_API_URL` environment variable
2. Falls back to `window.location.origin` in browser
3. Defaults to `http://localhost:3000` for SSR

```typescript
// src/routes/api.$.ts
export const getAPI = createIsomorphicFn()
  .server(() => treaty(app).api)
  .client(() => {
    const url =
      import.meta.env.VITE_API_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    return treaty<typeof app>(url).api;
  });
```

Set `VITE_API_URL` for production or custom preview servers:

```bash
VITE_API_URL=http://custom-server:4000 bun run preview
```

### Server Environment Variables

Server-only variables are protected from client access:

```typescript
// Server-side code has full access
import { env } from "~/_env";

console.log(env.API_URL); // Available on server
console.log(env.AUTH_SECRET); // Available on server
```

## Runtime Detection

The env module automatically detects the runtime:

- **Bun**: Uses `Bun.env`
- **Node.js**: Uses `process.env`
- **Deno**: Uses `Deno.env`
- **Browser**: Limited to client variables

## Usage

### Development

```bash
# Run on custom port
PORT=3000 bun run dev
# Or
bun run --env-file=.env dev

# Run on custom host
HOST=0.0.0.0 bun run dev
# Or
bun run --env-file=.env dev

# Both
HOST=0.0.0.0 PORT=3000 bun run dev
# Or
bun run --env-file=.env dev
```

### Production

```bash
# Build and run with custom port
bun run build && PORT=3000 bun run start
```

### Testing

Load tests and E2E tests also support these variables:

```bash
# Run load test on custom port
PORT=3000 bun run test:load
# Or
bun run --env-file=.env test:load

# Run E2E tests on custom host/port
HOST=localhost PORT=3000 bun run test:e2e
# Or
bun run --env-file=.env test:e2e
```

Or use `BASE_URL` for full URL override:

```bash
BASE_URL=http://localhost:3000 bun run test:load
# Or
bun run --env-file=.env test:load
```

### CI Environment

In GitHub Actions, E2E tests use these environment variables:

```yaml
env:
  E2E_HOST: "localhost" # Resolved to container IP dynamically
  E2E_PORT: "4173" # Preview server port
  BETTER_AUTH_SECRET: "your-secret-min-32-chars" # Required in production
```

The CI workflow resolves the container's host IP dynamically and sets `E2E_BASE_URL` and `BETTER_AUTH_URL` accordingly.

## Validation

Environment variables are validated at runtime using Elysia's type system:

- If validation fails, the app will throw an error with details
- In production, missing required variables will cause startup failure
- In development, missing optional variables use defaults with a warning

## Security

- Server-only variables (`AUTH_SECRET`, `DATABASE_URL`) are protected from client access
- Accessing server variables from the browser throws an error
- The env module uses a Proxy to enforce these boundaries
