import { expect, test } from "@playwright/test";
import { deskTarget, discardSession } from "./helpers";

/**
 * Flow 1. The Desk on a vault with nothing in it, and the one thing it asks the
 * learner to do: start. Starting turns the page they land on into the session —
 * the rail foot is where the session lives now, and `SessionBar` is gone.
 *
 * This spec runs first (file order) because `first_run` is only true until a
 * session has been closed, and `04-wrapup` closes one.
 */
test.describe.configure({ mode: "serial" });

test("first run: the Desk offers one action and nothing is claimed yet", async ({
  page,
  request,
}) => {
  await discardSession(request);
  await page.goto("/");

  await expect(page.locator("[data-screen-label='Desk']")).toBeVisible();
  await expect(page.getByText("Your first session")).toBeVisible();
  await expect(page.getByRole("heading", { name: "First ten minutes" })).toBeVisible();

  // The three headline numbers on the real curriculum: nothing proved, nothing
  // shipped, the whole plan ahead.
  await expect(page.getByText("checks are yours")).toBeVisible();
  await expect(page.getByText("capstone artefacts exist")).toBeVisible();
  await expect(page.getByText("weeks left on the plan")).toBeVisible();

  // The ridge is drawn from the real six areas, and every column carries its text.
  const columns = page.locator(".ridge-col");
  await expect(columns).toHaveCount(6);
  for (const label of await columns.locator(".ridge-name").allTextContents())
    expect(label.trim().length).toBeGreaterThan(0);

  // Non-negotiable: no streak, no points, no badge, no single hero progress bar.
  await expect(page.getByText(/streak|points|badge/i)).toHaveCount(0);

  await expect(page.getByText("Not working yet.")).toBeVisible();
});

test("Start a session opens the module workspace with the session in the rail foot", async ({
  page,
  request,
}) => {
  await discardSession(request);
  const target = await deskTarget(request);
  await page.goto("/");

  await page.getByRole("button", { name: /^Start · about/ }).click();

  await expect(page).toHaveURL(new RegExp(`/modules/${target}$`));
  await expect(page.locator("[data-screen-label='Module workspace']")).toBeVisible();

  // The rail foot swapped from the idle slot to the session card.
  const rail = page.getByRole("navigation", { name: "Sections" });
  await expect(rail.getByLabel("Elapsed session time")).toBeVisible();
  await expect(rail.getByRole("button", { name: "Wrap up" })).toBeVisible();
  await expect(rail.getByRole("group", { name: "Session phase" })).toBeVisible();
  await expect(page.getByText("Not working yet.")).toHaveCount(0);

  // "The track" stays lit on a module page.
  await expect(rail.getByRole("link", { name: "The track" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  // Starting from the Desk means the module page is already the session's module.
  await expect(page.getByRole("button", { name: "Working here" })).toBeDisabled();
  await discardSession(request);
});
