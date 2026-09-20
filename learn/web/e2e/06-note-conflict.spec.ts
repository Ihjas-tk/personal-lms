import { readFileSync, writeFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import {
  MODULE,
  expectNoteOnDisk,
  openFocus,
  openModule,
  startSession,
  topicNotePath,
  typeIntoEditor,
} from "./helpers";

/**
 * Flow 6 (§6.2). Something else edits the file while the note is open. The save is
 * refused, never merged behind the learner's back, and the refusal offers three
 * exits each named for what it destroys. This walks the "Reload the file" one.
 */
test.describe.configure({ mode: "serial" });

const DISK_LINE = "Written by something else while the editor was open.";

test("a stale save is refused with three exits, and Reload takes the file", async ({
  page,
  request,
}) => {
  await startSession(request, MODULE);
  await openModule(page);
  await openFocus(page, /Causal self-attention/);

  await typeIntoEditor(page, "\n\nmine, before the clash");
  await expectNoteOnDisk("mine, before the clash");

  // Another writer gets there first: the file's mtime moves on under the editor.
  const file = topicNotePath();
  writeFileSync(file, `${readFileSync(file, "utf8")}\n${DISK_LINE}\n`);

  await typeIntoEditor(page, "\n\nmine, after the clash");

  const conflict = page.locator(".conflict");
  await expect(conflict).toBeVisible({ timeout: 20_000 });
  await expect(conflict).toHaveAttribute("role", "alert");
  await expect(
    conflict.getByText("This note changed on disk since you opened it, so the save was refused"),
  ).toBeVisible();
  await expect(conflict.getByText("save refused · a1/attention.md · mtime mismatch")).toBeVisible();

  // Three exits, each saying what it destroys.
  await expect(conflict.getByRole("button", { name: "Keep mine and overwrite the file" })).toBeVisible();
  await expect(conflict.getByRole("button", { name: "Reload the file and lose my edits" })).toBeVisible();
  const showDiff = conflict.getByRole("button", { name: "Show me the difference first" });
  await showDiff.click();
  await expect(page.getByTestId("conflict-diff")).toBeVisible();

  // Nothing has been written while the refusal stands.
  expect(readFileSync(file, "utf8")).toContain(DISK_LINE);
  expect(readFileSync(file, "utf8")).not.toContain("mine, after the clash");

  await conflict.getByRole("button", { name: "Reload the file and lose my edits" }).click();
  await expect(page.locator(".conflict")).toHaveCount(0);

  const editor = page.locator('[data-testid="note-editor"] .cm-content').first();
  await expect(editor).toContainText(DISK_LINE);
  await expect(editor).not.toContainText("mine, after the clash");
});
