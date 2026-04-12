/**
 * Unit tests for modular API route plugins.
 * Verifies each Elysia route module exposes the expected endpoints and payloads.
 */

import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { APP_NAME } from "../../../src/config";
import { coreRoutes } from "../../../src/routes/api/modules/-core";
import { realtimeRoutes } from "../../../src/routes/api/modules/-realtime";

describe("Core API module", () => {
  const app = new Elysia({ prefix: "/api" }).use(coreRoutes);

  it("should return root welcome message", async () => {
    const response = await app.handle(new Request("http://localhost/api"));

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe(`Welcome to ${APP_NAME} Service`);
  });

  it("should return healthy status payload", async () => {
    const response = await app.handle(new Request("http://localhost/api/health"));

    expect(response.status).toBe(200);
    const data = (await response.json()) as { status: string; name: string };
    expect(data.status).toBe("healthy");
    expect(data.name).toBe(APP_NAME);
  });
});

describe("Realtime API module", () => {
  const app = new Elysia({ prefix: "/api" }).use(realtimeRoutes);

  it("should return realtime discovery metadata", async () => {
    const response = await app.handle(new Request("http://localhost/api/realtime"));

    expect(response.status).toBe(200);
    const data = (await response.json()) as { websocketEndpoint: string; requiresAuth: boolean };
    expect(data.websocketEndpoint).toBe("/api/ws");
    expect(data.requiresAuth).toBe(true);
  });

  it("should return realtime health payload", async () => {
    const response = await app.handle(new Request("http://localhost/api/realtime/health"));

    expect(response.status).toBe(200);
    const data = (await response.json()) as { status: string; websocketPath: string };
    expect(data.status).toBe("healthy");
    expect(data.websocketPath).toBe("/api/ws");
  });
});