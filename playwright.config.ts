import { defineConfig, devices } from "@playwright/test";
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  // Full-chapter routes got longer with the 40-minute chapters.
  timeout: 300000,
  use: { baseURL: externalBaseURL ?? "http://127.0.0.1:4173", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
    // Safari's engine, run with `npm run test:e2e:webkit`.
    {
      name: "webkit-desktop",
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    },
    {
      name: "webkit-mobile",
      use: { ...devices["iPhone 13"] },
    },
    // Firefox's engine, run with `npm run test:e2e:firefox`. Firefox has no
    // mobile emulation (isMobile), so the phone run is a narrow touch viewport.
    {
      name: "firefox-desktop",
      use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "firefox-mobile",
      use: { ...devices["Desktop Firefox"], viewport: { width: 390, height: 844 }, hasTouch: true },
    },
  ],
  webServer: externalBaseURL ? undefined : {
    command: "npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
