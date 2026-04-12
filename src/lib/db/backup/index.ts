/**
 * Database backup and restore automation.
 * Provides automated backup scheduling, point-in-time recovery, and backup rotation.
 */

import { sqlite } from "../index";
import {
  backups,
  backupSchedules,
  restoreHistory,
  type Backup,
  type BackupSchedule,
  type RestoreHistory,
} from "./schema";
import { getWriteDb } from "../index";
import { eq, desc, and, lt } from "drizzle-orm";
import { createHash } from "crypto";
import { mkdir, readFile, rm, stat } from "fs/promises";
import { join } from "path";
import { env } from "~/config/env";
import { DEFAULT_DATABASE_PATH } from "~/config/db";

/**
 * Backup result type.
 */
export interface BackupResult {
  success: boolean;
  id?: string;
  filename?: string;
  path?: string;
  size?: number;
  checksum?: string;
  error?: string;
  durationMs?: number;
}

/**
 * Restore result type.
 */
export interface RestoreResult {
  success: boolean;
  backupId?: string;
  tablesRestored?: number;
  rowsRestored?: number;
  error?: string;
  durationMs?: number;
}

/**
 * Backup options.
 */
export interface BackupOptions {
  type?: "full" | "incremental" | "differential";
  compressed?: boolean;
  retentionDays?: number;
  destination?: string;
  createdBy?: string;
}

/**
 * Default backup directory relative to DATABASE_PATH.
 */
const DEFAULT_BACKUP_DIR = "backups";

/**
 * Gets the backup directory path.
 */
export function getBackupDirectory(): string {
  const basePath = env.DATABASE_PATH || DEFAULT_DATABASE_PATH;
  const normalizedPath = basePath === "" ? "." : basePath;
  return join(normalizedPath, DEFAULT_BACKUP_DIR);
}

/**
 * Ensures backup directory exists.
 */
async function ensureBackupDir(): Promise<void> {
  const dir = getBackupDirectory();
  await mkdir(dir, { recursive: true });
}

/**
 * Creates a database backup.
 */
