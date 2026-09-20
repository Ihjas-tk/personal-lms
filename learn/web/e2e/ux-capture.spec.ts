import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";
import { sseBody, stubHealth, stubSse } from "./helpers";

/**
 * Screenshot capture for the redesigned screens. Produces
 * `docs/ux/screens-v2/NN-name-{light,dark}.png`, full page, at 1440×900.
 *
 * Runs against the same isolated throwaway vault on port 8799 that the flow specs
 * use — never the learner's `vault/`, never 8765 — started by the config:
 *
 *   npx playwright test -c playwright.ux.config.ts
 *
 * No AI call ever leaves the machine: `/api/ai/tidy` and `/api/ai/critique` are
 * both stubbed with `page.route`.
 */

const VAULT = process.env.LEARN_UX_VAULT ?? "/tmp/learn-ux-vault";
const SHOTS = path.resolve(import.meta.dirname, "../../docs/ux/screens-v2");

const MODULE_A = "a1"; // Transformers from scratch — many checks and resources
const MODULE_B = "b1"; // Error analysis first
const MODULE_C = "b2"; // Golden dataset — owns the `cap-golden-set` artefact
const TOPIC_A = "attention";

test.use({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  mkdirSync(SHOTS, { recursive: true });
});

/* ----------------------------------------------------------------- helpers */

/**
 * Shot in both schemes, without reloading (the tokens swap live).
 *
 * `overlay` takes the viewport rather than the full page: focus mode, the wrap-up
 * sheet and the two dialogs are `position: fixed`, so a full-page shot photographs
 * the page scrolling out from under them and clips the sheet at the fold.
 */
/**
 * The first-run Desk draws its mark once, over 1.6 s. Wait for that one animation
 * to settle so no shot catches a half-drawn spiral; every other screen has none,
 * and this returns immediately there.
 */
async function settleMark(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const el = document.querySelector(".desk-mark .mark-path");
    if (!el) return;
    await Promise.all(el.getAnimations().map((a) => a.finished.catch(() => {})));
  });
}

async function shoot(page: Page, name: string, overlay = false): Promise<void> {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.waitForTimeout(350);
    await settleMark(page);
    await page.screenshot({
      path: path.join(SHOTS, `${name}-${scheme}.png`),
      fullPage: !overlay,
    });
  }
  await page.emulateMedia({ colorScheme: "light" });
}

/**
 * Shot in both schemes, re-running `setup` each time. Needed where the rendered
 * content itself is theme-dependent at mount: Shiki picks `github-light`/`dark`
 * and CodeMirror's merge view builds its own DOM when the dialog opens.
 */
async function shootFresh(
  page: Page,
  name: string,
  setup: (p: Page) => Promise<void>,
  overlay = false,
): Promise<void> {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await setup(page);
    await page.waitForTimeout(400);
    await settleMark(page);
    await page.screenshot({
      path: path.join(SHOTS, `${name}-${scheme}.png`),
      fullPage: !overlay,
    });
  }
  await page.emulateMedia({ colorScheme: "light" });
}

/** Shift `started:`/`submitted:` on every attempt of one module into the past. */
function backdateModule(moduleId: string, days: number): void {
  shiftDates(path.join(VAULT, "modules", moduleId, "attempts"), days);
}

/** Move one closed session back, so the four-week hours and the burn-up have a past. */
function backdateSession(index: number, days: number): void {
  const dir = path.join(VAULT, "sessions");
  const file = readdirSync(dir).sort()[index];
  if (file) shiftDates(dir, days, file);
}

