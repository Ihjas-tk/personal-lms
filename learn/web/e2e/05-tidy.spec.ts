import { expect, test } from "@playwright/test";
import {
  MODULE,
  expectNoteOnDisk,
  openFocus,
  openModule,
  openTidy,
  readTopicNote,
  startSession,
  stubHealth,
  stubSse,
  typeIntoEditor,
  watchRequests,
} from "./helpers";

const ORIGINAL = "the mask goes  before softmax";
const TIDIED = "The mask goes before softmax.";

/**
 * Flow 5. Tidy (§6.1), with `POST /api/ai/tidy` stubbed by `page.route`, so the
 * frame sequence is exactly the contract and nothing leaves the machine. Two
 * paths: the diff the learner accepts, and the refusal that is not a diff at all.
 */
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page, request }) => {
  await startSession(request, MODULE);
  await stubHealth(page);
});

test("accepting a tidy reviews it as a diff and PUTs the note", async ({ page }) => {
  await openModule(page);
  await openFocus(page, /Causal self-attention/);
  await typeIntoEditor(page, `\n\n${ORIGINAL}`);
  await expectNoteOnDisk(ORIGINAL);
  const before = readTopicNote();

  await stubSse(page, "**/api/ai/tidy", [
    { event: "delta", data: { text: TIDIED.slice(0, 12) } },
    { event: "delta", data: { text: TIDIED.slice(12) } },
    { event: "stats", data: { tokens_added: 0, input_tokens: 40, output_tokens: 38 } },
    { event: "done", data: { text: TIDIED, stats: { tokens_added: 0 } } },
  ]);

  const puts = watchRequests(page, "PUT", `/api/modules/${MODULE}/notes/`);

  await openTidy(page);
  await expect(page.getByTestId("merge-host")).toBeVisible();
  await expect(page.getByRole("button", { name: "Take all" })).toBeEnabled();

  await page.getByRole("button", { name: "Take all" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Tidy applied" })).toBeVisible();

  expect(puts.length).toBeGreaterThan(0);
  await expectNoteOnDisk(TIDIED);
  expect(readTopicNote()).not.toEqual(before);
});

test("a refused tidy is an alert with no diff, and the file is untouched", async ({ page }) => {
  await openModule(page);
  await openFocus(page, /Causal self-attention/);
  await typeIntoEditor(page, `\n\n${ORIGINAL} refusal-case`);
  await expectNoteOnDisk("refusal-case");
  const before = readTopicNote();

  await stubSse(page, "**/api/ai/tidy", [
    { event: "delta", data: { text: "Something entirely new." } },
    { event: "stats", data: { tokens_added: 240 } },
    { event: "rejected", data: { reason: "numbers differ: 1/sqrt(d_k) became 1/d_k" } },
  ]);

  const puts = watchRequests(page, "PUT", `/api/modules/${MODULE}/notes/`);

  await openTidy(page);
  const refusal = page.getByTestId("tidy-rejected");
  await expect(refusal).toBeVisible();
  await expect(refusal).toHaveAttribute("role", "alert");
  await expect(refusal).toContainText("numbers differ");
  await expect(refusal).toContainText("Your note was not touched");
  // There is nothing to take: the dialog never reaches the review phase.
  await expect(page.getByTestId("merge-host")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Take all" })).toHaveCount(0);

  await page.getByRole("button", { name: "Keep original", exact: true }).click();
  await expect(page.getByTestId("tidy-rejected")).toHaveCount(0);
  expect(puts).toHaveLength(0);
  expect(readTopicNote()).toEqual(before);
});
