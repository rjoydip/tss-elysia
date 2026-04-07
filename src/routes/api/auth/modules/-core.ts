/**
 * Auth core informational endpoints.
 * Provides root and health responses for auth service monitoring.
 */

import { Elysia } from "elysia";
import { AUTH_SERVICE_NAME } from "~/config";
import { authServiceRoutes } from "./-service";

/**
 * Core auth route group mounted under `/api/auth`.
 */
export const authCoreRoutes = new Elysia({ name: "auth.routes.core", prefix: "/auth" })
  .use(authServiceRoutes)
  .get(
    "/",
    ({ set }) => {
      set.headers["Content-Type"] = "text/plain; charset=utf-8";
      return `Welcome to ${AUTH_SERVICE_NAME} Service`;
    },
    {
      detail: {
        summary: `Get ${AUTH_SERVICE_NAME} root`,
        description: `Get ${AUTH_SERVICE_NAME} root`,
        tags: ["auth"],
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
          name: AUTH_SERVICE_NAME,
          status: "healthy",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      ),
    {
      detail: {
        summary: "Get AUTH health",
        description: "Get AUTH health",
        tags: ["auth-health"],
        responses: {
          200: { description: "Success" },
        },
      },
    },
  );