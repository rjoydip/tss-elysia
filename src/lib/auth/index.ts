/**
 * Authentication configuration and factory using Better Auth.
 * Provides email/password auth with database adapter for Drizzle ORM.
 * Uses Argon2id for secure password hashing with Bun native API when available.
 * This module should only be used on the server side.
 */

import { hash, type Options, verify } from "@node-rs/argon2";
import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema, getDatabaseType } from "~/lib/db";
import { env } from "~/config/env";
import type { SubscriptionTier } from "~/types/subscription";
import { isTest, sessionConfig } from "~/config";
import { logger } from "~/lib/logger";
import { decodePassword } from "~/lib/utils/encryption";

/**
 * Creates and configures the Better Auth instance.
 * Should only be called on the server side (database required).
 *
 * @returns Configured Better Auth instance
 * @throws Error if called in client-side context
 *
 * @example
 * const auth = createAuth();
 * // Use auth.api.signUp(), auth.api.signIn(), etc.
 */
export function createAuth() {
  // Ensure database is available - auth requires server-side execution
  if (!db) {
    throw new Error(
      "Database not initialized - this module can only be used on the server"
    );
  }

  // Argon2id hashing options for secure password storage
  // These values provide good security/performance balance
  const hashOpts: Options = {
    memoryCost: 65536, // 64 MiB - resistant to GPU cracking
    timeCost: 3, // 3 iterations - computational cost
    parallelism: 4, // 4 lanes - parallel processing
    outputLen: 32, // 32 bytes - hash output size
    algorithm: 2, // Argon2id - recommended variant
  };

  return betterAuth({
    // Database adapter using Drizzle ORM with dynamic provider based on env
    database: drizzleAdapter(db, {
      provider: getDatabaseType() === "postgres" ? "pg" : "sqlite",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),

    // Generate OpenAPI documentation from auth routes
    plugins: [openAPI()],

    // Secret key for signing sessions and tokens
    secret: env.BETTER_AUTH_SECRET,

    // Base URL for auth endpoints (used in redirects, emails)
    baseURL: env.BETTER_AUTH_URL,

    // Email/password authentication configuration
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Can enable for production
      password: {
        // Use Bun's native password API when available (faster), fallback to argon2
        hash: async (input: string) => {
          if (!input) {
            throw new Error("Password cannot be empty");
          }
          const decoded = decodePassword(input);
          return await hash(decoded, hashOpts);
        },
        verify: async ({ password, hash }) => {
          const decoded = decodePassword(password);
          return await verify(hash, decoded, hashOpts);
        },
      },
    },

    // Session configuration with caching for performance
    session: {
      expiresIn: sessionConfig.expiresIn,
      updateAge: sessionConfig.updateAge,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes - cache duration
      },
    },

    // Trusted origins for CORS - prevents CSRF attacks
    trustedOrigins: [env.BETTER_AUTH_URL, new URL(env.BETTER_AUTH_URL).origin],

    /**
     * Advanced runtime networking config for auth rate-limiting and audit metadata.
     * Ensures Better Auth can derive a client IP behind local proxies/reverse proxies.
     */
    advanced: {
      ipAddress: {
        ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "cf-connecting-ip"],
      },
    },

    // Error handler for auth API failures
    onAPIError: {
      onError: (error: unknown) => {
        logger.error(`Auth API error: ${error}`);
      },
    },

    // Logger configuration - disable in test environment to reduce noise in test output
    logger: {
      disabled: isTest,
    },
  });
}

/**
 * Cached auth instance - singleton pattern to avoid recreating on each call.
 * Better Auth instances are expensive to create (database connections).
 */
let _auth: ReturnType<typeof createAuth> | undefined;

/**
 * Gets or creates the auth instance.
 * Uses lazy initialization for performance.
 */
function getAuth() {
  if (!_auth) {
    _auth = createAuth();
  }
  return _auth;
}

/**
 * Proxy wrapper for auth instance.
 * Provides cleaner API access while maintaining lazy initialization.
 * Allows calling auth.api.* directly without function calls.
 *
 * @example
 * await auth.api.signIn.email({ email, password })
 * const session = await auth.api.getSession({ headers })
 */
export const auth = new Proxy(
  // eslint_disable_next-line @typescript-eslint/no-explicit-any
  {} as any,
  {
    get(_target, prop) {
      const authInstance = getAuth();
      return authInstance[prop as keyof typeof authInstance];
    },
  }
);

// Type exports for use in route handlers and API responses
export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

/**
 * Retrieves the subscription tier for a user.
 * Currently returns 'free' tier - can be extended to check database.
 *
 * @param _userId - User ID to look up (currently unused)
 * @returns Subscription tier based on user's plan
 */
export async function getUserSubscriptionTier(
  _userId: string
): Promise<SubscriptionTier> {
  // TODO: Implement tier lookup from database
  // Would query subscriptions table to get actual tier
  return "free";
}
