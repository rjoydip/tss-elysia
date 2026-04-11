/**
 * E2E tests for OpenAPI endpoints and functionality
 * Tests: OpenAPI Reference UI / JSON Spec
 */

import { test, expect } from "@playwright/test";
import { apiGet } from "../../helpers/api-route";

test.describe("OpenAPI Documentation", () => {
  test("should expose Scalar reference UI at /api/reference", async ({ page }) => {
    const response = await apiGet(page, "/api/reference");
    expect(response.status).toBe(200);

    const contentType = response.headers["content-type"];
    expect(contentType).toContain("text/html");

    const body = response.text;
    // Usually Scalar UI contains 'Scalar' or something similar in its HTML,
    // or just checking if it looks like an HTML file
    expect(body).toContain("<html");
  });

  test("should expose OpenAPI spec JSON at /api/reference/json", async ({ page }) => {
    const response = await apiGet(page, "/api/reference/json");
    expect(response.status).toBe(200);

    const contentType = response.headers["content-type"];
    expect(contentType).toContain("application/json");

    const body = response.body as {
      openapi: string;
      info: { title: string };
      paths: Record<string, unknown>;
    };

    // Verifying it looks like an OpenAPI spec
    expect(body.openapi).toBeDefined();
    expect(body.info).toBeDefined();
    // Default info config inside index.ts
    expect(body.info.title).toContain("Documentation");
    expect(body.paths).toBeDefined();

    // Verify some of the expected routes are documented
    // Based on the unit tests we wrote earlier
    expect(body.paths["/hello"]).toBeUndefined(); // Arbitrary non-existent route
    expect(body.paths["/api/"]).toBeDefined(); // Root endpoint
    expect(body.paths["/api/health"]).toBeDefined(); // Health endpoint
    expect(body.paths["/api/realtime/health"]).toBeDefined(); // Realtime health endpoint
  });
});