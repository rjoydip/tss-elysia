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
  console.log("[Setup] Setting up database...");

  // Ensure database directory exists
  const fullPath = resolve(dbPath);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
    console.log(`[Setup] Created directory: ${fullPath}`);
  }

  // Push database schema (create tables if not exists)
  console.log("[Setup] Running db:push to create tables...");
  try {
    execSync("bun run db:push", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_TYPE: "sqlite" },
    });
    console.log("[Setup] Database schema pushed successfully");
  } catch (error) {
    console.error("[Setup] Failed to push database schema:", error);
    // Continue anyway - the db might already exist
  }

  console.log(`[Setup] Database ready at: ${dbPath}/${dbName}`);
  console.log("[Setup] Setup complete");
}