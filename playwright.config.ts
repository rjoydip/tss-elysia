import { defineConfig, devices } from "@playwright/test";

const host = process.env.HOST || "localhost";
const port = process.env.PORT || "3000";
const BASE_URL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./.e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `bun preview --host=${host} --port=${port}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
