import { defineConfig, devices } from "@playwright/test";

// Instant-navigation diagnostics run in development, not in production builds.
export default defineConfig({
  testDir: "tests/development",
  workers: 1,
  timeout: 300_000,
  reporter: "list",
  outputDir: "test-results/development",
  use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3200", trace: "retain-on-failure" },
  webServer: {
    command: "bun run dev --hostname 127.0.0.1 --port 3200",
    env: { SITE_URL: "http://127.0.0.1:3200" },
    url: "http://127.0.0.1:3200", reuseExistingServer: false, timeout: 120_000,
  },
});
