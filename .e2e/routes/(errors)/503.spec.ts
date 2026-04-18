/**
 * E2E tests for error pages 503
 * Tests: Error page rendering and content verification
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../config";

test.describe("503 Maintenance Error Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/503`);
  });

  test("should display 503 error code", async ({ page }) => {
    await expect(page.getByText("503")).toBeVisible();
  });

  test("should display maintenance message", async ({ page }) => {
    await expect(page.getByText(/under maintenance/i)).toBeVisible();
  });

  test("should have Learn more button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Learn more/i })).toBeVisible();
  });
});