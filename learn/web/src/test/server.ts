import { vi } from "vitest";
import fixtures from "./fixtures.json";

export { fixtures };

type Route = (url: string, init?: RequestInit) => unknown | undefined;

/** Installs a `fetch` stub that answers from the fixture JSON. */
export function stubApi(extra: Route = () => undefined) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const impl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    const custom = extra(url, init);
    if (custom !== undefined) return custom as Response;

    const body =
      url.endsWith("/api/health")
        ? fixtures.health
        : url.endsWith("/api/sessions/current")
        ? fixtures.session
        : url.endsWith("/api/desk")
        ? fixtures.desk
        : url.endsWith("/api/track")
        ? fixtures.track
        : url.includes("/api/jots")
          ? (init?.method === "POST" ? fixtures.jots[0] : fixtures.jots)
          : url.includes("/notes/")
            ? fixtures.topicNote
            : url.includes("/note")
              ? fixtures.note
              : url.includes("/api/checks/")
                ? fixtures.check
                : url.endsWith("/api/attempts/freeze")
                  ? fixtures.attemptFreeze
                  : url.endsWith("/api/attempts/submit")
                  ? fixtures.attemptSubmit
                  : url.includes("/api/modules/")
                    ? fixtures.module
                    : url.endsWith("/api/errors")
                      ? []
                      : url.endsWith("/api/review/due")
                        ? []
                        : {};
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", impl);
  return { calls, impl };
}

/** Builds a Response whose body is a text/event-stream of the given frames. */
export function sseResponse(frames: { event: string; data: unknown }[]): Response {
  const text = frames
    .map((f) => `event: ${f.event}\ndata: ${JSON.stringify(f.data)}\n\n`)
    .join("");
  return new Response(text, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}
