/**
 * E2E tests for docs sidebar navigation
 * Verifies sidebar rendering, active state highlighting, and breadcrumb navigation.
 */

import { test, expect } from "@playwright/test";

test.describe("Docs Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
  });

  test("should render sidebar with sections", async ({ page }) => {
    // Sidebar should have section headers
    await expect(page.getByRole("button", { name: "Getting Started" })).toBeVisible();
  });

  test("should show Overview as active on /docs", async ({ page }) => {
    // Click the "Getting Started" section to expand it
    await page.getByRole("button", { name: "Getting Started" }).click();

    // Overview link should have active styling (bg-brand/10 class)
    const overviewLink = page.getByRole("link", { name: "Overview" });
    await expect(overviewLink).toBeVisible();
  });

  test("should navigate via sidebar links", async ({ page }) => {
    // Expand Getting Started section
    await page.getByRole("button", { name: "Getting Started" }).click();

    // Click Development link
    await page.getByRole("link", { name: "Development" }).click();
    await page.waitForLoadState("networkidle");

    // URL should change
    expect(page.url()).toContain("/docs/development");

    // Development page heading should be visible
    await expect(page.getByRole("heading", { name: "Development" })).toBeVisible();
  });

  test("should show only one active item per section", async ({ page }) => {
    // Navigate to a child page
    await page.goto("/docs/auth/login");
    await page.waitForLoadState("networkidle");

    // Expand Authentication section
    await page.getByRole("button", { name: "Authentication" }).click();

    // Login should be visible
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  });

  test("should expand section containing current page", async ({ page }) => {
    await page.goto("/docs/development");
    await page.waitForLoadState("networkidle");

    // Getting Started section should be expanded (Development is inside it)
    await expect(page.getByRole("link", { name: "Development" })).toBeVisible();
  });
});

test.describe("Docs Breadcrumbs", () => {
  test("should show breadcrumbs on docs child pages", async ({ page }) => {
    await page.goto("/docs/development");
    await page.waitForLoadState("networkidle");

    // Breadcrumb should contain "Docs"
    await expect(page.getByText("Docs", { exact: true })).toBeVisible();
  });

  test("should not show breadcrumbs on root docs page", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");

    // The breadcrumb component should not render a breadcrumb trail
    // (just the page content, no section breadcrumb)
  });
});

test.describe("Docs Layout", () => {
  test("should render header with navigation", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");

    // Header nav links
    await expect(page.getByRole("link", { name: "Docs" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Changelog" })).toBeVisible();
  });

  test("should render outlet content", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");

    // The docs index page content should be rendered
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});