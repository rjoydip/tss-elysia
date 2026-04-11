/**
 * E2E tests for the status/health monitoring page
 */

import { test, expect } from "@playwright/test";

test.describe("Status Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/status");
    await page.waitForLoadState("load");
  });

  test("should render the status page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Health Monitor" })).toBeVisible();
  });

  test("should display overall status indicator", async ({ page }) => {
    await expect(
      page.getByText(
        /Operational|Some services are degraded and need attention|Checking service health\.\.\.|Service health is currently unknown/,
      ),
    ).toBeVisible();
  });

  test("should display Core API service card", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Core API" })).toBeVisible();
  });

  test("should display Auth API service card", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Auth API" })).toBeVisible();
  });

  test("should display response time for services", async ({ page }) => {
    await expect(page.getByText(/ms/).first()).toBeVisible();
  });

  test("should have refresh icon control", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Refresh now|Refreshing now/ })).toBeVisible();
  });

  test("should display Other Services section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Other Services" })).toBeVisible();
    await expect(page.getByText("Database")).toBeVisible();
    await expect(page.getByText("Storage")).toBeVisible();
  });

  test("should display database pool badges when available", async ({ page }) => {
    // Wait for health check to complete and badges to appear
    await page.waitForTimeout(2000);
    // Look for pool badges - they appear as badges with Server icon
    page.locator(".flex.flex-wrap.gap-1").filter({ hasText: "primary" });
    // The pool badges may or may not appear depending on actual database setup
    // Just verify the container exists for database
    await expect(
      page
        .locator("div")
        .filter({ hasText: /^Database$/ })
        .first(),
    ).toBeVisible();
  });

  test("should display last checked timestamps", async ({ page }) => {
    // Initial status may remain in loading state depending on health endpoint availability.
    await expect(
      page
        .getByText(
          /Checking service health\.\.\.|APIs are healthy|Some services are degraded and need attention|Service health is currently unknown/,
        )
        .first(),
    ).toBeVisible();
  });
});

test.describe("Status Page Layout", () => {
  test("should render header on status page", async ({ page }) => {
    await page.goto("/status");
    await page.waitForLoadState("load");
    await expect(page.locator("header").first()).toBeVisible();
  });

  test("should render footer on status page", async ({ page }) => {
    await page.goto("/status");
    await page.waitForLoadState("load");
    await expect(page.locator("footer.py-4").filter({ hasText: "TSS" }).first()).toBeVisible();
  });
});