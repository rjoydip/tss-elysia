/**
 * Common E2E utility functions for authentication
 */

import type { Page } from "@playwright/test";
import { E2E_BASE_URL } from "./config";

const TEST_PASSWORD = "TestPassword123!";

/**
 * Generates a unique email for E2E tests
 */
export function generateTestEmail(pageName: string): string {
  return `e2e-${pageName}-${Date.now()}@test.com`;
}

/**
 * Authenticates a user via UI sign-up form
 * navigates to sign-up page, fills form, submits, and waits for dashboard
 */
export async function signUpViaUI(
  page: Page,
  email?: string,
  name = "E2E Test User",
): Promise<boolean> {
  const testEmail = email ?? generateTestEmail("auth");

  await page.goto(`${E2E_BASE_URL}/sign-up`);
  await page.waitForLoadState("domcontentloaded");

  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(testEmail);
  await page.getByLabel("Password", { exact: true }).fill(TEST_PASSWORD);
  await page.getByLabel("Confirm Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();

  try {
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Logs in a user via UI sign-in form
 */
export async function signInViaUI(
  page: Page,
  email: string,
  password = TEST_PASSWORD,
): Promise<boolean> {
  await page.goto(`${E2E_BASE_URL}/sign-in`);
  await page.waitForLoadState("domcontentloaded");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  try {
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}