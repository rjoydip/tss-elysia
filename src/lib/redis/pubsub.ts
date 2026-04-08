/**
 * Redis Pub/Sub helpers using Bun's native RedisClient.
 * Provides typed channel definitions and convenience wrappers
 * for publishing and subscribing to events.
 *
 * Pub/Sub requires a dedicated subscriber connection because
 * Redis connections in subscribe mode cannot execute regular commands.
 * The publisher reuses a separate client instance.
 *
 * @module redis/pubsub
 * @see https://bun.com/docs/runtime/redis#pub/sub
 */

import { RedisClient } from "bun";
import { env } from "~/config/env";
import { redisLogger } from "../logger";

/**
 * Predefined channel names for the application.
 * All channels are namespaced with "tsse:" to avoid collisions.
 * Add new channels here as features require them.
 */
export const REDIS_CHANNELS = {
  /** User-related events (login, logout, profile update) */
  USER_EVENTS: "tsse:user:events",
  /** System notifications (deployments, maintenance windows) */
  SYSTEM_NOTIFICATIONS: "tsse:system:notifications",
  /** MCP server events (tool invocations, client connections) */
  MCP_EVENTS: "tsse:mcp:events",
  /** Real-time dashboard metric updates */
  DASHBOARD_UPDATES: "tsse:dashboard:updates",
  /** Cache invalidation signals across instances */
  CACHE_INVALIDATION: "tsse:cache:invalidation",
} as const;

/** Type for valid channel names — provides autocomplete and type-safety */
export type RedisChannel = (typeof REDIS_CHANNELS)[keyof typeof REDIS_CHANNELS];

/**
 * Message payload structure for typed Pub/Sub events.
 * All published messages follow this shape for consistency.
 *
 * @template T - The type of the event-specific data payload
 */
export interface PubSubMessage<T = unknown> {
  /** Event type identifier (e.g., "user.login", "cache.clear") */
  type: string;
  /** Event payload data */
  data: T;
  /** ISO timestamp of when the event was created */
  timestamp: string;
  /** Optional source identifier (service/module name) */
  source?: string;
}

/** Dedicated subscriber client — separate from the main client */
let subscriberClient: RedisClient | null = null;

/** Publisher client reference — separate instance for publishing */
let publisherClient: RedisClient | null = null;

/**
 * Creates a dedicated subscriber connection.
 * Redis requires separate connections for Pub/Sub subscribers
 * because a subscribed connection cannot execute regular commands.
 *
 * @returns Subscriber RedisClient or null if Redis is unavailable
 */
export async function getSubscriber(): Promise<RedisClient | null> {
  if (!env.REDIS_URL) {
    redisLogger.debug("REDIS_URL not configured, Pub/Sub disabled");
    return null;
  }

  if (!subscriberClient) {
    try {
      subscriberClient = new RedisClient(env.REDIS_URL as string, {
        connectionTimeout: 10_000,
        autoReconnect: true,
        maxRetries: 5,
        enableOfflineQueue: true,
      });

      // Explicitly connect the subscriber — it needs to be ready for subscriptions
      await subscriberClient.connect();
      redisLogger.info("Pub/Sub subscriber connected");
    } catch (error) {
      redisLogger.error("Failed to create subscriber", error as Error);
      subscriberClient = null;
    }
  }

  return subscriberClient;
}

/**
 * Returns the publisher client for sending messages to channels.
 * Uses a separate RedisClient instance from the main client.
 *
 * @returns Publisher RedisClient or null if Redis is unavailable
 */
export function getPublisher(): RedisClient | null {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!publisherClient) {
    try {
      publisherClient = new RedisClient(env.REDIS_URL as string, {
        connectionTimeout: 10_000,
        autoReconnect: true,
        maxRetries: 5,
        enableOfflineQueue: true,
        enableAutoPipelining: true,
      });
      redisLogger.info("Pub/Sub publisher initialized");
    } catch (error) {
      redisLogger.error("Failed to create publisher", error as Error);
      publisherClient = null;
    }
  }

  return publisherClient;
}

/**
 * Publishes a typed message to a Redis channel.
 * Serializes the message as JSON before publishing.
 *
 * Returns the number of subscribers that received the message.
 * Returns 0 if Redis is unavailable or publishing fails.
 *
 * @param channel - Target channel name (use REDIS_CHANNELS constants)
 * @param message - Typed message payload to broadcast
 * @returns Number of subscribers that received the message, or 0 on failure
 *
 * @example
 * await publish(REDIS_CHANNELS.USER_EVENTS, {
 *   type: "user.login",
 *   data: { userId: "123" },
 *   timestamp: new Date().toISOString(),
 *   source: "auth",
 * });
 */
export async function publish<T>(
  channel: RedisChannel,
  message: PubSubMessage<T>,
): Promise<number> {
  const publisher = getPublisher();
  if (!publisher) {
    redisLogger.debug("Publisher not available, skipping publish", {
      channel,
    });
    return 0;
  }

  try {
    const serialized = JSON.stringify(message);
    const result = await publisher.publish(channel, serialized);
    redisLogger.debug("Published message", {
      channel,
      type: message.type,
      subscribers: result,
    });
    return result as number;
  } catch (error) {
    redisLogger.error("Failed to publish message", error as Error);
    return 0;
  }
}

/**
 * Subscribes to a Redis channel with a typed message handler.
 * Automatically deserializes JSON messages before invoking the handler.
 *
 * @param channel - Channel to subscribe to (use REDIS_CHANNELS constants)
 * @param handler - Callback invoked for each received message
 *
 * @example
 * await subscribe(REDIS_CHANNELS.USER_EVENTS, (message, channel) => {
 *   console.log(`Got ${message.type} on ${channel}:`, message.data);
 * });
 */
export async function subscribe<T>(
  channel: RedisChannel,
  handler: (message: PubSubMessage<T>, channel: string) => void,
): Promise<void> {
  const subscriber = await getSubscriber();
  if (!subscriber) {
    redisLogger.debug("Subscriber not available, skipping subscribe", {
      channel,
    });
    return;
  }

  try {
    await subscriber.subscribe(channel, (rawMessage: string, ch: string) => {
      try {
        const parsed = JSON.parse(rawMessage) as PubSubMessage<T>;
        handler(parsed, ch);
      } catch (parseError) {
        redisLogger.error("Failed to parse Pub/Sub message", parseError as Error);
      }
    });
    redisLogger.info("Subscribed to channel", { channel });
  } catch (error) {
    redisLogger.error("Failed to subscribe to channel", error as Error);
  }
}

/**
 * Closes all Pub/Sub connections.
 * Should be called during application shutdown.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function closePubSub(): void {
  if (subscriberClient) {
    redisLogger.info("Closing Pub/Sub subscriber");
    subscriberClient.close();
    subscriberClient = null;
  }
  if (publisherClient) {
    redisLogger.info("Closing Pub/Sub publisher");
    publisherClient.close();
    publisherClient = null;
  }
}