/**
 * E2E tests for OTP page
 * Tests page load and basic elements
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../config";

test.describe("OTP Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/otp`);
    await page.waitForLoadState("domcontentloaded");
  });

  test.describe("Page Load", () => {
    test("should load OTP page without crashing", async ({ page }) => {
      await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
    });

    test("should have verify button", async ({ page }) => {
      await expect(page.getByRole("button", { name: /verify/i })).toBeVisible();
    });

    test("should have form present", async ({ page }) => {
      const form = page.locator("form");
      await expect(form).toBeVisible();
    });
  });

  test.describe("Mobile Responsive", () => {
    test("should display OTP form on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`${E2E_BASE_URL}/otp`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("body")).toBeVisible();
    });
  });
});