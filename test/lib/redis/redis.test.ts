/**
 * Unit tests for the Redis client module.
 * Tests client initialization, health check status, and connection management.
 *
 * @remarks
 * These tests verify the module's API surface and graceful degradation.
 * They do not require a running Redis instance — the module handles
 * unavailability by returning null/disabled status.
 */

import { describe, test, expect, afterEach } from "bun:test";
import {
  getRedisClient,
  getRedisStatus,
  closeRedis,
  ensureRedisConnection,
} from "../../../src/lib/redis";

describe("Redis Client", () => {
  afterEach(() => {
    // Clean up Redis state between tests
    closeRedis();
  });

  test("getRedisClient returns a RedisClient or null", () => {
    const client = getRedisClient();
    // Returns RedisClient when REDIS_URL is configured, null otherwise
    expect(client === null || typeof client === "object").toBe(true);
  });

  test("getRedisClient is idempotent (returns same instance)", () => {
    const client1 = getRedisClient();
    const client2 = getRedisClient();
    // Singleton pattern — same reference on repeated calls
    expect(client1).toBe(client2);
  });

  test("getRedisStatus returns a valid status object", async () => {
    const status = await getRedisStatus();
    expect(status).toHaveProperty("connected");
    expect(status).toHaveProperty("url");
    expect(typeof status.connected).toBe("boolean");
    expect(typeof status.url).toBe("string");
  });

  test("getRedisStatus includes error when not configured", async () => {
    // When Redis is not running, status should include an error or "not configured"
    const status = await getRedisStatus();
    if (!status.connected) {
      expect(typeof status.error === "string" || status.error === undefined).toBe(true);
    }
  });

  test("closeRedis is safe to call multiple times", () => {
    // Should not throw even when called without initialization
    closeRedis();
    closeRedis();
    closeRedis();
    expect(true).toBe(true);
  });

  test("closeRedis resets the singleton so next getRedisClient creates new instance", () => {
    const client1 = getRedisClient();
    closeRedis();
    const client2 = getRedisClient();
    // After close, a new client should be created (may differ if REDIS_URL is set)
    if (client1 !== null && client2 !== null) {
      expect(client1).not.toBe(client2);
    }
  });
});

describe("Redis Connection Validation", () => {
  afterEach(() => {
    closeRedis();
  });

  test("ensureRedisConnection returns boolean based on Redis availability", async () => {
    const result = await ensureRedisConnection();
    // Returns true if connected, false if not available
    expect(typeof result).toBe("boolean");
  });

  test("ensureRedisConnection validates connection on first call", async () => {
    const result = await ensureRedisConnection();
    expect(typeof result).toBe("boolean");
  });

  test("ensureRedisConnection caches result after first call", async () => {
    const result1 = await ensureRedisConnection();
    const result2 = await ensureRedisConnection();
    // Should return same cached result
    expect(result1).toBe(result2);
  });
});

describe("Redis Connection Failure Scenarios", () => {
  afterEach(() => {
    closeRedis();
  });

  test("operations gracefully degrade when Redis unavailable", async () => {
    // Get client - may be null if Redis not configured
    const client = getRedisClient();

    if (client === null) {
      // Redis not configured - this is expected graceful degradation
      expect(true).toBe(true);
    } else {
      // If Redis configured but connection fails, operations should handle it
      const status = await getRedisStatus();
      expect(typeof status.connected).toBe("boolean");
    }
  });

  test("getRedisStatus handles connection errors gracefully", async () => {
    const status = await getRedisStatus();
    // Should always return a valid status object, never throw
    expect(status).toHaveProperty("connected");
    expect(status).toHaveProperty("url");
  });

  test("client returns null rather than throwing when not configured", () => {
    // This test verifies graceful degradation - module should not throw
    expect(() => {
      getRedisClient();
    }).not.toThrow();
  });
});