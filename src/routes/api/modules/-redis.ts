/**
 * Redis API endpoints plugin.
 * Hosts operational Redis liveness probes for the status dashboard.
 */

import { Elysia } from "elysia";
import { getRedisStatus } from "~/lib/redis";

/**
 * Redis heartbeat response example used for OpenAPI documentation.
 *
 * @remarks
 * The actual payload is produced by `getRedisStatus()`; this example
 * is kept generic to avoid coupling docs to internal implementation details.
 */
const redisHeartbeatExample = {
  status: "healthy",
  connected: true,
  url: "redis://***@localhost:6379",
  timestamp: new Date(0).toISOString(),
} as const;

/**
 * Redis API route group.
 * Mounted under `/api` by the core API application.
 */
export const redisRoutes = new Elysia({ name: "api.routes.redis", prefix: "/redis" }).get(
  "/heartbeat",
  async () => {
    const redisStatus = await getRedisStatus();
    const statusCode = redisStatus.connected ? 200 : 503;

    return new Response(
      JSON.stringify({
        status: redisStatus.connected ? "healthy" : "unhealthy",
        connected: redisStatus.connected,
        url: redisStatus.url,
        detail: redisStatus.error ?? "Redis heartbeat succeeded",
        timestamp: new Date().toISOString(),
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      },
    );
  },
  {
    detail: {
      summary: "Redis heartbeat",
      description:
        "Lightweight liveness probe for the Redis layer. Returns `200` when connected and `503` when unreachable.",
      tags: ["api", "redis", "health"],
      responses: {
        200: {
          description: "Redis is reachable and operating normally",
          content: { "application/json": { example: redisHeartbeatExample } },
        },
        503: {
          description: "Redis is unhealthy or unreachable",
          content: {
            "application/json": {
              example: {
                ...redisHeartbeatExample,
                status: "unhealthy",
                connected: false,
              },
            },
          },
        },
      },
    },
  },
);