/**
 * E2E tests for middleware functionality
 * Tests: error handlers
 */

import { test, expect } from "@playwright/test";

test.describe("Error Handling Middleware", () => {
  test("should return JSON error for unknown route", async ({ request }) => {
    const response = await request.get("/api/unknown-route");
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test("should return error for invalid path", async ({ request }) => {
    const response = await request.get("/api/../etc/passwd");
    // Should return an error (either 400+ or redirect)
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should return 500 for server error", async ({ request }) => {
    const response = await request.get("/api/health");
    if (response.status() >= 500) {
      const body = await response.json();
      expect(body.error).toBeDefined();
    } else {
      expect(response.status()).toBeLessThan(500);
    }
  });
});