import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

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
 * is typed a character at a time. The whole thing is aimed at 15–18 seconds.
 *
 * Nothing here is stubbed and no AI call is made: the second opinion is skipped
 * so the loop stays inside the "your own judgement" half of the screen.
 */

const MODULE = "a1"; // Transformers from scratch
const TOPIC = "attention";

/** Long enough to read on screen, short enough to type inside the loop. */
const ANSWER =
  "Scale QK^T by 1/sqrt(d_head), add the causal mask as -inf before the softmax, " +
  "then merge the heads with a transpose and a view.";

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
  const card = page.locator("article.topic").filter({ hasText: /Causal self-attention/ }).first();
  await expect(card.getByRole("heading", { name: "Your note" })).toBeVisible();
  await beat(page, 900);

  /* --- open the first check ---------------------------------------------- */

  const openCheck = card.locator(".proof-row button").first();
  await openCheck.scrollIntoViewIfNeeded();
  await beat(page, 500);
  await openCheck.click();

  await expect(page.getByText(/how sure are you/)).toBeVisible();
  await beat(page, 800);

  /* --- stage 1: confidence, before the answer ---------------------------- */

  const slider = page.getByRole("slider");
  await slider.focus();
  for (let i = 0; i < 4; i += 1) {
    await slider.press("ArrowRight"); // 50 → 70, in the UI's own 5-point steps
    await page.waitForTimeout(170);
  }
  await beat(page, 600);
  await page.getByRole("button", { name: "Lock it in and start writing" }).click();

  /* --- stage 2: write it from memory ------------------------------------- */

  const editor = page.locator('[data-testid="answer-editor"] .cm-content');
  await expect(editor).toBeVisible();
  await beat(page, 600);
  await editor.click();
  await page.keyboard.type(ANSWER, { delay: 35 });
  await beat(page, 900);

  await page.getByRole("button", { name: "Submit and freeze" }).click();

  /* --- stage 3: the reference appears, side by side ---------------------- */

  await expect(page.locator(".compare-ref")).toBeVisible();
  await beat(page, 1700); // the reveal is the point of the whole app — hold on it

  const lines = page.getByRole("group", { name: /^Rubric line / });
  const count = await lines.count();
  for (let i = 0; i < count; i += 1) {
    await lines
      .nth(i)
      .getByRole("button", { name: i === 1 ? "partial" : "met" })
      .click();
    await page.waitForTimeout(380);
  }
  await beat(page, 400);

  await page
    .getByRole("group", { name: "Overall score" })
    .getByRole("button", { name: "Partly" })
    .click();
  await beat(page, 500);

  await page
    .getByLabel("What exactly differed from the reference?")
    .pressSequentially("I had the mask as a multiplicative zero, not an additive -inf.", {
      delay: 18,
    });
  await beat(page, 500);
  await page.getByLabel("Error category").selectOption("off_by_one_masking");
  await beat(page, 800);

  const record = page.getByRole("button", { name: "Record and move on" });
  await expect(record).toBeEnabled();
  await record.click();

  /* --- back to the topic, the ladder moved ------------------------------- */

  await expect(page.locator("article.topic").first()).toBeVisible();
  await beat(page, 1300);

  await request.post("/api/sessions/discard", { data: {} });
});
