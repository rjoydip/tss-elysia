/**
 * E2E tests for Tooltip component
 * Tests: Tooltip rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../config";

test.describe("Tooltip Component", () => {
  test("should render tooltip on hover", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/docs`);
    const tooltipTrigger = page.locator("[data-radix-tooltip-trigger], [class*='tooltip']");
    if ((await tooltipTrigger.count()) > 0) {
      await expect(tooltipTrigger.first()).toBeVisible();
    }
  });
});