/**
 * Minimal Server-Sent Events reader over `fetch`.
 *
 * `EventSource` cannot be used for `/api/ai/*` because those routes take a POST
 * body, so the frames are decoded by hand here. Frame grammar per the spec's
 * SSE contract: `event: <name>` + one or more `data:` lines, blank-line
 * terminated.
 */
import { ApiError } from "./error";

export interface SseEvent {
  event: string;
  data: string;
}

export async function* sseStream(
  url: string,
  init: RequestInit & { json?: unknown } = {},
): AsyncGenerator<SseEvent> {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers);
  headers.set("accept", "text/event-stream");
  if (json !== undefined) headers.set("content-type", "application/json");
  const res = await fetch(url, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok || !res.body) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* non-JSON error body */
    }
    const detail =
      (body as { detail?: string } | null)?.detail ?? `${res.status} ${res.statusText}`;
    throw new ApiError(res.status, detail, body);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split(/\r?\n\r?\n/);
    buf = parts.pop() ?? "";
    for (const raw of parts) {
      const frame = parseFrame(raw);
      if (frame) yield frame;
    }
  }
  buf += decoder.decode();
  const tail = parseFrame(buf);
  if (tail) yield tail;
}

function parseFrame(raw: string): SseEvent | null {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return null;
  let event = "message";
  const data: string[] = [];
  for (const line of lines) {
    if (line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    const value = colon === -1 ? "" : line.slice(colon + 1).replace(/^ /, "");
    if (field === "event") event = value;
    else if (field === "data") data.push(value);
  }
  if (data.length === 0 && event === "message") return null;
  return { event, data: data.join("\n") };
}

export function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