function shiftDates(dir: string, days: number, only?: string): void {
  let files: string[];
  try {
    files = only ? [only] : readdirSync(dir);
  } catch {
    return;
  }
  for (const name of files) {
    const file = path.join(dir, name);
    const text = readFileSync(file, "utf8");
    const shifted = text.replace(
      /^((?:started|submitted|closed): '?)(\d{4}-\d{2}-\d{2})/gm,
      (_m, key: string, day: string) => {
        const moved = new Date(`${day}T00:00:00Z`);
        moved.setUTCDate(moved.getUTCDate() - days);
        return key + moved.toISOString().slice(0, 10);
      },
    );
    if (shifted !== text) writeFileSync(file, shifted);
  }
}

/** One attempt through the staged API: start, freeze, then grade. */
async function gradedAttempt(
  request: APIRequestContext,
  opts: {
    checkId: string;
    sessionId: string | null;
    confidence: number;
    score: "cant" | "partial" | "fluent";
    answer: string;
    rubric: ("met" | "partial" | "missing")[];
    category?: string | null;
    diagnosis?: string | null;
  },
): Promise<void> {
  const started = await (
    await request.post(`/api/checks/${opts.checkId}/attempts`, {
      data: { session_id: opts.sessionId, confidence_pre: opts.confidence },
    })
  ).json();
  const frozen = await request.post("/api/attempts/freeze", {
    data: { attempt_path: started.attempt_path, answer: opts.answer },
  });
  expect(frozen.ok(), `freeze ${opts.checkId}: ${await frozen.text()}`).toBeTruthy();
  const res = await request.post("/api/attempts/submit", {
    data: {
      attempt_path: started.attempt_path,
      rubric: opts.rubric,
      score: opts.score,
      category: opts.score === "fluent" ? null : (opts.category ?? "didnt_know"),
      diagnosis:
        opts.score === "fluent" ? null : (opts.diagnosis ?? "Did not match the reference."),
    },
  });
  expect(res.ok(), `submit ${opts.checkId}: ${await res.text()}`).toBeTruthy();
}

const REFLECTION_A =
  "I rebuilt causal self-attention from memory twice and the second pass was quicker because " +
  "I stopped treating the mask and the softmax as one step. What I still cannot do is merge " +
  "the heads without stopping to reason about the reshape and transpose order, so that is the " +
  "first thing to drill when I next sit down at this module, before I read anything new at all.";

const REFLECTION_B =
  "Reading a hundred traces by hand was slower and duller than I expected and also the only " +
  "thing that produced real categories. The open codes were far messier than the axial ones, " +
  "and collapsing them too early is exactly how I lost the retrieval failures last week. What " +
  "I cannot yet do is decide when a category is too broad without re-reading the raw traces.";

const REFLECTION_C =
  "I drafted the first fifty golden examples and immediately hit the provenance question: half " +
  "of them are synthetic and I had not written down which. The data card template forced the " +
  "split to be explicit. What I still cannot do is size the held-out judge slice without " +
  "guessing, so the next session starts with the sample-size arithmetic rather than more rows.";

/** The topic note the focus-mode and tidy screens render. */
const NOTE_BODY = [
  "## Scaled dot-product attention",
  "",
  "One head, with the causal mask added **before** the softmax, not after it:",
  "",
  "$$",
  "\\mathrm{Attention}(Q, K, V) = \\mathrm{softmax}\\!\\left(" +
    "\\frac{QK^{\\top}}{\\sqrt{d_k}} + M\\right)V",
  "$$",
  "",
  "where $M_{ij} = -\\infty$ for $j > i$ and $0$ otherwise. Writing the mask as a",
  "multiplicative zero is the bug I keep reintroducing: it leaks probability mass.",
  "",
  "```python",
  "import torch",
  "import torch.nn.functional as F",
  "",
  "",
  "def causal_attention(q, k, v):",
  '    """q, k, v: (batch, heads, tokens, d_head)."""',
  "    d_k = q.size(-1)",
  "    scores = q @ k.transpose(-2, -1) / d_k**0.5",
  "    tokens = scores.size(-1)",
  "    mask = torch.ones(tokens, tokens, dtype=torch.bool).tril()",
  "    scores = scores.masked_fill(~mask, float('-inf'))",
  "    return F.softmax(scores, dim=-1) @ v",
  "```",
  "",
  "### What I still cannot do",
  "",
  "- Merge the heads without stopping to reason about the reshape and transpose order.",
  "- Say from memory where the `1/sqrt(d_k)` scaling comes from, rather than that it is there.",
].join("\n");

/* ------------------------------------------------------------ 01 first run */

test("01 desk, first run", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Your first session")).toBeVisible();
  await expect(page.getByRole("heading", { name: "First ten minutes" })).toBeVisible();
  await shoot(page, "01-desk-first-run");
});

