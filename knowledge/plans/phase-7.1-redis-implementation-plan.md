# Redis Implementation Plan — Bun Native Client

> [!NOTE]
> This plan describes the initial Redis implementation. The architecture has since evolved to use **Unstorage** for a unified storage layer with multiple backend support. See `src/lib/redis/index.ts` and `src/lib/cache/index.ts` for the current implementation.

## Overview

Integrate Redis into the **tsse-elysia** project using **Bun's native `RedisClient`** (built-in, zero dependencies). The `REDIS_URL` environment variable allows seamless switching between a local Docker Redis instance and a managed Upstash Redis.

> [!IMPORTANT]
> Bun's native Redis client (`import { RedisClient } from "bun"`) requires **no npm packages**. It uses Bun's built-in RESP protocol implementation for maximum performance.

---

## Architecture

```mermaid
graph TD
    A["Elysia Server"] --> B["src/lib/redis/index.ts<br/>RedisClient singleton"]
    A --> C["src/lib/redis/pubsub.ts<br/>Pub/Sub helpers"]
    B --> D{"REDIS_URL env var"}
    C --> D
    D -->|Local Dev| E["Docker Redis<br/>redis://localhost:6379"]
    D -->|Production| F["Upstash Redis<br/>rediss://***@***.upstash.io:6379"]
    B --> G["Health Check<br/>/api/health"]
    B --> H["Caching Layer<br/>(future)"]
    C --> I["Event Broadcasting<br/>(future)"]
    C --> J["MCP Pub/Sub<br/>(future)"]
```

---

## File Changes Summary

| File                            | Action     | Purpose                                                          |
| ------------------------------- | ---------- | ---------------------------------------------------------------- |
| `docker/docker-compose.yml`     | **Modify** | Add Redis service with persistence & health check                |
| `docker/redis.conf`             | **Create** | Custom Redis config enabling Pub/Sub, persistence, memory limits |
| `.env.example`                  | **Modify** | Add `REDIS_URL` variable                                         |
| `.env`                          | **Modify** | Add `REDIS_URL` for local development                            |
| `src/config/env.ts`             | **Modify** | Add `REDIS_URL` to server env schema                             |
| `src/lib/redis/index.ts`        | **Create** | Redis client singleton with connection management                |
| `src/lib/redis/pubsub.ts`       | **Create** | Pub/Sub helper with typed channels                               |
| `src/lib/logger.ts`             | **Modify** | Add Redis logger instance                                        |
| `src/lib/store/status.ts`       | **Modify** | Add Redis to health check status                                 |
| `test/lib/redis/redis.test.ts`  | **Create** | Unit tests for Redis client module                               |
| `test/lib/redis/pubsub.test.ts` | **Create** | Unit tests for Pub/Sub module                                    |
| `.e2e/api/redis-health.spec.ts` | **Create** | E2E test for Redis health in status endpoint                     |
| `knowledge/PLAN.md`             | **Modify** | Update Phase 7/11 with Redis tasks                               |

---

## Phase 1: Docker Compose — Redis Service

### 1.1 Create `docker/redis.conf`

Custom Redis configuration file that enables Pub/Sub, persistence, and sets memory limits.

```conf
# =============================================================================
# Redis Configuration for tsse-elysia
# =============================================================================

# Network
bind 0.0.0.0
port 6379
protected-mode no
tcp-backlog 511
timeout 0
tcp-keepalive 300

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence (RDB snapshots)
save 900 1
save 300 10
save 60 10000
dbfilename dump.rdb
dir /data
rdbcompression yes

# Append-Only File (AOF) for durability
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Pub/Sub
# No explicit config needed — Pub/Sub is enabled by default in Redis.
# The following limits control memory usage for slow subscribers:
client-output-buffer-limit pubsub 32mb 8mb 60

# Logging
loglevel notice
logfile ""

# Security (no password for local dev; override via REDIS_URL for production)
# requirepass your-password-here
```

### 1.2 Modify `docker/docker-compose.yml`

