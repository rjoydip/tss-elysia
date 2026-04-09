/**
 * Database connection and initialization using Drizzle ORM.
 * Supports both SQLite (Bun) and PostgreSQL based on environment.
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
 * SQLite database instance - Bun's native SQLite driver
 */
let sqlite: Database | undefined;

/**
 * PostgreSQL pool instance - node-postgres driver
 */
let pgPool: Pool | undefined;

/**
 * Drizzle ORM instance with typed schema
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
 * Creates a PostgreSQL connection pool.
 *
 * @returns PostgreSQL pool and Drizzle ORM
 */
function createPostgresConnection() {
  const connectionString = env.POSTGRES_URL || buildPostgresConnectionString();

  pgPool = new Pool({
    connectionString,
    // Connection pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  db = drizzlePg(pgPool, {
    schema,
  });

  return { pgPool, db };
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
    return "tss-elysia.db";
  }

  // Extract environment from NODE_ENV
  const nodeEnv = isDev
    ? "development"
    : isStage
      ? "stage"
      : isQA
        ? "qa"
        : isProduction
          ? "production"
          : "development";

  // Use custom name if set, otherwise use environment-specific name
  if (env.DATABASE_NAME && !env.DATABASE_NAME.includes("tss-elysia")) {
    return env.DATABASE_NAME;
  }

  return `tsse-${nodeEnv}.db`;
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
export { sqlite, pgPool, db, schema };
export type DbType = NonNullable<typeof db>;