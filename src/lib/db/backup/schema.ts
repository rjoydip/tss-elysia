/**
 * Database backup/restore schema definitions.
 * Stores backup metadata and tracking information.
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Backup metadata table.
 * Tracks all backup operations with their status and metadata.
 */
export const backups = sqliteTable("backup", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  checksum: text("checksum").notNull(),
  databaseType: text("databaseType").notNull(),
  schemaVersion: text("schemaVersion"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  completedAt: integer("completedAt", { mode: "timestamp" }),
  status: text("status").notNull().default("pending"),
  type: text("type").notNull().default("full"),
  retentionDays: integer("retentionDays"),
  compressed: integer("compressed", { mode: "boolean" }).notNull().default(false),
  error: text("error"),
  metadata: text("metadata"),
});

/**
 * Backup schedule table.
 * Defines automated backup schedules.
 */
export const backupSchedules = sqliteTable("backup_schedule", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  interval: text("interval").notNull(),
  retentionCount: integer("retentionCount").notNull().default(7),
  retentionDays: integer("retentionDays"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  lastRunAt: integer("lastRunAt", { mode: "timestamp" }),
  nextRunAt: integer("nextRunAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

/**
 * Restore history table.
 * Tracks all restore operations.
 */
export const restoreHistory = sqliteTable("restore_history", {
  id: text("id").primaryKey(),
  backupId: text("backupId").notNull(),
  backupFilename: text("backupFilename").notNull(),
  startedAt: integer("startedAt", { mode: "timestamp" }).notNull(),
  completedAt: integer("completedAt", { mode: "timestamp" }),
  status: text("status").notNull().default("pending"),
  tablesRestored: integer("tablesRestored").notNull().default(0),
  rowsRestored: integer("rowsRestored").notNull().default(0),
  error: text("error"),
  createdBy: text("createdBy"),
});

export type Backup = typeof backups.$inferSelect;
export type BackupSchedule = typeof backupSchedules.$inferSelect;
export type RestoreHistory = typeof restoreHistory.$inferSelect;