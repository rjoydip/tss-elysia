import { betterAuth, type BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";

export function createAuth(db: any, options?: Partial<BetterAuthOptions>) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: undefined as any,
        session: undefined as any,
        account: undefined as any,
        verification: undefined as any,
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
    ...options,
  });
}

export { betterAuth };
