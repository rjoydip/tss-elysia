/**
 * Database connection and initialization using Drizzle ORM.
 * Supports both SQLite (Bun) and PostgreSQL based on environment.
 *
 * PostgreSQL setup includes:
 * - One primary (write) pool
 * - Multiple read replica pools for read queries (configurable via POSTGRES_REPLICAS env var)
 *
 * Only initializes on server-side (typeof window === "undefined")
 * to prevent client-side bundle from including database code.
 */

import { drizzle as drizzleSQLite } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { env } from "~/config/env";
import { isCI, isDev, isStage, isQA, isProduction, isTest } from "~/config";

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
 * SQLite database instance - Bun's native SQLite driver
 */
let sqlite: Database | undefined;

/**
 * PostgreSQL primary (write) pool instance - node-postgres driver
 */
let pgPoolPrimary: Pool | undefined;

/**
 * PostgreSQL read replica pools - dynamic array based on env config
 */
let pgPoolsReplicas: Pool[] = [];

/**
 * Round-robin index for replica selection
 */
let replicaRoundRobinIndex = 0;

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
 * Creates a SQLite database connection using Bun's native driver.
 *
 * @returns SQLite database instance and Drizzle ORM
 */
function createSQLiteConnection() {
  const dbName = getDatabaseName();
  const dbPath = `${env.DATABASE_PATH}/${dbName}`;

  sqlite = new Database(dbPath);
  db = drizzleSQLite(sqlite, {
    schema,
  });

  return { sqlite, db };
}

/**
 * Creates a PostgreSQL connection pool with primary and read replicas.
 *
 * @returns PostgreSQL pools and Drizzle ORM instances
 */
function createPostgresConnection() {
  const connectionString = env.POSTGRES_URL || buildPostgresConnectionString();

  // Primary (write) pool
  pgPoolPrimary = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Dynamic read replicas from POSTGRES_REPLICAS env var (JSON array)
  const replicaUrls: string[] = env.POSTGRES_REPLICAS || [];
  pgPoolsReplicas = replicaUrls.map((url: string) => {
    return new Pool({
      connectionString: url,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  });

  // Primary (write) Drizzle instance
  db = drizzlePg(pgPoolPrimary, {
    schema,
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
function getDatabaseName(): string {
  // Test environment always uses test database
  if (isTest || isCI) {
    return "tsse-elysia.db";
  }

  // Use custom name if set, otherwise use environment-specific name
  if (env.DATABASE_NAME && !env.DATABASE_NAME.includes("tsse-elysia")) {
    return env.DATABASE_NAME;
  }

  return `tsse-elysia.db`;
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

  return drizzlePg(selectedPool, {
    schema,
  });
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
    sqlite,
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
  if (pgPoolPrimary) {
    configs.push({
      name: "primary",
      role: "primary",
      url: env.POSTGRES_URL || buildPostgresConnectionString(),
    });
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
export function initializeDatabase() {
  const dbType = getDatabaseType();

  // Initialize only in server-side context
  if (typeof window !== "undefined") {
    console.warn("Database initialization skipped: client-side context");
    return db;
  }

  switch (dbType) {
    case "postgres":
      console.log("[DB] Using PostgreSQL");
      createPostgresConnection();
      break;
    case "sqlite":
    default:
      console.log("[DB] Using SQLite");
      createSQLiteConnection();
      break;
  }

  return db;
}

// Initialize database on module load (server-side only)
if (typeof window === "undefined") {
  initializeDatabase();
}

// Export for use in other modules (auth, migrations, etc.)
export { sqlite, pgPoolPrimary, pgPoolsReplicas, db, schema };
export type DbType = NonNullable<typeof db>;