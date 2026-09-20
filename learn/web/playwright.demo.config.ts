import { defineConfig, devices } from "@playwright/test";

/**
 * Config for the README demo recording (`e2e/demo-capture.spec.ts`).
 *
 * Same isolation as the other two Playwright configs — its own throwaway vault and an
 * explicit `LEARN_CURRICULUM`, on port 8799, never 8765 and never the learner's `vault/`.
 * A third vault path so a demo run cannot see a capture or a flow run's seeded history:
 *
 *   npx playwright test -c playwright.demo.config.ts
 *
 * The run leaves one WebM under `e2e/.demo-results/`; `tools/demo-gif.sh` turns the
 * newest one into `docs/assets/demo.gif`.
 */
export const DEMO_VAULT = "/tmp/learn-demo-vault";
/** The flagship track, relative to `cwd: ".."` (the `learn/` folder). */
export const TRACK = "../tracks/llm-engineering-and-evals/track.yaml";
export const DEMO_PORT = 8799;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /demo-capture\.spec\.ts/,
  outputDir: "./e2e/.demo-results",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 180_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://127.0.0.1:${DEMO_PORT}`,
    trace: "off",
    colorScheme: "light",
    video: { mode: "on", size: { width: 1280, height: 720 } },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
    },
  ],
  webServer: {
    command:
      `rm -rf ${DEMO_VAULT} && BROWSER=none LEARN_VAULT=${DEMO_VAULT} ` +
      `LEARN_CURRICULUM=${TRACK} ` +
      `uv run uvicorn learn.main:app --host 127.0.0.1 --port ${DEMO_PORT}`,
    cwd: "..",
    url: `http://127.0.0.1:${DEMO_PORT}/api/health`,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 60_000,
  },
});
