/**
 * Test Configuration Index
 *
 * Centralized test configuration for both E2E and unit tests.
 */

import { env } from "../../../src/config/env";
import { getRedisStatus, closeRedis } from "../../../src/lib/redis";
import { DatabaseTestConfig, setupDatabase, teardownDatabase } from "./database";
import { RedisTestConfig, setupRedis, teardownRedis } from "./redis";
import { DEFAULT_DATABASE_PATH, DEFAULT_DATABASE_NAME } from "../../../src/config/db";

/**
 * Default test configuration.
 */
export const testConfig: Required<{ database: DatabaseTestConfig; redis: RedisTestConfig }> = {
  database: {
    dbPath: env.DATABASE_PATH || DEFAULT_DATABASE_PATH,
    dbName: env.DATABASE_NAME || DEFAULT_DATABASE_NAME,
  },
  redis: {
    required: false,
    timeout: 10000,
  },
};

/**
 * Global setup for Playwright E2E tests.
 */
export async function globalSetup(): Promise<void> {
  console.log("[Config] Running global E2E setup...");
  await setupDatabase();
  await setupRedis();
  console.log("[Config] Global E2E setup complete");
}

/**
 * Global teardown for Playwright E2E tests.
 */
export async function globalTeardown(): Promise<void> {
  console.log("[Config] Running global E2E teardown...");
  teardownDatabase();
  await teardownRedis();
  console.log("[Config] Global E2E teardown complete");
}

export default {
  globalSetup,
  globalTeardown,
  testConfig,
  getRedisStatus,
  closeRedis,
};