import { defineConfig, devices } from "@playwright/test";

/**
 * Browser verification of the redesigned screens (plan §6), against the built app.
 *
 * Same pattern as `playwright.ux.config.ts`: an isolated throwaway vault on port
 * 8799, never the learner's `vault/` and never 8765, so a run can never collide
 * with the app they may have open. The vault is wiped when the server starts, so
 * every run begins on the real curriculum with nothing recorded.
 *
 * The flow specs share that one vault and run in file-name order (`01-…` first),
 * because the Desk's first-run state only exists until a session has been closed.
 */
export const VAULT = "/tmp/learn-e2e-vault";
export const PORT = 8799;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /\d\d-.*\.spec\.ts/,
  outputDir: "./e2e/.results",
  // One worker: every spec shares the one vault the server writes to.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    viewport: { width: 1440, height: 900 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      `rm -rf ${VAULT} && BROWSER=none LEARN_VAULT=${VAULT} ` +
      `uv run uvicorn learn.main:app --host 127.0.0.1 --port ${PORT}`,
    cwd: "..",
    url: `http://127.0.0.1:${PORT}/api/health`,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 60_000,
  },
});
