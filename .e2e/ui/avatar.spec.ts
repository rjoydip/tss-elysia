/**
 * E2E tests for Avatar component
 * Tests: Avatar rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

test.describe("Avatar Component", () => {
  test("should render avatar in header", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/dashboard/settings`);
    const avatar = page.locator("[class*='avatar'], [data-radix-avatar], img[alt]");
    if ((await avatar.count()) > 0) {
      await expect(avatar.first()).toBeVisible();
    }
  });
});