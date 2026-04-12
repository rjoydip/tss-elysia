/**
 * Redis test utilities.
 * Provides setup, teardown, and health check functions for Redis during tests.
 */

import { getRedisStatus, closeRedis } from "../../../src/lib/redis";

export interface RedisTestConfig {
  required: boolean;
  timeout: number;
}

/**
 * Check if Redis is available and connected.
 *
 * @returns True if Redis is configured and connected
 */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    const status = await getRedisStatus();
    return status.connected;
  } catch {
    return false;
  }
}

/**
 * Wait for Redis to become available.
 *
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 * @returns True if Redis becomes available, false if timeout
 */
export async function waitForRedis(timeout = 10000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await isRedisAvailable()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

/**
 * Setup Redis for tests.
 * Ensures Redis client is initialized if configured.
 */
export async function setupRedis(): Promise<void> {
  console.log("[Redis Test] Setting up Redis...");
  const available = await waitForRedis();
  if (!available) {
    console.warn("[Redis Test] Redis not available, tests may fail if Redis is required");
  } else {
    console.log("[Redis Test] Redis connected");
  }
}

/**
 * Teardown Redis for tests.
 * Closes Redis connection.
 */
export async function teardownRedis(): Promise<void> {
  console.log("[Redis Test] Tearing down Redis...");
  closeRedis();
  console.log("[Redis Test] Redis connection closed");
}

/**
 * Skip test if Redis is not available.
 * Use in test files to conditionally skip tests requiring Redis.
 *
 * @param reason - Reason for skipping if Redis not available
 */
export async function skipIfNoRedis(reason = "Redis not available"): Promise<void> {
  const available = await isRedisAvailable();
  if (!available) {
    throw new Error(`[Redis Test] Skipping: ${reason}`);
  }
}

export default {
  isRedisAvailable,
  waitForRedis,
  setupRedis,
  teardownRedis,
  skipIfNoRedis,
};