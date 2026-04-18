import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../../config";
import { signUpViaUI } from "../../../utils";

test.describe("Dashboard Index", () => {
  test.beforeEach(async ({ page }) => {
    await signUpViaUI(page);
  });

  test.describe("Dashboard Users", () => {
    test("should render users page when authenticated", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/users`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/.*dashboard\/users/);
    });

    test("should load without crashing", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/users`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("body")).toBeVisible();
    });

    test("should support search params", async ({ page }) => {
      await page.goto(`${E2E_BASE_URL}/dashboard/users?page=1&pageSize=10`);
      await page.waitForLoadState("domcontentloaded");
      await expect(page).toHaveURL(/.*dashboard\/users.*page=1/);
    });
  });
});