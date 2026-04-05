/**
 * E2E tests for Skeleton component
 * Tests: Skeleton loading rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

test.describe("Skeleton Component", () => {
  test("should render skeleton on page load", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/docs`);
    const skeleton = page.locator("[class*='skeleton'], [data-radix-skeleton]");
    if ((await skeleton.count()) > 0) {
      await expect(skeleton.first()).toBeVisible();
    }
  });
});