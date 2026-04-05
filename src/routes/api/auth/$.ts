/**
 * Auth API route handler.
 * Exposes Better Auth endpoints under /api/auth/* for client-side authentication.
 * Handles sign-in, sign-up, session management, and OAuth flows.
 */

import { Elysia } from "elysia";
import type { Context } from "elysia";
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "~/lib/auth";
import { AUTH_ALLOWED_METHODS } from "~/config";
import { errorFn, traceFn } from "~/middlewares";

/**
 * Auth service handler that delegates to Better Auth.
 * Accepts GET and POST requests, rejects other methods.
 *
 * @internal
 * This is the core handler that processes auth API requests.
 */
const authService = new Elysia().all(
  "*",
  async (context: Context & { request: Request }) => {
    // Only allow safe methods for auth endpoints
    if (AUTH_ALLOWED_METHODS.includes(context.request.method)) {
      return await auth.handler(context.request);
    } else {
      // Reject unsafe methods with 405 Method Not Allowed
      context.set.status = 405;
      context.set.headers["Allow"] = AUTH_ALLOWED_METHODS.join(", ");
      return "Method Not Allowed";
    }
  },
  {
    // OpenAPI documentation metadata
    detail: {
      summary: "Auth Service",
      description: "Handles authentication requests",
      tags: ["auth"],
      responses: {
        200: { description: "Success" },
      },
    },
  },
);

/**
 * Auth application instance with routes.
 * Prefix: /api/auth
 * Includes health check and root endpoint.
 */
const authApp = new Elysia({
  name: "api.auth",
  prefix: "/api/auth",
})
  // Request tracing for performance monitoring
  .trace(traceFn)
  // Centralized error handling
  .onError(errorFn)
  // Auth request handler
  .use(authService)
  // Store application name
  .state("name", "AUTH")

  /**
   * Health check endpoint for monitoring.
   * Returns service status for load balancers/health checks.
   */
  .get("/health", async ({ store: { name } }) => ({ name, status: "ok" }), {
    detail: {
      summary: "Get AUTH health",
      description: "Get AUTH health",
      tags: ["auth-health"],
      responses: {
        200: { description: "Success" },
      },
    },
  })

  /**
   * Root endpoint for service information.
   * Returns welcome message identifying the auth service.
   */
  .get(
    "/",
    ({ store: { name }, set }) => {
      set.headers["Content-Type"] = "text/plain; charset=utf-8";
      return `Welcome to ${name} Service`;
    },
    {
      detail: {
        summary: "Get AUTH root",
        description: "Get AUTH root",
        tags: ["auth"],
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
const handle = ({ request }: { request: Request }) => authApp.fetch(request);

/**
 * TanStack Start route definition.
 * Exposes auth endpoints to the server for SSR and API handling.
 */
export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});