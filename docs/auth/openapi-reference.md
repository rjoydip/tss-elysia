---
title: Auth API reference
description: Better Auth HTTP API under /api/auth — interactive OpenAPI and links to authentication docs
---

## Auth API reference

The **authentication HTTP API** is implemented with **Better Auth** and mounted at **`/api/auth/*`**. It is included in the same generated OpenAPI document as the rest of the application.

### Interactive documentation

- **[Scalar UI](/api/reference)** — In the UI, filter or search for operations tagged **`auth`** (and paths under `/api/auth`).
- **[OpenAPI JSON](/api/reference/json)** — For codegen, imports, or CI.

### Related documentation

- [Authentication overview](/docs/auth/overview) — how auth is configured and used in this project
- [API references (app + auth hub)](/docs/api/api-references) — single page linking both application and auth API entry points

### Implementation note

The catch-all auth route delegates to Better Auth’s handler, so concrete path templates and schemas reflect Better Auth’s version and configuration. Treat Scalar as the live contract alongside Better Auth’s own documentation.