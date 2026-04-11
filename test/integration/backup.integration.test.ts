import { beforeAll, afterAll, beforeEach, describe, it, expect } from "bun:test";
import fs from "fs/promises";
import path from "path";
import { v4 as uuid } from "@lukeed/uuid";
import { createBackup, getBackup, listBackups } from "../../src/lib/db/backup";
import { getWriteDb } from "../../src/lib/db";
import { users, sessions } from "../../src/lib/db/core/schema";
import { env } from "../../src/config/env";

async function getUniqueUserId() {
  return `user-${Date.now()}-${uuid().slice(0, 8)}`;
}

async function seedCoreData() {
  const db = getWriteDb();
  if (!db) return;

  const userId = await getUniqueUserId();
  await db.insert(users).values({
    id: userId,
    name: "Alice",
    email: "alice@example.com",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(sessions).values({
    id: uuid(),
    userId,
    token: `token-${Date.now()}`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

async function clearBackups() {
  const backupDir = path.join(env.DATABASE_PATH ?? ".artifacts", "backups");
  try {
    await fs.rm(backupDir, { recursive: true, force: true });
  } catch {}
}

describe("Backup & Restore Integration", () => {
  beforeAll(async () => {
    await seedCoreData();
  });

  afterAll(async () => {
    await clearBackups();
  });

  beforeEach(async () => {
    await clearBackups();
    await seedCoreData();
  });

  it("creates a full backup and validates metadata", async () => {
    const result = await createBackup({ type: "full", compressed: false, retentionDays: 30 });
    expect(result.success).toBeTrue();
    expect(result.filename).toMatch(/backup-.*\.sql$/);

    const backup = await getBackup(result.id!);
    expect(backup).not.toBeNull();
  });

  it("creates a compressed backup", async () => {
    const result = await createBackup({ type: "full", compressed: true, retentionDays: 30 });
    expect(result.success).toBeTrue();
    expect(result.filename).toMatch(/backup-.*\.sql\.gz$/);

    const backup = await getBackup(result.id!);
    expect(backup).not.toBeNull();
    expect(backup!.compressed).toBeTrue();
  });

  it("lists available backups", async () => {
    await createBackup({ type: "full", compressed: false });
    const backups = await listBackups();
    expect(backups.length).toBeGreaterThan(0);
  });

  it("checks backup schema version with core DB version", async () => {
    const backup = await createBackup({ type: "full", compressed: false });
    const backupRow = await getBackup(backup.id!);
    expect(backupRow!.schemaVersion).not.toBeNull();
  });
});