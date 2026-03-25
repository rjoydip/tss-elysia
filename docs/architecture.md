# Architecture

This document describes the system architecture of the tss-elysia project, following patterns from try-elysia.

## Overview

The application follows a server-side rendering (SSR) architecture using TanStack Start with Elysia as the backend framework.

```bash
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ React 19    │  │ TanStack    │  │ TanStack Start          │  │
│  │ Components  │  │ Router      │  │ Client                  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Server (Bun/Node)                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  TanStack Start Server                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │   │
│  │  │ Vite Dev    │  │ Elysia      │  │ API Routes      │   │   │
│  │  │ Server      │  │ App         │  │ (/api/*)        │   │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Middlewares                           │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────┐   │   │
│  │  │ CORS      │ │ Helmet    │ │ Rate-Limit│ │ Vite    │   │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └─────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Client Layer

| Component        | File                   | Purpose                |
| ---------------- | ---------------------- | ---------------------- |
| React Components | `src/routes/*.tsx`     | UI components          |
| Router           | `src/router.tsx`       | TanStack Router config |
| Route Tree       | `src/routeTree.gen.ts` | Auto-generated routes  |

### 2. Server Layer

| Component    | File                  | Purpose                     |
| ------------ | --------------------- | --------------------------- |
| Server Entry | `src/server.ts`       | TanStack Start entry        |
| App Factory  | `src/_app.ts`         | Elysia app with middlewares |
| API Routes   | `src/routes/api.$.ts` | API endpoints               |

### 3. Configuration Layer

| Component | File             | Purpose                                              |
| --------- | ---------------- | ---------------------------------------------------- |
| Config    | `src/_config.ts` | Central config (API name, rate limits, CORS, helmet) |
| Env       | `src/_env.ts`    | Type-safe environment variables                      |

### 4. Middleware Layer

| Middleware | File                             | Purpose                |
| ---------- | -------------------------------- | ---------------------- |
| CORS       | `src/middlewares/_cors.ts`       | Cross-Origin headers   |
| Helmet     | `src/middlewares/_helmet.ts`     | Security headers       |
| Rate Limit | `src/middlewares/_rate-limit.ts` | Request throttling     |
| Vite       | `src/middlewares/_vite.ts`       | Dev server integration |

## Data Flow

### Request Flow

1. **Client Request** → Browser sends HTTP request to server
2. **Vite Middleware** (dev) or **Static** (prod) handles request
3. **CORS** → Validates cross-origin headers
4. **Helmet** → Adds security headers
5. **Rate Limit** → Checks request limits
6. **Route Handler** → Processes API or SSR route
7. **Response** → Returns JSON (API) or HTML (SSR)

### Environment Flow

1. **Load** → `src/_env.ts` loads at startup
2. **Validate** → Type-safe schema validation
3. **Runtime Detect** → Identifies Bun/Node/Deno
4. **Proxy** → Enforces client/server boundaries

## Configuration Hierarchy

```bash
package.json
    │
    ▼
vite.config.ts
    │
    ▼
src/_config.ts (API_PREFIX, rateLimitConfig, corsConfig, helmetConfig)
    │
    ▼
src/_env.ts (runtimeEnv)
    │
    ▼
src/_app.ts (createApp with middleware)
    │
    ▼
src/routes/api.$.ts (API routes)
```

## File Structure

```bash
src/
├── _app.ts           # Elysia app factory
├── _api.ts           # Base API definition
├── _config.ts        # Central configuration
├── _env.ts           # Environment variables
├── router.tsx        # TanStack Router
├── server.ts         # Server entry point
├── middlewares/      # Middleware implementations
│   ├── _cors.ts
│   ├── _helmet.ts
│   ├── _rate-limit.ts
│   ├── _vite.ts
│   └── index.ts
├── routes/           # TanStack Start routes
│   ├── __root.tsx
│   ├── index.tsx
│   └── api.$.ts
└── styles/
    └── app.css
```

## SSR/CSR Strategy

- **Initial Load**: Server-side rendered HTML
- **Navigation**: Client-side navigation via TanStack Router
- **API Calls**: Server functions via TanStack Start
- **Hydration**: React 19 automatic hydration

## Security

- Server-only env variables protected from client
- CORS configured for allowed origins
- Helmet adds security headers
- Rate limiting prevents abuse

## Performance

- Vite HMR for fast development
- Tailwind CSS v4 for optimized CSS
- Elysia's native static response
- Rate limiting for DoS prevention
