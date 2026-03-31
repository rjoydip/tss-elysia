import { test, expect } from "@playwright/test";

test.describe("Root Page UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display root page with title", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h3")).toHaveText("Welcome Home!");
  });

  test("should have navigation links", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "404" })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("should navigate to root", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Welcome Home!" })).toBeVisible();
  });

  test("should show 404 for unknown route", async ({ page }) => {
    await page.goto("/unknown-route");
    await expect(page.getByText("404: Page Not Found")).toBeVisible();
  });
});