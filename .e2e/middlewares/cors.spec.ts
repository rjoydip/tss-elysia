/**
 * E2E tests for middleware functionality
 * Tests: CORS
 */

import { test, expect } from "@playwright/test";
import { apiGet, apiFetch } from "../helpers/api-route";

test.describe("CORS Middleware", () => {
  test("should include Access-Control-Allow-Origin header", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    expect(response.headers["access-control-allow-origin"]).toBeDefined();
  });

  test("should include Access-Control-Allow-Methods header", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    expect(response.headers["access-control-allow-methods"]).toBeDefined();
  });

  test("should include Access-Control-Allow-Headers header", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    expect(response.headers["access-control-allow-headers"]).toBeDefined();
  });

  test("should include Access-Control-Expose-Headers header", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    expect(response.headers["access-control-expose-headers"]).toBeDefined();
  });

  test("should include Access-Control-Max-Age header", async ({ page }) => {
    const response = await apiGet(page, "/api/health");
    expect(response.headers["access-control-max-age"]).toBeDefined();
  });

  test("should handle OPTIONS preflight request", async ({ page }) => {
    const response = await apiFetch(page, "/api/health", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });
    expect(response.status).toBeDefined();
  });
});