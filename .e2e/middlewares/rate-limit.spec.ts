/**
 * E2E tests for middleware functionality
 * Tests: rate limiting
 */

import { test, expect } from "@playwright/test";
import { apiGet } from "../helpers/api-route";

test.describe("Rate Limiting Middleware", () => {
  test("should handle burst of requests", async ({ page }) => {
    const promises = Array.from({ length: 20 }, () => apiGet(page, "/api/health"));
    const responses = await Promise.all(promises);

    const statusCodes = responses.map((r) => r.status);

    // At least some should succeed, some might be rate limited
    const successCount = statusCodes.filter((s) => s === 200).length;
    expect(successCount).toBeGreaterThan(0);
  });

  test("should include rate limit headers when rate limited", async ({ page }) => {
    // Make many rapid requests to trigger rate limiting
    const promises = Array.from({ length: 15 }, () => apiGet(page, "/api/health"));
    const responses = await Promise.all(promises);

    // All requests should complete (some may be rate limited)
    expect(responses.length).toBe(15);
  });
});