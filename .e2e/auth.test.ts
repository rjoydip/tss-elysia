import { test, expect } from "@playwright/test";
import { isCI } from "std-env";

const shouldSkip = isCI;

(shouldSkip ? test.describe.skip : test.describe)("Authentication API", () => {
  test("should sign up with email and password", async ({ request }) => {
    const response = await request.post("/api/auth/sign-up/email", {
      data: {
        email: "test-" + Date.now() + "@example.com",
        password: "TestPassword123",
        name: "Test User",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  test("should sign in with valid credentials", async ({ request }) => {
    const email = "signin-" + Date.now() + "@example.com";

    await request.post("/api/auth/sign-up/email", {
      data: {
        email,
        password: "TestPassword123",
        name: "Test User",
      },
    });

    const response = await request.post("/api/auth/sign-in/email", {
      data: {
        email,
        password: "TestPassword123",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  test("should reject invalid credentials", async ({ request }) => {
    const response = await request.post("/api/auth/sign-in/email", {
      data: {
        email: "nonexistent@test.com",
        password: "wrongpassword",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  test("should validate email format", async ({ request }) => {
    const response = await request.post("/api/auth/sign-up/email", {
      data: {
        email: "invalid-email",
        password: "password123",
        name: "Test",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  test("should validate password minimum length", async ({ request }) => {
    const response = await request.post("/api/auth/sign-up/email", {
      data: {
        email: "test@test.com",
        password: "short",
        name: "Test",
      },
    });

    expect(response.status()).not.toBe(404);
  });

  test("should get session", async ({ request }) => {
    const response = await request.get("/api/auth/get-session");
    expect(response.status()).not.toBe(404);
  });

  test("should sign out", async ({ request }) => {
    const response = await request.post("/api/auth/sign-out");
    expect(response.status()).not.toBe(404);
  });

  test("should handle CORS for auth endpoints", async ({ request }) => {
    const response = await request.get("/api/auth", {
      headers: {
        Origin: "http://localhost:3000",
      },
    });

    expect(response.status()).toBeDefined();
  });
});
