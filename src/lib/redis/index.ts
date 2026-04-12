/**
 * Unstorage-based storage client supporting multiple backends.
 * Uses unstorage with db0 connectors for database storage.
 *
 * Priority: Redis > SQLite/PostgreSQL based on DATABASE_TYPE
 *
 * @module redis
 * @see https://unstorage.unjs.io/
 * @see https://db0.unjs.io/
 */

import { createStorage, type Storage } from "unstorage";
import { createDatabase } from "db0";
import type { Connector } from "db0";
import { env } from "~/config/env";
import { redisLogger } from "../logger";
import { DEFAULT_DATABASE_NAME, DEFAULT_DATABASE_PATH } from "~/config/db";

/**
 * Storage connection status for health checks.
 */
export interface RedisStatus {
  connected: boolean;
  type: string;
  url: string;
  error?: string;
}

/** Unstorage instance */
let storage: Storage | null = null;

/** Track initialization state */
let initialized = false;

/** Track initialization error */
let initError: Error | null = null;

/**
 * Masks sensitive parts of the connection URL for logging.
 */
function maskUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.username) parsed.username = "***";
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return "***";
  }
}

/**
 * Gets the database connection URI based on DATABASE_TYPE.
 */
function getDatabaseUri(): string {
  const dbPath = env.DATABASE_PATH ?? DEFAULT_DATABASE_PATH;
  const dbName = env.DATABASE_NAME ?? DEFAULT_DATABASE_NAME;

  if (env.DATABASE_TYPE === "postgres") {
    if (env.POSTGRES_URL) return env.POSTGRES_URL;
    const host = env.POSTGRES_HOST ?? "localhost";
    const port = env.POSTGRES_PORT ?? 5432;
    const user = env.POSTGRES_USER ?? "postgres";
    const password = env.POSTGRES_PASSWORD ?? "";
    const database = env.POSTGRES_DB ?? DEFAULT_DATABASE_NAME;
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
  }

  return `sqlite://${dbPath}/${dbName}`;
}

/**
 * Creates and initializes the storage instance.
 * Uses dynamic imports to avoid bundling issues with different environments.
 */
async function initStorageAsync(): Promise<Storage | null> {
  if (env.REDIS_URL) {
    try {
      const { default: redisDriver } = await import("unstorage/drivers/redis");
      const store = createStorage({
        driver: redisDriver({ url: env.REDIS_URL }),
      });
      redisLogger.info("Redis storage initialized", {
        url: maskUrl(env.REDIS_URL),
      });
      return store;
    } catch (error) {
      redisLogger.warn("Failed to initialize Redis storage, falling back to database", {
        error: (error as Error).message,
      });
    }
  }

  try {
    let connector: Connector;

    if (env.DATABASE_TYPE === "postgres") {
      const { default: postgresql } = await import("db0/connectors/postgresql");
      connector = postgresql({ url: getDatabaseUri() });

      const database = createDatabase(connector);
      const { default: dbDriver } = await import("unstorage/drivers/db0");

      const store = createStorage({
        driver: dbDriver({
          database,
          tableName: "storage",
        }),
      });

      const uri = getDatabaseUri();
      redisLogger.info("PostgreSQL cache storage initialized", {
        type: env.DATABASE_TYPE ?? "sqlite",
        url: maskUrl(uri),
      });

      return store;
    } else {
      const { default: lruCacheDriver } = await import("unstorage/drivers/lru-cache");
      const store = createStorage({
        driver: lruCacheDriver({
          maxSize: 10000,
        }),
      });
      redisLogger.info("LRU cache initialized", {
        type: "lru-cache",
      });
      return store;
    }
  } catch (error) {
    redisLogger.error("Failed to initialize database storage", error as Error);
    initError = error as Error;
    return null;
  }
}

/**
 * Returns the storage instance (async initialization).
 */
export async function getStorageAsync(): Promise<Storage | null> {
  if (storage) return storage;

  if (!initialized) {
    initialized = true;
    storage = await initStorageAsync();
  }

  return storage;
}

/**
 * Returns the storage instance (sync, may return null if not initialized).
 */
