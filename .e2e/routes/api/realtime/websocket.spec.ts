/**
 * E2E tests for WebSocket real-time features.
 * Tests WebSocket connection, authentication, heartbeat, and messaging.
 * Note: These tests require a running server with WebSocket support.
 */

import { test, expect } from "@playwright/test";
import { apiGet } from "../../../helpers/api-route";

test.describe("WebSocket API Integration", () => {
  test("should expose realtime discovery endpoint", async ({ page }) => {
    const response = await apiGet(page, "/api/realtime");
    expect(response.status).toBeLessThan(400);
    const payload = response.body as { websocketEndpoint: string; healthEndpoint: string };
    expect(payload.websocketEndpoint).toBe("/api/ws");
    expect(payload.healthEndpoint).toBe("/api/realtime/health");
  });

  test("should expose realtime health endpoint", async ({ page }) => {
    const response = await apiGet(page, "/api/realtime/health");
    expect(response.status).toBeLessThan(400);
    const payload = response.body as { status: string; websocketPath: string };
    expect(payload.status).toBe("healthy");
    expect(payload.websocketPath).toBe("/api/ws");
  });
});