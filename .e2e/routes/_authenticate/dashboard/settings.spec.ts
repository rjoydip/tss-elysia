import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../../config";
import { signUpViaUI } from "../../../utils";

test.describe("Dashboard Index", () => {
  test.beforeEach(async ({ page }) => {
    await signUpViaUI(page);
  });
  test.describe("Dashboard Settings", () => {
    test("should render settings page when authenticated", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/settings`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/.*dashboard\/settings/);
    });

    test("should load without crashing", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/settings`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("body")).toBeVisible();
    });

    test("should have account settings", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/settings/account`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/.*dashboard\/settings\/account/);
    });

    test("should have appearance settings", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/settings/appearance`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/.*dashboard\/settings\/appearance/);
    });

    test("should have display settings", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/settings/display`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/.*dashboard\/settings\/display/);
    });

    test("should have notification settings", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/settings/notifications`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/.*dashboard\/settings\/notifications/);
    });
  });
});