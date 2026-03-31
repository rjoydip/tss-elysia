/**
 * E2E tests for the status/health monitoring page
 */

import { test, expect } from "@playwright/test";

test.describe("Status Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/status");
    await page.waitForLoadState("networkidle");
  });

  test("should render the status page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Health Monitor" })).toBeVisible();
  });

  test("should display overall status indicator", async ({ page }) => {
    await expect(
      page.getByText(/All Systems Operational|Degraded|Checking\.\.\./).first(),
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

  test("should have auto-refresh label", async ({ page }) => {
    await expect(page.getByText("Auto-refresh:")).toBeVisible();
  });

  test("should display Other Services section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Other Services" })).toBeVisible();
    await expect(page.getByText("Database")).toBeVisible();
    await expect(page.getByText("Storage")).toBeVisible();
    await expect(page.getByText("Realtime")).toBeVisible();
  });

  test("should display last checked timestamps", async ({ page }) => {
    await expect(page.getByText(/Last checked:/).first()).toBeVisible();
  });
});

test.describe("Status Page Layout", () => {
  test("should render header on status page", async ({ page }) => {
    await page.goto("/status");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("header").first()).toBeVisible();
  });

  test("should render footer on status page", async ({ page }) => {
    await page.goto("/status");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("footer")).toBeVisible();
  });
});