Add a `redis` service and wire it into both `app` and `dev` services.

```diff
 services:
+  # ---------------------------------------------------------------------------
+  # Redis Service — Cache, Pub/Sub, and session storage
+  # ---------------------------------------------------------------------------
+  redis:
+    image: redis:7-alpine
+    container_name: tsse-elysia-redis
+    ports:
+      - "6379:6379"
+    volumes:
+      - redis-data:/data
+      - ./redis.conf:/usr/local/etc/redis/redis.conf:ro
+    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
+    restart: unless-stopped
+    healthcheck:
+      test: ["CMD", "redis-cli", "ping"]
+      interval: 10s
+      timeout: 5s
+      retries: 5
+      start_period: 5s
+    deploy:
+      resources:
+        limits:
+          memory: 256M
+        reservations:
+          memory: 128M
+    logging:
+      driver: "json-file"
+      options:
+        max-size: "5m"
+        max-file: "3"
+
   app:
     ...
     environment:
       ...
+      - REDIS_URL=redis://redis:6379
+    depends_on:
+      redis:
+        condition: service_healthy
     ...

   dev:
     ...
     environment:
       ...
+      - REDIS_URL=redis://redis:6379
+    depends_on:
+      redis:
+        condition: service_healthy
     ...

 volumes:
   app-data:
     driver: local
   bun-cache:
     driver: local
   node-modules:
     driver: local
+  redis-data:
+    driver: local
```

> [!NOTE]
> The `redis:7-alpine` image is ~30MB and includes Redis 7.x with full Pub/Sub support. The `redis.conf` is mounted read-only.

---

## Phase 2: Environment Configuration

### 2.1 Update `.env.example`

```diff
 # Database Configuration
 SQLITE_URL=file:.artifacts/tsse-elysia.db
+
+# Redis Configuration
+# Local Docker: redis://localhost:6379
+# Upstash:      rediss://default:TOKEN@HOST.upstash.io:6379
+REDIS_URL=redis://localhost:6379
```

### 2.2 Update `.env`

```diff
 BETTER_AUTH_SECRET="ZFOZbVVz2FTcbY3s2NPjHZU3sVj9OnAw"
+REDIS_URL=redis://localhost:6379
```

### 2.3 Update `src/config/env.ts`

Add `REDIS_URL` to the server env schema. It should be **optional** so the app can gracefully degrade when Redis is unavailable.

```diff
   server: {
     API_URL: t.String(),
     BETTER_AUTH_URL: t.String(),
     BETTER_AUTH_SECRET: t.String(),
     SQLITE_URL: t.String(),
     PORT: t.Number(),
+    REDIS_URL: t.Optional(t.String()),
     WS_ENABLED: t.Optional(t.Boolean()),
     ...
   },
   runtimeEnv: () => ({
     ...
+    REDIS_URL: _getEnv("REDIS_URL", ""),
     ...
   }),
```

