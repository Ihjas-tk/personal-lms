import { defineConfig, devices } from "@playwright/test";

/**
 * Config for the README screenshots (`e2e/readme-capture.spec.ts`).
 *
 * Same isolation as the other Playwright configs: its own throwaway vault and an
 * explicit `LEARN_CURRICULUM`, on port 8799, never 8765 and never the learner's
 * `vault/`. A fourth vault path, so a README run cannot see a flow, capture or
 * demo run's seeded history:
 *
 *   npx playwright test -c playwright.readme.config.ts
 *
 * The run writes `docs/assets/{desk,module,attempt-compare,debrief,focus}.png`
 * directly. These are viewport shots, not full-page ones: the left rail is
 * sticky, so a full-page capture paints it wherever the tall page happens to put
 * it and a crop of the top 900 px then shows it floating in the middle.
 *
 * The viewport is set on the project rather than top-level `use` because a
 * `devices[…]` spread in the project would otherwise win and force 1280×720.
 */
export const README_VAULT = "/tmp/learn-readme-vault";
/** The flagship track, relative to `cwd: ".."` (the `learn/` folder). */
export const TRACK = "../tracks/llm-engineering-and-evals/track.yaml";
export const README_PORT = 8799;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /readme-capture\.spec\.ts/,
  outputDir: "./e2e/.readme-results",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 180_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://127.0.0.1:${README_PORT}`,
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
      `rm -rf ${README_VAULT} && BROWSER=none LEARN_VAULT=${README_VAULT} ` +
      `LEARN_CURRICULUM=${TRACK} ` +
      `uv run uvicorn learn.main:app --host 127.0.0.1 --port ${README_PORT}`,
    cwd: "..",
    url: `http://127.0.0.1:${README_PORT}/api/health`,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 60_000,
  },
});
