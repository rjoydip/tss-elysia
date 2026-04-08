/**
 * Main API route handler.
 * Sets up the core API application with middleware and routes.
 * Provides health checks and service information endpoints.
 */

import { Elysia } from "elysia";
import { treaty } from "@elysiajs/eden";
import { createFileRoute } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { API_PREFIX, APP_NAME, HOST, PORT, isBrowser } from "~/config";
import { composedMiddleware, errorFn, traceFn } from "~/middlewares";
import { websocketPlugin } from "~/plugins/websocket";
import { coreRoutes } from "./modules/-core";
import { mcpCoreRoutes } from "./mcp/modules/-core";
import { authCoreRoutes } from "./auth/modules/-core";

/**
 * Main API application instance.
 * Prefix: /api (configurable via API_PREFIX)
 * Includes all security middleware, tracing, and error handling.
 * Includes WebSocket endpoint registration for real-time features.
 */
export const apiRoutes = new Elysia({
  name: "root.api",
  prefix: API_PREFIX,
})
  // Apply composed middleware (CORS, Helmet, Rate Limit, OpenTelemetry)
  .use(
    composedMiddleware({
      OPENAPI_NAME: APP_NAME,
    }),
  )
  // Request tracing for performance monitoring
  .trace(traceFn)
  // Centralized error handling
  .onError(errorFn)
  // Mount realtime websocket plugin so /api/ws and /api/ws/health are reachable.
  .use(websocketPlugin)
  /**
   * Compose modular route groups so endpoint ownership is explicit and maintainable.
   */
  .use(coreRoutes)
  .use(authCoreRoutes)
  .use(mcpCoreRoutes);

/**
 * Request handler wrapper for TanStack Start integration.
 * Adapts Elysia handler to TanStack Start's server handler interface.
 */
const handle = ({ request }: { request: Request }) => apiRoutes.fetch(request);

/**
 * TanStack Start route definition.
 * Exposes API endpoints to the server for SSR and API handling.
 */
export const Route = createFileRoute(`/api/$`)({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
      OPTIONS: handle,
    },
  },
});

/**
 * Isomorphic API client for type-safe API calls.
 * Works both on server (SSR) and client (browser) with proper typing.
 * Uses Eden Treaty for end-to-end type safety.
 *
 * @example
 * // Server-side (SSR):
 * const api = getAPI()
 * const result = await api.health.get()
 *
 * // Client-side:
 * const api = getAPI()
 * const result = await api.health.get()
 */
export const getAPI = createIsomorphicFn()
  // Server: Use in-process Elysia handler (no HTTP overhead)
  .server(() => treaty(apiRoutes).api)
  // Client: Make HTTP requests to server
  .client(() => {
    const url =
      import.meta.env.VITE_API_URL ||
      (isBrowser ? window.location.origin : `http://${HOST}:${PORT}`);
    return treaty<typeof apiRoutes>(url).api;
  });