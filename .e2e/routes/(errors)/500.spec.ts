/**
 * E2E tests for error pages 500
 * Tests: Error page rendering and content verification
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../config";

test.describe("500 Internal Server Error Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/500`);
  });

  test("should display 500 error code", async ({ page }) => {
    await expect(page.getByText("500")).toBeVisible();
  });

  test("should display error message", async ({ page }) => {
    await expect(page.getByText(/Something went wrong/i)).toBeVisible();
  });

  test("should have Back to Home button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Back to Home/i })).toBeVisible();
  });

  test("should have Go Back button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Go Back/i })).toBeVisible();
  });
});