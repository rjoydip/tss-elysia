/**
 * Database API endpoints plugin.
 * Hosts operational database liveness probes.
 */

import { Elysia } from "elysia";
import { getDatabaseHeartbeat } from "~/lib/db/heartbeat";

/**
 * Database API route group.
 * Mounted under `/api` by the root API application.
 */
export const databaseApiRoutes = new Elysia({ name: "api.routes.database" }).get(
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