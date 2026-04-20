import { defineConfig, devices } from "@playwright/test";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..", "..");

/**
 * Playwright configuration for E2E tests
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",

  /* Run tests in files in parallel */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI - single worker for SQLite safety */
  workers: process.env.CI ? 1 : 1,

  /* Reporter to use */
  reporter: [["html", { open: "never" }], ["list"]],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: "http://127.0.0.1:3000",

    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Video recording */
    video: "on-first-retry",

    /* Action timeout for slow environments */
    actionTimeout: 30000,
  },

  /* Configure projects for major browsers - chromium only for speed */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /*
   * Web server configuration:
   *
   * Servers are managed externally via Docker compose (see root docker-compose.app.yml).
   * Playwright expects services to be already running.
   *
   * Usage:
   *   npm run e2e      # Start E2E services and run tests
   *   npm run e2e:ui   # Start E2E services and run tests with UI
   *
   * Or manually:
   *   docker compose -f docker-compose.app.yml --profile e2e up --build -d --wait
   *   cd apps/e2e && npx playwright test
   *
   * Docker compose handles proper healthchecks (waits for HTTP 200),
   * unlike Playwright's webServer which accepts 4xx status codes.
   */
  webServer: undefined,
});
