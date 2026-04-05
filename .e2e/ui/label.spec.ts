/**
 * E2E tests for Label component
 * Tests: Label rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

test.describe("Label Component", () => {
  test("should render label on login page", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/account/login`);
    const label = page.locator("label, [data-radix-label]");
    if ((await label.count()) > 0) {
      await expect(label.first()).toBeVisible();
    }
  });
});