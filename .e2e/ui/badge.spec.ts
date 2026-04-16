/**
 * E2E tests for Badge component
 * Tests: Badge rendering
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../config";

test.describe("Badge Component", () => {
  test("should render badge on landing page", async ({ page }) => {
    await page.goto(`${E2E_BASE_URL}/`);
    const badge = page.getByText(/Released/);
    await expect(badge).toBeVisible();
  });
});