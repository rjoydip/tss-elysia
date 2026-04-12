/**
 * Database connection and initialization using Drizzle ORM.
 * Uses db0 for universal database access with multiple driver support.
 *
 * db0 provides unified API across:
 * - SQLite via sqlite3
 * - PostgreSQL via postgres
 *
 * Only initializes on server-side (typeof window === "undefined")
 * to prevent client-side bundle from including database code.
 */

import { createDatabase } from "db0";
import type { Connector } from "db0";
import { drizzle as drizzleDB0 } from "db0/integrations/drizzle";
import * as core from "./core/schema";
import * as versioning from "./versioning/schema";
import * as backup from "./backup/schema";
import * as optimize from "./optimize/schema";
import * as monitor from "./monitor/schema";
import { env } from "~/config/env";
import { isCI, isDev, isStage, isQA, isProduction, isTest } from "~/config";
import { DEFAULT_DATABASE_NAME, getDatabaseFullPath } from "~/config/db";
import { ConnectorOptions as SQLiteConnectionOptions } from "db0/connectors/sqlite3";
import { ConnectorOptions as PostgresqlConnectionOptions } from "db0/connectors/postgresql";

/**
 * Combined schema for Drizzle ORM.
 * Includes core schema + extended schemas for management features.
 */
const schema = {
  ...core,
  ...versioning,
  ...backup,
  ...optimize,
  ...monitor,
};

/**
 * Database type based on environment configuration.
 */
export type DatabaseType = "sqlite" | "postgres";

/**
 * Database pool configuration for health checks.
 */
export interface DatabasePoolConfig {
  name: string;
  role: "primary" | "replica";
  url: string;
}

/**
 * db0 database instance for unified database access.
 * Exported as 'sqlite' for backward compatibility with code expecting better-sqlite3 API.
 */
let db0: ReturnType<typeof createDatabase> | undefined;

/**
 * PostgreSQL primary (write) pool instance - postgres via db0
 */
let pgPoolPrimary: any = undefined;

/**
 * PostgreSQL read replica pools - dynamic array based on env config
 */
let pgPoolsReplicas: any[] = [];

/**
 * Round-robin index for replica selection
 */
let replicaRoundRobinIndex = 0;

/**
 * Compatibility wrapper providing better-sqlite3-like API for db0.
 * Uses synchronous-like interface by accessing underlying sync statements.
 */
const sqliteCompat: {
  query: (sql: string) => {
    all: (...args: unknown[]) => unknown[];
    get: (...args: unknown[]) => unknown;
    run: (...args: unknown[]) => unknown;
  };
  exec: (sql: string) => void;
} = {
  query: (sql: string) => {
    const stmt = (db0 as any)?.prepare(sql);
    return {
      all: (...args: unknown[]) => {
        const res = stmt?.all(...(args as any[]));
        return Array.isArray(res) ? res : [];
      },
      get: (...args: unknown[]) => {
        return stmt?.get(...(args as any[]));
      },
      run: (...args: unknown[]) => {
        return stmt?.run(...(args as any[]));
      },
    };
  },
  exec: (sql: string) => {
    (db0 as any)?.exec(sql);
  },
};

/**
 * Drizzle ORM instance with typed schema (primary/write)
 * eslint-disable-next-line @typescript-eslint/no-explicit-any
 */
let db: any;

/**
 * Gets the database type based on environment configuration.
 * CI always uses SQLite, otherwise uses DATABASE_TYPE env var.
 *
 * @returns The configured database type
 */
export function getDatabaseType(): DatabaseType {
  // CI always uses SQLite regardless of DATABASE_TYPE setting
  if (isCI) {
    return "sqlite";
  }

  // Check DATABASE_TYPE env var, default to sqlite
  const dbType = env.DATABASE_TYPE || "sqlite";

  // Local development: respect DATABASE_TYPE flag
  if (isDev) {
    if (dbType === "postgres" && env.POSTGRES_URL) {
      return "postgres";
    }
    return "sqlite";
  }

  // Stage/QA/Prod: use PostgreSQL if URL is available
  if ((isStage || isQA || isProduction) && env.POSTGRES_URL) {
    return "postgres";
  }

  // Default fallback to SQLite
  return "sqlite";
}

/**
 * Creates a SQLite database connection using db0 with sqlite3 driver.
 *
 * @returns SQLite database instance and Drizzle ORM
 */
export async function createSQLiteConnection() {
  const dbName = getSQLiteDatabaseName();
  const { default: sqlite } = (await import("db0/connectors/sqlite3")) as {
    default: (config: SQLiteConnectionOptions) => Connector;
  };

  if (dbName === ":memory:") {
    const connector = sqlite({ name: dbName });
    db0 = createDatabase(connector);
  } else {
    const connector = sqlite({ name: dbName, path: env.DATABASE_PATH });
    db0 = createDatabase(connector);
  }

  db = drizzleDB0(db0);
  return { sqlite: sqliteCompat, db };
}

/**
 * Creates a PostgreSQL connection pool with primary and read replicas.
 * Uses db0 for unified access while maintaining read replica routing.
 *
 * @returns PostgreSQL pools and Drizzle ORM instances
 */
