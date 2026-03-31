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
import { composedMiddleware } from "~/middlewares";
import { errorFn, traceFn } from "~/utils";

/**
 * Main API application instance.
 * Prefix: /api (configurable via API_PREFIX)
 * Includes all security middleware, tracing, and error handling.
 */
export const apiApp = new Elysia({
  name: "api-app",
  prefix: API_PREFIX,
})
  // Apply composed middleware (CORS, Helmet, Rate Limit, OpenTelemetry)
  .use(
    composedMiddleware({
      openAPP_NAME: "API",
    }),
  )
  // Request tracing for performance monitoring
  .trace(traceFn)
  // Centralized error handling
  .onError(errorFn)
  // Store application name
  .state("name", APP_NAME)

  /**
   * Health check endpoint for monitoring.
   * Used by load balancers and orchestration systems (Kubernetes, etc.)
   * Returns simple JSON with service status.
   */
  .get("/health", async ({ store: { name } }) => ({ name, status: "ok" }), {
    detail: {
      summary: "Get API health",
      description: "Get API health",
      tags: ["api-health"],
      responses: {
        200: { description: "Success" },
      },
    },
  })

  /**
   * Root endpoint for service information.
   * Returns welcome message identifying the API service.
   */
  .get(
    "/",
    ({ store: { name }, set }) => {
      set.headers["Content-Type"] = "text/plain; charset=utf-8";
      return `Welcome to ${name} Service`;
    },
    {
      detail: {
        summary: "Get API root",
        description: "Get API root",
        tags: ["api"],
        responses: {
          200: { description: "Success" },
        },
      },
    },
  );

/**
 * Request handler wrapper for TanStack Start integration.
 * Adapts Elysia handler to TanStack Start's server handler interface.
 */
const handle = ({ request }: { request: Request }) => apiApp.fetch(request);

/**
 * TanStack Start route definition.
 * Exposes API endpoints to the server for SSR and API handling.
 */
export const Route = createFileRoute(`/api/$`)({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
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
  .server(() => treaty(apiApp).api)
  // Client: Make HTTP requests to server
  .client(() => {
    const url =
      import.meta.env.VITE_API_URL ||
      (isBrowser ? window.location.origin : `http://${HOST}:${PORT}`);
    return treaty<typeof apiApp>(url).api;
  });