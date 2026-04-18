import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../../config";
import { signUpViaUI } from "../../../utils";

test.describe("Dashboard Index", () => {
  test.beforeEach(async ({ page }) => {
    await signUpViaUI(page);
  });
  test.describe("Dashboard Apps", () => {
    test("should render apps page when authenticated", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/apps`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/.*dashboard\/apps/);
    });

    test("should load without crashing", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/apps`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("body")).toBeVisible();
    });

    test("should support search params", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/apps?type=all&sort=asc`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/.*dashboard\/apps.*type=all/);
    });
  });
});