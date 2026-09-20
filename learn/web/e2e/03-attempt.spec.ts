import { expect, test } from "@playwright/test";
import { MODULE, expandTopic, openModule, startSession, watchRequests } from "./helpers";

/**
 * Flow 3. The staged attempt, end to end: confidence before the editor exists,
 * the editor with paste off for a code check, the freeze that is the only thing
 * that reveals the reference, the self-grade beside it, and the record that
 * returns to the topic the check belongs to.
 */
test.describe.configure({ mode: "serial" });

test("confidence gate → write → freeze → grade → back on the module", async ({
  page,
  request,
}) => {
  await startSession(request, MODULE);
  await openModule(page);

  const freezes = watchRequests(page, "POST", "/api/attempts/freeze");
  const submits = watchRequests(page, "POST", "/api/attempts/submit");

  const card = await expandTopic(page, /Causal self-attention/);
  await card.getByRole("button", { name: /^(Attempt|Re-test)$/ }).first().click();

  await expect(page.locator("[data-screen-label='Check attempt']")).toBeVisible();
  await expect(page.getByText("reference not yet checked by you")).toBeVisible();

  /* -- stage 1: nothing else exists until the confidence is locked in -- */
  await expect(page.getByText(/how sure are you/)).toBeVisible();
  await expect(page.getByTestId("answer-editor")).toHaveCount(0);
  await expect(page.locator(".compare-ref")).toHaveCount(0);

  const lock = page.getByRole("button", { name: "Lock it in and start writing" });
  await expect(lock).toBeDisabled(); // untouched slider cannot be skipped past

  const slider = page.getByRole("slider");
  await slider.focus();
  for (let i = 0; i < 3; i += 1) await slider.press("ArrowRight");
  await expect(slider).toHaveValue("65");
  await expect(lock).toBeEnabled();
  await lock.click();

  /* -- stage 2: write from memory, with paste cancelled for a code check -- */
  const editor = page.locator('[data-testid="answer-editor"] .cm-content');
  await editor.waitFor();
  await expect(page.getByText(/sure: 65/)).toBeVisible();
  await expect(
    page.getByText("Paste and autocomplete are disabled for code checks"),
  ).toBeVisible();

  await editor.click();
  await editor.pressSequentially("scale by 1/sqrt(d_head), mask with -inf before the softmax", {
    delay: 5,
  });

  // A real paste event is cancelled: the buffer does not grow.
  const before = (await editor.textContent()) ?? "";
  await editor.evaluate((node) => {
    const data = new DataTransfer();
    data.setData("text/plain", "PASTED-FROM-THE-CLIPBOARD");
    node.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true }));
  });
  await expect(editor).toHaveText(before);
  expect(before).not.toContain("PASTED-FROM-THE-CLIPBOARD");

  // Still nothing revealed while the answer is open.
  await expect(page.locator(".compare-ref")).toHaveCount(0);
  await page.getByRole("button", { name: "Submit and freeze" }).click();

  /* -- stage 3: freezing is the reveal -- */
  await expect(page.getByText("What you wrote")).toBeVisible();
  await expect(page.locator(".compare-ref")).toBeVisible();
  await expect(page.locator(".compare-ref header")).toHaveText("The reference");
  await expect(page.getByTestId("reference")).toContainText(/\w/);
  expect(freezes.length).toBe(1);
  expect(submits.length).toBe(0); // the grade has not been sent yet

  const record = page.getByRole("button", { name: "Record and move on" });
  await expect(record).toBeDisabled();

  const lines = page.getByRole("group", { name: /^Rubric line / });
  const count = await lines.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1)
    await lines.nth(i).getByRole("button", { name: "partial" }).click();

  await page.getByRole("group", { name: "Overall score" }).getByRole("button", { name: "Partly" }).click();
  await expect(record).toBeDisabled(); // a diagnosis and a category are still missing

  await page
    .getByLabel("What exactly differed from the reference?")
    .fill("I wrote the mask as a multiplicative zero rather than an additive -inf.");
  await page.getByLabel("Error category").selectOption("off_by_one_masking");
  await expect(record).toBeEnabled();
  await record.click();

  /* -- recording returns to the module with the right topic open -- */
  await expect(page).toHaveURL(new RegExp(`/modules/${MODULE}\\?topic=attention`));
  await expect(page.locator("[data-screen-label='Module workspace']")).toBeVisible();
  const back = page.locator("article.topic").filter({ hasText: /Causal self-attention/ }).first();
  await expect(back.locator("button.topic-head")).toHaveAttribute("aria-expanded", "true");
  // One partial pass puts the check on the second rung: shaky, not untouched.
  await expect(back.getByText("shaky").first()).toBeVisible();
  await expect(back.getByText("in progress").first()).toBeVisible();
  expect(submits.length).toBe(1);

  // The session counted it, from the vault rather than from a browser tally.
  const session = await (await request.get("/api/sessions/current")).json();
  expect(session.checks_attempted).toBe(1);
  expect(session.errors_logged).toBe(1);
});
