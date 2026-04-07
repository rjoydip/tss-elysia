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
    async () => {
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
          tools: [
            {
              name: "get-current-user",
              title: "Get Current User",
              description: "Get the authenticated user's profile information",
              category: "auth",
            },
            {
              name: "list-sessions",
              title: "List Sessions",
              description: "List all active sessions for the current user",
              category: "auth",
            },
            {
              name: "revoke-session",
              title: "Revoke Session",
              description: "Revoke a specific session",
              category: "auth",
            },
            {
              name: "get-user",
              title: "Get User",
              description: "Get user details by user ID",
              category: "users",
            },
            {
              name: "list-users",
              title: "List Users",
              description: "List users in the system",
              category: "users",
            },
            {
              name: "update-user",
              title: "Update User",
              description: "Update the current user's profile",
              category: "users",
            },
            {
              name: "get-organization",
              title: "Get Organization",
              description: "Get details of the current organization",
              category: "organization",
            },
            {
              name: "list-members",
              title: "List Organization Members",
              description: "List all members of the current organization",
              category: "organization",
            },
          ],
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