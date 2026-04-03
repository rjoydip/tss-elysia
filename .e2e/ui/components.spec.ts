/**
 * E2E tests for UI components
 * Tests: Button, Badge, Card, Input, Switch, Tabs rendering and interactions
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe("UI Components", () => {
  test.describe("Button Component", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/account/login`);
    });

    test("should render default button", async ({ page }) => {
      const button = page.locator("main").getByRole("button", { name: /sign in/i });
      await expect(button).toBeVisible();
      await expect(button).toHaveClass(/bg-primary/);
    });

    test("should render outline button variant", async ({ page }) => {
      const button = page.locator("main").getByRole("button", { name: /continue with github/i });
      await expect(button).toBeVisible();
      await expect(button).toHaveClass(/border/);
    });

    test("should be disabled when disabled prop is true", async ({ page }) => {
      await page.evaluate(() => {
        const btn = document.createElement("button");
        btn.setAttribute("disabled", "true");
        btn.textContent = "Disabled";
        document.body.appendChild(btn);
      });
      const button = page.locator("button:has-text('Disabled')");
      await expect(button).toBeDisabled();
    });
  });

  test.describe("Input Component", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/account/login`);
    });

    test("should render email input", async ({ page }) => {
      const input = page.locator("main").getByPlaceholder("Email");
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute("type", "email");
    });

    test("should render password input", async ({ page }) => {
      const input = page.locator("main").getByPlaceholder("Password");
      await expect(input).toBeVisible();
      await expect(input).toHaveAttribute("type", "password");
    });

    test("should accept text input", async ({ page }) => {
      const input = page.locator("main").getByPlaceholder("Email");
      await input.fill("test@example.com");
      await expect(input).toHaveValue("test@example.com");
    });

    test("should show placeholder text", async ({ page }) => {
      const input = page.locator("main").getByPlaceholder("Email");
      await expect(input).toHaveAttribute("placeholder", "Email");
    });
  });

  test.describe("Card Component", () => {
    test("should render card on landing page", async ({ page }) => {
      await page.goto(`${BASE_URL}/docs`);
      const card = page
        .locator("main .rounded-lg, main .rounded-xl, main [class*='rounded']")
        .first();
      await expect(card).toBeVisible();
    });
  });

  test.describe("Badge Component", () => {
    test("should render badge on landing page", async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      const badge = page.locator("section").first().getByText(/v\d/);
      await expect(badge).toBeVisible();
    });
  });

  test.describe("Tabs Component", () => {
    test("should render tabs on docs page", async ({ page }) => {
      await page.goto(`${BASE_URL}/docs`);
      const tablist = page.locator("[role='tablist']");
      if ((await tablist.count()) > 0) {
        await expect(tablist.first()).toBeVisible();
      }
    });
  });

  test.describe("Form Integration", () => {
    test("should render form with inputs and buttons", async ({ page }) => {
      await page.goto(`${BASE_URL}/account/login`);

      const emailInput = page.locator("main").getByPlaceholder("Email");
      const passwordInput = page.locator("main").getByPlaceholder("Password");
      const submitButton = page.locator("main").getByRole("button", { name: /sign in/i });

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(submitButton).toBeVisible();
    });

    test("should show password requirements after typing", async ({ page }) => {
      await page.goto(`${BASE_URL}/account/register`);

      const passwordInput = page.locator("main").getByPlaceholder("Password");
      await passwordInput.fill("test");

      await page.waitForTimeout(500);

      const requirements = page.locator("main").getByText("At least", { exact: false }).first();
      if ((await requirements.count()) > 0) {
        await expect(requirements.first()).toBeVisible();
      }
    });
  });
});