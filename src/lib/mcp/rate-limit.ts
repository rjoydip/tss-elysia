/**
 * MCP-specific rate limiting.
 * Implements token bucket algorithm per API key.
 */

import type { McpApiKey } from "~/lib/db/schema";

/**
 * Rate limit check result type.
 */
export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
  duration: number;
};

/**
 * Rate limit store using in-memory Map.
 * For production, would use Redis for multi-instance support.
 */
class RateLimitStore {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();
  private lock: Promise<void> = Promise.resolve();
  private lastCleanupAt = 0;

  /**
   * Serializes store mutations to avoid interleaving under concurrent async request handling.
   */
  private async withLock<T>(operation: () => T): Promise<T> {
    let release: (() => void) | undefined;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    const previousLock = this.lock;
    this.lock = previousLock.then(() => nextLock);
    await previousLock;
    try {
      return operation();
    } finally {
      release?.();
    }
  }

  /**
   * Check if request is allowed and update counter.
   *
   * @param keyId - API key ID
   * @param limit - Max requests allowed
   * @param duration - Window duration in ms
   * @returns { allowed: boolean, remaining: number, resetAt: number }
   */
  async check(
    keyId: string,
    limit: number,
    duration: number,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> {
    return this.withLock(() => {
      const now = Date.now();
      // Opportunistic cleanup for environments where background timers may pause.
      if (now - this.lastCleanupAt > 60_000) {
        this.lastCleanupAt = now;
        for (const [cleanupKey, cleanupRecord] of this.requests.entries()) {
          if (now > cleanupRecord.resetAt) {
            this.requests.delete(cleanupKey);
          }
        }
      }
      const record = this.requests.get(keyId);

      // No existing record or window expired
      if (!record || now > record.resetAt) {
        const resetAt = now + duration;
        this.requests.set(keyId, { count: 1, resetAt });
        return {
          allowed: true,
          remaining: limit - 1,
          resetAt,
        };
      }

      // Within window - check limit
      if (record.count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: record.resetAt,
        };
      }

      // Increment counter
      record.count++;
      return {
        allowed: true,
        remaining: limit - record.count,
        resetAt: record.resetAt,
      };
    });
  }

  /**
   * Reset rate limit for a key.
   */
  async reset(keyId: string): Promise<void> {
    await this.withLock(() => {
      this.requests.delete(keyId);
    });
  }

  /**
   * Clean up expired entries.
   */
  async cleanup(): Promise<number> {
    return this.withLock(() => {
      const now = Date.now();
      this.lastCleanupAt = now;
      let cleaned = 0;

      for (const [key, record] of this.requests.entries()) {
        if (now > record.resetAt) {
          this.requests.delete(key);
          cleaned++;
        }
      }

      return cleaned;
    });
  }
}

/**
 * Global rate limit store instance.
 */
export const rateLimitStore = new RateLimitStore();

/**
 * Check rate limit for an API key.
 * Uses the key's configured rateLimit and rateLimitDuration.
 *
 * @param apiKey - The API key record with rate limit settings
 * @returns Rate limit check result
 */
export async function checkRateLimit(apiKey: McpApiKey): Promise<RateLimitResult> {
  const limit = apiKey.rateLimit ?? 100;
  const duration = apiKey.rateLimitDuration ?? 60_000;

  const result = await rateLimitStore.check(apiKey.id, limit, duration);

  return {
    ...result,
    limit,
    duration,
  };
}

/**
 * Reset rate limit for an API key (e.g., after successful key revocation).
 */
export async function resetRateLimit(keyId: string): Promise<void> {
  await rateLimitStore.reset(keyId);
}

/**
 * Middleware to add rate limit headers to response.
 *
 * @param response - Response object to modify
 * @param limit - Rate limit
 * @param remaining - Remaining requests
 * @param resetAt - Reset timestamp
 * @returns Modified response
 */
export function addRateLimitHeaders(
  response: Response,
  limit: number,
  remaining: number,
  resetAt: number,
): Response {
  response.headers.set("X-RateLimit-Limit", String(limit));
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

  return response;
}

// Periodic cleanup of expired rate limit entries
/**
 * Performs one cleanup pass. Can be triggered in serverless paths where intervals may be suspended.
 */
export async function cleanupRateLimitStore(): Promise<number> {
  return rateLimitStore.cleanup();
}

const cleanupInterval = setInterval(async () => {
  await cleanupRateLimitStore();
}, 60_000); // Run every minute
cleanupInterval.unref();