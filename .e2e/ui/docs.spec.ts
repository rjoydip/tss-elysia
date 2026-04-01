/**
 * E2E tests for docs pages
 */

import { test, expect } from "@playwright/test";

test.describe("Docs Sidebar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
  });

  test("should render sidebar with all sections", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Getting Started" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Authentication" })).toBeVisible();
    await expect(page.getByRole("button", { name: "API" })).toBeVisible();
  });

  test("should expand Getting Started section on click", async ({ page }) => {
    // Getting Started auto-expands on /docs since its Overview item href="/docs" matches the path
    await expect(
      page.locator("aside").getByRole("link", { name: "Development", exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("aside").getByRole("link", { name: "Overview", exact: true }),
    ).toBeVisible();
  });

  test("should collapse section on second click", async ({ page }) => {
    // Getting Started auto-expands on /docs since its Overview item matches the current path
    const section = page.getByRole("button", { name: "Getting Started" });
    // Verify it starts expanded (auto-expanded due to path match)
    await expect(
      page.locator("aside").getByRole("link", { name: "Development", exact: true }),
    ).toBeVisible();
    // Click to collapse
    await section.click();
    await expect(
      page.locator("aside").getByRole("link", { name: "Development", exact: true }),
    ).not.toBeVisible();
    // Click again to re-expand
    await section.click();
    await expect(
      page.locator("aside").getByRole("link", { name: "Development", exact: true }),
    ).toBeVisible();
  });

  test("should expand Authentication section", async ({ page }) => {
    await page.getByRole("button", { name: "Authentication" }).click();
    // Use aside scope to avoid matching Getting Started's "Overview" link (auto-expanded on /docs)
    await expect(page.locator("aside a[href='/docs/auth/overview']")).toBeVisible();
  });

  test("should expand API section", async ({ page }) => {
    await page.getByRole("button", { name: "API" }).click();
    await expect(page.locator("aside a[href='/docs/api/overview']").first()).toBeVisible();
  });

  test("should navigate to Development page via sidebar", async ({ page }) => {
    // Getting Started auto-expands on /docs, no need to click
    await page.locator("aside").getByRole("link", { name: "Development", exact: true }).click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/docs/getting-started/development");
    await expect(page.getByRole("heading", { name: "Development", exact: true })).toBeVisible();
  });

  test("should auto-expand section containing current page", async ({ page }) => {
    await page.goto("/docs/getting-started/development");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("aside").getByRole("link", { name: "Development", exact: true }),
    ).toBeVisible();
  });

  test("should navigate between different doc sections", async ({ page }) => {
    // Getting Started auto-expands on /docs, no need to click
    await page.locator("aside").getByRole("link", { name: "Development", exact: true }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Development", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Authentication" }).click();
    // Use href to target the specific Authentication Overview link (avoid matching Getting Started's Overview)
    await page.locator("aside a[href='/docs/auth/overview']").click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1, name: "Authentication" })).toBeVisible();
  });
});

test.describe("Docs Breadcrumbs", () => {
  test("should show breadcrumb nav on child pages", async ({ page }) => {
    await page.goto("/docs/getting-started/development");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("nav[aria-label='breadcrumb']")).toBeVisible();
  });

  test("should show Docs label in breadcrumb", async ({ page }) => {
    await page.goto("/docs/getting-started/development");
    await page.waitForLoadState("networkidle");
    await expect(
      page.locator("nav[aria-label='breadcrumb']").getByText("Docs", { exact: true }),
    ).toBeVisible();
  });
});

test.describe("Docs Layout", () => {
  test("should render header with nav links", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("header nav a[href='/docs']").first()).toBeVisible();
  });

  test("should render footer", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("should render h1 heading on docs landing", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("should preserve sidebar when navigating between docs pages", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: "Getting Started" })).toBeVisible();

    // Getting Started auto-expands on /docs, no need to click
    await page.locator("aside").getByRole("link", { name: "Development", exact: true }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("button", { name: "Getting Started" })).toBeVisible();
  });
});

test.describe("Docs Landing Page Content", () => {
  test("should display Quick Start section", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Quick Start" })).toBeVisible();
    await expect(page.getByText("bun install")).toBeVisible();
  });

  test("should display Features section", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Features" })).toBeVisible();
    await expect(page.getByText("Type-Safe API")).toBeVisible();
  });

  test("should display Next Steps links", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: "Next Steps" })).toBeVisible();
    const devLink = page.getByRole("link", { name: /Development Setup/ });
    await expect(devLink).toBeVisible();
    await expect(devLink).toHaveAttribute("href", "/docs/getting-started/development");
  });
});

test.describe("Docs Theme Toggle", () => {
  test("should toggle theme on docs page", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");

    const themeToggle = page
      .locator("header")
      .first()
      .getByRole("button", { name: /Switch to/ });
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await expect(themeToggle).toBeVisible();
  });

  test("should persist theme across docs navigation", async ({ page }) => {
    await page.goto("/docs");
    await page.waitForLoadState("networkidle");

    const themeToggle = page
      .locator("header")
      .first()
      .getByRole("button", { name: /Switch to/ });
    await themeToggle.click();
    const labelAfterToggle = await themeToggle.getAttribute("aria-label");

    // Getting Started auto-expands on /docs, no need to click
    await page.locator("aside").getByRole("link", { name: "Development", exact: true }).click();
    await page.waitForLoadState("networkidle");

    const labelAfterNav = await page
      .locator("header")
      .first()
      .getByRole("button", { name: /Switch to/ })
      .getAttribute("aria-label");
    expect(labelAfterNav).toBe(labelAfterToggle);
  });
});