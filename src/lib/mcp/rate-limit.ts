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

  /**
   * Check if request is allowed and update counter.
   *
   * @param keyId - API key ID
   * @param limit - Max requests allowed
   * @param duration - Window duration in ms
   * @returns { allowed: boolean, remaining: number, resetAt: number }
   */
  check(
    keyId: string,
    limit: number,
    duration: number,
  ): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
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
  }

  /**
   * Reset rate limit for a key.
   */
  reset(keyId: string): void {
    this.requests.delete(keyId);
  }

  /**
   * Clean up expired entries.
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetAt) {
        this.requests.delete(key);
        cleaned++;
      }
    }

    return cleaned;
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
export function checkRateLimit(apiKey: McpApiKey): RateLimitResult {
  const limit = apiKey.rateLimit ?? 100;
  const duration = apiKey.rateLimitDuration ?? 60_000;

  const result = rateLimitStore.check(apiKey.id, limit, duration);

  return {
    ...result,
    limit,
    duration,
  };
}

/**
 * Reset rate limit for an API key (e.g., after successful key revocation).
 */
export function resetRateLimit(keyId: string): void {
  rateLimitStore.reset(keyId);
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
setInterval(() => {
  const cleaned = rateLimitStore.cleanup();
  if (cleaned > 0) {
    // Could log here in production
  }
}, 60_000); // Run every minute