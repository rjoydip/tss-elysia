import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../../config";
import { signUpViaUI } from "../../../utils";

test.describe("Dashboard Index", () => {
  test.beforeEach(async ({ page }) => {
    await signUpViaUI(page);
  });

  test("should render dashboard when authenticated", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/dashboard`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should load without crashing", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/dashboard`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("body")).toBeVisible();
  });
});