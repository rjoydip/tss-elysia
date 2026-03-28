import { test, expect } from "@playwright/test";

test.describe("Home Page UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display home page with title", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h3")).toHaveText("Welcome Home!");
  });

  test("should display welcome message", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Welcome Home!" })).toBeVisible();
  });

  test("should have navigation links", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "404" })).toBeVisible();
  });

  test("should have API link", async ({ page }) => {
    const apiLink = page.getByRole("link", { name: "/api" });
    await expect(apiLink).toBeVisible();
    await expect(apiLink).toHaveAttribute("href", "/api");
  });
});

test.describe("Navigation", () => {
  test("should navigate to home", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome Home!" })).toBeVisible();
  });

  test("should show 404 for unknown route", async ({ page }) => {
    await page.goto("/unknown-route");
    await expect(page.getByText("404: Page Not Found")).toBeVisible();
  });
});
