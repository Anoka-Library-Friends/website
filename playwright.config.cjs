const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
      // Only run navigation tests on mobile — page/a11y covered by desktop
      testMatch: '**/navigation.spec.js',
    },
  ],
  webServer: {
    // Build runs first so generated HTML (blog posts, injected markers) is fresh.
    // reuseExistingServer lets local dev skip rebuild when server already running.
    command: 'node scripts/build.js && node scripts/test-server.js',
    port: 4000,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
