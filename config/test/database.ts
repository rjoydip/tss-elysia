/**
 * Database configuration for tests.
 * Provides setup, teardown, and reset functions for SQLite database.
 */

import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";
import { resolve } from "path";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { sqlite, getWriteDb, createSQLiteConnection } from "../../src/lib/db";
import { env } from "../../src/config/env";
import { DB_MIGRATION_OUT } from "../db/constant";

export interface DatabaseTestConfig {
  /** Database path (default: .artifacts) */
  dbPath?: string;
  /** Database name (default: tss-elysia.db) */
  dbName?: string;
  /** Whether to reset database before each test */
  resetBeforeEach?: boolean;
}

/**
 * Tables to clear during test cleanup (in order for foreign keys).
 */
export const TEST_TABLES = [
  "user",
  "verification",
  "session",
  "account",
  "subscription",
  "mcp_api_key",
  "schema_version",
  "migration_history",
  "rollback_point",
  "backup",
  "backup_schedule",
  "restore_history",
  "db_metric",
  "alert_rule",
  "active_alert",
  "alert_history",
  "health_check_history",
  "connection_pool_stats",
  "query_metric",
  "slow_query_log",
  "index_recommendation",
  "query_cache",
];

/**
 * Default database test configuration.
 */
export const defaultDbConfig: Required<DatabaseTestConfig> = {
  dbPath: ".artifacts",
  dbName: "tss-elysia.db",
  resetBeforeEach: true,
};

/**
 * Get database file path.
 */
export function getDatabasePath(config?: DatabaseTestConfig): string {
  const cfg = { ...defaultDbConfig, ...config };
  return resolve(cfg.dbPath, cfg.dbName);
}

/**
 * Ensure database exists.
 */
function ensureDatabaseExists(config?: DatabaseTestConfig): void {
  const cfg = { ...defaultDbConfig, ...config };
  const fullPath = resolve(cfg.dbPath, cfg.dbName);
  if (existsSync(fullPath)) {
    console.log(`[DB Config] Creating directory: ${fullPath}`);
  } else {
    console.log("[DB Config] Database created successfully");
  }
}

/**
 * Remove database file if exists.
 */
export function removeDatabaseFile(config?: DatabaseTestConfig): void {
  const cfg = { ...defaultDbConfig, ...config };
  const fullPath = resolve(cfg.dbPath, cfg.dbName);
  if (existsSync(fullPath)) {
    console.log(`[DB Config] Remove database file: ${fullPath}`);
    rmSync(fullPath, { force: true });
  } else {
    console.log(`[DB Config] Database already removed`);
  }
}

/**
 * Generate database schema using drizzle-kit.
 */
export function generateSchema(): void {
  console.log("[DB Config] Pushing schema...");
  try {
    execSync("bun run db:generate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_TYPE: "sqlite", DATABASE_NAME: "tss-elysia.db" },
    });
    console.log("[DB Config] Schema generated successfully");
  } catch (error) {
    console.error("[DB Config] Schema generation failed:", error);
    throw error;
  }
}

/**
 * Push database schema using drizzle-kit.
 */
export function pushSchema(): void {
  console.log("[DB Config] Pushing schema...");
  try {
    const { db } = createSQLiteConnection();

    process.env["DATABASE_TYPE"] = "sqlite";
    process.env["DATABASE_NAME"] = "tss-elysia.db";

    migrate(db, { migrationsFolder: DB_MIGRATION_OUT });
    console.log("[DB Config] Schema pushed successfully");
  } catch (error) {
    console.warn("[DB Config] Schema push failed:", error);
  }
}

/**
 * Clear specific table.
 */
export function clearTable(tableName: string): void {
  const db = getWriteDb();
  if (!db) return;

  try {
    db.execute(`DELETE FROM ${tableName}`);
    db.execute(`DELETE FROM sqlite_sequence WHERE name='${tableName}'`);
  } catch {
    // Table might not exist
  }
}

/**
 * Reset database by clearing all test data.
 * Does NOT push schema - call pushSchema() separately if needed.
 */
export function resetDb(): void {
  const db = getWriteDb();
  if (!db || !sqlite) {
    console.warn("[DB Config] No database connection");
    return;
  }

  console.log("[DB Config] Resetting database...");

  for (const table of TEST_TABLES) {
    try {
      clearTable(table);
    } catch {
      // Table might not exist
    }
  }

  console.log("[DB Config] Database reset complete");
}

/**
 * Clear backup files directory.
 */
export function clearBackups(): void {
  const backupDir = resolve(env.DATABASE_PATH || ".artifacts", "backups");
  try {
    rmSync(backupDir, { recursive: true, force: true });
    console.log("[DB Config] Cleared backup directory");
  } catch {
    // Directory might not exist
  }
}

/**
 * Database test setup function.
 */
export async function setupDatabase(config?: DatabaseTestConfig): Promise<void> {
  const cfg = { ...defaultDbConfig, ...config };
  ensureDatabaseExists(cfg);
  pushSchema();
  resetDb();
}

/**
 * Database test teardown database function.
 */
export function teardownDatabase(): void {
  resetDb();
  clearBackups();
}

export default {
  setupDatabase,
  teardownDatabase,
  resetDb,
  clearTable,
  clearBackups,
  pushSchema,
  generateSchema,
  getDatabasePath,
  removeDatabaseFile,
  ensureDatabaseExists,
  TEST_TABLES,
};