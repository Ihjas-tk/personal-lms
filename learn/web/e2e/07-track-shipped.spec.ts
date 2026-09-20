import { expect, test } from "@playwright/test";
import { discardSession, watchRequests } from "./helpers";

/**
 * Flow 7. The two screens that are about the plan rather than the work: pushing
 * the whole track back a week (soft dates are soft), and moving one artefact off
 * "not started" — the board is binary, so that is the only kind of progress on it.
 */
test.describe.configure({ mode: "serial" });

test("pushing everything back a week shifts the soft dates", async ({ page, request }) => {
  await discardSession(request);
  const before = await (await request.get("/api/track")).json();

  await page.goto("/track");
  await expect(page.locator("[data-screen-label='Track']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The track" })).toBeVisible();
  await expect(page.locator(".weekcell")).toHaveCount(before.weeks_total);
  await expect(page.getByText(/you are here/)).toBeVisible();

  const shifts = watchRequests(page, "POST", "/api/plan/shift");
  await page.getByRole("button", { name: "Push everything back a week" }).click();

  await expect
    .poll(async () => (await (await request.get("/api/track")).json()).offset_weeks)
    .toBe(before.offset_weeks + 1);
  expect(shifts.length).toBe(1);

  const after = await (await request.get("/api/track")).json();
  const dueBefore = before.this_phase.rows[0].due;
  const dueAfter = after.this_phase.rows[0].due;
  expect(new Date(dueAfter).getTime()).toBeGreaterThan(new Date(dueBefore).getTime());
});

test("Shipped is a queue of eight artefacts, and starting one changes its state", async ({
  page,
  request,
}) => {
  await page.goto("/shipped");
  await expect(page.locator("[data-screen-label='Capstone board']")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Things that exist" })).toBeVisible();

  const cards = page.locator("article.artefact");
  await expect(cards).toHaveCount(8);
  // Binary by design: no percentage anywhere on the board.
  await expect(page.getByText(/%/)).toHaveCount(0);

  const first = cards.first();
  const title = (await first.getByRole("heading").textContent()) ?? "";
  await expect(first.getByText("not started")).toBeVisible();
  await first.getByRole("button", { name: "Start" }).click();

  await expect(first.getByText("draft")).toBeVisible();
  await expect(first).toHaveAttribute("data-draft", "true");

  const board = await (await request.get("/api/capstone")).json();
  const saved = board.find((a: { title: string }) => a.title === title.trim());
  expect(saved.state).toBe("draft");

  // The rail badge counts artefacts that exist; a draft is not one of them.
  await expect(page.getByLabel(/of 8 artefacts exist/)).toBeVisible();
});
