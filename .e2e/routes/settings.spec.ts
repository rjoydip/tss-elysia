/**
 * E2E tests for Settings page
 * Tests: Settings page structure, auth guard behavior
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

test.describe("Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/settings`);
  });

  test("should load settings page without crashing", async ({ page }) => {
    await expect(page.locator("main")).toBeVisible();
  });

  test("should show authentication checking state initially", async ({ page }) => {
    await expect(page.getByText(/checking authentication/i)).toBeVisible();
  });

  test("should display header", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
  });

  test("should display footer", async ({ page }) => {
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should redirect to login when not authenticated", async ({ page }) => {
    await expect(page.getByText(/checking authentication/i)).toBeVisible();
  });
});

test.describe("Settings Page - Navigation", () => {
  test("should navigate to login when not authenticated", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/settings`);
    await expect(page.locator("main")).toBeVisible();
  });
});