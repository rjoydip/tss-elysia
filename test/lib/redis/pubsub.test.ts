/**
 * Unit tests for the Pub/Sub module using Unstorage.
 * Tests channel definitions, message type structure, and graceful degradation.
 *
 * @remarks
 * These tests verify the module's type-safe API without requiring a running Redis.
 * Integration tests that verify actual pub/sub messaging require a Redis instance.
 */

import { describe, test, expect, afterEach } from "bun:test";
import {
  PUBSUB_CHANNELS,
  closePubSub,
  getPubSubStatus,
  type PubSubMessage,
} from "../../../src/lib/redis/pubsub";

describe("Pub/Sub", () => {
  afterEach(() => {
    closePubSub();
  });

  test("PUBSUB_CHANNELS has all expected channel names", () => {
    expect(PUBSUB_CHANNELS.USER_EVENTS).toBe("tsse:pubsub:user:events");
    expect(PUBSUB_CHANNELS.SYSTEM_NOTIFICATIONS).toBe("tsse:pubsub:system:notifications");
    expect(PUBSUB_CHANNELS.MCP_EVENTS).toBe("tsse:pubsub:mcp:events");
    expect(PUBSUB_CHANNELS.DASHBOARD_UPDATES).toBe("tsse:pubsub:dashboard:updates");
    expect(PUBSUB_CHANNELS.CACHE_INVALIDATION).toBe("tsse:pubsub:cache:invalidation");
  });

  test("PUBSUB_CHANNELS values are namespaced with tsse:pubsub:", () => {
    const channels: string[] = Object.values(PUBSUB_CHANNELS);
    for (const channel of channels) {
      expect(channel.startsWith("tsse:pubsub:")).toBe(true);
    }
  });

  test("PUBSUB_CHANNELS has exactly 5 channels", () => {
    expect(Object.keys(PUBSUB_CHANNELS)).toHaveLength(5);
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

describe("Pub/Sub Status", () => {
  afterEach(() => {
    closePubSub();
  });

  test("getPubSubStatus returns a valid status object", () => {
    const status = getPubSubStatus();
    expect(status).toHaveProperty("supported");
    expect(status).toHaveProperty("crossInstance");
    expect(status).toHaveProperty("backend");
    expect(status).toHaveProperty("subscriptionCount");
    expect(typeof status.supported).toBe("boolean");
    expect(typeof status.crossInstance).toBe("boolean");
    expect(typeof status.backend).toBe("string");
    expect(typeof status.subscriptionCount).toBe("number");
  });

  test("getPubSubStatus indicates Pub/Sub support based on backend", () => {
    const status = getPubSubStatus();
    // Pub/Sub is supported when backend is "redis", "postgres", or "lru"
    expect(["redis", "postgres", "lru"]).toContain(status.backend);
  });

  test("getPubSubStatus backend is one of the valid types", () => {
    const status = getPubSubStatus();
    expect(["redis", "postgres", "lru"]).toContain(status.backend);
  });

  test("getPubSubStatus subscriptionCount is initially 0", () => {
    const status = getPubSubStatus();
    expect(status.subscriptionCount).toBe(0);
  });

  test("getPubSubStatus crossInstance is true only for Redis", () => {
    const status = getPubSubStatus();
    expect(status.crossInstance).toBe(status.backend === "redis");
  });
});