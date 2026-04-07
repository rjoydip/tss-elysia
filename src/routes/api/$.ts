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
import { connectionStore } from "~/lib/realtime";
import { getDatabaseHeartbeat } from "~/lib/db/heartbeat";

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
  // Mount realtime websocket plugin so /api/ws and /api/ws/health are reachable.
  .use(websocketPlugin)
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
  )

  /**
   * Health check endpoint for monitoring.
   * Used by load balancers and orchestration systems (Kubernetes, etc.)
   * Returns simple JSON with service status.
   */
  .get(
    "/health",
    async ({ store: { name } }) => {
      return new Response(
        JSON.stringify({
          name,
          status: "healthy",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    },
    {
      detail: {
        summary: "Get API health",
        description: "Get API health",
        tags: ["api-health"],
        responses: {
          200: { description: "Success" },
        },
      },
    },
  )
  /**
   * Realtime discovery endpoint.
   * Provides the public websocket endpoint that clients should connect to.
   */
  .get(
    "/realtime",
    () =>
      new Response(
        JSON.stringify({
          websocketEndpoint: `${API_PREFIX}/ws`,
          healthEndpoint: `${API_PREFIX}/realtime/health`,
          requiresAuth: true,
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      ),
    {
      detail: {
        summary: "Get realtime endpoint metadata",
        description: "Returns websocket endpoint information for realtime clients",
        tags: ["api-realtime"],
      },
    },
  )
  /**
   * Realtime health endpoint.
   * Exposes connection counters for validation and operational monitoring.
   */
  .get(
    "/realtime/health",
    () =>
      new Response(
        JSON.stringify({
          status: "healthy",
          websocketPath: `${API_PREFIX}/ws`,
          totalConnections: connectionStore.getCount(),
          authenticatedConnections: connectionStore.getAuthenticatedCount(),
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      ),
    {
      detail: {
        summary: "Get realtime health",
        description: "Returns websocket readiness and connection statistics",
        tags: ["api-realtime"],
      },
    },
  )
  /**
   * Database heartbeat endpoint.
   * Executes a lightweight query to verify database liveness and response latency.
   */
  .get(
    "/database/heartbeat",
    () => {
      const heartbeat = getDatabaseHeartbeat();
      const statusCode = heartbeat.status === "healthy" ? 200 : 503;

      return new Response(JSON.stringify(heartbeat), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      });
    },
    {
      detail: {
        summary: "Get database heartbeat",
        description: "Runs a lightweight database liveness probe for status monitoring",
        tags: ["api-health", "api-database"],
      },
    },
  );

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