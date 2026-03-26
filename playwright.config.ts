import { defineConfig, devices } from "@playwright/test";

const host = process.env.E2E_HOST || process.env.HOST || "localhost";
const port = process.env.E2E_PORT || process.env.PORT || "3000";
const E2E_BASE_URL = process.env.E2E_BASE_URL || `http://${host}:${port}`;

export default defineConfig({
  testDir: "./.e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
  webServer: {
    command: !process.env.CI ? `bun preview --host=${host} --port=${port}` : "",
    url: E2E_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
