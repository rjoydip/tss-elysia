/**
 * E2E tests for authentication API
 */

import { test, expect, type APIRequestContext } from "@playwright/test";
import { E2E_BASE_URL } from "./config";

function uniqueEmail(prefix = "test") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function signUp(
  request: APIRequestContext,
  email: string,
  password = "TestPassword123!",
  name = "Test User",
) {
  return request.post("/api/auth/sign-up/email", {
    headers: { Origin: E2E_BASE_URL },
    data: { email, password, name },
  });
}

async function signIn(request: APIRequestContext, email: string, password = "TestPassword123!") {
  return request.post("/api/auth/sign-in/email", {
    headers: { Origin: E2E_BASE_URL },
    data: { email, password },
  });
}

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

  test("should return user id on registration", async ({ request }) => {
    const email = uniqueEmail("uid");
    const response = await signUp(request, email);
    const body = await response.json();
    expect(body.user.id).toBeDefined();
    expect(typeof body.user.id).toBe("string");
  });

  test("should return session token on registration", async ({ request }) => {
    const email = uniqueEmail("token");
    const response = await signUp(request, email);
    const body = await response.json();
    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe("string");
    expect(body.token.length).toBeGreaterThan(0);
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

  test("should reject email with spaces", async ({ request }) => {
    const response = await signUp(request, "user @example.com");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should reject empty email", async ({ request }) => {
    const response = await signUp(request, "");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should reject short password", async ({ request }) => {
    const response = await signUp(request, uniqueEmail("shortpw"), "short");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should reject empty password", async ({ request }) => {
    const response = await signUp(request, uniqueEmail("emptypw"), "");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should set emailVerified to false by default", async ({ request }) => {
    const email = uniqueEmail("verified");
    const response = await signUp(request, email);
    const body = await response.json();
    expect(body.user.emailVerified).toBe(false);
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

  test("should reject empty email on sign-in", async ({ request }) => {
    const response = await signIn(request, "");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should reject empty password on sign-in", async ({ request }) => {
    const response = await signIn(request, uniqueEmail("emptypwin"), "");
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should return JSON error body on failed sign-in", async ({ request }) => {
    const response = await signIn(request, "nobody@example.com");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toBeDefined();
  });
});

test.describe("Session Management", () => {
  test("should get session", async ({ request }) => {
    const response = await request.get("/api/auth/get-session", {
      headers: { Origin: E2E_BASE_URL },
    });
    expect(response.status()).toBe(200);
  });

  test("should sign out", async ({ request }) => {
    const response = await request.post("/api/auth/sign-out", {
      headers: { Origin: E2E_BASE_URL },
      data: {},
    });
    expect(response.status()).toBe(200);
  });

  test("should handle null session gracefully", async ({ request }) => {
    const email = uniqueEmail("session");
    await signUp(request, email);
    await request.post("/api/auth/sign-out", {
      headers: { Origin: E2E_BASE_URL },
      data: {},
    });
    const response = await request.get("/api/auth/get-session", {
      headers: { Origin: E2E_BASE_URL },
    });
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toBeDefined();
  });

  test("should list sessions", async ({ request }) => {
    const response = await request.get("/api/auth/list-sessions", {
      headers: { Origin: E2E_BASE_URL },
    });
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Auth Error Handling", () => {
  test("should reject PATCH method (405)", async ({ request }) => {
    const response = await request.fetch("/api/auth/sign-in/email", {
      method: "PATCH",
      headers: { Origin: E2E_BASE_URL, "Content-Type": "application/json" },
      data: JSON.stringify({ email: "test@test.com", password: "test" }),
    });
    expect(response.status()).toBe(405);
  });

  test("should handle OPTIONS preflight (CORS)", async ({ request }) => {
    const response = await request.fetch("/api/auth/sign-in/email", {
      method: "OPTIONS",
      headers: {
        Origin: E2E_BASE_URL,
        "Access-Control-Request-Method": "POST",
      },
    });
    // CORS preflight returns 204 (success) with CORS headers
    expect(response.status()).toBeLessThan(500);
  });

  test("should handle malformed JSON body", async ({ request }) => {
    const response = await request.fetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { Origin: E2E_BASE_URL, "Content-Type": "application/json" },
      data: "not valid json{",
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should handle empty body", async ({ request }) => {
    const response = await request.post("/api/auth/sign-up/email", {
      headers: { Origin: E2E_BASE_URL, "Content-Type": "application/json" },
      data: "",
    });
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test("should handle auth health endpoint", async ({ request }) => {
    const response = await request.get("/api/auth/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
  });
});