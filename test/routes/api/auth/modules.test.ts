/**
 * Unit tests for modular auth route plugins.
 * Verifies auth core and auth service route groups behave as expected.
 */

import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { authCoreRoutes } from "../../../../src/routes/api/auth/modules/-core";
import { authServiceRoutes } from "../../../../src/routes/api/auth/modules/-service";

describe("Auth core module", () => {
  it("should return auth welcome message", async () => {
    const app = new Elysia({ prefix: "/api/auth" }).use(authCoreRoutes);
    const response = await app.handle(new Request("http://localhost/api/auth/"));

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Welcome to Auth Service");
  });

  it("should return auth health payload", async () => {
    const app = new Elysia({ prefix: "/api/auth" }).use(authCoreRoutes);
    const response = await app.handle(new Request("http://localhost/api/auth/health"));

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { name: string; status: string };
    expect(payload.name).toBe("Auth");
    expect(payload.status).toBe("healthy");
  });
});

describe("Auth service module", () => {
  it("should return method not allowed for unsupported method", async () => {
    const app = new Elysia({ prefix: "/api/auth" }).use(authServiceRoutes);
    const response = await app.handle(
      new Request("http://localhost/api/auth/sign-in", { method: "PATCH" }),
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBeDefined();
  });
});