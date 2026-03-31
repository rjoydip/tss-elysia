/**
 * Central configuration for the TSS Elysia application.
 * Defines environment-based settings and middleware configurations.
 */

import { type ElysiaConfig } from "elysia";
import { version as pkgVersion } from "../../package.json";

/**
 * Application version from package.json.
 * Automatically synced with the root package.json version.
 */
export const APP_VERSION = pkgVersion;

/**
 * API route prefix - defaults to /api.
 * Used for organizing API endpoints under a common path.
 */
export const API_PREFIX = import.meta.env.API_PREFIX ?? `/api`;

/**
 * Authentication route pattern - catches all auth-related requests.
 * Better Auth uses /auth/* for its endpoints.
 */
export const AUTH_PREFIX = "/auth/*";

/**
 * GitHub repository URL for the project.
 * Used in the footer and documentation links.
 * Should be updated to point to the actual repository when available.
 */
export const GITHUB_REPO_URL = "https://github.com/rjoydip/tss-elysia";

/**
 * Application name for display and OpenAPI documentation.
 * Falls back to "TSS ELYSIA" if not set in environment.
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME ?? "TSSE";

/**
 * Server host - defaults to localhost for development.
 * Should be configured for production deployments.
 */
export const HOST = import.meta.env.HOST || "localhost";

/**
 * Server port - defaults to 3000 for local development.
 * Must match the port the Vite dev server runs on.
 */
export const PORT = parseInt(import.meta.env.PORT || "3000", 10);

/**
 * Runtime environment detection - checks if code runs in browser.
 * Used to conditionally execute server-only code on the client.
 * @example
 * if (isBrowser) {
 *   // Browser-specific code (window, document available)
 * }
 */
export const isBrowser = typeof window !== "undefined" && window.document !== undefined;

/**
 * Runtime environment detection - checks if code runs on server.
 * Server-side rendering (SSR) uses this to prevent client-side execution.
 * @example
 * if (isServer) {
 *   // Server-only code (database, file system access)
 * }
 */
export const isServer = typeof window === "undefined";

/**
 * Runtime detection - checks if Bun runtime is available.
 * Used to leverage Bun-specific APIs (e.g., Bun.password, Bun.env).
 */
export const isBun = typeof Bun !== "undefined";

/**
 * Runtime detection - checks if Node.js runtime is available.
 * Fallback for environments without Bun (production, other runtimes).
 */
export const isNode = typeof process !== "undefined" && !!process.versions?.node;

/**
 * Production environment detection.
 * Enables/disables features based on deployment environment.
 * @example
 * if (isProduction) {
 *   // Disable debug logging, enable stricter security
 * }
 */
export const isProduction = isBun
  ? Bun.env.NODE_ENV === "production"
  : isNode
    ? process.env.NODE_ENV === "production"
    : false;

/**
 * Allowed HTTP methods for authentication endpoints.
 * Restricts API to safe methods only - prevents destructive operations.
 */
export const AUTH_ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE"];

/**
 * Elysia server configuration.
 * Defines core server behavior including websocket and response handling.
 * @property normalize - Normalize paths (remove trailing slashes)
 * @property prefix - Global route prefix (empty for this app)
 * @property nativeStaticResponse - Use native response objects
 * @property websocket - WebSocket connection settings
 */
export const appConfig: ElysiaConfig<any> = {
  normalize: true,
  prefix: "",
  nativeStaticResponse: true,
  websocket: {
    idleTimeout: 30,
  },
};

/**
 * Default rate limiting configuration.
 * Applied to unauthenticated requests as baseline protection.
 * @property duration - Time window in milliseconds (60 seconds)
 * @property max - Maximum requests allowed in the duration window
 */
export const rateLimitConfig = {
  duration: 60_000,
  max: 100,
};

/**
 * CORS (Cross-Origin Resource Sharing) configuration.
 * Controls which origins can access API endpoints.
 * @property origin - Allowed origin (* = any, specific domain for production)
 * @property methods - HTTP methods permitted across origins
 * @property allowedHeaders - Request headers allowed from clients
 * @property exposedHeaders - Response headers accessible to clients
 * @property credentials - Allow cookies/auth headers in cross-origin requests
 * @property maxAge - How long browser caches preflight results (seconds)
 */
export const corsConfig = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Request-Id", "X-Response-Time"],
  credentials: true,
  maxAge: 86400,
};

/**
 * Security headers configuration using Helmet.js principles.
 * Provides defense-in-depth against common web vulnerabilities.
 * Each flag enables specific security headers when true.
 */
export const helmetConfig = {
  contentSecurityPolicy: true, // Prevents XSS by controlling resource loading
  crossOriginEmbedderPolicy: false, // Disable for ES modules compatibility
  crossOriginOpenerPolicy: false, // Allow cross-origin window access
  crossOriginResourcePolicy: false, // Allow cross-origin resource loading
  originAgentCluster: false, // Disable for cross-origin isolation
  referrerPolicy: "strict-origin-when-cross-origin", // Control referrer info
  strictTransportSecurity: false, // Disable (handled by reverse proxy)
  xContentTypeOptions: true, // Prevent MIME type sniffing
  xDnsPrefetchControl: false, // Disable DNS prefetching
  xDownloadOptions: false, // Disable file download navigation
  xFrameOptions: false, // Disable clickjacking protection
  xPermittedCrossDomainPolicies: false, // Disable Adobe Flash policies
  xPoweredBy: false, // Hide server technology info
  xXssProtection: false, // Deprecated, rely on CSP instead
};