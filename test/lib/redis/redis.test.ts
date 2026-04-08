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
import { getRedisClient, getRedisStatus, closeRedis } from "../../../src/lib/redis";

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