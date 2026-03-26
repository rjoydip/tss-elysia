import Elysia from "elysia";
import { helmetConfig } from "~/config";

export const helmet = new Elysia({ name: "helmet" }).onRequest(({ set }) => {
  if (helmetConfig.contentSecurityPolicy) {
    set.headers["X-Content-Type-Options"] = "nosniff";
  }
  if (helmetConfig.xContentTypeOptions) {
    set.headers["X-Content-Type-Options"] = "nosniff";
  }
  if (helmetConfig.xFrameOptions) {
    set.headers["X-Frame-Options"] = "DENY";
  }
  if (helmetConfig.xXssProtection) {
    set.headers["X-XSS-Protection"] = "1; mode=block";
  }
  if (helmetConfig.strictTransportSecurity) {
    set.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }
  if (helmetConfig.xPoweredBy) {
    set.headers["X-Powered-By"] = "Elysia";
  }
  if (helmetConfig.referrerPolicy) {
    set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
  }
  if (helmetConfig.xPermittedCrossDomainPolicies) {
    set.headers["X-Permitted-Cross-Domain-Policies"] = "none";
  }
});
