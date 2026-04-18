/**
 * E2E tests for Forgot Password page
 * Tests page load, form fields, navigation, and mobile responsive behavior
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../config";

test.describe("Forgot Password Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/forgot-password`);
    await page.waitForLoadState("domcontentloaded");
  });

  test.describe("Page Load", () => {
    test("should load forgot password page without crashing", async ({ page }) => {
      await expect(page.locator("form").first()).toBeVisible();
    });

    test("should display forgot password heading", async ({ page }) => {
      await expect(page.getByText(/forgot/i)).toBeVisible();
    });

    test("should have email input", async ({ page }) => {
      await expect(page.getByLabel("Email")).toBeVisible();
    });

    test("should have continue button", async ({ page }) => {
      await expect(page.getByRole("button", { name: /continue/i })).toBeVisible();
    });

    test("should have sign up link", async ({ page }) => {
      await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
    });
  });

  test.describe("Form Submission - Empty Email", () => {
    test("should attempt submission with empty email", async ({ page }) => {
      await page.getByLabel("Email").fill("");
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForLoadState("domcontentloaded");
    });
  });

  test.describe("Form Submission - Invalid Email Format", () => {
    test("should attempt submission with invalid email", async ({ page }) => {
      await page.getByLabel("Email").fill("not-an-email");
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForLoadState("domcontentloaded");
    });

    test("should attempt submission with email missing @", async ({ page }) => {
      await page.getByLabel("Email").fill("testexample.com");
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForLoadState("domcontentloaded");
    });
  });

  test.describe("Navigation", () => {
    test("should have sign up link visible", async ({ page }) => {
      await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
    });
  });

  test.describe("Mobile Responsive", () => {
    test("should display forgot password form on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${E2E_BASE_URL}/forgot-password`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.getByLabel("Email")).toBeVisible();
    });
  });
});