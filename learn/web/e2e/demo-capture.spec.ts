import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  DEMO_ANSWER,
  DEMO_CATEGORY,
  DEMO_DIAGNOSIS,
  DEMO_MARKS,
  DEMO_MODULE,
  DEMO_TOPIC,
} from "./readme-answer";

/**
 * The README demo loop: one whole check attempt, recorded as video.
 *
 * Runs against a throwaway vault on port 8799 — never 8765, never the learner's
 * `vault/` — started by `playwright.demo.config.ts`:
 *
 *   npx playwright test -c playwright.demo.config.ts
 *   bash ../tools/demo-gif.sh            # WebM → docs/assets/demo.gif
 *
 * Unlike the flow specs this one is paced for a human watching, not for speed:
 * every step is followed by a beat so the motion reads at 12 fps, and the answer
 * is typed a character at a time. The whole thing is aimed at 15-18 seconds.
 *
 * Nothing here is stubbed and no AI call is made: the second opinion is skipped
 * so the loop stays inside the "your own judgement" half of the screen.
 *
 * The check, the answer, the self-marks and the diagnosis all come from
 * `readme-answer.ts`, so the GIF and `docs/assets/attempt-compare.png` show the
 * same learner making the same mistake.
 */

const MODULE = DEMO_MODULE;
const TOPIC = DEMO_TOPIC;

/** A beat — long enough to see what just happened at 12 fps. */
const beat = (page: Page, ms = 700) => page.waitForTimeout(ms);

test.use({ viewport: { width: 1280, height: 720 }, colorScheme: "light" });

test("demo: one check attempt, end to end", async ({ page, request }) => {
  test.setTimeout(120_000);

  // A session, so the attempt belongs to one. Done over the API: the session
  // bookends are their own story and would double the length of the loop.
  await request.post("/api/sessions/discard", { data: {} });
  await request.post("/api/sessions/start", { data: { module_id: MODULE } });

  /* --- the module workspace, one topic open ------------------------------ */

  await page.goto(`/modules/${MODULE}?topic=${TOPIC}`);
  const card = page.locator("article.topic").filter({ hasText: /RoPE, RMSNorm/ }).first();
  await expect(card.getByRole("heading", { name: "Your note" })).toBeVisible();
  await beat(page, 700);

  /* --- open the first check ---------------------------------------------- */

  const openCheck = card.locator(".proof-row button").first();
  await openCheck.scrollIntoViewIfNeeded();
  await beat(page, 500);
  await openCheck.click();

  await expect(page.getByText(/how sure are you/)).toBeVisible();
  await beat(page, 600);

  /* --- stage 1: confidence, before the answer ---------------------------- */

  const slider = page.getByRole("slider");
  await slider.focus();
  for (let i = 0; i < 4; i += 1) {
    await slider.press("ArrowRight"); // 50 → 70, in the UI's own 5-point steps
    await page.waitForTimeout(150);
  }
  await beat(page, 600);
  await page.getByRole("button", { name: "Lock it in and start writing" }).click();

  /* --- stage 2: write it from memory ------------------------------------- */

  const editor = page.locator('[data-testid="answer-editor"] .cm-content');
  await expect(editor).toBeVisible();
  await beat(page, 600);
  await editor.click();
  await page.keyboard.type(DEMO_ANSWER, { delay: 11 });
  await beat(page, 700);

  await page.getByRole("button", { name: "Submit and freeze" }).click();

  /* --- stage 3: the reference appears, side by side ---------------------- */

  await expect(page.locator(".compare-ref")).toBeVisible();
  await beat(page, 1400); // the reveal is the point of the whole app, so hold on it

  const lines = page.getByRole("group", { name: /^Rubric line / });
  const count = await lines.count();
  for (let i = 0; i < count; i += 1) {
    await lines
      .nth(i)
      .getByRole("button", { name: DEMO_MARKS[i] ?? "missing" })
      .click();
    await page.waitForTimeout(240);
  }
  await beat(page, 400);

  await page
    .getByRole("group", { name: "Overall score" })
    .getByRole("button", { name: "Partly" })
    .click();
  await beat(page, 500);

  await page
    .getByLabel("What exactly differed from the reference?")
    .pressSequentially(DEMO_DIAGNOSIS, { delay: 6 });
  await beat(page, 350);
  await page.getByLabel("Error category").selectOption(DEMO_CATEGORY);
  await beat(page, 600);

  const record = page.getByRole("button", { name: "Record and move on" });
  await expect(record).toBeEnabled();
  await record.click();

  /* --- back to the topic, the ladder moved ------------------------------- */

  await expect(page.locator("article.topic").first()).toBeVisible();
  await beat(page, 1000);

  await request.post("/api/sessions/discard", { data: {} });
});
