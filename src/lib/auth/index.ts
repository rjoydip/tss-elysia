import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "~/lib/db";
import { env } from "~/env";
import type { SubscriptionTier } from "./types";

export function createAuth() {
  if (!db) {
    throw new Error("Database not initialized - this module can only be used on the server");
  }

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    secret: env.AUTH_SECRET,
    baseURL: env.API_URL,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    trustedOrigins: [env.API_URL],
  });
}

let _auth: ReturnType<typeof createAuth> | undefined;
function getAuth() {
  if (!_auth) {
    _auth = createAuth();
  }
  return _auth;
}

export const auth = new Proxy(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  {} as any,
  {
    get(_target, prop) {
      const authInstance = getAuth();
      return authInstance[prop as keyof typeof authInstance];
    },
  },
);

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

export async function getUserSubscriptionTier(_userId: string): Promise<SubscriptionTier> {
  return "free";
}
