/**
 * TanStack Start server entry point.
 * Handles server-side rendering (SSR) and routes requests to appropriate handlers.
 *
 * Intercepts /api/auth/* requests to apply method restrictions
 * before passing to TanStack Start's default handler.
 */

import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { AUTH_ALLOWED_METHODS } from "./config";

/**
 * Server entry with custom request handling.
 * Adds HTTP method validation for auth endpoints.
 *
 * @example
 * // Typically used by the deployment adapter (Vercel, Netlify, etc.)
 * // Imports this module and uses as fetch handler
 */
export default createServerEntry({
  fetch(request: Request) {
    const url = new URL(request.url);

    // Apply method restrictions to /api/auth/* routes
    // Prevents unsafe methods (PUT, DELETE) on auth endpoints
    if (url.pathname.startsWith("/api/auth/")) {
      if (!AUTH_ALLOWED_METHODS.includes(request.method)) {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: AUTH_ALLOWED_METHODS.join(", ") },
        });
      }
    }

    // Pass to default TanStack Start handler for rendering
    return handler.fetch(request);
  },
});
