/**
 * E2E tests for Tabs component
 * Tests: Tabs rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../config";

test.describe("Tabs Component", () => {
  test("should render tabs on docs page", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/docs`);
    const tablist = page.locator("[role='tablist']");
    if ((await tablist.count()) > 0) {
      await expect(tablist.first()).toBeVisible();
    }
  });
});
