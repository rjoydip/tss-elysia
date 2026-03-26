import { describe, expect, it, beforeEach } from "bun:test";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { faker } from "@faker-js/faker";
import * as schema from "../src/lib/db/schema";

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    subscriptionTier TEXT NOT NULL DEFAULT 'free',
    subscriptionId TEXT,
    subscriptionStatus TEXT,
    subscriptionExpiresAt INTEGER
  );
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresAt INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER,
    updatedAt INTEGER
  );
`;

function createTestDatabase(): ReturnType<typeof drizzle> {
  const sqlite = new Database(":memory:");
  sqlite.exec(CREATE_TABLES_SQL);
  return drizzle(sqlite, { schema });
}

describe("Authentication", () => {
  let db: ReturnType<typeof drizzle>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let auth: any;

  beforeEach(() => {
    db = createTestDatabase();
    auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: {
          user: schema.users,
          session: schema.sessions,
          account: schema.accounts,
          verification: schema.verifications,
        },
      }),
      secret: "test-secret-123456789012345678901234567890",
      baseURL: "http://localhost:3000",
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: { enabled: false },
      },
    });
  });

  describe("signUpEmail", () => {
    it("should create a new user with valid credentials", async () => {
      const result = await auth.api.signUpEmail({
        body: {
          email: faker.internet.email().toLowerCase(),
          password: faker.internet.password({ length: 12 }),
          name: faker.person.fullName(),
        },
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBeDefined();
    });

    it("should fail with duplicate email", async () => {
      const email = faker.internet.email().toLowerCase();
      const password = faker.internet.password({ length: 12 });
      const name = faker.person.fullName();

      await auth.api.signUpEmail({
        body: { email, password, name },
      });

      let errorCaught = false;
      try {
        await auth.api.signUpEmail({
          body: { email, password, name },
        });
      } catch (error: unknown) {
        errorCaught = true;
        const apiError = error as { status?: string };
        expect(apiError.status).toBe("UNPROCESSABLE_ENTITY");
      }
      expect(errorCaught).toBe(true);
    });
  });

  describe("signInEmail", () => {
    it("should authenticate valid user", async () => {
      const email = faker.internet.email().toLowerCase();
      const password = faker.internet.password({ length: 12 });
      const name = faker.person.fullName();

      await auth.api.signUpEmail({
        body: { email, password, name },
      });

      const result = await auth.api.signInEmail({
        body: { email, password },
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it("should fail with invalid password", async () => {
      const email = faker.internet.email().toLowerCase();
      const password = faker.internet.password({ length: 12 });
      const name = faker.person.fullName();

      await auth.api.signUpEmail({
        body: { email, password, name },
      });

      let errorCaught = false;
      try {
        await auth.api.signInEmail({
          body: { email, password: "wrong-password" },
        });
      } catch (error: unknown) {
        errorCaught = true;
        const apiError = error as { status?: string };
        expect(apiError.status).toBe("UNAUTHORIZED");
      }
      expect(errorCaught).toBe(true);
    });

    it("should fail with non-existent user", async () => {
      let errorCaught = false;
      try {
        await auth.api.signInEmail({
          body: { email: "nonexistent@example.com", password: "password123" },
        });
      } catch (error: unknown) {
        errorCaught = true;
        const apiError = error as { status?: string };
        expect(apiError.status).toBe("UNAUTHORIZED");
      }
      expect(errorCaught).toBe(true);
    });
  });
});
