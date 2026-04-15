/**
 * Universal storage abstraction layer using unstorage.
 * Supports multiple storage backends based on environment configuration:
 *
 * - Redis:    When REDIS_URL is set in environment
 * - LRU:     When DATABASE_TYPE is "sqlite" (in-memory cache)
 * - Postgres: When DATABASE_TYPE is "postgres" with db0 connector
 *
 * Provides a unified API for key-value storage operations across all backends.
 * The storage is optional — when no backend is configured, all operations
 * gracefully degrade to no-op behavior.
 *
 * @module redis
 * @see https://unstorage.unjs.io
 */

import { createStorage, type Storage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";
import lruCacheDriver from "unstorage/drivers/lru-cache";
import dbDriver from "unstorage/drivers/db0";
import { createDatabase } from "db0";
import postgresql from "db0/connectors/postgresql";
import { env } from "~/config/env";
import { redisLogger } from "../logger";

/**
 * Storage connection status for health checks.
 * Used by the status endpoint to report storage availability.
 */
export interface StorageStatus {
  /** Whether storage is currently connected */
  connected: boolean;
  /** Storage backend type (redis, lru, or postgres) */
  backend: string;
  /** URL or connection info (masked for security) */
  url: string;
  /** Error message if connection failed */
  error?: string;
}

/** Unstorage instance */
let storage: Storage | null = null;

/** Track which backend is being used */
let backendType: "redis" | "lru" | "postgres" | null = null;

/** Track initialization state */
let initialized = false;

/**
 * Masks sensitive parts of a connection URL for logging.
 * Preserves host and port but hides passwords and tokens.
 *
 * @param url - Raw connection URL
 * @returns Masked URL safe for logging
 *
 * @example
 * maskUrl("postgresql://user:secret@host:5432") // "postgresql://user:***@host:5432"
 */
function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.username) {
      parsed.username = "***";
    }
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    return "***";
  }
}

/**
 * Determines the storage backend based on environment configuration.
 * Priority: REDIS_URL > postgres > sqlite (lru)
 */
function getBackendConfig(): {
  backend: "redis" | "lru" | "postgres";
  url: string;
} {
  // Priority 1: Redis URL is set
  if (env.REDIS_URL) {
    return { backend: "redis", url: env.REDIS_URL };
  }

  // Priority 2: PostgreSQL is configured
  if (env.DATABASE_TYPE === "postgres") {
    const postgresUrl = env.POSTGRES_URL || env.DATABASE_URL;
    if (postgresUrl) {
      return { backend: "postgres", url: postgresUrl };
    }
  }

  // Default: SQLite (use LRU cache for in-memory storage)
  return { backend: "lru", url: "in-memory" };
}

/**
 * Creates and initializes the storage instance based on backend configuration.
 *
 * @returns Configured storage instance or null if initialization failed
 */
function createStorageInstance(): Storage | null {
  const config = getBackendConfig();
  backendType = config.backend;

  redisLogger.info(`Initializing cache storage with ${config.backend}`, {
    url: maskUrl(config.url),
  });

  let storageInstance: Storage | null = null;

  try {
    switch (config.backend) {
      case "redis": {
        storageInstance = createStorage({
          driver: redisDriver({
            base: "tss",
            url: env.REDIS_URL,
            // Lazy initialization - connect on first operation
            preConnect: false,
          }),
        });
        break;
      }

      case "postgres": {
        const db0 = createDatabase(
          postgresql({
            url: env.POSTGRES_URL || env.DATABASE_URL,
          }),
        );
        storageInstance = createStorage({
          driver: dbDriver({
            database: db0,
            tableName: "tss_storage",
          }),
        });
        break;
      }

      default: {
        storageInstance = createStorage({
          driver: lruCacheDriver({
            // Default max items
            max: 1000,
          }),
        });
        break;
      }
    }

    storage = storageInstance;
    redisLogger.info(`Storage initialized with ${config.backend} backend`);
    return storageInstance;
  } catch (error) {
    redisLogger.error(`Failed to initialize ${config.backend} storage`, error as Error);
    return null;
  }
}

