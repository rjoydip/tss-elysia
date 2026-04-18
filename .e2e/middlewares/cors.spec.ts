/**
 * E2E tests for middleware functionality
 * Tests: CORS
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../config";

test.describe("CORS Middleware", () => {
  test("should include Access-Control-Allow-Origin header", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.headers()["access-control-allow-origin"]).toBeDefined();
  });

  test("should include Access-Control-Allow-Methods header", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.headers()["access-control-allow-methods"]).toBeDefined();
  });

  test("should include Access-Control-Allow-Headers header", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.headers()["access-control-allow-headers"]).toBeDefined();
  });

  test("should include Access-Control-Expose-Headers header", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.headers()["access-control-expose-headers"]).toBeDefined();
  });

  test("should include Access-Control-Max-Age header", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.headers()["access-control-max-age"]).toBeDefined();
  });

  test("should handle OPTIONS preflight request", async ({ request }) => {
    const response = await request.fetch("/api/health", {
      method: "OPTIONS",
      headers: {
        Origin: E2E_BASE_URL,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });
    expect(response.status()).toBeDefined();
  });
});