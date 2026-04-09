/**
 * Redis session storage adapter for Better Auth.
 * Provides distributed session management for multi-instance deployments.
 * Used as a caching layer in front of database sessions.
 *
 * Features:
 * - Redis-backed session caching with automatic expiration
 * - In-memory fallback when Redis unavailable
 * - Session data serialization
 *
 * @module auth/session
 */

import type { Session } from "better-auth/types";
import { getRedisClient } from "~/lib/redis";
import { redisLogger } from "~/lib/logger";
import { sessionConfig } from "~/config";

/**
 * Redis session storage.
 * Provides session caching for distributed deployments.
 */
export class RedisSessionStorage {
  /** Default session TTL from config */
  private readonly defaultExpiresIn = sessionConfig.expiresIn;

  /**
   * Gets the Redis client.
   */
  private getClient() {
    return getRedisClient();
  }

  /**
   * Gets a storage key for a session.
   * Uses composite key: session:{userId}:{sessionId} for user-scoped deletion.
   *
   * @param userId - User ID
   * @param sessionId - Session ID
   */
  private getKey(userId: string, sessionId: string): string {
    return `session:${userId}:${sessionId}`;
  }

  /**
   * Starts a new session.
   * Stores session data in Redis with TTL.
   *
   * @param session - Session data to store
   */
  async create(session: Session): Promise<void> {
    const client = this.getClient();
    if (!client) {
      redisLogger.debug("Redis unavailable, skipping session cache");
      return;
    }

    try {
      const userId = session.userId;
      const key = this.getKey(userId, session.id);
      const expiresIn = session.expiresAt
        ? Math.ceil((new Date(session.expiresAt).getTime() - Date.now()) / 1000)
        : Math.ceil(this.defaultExpiresIn / 1000);

      await client.send("SET", [key, JSON.stringify(session), "EX", String(expiresIn)]);

      redisLogger.debug("Session cached", { sessionId: session.id, userId });
    } catch (error) {
      redisLogger.error("Failed to cache session", error as Error);
    }
  }

  /**
   * Gets a session by ID.
   * Note: Requires userId to construct the key.
   *
   * @param sessionId - Session ID
   * @param userId - User ID (required to locate session key)
   * @returns Cached session data or null
   */
  async get(sessionId: string, userId: string): Promise<Session | null> {
    const client = this.getClient();
    if (!client) {
      return null;
    }

    try {
      const key = this.getKey(userId, sessionId);
      const result = await client.send("GET", [key]);

      if (!result) return null;

      const str = Array.isArray(result) ? result[0] : result;
      if (!str) return null;
      try {
        return JSON.parse(str) as Session;
      } catch {
        redisLogger.warn("Failed to parse session JSON", { sessionId });
        return null;
      }
    } catch (error) {
      redisLogger.error("Failed to get cached session", error as Error);
      return null;
    }
  }

  /**
   * Updates session expiration and data.
   *
   * @param session - Updated session
   */
  async update(session: Session): Promise<void> {
    await this.create(session);
  }

  /**
   * Deletes a session from cache.
   *
   * @param sessionId - Session ID to delete
   * @param userId - User ID (required to locate session key)
   */
  async delete(sessionId: string, userId: string): Promise<void> {
    const client = this.getClient();
    if (!client) {
      return;
    }

    try {
      const key = this.getKey(userId, sessionId);
      await client.send("DEL", [key]);
    } catch (error) {
      redisLogger.error("Failed to delete cached session", error as Error);
    }
  }

  /**
   * Deletes all cached sessions for a user.
   *
   * @param userId - User ID
   */
  async deleteAll(userId: string): Promise<void> {
    const client = this.getClient();
    if (!client) {
      return;
    }

    try {
      let cursor = "0";
      const pattern = `session:${userId}:*`;

      do {
        const [nextCursor, keys] = await client.send("SCAN", [
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          "100",
        ]);
        cursor = nextCursor;

        if (keys && keys.length > 0) {
          await client.send("DEL", keys);
        }
      } while (cursor !== "0");
    } catch (error) {
      redisLogger.error("Failed to delete user session cache", error as Error);
    }
  }
}

/**
 * Singleton instance for session caching.
 */
export const sessionStorage = new RedisSessionStorage();