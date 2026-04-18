/**
 * setup for E2E tests.
 * Sets up the database before tests run.
 */

import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

const sqliteUrl = process.env.SQLITE_URL || "file:.artifacts/tsse-elysia.db";

export default async function globalSetup() {
  console.log("[E2E Setup] Setting up database...");

  const dbPath = sqliteUrl.startsWith("file:") ? sqliteUrl.replace("file:", "") : sqliteUrl;

  const fullPath = resolve(dbPath);
  const dirPath = resolve(dbPath, "..");

  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`[E2E Setup] Created directory: ${dirPath}`);
  }

  console.log("[E2E Setup] Running db:push to create tables...");

  try {
    execSync("bun run db:push", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_TYPE: "sqlite", SQLITE_URL: dbPath },
    });
    console.log("[E2E Setup] Database schema pushed successfully");
  } catch (error) {
    console.error("[E2E Setup] Failed to push database schema:", error);
  }

  console.log(`[E2E Setup] Database ready at: ${fullPath}`);
  console.log("[E2E Setup] Setup complete");
}