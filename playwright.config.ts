import { defineConfig, devices } from "@playwright/test";
import { isCI } from "std-env";

const host = process.env.E2E_HOST || process.env.HOST || "localhost";
const port = process.env.E2E_PORT || process.env.PORT || "3000";
const E2E_BASE_URL = process.env.E2E_BASE_URL || `http://${host}:${port}`;

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
        command: `bun run src/api-server.ts --host=${host} --port=${port}`,
        url: E2E_BASE_URL,
        reuseExistingServer: !isCI,
        timeout: 120 * 1000,
      },
});