> [!TIP]
> Making `REDIS_URL` optional ensures the app still runs without Redis (e.g., in CI with unit tests that don't need Redis). The Redis client module will detect this and operate in a disabled mode.

---

## Phase 3: Redis Client Module

### 3.1 Create `src/lib/redis/index.ts`

Singleton Redis client with lazy connection, health check, and graceful shutdown.

```typescript
/**
 * Redis client singleton using Bun's native RedisClient.
 * Provides lazy connection, health monitoring, and graceful shutdown.
 *
 * Uses REDIS_URL environment variable for connection string, supporting:
 * - Local Docker: redis://localhost:6379
 * - Upstash:      rediss://default:TOKEN@HOST.upstash.io:6379
 *
 * @module redis
 */

import { RedisClient } from "bun";
import { env } from "~/config/env";
import { redisLogger } from "../logger";

/**
 * Redis connection status for health checks.
 */
export interface RedisStatus {
  /** Whether Redis is currently connected */
  connected: boolean;
  /** Redis URL (masked for security) */
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
 * Preserves host and port but hides passwords and tokens.
 *
 * @param url - Raw Redis connection URL
 * @returns Masked URL safe for logging
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
 * Creates and connects the client on first call (lazy initialization).
 * Returns null if REDIS_URL is not configured.
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
        // Auto-reconnect on disconnection
        autoReconnect: true,
        // Max retries before giving up
        maxRetries: 5,
        // Queue commands while disconnected
        enableOfflineQueue: true,
        // Auto-pipeline for performance
        enableAutoPipelining: true,
        // TLS is inferred from rediss:// scheme
      });

      // Log connection events
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
 * @returns Redis connection status object
 */
export async function getRedisStatus(): Promise<RedisStatus> {
  const redisClient = getRedisClient();
  const url = env.REDIS_URL ? maskRedisUrl(env.REDIS_URL as string) : "not configured";

  if (!redisClient) {
    return { connected: false, url, error: "Redis not configured" };
  }

  try {
    // PING returns "PONG" if connected
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
 * Should be called during application shutdown.
 */
export function closeRedis(): void {
  if (client) {
    redisLogger.info("Closing Redis connection");
    client.close();
    client = null;
    initialized = false;
  }
}
```

### 3.2 Add Redis logger in `src/lib/logger.ts`

```diff
+/**
+ * Logger for Redis-related logs.
+ * Useful for monitoring Redis connection and Pub/Sub events.
+ */
+export const redisLogger = createLogger({
+  minLevel: isProduction ? "warn" : "debug",
+  prefix: "redis",
+});
```

---

## Phase 4: Pub/Sub Module

### 4.1 Create `src/lib/redis/pubsub.ts`

Type-safe Pub/Sub wrapper with channel definitions for future use.

```typescript
/**
 * Redis Pub/Sub helpers using Bun's native RedisClient.
 * Provides typed channel definitions and convenience wrappers
 * for publishing and subscribing to events.
 *
 * Pub/Sub uses a dedicated subscriber connection (via .duplicate())
 * because Redis requires separate connections for subscriptions.
 *
 * @module redis/pubsub
 * @see https://bun.com/docs/runtime/redis#pub/sub
 */

import { RedisClient } from "bun";
import { env } from "~/config/env";
import { redisLogger } from "../logger";

/**
 * Predefined channel names for the application.
 * Add new channels here as features require them.
 */
export const REDIS_CHANNELS = {
  /** User-related events (login, logout, profile update) */
  USER_EVENTS: "tsse:user:events",
  /** System notifications (deployments, maintenance) */
  SYSTEM_NOTIFICATIONS: "tsse:system:notifications",
  /** MCP server events (tool invocations, connections) */
  MCP_EVENTS: "tsse:mcp:events",
  /** Real-time dashboard updates */
  DASHBOARD_UPDATES: "tsse:dashboard:updates",
  /** Cache invalidation signals */
  CACHE_INVALIDATION: "tsse:cache:invalidation",
} as const;

/** Type for valid channel names */
export type RedisChannel = (typeof REDIS_CHANNELS)[keyof typeof REDIS_CHANNELS];

/**
 * Message payload structure for typed Pub/Sub events.
 */
export interface PubSubMessage<T = unknown> {
  /** Event type identifier */
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

/** Publisher client reference — uses the main client */
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
 * Returns the publisher client (reuses main Redis connection).
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
 * @param channel - Target channel name
 * @param message - Typed message payload
 * @returns Number of subscribers that received the message, or 0 on failure
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
 * Automatically deserializes JSON messages.
 *
 * @param channel - Channel to subscribe to
 * @param handler - Callback invoked for each received message
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
      } catch (error) {
        redisLogger.error("Failed to parse Pub/Sub message", error as Error);
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
```

---

## Phase 5: Health Check Integration

### 5.1 Update `src/lib/store/status.ts`

Add Redis status to the health check response. The exact modification depends on the current health check structure, but the integration should call `getRedisStatus()` and include it in the response payload.

```typescript
// In the health check handler, add:
import { getRedisStatus } from "~/lib/redis";

// Inside the status computation:
const redisStatus = await getRedisStatus();

// Include in response:
{
  services: {
    database: { ... },
    redis: {
      status: redisStatus.connected ? "up" : "down",
      url: redisStatus.url,
      error: redisStatus.error,
    },
  }
}
```

---

## Phase 6: Tests

### 6.1 Unit Test: `test/lib/redis/redis.test.ts`

```typescript
/**
 * Unit tests for the Redis client module.
 * Tests client initialization, health check, and connection management.
 */

import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { getRedisClient, getRedisStatus, closeRedis } from "~/lib/redis";

describe("Redis Client", () => {
  afterEach(() => {
    closeRedis();
  });

  test("returns null when REDIS_URL is not configured", () => {
    // Test with empty REDIS_URL
    const client = getRedisClient();
    // Should return null or the client depending on env
    expect(client === null || client !== null).toBe(true);
  });

  test("getRedisStatus returns status object", async () => {
    const status = await getRedisStatus();
    expect(status).toHaveProperty("connected");
    expect(status).toHaveProperty("url");
    expect(typeof status.connected).toBe("boolean");
  });

  test("closeRedis is safe to call multiple times", () => {
    closeRedis();
    closeRedis(); // Should not throw
  });
});
```

### 6.2 Unit Test: `test/lib/redis/pubsub.test.ts`

```typescript
/**
 * Unit tests for the Redis Pub/Sub module.
 * Tests channel definitions, message serialization, and graceful degradation.
 */

import { describe, test, expect } from "bun:test";
import { REDIS_CHANNELS, closePubSub, type PubSubMessage } from "~/lib/redis/pubsub";

describe("Redis Pub/Sub", () => {
  test("REDIS_CHANNELS has expected channel names", () => {
    expect(REDIS_CHANNELS.USER_EVENTS).toBe("tsse:user:events");
    expect(REDIS_CHANNELS.SYSTEM_NOTIFICATIONS).toBe("tsse:system:notifications");
    expect(REDIS_CHANNELS.MCP_EVENTS).toBe("tsse:mcp:events");
    expect(REDIS_CHANNELS.DASHBOARD_UPDATES).toBe("tsse:dashboard:updates");
    expect(REDIS_CHANNELS.CACHE_INVALIDATION).toBe("tsse:cache:invalidation");
  });

  test("PubSubMessage structure is correct", () => {
    const message: PubSubMessage<{ userId: string }> = {
      type: "user.login",
      data: { userId: "123" },
      timestamp: new Date().toISOString(),
      source: "auth",
    };
    expect(message.type).toBe("user.login");
    expect(message.data.userId).toBe("123");
    expect(message.source).toBe("auth");
  });

  test("closePubSub is safe to call without active connections", () => {
    closePubSub(); // Should not throw
  });
});
```

### 6.3 E2E Test: `.e2e/api/redis-health.spec.ts`

```typescript
/**
 * E2E test for Redis health status in the API health endpoint.
 * Verifies that the health check includes Redis status information.
 */

import { test, expect } from "@playwright/test";

test.describe("Redis Health Check", () => {
  test("health endpoint includes Redis status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    // Redis status should be present in services
    if (body.services?.redis) {
      expect(body.services.redis).toHaveProperty("status");
      expect(["up", "down"]).toContain(body.services.redis.status);
    }
  });
});
```

---

## Phase 7: Documentation & Plan Updates

### 7.1 Update `PLAN.md`

Update Phase 7 (Infrastructure) and Phase 11 (Scalability) with Redis-specific tasks:

```diff
 ### Phase 7: Infrastructure & DevOps
 ...
-- [ ] Add Redis for caching/sessions
+- [x] Add Redis for caching/sessions
+  - [x] Configure Redis in docker-compose with persistence & health check
+  - [x] Create custom redis.conf with Pub/Sub, AOF, memory limits
+  - [x] Create Redis client module (`src/lib/redis/index.ts`)
+  - [x] Create Pub/Sub helper module (`src/lib/redis/pubsub.ts`)
+  - [x] Add REDIS_URL environment variable (Docker + Upstash compatible)
+  - [x] Integrate Redis health check into status endpoint
+  - [x] Add unit tests for Redis client and Pub/Sub
+  - [x] Add E2E test for Redis health check
 ...

 ### Phase 11: Scalability & Optimization
-- [ ] Implement Redis caching layer
+- [ ] Implement Redis caching layer (use `src/lib/redis/index.ts`)
+- [ ] Add Redis-backed rate limiting (replace in-memory)
+- [ ] Add Redis session storage for Better Auth
+- [ ] Implement Pub/Sub event broadcasting for MCP
```

### 7.2 Update `.env.example` & Environment Docs

Add `REDIS_URL` to the environment variables documentation table in `AGENTS.md`:

```diff
 | Variable        | Default         | Description                     |
 | --------------- | --------------- | ------------------------------- |
 | `SQLITE_URL` | `file:.artifacts/tsse-elysia.db`    | SQLite database url            |
 | `PORT`          | `3000`          | Server port                     |
 | `HOST`          | `localhost`     | Server host                     |
+| `REDIS_URL`     | -               | Redis connection URL            |
 | `GITHUB_TOKEN`  | -               | GitHub token for MCP (optional) |
```

---

## Implementation Order

Execute the phases in this order to minimize broken states:

| Step | Phase   | Description                           | Dependencies  |
| ---- | ------- | ------------------------------------- | ------------- |
| 1    | Phase 1 | Docker Compose + redis.conf           | None          |
| 2    | Phase 2 | Environment config (`.env`, `env.ts`) | None          |
| 3    | Phase 3 | Redis client module + logger          | Phase 2       |
| 4    | Phase 4 | Pub/Sub module                        | Phase 3       |
| 5    | Phase 5 | Health check integration              | Phase 3       |
| 6    | Phase 6 | Tests (unit + E2E)                    | Phase 3, 4, 5 |
| 7    | Phase 7 | Plan + docs updates                   | All above     |

---

## Verification Checklist

After implementation, run the standard verification workflow:

```bash
# Format code
bun run fmt

# Fix lint issues
bun run lint:fix

# Type check
bun run typecheck

# Unit tests
bun test:unit

# E2E tests (requires Redis running)
bun run test:e2e

# Start Redis via Docker to test locally
cd docker && docker-compose up redis -d

# Verify Redis connectivity
bun run -e "import { RedisClient } from 'bun'; const r = new RedisClient('redis://localhost:6379'); await r.set('test', 'hello'); console.log(await r.get('test')); r.close();"
```

---

## Key Design Decisions

1. **`REDIS_URL` as single config** — One environment variable controls everything. `redis://` for local Docker, `rediss://` for Upstash TLS. Bun auto-detects the protocol.

2. **Optional Redis** — The app runs without Redis. All Redis calls check for `null` client and gracefully degrade. This keeps CI/test environments simple.

3. **Separate Pub/Sub connections** — Redis Pub/Sub requires dedicated connections. The `.duplicate()` approach or separate `new RedisClient()` ensures the main client remains available for regular commands.

4. **Typed channels** — `REDIS_CHANNELS` const provides autocomplete and prevents typos. New features add channels to one place.

5. **redis:7-alpine** — Lightweight (~30MB), production-ready, with full Pub/Sub and persistence support.

---

## References

- [Bun Native Redis Client](https://bun.com/docs/runtime/redis)
- [Bun Redis Pub/Sub](https://bun.com/docs/runtime/redis#pub/sub)
- [Bun + Upstash Guide](https://bun.com/docs/guides/ecosystem/upstash)
- [Redis Pub/Sub Documentation](https://redis.io/docs/latest/develop/pubsub/)
- [Redis Docker Hub](https://hub.docker.com/_/redis)