---
title: API Reference
description: API endpoints and server routes reference
---

## API Reference

## Server Routes

This project uses TanStack Start with file-based routing. Routes are defined in `src/routes/`.

### Current Routes

| Method | Path           | Description       |
| ------ | -------------- | ----------------- |
| GET    | `/`            | Home page (SSR)   |
| GET    | `/account/*`   | Account routes    |
| GET    | `/api`         | API root endpoint |
| GET    | `/api/*`       | API catch-all     |
| GET    | `/api/health`  | Health check      |
| GET    | `/blog/*`      | Blog routes       |
| GET    | `/changelog/*` | Changelog routes  |
| GET    | `/docs/*`      | Docs routes       |
| GET    | `/profile`     | Profile page      |
| GET    | `/settings/*`  | Settings routes   |
| GET    | `/status`      | Health monitor    |

### Route File Structure

```bash
src/routes/
  __root.tsx        # Root route (layout)
  index.tsx         # Home page (/)
  account/          # Account routes
    login.tsx
    register.tsx
    forgot-password.tsx
    verify-email.tsx
  api/
    $.ts           # API catch-all route (/api/*)
    auth/
      $.ts         # Auth route (/api/auth/*)
  blog.tsx          # Blog routes
  changelog.tsx     # Changelog routes
  docs.tsx          # Documentation layout
  docs.$.tsx        # Docs catch-all (/docs/*)
  profile.tsx        # Profile page
  settings.tsx       # Settings page
  status.tsx        # Health monitoring dashboard
```

### API Route Implementation

The API uses Elysia with the following structure:

```typescript
// src/routes/api/$.ts
import { createFileRoute } from "@tanstack/react-router";
import { createApp } from "~/server";
import { API_PREFIX, APP_NAME } from "~/config";

export const app = createApp({
  prefix: API_PREFIX,
})
  .state("name", APP_NAME)
  .get("/health", async ({ store: { name } }) => ({ name, status: "ok" }))
  .get("/", ({ store: { name }, set }) => {
    set.headers["Content-Type"] = "text/plain; charset=utf-8";
    return `Welcome to ${name}`;
  });

const handle = ({ request }: { request: Request }) => app.fetch(request);

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
```

### Adding a New Route

Create a new file in `src/routes/`:

```typescript
// src/routes/about.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return <div>About Us</div>;
}
```

### Adding an API Route

Extend the API in `src/routes/api/$.ts` or create a new file in `src/routes/api/`:

```typescript
// src/routes/api/users.ts
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/users")({
  loader: async () => {
    return {
      users: [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
      ],
    };
  },
});
```

### Using Loaders in Components

```typescript
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/users")({
  component: UsersPage,
  loader: async () => {
    return { users: [{ id: 1, name: "John" }] };
  },
});

function UsersPage() {
  const { users } = Route.useLoaderData();
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Client API

### Router

```typescript
import { getRouter } from "~/router";

const router = getRouter();
```

### Links

```typescript
import { Link } from "@tanstack/react-router";

<Link to="/">Home</Link>
```

## Error Handling

- `defaultErrorComponent` - 500 errors
- `defaultNotFoundComponent` - 404 errors

Configure in `src/router.tsx`:

```typescript
const router = createRouter({
  defaultErrorComponent: () => <div>Internal Server Error</div>,
  defaultNotFoundComponent: () => <div>Not Found</div>,
});
```

## Configuration

### App Config (`src/config/index.ts`)

Central configuration for the application:

```typescript
export const API_PREFIX = `/api`;
export const APP_NAME = "TSS ELYSIA";

export const appConfig: ElysiaConfig<any> = {
  normalize: true,
  prefix: "",
  nativeStaticResponse: true,
  websocket: { idleTimeout: 30 },
};

export const rateLimitConfig = {
  duration: 60_000,
  max: 100,
};

export const corsConfig = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Request-Id", "X-Response-Time"],
  credentials: true,
  maxAge: 86400,
};
```

### Environment Variables (`src/env.ts`)

Type-safe environment variable handling:

```typescript
export const env = await _createEnv({
  client: { VITE_API_URL: t.String() },
  server: {
    API_URL: t.String(),
    AUTH_SECRET: t.String(),
    DATABASE_URL: t.String(),
    PORT: t.Number(),
  },
  runtimeEnv: () => ({
    VITE_API_URL: _getEnv("VITE_API_URL", ""),
    API_URL: _getEnv("API_URL", "http://localhost:3000/api"),
    AUTH_SECRET: _getAuthSecret(),
    DATABASE_URL: _getEnv("DATABASE_URL", ""),
    PORT: parseInt(_getEnv("PORT", "3000"), 10),
  }),
});
```