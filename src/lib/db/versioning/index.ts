/**
 * Schema versioning manager.
 * Provides version tracking, migration history, and rollback capabilities.
 */

import { getWriteDb, sqlite } from "../index";
import { eq, desc } from "drizzle-orm";
import {
  schemaVersions,
  migrationHistory,
  rollbackPoints,
  type SchemaVersion,
  type MigrationHistory as MigrationHistoryType,
  type RollbackPoint,
} from "./schema";
import { createHash } from "crypto";

/**
 * Current schema version.
 */
export const CURRENT_SCHEMA_VERSION = "0.0.0";

/**
 * Version comparison result.
 */
export type VersionCompareResult = -1 | 0 | 1;

/**
 * Gets the current applied schema version.
 */
export async function getCurrentVersion(): Promise<string | null> {
  const db = getWriteDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(schemaVersions)
    .where(eq(schemaVersions.status, "applied"))
    .orderBy(desc(schemaVersions.appliedAt))
    .limit(1);

  return result[0]?.version ?? null;
}

/**
 * Gets all schema versions in order.
 */
export async function getVersionHistory(): Promise<SchemaVersion[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db.select().from(schemaVersions).orderBy(desc(schemaVersions.appliedAt));
}

/**
 * Compares two semantic versions.
 *
 * @param v1 - First version string
 * @param v2 - Second version string
 * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): VersionCompareResult {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}

/**
 * Checks if a version is newer than another.
 */
export function isNewerVersion(current: string, target: string): boolean {
  return compareVersions(target, current) > 0;
}

/**
 * Checks if a version is older than another.
 */
export function isOlderVersion(current: string, target: string): boolean {
  return compareVersions(target, current) < 0;
}

/**
 * Calculates checksum for schema validation.
 */
export function calculateSchemaChecksum(tables: string[]): string {
  const combined = tables.sort().join("|");
  return createHash("sha256").update(combined).digest("hex").substring(0, 16);
}

/**
 * Records a new schema version.
 */
export async function recordVersion(
  version: string,
  description: string,
  appliedBy?: string,
  checksum?: string,
  rollbackFrom?: string,
): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db.insert(schemaVersions).values({
    version,
    description,
    appliedAt: new Date(),
    appliedBy,
    checksum,
    status: "applied",
    rollbackFrom,
  });
}

/**
 * Records a migration operation.
 */
export async function recordMigration(
  id: string,
  version: string,
  direction: "up" | "down",
  sql?: string,
): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db.insert(migrationHistory).values({
    id,
    version,
    direction,
    startedAt: new Date(),
    status: "running",
    sql,
    executedStatements: 0,
  });
}

/**
 * Updates migration status to completed.
 */
export async function completeMigration(id: string, statements: number): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db
    .update(migrationHistory)
    .set({
      completedAt: new Date(),
      status: "completed",
      executedStatements: statements,
    })
    .where(eq(migrationHistory.id, id));
}

/**
 * Records migration failure.
 */
export async function failMigration(id: string, error: string): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db
    .update(migrationHistory)
    .set({
      completedAt: new Date(),
      status: "failed",
      error,
    })
    .where(eq(migrationHistory.id, id));
}

/**
 * Gets migration history.
 */
export async function getMigrationHistory(limit = 50): Promise<MigrationHistoryType[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db.select().from(migrationHistory).orderBy(desc(migrationHistory.startedAt)).limit(limit);
}

/**
 * Creates a rollback point for the current schema.
 */
export async function createRollbackPoint(description?: string): Promise<string | null> {
  const db = getWriteDb();
  if (!db || !sqlite) return null;

  const id = crypto.randomUUID();
  const version = (await getCurrentVersion()) || CURRENT_SCHEMA_VERSION;

  const tables = sqlite
    .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];

  const snapshotData = JSON.stringify({
    tables: tables.map((t) => t.name),
    created: new Date().toISOString(),
  });

  const checksum = calculateSchemaChecksum(tables.map((t) => t.name));

  await db.insert(rollbackPoints).values({
    id,
    version,
    createdAt: new Date(),
    snapshotData,
    description,
    checksum,
  });

  return id;
}

/**
 * Gets rollback points for a version.
 */
export async function getRollbackPoints(version?: string): Promise<RollbackPoint[]> {
  const db = getWriteDb();
  if (!db) return [];

  const condition = version ? eq(rollbackPoints.version, version) : undefined;

  return db.select().from(rollbackPoints).where(condition);
}

/**
 * Validates schema integrity against known checksums.
 */
export async function validateSchemaIntegrity(): Promise<{
  valid: boolean;
  currentChecksum: string | null;
  expectedVersion: string | null;
  message: string;
}> {
  const db = getWriteDb();
  if (!db || !sqlite) {
    return {
      valid: false,
      currentChecksum: null,
      expectedVersion: null,
      message: "Database not available",
    };
  }

  const tables = sqlite
    .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];

  const currentChecksum = calculateSchemaChecksum(tables.map((t) => t.name));
  const appliedVersions = await db
    .select()
    .from(schemaVersions)
    .where(eq(schemaVersions.status, "applied"))
    .orderBy(desc(schemaVersions.appliedAt))
    .limit(1);

  const expectedVersion = appliedVersions[0];

  if (expectedVersion && expectedVersion.checksum && expectedVersion.checksum !== currentChecksum) {
    return {
      valid: false,
      currentChecksum,
      expectedVersion: expectedVersion.version,
      message: `Schema integrity check failed: expected checksum ${expectedVersion.checksum}, got ${currentChecksum}`,
    };
  }

  return {
    valid: true,
    currentChecksum,
    expectedVersion: expectedVersion?.version ?? null,
    message: "Schema integrity validated",
  };
}

/**
 * Gets pending migrations (versions not yet applied).
 */
export async function getPendingMigrations(availableVersions: string[]): Promise<string[]> {
  const currentVersion = await getCurrentVersion();
  if (!currentVersion) return availableVersions;

  return availableVersions.filter((v) => isNewerVersion(currentVersion, v));
}

/**
 * Initializes schema versioning if not already set up.
 */
export async function initializeSchemaVersioning(): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  const existing = await getCurrentVersion();
  if (!existing) {
    const checksum = await getCurrentSchemaChecksum();
    await recordVersion(
      CURRENT_SCHEMA_VERSION,
      "Initial schema version",
      "system",
      checksum ?? undefined,
    );
  }
}

/**
 * Gets checksum of current schema.
 */
async function getCurrentSchemaChecksum(): Promise<string | null> {
  if (!sqlite) return null;

  const tables = sqlite
    .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];

  return calculateSchemaChecksum(tables.map((t) => t.name));
}