/* ------------------------------------------------------------------- seed */

test("seed the throwaway vault", async ({ request }) => {
  test.setTimeout(180_000);

  // Start the plan ten weeks back so the week strip, the four-week gains and the
  // debrief's hours have a past to draw. `plan.yaml` is the store's own file.
  const planFile = path.join(VAULT, "plan.yaml");
  let planText = "";
  try {
    planText = readFileSync(planFile, "utf8");
  } catch {
    planText = "";
  }
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - 70);
  const startDate = start.toISOString().slice(0, 10);
  writeFileSync(
    planFile,
    planText.includes("start_date")
      ? planText.replace(/^start_date:.*$/m, `start_date: '${startDate}'`)
      : `${planText}\nstart_date: '${startDate}'\n`,
  );

  await request.post("/api/sessions/discard", { data: {} });

  const checksOf = async (moduleId: string) =>
    (await (await request.get(`/api/modules/${moduleId}`)).json()).checks as { id: string }[];

  /* --- session 1: a1, three attempts including an overconfident miss --- */
  const a1Checks = await checksOf(MODULE_A);
  const s1 = await (
    await request.post("/api/sessions/start", { data: { module_id: MODULE_A } })
  ).json();

  await gradedAttempt(request, {
    checkId: a1Checks[0].id,
    sessionId: s1.id,
    confidence: 90,
    score: "cant",
    rubric: ["missing", "missing", "partial", "missing", "partial"],
    category: "off_by_one_masking",
    diagnosis:
      "I was certain and I was wrong: I applied the causal mask after the softmax with " +
      "zeros instead of before it with -inf, so probability mass leaked to future tokens.",
    answer:
      "Attention is the softmax of QK^T over sqrt(d_k), then multiply by V. The mask zeroes " +
      "the future positions after the softmax.",
  });
  await gradedAttempt(request, {
    checkId: a1Checks[1].id,
    sessionId: s1.id,
    confidence: 55,
    score: "partial",
    rubric: ["met", "partial", "missing"],
    category: "notation_shape",
    diagnosis: "I keep writing d_k where I mean d_head, and then the reshape goes wrong.",
    answer:
      "Roughly 2 N^2 d for the attention term; I could not say where it overtakes the MLP.",
  });
  await gradedAttempt(request, {
    checkId: a1Checks[2].id,
    sessionId: s1.id,
    confidence: 70,
    score: "fluent",
    rubric: ["met", "met", "met"],
    answer:
      "Byte-pair encoding merges the most frequent adjacent pair repeatedly; the merge list " +
      "is the model, and ties break on the earliest pair.",
  });

  await request.post("/api/sessions/close", {
    data: {
      reflection: REFLECTION_A,
      if_cue: "it is Sunday after breakfast",
      then_action: "re-derive the attention mask on paper for ten minutes",
      fatigue: 3,
      minutes: { new: 95, review: 35, build: 50 },
      errors: [
        {
          category: "notation_shape",
          diagnosis: "I keep writing d_k where I mean d_head, then the reshape goes wrong.",
        },
      ],
    },
  });

  /* --- session 2: b1, two attempts --- */
  const b1Checks = await checksOf(MODULE_B);
  const s2 = await (
    await request.post("/api/sessions/start", { data: { module_id: MODULE_B } })
  ).json();

  await gradedAttempt(request, {
    checkId: b1Checks[0].id,
    sessionId: s2.id,
    confidence: 45,
    score: "partial",
    rubric: ["met", "partial"],
    category: "conflated_two_things",
    diagnosis:
      "I collapsed open coding and axial coding into one pass, so the categories came out " +
      "of my head rather than out of the traces.",
    answer:
      "Read the traces, write a short note per failure, then group the notes into categories " +
      "and count them.",
  });
  await gradedAttempt(request, {
    checkId: b1Checks[1].id,
    sessionId: s2.id,
    confidence: 60,
    score: "fluent",
    rubric: ["met", "met"],
    answer:
      "Sample enough traces that the last twenty produce no new category; report the counts " +
      "per category alongside the raw open codes.",
  });

  await request.post("/api/sessions/close", {
    data: {
      reflection: REFLECTION_B,
      if_cue: "I have finished the morning stand-up",
      then_action: "hand-read ten more traces and open-code them without merging anything",
      fatigue: 2,
      minutes: { new: 40, review: 55, build: 25 },
      errors: [
        {
          category: "misremembered_mechanism",
          diagnosis:
            "I remembered the taxonomy as fixed up front; it is derived from the traces and " +
            "only stabilises once new traces stop producing new codes.",
        },
      ],
    },
  });

  /* --- session 3: b2, one attempt, closed today --- */
  const b2Checks = await checksOf(MODULE_C);
  const s3 = await (
    await request.post("/api/sessions/start", { data: { module_id: MODULE_C } })
  ).json();

  await gradedAttempt(request, {
    checkId: b2Checks[0].id,
    sessionId: s3.id,
    confidence: 85,
    score: "partial",
    rubric: ["met", "missing", "partial"],
    category: "statistical_reasoning",
    diagnosis:
      "I sized the held-out judge slice by feel rather than from the width of the interval " +
      "I actually need.",
    answer:
      "A golden set is 150-300 labelled examples with provenance, a stated real/synthetic " +
      "split and a held-out slice for the judge.",
  });

  await request.post("/api/sessions/close", {
    data: {
      reflection: REFLECTION_C,
      if_cue: "it is Tuesday and the laptop is already open",
      then_action: "work the sample-size arithmetic for the held-out judge slice",
      fatigue: 4,
      minutes: { new: 60, review: 30, build: 75 },
      errors: [],
    },
  });

  /* --- sources moved up the ladder, with real positions --- */
  const a1 = await (await request.get(`/api/modules/${MODULE_A}`)).json();
  const topic = (a1.topics as { id: string; sources: { id: string }[] }[]).find(
    (t) => t.id === TOPIC_A,
  );
  const sources = topic?.sources ?? [];
  await request.patch(`/api/modules/${MODULE_A}/resources/${sources[0].id}`, {
    data: { state: "read", minutes_delta: 95, position: 95 },
  });
  if (sources[1])
    await request.patch(`/api/modules/${MODULE_A}/resources/${sources[1].id}`, {
      data: { state: "reconstructed", minutes_delta: 240 },
    });
  if (sources[2])
    await request.patch(`/api/modules/${MODULE_A}/resources/${sources[2].id}`, {
      data: { state: "skimmed", minutes_delta: 30, position: 3 },
    });

  /* --- one capstone artefact in draft --- */
  await request.patch("/api/capstone", {
    data: {
      id: "cap-golden-set",
      state: "draft",
      path: "evals/golden/v0.3",
      notes:
        "62 of the target 150 rows written. Provenance column added; the real/synthetic split " +
        "is recorded per row but the data card is still a stub.",
      next_action: "Size the held-out judge slice, then write the data card.",
    },
  });

  /* --- the topic note the focus-mode screens render --- */
  const note = await (await request.get(`/api/modules/${MODULE_A}/notes/${TOPIC_A}`)).json();
  const put = await request.put(`/api/modules/${MODULE_A}/notes/${TOPIC_A}`, {
    data: { body: NOTE_BODY, mtime_ns: note.mtime_ns, frontmatter: note.frontmatter },
  });
  expect(put.ok(), `note PUT: ${await put.text()}`).toBeTruthy();

  /* --- two unfiled jots, so the strip and the wrap-up have something to file --- */
  for (const [stamp, text] of [
    ["42:10", "the mask is added, never multiplied — check this against the code"],
    ["58:04", "why 1/sqrt(d_head) and not 1/sqrt(d_model)? come back to this"],
  ])
    await request.post("/api/jots", {
      data: { module_id: MODULE_A, topic_id: TOPIC_A, stamp, text },
    });

  /* --- age everything so the re-test queue and the warm-up draw have content --- */
  backdateModule(MODULE_A, 16);
  backdateModule(MODULE_B, 9);
  backdateModule(MODULE_C, 3);
  backdateSession(0, 9);
  backdateSession(1, 3);

  const due = await (await request.get("/api/review/due")).json();
  expect(due.length, "the re-test queue should not be empty after seeding").toBeGreaterThan(0);
});

