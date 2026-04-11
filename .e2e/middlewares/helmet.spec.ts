/**
 * E2E tests for middleware functionality
 * Tests: Helmet security headers
 */

import { test, expect } from "@playwright/test";
import { apiGet } from "../helpers/api-route";

test.describe("Helmet Middleware (Security Headers)", () => {
  test("should include X-Content-Type-Options header when enabled", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("should include Referrer-Policy header when enabled", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    expect(response.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("should not include X-Frame-Options when disabled in config", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    // Config has xFrameOptions: false, so header should not be present
    expect(response.headers["x-frame-options"]).toBeUndefined();
  });

  test("should not include X-Powered-By when disabled in config", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    // Config has xPoweredBy: false, so header should not be present
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  test("should not include X-Permitted-Cross-Domain-Policies when disabled in config", async ({
    page,
  }) => {
    const response = await apiGet(page, "/api/health");
    // Config has xPermittedCrossDomainPolicies: false, so header should not be present
    expect(response.headers["x-permitted-cross-domain-policies"]).toBeUndefined();
  });
});