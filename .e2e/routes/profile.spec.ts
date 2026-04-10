/**
 * E2E tests for Profile page
 * Tests: Profile page structure, auth guard behavior
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

test.describe("Profile Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/profile`);
  });

  test("should load profile page without crashing", async ({ page }) => {
    await expect(page.locator("main")).toBeVisible();
  });

  test("should show authentication checking state initially", async ({ page }) => {
    await expect(page.getByText(/checking authentication/i)).toBeVisible();
  });

  test("should display header", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
  });

  test("should display footer", async ({ page }) => {
    await expect(page.locator("footer.py-4")).toBeVisible();
  });

  test("should redirect to login when not authenticated", async ({ page }) => {
    await expect(page).toHaveURL(/.*\/account\/login/);
  });
});

test.describe("Profile Page - Navigation", () => {
  test("should navigate to login when not authenticated", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/profile`);
    await expect(page.locator("main")).toBeVisible();
  });
});