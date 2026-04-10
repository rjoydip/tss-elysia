/**
 * Database schema versioning system.
 * Tracks schema versions, migration history, and provides rollback capabilities.
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Schema version tracking table.
 * Records each schema version with its metadata and status.
 */
export const schemaVersions = sqliteTable("schema_version", {
  version: text("version").primaryKey(),
  description: text("description").notNull(),
  appliedAt: integer("appliedAt", { mode: "timestamp" }).notNull(),
  appliedBy: text("appliedBy"),
  checksum: text("checksum"),
  status: text("status").notNull().default("applied"),
  rollbackFrom: text("rollbackFrom"),
});

/**
 * Migration history table.
 * Records all migration operations for audit and recovery.
 */
export const migrationHistory = sqliteTable("migration_history", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
  direction: text("direction").notNull(),
  startedAt: integer("startedAt", { mode: "timestamp" }).notNull(),
  completedAt: integer("completedAt", { mode: "timestamp" }),
  status: text("status").notNull().default("pending"),
  error: text("error"),
  sql: text("sql"),
  executedStatements: integer("executedStatements").notNull().default(0),
});

/**
 * Schema rollback points table.
 * Stores checkpoints for potential rollback operations.
 */
export const rollbackPoints = sqliteTable("rollback_point", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  snapshotData: text("snapshotData").notNull(),
  description: text("description"),
  checksum: text("checksum").notNull(),
});

export type SchemaVersion = typeof schemaVersions.$inferSelect;
export type MigrationHistory = typeof migrationHistory.$inferSelect;
export type RollbackPoint = typeof rollbackPoints.$inferSelect;