import { Elysia } from "elysia";
import type { SocketAddress } from "elysia/universal";
import { type Generator, rateLimit, DefaultContext } from "elysia-rate-limit";
import { SUBSCRIPTION_TIERS, DEFAULT_TIER } from "~/lib/auth/types";
import { getUserSubscriptionTier } from "~/lib/auth";

async function getRateLimitConfig(userId?: string): Promise<{ max: number; duration: number }> {
  if (!userId) {
    return {
      max: SUBSCRIPTION_TIERS[DEFAULT_TIER].rateLimit,
      duration: SUBSCRIPTION_TIERS[DEFAULT_TIER].rateLimitDuration,
    };
  }

  const tier = await getUserSubscriptionTier(userId);
  const config = SUBSCRIPTION_TIERS[tier] ?? SUBSCRIPTION_TIERS[DEFAULT_TIER];

  return {
    max: config.rateLimit,
    duration: config.rateLimitDuration,
  };
}

const ipGenerator: Generator<{ ip: SocketAddress; userId?: string }> = async (
  _r,
  _s,
  { ip, userId },
) => {
  if (userId) {
    return `user:${userId}`;
  }
  return ip?.address ?? "unknown";
};

export const rateLimitMiddleware = new Elysia({ name: "rate-limit" }).use(
  rateLimit({
    duration: SUBSCRIPTION_TIERS[DEFAULT_TIER].rateLimitDuration,
    max: SUBSCRIPTION_TIERS[DEFAULT_TIER].rateLimit,
    headers: true,
    scoping: "scoped",
    countFailedRequest: true,
    errorResponse: new Response(
      JSON.stringify({
        error: "Too many requests",
      }),
      { status: 429 },
    ),
    generator: ipGenerator,
    context: new DefaultContext(10_000),
  }),
);

export async function createUserRateLimitMiddleware(userId: string) {
  const config = await getRateLimitConfig(userId);

  return new Elysia({ name: `rate-limit-user-${userId}` }).use(
    rateLimit({
      duration: config.duration,
      max: config.max,
      headers: true,
      scoping: "scoped",
      countFailedRequest: true,
      errorResponse: new Response(
        JSON.stringify({
          error: "Too many requests",
          message: `Rate limit exceeded for your subscription tier`,
        }),
        { status: 429 },
      ),
      generator: ipGenerator,
      context: new DefaultContext(10_000),
    }),
  );
}

export const dynamicRateLimitMiddleware = new Elysia({ name: "dynamic-rate-limit" }).derive(
  async ({ cookie }) => {
    const sessionToken = cookie["better-auth.session_token"]?.value;
    let userId: string | undefined;

    if (sessionToken) {
      const { auth } = await import("~/lib/auth");
      const session = await auth.api.getSession({
        headers: {
          cookie: `better-auth.session_token=${sessionToken}`,
        },
      });
      userId = session?.session?.userId;
    }

    const config = await getRateLimitConfig(userId);

    return {
      rateLimit: {
        max: config.max,
        duration: config.duration,
      },
    };
  },
);

export type RateLimitConfig = {
  max: number;
  duration: number;
};
