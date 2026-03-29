/**
 * Composed middleware that combines all security and utility middlewares.
 * Centralizes all middleware configuration for easy application to Elysia.
 *
 * Includes:
 * - CORS headers (basic and credentials)
 * - Security headers (Helmet)
 * - OpenAPI documentation
 * - Rate limiting
 * - OpenTelemetry tracing
 * - Static file serving
 */

import { Elysia, file } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { API_NAME } from "~/config";
import { cors, corsWithCredentials } from "./cors";
import { helmet } from "./helmet";
import { rateLimitMiddleware } from "./rate-limit";

/**
 * Options for composing middleware with custom configuration.
 */
type ComposedMiddlewareOptions = {
  openapi_name: string;
};

/**
 * Creates a composed Elysia middleware with all security and utility features.
 *
 * @param options - Configuration options (e.g., OpenAPI name)
 * @returns Configured Elysia middleware instance
 *
 * @example
 * const app = new Elysia()
 *   .use(composedMiddleware({ openapi_name: "My API" }))
 *   .listen(3000)
 */
export const composedMiddleware = (
  { openapi_name }: ComposedMiddlewareOptions = {
    openapi_name: API_NAME,
  },
) =>
  new Elysia({ name: "composed-middleware" })
    // CORS for public endpoints
    .use(cors)
    // CORS with credentials for authenticated endpoints
    .use(corsWithCredentials)
    // Security headers
    .use(helmet)
    // OpenAPI documentation generation
    .use(
      openapi({
        documentation: {
          info: {
            title: `${openapi_name} API Documentation`,
            version: "v1",
          },
        },
      }),
    )
    // Rate limiting to prevent abuse
    .use(rateLimitMiddleware)
    // Serve favicon
    .get("/favicon.ico", file("../../public/favicon.svg"))
    // OpenTelemetry tracing for observability
    .use(
      opentelemetry({
        spanProcessors: [
          new BatchSpanProcessor(
            new OTLPTraceExporter({
              /*
               * URL for OTLP-compatible trace collector (e.g., Axiom, Grafana, Jaeger)
               * Uncomment and configure for production observability:
               * url: "https://api.axiom.co/v1/traces",
               * headers: {
               *   Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
               * },
               */
            }),
          ),
        ],
      }),
    );