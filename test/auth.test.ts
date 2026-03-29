import { describe, expect, it, beforeEach } from "bun:test";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { faker } from "@faker-js/faker";
import * as schema from "../src/lib/db/schema";
import { CREATE_TABLES_SQL } from "./fixtures/db";

function createTestDatabase(): ReturnType<typeof drizzle> {
  const sqlite = new Database(":memory:");
  sqlite.exec(CREATE_TABLES_SQL);
  return drizzle(sqlite, { schema });
}

describe("Authentication", () => {
  let db: ReturnType<typeof drizzle>;
  // eslint_disable-next-line @typescript-eslint/no-explicit-any
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
      baseURL: "http://localhost:3000/api/auth",
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: { enabled: false },
      },
      trustedOrigins: ["http://localhost:3000"],
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
      expect(result.user.id).toBeDefined();
      expect(result.token).toBeDefined();
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

    it("should fail with short password", async () => {
      let errorCaught = false;
      try {
        await auth.api.signUpEmail({
          body: {
            email: faker.internet.email().toLowerCase(),
            password: "short",
            name: "Test",
          },
        });
      } catch (error: unknown) {
        errorCaught = true;
        expect(error).toBeDefined();
      }
      expect(errorCaught).toBe(true);
    });

    it("should fail with invalid email format", async () => {
      let errorCaught = false;
      try {
        await auth.api.signUpEmail({
          body: {
            email: "not-an-email",
            password: "ValidPassword123",
            name: "Test",
          },
        });
      } catch (error: unknown) {
        errorCaught = true;
        expect(error).toBeDefined();
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
      expect(result.user.email).toBe(email);
      expect(result.token).toBeDefined();
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

  describe("Session Management", () => {
    it("should get session after sign-in", async () => {
      const email = faker.internet.email().toLowerCase();
      const password = faker.internet.password({ length: 12 });

      await auth.api.signUpEmail({
        body: { email, password, name: "Test User" },
      });

      const signInRes = await auth.handler(
        new Request("http://localhost:3000/api/auth/sign-in/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }),
      );
      expect(signInRes.status).toBe(200);

      const setCookie = signInRes.headers.get("set-cookie");
      expect(setCookie).toBeDefined();

      const sessionRes = await auth.handler(
        new Request("http://localhost:3000/api/auth/get-session", {
          method: "GET",
          headers: { cookie: setCookie! },
        }),
      );
      expect(sessionRes.status).toBe(200);
      const sessionBody = await sessionRes.json();
      expect(sessionBody).not.toBeNull();
    });

    it("should return null for invalid session", async () => {
      const session = await auth.api.getSession({
        headers: {
          cookie: "better-auth.session_token=invalid-token",
        },
      });

      expect(session).toBeNull();
    });

    it("should sign out and invalidate session", async () => {
      const email = faker.internet.email().toLowerCase();
      const password = faker.internet.password({ length: 12 });

      await auth.api.signUpEmail({
        body: { email, password, name: "Test User" },
      });

      const signInRes = await auth.handler(
        new Request("http://localhost:3000/api/auth/sign-in/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }),
      );
      expect(signInRes.status).toBe(200);

      const setCookie = signInRes.headers.get("set-cookie")!;

      const signOutRes = await auth.handler(
        new Request("http://localhost:3000/api/auth/sign-out", {
          method: "POST",
          headers: { cookie: setCookie },
        }),
      );
      expect(signOutRes.status).toBe(200);

      const sessionRes = await auth.handler(
        new Request("http://localhost:3000/api/auth/get-session", {
          method: "GET",
          headers: { cookie: setCookie },
        }),
      );
      const sessionBody = await sessionRes.json();
      expect(sessionBody).toBeNull();
    });
  });

  describe("Handler", () => {
    it("should have a handler function", () => {
      expect(typeof auth.handler).toBe("function");
    });

    it("should handle sign-up via handler", async () => {
      const email = faker.internet.email().toLowerCase();
      const request = new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: "TestPassword123!",
          name: "Test User",
        }),
      });

      const response = await auth.handler(request);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.user.email).toBe(email);
    });

    it("should return 401 for sign-in with wrong password via handler", async () => {
      const email = faker.internet.email().toLowerCase();

      await auth.api.signUpEmail({
        body: { email, password: "CorrectPass123!", name: "Test" },
      });

      const request = new Request("http://localhost:3000/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "WrongPass123!" }),
      });

      const response = await auth.handler(request);
      expect(response.status).toBe(401);
    });

    it("should return 404 for unknown endpoint via handler", async () => {
      const request = new Request("http://localhost:3000/api/auth/nonexistent", {
        method: "GET",
      });

      const response = await auth.handler(request);
      expect(response.status).toBe(404);
    });
  });
});