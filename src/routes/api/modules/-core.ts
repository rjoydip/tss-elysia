/**
 * Core API endpoints plugin.
 * Encapsulates base `/api` informational and health routes.
 */

import { Elysia } from "elysia";
import { APP_NAME } from "~/config";
import { realtimeRoutes } from "./-realtime";
import { databaseRoutes } from "./-database";

/**
 * Core API route group.
 * Mounted under `/api` by the root API application.
 */
export const coreRoutes = new Elysia({ name: "api.routes.core" })
  .use(realtimeRoutes)
  .use(databaseRoutes)
  .get(
    "/",
    ({ set }) => {
      set.headers["Content-Type"] = "text/plain; charset=utf-8";
      return `Welcome to ${APP_NAME} Service`;
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
  .get(
    "/health",
    async () =>
      new Response(
        JSON.stringify({
          name: APP_NAME,
          status: "healthy",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      ),
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
  );