/**
 * Pub/Sub implementation using unstorage.
 * Supports Redis pub/sub, PostgreSQL LISTEN/NOTIFY, and SQLite polling.
 *
 * @module redis/pubsub
 * @see https://unstorage.unjs.io/
 */

import { createStorage, type Storage } from "unstorage";
import { createDatabase } from "db0";
import type { Connector } from "db0";
import { env } from "~/config/env";
import { redisLogger } from "../logger";

/**
 * Predefined channel names for the application.
 */
export const REDIS_CHANNELS = {
  USER_EVENTS: "tsse:user:events",
  SYSTEM_NOTIFICATIONS: "tsse:system:notifications",
  MCP_EVENTS: "tsse:mcp:events",
  DASHBOARD_UPDATES: "tsse:dashboard:updates",
  CACHE_INVALIDATION: "tsse:cache:invalidation",
} as const;

export type RedisChannel = (typeof REDIS_CHANNELS)[keyof typeof REDIS_CHANNELS];

/**
 * Message payload structure for typed Pub/Sub events.
 */
export interface PubSubMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
  source?: string;
}

/** Storage for pub/sub message persistence */
let pubsubStorage: Storage | null = null;

/** Track initialization state */
let pubsubInitialized = false;

/** Polling interval for SQLite subscribers (ms) */
const POLL_INTERVAL = 100;

/** Active polling intervals */
const activePollIntervals: Map<string, NodeJS.Timeout> = new Map();

/**
 * Gets the database connection URI based on DATABASE_TYPE.
 */
function getDatabaseUri(): string {
  const dbPath = env.DATABASE_PATH ?? ".artifacts";
  const dbName = env.DATABASE_NAME ?? "tss-elysia.db";

  if (env.DATABASE_TYPE === "postgres") {
    if (env.POSTGRES_URL) return env.POSTGRES_URL;
    const host = env.POSTGRES_HOST ?? "localhost";
    const port = env.POSTGRES_PORT ?? 5432;
    const user = env.POSTGRES_USER ?? "postgres";
    const password = env.POSTGRES_PASSWORD ?? "";
    const database = env.POSTGRES_DB ?? "tss-elysia";
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
  }

  return `sqlite://${dbPath}/${dbName}`;
}

/**
 * Initializes the pub/sub storage asynchronously.
 */
async function initPubSubStorageAsync(): Promise<Storage | null> {
  if (env.REDIS_URL) {
    try {
      const { default: redisDriver } = await import("unstorage/drivers/redis");
      pubsubStorage = createStorage({
        driver: redisDriver({ url: env.REDIS_URL }),
      });
      redisLogger.info("Redis pub/sub storage initialized");
      return pubsubStorage;
    } catch (error) {
      redisLogger.warn("Failed to init Redis pub/sub, falling back to database", {
        error: (error as Error).message,
      });
    }
  }

  try {
    let connector: Connector;

    if (env.DATABASE_TYPE === "postgres") {
      const { default: postgresql } = await import("db0/connectors/postgresql");
      connector = postgresql({ url: getDatabaseUri() });
    } else {
      const { default: sqlite } = await import("db0/connectors/better-sqlite3");
      const dbPath = env.DATABASE_PATH ?? ".artifacts";
      const dbName = env.DATABASE_NAME ?? "tss-elysia.db";
      connector = sqlite({ path: `${dbPath}/${dbName}` });
    }

    const database = createDatabase(connector);
    const { default: dbDriver } = await import("unstorage/drivers/db0");

    pubsubStorage = createStorage({
      driver: dbDriver({
        database,
        tableName: "pubsub_messages",
      }),
    });

    redisLogger.info("Database pub/sub storage initialized", {
      type: env.DATABASE_TYPE ?? "sqlite",
    });

    return pubsubStorage;
  } catch (error) {
    redisLogger.error("Failed to initialize pub/sub storage", error as Error);
    return null;
  }
}

/**
 * Returns the pub/sub storage asynchronously.
 */
export async function getPubSubStorageAsync(): Promise<Storage | null> {
  if (pubsubStorage) return pubsubStorage;

  if (!pubsubInitialized) {
    pubsubInitialized = true;
    pubsubStorage = await initPubSubStorageAsync();
  }

  return pubsubStorage;
}

/**
 * Returns the pub/sub storage (sync, may return null).
 */
export function getPubSubStorage(): Storage | null {
  return pubsubStorage;
}

/**
 * Generates a unique subscriber ID.
 */
function generateSubscriberId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Stores a message in the storage (for SQLite polling).
 */
