/**
 * The three AI surfaces and the file-change stream. Split out of `api.ts` so the
 * plain request wrappers stay one screenful; every caller still imports from
 * `./api`, which re-exports everything here.
 */
import type { CritiqueResult, TidyStats } from "./types";
import { safeJson, sseStream as rawSseStream } from "./sse";

const BASE = "/api";

/** SSE over the `/api` prefix. */
export const sseStream = (path: string, init: RequestInit & { json?: unknown } = {}) =>
  rawSseStream(`${BASE}${path}`, init);

/* ------------------------------------------------------------------ AI */

export interface TidyHandlers {
  onDelta(text: string): void;
  onStats(stats: TidyStats): void;
  onRejected(reason: string): void;
  /** The checker refused the first pass; the server is streaming a second one from scratch. */
  onRetry?(reason: string): void;
  onDone(payload: { text?: string; stats?: TidyStats }): void;
  onError(message: string): void;
}

/** SSE contract §7.1: `delta`, `stats`, `retry`, `rejected`, `done`, `error`.
 *
 * Tidy and Restructure differ only in their endpoint and their body, so the frame
 * loop is written once here and both callers below hand it their own.
 */
async function noteStream(
  path: string,
  input: unknown,
  h: TidyHandlers,
  signal?: AbortSignal,
): Promise<void> {
  try {
    for await (const frame of sseStream(path, {
      method: "POST",
      json: input,
      signal,
    })) {
      const parsed = safeJson(frame.data);
      switch (frame.event) {
        case "delta":
          h.onDelta(typeof parsed === "string" ? parsed : ((parsed as { text?: string })?.text ?? frame.data));
          break;
        case "stats":
          h.onStats(parsed as TidyStats);
          break;
        case "retry":
          h.onRetry?.((parsed as { reason?: string })?.reason ?? frame.data);
          break;
        case "rejected":
          h.onRejected((parsed as { reason?: string })?.reason ?? frame.data);
          break;
        case "done":
          h.onDone((parsed as { text?: string; stats?: TidyStats }) ?? {});
          break;
        case "error":
          h.onError((parsed as { message?: string })?.message ?? frame.data);
          break;
        default:
          break;
      }
    }
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return;
    h.onError(err instanceof Error ? err.message : String(err));
  }
}

/** §7.1: copy-edit a note. The result is reviewed as a diff; nothing is written. */
export const tidy = (
  input: { module_id: string; text: string },
  h: TidyHandlers,
  signal?: AbortSignal,
): Promise<void> => noteStream("/ai/tidy", input, h, signal);

/** §7.1: re-lay a topic note out, with its module, topic and sources named on top. */
export const restructure = (
  input: { module_id: string; topic_id: string; text: string },
  h: TidyHandlers,
  signal?: AbortSignal,
): Promise<void> => noteStream("/ai/restructure", input, h, signal);

/** §7.2: one `done` event carrying the parsed structured critique. */
export async function critique(
  input: { attempt_path: string },
  h: { onDone(result: CritiqueResult): void; onError(message: string): void },
  signal?: AbortSignal,
): Promise<void> {
  try {
    for await (const frame of sseStream("/ai/critique", {
      method: "POST",
      json: input,
      signal,
    })) {
      const parsed = safeJson(frame.data);
      if (frame.event === "done") h.onDone(parsed as CritiqueResult);
      else if (frame.event === "error")
        h.onError((parsed as { message?: string })?.message ?? frame.data);
    }
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return;
    h.onError(err instanceof Error ? err.message : String(err));
  }
}

/** File-change notifications (§5.4). Returns an unsubscribe function. */
export function subscribeEvents(onChanged: (payload: unknown) => void): () => void {
  if (typeof EventSource === "undefined") return () => {};
  const es = new EventSource(`${BASE}/events`);
  const handler = (e: MessageEvent) => onChanged(safeJson(e.data));
  es.addEventListener("changed", handler as EventListener);
  es.addEventListener("message", handler as EventListener);
  return () => es.close();
}
