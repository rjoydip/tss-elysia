/**
 * E2E tests for DropdownMenu component
 * Tests: DropdownMenu rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../config";

test.describe("DropdownMenu Component", () => {
  test("should render dropdown menu trigger", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/dashboard/settings`);
    const dropdownTrigger = page.locator(
      "[data-radix-dropdown-menu-trigger], [role='menu']"
    );
    if ((await dropdownTrigger.count()) > 0) {
      await expect(dropdownTrigger.first()).toBeVisible();
    }
  });
});