/* --------------------------------------------------------- 02–04 overview */

test("02 desk with data", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("The plan you wrote on Sunday")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What you can actually do" })).toBeVisible();
  await expect(page.locator(".ridge-col")).toHaveCount(6);
  await shoot(page, "02-desk");
});

test("03 the track", async ({ page }) => {
  await page.goto("/track");
  await expect(page.getByRole("heading", { name: "The track" })).toBeVisible();
  await expect(page.locator(".weekcell").first()).toBeVisible();
  await expect(page.locator(".row2").first()).toBeVisible();
  await shoot(page, "03-track");
});

test("04 module workspace, one topic expanded", async ({ page }) => {
  await page.goto(`/modules/${MODULE_A}?topic=${TOPIC_A}`);
  const card = page.locator("article.topic").filter({ hasText: /Causal self-attention/ }).first();
  await expect(card.getByRole("heading", { name: "Your note" })).toBeVisible();
  await expect(card.locator(".source").first()).toBeVisible();
  await shoot(page, "04-module-workspace");
});

/* ------------------------------------------------------------ 05–06 focus */

test("05–06 focus mode, side by side and popped out", async ({ page }) => {
  await page.goto(`/modules/${MODULE_A}?topic=${TOPIC_A}`);
  const card = page.locator("article.topic").filter({ hasText: /Causal self-attention/ }).first();
  await card.getByRole("button", { name: /^(Continue note|Start a note)$/ }).click();
  await expect(page.getByRole("dialog", { name: /^Note — / })).toBeVisible();
  await expect(page.locator(".jotstrip-line").first()).toBeVisible();
  await shoot(page, "05-focus-side-by-side", true);

  await page
    .getByRole("group", { name: "Note layout" })
    .getByRole("button", { name: "Pop-out jotter" })
    .click();
  await expect(page.getByRole("group", { name: "Pop-out jotter" })).toBeVisible();
  await shoot(page, "06-focus-popout", true);

  await page
    .getByRole("group", { name: "Note layout" })
    .getByRole("button", { name: "Side by side" })
    .click();
  await page.getByRole("button", { name: "Done" }).click();
});