async function createPostgresConnection() {
  const connectionString = env.POSTGRES_URL || buildPostgresConnectionString();

  // Primary (write) pool using db0
  const { default: postgresql } = (await import("db0/connectors/postgresql")) as {
    default: (config: PostgresqlConnectionOptions) => Connector;
  };
  const primaryConnector = postgresql({ url: connectionString });
  const primaryDb = createDatabase(primaryConnector);
  db0 = primaryDb;
  db = drizzleDB0(primaryDb);
  pgPoolPrimary = primaryDb;

  // Dynamic read replicas from POSTGRES_REPLICAS env var (JSON array)
  const replicaUrls: string[] = env.POSTGRES_REPLICAS || [];
  pgPoolsReplicas = replicaUrls.map((url: string) => {
    const replicaConnector = postgresql({ url });
    return createDatabase(replicaConnector);
  });

  return { pgPoolPrimary, pgPoolsReplicas, db };
}

/**
 * Builds PostgreSQL connection string from individual env vars.
 *
 * @returns PostgreSQL connection string
 */
function buildPostgresConnectionString(): string {
  const host = env.POSTGRES_HOST || "localhost";
  const port = env.POSTGRES_PORT || 5432;
  const user = env.POSTGRES_USER || "tsse";
  const password = env.POSTGRES_PASSWORD || "";
  const database = env.POSTGRES_DB || "tsse_dev";

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

/**
 * Gets the appropriate database filename based on environment.
 *
 * @returns Database filename
 */
function getSQLiteDatabaseName(): string {
  // For test environment, check process.env directly (set in test/setup.ts)
  if (isTest || isCI) {
    const dbName = process.env.DATABASE_NAME;
    // Handle in-memory database (explicit :memory: or empty string)
    if (dbName === ":memory:" || dbName === "") {
      return ":memory:";
    }
    // Use the value from process.env
    return dbName || ":memory:";
  }

  const dbName = env.DATABASE_NAME;

  // Use custom name if set, otherwise use environment-specific name
  if (dbName && !dbName.includes(DEFAULT_DATABASE_NAME)) {
    return dbName;
  }

  return getDatabaseFullPath(env.DATABASE_PATH, dbName);
}

/**
 * Returns the write (primary) database instance.
 * For read-heavy workloads, use getReadDb() for read queries.
 *
 * @returns The primary Drizzle ORM instance for write operations
 */
export function getWriteDb() {
  return db;
}

/**
 * Returns a read database instance, routing to available replicas.
 * Uses round-robin selection between available replicas.
 * Falls back to primary if no replicas are configured.
 *
 * @returns A read Drizzle ORM instance (from replica or primary)
 */
export function getReadDb() {
  // No replicas configured, use primary
  if (pgPoolsReplicas.length === 0) {
    return db;
  }

  // Round-robin selection between available replicas
  const index = replicaRoundRobinIndex % pgPoolsReplicas.length;
  replicaRoundRobinIndex++;
  const selectedPool = pgPoolsReplicas[index];

  return drizzleDB0(selectedPool);
}

/**
 * Returns all database pools for health checks.
 *
 * @returns Object containing all database pools
 */
export function getDatabasePools() {
  return {
    primary: pgPoolPrimary,
    replicas: pgPoolsReplicas,
    sqlite: sqliteCompat,
  };
}

/**
 * Returns database pool configurations for health check reporting.
 * Includes primary and all replicas with their roles and URLs.
 *
 * @returns Array of database pool configurations
 */
export function getDatabasePoolConfigs(): DatabasePoolConfig[] {
  const configs: DatabasePoolConfig[] = [];

  // Primary pool (always for writes)
  if (pgPoolPrimary || db0) {
    const dbType = getDatabaseType();
    if (dbType === "postgres") {
      configs.push({
        name: "primary",
        role: "primary",
        url: env.POSTGRES_URL || buildPostgresConnectionString(),
      });
    }
  }

  // Replica pools
  const replicaUrls: string[] = env.POSTGRES_REPLICAS || [];

  // If no replicas configured, primary also serves reads
  if (replicaUrls.length === 0 && pgPoolPrimary) {
    configs.push({
      name: "primary-read",
      role: "replica",
      url: env.POSTGRES_URL || buildPostgresConnectionString(),
    });
  } else {
    replicaUrls.forEach((url: string, index: number) => {
      configs.push({
        name: `replica-${index + 1}`,
        role: "replica",
        url,
      });
    });
  }

  return configs;
}

/**
 * Initializes the database based on environment configuration.
 * This function handles the decision between SQLite and PostgreSQL.
 *
 * @returns The initialized Drizzle ORM instance
 */
export async function initializeDatabase() {
  const dbType = getDatabaseType();

  // Initialize only in server-side context
  if (typeof window !== "undefined") {
    console.warn("Database initialization skipped: client-side context");
    return db;
  }

  switch (dbType) {
    case "postgres":
      console.log("[DB] Using PostgreSQL");
      await createPostgresConnection();
      break;
    case "sqlite":
    default:
      console.log("[DB] Using SQLite (db0 + sqlite3)");
      await createSQLiteConnection();
      break;
  }

  return db;
}

// Initialize database on module load (server-side only)
let dbInitialized = false;

export async function waitForDb(): Promise<void> {
  if (dbInitialized) return;
  await initializeDatabase();
  dbInitialized = true;
}

// Auto-init in server-side environments
if (typeof window === "undefined") {
  waitForDb().catch(console.error);
}

// Export for use in other modules (auth, migrations, etc.)
// sqliteCompat provides backward compatibility with better-sqlite3 API
export { sqliteCompat as sqlite, db0, db, schema };
export type DbType = NonNullable<typeof db>;