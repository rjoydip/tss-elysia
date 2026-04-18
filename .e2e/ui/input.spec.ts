/**
 * E2E tests for Input component
 * Tests: Input rendering and interactions
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../config";

test.describe("Input Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/sign-in`);
  });

  test("should render email input", async ({ page }) => {
    const input = page.getByPlaceholder("name@example.com");
    await expect(input).toBeVisible();
  });

  test("should render password input", async ({ page }) => {
    const input = page.getByPlaceholder("********");
    await expect(input).toBeVisible();
  });

  test("should accept text input", async ({ page }) => {
    const input = page.getByPlaceholder("name@example.com");
    // Type through the controlled field the same way a user would so the form
    // state, validation, and rendered value stay synchronized in React.
    await input.click();
    await input.fill("test@example.com");
    await expect(input).toHaveValue("test@example.com");
  });

  test("should show placeholder text", async ({ page }) => {
    const input = page.getByPlaceholder("name@example.com");
    await expect(input).toHaveAttribute("placeholder", "name@example.com");
  });
});