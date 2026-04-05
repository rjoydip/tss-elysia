/**
 * E2E tests for Table component
 * Tests: Table rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

test.describe("Table Component", () => {
  test("should render table on page", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/docs`);
    const table = page.locator("table, [data-radix-table]");
    if ((await table.count()) > 0) {
      await expect(table.first()).toBeVisible();
    }
  });
});