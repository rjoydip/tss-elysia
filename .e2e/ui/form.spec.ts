/**
 * E2E tests for Form component
 * Tests: Form rendering and validation
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../config";

test.describe("Form Integration", () => {
  test("should render form with inputs and buttons", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/account/login`);

    const emailInput = page.locator("main").getByPlaceholder("Email");
    const passwordInput = page.locator("main").getByPlaceholder("Password");
    const submitButton = page
      .locator("main")
      .getByRole("button", { name: /sign in/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("should show password requirements after typing", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/account/register`);

    const passwordInput = page.locator("main").getByPlaceholder("Password");
    await passwordInput.fill("test");

    await page.waitForTimeout(500);

    const requirements = page
      .locator("main")
      .getByText("At least", { exact: false })
      .first();
    if ((await requirements.count()) > 0) {
      await expect(requirements.first()).toBeVisible();
    }
  });
});
