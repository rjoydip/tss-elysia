/**
 * E2E tests for middleware functionality
 * Tests: trace handlers
 */

import { test, expect } from "@playwright/test";

test.describe("Trace Middleware", () => {
  test("should include X-Elapsed header on successful request", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.headers()["x-elapsed"]).toBeDefined();
  });

  test("should track request timing for different endpoints", async ({ request }) => {
    const response1 = await request.get("/api/health");
    const elapsed1 = response1.headers()["x-elapsed"];

    const response2 = await request.get("/api/auth/health");
    const elapsed2 = response2.headers()["x-elapsed"];

    expect(elapsed1).toBeDefined();
    expect(elapsed2).toBeDefined();
  });
});