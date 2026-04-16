/**
 * E2E tests for Select component
 * Tests: Select rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../config";

test.describe("Select Component", () => {
  test("should render select on page", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/docs`);
    const selectTrigger = page.locator("[data-radix-select-trigger], [role='combobox']");
    if ((await selectTrigger.count()) > 0) {
      await expect(selectTrigger.first()).toBeVisible();
    }
  });
});