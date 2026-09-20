import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";
import {
  DEMO_ANSWER,
  DEMO_CATEGORY,
  DEMO_CHECK,
  DEMO_DIAGNOSIS,
  DEMO_MARKS,
} from "./readme-answer";

/**
 * The five screenshots the root README embeds:
 * `docs/assets/{desk,module,attempt-compare,debrief,focus}.png`.
 *
 * Run it with its own config, which wipes and re-seeds a throwaway vault on port
 * 8799 — never 8765, never the learner's `vault/`:
 *
 *   cd learn/web && npx playwright test -c playwright.readme.config.ts
 *
 * Deliberately different from `ux-capture.spec.ts`, which is the design record
 * and stays full-page and two-scheme:
 *
 *   - viewport shots at 1440×900, `fullPage: false`, light only. The left rail is
 *     sticky, so a full-page capture of a tall page paints it halfway down and a
 *     crop of the top 900 px then shows it floating in the middle of the image.
 *   - each page is scrolled so the part the caption talks about is on screen.
 *   - the attempt is a real attempt at one named check, and the typed answer is a
 *     plausible partly-correct answer to *that* check, so the side-by-side is
 *     honest rather than a canned paragraph beside an unrelated prompt.
 *
 * No AI call leaves the machine: nothing here opens the AI menu or asks for a
 * second opinion.
 */

const VAULT = process.env.LEARN_README_VAULT ?? "/tmp/learn-readme-vault";
const SHOTS = path.resolve(import.meta.dirname, "../../../docs/assets");

const MODULE_A = "a1"; // Transformers from scratch
const MODULE_B = "b1"; // Error analysis first
const MODULE_C = "b2"; // Golden dataset — owns the `cap-golden-set` artefact
const TOPIC_A = "attention";

/** The check the compare screenshot and the demo GIF both use. */
const CHECK = DEMO_CHECK;

test.use({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  mkdirSync(SHOTS, { recursive: true });
});

/* ----------------------------------------------------------------- helpers */

