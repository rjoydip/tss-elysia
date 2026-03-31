/**
 * Utility functions for request tracing and error handling.
 * Provides performance monitoring and centralized error responses.
 */

import type { TraceHandler, ErrorHandler } from "elysia";
import { logger } from "~/logger";

/**
 * Request trace handler for monitoring performance at each pipeline stage.
 * Adds timing information to help identify slow requests.
 *
 * @example
 * // Add to Elysia app:
 * app.use(traceFn)
 */
export const traceFn: TraceHandler = async ({
  onBeforeHandle,
  onAfterHandle,
  onError,
  onHandle,
  set,
}) => {
  // Track time spent in beforeHandle hook (validation, auth checks)
  onBeforeHandle(({ begin, onStop }) => {
    onStop(({ end }) => {
      const duration =
        typeof begin === "number" && typeof end === "number" ? (end - begin).toFixed(4) : "0.00";
      logger.debug(`BeforeHandle took ${duration} ms`);
    });
  });

  // Track time spent in afterHandle hook (response transformation)
  onAfterHandle(({ begin, onStop }) => {
    onStop(({ end }) => {
      const duration =
        typeof begin === "number" && typeof end === "number" ? (end - begin).toFixed(4) : "0.00";
      logger.debug(`AfterHandle took ${duration} ms`);
    });
  });

  // Track error handling time and log errors with duration
  onError(({ begin, onStop }) => {
    onStop(({ end, error }) => {
      const elapsed =
        typeof begin === "number" && typeof end === "number" ? (end - begin).toFixed(4) : "0.00";
      set.headers["X-Elapsed"] = elapsed;
      if (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error: ${errorMessage}, ${elapsed} ms`);
      }
    });
  });

  // Track total request handling time
  onHandle(({ onStop }) => {
    onStop(({ elapsed }) => {
      const elapsedTime = typeof elapsed === "number" ? elapsed.toFixed(4) : "0.00";
      set.headers["X-Elapsed"] = elapsedTime;
      logger.debug(`Request took: ${elapsedTime} ms`);
    });
  });
};

/**
 * Centralized error handler for consistent API error responses.
 * Sanitizes error messages in production to prevent information leakage.
 *
 * @param code - Elysia error code (e.g., 'NOT_FOUND', 'INTERNAL_SERVER_ERROR')
 * @param error - The original error object
 * @returns JSON response with appropriate status code
 *
 * @example
 * // Add to Elysia app:
 * app.use(errorFn)
 * // Or use as onError handler:
 * .onError(errorFn)
 */
export const errorFn: ErrorHandler = ({ code, error }) => {
  // Determine if running in production to control error detail exposure
  const isProduction = typeof process !== "undefined" && process.env.NODE_ENV === "production";

  // Sanitize error message: show full details in dev, generic message in prod
  const errorMessage = isProduction
    ? "An unexpected error occurred"
    : error instanceof Error
      ? error.message
      : String(error);

  // Format response based on error type
  const responseBody =
    code === "NOT_FOUND"
      ? JSON.stringify({ error: "Endpoint not found" })
      : JSON.stringify({ error: errorMessage });

  // Return appropriate status code (404 for not found, 500 for other errors)
  return new Response(responseBody, {
    status: code === "NOT_FOUND" ? 404 : 500,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};