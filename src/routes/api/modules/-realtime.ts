/**
 * Realtime API endpoints plugin.
 * Groups websocket discovery and health endpoints under `/api/realtime*`.
 */

import { Elysia } from "elysia";
import { API_PREFIX } from "~/config";
import { connectionStore } from "~/lib/realtime";

/**
 * Realtime API route group.
 * Mounted under `/api` by the root API application.
 */
export const realtimeApiRoutes = new Elysia({ name: "api.routes.realtime" })
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
  );