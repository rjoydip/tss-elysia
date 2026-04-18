/**
 * E2E tests for error pages 401
 * Tests: Error page rendering and content verification
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../config";

test.describe("401 Unauthorized Error Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/401`);
  });

  test("should display 401 error code", async ({ page }) => {
    await expect(page.getByText("401")).toBeVisible();
  });

  test("should display unauthorized message", async ({ page }) => {
    await expect(page.getByText(/Unauthorized/i)).toBeVisible();
  });

  test("should have Back to Home button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Back to Home/i })).toBeVisible();
  });

  test("should have Go Back button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Go Back/i })).toBeVisible();
  });
});