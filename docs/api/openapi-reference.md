---
title: API references
description: Application HTTP API and Authentication (Better Auth) API — links to interactive OpenAPI and JSON spec
---

## API references

This site exposes **one** OpenAPI 3 document for the whole Elysia server. The sections below split how you use it for **application** routes versus **authentication** routes; Scalar lets you filter by **tag** (`api`, `auth`, `mcp`, and others).

### Application & platform API

Use this for non-auth HTTP routes: service health, realtime discovery, database heartbeat, MCP public endpoints, and MCP API keys.

| Resource                      | Location                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Interactive docs (Scalar)** | [/api/reference](/api/reference) — filter tags such as `api`, `mcp`, `database`, `realtime`, `health` |
| **OpenAPI JSON**              | [/api/reference/json](/api/reference/json)                                                            |
| **Route map & layout**        | [API overview](/docs/api/overview)                                                                    |

### Authentication API (Better Auth)

Auth is served under **`/api/auth/*`** (see tag **`auth`** in the same spec). Request and response shapes follow **Better Auth**; use Scalar to inspect the catch-all handler and the [Authentication overview](/docs/auth/overview) for how sessions and clients are set up in this project.

| Resource                       | Location                                                          |
| ------------------------------ | ----------------------------------------------------------------- |
| **Interactive docs (Scalar)**  | [/api/reference](/api/reference) — focus operations tagged `auth` |
| **OpenAPI JSON**               | [/api/reference/json](/api/reference/json)                        |
| **Auth concepts in this repo** | [Authentication overview](/docs/auth/overview)                    |
| **Auth API sidebar entry**     | [Auth API reference](/docs/auth/api-reference)                    |

### More detail on OpenAPI

For notes on cookies, base path, and MCP, see [OpenAPI reference](/docs/api/reference).