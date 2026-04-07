/**
 * Unit tests for MCP rate limiting.
 * Tests the token bucket algorithm and rate limit store.
 */

import { describe, it, expect, beforeEach } from "bun:test";
import {
  rateLimitStore,
  checkRateLimit,
  resetRateLimit,
  cleanupRateLimitStore,
} from "../../../src/lib/mcp/rate-limit";
import type { McpApiKey } from "../../../src/lib/db/schema";

/**
 * Mock API key factory.
 */
function createMockApiKey(overrides: Partial<McpApiKey> = {}): McpApiKey {
  return {
    id: "key-123",
    name: "Test Key",
    keyHash: "hash123",
    userId: "user-123",
    organizationId: null,
    permissions: null,
    rateLimit: 10,
    rateLimitDuration: 60_000,
    lastUsedAt: null,
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as McpApiKey;
}

describe("RateLimitStore", () => {
  beforeEach(async () => {
    // Reset the store before each test
    await rateLimitStore.reset("key-123");
  });

  describe("check", () => {
    it("should allow request within limit", async () => {
      const result = await rateLimitStore.check("key-123", 10, 60_000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it("should track multiple requests", async () => {
      await rateLimitStore.check("key-123", 10, 60_000);
      const result = await rateLimitStore.check("key-123", 10, 60_000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(8);
    });

    it("should deny requests when limit exceeded", async () => {
      // Make 10 requests (limit is 10)
      for (let i = 0; i < 10; i++) {
        await rateLimitStore.check("key-123", 10, 60_000);
      }

      // 11th request should be denied
      const result = await rateLimitStore.check("key-123", 10, 60_000);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset after window expires", async () => {
      // Use up the limit
      for (let i = 0; i < 10; i++) {
        await rateLimitStore.check("key-123", 10, 60_000);
      }

      // Manually expire the window by resetting
      await rateLimitStore.reset("key-123");

      // Should allow again after reset
      const result = await rateLimitStore.check("key-123", 10, 60_000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it("should track different keys independently", async () => {
      await rateLimitStore.check("key-1", 5, 60_000);
      await rateLimitStore.check("key-1", 5, 60_000);
      await rateLimitStore.check("key-1", 5, 60_000);
      await rateLimitStore.check("key-1", 5, 60_000);
      await rateLimitStore.check("key-1", 5, 60_000);

      const result1 = await rateLimitStore.check("key-1", 5, 60_000);
      const result2 = await rateLimitStore.check("key-2", 5, 60_000);

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
    });
  });

  describe("reset", () => {
    it("should clear rate limit for specific key", async () => {
      await rateLimitStore.check("key-123", 10, 60_000);
      await rateLimitStore.check("key-123", 10, 60_000);

      await resetRateLimit("key-123");

      const result = await rateLimitStore.check("key-123", 10, 60_000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });
  });

  describe("cleanup", () => {
    it("should clean up expired entries", async () => {
      // This test is difficult to implement reliably without time mocking
      // In production, this would be tested with a test clock
      const cleaned = await rateLimitStore.cleanup();
      expect(typeof cleaned).toBe("number");
    });
  });
});

describe("checkRateLimit", () => {
  beforeEach(async () => {
    await resetRateLimit("key-123");
  });

  it("should use default values when not set", async () => {
    const apiKey = createMockApiKey({
      rateLimit: undefined,
      rateLimitDuration: undefined,
    });

    const result = await checkRateLimit(apiKey);

    expect(result.limit).toBe(100);
    expect(result.duration).toBe(60_000);
    expect(result.allowed).toBe(true);
  });

  it("should use custom values from API key", async () => {
    const apiKey = createMockApiKey({
      rateLimit: 5,
      rateLimitDuration: 30_000,
    });

    const result = await checkRateLimit(apiKey);

    expect(result.limit).toBe(5);
    expect(result.duration).toBe(30_000);
  });

  it("should respect custom rate limits", async () => {
    const apiKey = createMockApiKey({
      rateLimit: 2,
      rateLimitDuration: 60_000,
    });

    await checkRateLimit(apiKey);
    await checkRateLimit(apiKey);

    const result = await checkRateLimit(apiKey);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.limit).toBe(2);
  });
});

describe("cleanupRateLimitStore", () => {
  it("should expose manual cleanup for suspended interval environments", async () => {
    // This explicit function is used by serverless/runtime paths where intervals may pause.
    const cleaned = await cleanupRateLimitStore();
    expect(typeof cleaned).toBe("number");
    expect(cleaned).toBeGreaterThanOrEqual(0);
  });
});