import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
    actionTimeout: 10000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  outputDir: "test-results/",
  reporter: [["html", { outputFolder: "playwright-report" }]],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    env: {
      CLIENT_ID: "arsh-sandhu",
      // Dummy Supabase credentials to prevent the Supabase client from throwing
      // at import time. Tests use ?demo=true which bypasses all Supabase calls,
      // so no real backend connection is needed.
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder-key-for-e2e-tests",
    },
  },
});
