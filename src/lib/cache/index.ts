/**
 * Redis-backed caching layer.
 * Provides a simple key-value cache with TTL support.
 *
 * Features:
 * - Redis backend with automatic TTL expiration
 * - In-memory fallback when Redis unavailable
 * - JSON serialization for complex values
 * - Cache invalidation support
 *
 * @module cache
 */

import { getRedisClient } from "~/lib/redis";
import { redisLogger } from "~/lib/logger";

/**
 * Cache entry with metadata.
 */
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Cache options.
 */
export interface CacheOptions {
  /** Time to live in seconds (default: 300 = 5 minutes) */
  ttl?: number;
  /** Namespace prefix for cache keys */
  namespace?: string;
}

/**
 * Default cache TTL: 5 minutes.
 */
const DEFAULT_TTL = 300;

/**
 * Cache key prefix.
 */
const DEFAULT_NAMESPACE = "cache";

/**
 * In-memory cache store for fallback.
 */
class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Gets a value from cache.
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Sets a value in cache.
   */
  async set<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Deletes a key from cache.
   */
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  /**
   * Clears all entries in a namespace.
   */
  async clear(): Promise<void> {
    this.store.clear();
  }

  /**
   * Checks if a key exists in cache.
   */
  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }
}

/**
 * Redis-backed cache store.
 */
class RedisCache {
  private readonly prefix: string;

  constructor(namespace: string = DEFAULT_NAMESPACE) {
    this.prefix = `${namespace}:`;
  }

  /**
   * Gets the Redis client.
   */
  private getClient() {
    return getRedisClient();
  }

  /**
   * Gets a value from cache.
   *
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const client = this.getClient();
    if (!client) {
      return memoryCache.get<T>(key);
    }

    try {
      const redisKey = `${this.prefix}${key}`;
      const result = await client.send("GET", [redisKey]);

      if (!result) return null;

      const str = Array.isArray(result) ? result[0] : result;
      if (!str) return null;
      try {
        return JSON.parse(str) as T;
      } catch {
        redisLogger.warn("Failed to parse cache JSON", { key });
        return null;
      }
    } catch (error) {
      redisLogger.error("Redis cache get failed", error as Error);
      return memoryCache.get<T>(key);
    }
  }

  /**
   * Sets a value in cache.
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - Time to live in seconds
   */
  async set<T>(key: string, value: T, ttlSeconds: number = DEFAULT_TTL): Promise<void> {
    if (ttlSeconds <= 0) {
      ttlSeconds = DEFAULT_TTL;
    }

    const client = this.getClient();
    if (!client) {
      memoryCache.set(key, value, ttlSeconds);
      return;
    }

    try {
      const redisKey = `${this.prefix}${key}`;
      const serialized = JSON.stringify(value);

      await client.send("SET", [redisKey, serialized]);
      await client.send("EXPIRE", [redisKey, String(ttlSeconds)]);
    } catch (error) {
      redisLogger.error("Redis cache set failed", error as Error);
      memoryCache.set(key, value, ttlSeconds);
    }
  }

  /**
   * Deletes a key from cache.
   *
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<void> {
    const client = this.getClient();
    if (!client) {
      memoryCache.delete(key);
      return;
    }

    try {
      const redisKey = `${this.prefix}${key}`;
      await client.send("DEL", [redisKey]);
    } catch (error) {
      redisLogger.error("Redis cache delete failed", error as Error);
    }
  }

  /**
   * Clears all keys in the namespace.
   */
  async clear(): Promise<void> {
    const client = this.getClient();
    if (!client) {
      await memoryCache.clear();
      return;
    }

    try {
      // Use SCAN to find keys, then delete in batch using pipeline
      let cursor = "0";
      do {
        const [nextCursor, keys] = await client.send("SCAN", [
          cursor,
          "MATCH",
          `${this.prefix}*`,
          "COUNT",
          "100",
        ]);
        cursor = nextCursor;

        if (keys && keys.length > 0) {
          // Use pipeline for batch deletion
          const pipelineCommands: [string, string[]][] = keys.map((key: string) => ["DEL", [key]]);
          await Promise.all(
            pipelineCommands.map(([cmd, args]) => client.send(cmd as string, args)),
          );
        }
      } while (cursor !== "0");
    } catch (error) {
      redisLogger.error("Redis cache clear failed", error as Error);
    }
  }

  /**
   * Checks if a key exists in cache.
   *
   * @param key - Cache key
   * @returns True if key exists
   */
  async has(key: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) {
      return memoryCache.has(key);
    }

    try {
      const redisKey = `${this.prefix}${key}`;
      const result = await client.send("EXISTS", [redisKey]);
      return result === 1;
    } catch (error) {
      redisLogger.error("Redis cache has failed", error as Error);
      return memoryCache.has(key);
    }
  }
}

/**
 * Memory cache fallback instance.
 */
const memoryCache = new MemoryCache();

/**
 * Redis cache instance (for type inference).
 */
export const redisCache = new RedisCache();

/**
 * Cache interface for type-safe operations.
 */
export interface CacheInterface {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * Gets a cache instance based on Redis availability.
 *
 * @param options - Cache options
 * @returns Cache interface instance
 */
export function getCache(options: CacheOptions = {}): CacheInterface {
  const client = getRedisClient();
  if (client) {
    return new RedisCache(options.namespace);
  }
  return memoryCache as unknown as CacheInterface;
}

/**
 * Default cache instance.
 */
export const cache = getCache();

/**
 * Gets a cached value.
 *
 * @param key - Cache key
 * @returns Cached value or null
 */
export async function getCached<T>(key: string): Promise<T | null> {
  return cache.get<T>(key);
}

/**
 * Sets a cached value.
 *
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttlSeconds - Time to live in seconds
 */
export async function setCached<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  return cache.set(key, value, ttlSeconds);
}

/**
 * Deletes a cached value.
 *
 * @param key - Cache key
 */
export async function deleteCached(key: string): Promise<void> {
  return cache.delete(key);
}

/**
 * Clears the cache.
 */
export async function clearCache(): Promise<void> {
  return cache.clear();
}

/**
 * Checks if a key is cached.
 *
 * @param key - Cache key
 * @returns True if cached
 */
export async function isCached(key: string): Promise<boolean> {
  return cache.has(key);
}