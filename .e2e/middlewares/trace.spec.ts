/**
 * E2E tests for middleware functionality
 * Tests: trace handlers
 */

import { test, expect } from "@playwright/test";
import { apiGet } from "../helpers/api-route";

test.describe("Trace Middleware", () => {
  test("should include X-Elapsed header on successful request", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    expect(response.headers["x-elapsed"]).toBeDefined();
  });

  test("should track request timing for different endpoints", async ({ page }) => {
    const response1 = await apiGet(page, "/api/health");
    const elapsed1 = response1.headers["x-elapsed"];

    const response2 = await apiGet(page, "/api/auth/health");
    const elapsed2 = response2.headers["x-elapsed"];

    expect(elapsed1).toBeDefined();
    expect(elapsed2).toBeDefined();
  });
});