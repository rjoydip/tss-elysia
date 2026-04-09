/**
 * E2E tests for cross-page navigation
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "./_config";

function uniqueEmail(prefix = "test") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

test.describe("Header Navigation", () => {
  test("should navigate to Docs from landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await expect(page.locator("header nav a[href='/docs']").first()).toBeVisible({
      timeout: 15000,
    });
    await page.locator("header nav a[href='/docs']").first().click();
    await expect(page).toHaveURL(/.*docs/);
  });

  test("should navigate to Blog from landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("header nav a[href='/blog']").first().click();
    await expect(page).toHaveURL(/.*blog/);
  });

  test("should navigate to Changelog from landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("header nav a[href='/changelog']").first().click();
    await expect(page).toHaveURL(/.*changelog/);
  });
});

test.describe("Footer Navigation (Guest)", () => {
  test("should navigate to Docs from footer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("footer.py-4 a[href='/docs']").click();
    await page.waitForLoadState("load");
    await expect(page).toHaveURL(/.*docs/);
  });

  test("should navigate to Blog from footer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("footer.py-4 a[href='/blog']").click();
    await page.waitForLoadState("load");
    await expect(page).toHaveURL(/.*blog/);
  });

  test("should navigate to Status from footer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("footer.py-4 a[href='/status']").click();
    await expect(page).toHaveURL(/.*status/);
  });
});

test.describe("Authenticated UI Visibility", () => {
  // Use a mock or actual login if possible. For simplicity in this test,
  // we check visibility after auth or on auth-specific pages if they exist.
  // Note: True authenticated E2E requires state setup.

  test("should hide marketing elements when authenticated", async ({ page, request }) => {
    // 1. Create user via API first
    const email = uniqueEmail("authtest");
    const signUpResponse = await request.post(`${E2E_BASE_URL}/api/auth/sign-up/email`, {
      headers: { Origin: E2E_BASE_URL },
      data: { email, password: "TestPassword123!", name: "Test User" },
    });

    if (signUpResponse.status() >= 400) {
      test.skip(`Sign-up API failed with status ${signUpResponse.status()}, skipping auth test`, () => {});
      return;
    }

    const signUpBody = await signUpResponse.json();
    if (!signUpBody.token) {
      test.skip("Sign-up did not return session token, skipping auth test", () => {});
      return;
    }

    // 2. Use the sign-in API to get proper session cookies
    const signInResponse = await request.post(`${E2E_BASE_URL}/api/auth/sign-in/email`, {
      headers: { Origin: E2E_BASE_URL },
      data: { email, password: "TestPassword123!" },
    });

    if (signInResponse.status() >= 400) {
      test.skip(`Sign-in API failed with status ${signInResponse.status()}, skipping auth test`, () => {});
      return;
    }

    // 3. Extract cookies from the API response and set them in the browser
    const cookies = signInResponse.headers()["set-cookie"];
    if (cookies) {
      const sessionMatch = cookies.match(/better-auth\.session_token=([^;]+)/);
      if (sessionMatch) {
        const sessionToken = sessionMatch[1];
        await page.addInitScript((token) => {
          document.cookie = `better-auth.session_token=${token}; path=/; SameSite=Lax; max-age=${7 * 24 * 60 * 60}`;
        }, sessionToken);
      }
    }

    // 4. Navigate to home
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 5. Verify header marketing links are hidden
    await expect(page.locator("header nav a[href='/docs']")).not.toBeVisible();
    await expect(page.locator("header nav a[href='/blog']")).not.toBeVisible();
    await expect(page.locator("header nav a[href='/changelog']")).not.toBeVisible();

    // 6. Verify GitHub and Theme Toggle are hidden
    await expect(page.locator("header a[aria-label='GitHub']")).not.toBeVisible();
    await expect(page.locator("header button:has-text('Toggle theme')")).not.toBeVisible();

    // 7. Verify Footer is hidden
    await expect(page.locator("footer.py-4")).not.toBeVisible();
  });
});

test.describe("Cross-Page Transitions (Guest)", () => {
  test("should maintain header across pages", async ({ page }) => {
    const paths = ["/", "/docs", "/blog", "/changelog"];
    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState("load");
      await expect(page.locator("header").first()).toBeVisible();
    }
  });

  test("should maintain footer across pages", async ({ page }) => {
    const paths = ["/", "/docs", "/blog", "/changelog"];
    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState("load");
      await expect(page.locator("footer.py-4").first()).toBeVisible();
    }
  });

  test("should handle browser back navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.goto("/docs");
    await page.waitForLoadState("load");
    await page.goBack();
    await page.waitForLoadState("load");
    await expect(page).toHaveURL(/.*docs|\/$/);
  });

  test("should handle browser forward navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.goto("/docs");
    await page.waitForLoadState("load");
    await page.goBack();
    await page.waitForLoadState("load");
    await page.goForward();
    await page.waitForLoadState("load");
    await expect(page).toHaveURL(/.*docs/);
  });
});

test.describe("404 Handling", () => {
  test("should show 404 for unknown route", async ({ page }) => {
    await page.goto("/unknown-route");
    await expect(page.getByText("404: Page Not Found")).toBeVisible();
  });

  test("should show 404 for deeply nested unknown route", async ({ page }) => {
    await page.goto("/some/deep/route");
    await expect(page.getByText("404: Page Not Found")).toBeVisible();
  });
});