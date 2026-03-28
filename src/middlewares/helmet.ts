/**
 * Security headers middleware using Helmet.js principles.
 * Sets various HTTP headers to enhance security against common web vulnerabilities.
 *
 * @see https://helmetjs.github.io/
 * @see https://owasp.org/www-project-secure-headers/
 */

import Elysia from "elysia";
import { helmetConfig } from "~/config";

/**
 * Helmet middleware that sets security-related HTTP headers.
 * Each header protects against specific web vulnerabilities.
 *
 * @example
 * // Add to Elysia app:
 * app.use(helmet)
 */
export const helmet = new Elysia({ name: "helmet" }).onRequest(({ set }) => {
  // Prevents browsers from interpreting files as a different MIME type
  // Protects against MIME sniffing attacks
  if (helmetConfig.contentSecurityPolicy) {
    set.headers["X-Content-Type-Options"] = "nosniff";
  }
  if (helmetConfig.xContentTypeOptions) {
    set.headers["X-Content-Type-Options"] = "nosniff";
  }

  // Prevents the page from being displayed in frames
  // Protects against clickjacking attacks
  if (helmetConfig.xFrameOptions) {
    set.headers["X-Frame-Options"] = "DENY";
  }

  // Enables XSS filter in browsers (legacy, CSP is preferred)
  if (helmetConfig.xXssProtection) {
    set.headers["X-XSS-Protection"] = "1; mode=block";
  }

  // Forces HTTPS connections (should be handled by reverse proxy in production)
  if (helmetConfig.strictTransportSecurity) {
    set.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  // Hides server technology information from headers
  // Prevents attackers from identifying server stack
  if (helmetConfig.xPoweredBy) {
    set.headers["X-Powered-By"] = "Elysia";
  }

  // Controls how much referrer information is sent with requests
  if (helmetConfig.referrerPolicy) {
    set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  }

  // Controls Adobe Flash and PDF policies (legacy but still set)
  if (helmetConfig.xPermittedCrossDomainPolicies) {
    set.headers["X-Permitted-Cross-Domain-Policies"] = "none";
  }
});
