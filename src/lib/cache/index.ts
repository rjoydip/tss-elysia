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

import { getStorage } from "~/lib/redis";
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
 * Unstorage-backed cache store.
 */
class StorageCache {
  private readonly prefix: string;

  constructor(namespace: string = DEFAULT_NAMESPACE) {
    this.prefix = `${namespace}:`;
  }

  /**
   * Gets the storage instance.
   */
  private getStorage() {
    return getStorage();
  }

  /**
   * Gets a value from cache.
   *
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const storage = this.getStorage();
    if (!storage) {
      return memoryCache.get<T>(key);
    }

    try {
      const storeKey = `${this.prefix}${key}`;
      const value = await storage.getItem(storeKey);
      if (!value) return null;

      // Try to parse as JSON, if that fails return as-is (for strings)
      try {
        return JSON.parse(value as string) as T;
      } catch {
        // If JSON parse fails, return the value directly
        return value as T;
      }
    } catch (error) {
      redisLogger.error("Storage cache get failed", error as Error);
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
    const ttlSecondsInt = ttlSeconds > 0 ? Math.floor(ttlSeconds) : DEFAULT_TTL;

    const storage = this.getStorage();
    if (!storage) {
      memoryCache.set(key, value, ttlSecondsInt);
      return;
    }

    try {
      const storeKey = `${this.prefix}${key}`;
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      await storage.setItem(storeKey, serialized, { ttl: ttlSecondsInt });
    } catch (error) {
      redisLogger.error("Storage cache set failed", error as Error);
      memoryCache.set(key, value, ttlSecondsInt);
    }
  }

  /**
   * Deletes a key from cache.
   *
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<void> {
    const storage = this.getStorage();
    if (!storage) {
      memoryCache.delete(key);
      return;
    }

    try {
      const storeKey = `${this.prefix}${key}`;
      await storage.removeItem(storeKey);
    } catch (error) {
      redisLogger.error("Storage cache delete failed", error as Error);
    }
  }

  /**
   * Clears all keys in the namespace.
   */
  async clear(): Promise<void> {
    const storage = this.getStorage();
    if (!storage) {
      await memoryCache.clear();
      return;
    }

    try {
      const keys = await storage.getKeys(this.prefix);
      await Promise.all(keys.map((k: string) => storage.removeItem(k)));
    } catch (error) {
      redisLogger.error("Storage cache clear failed", error as Error);
    }
  }

  /**
   * Checks if a key exists in cache.
   *
   * @param key - Cache key
   * @returns True if key exists
   */
  async has(key: string): Promise<boolean> {
    const storage = this.getStorage();
    if (!storage) {
      return memoryCache.has(key);
    }

    try {
      const storeKey = `${this.prefix}${key}`;
      const value = await storage.getItem(storeKey);
      return value !== null && value !== undefined;
    } catch (error) {
      redisLogger.error("Storage cache has failed", error as Error);
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
export const redisCache = new StorageCache();

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
 * Gets a cache instance based on storage availability.
 *
 * @param options - Cache options
 * @returns Cache interface instance
 */
export function getCache(options: CacheOptions = {}): CacheInterface {
  const storage = getStorage();
  if (storage) {
    return new StorageCache(options.namespace);
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