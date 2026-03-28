import { describe, expect, it } from "bun:test";
import { t } from "elysia";
import { API_PREFIX, PORT } from "../src/config.ts";

const envPath = "../src/env.ts";

describe("_env", () => {
  describe("Environment Variables Configuration", () => {
    it("should have VITE_API_URL from env", async () => {
      const { env } = await import(envPath);
      expect(env.VITE_API_URL).toBeDefined();
    });

    it("should have API_URL from env", async () => {
      const { env } = await import(envPath);
      expect(env.API_URL).toBeDefined();
      expect(env.API_URL).toContain("/api");
    });

    it("should have BETTER_AUTH_SECRET from env", async () => {
      const { env } = await import(envPath);
      expect(env.BETTER_AUTH_SECRET).toBeDefined();
    });

    it("should have BETTER_AUTH_URL from env", async () => {
      const { env } = await import(envPath);
      expect(env.BETTER_AUTH_URL).toBeDefined();
    });

    it("should have PORT as number from env", async () => {
      const { env } = await import(envPath);
      expect(typeof env.PORT).toBe("number");
    });

    it("should have DATABASE_URL from env", async () => {
      const { env } = await import(envPath);
      expect(env.DATABASE_URL).toBeDefined();
    });

    it("should export Env type", async () => {
      const { env } = await import(envPath);
      expect(env).toBeDefined();
      expect(typeof env).toBe("object");
    });
  });

  describe("Environment Integration", () => {
    it("API_PREFIX should match env API_URL prefix", async () => {
      const { env } = await import(envPath);
      expect(env.API_URL).toContain(API_PREFIX);
    });

    it("PORT from _config should match env PORT", async () => {
      const { env } = await import(envPath);
      expect(env.PORT).toBe(PORT);
    });
  });

  describe("t Schema types", () => {
    it("should have t.String available", () => {
      const schema = t.String();
      expect(schema).toBeDefined();
    });

    it("should have t.Number available", () => {
      const schema = t.Number();
      expect(schema).toBeDefined();
    });

    it("should create object schema", () => {
      const schema = t.Object({
        TEST: t.String(),
      });
      expect(schema).toBeDefined();
    });
  });
});
