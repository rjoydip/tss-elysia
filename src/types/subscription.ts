/**
 * Subscription tier types and configurations.
 * Defines available subscription plans and their associated rate limits.
 * Used for tiered access control and API rate limiting.
 */

/**
 * Available subscription tiers.
 * Each tier provides different rate limits and feature access.
 * - free: Basic usage for individual developers
 * - contributor: Higher limits for active contributors
 * - enterprise: Maximum limits for commercial use
 */
export type SubscriptionTier = "free" | "contributor" | "enterprise";

/**
 * Rate limit configuration for each subscription tier.
 * @property name - Human-readable tier name
 * @property rateLimit - Maximum requests allowed in the time window
 * @property rateLimitDuration - Time window in milliseconds
 */
export const SUBSCRIPTION_TIERS: Record<
  SubscriptionTier,
  { name: string; rateLimit: number; rateLimitDuration: number }
> = {
  free: {
    name: "Free",
    rateLimit: 100, // 100 requests per minute
    rateLimitDuration: 60_000,
  },
  contributor: {
    name: "Contributor",
    rateLimit: 1000, // 1000 requests per minute
    rateLimitDuration: 60_000,
  },
  enterprise: {
    name: "Enterprise",
    rateLimit: 10000, // 10000 requests per minute
    rateLimitDuration: 60_000,
  },
};

/**
 * Default subscription tier for new users.
 * Applied to users without an active subscription.
 */
export const DEFAULT_TIER: SubscriptionTier = "free";
