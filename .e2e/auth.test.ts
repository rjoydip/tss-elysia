import { test, expect, type APIRequestContext } from "@playwright/test";
import { E2E_BASE_URL } from "./config";

const BASE_ORIGIN = E2E_BASE_URL;

function uniqueEmail(prefix = "test") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function signUp(request: APIRequestContext, email: string, password = "TestPassword123!") {
  return request.post("/api/auth/sign-up/email", {
    headers: { Origin: BASE_ORIGIN },
    data: { email, password, name: "Test User" },
  });
}

async function signIn(request: APIRequestContext, email: string, password = "TestPassword123!") {
  return request.post("/api/auth/sign-in/email", {
    headers: { Origin: BASE_ORIGIN },
    data: { email, password },
  });
}

test.describe("Authentication API", () => {
  test.describe("Sign Up", () => {
    test("should register a new user", async ({ request }) => {
      const email = uniqueEmail("signup");
      const response = await signUp(request, email);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe(email);
      expect(body.token).toBeDefined();
    });

    test("should reject duplicate email", async ({ request }) => {
      const email = uniqueEmail("dup");
      await signUp(request, email);

      const response = await signUp(request, email);
      expect([403, 422]).toContain(response.status());
    });

    test("should reject invalid email format", async ({ request }) => {
      const response = await signUp(request, "not-an-email");
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test("should reject short password", async ({ request }) => {
      const response = await signUp(request, uniqueEmail("shortpw"), "short");
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test("should reject missing name", async ({ request }) => {
      const response = await request.post("/api/auth/sign-up/email", {
        headers: { Origin: BASE_ORIGIN },
        data: { email: uniqueEmail("noname"), password: "TestPassword123!" },
      });
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe("Sign In", () => {
    test("should authenticate with valid credentials", async ({ request }) => {
      const email = uniqueEmail("signin");
      await signUp(request, email);

      const response = await signIn(request, email);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe(email);
      expect(body.token).toBeDefined();
    });

    test("should reject wrong password", async ({ request }) => {
      const email = uniqueEmail("wrongpw");
      await signUp(request, email);

      const response = await signIn(request, email, "WrongPassword999!");
      expect(response.status()).toBe(401);
    });

    test("should reject non-existent user", async ({ request }) => {
      const response = await signIn(request, "nobody@example.com");
      expect(response.status()).toBe(401);
    });
  });

  test.describe("Session", () => {
    test("should get session", async ({ request }) => {
      const response = await request.get("/api/auth/get-session", {
        headers: { Origin: BASE_ORIGIN },
      });
      expect(response.status()).toBe(200);
    });

    test("should sign out", async ({ request }) => {
      const response = await request.post("/api/auth/sign-out", {
        headers: { Origin: BASE_ORIGIN },
        data: {},
      });
      expect(response.status()).toBe(200);
    });
  });

  test.describe("CORS", () => {
    test("should return CORS headers", async ({ request }) => {
      const response = await request.get("/api/auth/get-session", {
        headers: { Origin: BASE_ORIGIN },
      });

      const allowOrigin = response.headers()["access-control-allow-origin"];
      expect(allowOrigin).toBeDefined();
    });

    test("should handle preflight OPTIONS", async ({ request }) => {
      const response = await request.fetch("/api/auth/sign-in/email", {
        method: "OPTIONS",
        headers: {
          Origin: BASE_ORIGIN,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });

      expect(response.status()).toBeLessThan(400);
      const allowMethods = response.headers()["access-control-allow-methods"];
      expect(allowMethods).toContain("POST");
    });
  });

  test.describe("Error Handling", () => {
    test("should reject unsupported HTTP method", async ({ request }) => {
      const response = await request.fetch("/api/auth/sign-in/email", {
        method: "PATCH",
        headers: { Origin: BASE_ORIGIN, "Content-Type": "application/json" },
        data: JSON.stringify({ email: "test@test.com", password: "test" }),
      });
      expect(response.status()).toBe(405);
    });

    test("should return JSON error body", async ({ request }) => {
      const response = await signIn(request, "nobody@example.com");
      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body).toBeDefined();
    });
  });
});
