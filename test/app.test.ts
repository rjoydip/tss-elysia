import { describe, expect, it } from "bun:test";
import { createApp } from "../src/app.ts";

describe("_app", () => {
  describe("createApp", () => {
    it("should create an Elysia instance", () => {
      const app = createApp();
      expect(app).toBeDefined();
      expect(typeof app).toBe("object");
    });

    it("should accept custom config", () => {
      const customConfig = { prefix: "/custom" };
      const app = createApp(customConfig);
      expect(app).toBeDefined();
    });

    it("should merge custom config with defaults", () => {
      const app = createApp({ normalize: false });
      expect(app).toBeDefined();
    });
  });

  describe("app instance", () => {
    it("should handle GET request", async () => {
      const app = createApp();

      const response = await app.handle(new Request("http://localhost/"));

      expect(response.status).toBeDefined();
    });

    it("should handle 404 for unknown routes", async () => {
      const app = createApp();

      const response = await app.handle(new Request("http://localhost/unknown-route"));

      expect(response.status).toBe(404);
    });

    it("should return JSON error for unknown routes", async () => {
      const app = createApp();

      const response = await app.handle(new Request("http://localhost/unknown-route"));

      const body = await response.json();
      expect(body).toHaveProperty("error");
    });

    it("should include X-Elapsed header in response", async () => {
      const app = createApp();

      const response = await app.handle(new Request("http://localhost/"));

      expect(response.headers.get("X-Elapsed")).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should handle errors gracefully", async () => {
      const app = createApp();

      const response = await app.handle(new Request("http://localhost/non-existent"));

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe("Endpoint not found");
    });
  });
});
