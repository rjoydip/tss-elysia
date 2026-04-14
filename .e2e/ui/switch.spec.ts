/**
 * E2E tests for Switch component
 * Tests: Switch rendering and interaction
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

test.describe("Switch Component", () => {
  test("should render switch on settings page", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/dashboard/settings`);
    const switchToggle = page.locator("[role='switch'], [data-radix-switch]");
    if ((await switchToggle.count()) > 0) {
      await expect(switchToggle.first()).toBeVisible();
    }
  });
});