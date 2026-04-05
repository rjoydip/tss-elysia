---
title: Middleware
description: CORS, Helmet, and Rate Limit setup
---

## Middleware

This project implements middleware for the Elysia server, providing security, performance, and functionality layers.

## Middleware Overview

Located in `src/middlewares/`:

| Middleware | File            | Purpose                                |
| ---------- | --------------- | -------------------------------------- |
| CORS       | `cors.ts`       | Cross-Origin Resource Sharing headers  |
| Helmet     | `helmet.ts`     | Security HTTP headers                  |
| Rate Limit | `rate-limit.ts` | Request rate limiting                  |
| Trace      | `index.ts`      | Request timing and performance tracing |
| Error      | `index.ts`      | Centralized error handling             |
| Composed   | `index.ts`      | Combined middleware bundle             |

## CORS Middleware

Configures CORS headers for cross-origin requests:

```typescript
// src/middlewares/cors.ts
import Elysia from "elysia";
import { corsConfig } from "~/config";

export const cors = new Elysia({ name: "cors" }).onRequest(({ set }) => {
  set.headers["Access-Control-Allow-Origin"] = corsConfig.origin;
  set.headers["Access-Control-Allow-Methods"] = corsConfig.methods.join(", ");
  set.headers["Access-Control-Allow-Headers"] = corsConfig.allowedHeaders.join(", ");
  // ...
});
```

### CORS Configuration (`src/config/index.ts`)

```typescript
export const corsConfig = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Request-Id", "X-Response-Time"],
  credentials: true,
  maxAge: 86400,
};
```

## Helmet Middleware

Adds security HTTP headers:

```typescript
// src/middlewares/helmet.ts
export const helmet = new Elysia({ name: "helmet" }).onRequest(({ set }) => {
  set.headers["X-Content-Type-Options"] = "nosniff";
  set.headers["X-Frame-Options"] = "DENY";
  set.headers["X-XSS-Protection"] = "1; mode=block";
  // ...
});
```

### Headers Applied

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (optional)
- `X-Powered-By: Elysia`
- `Referrer-Policy`
- `X-Permitted-Cross-Domain-Policies`

### Helmet Configuration (`src/config/index.ts`)

```typescript
export const helmetConfig = {
  contentSecurityPolicy: true,
  xContentTypeOptions: true,
  xFrameOptions: false,
  xXssProtection: false,
  strictTransportSecurity: false,
  xPoweredBy: false,
  referrerPolicy: "strict-origin-when-cross-origin",
  xPermittedCrossDomainPolicies: false,
};
```

## Rate Limit Middleware

Prevents abuse by limiting request rates:

```typescript
// src/middlewares/rate-limit.ts
export const rateLimitMiddleware = new Elysia({ name: "rate-limit" }).use(
  rateLimit({
    duration: rateLimitConfig.duration,
    max: rateLimitConfig.max,
    headers: true,
    scoping: "scoped",
    countFailedRequest: true,
    errorResponse: new Response(JSON.stringify({ error: "Too many requests" }), { status: 429 }),
  }),
);
```

### Configuration (`src/config/index.ts`)

```typescript
export const rateLimitConfig = {
  duration: 60_000, // 60 seconds
  max: 100, // 100 requests per duration
};
```

## Using Middlewares

All middlewares are exported from `src/middlewares/index.ts`:

```typescript
// src/middlewares/index.ts
export { cors, corsWithCredentials } from "./cors";
export { helmet } from "./helmet";
export { rateLimitMiddleware } from "./rate-limit";
export { traceFn, errorFn, composedMiddleware } from "./index";
```

## Trace Middleware

Request tracing for performance monitoring:

```typescript
// src/middlewares/index.ts
export const traceFn: TraceHandler = async ({
  onBeforeHandle,
  onAfterHandle,
  onError,
  onHandle,
  set,
}) => {
  // Track time in each pipeline stage
  onHandle(({ onStop }) => {
    onStop(({ elapsed }) => {
      set.headers["X-Elapsed"] = String(elapsed);
    });
  });
};
```

## Error Handling Middleware

Centralized error handling with JSON responses:

```typescript
// src/middlewares/index.ts
export const errorFn: ErrorHandler = ({ code, error }) => {
  const isProduction = process.env.NODE_ENV === "production";
  const errorMessage = isProduction
    ? "An unexpected error occurred"
    : error instanceof Error
      ? error.message
      : String(error);

  return new Response(JSON.stringify({ error: errorMessage }), {
    status: code === "NOT_FOUND" ? 404 : 500,
  });
};
```

## Composed Middleware

All middleware combined for easy integration:

```typescript
// src/middlewares/index.ts
export const composedMiddleware = (
  { openAPP_NAME }: ComposedMiddlewareOptions = { openAPP_NAME: APP_NAME },
) =>
  new Elysia({ name: "composed-middleware" })
    .use(cors)
    .use(corsWithCredentials)
    .use(helmet)
    .use(openapi({ ... }))
    .use(rateLimitMiddleware)
    .use(opentelemetry({ ... }));
```

## App Factory

Middlewares are integrated in `src/server.ts`:

```typescript
// src/server.ts
import { Elysia } from "elysia";
import { appConfig, logger } from "~/config";
import { cors, helmet, rateLimitMiddleware } from "~/middlewares";

export const createApp = (config?: ElysiaConfig<any>) =>
  new Elysia({
    ...appConfig,
    ...config,
  })
    .use(cors)
    .use(helmet)
    .use(rateLimitMiddleware)
    .trace(/* ... */)
    .onError(/* ... */);
```

## Adding Custom Middleware

To add a custom middleware:

1. Create a new file in `src/middlewares/`
2. Export an Elysia instance
3. Import and use in `src/server.ts`

```typescript
// src/middlewares/custom.ts
import Elysia from "elysia";

export const customMiddleware = new Elysia({ name: "custom" }).onRequest(({ set }) => {
  // Your logic
});
```

```typescript
// src/server.ts
import { customMiddleware } from "~/middlewares";

export const createApp = (config) =>
  new Elysia({ ... })
    .use(cors)
    .use(customMiddleware)  // Add here
    // ...
```