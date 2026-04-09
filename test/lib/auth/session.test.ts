/**
 * Unit tests for Redis session storage.
 */

import { describe, it, expect } from "bun:test";
import { RedisSessionStorage, sessionStorage } from "../../../src/lib/auth/session";

describe("RedisSessionStorage", () => {
  const storage = new RedisSessionStorage();

  describe("methods exist", () => {
    it("should have create method", () => {
      expect(typeof storage.create).toBe("function");
    });

    it("should have get method", () => {
      expect(typeof storage.get).toBe("function");
    });

    it("should have update method", () => {
      expect(typeof storage.update).toBe("function");
    });

    it("should have delete method", () => {
      expect(typeof storage.delete).toBe("function");
    });

    it("should have deleteAll method", () => {
      expect(typeof storage.deleteAll).toBe("function");
    });
  });

  describe("basic operations", () => {
    it("should handle create without throwing", async () => {
      const testSession = {
        id: "test-session-id",
        userId: "test-user-id",
        expiresAt: new Date(),
        token: "test-token",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(storage.create(testSession)).resolves.toBeUndefined();
    });

    it("should handle get for non-existent key", async () => {
      const result = await storage.get("non-existent-id");
      expect(result).toBeNull();
    });

    it("should handle delete without throwing", async () => {
      await expect(storage.delete("non-existent")).resolves.toBeUndefined();
    });

    it("should handle deleteAll without throwing", async () => {
      await expect(storage.deleteAll("non-user")).resolves.toBeUndefined();
    });
  });
});

describe("sessionStorage export", () => {
  it("should export singleton with all methods", () => {
    expect(sessionStorage).toBeDefined();
    expect(typeof sessionStorage.create).toBe("function");
    expect(typeof sessionStorage.get).toBe("function");
    expect(typeof sessionStorage.update).toBe("function");
    expect(typeof sessionStorage.delete).toBe("function");
    expect(typeof sessionStorage.deleteAll).toBe("function");
  });
});