/* --------------------------------------------------------- 07–09 attempt */

test("07–09 the three stages of an attempt", async ({ page, request }) => {
  await request.post("/api/sessions/discard", { data: {} });
  await request.post("/api/sessions/start", { data: { module_id: MODULE_A } });

  // The second opinion, stubbed: the sub-lines under the rubric are part of stage 3.
  await stubHealth(page);
  await page.route("**/api/ai/critique", async (route) => {
    await route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
      body: sseBody([
        {
          event: "done",
          data: {
            lines: [
              {
                rubric_index: 0,
                verdict: "met",
                evidence: "you scaled by 1/sqrt(d_head)",
                missing: "",
              },
              {
                rubric_index: 1,
                verdict: "partial",
                evidence: "the mask is there",
                missing: "you did not say it is added before the softmax",
              },
            ],
          },
        },
      ]),
    });
  });

  const module = await (await request.get(`/api/modules/${MODULE_A}`)).json();
  const fresh = (module.checks as { id: string; state: string; topic_id: string | null }[]).find(
    (c) => c.state === "not_started" && c.topic_id,
  );
  expect(fresh, "the seed should leave at least one unattempted check").toBeTruthy();

  await page.goto(`/modules/${MODULE_A}/checks/${fresh?.id}`);
  await expect(page.getByText(/how sure are you/)).toBeVisible();
  await shoot(page, "07-attempt-1-how-sure");

  const slider = page.getByRole("slider");
  await slider.focus();
  for (let i = 0; i < 3; i += 1) await slider.press("ArrowRight");
  await page.getByRole("button", { name: "Lock it in and start writing" }).click();

  const editor = page.locator('[data-testid="answer-editor"] .cm-content');
  await editor.click();
  await editor.pressSequentially(
    "Scale by 1/sqrt(d_head), add the causal mask as -inf before the softmax, then merge " +
      "the heads back with a transpose and a view before the output projection.",
    { delay: 4 },
  );
  await shoot(page, "08-attempt-2-write");

  await page.getByRole("button", { name: "Submit and freeze" }).click();
  await expect(page.locator(".compare-ref")).toBeVisible();

  const lines = page.getByRole("group", { name: /^Rubric line / });
  const count = await lines.count();
  for (let i = 0; i < count; i += 1)
    await lines.nth(i).getByRole("button", { name: i === 0 ? "met" : "partial" }).click();
  await page
    .getByRole("group", { name: "Overall score" })
    .getByRole("button", { name: "Partly" })
    .click();
  await page
    .getByLabel("What exactly differed from the reference?")
    .fill("I wrote the mask as a multiplicative zero rather than an additive -inf.");
  await page.getByLabel("Error category").selectOption("off_by_one_masking");
  await page.getByRole("button", { name: "Ask for a second opinion" }).click();
  await expect(page.getByTestId("critique-0")).toBeVisible();
  await shoot(page, "09-attempt-3-compare");
});

