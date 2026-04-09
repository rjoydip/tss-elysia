/**
 * E2E tests for cross-page navigation
 */

import { test, expect } from "@playwright/test";

test.describe("Header Navigation", () => {
  test("should navigate to Docs from landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("header nav a[href='/docs']").first().click();
    await expect(page).toHaveURL(/.*docs/);
  });

  test("should navigate to Blog from landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("header nav a[href='/blog']").first().click();
    await expect(page).toHaveURL(/.*blog/);
  });

  test("should navigate to Changelog from landing page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("header nav a[href='/changelog']").first().click();
    await expect(page).toHaveURL(/.*changelog/);
  });
});

test.describe("Footer Navigation", () => {
  test("should navigate to Docs from footer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("footer a[href='/docs']").click();
    await expect(page).toHaveURL(/.*docs/);
  });

  test("should navigate to Blog from footer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("footer a[href='/blog']").click();
    await expect(page).toHaveURL(/.*blog/);
  });

  test("should navigate to Status from footer", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.locator("footer a[href='/status']").click();
    await expect(page).toHaveURL(/.*status/);
  });
});

test.describe("Cross-Page Transitions", () => {
  test("should maintain header across pages", async ({ page }) => {
    const paths = ["/", "/docs", "/blog", "/changelog"];
    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState("load");
      await expect(page.locator("header").first()).toBeVisible();
    }
  });

  test("should maintain footer across pages", async ({ page }) => {
    const paths = ["/", "/docs", "/blog", "/changelog"];
    for (const path of paths) {
      await page.goto(path);
      await page.waitForLoadState("load");
      await expect(page.locator("footer").filter({ hasText: "TSS" }).first()).toBeVisible();
    }
  });

  test("should handle browser back navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.goto("/docs");
    await page.waitForLoadState("load");
    await page.goBack();
    await page.waitForLoadState("load");
    await expect(page).toHaveURL(/.*docs|\/$/);
  });

  test("should handle browser forward navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.goto("/docs");
    await page.waitForLoadState("load");
    await page.goBack();
    await page.waitForLoadState("load");
    await page.goForward();
    await page.waitForLoadState("load");
    await expect(page).toHaveURL(/.*docs/);
  });
});

test.describe("404 Handling", () => {
  test("should show 404 for unknown route", async ({ page }) => {
    await page.goto("/unknown-route");
    await expect(page.getByText("404: Page Not Found")).toBeVisible();
  });

  test("should show 404 for deeply nested unknown route", async ({ page }) => {
    await page.goto("/some/deep/route");
    await expect(page.getByText("404: Page Not Found")).toBeVisible();
  });
});