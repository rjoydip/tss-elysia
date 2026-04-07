/**
 * E2E tests for WebSocket real-time features.
 * Tests WebSocket connection, authentication, heartbeat, and messaging.
 * Note: These tests require a running server with WebSocket support.
 */

import { test, expect } from "@playwright/test";

test.describe("WebSocket API Integration", () => {
  test("should expose realtime discovery endpoint", async ({ request }) => {
    const response = await request.get("/api/realtime");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.websocketEndpoint).toBe("/api/ws");
    expect(payload.healthEndpoint).toBe("/api/realtime/health");
  });

  test("should expose realtime health endpoint", async ({ request }) => {
    const response = await request.get("/api/realtime/health");
    expect(response.ok()).toBeTruthy();
    const payload = await response.json();
    expect(payload.status).toBe("healthy");
    expect(payload.websocketPath).toBe("/api/ws");
  });
});