/**
 * Unit tests for the Redis Pub/Sub module.
 * Tests channel definitions, message type structure, and graceful degradation.
 *
 * @remarks
 * These tests verify the module's type-safe API without requiring a running Redis.
 * Integration tests that verify actual pub/sub messaging require a Redis instance.
 */

import { describe, test, expect } from "bun:test";
import { REDIS_CHANNELS, closePubSub, type PubSubMessage } from "../../../src/lib/redis/pubsub";

describe("Redis Pub/Sub", () => {
  test("REDIS_CHANNELS has all expected channel names", () => {
    expect(REDIS_CHANNELS.USER_EVENTS).toBe("tsse:user:events");
    expect(REDIS_CHANNELS.SYSTEM_NOTIFICATIONS).toBe("tsse:system:notifications");
    expect(REDIS_CHANNELS.MCP_EVENTS).toBe("tsse:mcp:events");
    expect(REDIS_CHANNELS.DASHBOARD_UPDATES).toBe("tsse:dashboard:updates");
    expect(REDIS_CHANNELS.CACHE_INVALIDATION).toBe("tsse:cache:invalidation");
  });

  test("REDIS_CHANNELS values are namespaced with tsse:", () => {
    const channels: string[] = Object.values(REDIS_CHANNELS);
    for (const channel of channels) {
      expect(channel.startsWith("tsse:")).toBe(true);
    }
  });

  test("REDIS_CHANNELS has exactly 5 channels", () => {
    expect(Object.keys(REDIS_CHANNELS)).toHaveLength(5);
  });

  test("PubSubMessage structure is correct", () => {
    // Verify the interface compiles and works as expected
    const message: PubSubMessage<{ userId: string }> = {
      type: "user.login",
      data: { userId: "123" },
      timestamp: new Date().toISOString(),
      source: "auth",
    };

    expect(message.type).toBe("user.login");
    expect(message.data.userId).toBe("123");
    expect(message.source).toBe("auth");
    expect(typeof message.timestamp).toBe("string");
  });

  test("PubSubMessage works without optional source field", () => {
    const message: PubSubMessage<string> = {
      type: "cache.clear",
      data: "user:*",
      timestamp: new Date().toISOString(),
    };

    expect(message.type).toBe("cache.clear");
    expect(message.data).toBe("user:*");
    expect(message.source).toBeUndefined();
  });

  test("closePubSub is safe to call without active connections", () => {
    // Should not throw even when no connections have been established
    closePubSub();
    closePubSub();
    expect(true).toBe(true);
  });
});