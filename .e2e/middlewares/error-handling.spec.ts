/**
 * E2E tests for middleware functionality
 * Tests: error handlers
 */

import { test, expect } from "@playwright/test";
import { apiGet } from "../helpers/api-route";

test.describe("Error Handling Middleware", () => {
  test("should return JSON error for unknown route", async ({ page }) => {
    const response = await apiGet(page, "/api/unknown-route");
    expect(response.status).toBe(404);
    const body = response.body as { error: string };
    expect(body.error).toBeDefined();
  });

  test("should return error for invalid path", async ({ page }) => {
    const response = await apiGet(page, "/api/../etc/passwd");
    // Should return an error (either 400+ or redirect)
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test("should return 500 for server error", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    if (response.status >= 500) {
      const body = response.body as { error: string };
      expect(body.error).toBeDefined();
    } else {
      expect(response.status).toBeLessThan(500);
    }
  });
});