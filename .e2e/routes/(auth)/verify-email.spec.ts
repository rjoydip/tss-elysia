/**
 * E2E tests for Verify Email page
 * Tests page loads and handles different URL states
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../config";

test.describe("Verify Email Page", () => {
  test.describe("Page Load", () => {
    test("should load verify email page with token", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/verify-email?token=test-token`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
    });

    test("should load verify email page without token", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/verify-email`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("main")).toBeVisible();
    });

    test("should load verify email page with error param", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/verify-email?error=invalid-token`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("main")).toBeVisible();
    });
  });

  test.describe("Page Content", () => {
    test("should display email verification heading", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/verify-email`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.getByText(/email verification/i)).toBeVisible();
    });

    test("should have a card component", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/verify-email`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator(".card, [class*='card']").first()).toBeVisible();
    });
  });
});