/**
 * MCP health check endpoint.
 * Returns server status and connection metrics.
 */

import { Elysia } from "elysia";
import { sessionManager } from "~/lib/mcp/transport";
import { getMcpServer } from "~/lib/mcp/server";
import { createFileRoute } from "@tanstack/react-router";
import { composedMiddleware, errorFn, traceFn } from "~/middlewares";
import { mcpKeysRoutes } from "./-keys";

/**
 * Maximum unauthenticated health checks allowed per requester in one time window.
 */
const HEALTH_RATE_LIMIT = 60;

/**
 * Duration of the health endpoint rate-limit window in milliseconds.
 */
const HEALTH_RATE_LIMIT_WINDOW_MS = 60_000;

type RegisteredToolInfo = {
  title?: string;
  description?: string;
};

/**
 * In-memory health endpoint limiter keyed by requester identity.
 * This mitigates probing abuse without requiring authenticated API keys.
 */
const healthRequestTracker = new Map<string, { count: number; resetAt: number }>();

/**
 * Resolves a best-effort requester key for health endpoint throttling.
 *
 * @param request - Incoming HTTP request
 * @returns Stable key for per-client throttling windows
 */
function getHealthRequesterKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "unknown";
}

/**
 * Applies fixed-window throttling to MCP health probes.
 *
 * @param request - Incoming request
 * @returns A 429 response when throttled, otherwise null
 */
function getHealthRateLimitResponse(request: Request): Response | null {
  const now = Date.now();
  const requesterKey = getHealthRequesterKey(request);
  const existing = healthRequestTracker.get(requesterKey);

  // Opportunistic cleanup to avoid unbounded memory usage in long-lived processes.
  for (const [key, record] of healthRequestTracker.entries()) {
    if (now > record.resetAt) {
      healthRequestTracker.delete(key);
    }
  }

  if (!existing || now > existing.resetAt) {
    healthRequestTracker.set(requesterKey, {
      count: 1,
      resetAt: now + HEALTH_RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  if (existing.count >= HEALTH_RATE_LIMIT) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        limit: HEALTH_RATE_LIMIT,
        resetAt: new Date(existing.resetAt).toISOString(),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((existing.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(HEALTH_RATE_LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(existing.resetAt / 1000)),
        },
      },
    );
  }

  existing.count += 1;
  return null;
}

/**
 * Converts MCP server's live tool registry to the `/tools` HTTP response shape.
 * This keeps discovery payload in sync with currently registered server tools.
 */
function getLiveToolCatalogFromServer(): Array<{
  name: string;
  title: string;
  description: string;
  category: "auth" | "users" | "organization";
}> {
  const server = getMcpServer() as unknown as {
    _registeredTools?: Record<string, RegisteredToolInfo>;
  };
  const registeredTools = server._registeredTools ?? {};

  /**
   * Infers tool category from naming conventions used by MCP tool modules.
   */
  const resolveCategory = (toolName: string): "auth" | "users" | "organization" => {
    if (toolName.includes("organization") || toolName.includes("member")) {
      return "organization";
    }
    if (toolName.includes("user")) {
      return "users";
    }
    return "auth";
  };

  return Object.entries(registeredTools).map(([name, metadata]) => ({
    name,
    title: metadata.title ?? name,
    description: metadata.description ?? "",
    category: resolveCategory(name),
  }));
}

/**
 * MCP health routes.
 * Paths are relative to parent prefix (/api).
 */
export const mcpRoutes = new Elysia({ name: "mcp.api", prefix: "/api/mcp" })
  // Apply composed middleware (CORS, Helmet, Rate Limit, OpenTelemetry)
  .use(
    composedMiddleware({
      openAPP_NAME: "MCP",
    }),
  )
  .use(mcpKeysRoutes)
  // Request tracing for performance monitoring
  .trace(traceFn)
  // Centralized error handling
  .onError(errorFn)
  // Store application name
  .state("name", "MCP")

  /**
   * Root endpoint for MCP service information.
   * Returns welcome message identifying the mcp service.
   * This is separate from the main API root to allow for different service information if needed.
   *
   * Note: This is not the health check endpoint, which is defined separately at /health.
   * This endpoint is more for informational purposes, while /health is for monitoring and load balancers.
   * This endpoint can be used to verify that the MCP service is running and responding to requests, while /health provides more detailed status information for monitoring.
   */
  .get(
    "/",
    ({ store: { name }, set }) => {
      set.headers["Content-Type"] = "text/plain; charset=utf-8";
      return `Welcome to ${name} Service`;
    },
    {
      detail: {
        summary: "Get MCP root",
        description: "Get MCP root",
        tags: ["mcp"],
        responses: {
          200: { description: "Success" },
        },
      },
    },
  )

  /**
   * Health check endpoint for monitoring.
   * Used by load balancers and orchestration systems (Kubernetes, etc.)
   * Returns simple JSON with service status and active connection count.
   */
  .get(
    "/health",
    async ({ request }) => {
      const throttled = getHealthRateLimitResponse(request);
      if (throttled) {
        return throttled;
      }

      getMcpServer();
      const activeConnections = sessionManager.getActiveCount();

      return new Response(
        JSON.stringify({
          status: "healthy",
          activeConnections,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    },
    {
      detail: {
        tags: ["MCP"],
        summary: "MCP health check",
        description: "Check MCP server health and status",
      },
    },
  )
  .get(
    "/tools",
    async () => {
      return new Response(
        JSON.stringify({
          tools: getLiveToolCatalogFromServer(),
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    },
    {
      detail: {
        tags: ["MCP"],
        summary: "List MCP tools",
        description: "List all available MCP tools",
      },
    },
  );

/**
 * Request handler wrapper for TanStack Start integration.
 * Adapts Elysia handler to TanStack Start's server handler interface.
 */
const handle = ({ request }: { request: Request }) => mcpRoutes.fetch(request);

/**
 * TanStack Start route definition.
 * Exposes API endpoints to the server for SSR and API handling.
 */
export const Route = createFileRoute(`/api/mcp/$`)({
  server: {
    handlers: {
      GET: handle,
    },
  },
});