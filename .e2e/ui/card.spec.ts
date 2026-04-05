/**
 * E2E tests for Card component
 * Tests: Card rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

test.describe("Card Component", () => {
  test("should render card on docs page", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/docs`);
    const card = page
      .locator("main .rounded-lg, main .rounded-xl, main [class*='rounded']")
      .first();
    await expect(card).toBeVisible();
  });
});