import { hash, type Options, verify } from "@node-rs/argon2";
import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "~/lib/db";
import { env } from "~/env";
import type { SubscriptionTier } from "~/types/subscription";
import { isBun } from "~/config";

export function createAuth() {
  if (!db) {
    throw new Error("Database not initialized - this module can only be used on the server");
  }

  const hashOpts: Options = {
    memoryCost: 65536, // 64 MiB
    timeCost: 3, // 3 iterations
    parallelism: 4, // 4 lanes
    outputLen: 32, // 32 bytes
    algorithm: 2, // Argon2id
  };

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
    plugins: [openAPI()],
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      password: {
        hash: async (input: string) =>
          isBun ? await Bun.password.hash(input) : await hash(input, hashOpts),
        verify: async ({ password, hash }) =>
          isBun
            ? await Bun.password.verify(password, hash)
            : await verify(hash, password, hashOpts),
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    trustedOrigins: [env.BETTER_AUTH_URL, new URL(env.BETTER_AUTH_URL).origin],
    onAPIError: {
      onError: (error) => {
        console.error("Auth API error:", error);
      },
    },
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
  // eslint_disable-next-line @typescript-eslint/no-explicit-any
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