export function getStorage(): Storage | null {
  return storage;
}

/**
 * Wrapper class that provides RedisClient-compatible interface for unstorage
 */
class StorageWrapper implements PromiseLike<any> {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async send(command: string, args: string[]): Promise<any> {
    const cmd = command.toUpperCase();

    switch (cmd) {
      case "SET": {
        const [key, value, EX, ttl] = args;
        if (EX && ttl) {
          await this.storage.set(key, value, { ttl: parseInt(ttl, 10) * 1000 });
        } else {
          await this.storage.set(key, value);
        }
        return "OK";
      }

      case "GET": {
        const [key] = args;
        const value = await this.storage.getItem(key);
        return value ?? null;
      }

      case "DEL": {
        const keys = args;
        let deleted = 0;
        for (const key of keys) {
          await this.storage.removeItem(key);
          deleted++;
        }
        return deleted;
      }

      case "SCAN": {
        const [_cursor, _match, pattern, countStr] = args;
        const count = parseInt(countStr || "100", 10);
        const keys = await this.storage.getKeys();

        const filteredKeys = keys
          .filter((key: string) => {
            if (pattern) {
              const regex = new RegExp(pattern.replace(/\*/g, ".*"));
              return regex.test(key);
            }
            return true;
          })
          .slice(0, count);

        return ["0", filteredKeys];
      }

      case "PING": {
        return "PONG";
      }

      case "EXPIRE": {
        const [key, seconds] = args;
        const ttlMs = parseInt(seconds, 10) * 1000;
        const value = await this.storage.getItem(key);
        if (value !== null && value !== undefined) {
          await this.storage.set(key, value, { ttl: ttlMs });
          return 1;
        }
        return 0;
      }

      case "TTL": {
        const [key] = args;
        const value = await this.storage.getItem(key);
        return value !== null && value !== undefined ? -1 : -2;
      }

      default:
        redisLogger.warn("Unsupported Redis command in storage wrapper", { command });
        return null;
    }
  }

  // oxlint-disable-line: no-thenable
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this).then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): Promise<any> {
    return Promise.resolve(this).catch(onrejected);
  }

  finally(onfinally?: (() => void) | null): Promise<any> {
    return Promise.resolve(this).finally(onfinally);
  }
}

/**
 * @deprecated Use getStorageAsync() and getStorage() instead.
 * Returns storage wrapper for compatibility.
 */
export function getRedisClient(): StorageWrapper | null {
  return storage ? new StorageWrapper(storage) : null;
}

/** Track whether storage connection has been validated */
let validated = false;

/**
 * Validates storage connection on first access.
 */
export async function ensureRedisConnection(): Promise<boolean> {
  const store = await getStorageAsync();
  if (!store) return false;

  if (validated) return store !== null;

  validated = true;
  return validateRedisConnection();
}

/**
 * Validates storage connectivity.
 */
export async function validateRedisConnection(): Promise<boolean> {
  const store = await getStorageAsync();
  if (!store) return false;

  try {
    await store.get("_health_check");
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks storage connectivity for health endpoint.
 */
export async function getRedisStatus(): Promise<RedisStatus> {
  const uri = env.REDIS_URL ?? getDatabaseUri();
  const url = maskUrl(uri);
  const type = env.REDIS_URL ? "redis" : (env.DATABASE_TYPE ?? "sqlite");

  const store = await getStorageAsync();
  if (!store) {
    return { connected: false, type, url, error: initError?.message ?? "Storage not configured" };
  }

  try {
    await store.get("_health_check");
    return { connected: true, type, url };
  } catch (error) {
    return {
      connected: false,
      type,
      url,
      error: (error as Error).message,
    };
  }
}

/**
 * Gracefully closes the storage connection.
 */
export function closeRedis(): void {
  if (storage) {
    redisLogger.info("Closing storage connection");
    if (typeof storage.dispose === "function") {
      try {
        storage.dispose();
      } catch {
        // Ignore during shutdown
      }
    }
    storage = null;
    initialized = false;
    validated = false;
    initError = null;
  }
}