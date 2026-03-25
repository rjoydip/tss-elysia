import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("should respond to /api/test with JSON", async ({ request }) => {
    const response = await request.get("/api/test");
    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(500);

    const contentType = response.headers()["content-type"] || "";
    expect(contentType).toMatch(/application\/json/);
  });

  test("should handle unknown API route", async ({ request }) => {
    const response = await request.get("/api/unknown-endpoint");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