/** One light viewport shot, straight into `docs/assets/`. */
async function shoot(page: Page, name: string): Promise<void> {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

/**
 * Scroll the window so one element sits `top` pixels below the top of the
 * viewport, then let the scroll settle. `scrollIntoView` would tuck the element
 * under the page header instead.
 */
async function scrollUnderTop(page: Page, text: string, top = 260): Promise<void> {
  await page
    .getByText(text, { exact: false })
    .first()
    .evaluate((el, offset) => {
      const y = el.getBoundingClientRect().top + window.scrollY - (offset as number);
      window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
    }, top);
  await page.waitForTimeout(400);
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

/** The topic note the module and focus screenshots render. */
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

/* ------------------------------------------------------------------- seed */

test("seed the throwaway vault", async ({ request }) => {
  test.setTimeout(180_000);

  // Start the plan ten weeks back so the week strip, the four-week gains and the
  // debrief's hours have a past to draw.
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

  /* --- session 1: a1, three attempts including an overconfident miss ------ */
  const a1Checks = (await checksOf(MODULE_A)).filter((c) => c.id !== CHECK);
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

  /* --- session 2: b1, two attempts --------------------------------------- */
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

  /* --- session 3: b2, one attempt, closed today -------------------------- */
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

  /* --- sources moved up the ladder, with real positions ------------------ */
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

  /* --- one capstone artefact in draft ------------------------------------ */
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

  /* --- the topic note the module and focus screenshots render ------------ */
  const note = await (await request.get(`/api/modules/${MODULE_A}/notes/${TOPIC_A}`)).json();
  const put = await request.put(`/api/modules/${MODULE_A}/notes/${TOPIC_A}`, {
    data: { body: NOTE_BODY, mtime_ns: note.mtime_ns, frontmatter: note.frontmatter },
  });
  expect(put.ok(), `note PUT: ${await put.text()}`).toBeTruthy();

  /* --- two unfiled jots, so the jot strip has something in it ------------ */
  for (const [stamp, text] of [
    ["42:10", "the mask is added, never multiplied - check this against the code"],
    ["58:04", "why 1/sqrt(d_head) and not 1/sqrt(d_model)? come back to this"],
  ])
    await request.post("/api/jots", {
      data: { module_id: MODULE_A, topic_id: TOPIC_A, stamp, text },
    });

  /* --- age everything so the re-test queue has content ------------------- */
  backdateModule(MODULE_A, 16);
  backdateModule(MODULE_B, 9);
  backdateModule(MODULE_C, 3);
  backdateSession(0, 9);
  backdateSession(1, 3);

  const due = await (await request.get("/api/review/due")).json();
  expect(due.length, "the re-test queue should not be empty after seeding").toBeGreaterThan(0);

  // The compare screenshot needs this one check still unattempted.
  const after = await (await request.get(`/api/modules/${MODULE_A}`)).json();
  const rope = (after.checks as { id: string; state: string }[]).find((c) => c.id === CHECK);
  expect(rope?.state, `${CHECK} must still be unattempted`).toBe("not_started");
});

/* -------------------------------------------------------------- the shots */

test("desk.png", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("The plan you wrote on Sunday")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What you can actually do" })).toBeVisible();
  await expect(page.locator(".ridge-col")).toHaveCount(6);
  await shoot(page, "desk");
});

test("module.png", async ({ page }) => {
  await page.goto(`/modules/${MODULE_A}?topic=${TOPIC_A}`);
  const card = page.locator("article.topic").filter({ hasText: /Causal self-attention/ }).first();
  await expect(card.getByRole("heading", { name: "Your note" })).toBeVisible();
  await expect(card.locator(".source").first()).toBeVisible();
  // The topic list is the thing the caption talks about, and it sits at the top.
  await page.evaluate(() => window.scrollTo(0, 0));
  await shoot(page, "module");
});

test("focus.png", async ({ page }) => {
  await page.goto(`/modules/${MODULE_A}?topic=${TOPIC_A}`);
  const card = page.locator("article.topic").filter({ hasText: /Causal self-attention/ }).first();
  await card.getByRole("button", { name: /^(Continue note|Start a note)$/ }).click();
  await expect(page.getByRole("dialog", { name: /^Note — / })).toBeVisible();
  await expect(page.locator(".jotstrip-line").first()).toBeVisible();
  await shoot(page, "focus");
  await page.getByRole("button", { name: "Done" }).click();
});

test("debrief.png", async ({ page }) => {
  await page.goto("/review/weekly");
  await expect(page.locator("[data-screen-label='Weekly debrief']")).toBeVisible();
  await expect(page.getByText(/Brier/).first()).toBeVisible();
  // The calibration block is the point of this screen; it sits below the sweep.
  await scrollUnderTop(page, "How well you know what you know");
  await shoot(page, "debrief");
});

test("attempt-compare.png", async ({ page, request }) => {
  await request.post("/api/sessions/discard", { data: {} });
  await request.post("/api/sessions/start", { data: { module_id: MODULE_A } });

  await page.goto(`/modules/${MODULE_A}/checks/${CHECK}`);
  await expect(page.getByText(/how sure are you/)).toBeVisible();

  // 50 → 70, in the UI's own five-point steps.
  const slider = page.getByRole("slider");
  await slider.focus();
  for (let i = 0; i < 4; i += 1) await slider.press("ArrowRight");
  await page.getByRole("button", { name: "Lock it in and start writing" }).click();

  const editor = page.locator('[data-testid="answer-editor"] .cm-content');
  await editor.click();
  await editor.pressSequentially(DEMO_ANSWER, { delay: 2 });

  await page.getByRole("button", { name: "Submit and freeze" }).click();
  await expect(page.locator(".compare-ref")).toBeVisible();

  const lines = page.getByRole("group", { name: /^Rubric line / });
  const count = await lines.count();
  for (let i = 0; i < count; i += 1)
    await lines.nth(i).getByRole("button", { name: DEMO_MARKS[i] ?? "missing" }).click();

  await page
    .getByRole("group", { name: "Overall score" })
    .getByRole("button", { name: "Partly" })
    .click();
  await page.getByLabel("What exactly differed from the reference?").fill(DEMO_DIAGNOSIS);
  await page.getByLabel("Error category").selectOption(DEMO_CATEGORY);

  // The frozen answer and the reference sit side by side at the top of the page.
  await page.evaluate(() => window.scrollTo(0, 0));
  await shoot(page, "attempt-compare");

  await request.post("/api/sessions/discard", { data: {} });
});
