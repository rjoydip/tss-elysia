/**
 * CORS (Cross-Origin Resource Sharing) middleware for Elysia.
 * Configures headers to allow/control cross-origin requests.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 */

import Elysia from "elysia";
import { corsConfig } from "~/config";

/**
 * Basic CORS middleware using configuration from config.ts.
 * Allows cross-origin requests with wildcard origin.
 * Use for public APIs that don't require credentials.
 *
 * @example
 * // Add to Elysia app:
 * app.use(cors)
 */
export const cors = new Elysia({ name: "cors" }).onRequest(({ set }) => {
  // Allow requests from any origin (production should restrict this)
  set.headers["Access-Control-Allow-Origin"] = corsConfig.origin;
  // Permitted HTTP methods for cross-origin requests
  set.headers["Access-Control-Allow-Methods"] = corsConfig.methods.join(", ");
  // Allowed request headers from clients
  set.headers["Access-Control-Allow-Headers"] = corsConfig.allowedHeaders.join(", ");
  // Headers accessible to client code (exposed to JavaScript)
  set.headers["Access-Control-Expose-Headers"] = corsConfig.exposedHeaders.join(", ");
  // Browser cache duration for preflight results (seconds)
  set.headers["Access-Control-Max-Age"] = String(corsConfig.maxAge);
  // Allow credentials (cookies, auth headers) in cross-origin requests
  if (corsConfig.credentials) {
    set.headers["Access-Control-Allow-Credentials"] = "true";
  }
});

/**
 * CORS middleware with dynamic origin and credentials support.
 * Uses the request's Origin header for more secure origin matching.
 * Use for authenticated APIs that need credentials.
 *
 * @example
 * // Add to Elysia app:
 * app.use(corsWithCredentials)
 */
export const corsWithCredentials = new Elysia({ name: "cors-credentials" }).onRequest(
  ({ request, set }) => {
    // Dynamically set origin from request - more secure than wildcard
    const origin = request.headers.get("Origin");
    if (origin) {
      set.headers["Access-Control-Allow-Origin"] = origin;
    }
    set.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    set.headers["Access-Control-Allow-Credentials"] = "true";
  },
);