export async function createBackup(options: BackupOptions = {}): Promise<BackupResult> {
  const startTime = Date.now();
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const compressed = options.compressed ?? false;
  const extension = compressed ? ".sql.gz" : ".sql";
  const filename = `backup-${timestamp}${extension}`;
  const destination = options.destination || getBackupDirectory();

  try {
    await ensureBackupDir();
    await mkdir(destination, { recursive: true });

    if (!sqlite) {
      return { success: false, error: "SQLite database not available" };
    }

    const tables = sqlite
      .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as { name: string }[];

    let sql = "-- SQLite Database Backup\n";
    sql += `-- Created: ${new Date().toISOString()}\n`;
    sql += `-- Type: ${options.type || "full"}\n\n`;

    for (const table of tables) {
      const tableName = table.name;

      const createStmt = sqlite
        .query(`SELECT sql FROM sqlite_master WHERE type='table' AND name = ?`)
        .get(tableName) as { sql: string } | undefined;

      if (createStmt) {
        sql += `${createStmt.sql};\n\n`;
      }

      const rows = sqlite.query(`SELECT * FROM ${tableName}`).all();
      if (rows.length > 0) {
        const columns = Object.keys(rows[0] as Record<string, unknown>);
        for (const row of rows) {
          const values = columns.map((col) => {
            const val = (row as Record<string, unknown>)[col];
            if (val === null) return "NULL";
            if (typeof val === "number") return String(val);
            if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Uint8Array) return `X'${Buffer.from(val).toString("hex")}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          sql += `INSERT INTO ${tableName} (${columns.join(
            ", ",
          )}) VALUES (${values.join(", ")});\n`;
        }
        sql += "\n";
      }
    }

    sql += `-- Backup ID: ${id}\n`;
    sql += `-- Schema Version: ${timestamp}\n`;

    const checksum = createHash("sha256").update(sql).digest("hex");
    const filePath = join(destination, filename);

    if (compressed) {
      const input = Buffer.from(sql);
      const output = Bun.deflateSync(input);
      await Bun.write(filePath, output);
    } else {
      await Bun.write(filePath, sql);
    }

    const stats = await stat(filePath);

    const db = getWriteDb();
    if (db) {
      await db.insert(backups).values({
        id,
        filename,
        path: filePath,
        size: stats.size,
        checksum,
        databaseType: "sqlite",
        schemaVersion: timestamp,
        createdAt: new Date(),
        completedAt: new Date(),
        status: "completed",
        type: options.type || "full",
        retentionDays: options.retentionDays,
        compressed,
        metadata: JSON.stringify({
          tablesCount: tables.length,
          createdBy: options.createdBy,
        }),
      });
    }

    return {
      success: true,
      id,
      filename,
      path: filePath,
      size: stats.size,
      checksum,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    const db = getWriteDb();
    if (db) {
      await db
        .insert(backups)
        .values({
          id,
          filename,
          path: join(destination || getBackupDirectory(), filename || "unknown"),
          size: 0,
          checksum: "",
          databaseType: "sqlite",
          createdAt: new Date(),
          status: "failed",
          type: options.type || "full",
          compressed,
          error: errorMessage,
        })
        .catch(() => {});
    }

    return {
      success: false,
      error: errorMessage,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Restores database from a backup.
 */
export async function restoreBackup(backupId: string, createdBy?: string): Promise<RestoreResult> {
  const startTime = Date.now();
  const db = getWriteDb();

  if (!db || !sqlite) {
    return { success: false, error: "Database not available" };
  }

  try {
    const backupRecord = await db.select().from(backups).where(eq(backups.id, backupId)).limit(1);

    if (!backupRecord[0]) {
      return { success: false, error: "Backup not found" };
    }

    if (backupRecord[0].status !== "completed") {
      return { success: false, error: "Backup is not in completed state" };
    }

    const restoreId = crypto.randomUUID();
    await db.insert(restoreHistory).values({
      id: restoreId,
      backupId,
      backupFilename: backupRecord[0].filename,
      startedAt: new Date(),
      status: "running",
      createdBy,
    });

    let sql: string;
    const backupPath = backupRecord[0].path;

    if (backupRecord[0].compressed) {
      const compressed = await readFile(backupPath);
      const decompressed = Bun.inflateSync(compressed);
      sql = Buffer.from(decompressed).toString("utf8");
    } else {
      sql = await readFile(backupPath, "utf8");
    }

    const currentTables = sqlite
      .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      .all() as { name: string }[];

    for (const table of currentTables) {
      sqlite.exec(`DROP TABLE IF EXISTS ${table.name}`);
    }

    const statements = sql.split(";").filter((s) => s.trim() && !s.trim().startsWith("--"));
    let tablesRestored = 0;
    let rowsRestored = 0;

    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (trimmed.startsWith("CREATE")) {
        sqlite.exec(trimmed);
        tablesRestored++;
      } else if (trimmed.startsWith("INSERT")) {
        try {
          sqlite.exec(trimmed);
          const match = trimmed.match(/VALUES\s*\(([^)]+)\)/);
          if (match) {
            rowsRestored++;
          }
        } catch {
          // Skip malformed statements
        }
      }
    }

    await db
      .update(restoreHistory)
      .set({
        completedAt: new Date(),
        status: "completed",
        tablesRestored,
        rowsRestored,
      })
      .where(eq(restoreHistory.id, restoreId));

    return {
      success: true,
      backupId,
      tablesRestored,
      rowsRestored,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return {
      success: false,
      error: errorMessage,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Lists available backups.
 */
export async function listBackups(limit = 10): Promise<Backup[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db
    .select()
    .from(backups)
    .where(eq(backups.status, "completed"))
    .orderBy(desc(backups.createdAt))
    .limit(limit);
}

/**
 * Gets a specific backup by ID.
 */
export async function getBackup(backupId: string): Promise<Backup | null> {
  const db = getWriteDb();
  if (!db) return null;

  const result = await db.select().from(backups).where(eq(backups.id, backupId)).limit(1);

  return result[0] ?? null;
}

/**
 * Deletes old backups based on retention policy.
 */
export async function cleanupOldBackups(retentionDays = 30): Promise<number> {
  const db = getWriteDb();
  if (!db) return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const oldBackups = await db
    .select()
    .from(backups)
    .where(and(eq(backups.status, "completed"), lt(backups.createdAt, cutoffDate)));

  let deleted = 0;
  for (const backup of oldBackups) {
    try {
      await rm(backup.path);
    } catch {
      // File may not exist
    }
    await db.delete(backups).where(eq(backups.id, backup.id));
    deleted++;
  }

  return deleted;
}

/**
 * Gets backup history.
 */
export async function getRestoreHistory(limit = 10): Promise<RestoreHistory[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db.select().from(restoreHistory).orderBy(desc(restoreHistory.startedAt)).limit(limit);
}

/**
 * Verifies backup integrity by checksum.
 */
export async function verifyBackup(backupId: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  const db = getWriteDb();
  if (!db) return { valid: false, error: "Database not available" };

  const backup = await getBackup(backupId);
  if (!backup) return { valid: false, error: "Backup not found" };

  try {
    let content: Buffer;
    if (backup.compressed) {
      const compressed = await readFile(backup.path);
      const decompressed = Bun.inflateSync(compressed);
      content = Buffer.from(decompressed);
    } else {
      content = await readFile(backup.path);
    }

    const checksum = createHash("sha256").update(content).digest("hex");

    if (checksum !== backup.checksum) {
      return {
        valid: false,
        error: "Checksum mismatch - backup may be corrupted",
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

/**
 * Creates a backup schedule.
 */
export async function createBackupSchedule(
  name: string,
  type: "hourly" | "daily" | "weekly",
  retentionCount: number,
  retentionDays?: number,
): Promise<string> {
  const db = getWriteDb();
  if (!db) return "";

  const id = crypto.randomUUID();
  const intervals: Record<string, { interval: string; nextRun: Date }> = {
    hourly: {
      interval: "0 * * * *",
      nextRun: new Date(Date.now() + 60 * 60 * 1000),
    },
    daily: {
      interval: "0 0 * * *",
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    weekly: {
      interval: "0 0 * * 0",
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  };

  const config = intervals[type];

  await db.insert(backupSchedules).values({
    id,
    name,
    type,
    interval: config.interval,
    retentionCount,
    retentionDays,
    enabled: true,
    nextRunAt: config.nextRun,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return id;
}

/**
 * Gets all backup schedules.
 */
export async function getBackupSchedules(): Promise<BackupSchedule[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db.select().from(backupSchedules);
}

/**
 * Updates next run time for a schedule.
 */
export async function updateScheduleNextRun(scheduleId: string): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  const schedule = await db
    .select()
    .from(backupSchedules)
    .where(eq(backupSchedules.id, scheduleId))
    .limit(1);

  if (!schedule[0]) return;

  const intervalMs: Record<string, number> = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
  };

  const ms = intervalMs[schedule[0].type] || intervalMs.daily;
  const nextRun = new Date(Date.now() + ms);

  await db
    .update(backupSchedules)
    .set({
      lastRunAt: new Date(),
      nextRunAt: nextRun,
      updatedAt: new Date(),
    })
    .where(eq(backupSchedules.id, scheduleId));
}