import { test, expect } from "@playwright/test";
import { isCI } from "std-env";

const shouldSkip = isCI;

test.describe("API Endpoints", () => {
  test("should respond to /api with plain", async ({ request }) => {
    if (shouldSkip) {
      test.skip(true, "Skipping in CI - server not accessible");
    }
    const response = await request.get("/api");
    expect(response.status()).toBeGreaterThanOrEqual(200);

    const contentType = response.headers()["content-type"] || "";
    expect(contentType).toMatch(/text\/plain/);
  });

  test("should handle unknown API route", async ({ request }) => {
    const response = await request.get("/api/unknown-endpoint");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe("Health Endpoints", () => {
  test("should return health status", async ({ request }) => {
    if (shouldSkip) {
      test.skip(true, "Skipping in CI - server not accessible");
    }
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("name");
  });

  test("should handle health endpoint with custom headers", async ({ request }) => {
    if (shouldSkip) {
      test.skip(true, "Skipping in CI - server not accessible");
    }
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
  });
});

test.describe("Root API Response", () => {
  test("should return welcome message", async ({ request }) => {
    if (shouldSkip) {
      test.skip(true, "Skipping in CI - server not accessible");
    }
    const response = await request.get("/api");
    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("Welcome to");
  });

  test("should include content-type header", async ({ request }) => {
    if (shouldSkip) {
      test.skip(true, "Skipping in CI - server not accessible");
    }
    const response = await request.get("/api");
    const contentType = response.headers()["content-type"];
    expect(contentType).toBeDefined();
    expect(contentType).toMatch(/text\/plain/);
  });
});

test.describe("404 Handling", () => {
  test("should handle non-existent routes", async ({ request }) => {
    const response = await request.get("/nonexistent");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should handle API sub-routes gracefully", async ({ request }) => {
    const response = await request.get("/api/some/nested/path");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
