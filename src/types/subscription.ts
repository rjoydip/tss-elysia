export type SubscriptionTier = "free" | "contributor" | "enterprise";

export const SUBSCRIPTION_TIERS: Record<
  SubscriptionTier,
  { name: string; rateLimit: number; rateLimitDuration: number }
> = {
  free: {
    name: "Free",
    rateLimit: 100,
    rateLimitDuration: 60_000,
  },
  contributor: {
    name: "Contributor",
    rateLimit: 1000,
    rateLimitDuration: 60_000,
  },
  enterprise: {
    name: "Enterprise",
    rateLimit: 10000,
    rateLimitDuration: 60_000,
  },
};

export const DEFAULT_TIER: SubscriptionTier = "free";
