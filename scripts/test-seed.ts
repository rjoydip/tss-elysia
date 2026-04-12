#!/usr/bin/env bun

/**
 * Database seed script.
 *
 * This script creates deterministic demo data so local environments can be reset
 * and reproduced without relying on stale one-off SQL statements.
 */

import { Database } from "bun:sqlite";
import { logger } from "./_logger";
import { DEFAULT_DATABASE_PATH, getDatabaseFullPath } from "../src/config/db";

function resolveDatabasePath(): string {
  if (process.env.DATABASE_PATH && process.env.DATABASE_NAME) {
    return `${process.env.DATABASE_PATH}/${process.env.DATABASE_NAME}`;
  }
  if (process.env.DATABASE_NAME && !process.env.DATABASE_PATH) {
    return `${DEFAULT_DATABASE_PATH}/${process.env.DATABASE_NAME}`;
  }
  return getDatabaseFullPath(process.env.DATABASE_PATH, process.env.DATABASE_NAME);
}

async function ensureRequiredTablesExist(db: Database): Promise<void> {
  const requiredTables = ["user", "subscription_plan", "subscription"];
  const missingTables: string[] = [];

  for (const tableName of requiredTables) {
    const result = db
      .query("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
      .get(tableName) as { name: string } | undefined;
    if (!result) {
      missingTables.push(tableName);
    }
  }

  if (missingTables.length > 0) {
    throw new Error(
      `Database schema is missing required tables (${missingTables.join(", ")}). Run "bun run db:migrate" before "bun run db:seed".`,
    );
  }
}

async function main(): Promise<void> {
  const databasePath = resolveDatabasePath();

  logger.section("Database Seeding");
  logger.step(1, `Seeding database at ${databasePath}`);

  const db = new Database(databasePath);

  await ensureRequiredTablesExist(db);

  console.log("✓ Database has required tables");
}

main().catch(console.error);