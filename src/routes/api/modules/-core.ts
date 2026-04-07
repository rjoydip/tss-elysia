/**
 * Core API endpoints plugin.
 * Encapsulates base `/api` informational and health routes.
 */

import { Elysia } from "elysia";
import { APP_NAME } from "~/config";

/**
 * Core API route group.
 * Mounted under `/api` by the root API application.
 */
export const coreApiRoutes = new Elysia({ name: "api.routes.core" })
  // Store application name
  .state("name", APP_NAME)
  .get(
    "/",
    ({ set, store: { name } }) => {
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
  .get(
    "/health",
    async ({ store: { name } }) =>
      new Response(
        JSON.stringify({
          name,
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