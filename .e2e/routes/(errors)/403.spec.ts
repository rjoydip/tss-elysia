/**
 * E2E tests for error pages 403
 * Tests: Error page rendering and content verification
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../config";

test.describe("403 Forbidden Error Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/403`);
  });

  test("should display 403 error code", async ({ page }) => {
    await expect(page.getByText("403")).toBeVisible();
  });

  test("should display forbidden message", async ({ page }) => {
    await expect(page.getByText(/Access Forbidden/i)).toBeVisible();
  });

  test("should have Back to Home button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Back to Home/i })).toBeVisible();
  });

  test("should have Go Back button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Go Back/i })).toBeVisible();
  });
});