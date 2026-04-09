/**
 * E2E tests for Input component
 * Tests: Input rendering and interactions
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

test.describe("Input Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/account/login`);
  });

  test("should render email input", async ({ page }) => {
    const input = page.locator("main").getByPlaceholder("Email");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("type", "email");
  });

  test("should render password input", async ({ page }) => {
    const input = page.locator("main").getByPlaceholder("Password");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("type", "password");
  });

  test("should accept text input", async ({ page }) => {
    const input = page.locator("main").getByPlaceholder("Email");
    // Type through the controlled field the same way a user would so the form
    // state, validation, and rendered value stay synchronized in React.
    await input.click();
    await input.fill("test@example.com");
    await expect(input).toHaveValue("test@example.com");
  });

  test("should show placeholder text", async ({ page }) => {
    const input = page.locator("main").getByPlaceholder("Email");
    await expect(input).toHaveAttribute("placeholder", "Email");
  });
});