/**
 * Returns the storage singleton.
 * Creates the storage on first call (lazy initialization).
 *
 * Returns null if no storage backend is configured, allowing the app
 * to run gracefully without storage.
 *
 * @returns Storage instance or null if unavailable
 */
export function getStorage(): Storage | null {
  if (!initialized) {
    initialized = true;
    createStorageInstance();
  }

  return storage;
}

/** Tracks whether storage connection has been validated */
let validated = false;

/**
 * Validates storage connection on first access.
 * Ensures the storage can communicate before returning.
 * Safe to call multiple times - validation runs once.
 */
export async function ensureStorageConnection(): Promise<boolean> {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  if (validated) {
    return storage !== null;
  }

  validated = true;
  return validateStorageConnection();
}

/**
 * Validates storage connectivity by attempting a read operation.
 * Ensures the storage is accessible before operations.
 *
 * @returns True if connection is working, false otherwise
 */
export async function validateStorageConnection(): Promise<boolean> {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    // Attempt a test operation to verify connectivity
    await storage.get("__health_check__");
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks storage connectivity.
 * Used by the health check endpoint to report storage status.
 *
 * @returns Storage connection status object
 */
export async function getStorageStatus(): Promise<StorageStatus> {
  const storage = getStorage();
  const config = getBackendConfig();

  if (!storage) {
    return {
      connected: false,
      backend: config.backend,
      url: maskUrl(config.url),
      error: "Storage not configured",
    };
  }

  try {
    // Attempt a test operation to verify connectivity
    await storage.get("__health_check__");
    return {
      connected: true,
      backend: config.backend,
      url: maskUrl(config.url),
    };
  } catch (error) {
    return {
      connected: false,
      backend: config.backend,
      url: maskUrl(config.url),
      error: (error as Error).message,
    };
  }
}

/**
 * Gracefully closes the storage connection.
 * Should be called during application shutdown to clean up resources.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function closeStorage(): void {
  if (storage) {
    redisLogger.info(`Closing ${backendType} storage`);
    // Clear the storage instance
    storage = null;
    initialized = false;
    backendType = null;
  }
}

/**
 * Returns the current storage backend type.
 * Use this to check if Pub/Sub is available (only Redis supports it).
 *
 * @returns Backend type: "redis", "postgres", or "lru"
 */
export function getStorageBackend(): "redis" | "postgres" | "lru" {
  if (!initialized) {
    getStorage();
  }
  return backendType ?? "lru";
}

/**
 * Checks if Pub/Sub is supported by the current storage backend.
 * Currently, only Redis supports Pub/Sub.
 *
 * @returns True if Pub/Sub is available
 */
export function isPubSubSupported(): boolean {
  return getStorageBackend() === "redis";
}

/**
 * @deprecated Use getStorage() instead. Kept for backward compatibility.
 * Returns the Redis client singleton.
 *
 * This function is deprecated and provided only for backward compatibility.
 * New code should use getStorage() for the unified storage API.
 *
 * @returns Always returns null (RedisClient no longer used)
 * @deprecated Use getStorage() instead
 */
export function getRedisClient(): null | unknown {
  const storage = getStorage();
  if (storage) {
    return storage;
  }
  redisLogger.warn("getRedisClient() is deprecated, use getStorage() instead");
  return null;
}

/**
 * @deprecated Use ensureStorageConnection() instead.
 */
export async function ensureRedisConnection(): Promise<boolean> {
  return ensureStorageConnection();
}

/**
 * @deprecated Use validateStorageConnection() instead.
 */
export async function validateRedisConnection(): Promise<boolean> {
  return validateStorageConnection();
}

/**
 * @deprecated Use getStorageStatus() instead.
 */
export async function getRedisStatus(): Promise<StorageStatus> {
  return getStorageStatus();
}

/**
 * @deprecated Use closeStorage() instead.
 */
export function closeRedis(): void {
  closeStorage();
}

/**
 * Type alias for backward compatibility.
 * @deprecated Use StorageStatus instead
 */
export type RedisStatus = StorageStatus;