async function storeMessage(channel: RedisChannel, message: PubSubMessage): Promise<void> {
  const store = await getPubSubStorageAsync();
  if (!store) return;

  const messageKey = `${channel}:${message.timestamp}:${Math.random().toString(36).substring(2, 9)}`;
  try {
    await store.set(messageKey, message);
  } catch (error) {
    redisLogger.error("Failed to store pub/sub message", error as Error);
  }
}

/**
 * Gets messages for a channel since a given timestamp (for polling).
 */
async function getMessagesSince(channel: RedisChannel, since: number): Promise<PubSubMessage[]> {
  const store = await getPubSubStorageAsync();
  if (!store) return [];

  try {
    const messages: PubSubMessage[] = [];
    const keys = await store.getKeys();

    for (const key of keys) {
      if (key.startsWith(channel + ":")) {
        const value = (await store.get(key)) as PubSubMessage | undefined;
        if (value) {
          const msgTime = new Date(value.timestamp).getTime();
          if (msgTime > since) {
            messages.push(value);
          }
        }
      }
    }

    return messages.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  } catch (error) {
    redisLogger.error("Failed to get messages", error as Error);
    return [];
  }
}

/**
 * Publishes a typed message to a channel.
 */
export async function publish<T>(
  channel: RedisChannel,
  message: PubSubMessage<T>,
): Promise<number> {
  const fullMessage = {
    ...message,
    timestamp: message.timestamp || new Date().toISOString(),
  };

  // PostgreSQL: Use NOTIFY
  if (env.DATABASE_TYPE === "postgres" && !env.REDIS_URL) {
    try {
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: getDatabaseUri() });
      await pool.query(`NOTIFY "${channel}", '${JSON.stringify(fullMessage)}'`);
      await pool.end();

      redisLogger.debug("Published message via PostgreSQL NOTIFY", {
        channel,
        type: message.type,
      });
      return 1;
    } catch (error) {
      redisLogger.error("Failed to publish via PostgreSQL NOTIFY", error as Error);
    }
  }

  // SQLite or Redis fallback: Store message in table
  await storeMessage(channel, fullMessage);
  redisLogger.debug("Published message to storage", {
    channel,
    type: message.type,
  });

  return 1;
}

/**
 * Subscribes to a channel with a typed message handler.
 */
export async function subscribe<T>(
  channel: RedisChannel,
  handler: (message: PubSubMessage<T>, channel: string) => void,
): Promise<void> {
  // PostgreSQL: Use LISTEN/NOTIFY
  if (env.DATABASE_TYPE === "postgres" && !env.REDIS_URL) {
    try {
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: getDatabaseUri() });

      await pool.query(`LISTEN "${channel}"`);

      // @ts-ignore - pg Pool notification event
      pool.on("notification", (msg: { payload: string; channel: string }) => {
        try {
          const parsed = JSON.parse(msg.payload) as PubSubMessage<T>;
          handler(parsed, msg.channel);
        } catch (parseError) {
          redisLogger.error("Failed to parse PostgreSQL notification", parseError as Error);
        }
      });

      redisLogger.info("Subscribed to PostgreSQL channel", { channel });
      return;
    } catch (error) {
      redisLogger.error("Failed to subscribe to PostgreSQL channel", error as Error);
    }
  }

  // SQLite or Redis fallback: Polling-based subscription
  const subscriberId = generateSubscriberId();
  let lastCheck = Date.now();

  const pollMessages = async () => {
    try {
      const messages = await getMessagesSince(channel, lastCheck);
      for (const msg of messages) {
        lastCheck = new Date(msg.timestamp).getTime();
        handler(msg as PubSubMessage<T>, channel);
      }
    } catch (error) {
      redisLogger.error("Error polling messages", error as Error);
    }
  };

  const intervalId = setInterval(pollMessages, POLL_INTERVAL);
  activePollIntervals.set(subscriberId, intervalId);

  redisLogger.info("Subscribed to channel (polling)", { channel });
}

/**
 * Closes all pub/sub connections and stops polling.
 */
export function closePubSub(): void {
  // Stop all polling intervals
  for (const [_id, intervalId] of activePollIntervals) {
    clearInterval(intervalId);
  }
  activePollIntervals.clear();

  // Close storage
  if (pubsubStorage) {
    try {
      if (typeof pubsubStorage.dispose === "function") {
        pubsubStorage.dispose();
      }
    } catch {
      // Ignore during shutdown
    }
    pubsubStorage = null;
  }

  pubsubInitialized = false;
  redisLogger.info("Pub/Sub connections closed");
}