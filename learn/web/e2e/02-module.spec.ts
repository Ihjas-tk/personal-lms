import { expect, test } from "@playwright/test";
import {
  MODULE,
  expandTopic,
  expectNoteOnDisk,
  openFocus,
  openModule,
  startSession,
  typeIntoEditor,
  watchRequests,
} from "./helpers";

/**
 * Flow 2. One module, one page: the syllabus of topics, the sidebar chores, and
 * focus mode for the note — jot a line with ⌘↵, stamp the source position into the
 * note, Done. Every write is asserted twice: the request the page made, and the
 * file the server wrote.
 */
test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ request }) => {
  await startSession(request, MODULE);
});

test("the syllabus expands one topic at a time and the step strip follows", async ({
  page,
}) => {
  await openModule(page);

  await expect(page.getByText(/things to cover\./)).toBeVisible();
  await expect(page.getByText(/\d+ proved · \d+ in progress · \d+ untouched/)).toBeVisible();

  const card = await expandTopic(page, /Causal self-attention/);
  await expect(card.getByRole("heading", { name: "Source" })).toBeVisible();
  await expect(card.getByRole("heading", { name: "Your note" })).toBeVisible();
  await expect(
    card.getByRole("heading", { name: /^Proof — the check that closes this topic/ }),
  ).toBeVisible();

  // One open at a time: expanding another closes this one.
  const other = await expandTopic(page, /Byte-pair encoding|BPE/);
  await expect(other.locator("button.topic-head")).toHaveAttribute("aria-expanded", "true");
  await expect(card.locator("button.topic-head")).toHaveAttribute("aria-expanded", "false");
});

test("ticking a set-up chore PATCHes it and the tick survives a reload", async ({ page }) => {
  await openModule(page);
  const patches = watchRequests(page, "PATCH", `/api/modules/${MODULE}/chores/`);

  const chore = page.getByRole("checkbox").first();
  await expect(chore).toHaveAttribute("aria-checked", "false");
  await chore.click();
  await expect(chore).toHaveAttribute("aria-checked", "true");
  expect(patches.length).toBeGreaterThan(0);

  await page.reload();
  await expect(page.getByRole("checkbox").first()).toHaveAttribute("aria-checked", "true");
});

test("focus mode: a jot with ⌘↵, a stamped timestamp, and Done closes it", async ({
  page,
}) => {
  await openModule(page);
  const jotPosts = watchRequests(page, "POST", "/api/jots");

  await openFocus(page, /Causal self-attention/);

  // The source sits beside the note, with its own position and a stamp button.
  await expect(page.getByRole("group", { name: "Source" })).toBeVisible();
  const stamp = page.getByRole("button", { name: /^Stamp .+ into the note$/ });
  await expect(stamp).toBeVisible();

  const line = `mask before the softmax ${Date.now()}`;
  const jot = page.getByLabel("Jot a line");
  await jot.click();
  await jot.fill(line);
  await jot.press("ControlOrMeta+Enter");

  await expect(page.locator(".jotstrip-line").filter({ hasText: line })).toBeVisible();
  expect(jotPosts.length).toBeGreaterThan(0);
  // It stays unfiled: the wrap-up is what writes it into the note.
  expect(await page.locator(".jotstrip-line").count()).toBeGreaterThan(0);

  // Stamping drops the position into the editor, which autosaves to the topic note.
  await stamp.click();
  await typeIntoEditor(page, "the mask is additive, not multiplicative");
  await expectNoteOnDisk("the mask is additive, not multiplicative");

  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("dialog", { name: /^Note — / })).toHaveCount(0);

  // Back on the workspace, the note is no longer empty.
  const card = await expandTopic(page, /Causal self-attention/);
  await expect(card.locator("pre.note-excerpt")).toContainText("additive");
});
