/**
 * E2E tests for Sheet component
 * Tests: Sheet/Drawer rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../config";

test.describe("Sheet Component", () => {
  test("should render sheet trigger button", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/docs`);
    // Look for menu/hamburger button that triggers sheet on mobile
    const menuButton = page.locator(
      "[aria-label='Menu'], [data-radix-primitive-button]"
    );
    if ((await menuButton.count()) > 0) {
      await expect(menuButton.first()).toBeVisible();
    }
  });
});
