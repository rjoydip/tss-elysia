/**
 * setup for E2E tests.
 * Sets up the database before tests run.
 */

import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const dbPath = process.env.DATABASE_PATH || ".artifacts";
const dbName = process.env.DATABASE_NAME || "tss-elysia.db";

export default async function globalSetup() {
  console.log("[E2E Setup] Setting up database...");

  // Ensure database directory exists
  const fullPath = resolve(dbPath);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
    console.log(`[E2E Setup] Created directory: ${fullPath}`);
  }

  // Push database schema (create tables if not exists)
  console.log("[E2E Setup] Running db:push to create tables...");
  try {
    execSync("bun run db:push", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_TYPE: "sqlite" },
    });
    console.log("[E2E Setup] Database schema pushed successfully");
  } catch (error) {
    console.error("[E2E Setup] Failed to push database schema:", error);
    // Continue anyway - the db might already exist
  }

  console.log(`[E2E Setup] Database ready at: ${dbPath}/${dbName}`);
  console.log("[E2E Setup] Setup complete");
}