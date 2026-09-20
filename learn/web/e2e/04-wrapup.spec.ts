import { expect, test } from "@playwright/test";
import { MODULE, TOPIC, readTopicNote, startSession, watchRequests } from "./helpers";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i + 1}`).join(" ");

const CUE = "it is Tuesday after dinner";
const THEN = "re-derive the attention mask on paper for ten minutes";

/**
 * Flow 4. Wrap up is the only way a session ends: forty words or it does not close,
 * both halves of the if-then plan, and the jots the session left unfiled land in
 * their topic note on the way out. Afterwards the Desk leads with that plan.
 */
test.describe.configure({ mode: "serial" });

test("the close is held until forty words, then it files the jots and writes the plan", async ({
  page,
  request,
}) => {
  const sessionId = await startSession(request, MODULE);

  // One graded attempt in this session, through the staged API, so the summary
  // line has something to count.
  const opened = await (
    await request.post("/api/checks/a1-attention-flops/attempts", {
      data: { session_id: sessionId, confidence_pre: 60 },
    })
  ).json();
  await request.post("/api/attempts/freeze", {
    data: { attempt_path: opened.attempt_path, answer: "roughly 2 * n^2 * d per head" },
  });
  const graded = await request.post("/api/attempts/submit", {
    data: {
      attempt_path: opened.attempt_path,
      rubric: ["partial"],
      score: "partial",
      category: "statistical_reasoning",
      diagnosis: "I counted the softmax as free.",
    },
  });
  expect(graded.ok(), await graded.text()).toBeTruthy();

  const jot = await (
    await request.post("/api/jots", {
      data: {
        module_id: MODULE,
        topic_id: TOPIC,
        stamp: "42:10",
        text: "the mask is added, never multiplied",
      },
    })
  ).json();
  expect(jot.filed).toBeFalsy();

  await page.goto(`/modules/${MODULE}`);
  const files = watchRequests(page, "POST", "/api/jots/file");
  const closes = watchRequests(page, "POST", "/api/sessions/close");

  await page
    .getByRole("navigation", { name: "Sections" })
    .getByRole("button", { name: "Wrap up" })
    .click();

  const sheet = page.getByRole("dialog", { name: "Stand up well" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText(/1 check attempted/)).toBeVisible();

  const close = sheet.getByRole("button", { name: "Close the session" });
  await expect(close).toBeDisabled();

  await sheet.getByLabel("IF").fill(CUE);
  await sheet.getByLabel("THEN").fill(THEN);

  // Thirty-nine words is not enough, and the count says so rather than the button.
  await sheet.getByLabel(/What changed in your understanding/).fill(words(39));
  await expect(sheet.getByText("39 of 40 words.")).toBeVisible();
  await expect(close).toBeDisabled();

  await sheet.getByLabel(/What changed in your understanding/).fill(words(40));
  await expect(sheet.getByText("40 words — enough.")).toBeVisible();
  await expect(close).toBeEnabled();

  await expect(
    sheet.getByRole("button", { name: /^File \d+ jots? into their notes$/ }),
  ).toBeVisible();
  await close.click();

  // Closing files the jots first, then writes the session file.
  await expect(page.getByRole("dialog", { name: "Stand up well" })).toHaveCount(0);
  expect(files.length).toBe(1);
  expect(closes.length).toBe(1);

  await expect
    .poll(() => readTopicNote(), { timeout: 15_000 })
    .toContain("- [42:10] the mask is added, never multiplied");
  expect(readTopicNote()).toContain("## Jots");

  // Closing returns to the Desk, which now leads with the plan just written.
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("The plan you wrote on Sunday")).toBeVisible();
  await expect(page.getByText(`IF ${CUE} THEN I will ${THEN}`)).toBeVisible();
  await expect(page.getByText("Not working yet.")).toBeVisible();

  const unfiled = await (await request.get("/api/jots?unfiled=true")).json();
  expect(unfiled).toHaveLength(0);
});
