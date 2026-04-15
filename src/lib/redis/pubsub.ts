/**
 * Pub/Sub module using Bun's native RedisClient.
 * Provides typed channel definitions and convenience wrappers
 * for publishing and subscribing to events.
 *
 * Pub/Sub is only available when Redis is the storage backend.
 * For other backends (PostgreSQL, LRU), Pub/Sub operations gracefully degrade.
 *
 * When using Redis:
 * - Creates dedicated subscriber connection (required by Redis for subscribe mode)
 * - Creates separate publisher connection for reliability
 *
 * @module redis/pubsub
 * @see https://bun.com/docs/runtime/redis#pub/sub
 */

import { RedisClient } from "bun";
import { env } from "~/config/env";
import { redisLogger } from "../logger";
import { getStorageBackend, isPubSubSupported } from "./index";

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

/**
 * Pub/Sub connection status for health checks.
 */
export interface PubSubStatus {
  /** Whether Pub/Sub is supported by the current backend */
  supported: boolean;
  /** Current storage backend type */
  backend: "redis" | "postgres" | "lru";
  /** Whether publisher is connected */
  publisherConnected: boolean;
  /** Whether subscriber is connected */
  subscriberConnected: boolean;
}

/** Dedicated subscriber client — separate from the main client */
let subscriberClient: RedisClient | null = null;

/** Publisher client reference — separate instance for publishing */
let publisherClient: RedisClient | null = null;

/**
 * Checks if Pub/Sub can be initialized based on backend type.
 * Pub/Sub requires Redis as the storage backend.
 *
 * @returns True if Redis is available for Pub/Sub
 */
function canUsePubSub(): boolean {
  if (!isPubSubSupported()) {
    const backend = getStorageBackend();
    redisLogger.debug(`Pub/Sub not supported with ${backend} backend`, {
      supported: false,
      backend,
      hint: "Set REDIS_URL to enable Pub/Sub support",
    });
    return false;
  }
  return true;
}

/**
 * Creates a dedicated subscriber connection.
 * Redis requires separate connections for Pub/Sub subscribers
 * because a subscribed connection cannot execute regular commands.
 *
 * @returns Subscriber RedisClient or null if Redis is unavailable
 */
export async function getSubscriber(): Promise<RedisClient | null> {
  if (!canUsePubSub()) {
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
      redisLogger.error("Failed to create Pub/Sub subscriber", error as Error);
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
export async function getPublisher(): Promise<RedisClient | null> {
  if (!canUsePubSub()) {
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

      // Explicitly connect the publisher before first use
      await publisherClient.connect();
      redisLogger.info("Pub/Sub publisher connected");
    } catch (error) {
      redisLogger.error("Failed to create Pub/Sub publisher", error as Error);
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
  const publisher = await getPublisher();
  if (!publisher) {
    redisLogger.debug("Pub/Sub publisher not available, skipping publish", {
      channel,
      backend: getStorageBackend(),
    });
    return 0;
  }

  try {
    const serialized = JSON.stringify(message);
    const result = await publisher.publish(channel, serialized);
    redisLogger.debug("Published Pub/Sub message", {
      channel,
      type: message.type,
      subscribers: result,
    });
    return result as number;
  } catch (error) {
    redisLogger.error("Failed to publish Pub/Sub message", error as Error);
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
    redisLogger.debug("Pub/Sub subscriber not available, skipping subscribe", {
      channel,
      backend: getStorageBackend(),
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
    redisLogger.info("Subscribed to Pub/Sub channel", { channel });
  } catch (error) {
    redisLogger.error("Failed to subscribe to Pub/Sub channel", error as Error);
  }
}

/**
 * Gets the Pub/Sub status for health checks.
 *
 * @returns Pub/Sub status object
 */
export function getPubSubStatus(): PubSubStatus {
  const backend = getStorageBackend();
  const supported = isPubSubSupported();

  return {
    supported,
    backend,
    publisherConnected: publisherClient !== null,
    subscriberConnected: subscriberClient !== null,
  };
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