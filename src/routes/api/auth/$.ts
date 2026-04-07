/**
 * Auth API route handler.
 * Exposes Better Auth endpoints under /api/auth/* for client-side authentication.
 * Handles sign-in, sign-up, session management, and OAuth flows.
 */

import { Elysia } from "elysia";
import { createFileRoute } from "@tanstack/react-router";
import { errorFn, traceFn } from "~/middlewares";
import { authServiceRoutes } from "./modules/-service";
import { authCoreRoutes } from "./modules/-core";

/**
 * Auth application instance with routes.
 * Prefix: /api/auth
 * Includes health check and root endpoint.
 */
export const authRoutes = new Elysia({
  name: "auth.api",
  prefix: "/api/auth",
})
  // Request tracing for performance monitoring
  .trace(traceFn)
  // Centralized error handling
  .onError(errorFn)
  /**
   * Compose modular auth route groups to keep the main file lean and maintainable.
   */
  .use(authCoreRoutes)
  .use(authServiceRoutes);

/**
 * Request handler wrapper for TanStack Start integration.
 * Adapts Elysia handler to TanStack Start's server handler interface.
 */
const handle = ({ request }: { request: Request }) => authRoutes.fetch(request);

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