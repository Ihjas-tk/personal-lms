import { defineConfig, devices } from "@playwright/test";

/**
 * Config for the screenshot capture run (`e2e/ux-capture.spec.ts`).
 *
 * Same isolation as `playwright.config.ts` — its own throwaway vault, on port
 * 8799, never 8765 and never the learner's `vault/` — but on a separate vault so
 * a capture run and a flow run cannot see each other's seeded history:
 *
 *   npx playwright test -c playwright.ux.config.ts
 *
 * The viewport is set on the project (not top-level `use`) because a `devices[…]`
 * spread in the project would otherwise win and force 1280×720.
 */
export const UX_VAULT = "/tmp/learn-ux-vault";
export const UX_PORT = 8799;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /ux-capture\.spec\.ts/,
  outputDir: "./e2e/.ux-results",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 180_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://127.0.0.1:${UX_PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command:
      `rm -rf ${UX_VAULT} && BROWSER=none LEARN_VAULT=${UX_VAULT} ` +
      `uv run uvicorn learn.main:app --host 127.0.0.1 --port ${UX_PORT}`,
    cwd: "..",
    url: `http://127.0.0.1:${UX_PORT}/api/health`,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 60_000,
  },
});
