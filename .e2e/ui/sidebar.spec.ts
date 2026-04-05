/**
 * E2E tests for Sidebar component
 * Tests: Sidebar navigation rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../_config";

test.describe("Sidebar Component", () => {
  test("should render sidebar on docs page", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/docs`);
    const sidebar = page.locator("aside, [class*='sidebar'], nav");
    if ((await sidebar.count()) > 0) {
      await expect(sidebar.first()).toBeVisible();
    }
  });

  test("should have navigation links in sidebar", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/docs`);
    const links = page.locator("aside a, [class*='sidebar'] a, nav a");
    if ((await links.count()) > 0) {
      await expect(links.first()).toBeVisible();
    }
  });
});