/* ---------------------------------------------------------- 10 wrap up */

test("10 wrap up", async ({ page, request }) => {
  await page.goto(`/modules/${MODULE_A}`);
  await page
    .getByRole("navigation", { name: "Sections" })
    .getByRole("button", { name: "Wrap up" })
    .click();
  const sheet = page.getByRole("dialog", { name: "Stand up well" });
  await expect(sheet).toBeVisible();
  await sheet.getByLabel(/What changed in your understanding/).fill(REFLECTION_A);
  await sheet.getByLabel("IF").fill("it is Sunday after breakfast");
  await sheet.getByLabel("THEN").fill("re-derive the attention mask on paper for ten minutes");
  await expect(sheet.getByText(/words — enough\./)).toBeVisible();
  await shoot(page, "10-wrap-up", true);

  await sheet.getByRole("button", { name: "Keep working" }).click();
  await request.post("/api/sessions/discard", { data: {} });
});

/* ----------------------------------------------------- 11–13 the rest */

test("11 review, due now", async ({ page }) => {
  await page.goto("/review");
  await expect(page.locator("[data-screen-label='Review']")).toBeVisible();
  await expect(page.getByText(/overdue|missed while sure/).first()).toBeVisible();
  await shoot(page, "11-review");
});

test("12 sunday debrief", async ({ page }) => {
  await page.goto("/review/weekly");
  await expect(page.locator("[data-screen-label='Weekly debrief']")).toBeVisible();
  await expect(page.getByText(/Brier/).first()).toBeVisible();
  await shoot(page, "12-sunday-debrief");
});

test("13 shipped", async ({ page }) => {
  await page.goto("/shipped");
  await expect(page.getByRole("heading", { name: "Things that exist" })).toBeVisible();
  await expect(page.locator("article.artefact[data-draft='true']")).toHaveCount(1);
  await shoot(page, "13-shipped");
});

/* ------------------------------------------------------- 14–15 tidy */

