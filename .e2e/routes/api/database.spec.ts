/**
 * E2E tests for the database API endpoints
 */

import { test, expect } from "@playwright/test";
import { apiGet } from "../../helpers/api-route";

test.describe("Database API", () => {
  test.describe("GET /api/database/heartbeat", () => {
    test("should return 200 when database is healthy", async ({ page }) => {
      const response = await apiGet(page, "/api/database/heartbeat");

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);

      const body = response.body as { status: string; timestamp: number };
      expect(body).toHaveProperty("status");
      expect(body).toHaveProperty("timestamp");
      expect(["healthy", "unhealthy", "degraded"]).toContain(body.status);
    });

    test("should return database type information", async ({ page }) => {
      const response = await apiGet(page, "/api/database/heartbeat");
      const body = response.body as { databaseType?: string };

      if (body.databaseType) {
        expect(["sqlite", "postgres"]).toContain(body.databaseType);
      }
    });

    test("should return latency information when healthy", async ({ page }) => {
      const response = await apiGet(page, "/api/database/heartbeat");
      const body = response.body as { status: string; latencyMs?: number };

      if (body.status === "healthy") {
        expect(body).toHaveProperty("latencyMs");
        if (body.latencyMs !== null && body.latencyMs !== undefined) {
          expect(typeof body.latencyMs).toBe("number");
          expect(body.latencyMs).toBeGreaterThanOrEqual(0);
        }
      }
    });

    test("should return pool information", async ({ page }) => {
      const response = await apiGet(page, "/api/database/heartbeat");
      const body = response.body as {
        pools: Array<{ name: string; role: string; healthy: boolean }>;
      };

      expect(body).toHaveProperty("pools");
      expect(Array.isArray(body.pools)).toBe(true);

      for (const pool of body.pools) {
        expect(pool).toHaveProperty("name");
        expect(pool).toHaveProperty("role");
        expect(pool).toHaveProperty("healthy");
        expect(["primary", "replica"]).toContain(pool.role);
        expect(typeof pool.healthy).toBe("boolean");
      }
    });

    test("should return correct content type", async ({ page }) => {
      const response = await apiGet(page, "/api/database/heartbeat");
      const contentType = response.headers["content-type"];

      expect(contentType).toContain("application/json");
    });

    test("should return detail message", async ({ page }) => {
      const response = await apiGet(page, "/api/database/heartbeat");
      const body = response.body as { detail: string };

      expect(body).toHaveProperty("detail");
      expect(typeof body.detail).toBe("string");
      expect(body.detail.length).toBeGreaterThan(0);
    });
  });

  test.describe("Database Connection Pool Details", () => {
    test("should report all configured pools", async ({ page }) => {
      const response = await apiGet(page, "/api/database/heartbeat");
      const body = response.body as { pools?: Array<{ name: string }> };

      if (body.pools && body.pools.length > 0) {
        const poolNames = body.pools.map((p) => p.name);
        expect(Array.isArray(poolNames)).toBe(true);

        for (const name of poolNames) {
          expect(typeof name).toBe("string");
          expect(name.length).toBeGreaterThan(0);
        }
      }
    });

    test("should include latency for each pool", async ({ page }) => {
      const response = await apiGet(page, "/api/database/heartbeat");
      const body = response.body as { pools?: Array<{ healthy: boolean; latencyMs?: number }> };

      if (body.pools && body.pools.length > 0) {
        for (const pool of body.pools) {
          if (pool.healthy) {
            expect(pool).toHaveProperty("latencyMs");
            expect(typeof pool.latencyMs).toBe("number");
          }
        }
      }
    });
  });
});

test.describe("Database Health Response Format", () => {
  test("should return ISO timestamp format", async ({ page }) => {
    const response = await apiGet(page, "/api/database/heartbeat");
    const body = response.body as { timestamp: string };

    const timestamp = new Date(body.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  test("should include pool health status", async ({ page }) => {
    const response = await apiGet(page, "/api/database/heartbeat");
    const body = response.body as { status: string; pools?: Array<{ healthy: boolean }> };

    expect(body).toHaveProperty("status");

    if (body.pools && body.pools.length > 0) {
      const allHealthy = body.pools.every((p) => p.healthy);

      if (allHealthy) {
        expect(body.status).toBe("healthy");
      }
    }
  });
});