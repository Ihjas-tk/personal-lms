import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";

/**
 * Shared machinery for the redesign's browser flows. Everything here is either a
 * read of the throwaway vault on disk (the file is the truth; an API response is
 * not evidence on its own) or a `page.route` stub, so no run touches the network.
 */

export const MODULE = "a1";
/** The topic every note flow uses: it owns several sources and the first check. */
export const TOPIC = "attention";

/** The vault the config wipes and the server writes to. */
export const vaultDir = (): string => process.env.LEARN_E2E_VAULT ?? "/tmp/learn-e2e-vault";

export const topicNotePath = (moduleId = MODULE, topicId = TOPIC): string =>
  path.join(vaultDir(), "modules", moduleId, "notes", `${topicId}.md`);

export const readTopicNote = (moduleId = MODULE, topicId = TOPIC): string => {
  try {
    return readFileSync(topicNotePath(moduleId, topicId), "utf8");
  } catch {
    return "";
  }
};

/** Poll the file, not the "saved" indicator: the vault watcher clears the latter. */
export async function expectNoteOnDisk(
  text: string,
  moduleId = MODULE,
  topicId = TOPIC,
): Promise<void> {
  await expect
    .poll(() => readTopicNote(moduleId, topicId), { timeout: 20_000 })
    .toContain(text);
}

/* ------------------------------------------------------------- session state */

/** Leave no session open, whatever an earlier spec did. */
export async function discardSession(request: APIRequestContext): Promise<void> {
  await request.post("/api/sessions/discard", { data: {} });
}

/** Start a session on one module and return its id. */
export async function startSession(
  request: APIRequestContext,
  moduleId = MODULE,
): Promise<string> {
  await discardSession(request);
  const res = await request.post("/api/sessions/start", { data: { module_id: moduleId } });
  expect(res.ok(), `start session: ${await res.text()}`).toBeTruthy();
  return (await res.json()).id as string;
}

/** The module the Desk's own Start button will open (the warm-up's first item). */
export async function deskTarget(request: APIRequestContext): Promise<string> {
  const desk = await (await request.get("/api/desk")).json();
  return desk.warmup[0]?.module_id ?? desk.first_action?.module_id;
}

/* ------------------------------------------------------------------ the page */

/** Open a module workspace and wait for the syllabus to have rendered. */
export async function openModule(page: Page, moduleId = MODULE): Promise<void> {
  await page.goto(`/modules/${moduleId}`);
  await expect(page.locator("article.topic").first()).toBeVisible();
}

/** Expand one topic card by its title and wait for the three regions to be there. */
export async function expandTopic(page: Page, title: string | RegExp) {
  const card = page.locator("article.topic").filter({ hasText: title }).first();
  const head = card.locator("button.topic-head");
  if ((await head.getAttribute("aria-expanded")) !== "true") await head.click();
  await expect(head).toHaveAttribute("aria-expanded", "true");
  return card;
}

/** Open focus mode from a topic's note button and wait for the editor. */
export async function openFocus(page: Page, title: string | RegExp): Promise<void> {
  const card = await expandTopic(page, title);
  await card.getByRole("button", { name: /^(Continue note|Start a note)$/ }).click();
  await expect(page.getByRole("dialog", { name: /^Note — / })).toBeVisible();
  await page.locator('[data-testid="note-editor"] .cm-content').first().waitFor();
}

/** Type into the CodeMirror buffer at the end of whatever is already there. */
export async function typeIntoEditor(page: Page, text: string): Promise<void> {
  const content = page.locator('[data-testid="note-editor"] .cm-content').first();
  await content.click();
  await page.keyboard.press("ControlOrMeta+End");
  await content.pressSequentially(text, { delay: 8 });
}

/** Record every request of one method whose URL matches, for "PATCH observed" assertions. */
export function watchRequests(page: Page, method: string, fragment: string): string[] {
  const seen: string[] = [];
  page.on("request", (r) => {
    if (r.method() === method && r.url().includes(fragment)) seen.push(r.url());
  });
  return seen;
}

/* ------------------------------------------------------------------ AI stubs */

/** Make the AI menu usable and deterministic without a credential on this machine. */
export async function stubHealth(
  page: Page,
  body: { ai_available: boolean; ai_reason: string | null } = {
    ai_available: true,
    ai_reason: "ready",
  },
): Promise<void> {
  await page.route("**/api/health", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, vault_git: true, ...body }),
    });
  });
}

/** An SSE body of `event:`/`data:` frames, as `POST /api/ai/tidy` streams them (§7.1). */
export const sseBody = (frames: { event: string; data: unknown }[]): string =>
  frames.map((f) => `event: ${f.event}\ndata: ${JSON.stringify(f.data)}\n\n`).join("");

export async function stubSse(
  page: Page,
  glob: string,
  frames: { event: string; data: unknown }[],
): Promise<void> {
  await page.route(glob, async (route) => {
    await route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
      body: sseBody(frames),
    });
  });
}

/** Open the AI menu of whichever surface is showing and pick Tidy. */
export async function openTidy(page: Page): Promise<void> {
  await page.getByRole("button", { name: "AI ▾" }).last().click();
  await page.getByRole("menuitem", { name: /^Tidy/ }).click();
}

/* ---------------------------------------------------------------- vault ages */

/**
 * Move every submitted attempt `days` into the past. Re-test schedules are derived
 * from attempt dates, so this is how a fresh vault gets an overdue queue without
 * waiting two days for one.
 */
export function backdateAttempts(days: number, moduleId?: string): void {
  const modules = path.join(vaultDir(), "modules");
  let ids: string[];
  try {
    ids = moduleId ? [moduleId] : readdirSync(modules);
  } catch {
    return;
  }
  for (const id of ids) {
    const dir = path.join(modules, id, "attempts");
    let files: string[];
    try {
      files = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of files) {
      const file = path.join(dir, name);
      const text = readFileSync(file, "utf8");
      const shifted = text.replace(
        /^((?:started|submitted): '?)(\d{4}-\d{2}-\d{2})/gm,
        (_m, key: string, day: string) => {
          const moved = new Date(`${day}T00:00:00Z`);
          moved.setUTCDate(moved.getUTCDate() - days);
          return key + moved.toISOString().slice(0, 10);
        },
      );
      if (shifted !== text) writeFileSync(file, shifted);
    }
  }
}

/** Forty-plus words, so the wrap-up's reflection gate is satisfied. */
export const REFLECTION =
  "I rebuilt causal self-attention from memory twice and the second pass was quicker " +
  "because I stopped treating the mask and the softmax as one step. What I still cannot " +
  "do is merge the heads without stopping to reason about the reshape and transpose " +
  "order, so that is the first thing to drill when I next sit down at this module.";
