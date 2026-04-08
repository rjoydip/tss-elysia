/**
 * Redis client singleton using Bun's native RedisClient.
 * Provides lazy connection, health monitoring, and graceful shutdown.
 *
 * Uses REDIS_URL environment variable for connection string, supporting:
 * - Local Docker: redis://localhost:6379
 * - Upstash:      rediss://default:TOKEN@HOST.upstash.io:6379
 *
 * The client is optional — when REDIS_URL is not set, all functions
 * return null/disabled state so the app can run without Redis.
 *
 * @module redis
 * @see https://bun.com/docs/runtime/redis
 */

import { RedisClient } from "bun";
import { env } from "~/config/env";
import { redisLogger } from "../logger";

/**
 * Redis connection status for health checks.
 * Used by the status endpoint to report Redis availability.
 */
export interface RedisStatus {
  /** Whether Redis is currently connected */
  connected: boolean;
  /** Redis URL (masked for security — hides passwords/tokens) */
  url: string;
  /** Error message if connection failed */
  error?: string;
}

/** Redis client instance — null if REDIS_URL is not configured */
let client: RedisClient | null = null;

/** Track initialization state to avoid multiple connect attempts */
let initialized = false;

/**
 * Masks sensitive parts of the Redis URL for logging.
 * Preserves host, port, and scheme but hides passwords and tokens.
 *
 * @param url - Raw Redis connection URL
 * @returns Masked URL safe for logging
 *
 * @example
 * maskRedisUrl("redis://user:secret@host:6379") // "redis://user:***@host:6379/"
 */
function maskRedisUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    return "redis://***";
  }
}

/**
 * Returns the Redis client singleton.
 * Creates the client on first call (lazy initialization).
 * No connection is made until the first Redis command is executed.
 *
 * Returns null if REDIS_URL is not configured, allowing the app
 * to run gracefully without Redis.
 *
 * @returns RedisClient instance or null if Redis is unavailable
 */
export function getRedisClient(): RedisClient | null {
  if (!env.REDIS_URL) {
    redisLogger.debug("REDIS_URL not configured, Redis disabled");
    return null;
  }

  if (!initialized) {
    initialized = true;
    try {
      client = new RedisClient(env.REDIS_URL as string, {
        // Connection timeout: 10 seconds
        connectionTimeout: 10_000,
        // Auto-reconnect with exponential backoff on disconnection
        autoReconnect: true,
        // Max reconnection attempts before giving up
        maxRetries: 5,
        // Queue commands while disconnected (replayed on reconnect)
        enableOfflineQueue: true,
        // Auto-pipeline concurrent commands for better throughput
        enableAutoPipelining: true,
        // TLS is inferred automatically from rediss:// scheme
      });

      // Log connection lifecycle events for monitoring
      client.onconnect = () => {
        redisLogger.info("Connected to Redis", {
          url: maskRedisUrl(env.REDIS_URL as string),
        });
      };

      client.onclose = (error) => {
        redisLogger.warn("Redis connection closed", {
          error: error?.message ?? "unknown",
        });
      };

      redisLogger.info("Redis client initialized", {
        url: maskRedisUrl(env.REDIS_URL as string),
      });
    } catch (error) {
      redisLogger.error("Failed to initialize Redis client", error as Error);
      client = null;
    }
  }

  return client;
}

/**
 * Checks Redis connectivity by sending a PING command.
 * Used by the health check endpoint to report Redis status.
 *
 * @returns Redis connection status object with connectivity info
 */
export async function getRedisStatus(): Promise<RedisStatus> {
  const redisUrl = env.REDIS_URL as string | undefined;
  const url = redisUrl ? maskRedisUrl(redisUrl) : "not configured";

  const redisClient = getRedisClient();
  if (!redisClient) {
    return { connected: false, url, error: "Redis not configured" };
  }

  try {
    // PING returns "PONG" if the server is reachable and responsive
    const pong = await redisClient.send("PING", []);
    return {
      connected: pong === "PONG",
      url,
    };
  } catch (error) {
    return {
      connected: false,
      url,
      error: (error as Error).message,
    };
  }
}

/**
 * Gracefully closes the Redis connection.
 * Should be called during application shutdown to clean up resources.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function closeRedis(): void {
  if (client) {
    redisLogger.info("Closing Redis connection");
    client.close();
    client = null;
    initialized = false;
  }
}