const TIDY_FRAMES = [
  {
    event: "done",
    data: {
      text: NOTE_BODY.replace(
        "One head, with the causal mask added **before** the softmax, not after it:",
        "One head, with the causal mask added **before** the softmax — not after it:",
      ).replace("leaks probability mass.", "leaks probability mass across the sequence."),
      stats: { tokens_added: 4 },
    },
  },
];

const REFUSAL_FRAMES = [
  { event: "delta", data: { text: "Something entirely new." } },
  { event: "stats", data: { tokens_added: 240 } },
  { event: "rejected", data: { reason: "numbers differ: 1/sqrt(d_k) became 1/d_k" } },
];

async function openFocusAndTidy(page: Page): Promise<void> {
  await page.goto(`/modules/${MODULE_A}?topic=${TOPIC_A}`);
  const card = page.locator("article.topic").filter({ hasText: /Causal self-attention/ }).first();
  await card.getByRole("button", { name: /^(Continue note|Start a note)$/ }).click();
  await page.locator('[data-testid="note-editor"] .cm-content').first().waitFor();
  await page.getByRole("button", { name: "AI ▾" }).last().click();
  await page.getByRole("menuitem", { name: /^Tidy/ }).click();
}

test("14 tidy, the diff to review", async ({ page }) => {
  await stubHealth(page);
  await stubSse(page, "**/api/ai/tidy", TIDY_FRAMES);
  await shootFresh(
    page,
    "14-tidy-review",
    async (p) => {
      await openFocusAndTidy(p);
      await expect(p.getByTestId("merge-host")).toBeVisible();
    },
    true,
  );
});

test("15 tidy, refused", async ({ page }) => {
  await stubHealth(page);
  await stubSse(page, "**/api/ai/tidy", REFUSAL_FRAMES);
  await shootFresh(
    page,
    "15-tidy-refusal",
    async (p) => {
      await openFocusAndTidy(p);
      await expect(p.getByTestId("tidy-rejected")).toBeVisible();
    },
    true,
  );
});

/* ------------------------------------------------- 16 note conflict */

test("16 note conflict", async ({ page }) => {
  await shootFresh(
    page,
    "16-note-conflict",
    async (p) => {
      await p.goto(`/modules/${MODULE_A}?topic=${TOPIC_A}`);
      const card = p
        .locator("article.topic")
        .filter({ hasText: /Causal self-attention/ })
        .first();
      await card.getByRole("button", { name: /^(Continue note|Start a note)$/ }).click();
      const content = p.locator('[data-testid="note-editor"] .cm-content').first();
      await content.waitFor();

      const file = path.join(VAULT, "modules", MODULE_A, "notes", `${TOPIC_A}.md`);
      writeFileSync(
        file,
        `${readFileSync(file, "utf8")}\n\nEdited elsewhere while this was open.\n`,
      );

      await content.click();
      await p.keyboard.press("ControlOrMeta+End");
      await content.pressSequentially("\n\nand my own unsaved line.", { delay: 8 });
      await expect(p.locator(".conflict")).toBeVisible({ timeout: 20_000 });
      await p.getByRole("button", { name: "Reload the file and lose my edits" }).waitFor();
    },
    true,
  );
});

/* ------------------------------------------------ 17 AI unavailable */

test("17 AI unavailable", async ({ page }) => {
  await stubHealth(page, {
    ai_available: false,
    ai_reason: "No API credential found. Run `ant auth login`, or set `ANTHROPIC_API_KEY`.",
  });
  await shootFresh(page, "17-ai-unavailable", async (p) => {
    await p.goto(`/modules/${MODULE_A}?topic=${TOPIC_A}`);
    const card = p.locator("article.topic").filter({ hasText: /Causal self-attention/ }).first();
    await card.getByRole("button", { name: "AI ▾" }).click();
    await expect(p.getByRole("note")).toContainText("No API credential found");
    await expect(p.getByRole("menuitem").first()).toBeDisabled();
  });
});
