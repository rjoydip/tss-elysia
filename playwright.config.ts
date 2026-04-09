/**
 * Playwright End-to-End Testing Configuration
 *
 * Provides centralized settings for Playwright tests, including test directory,
 * parallelization, retries, and browser selection.
 *
 * @see https://playwright.dev/docs/test-configuration
 */

import { defineConfig, devices } from "@playwright/test";
import { isCI } from "std-env";
import { E2E_BASE_URL, E2E_HOST, E2E_PORT } from "./.e2e/_config";

export default defineConfig({
  testDir: "./.e2e",
  fullyParallel: true,
  forbidOnly: !!isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: isCI
    ? undefined
    : {
        command: `bun run preview --host=${E2E_HOST} --port=${E2E_PORT}`,
        url: E2E_BASE_URL,
        reuseExistingServer: !isCI,
        timeout: 120 * 1000,
      },
});