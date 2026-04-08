/**
 * Database heartbeat probe utilities.
 * Provides a lightweight read-only liveness check for status monitoring endpoints.
 */

import { sqlite } from "./index";

/**
 * Heartbeat payload shape for database liveness checks.
 */
export interface DatabaseHeartbeat {
  status: "healthy" | "unhealthy";
  latencyMs: number | null;
  timestamp: string;
  detail: string;
}

/**
 * Executes a minimal SQLite heartbeat query and returns probe metadata.
 * Uses `SELECT 1` to verify read access without mutating application state.
 */
export function getDatabaseHeartbeat(): DatabaseHeartbeat {
  const startedAt = Date.now();

  try {
    // Guard against misconfigured runtime where the database driver is unavailable.
    if (!sqlite) {
      return {
        status: "unhealthy",
        latencyMs: null,
        timestamp: new Date().toISOString(),
        detail: "SQLite instance is not initialized",
      };
    }

    const result = sqlite.query("SELECT 1 AS ok").get() as { ok?: number } | null;
    if (!result || result.ok !== 1) {
      return {
        status: "unhealthy",
        latencyMs: null,
        timestamp: new Date().toISOString(),
        detail: "Database heartbeat query returned unexpected result",
      };
    }

    return {
      status: "healthy",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
      detail: "Database heartbeat query succeeded",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database heartbeat error";
    return {
      status: "unhealthy",
      latencyMs: null,
      timestamp: new Date().toISOString(),
      detail: message,
    };
  }
}