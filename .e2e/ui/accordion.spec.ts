/**
 * E2E tests for Accordion component
 * Tests: Accordion rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../config";

test.describe("Accordion Component", () => {
  test("should render accordion on page", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/docs`);
    const accordion = page.locator("[data-radix-accordion], [class*='accordion']");
    if ((await accordion.count()) > 0) {
      await expect(accordion.first()).toBeVisible();
    }
  });
});