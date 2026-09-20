import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteEditor, { type NoteEditorHandle } from "../components/NoteEditor";
import { fixtures, stubApi } from "./server";

const conflict = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 409,
    headers: { "content-type": "application/json" },
  });

describe("note autosave", () => {
  it("debounces the PUT and echoes the mtime_ns it loaded", async () => {
    const { calls } = stubApi();
    const handle: { current: NoteEditorHandle | null } = { current: null };
    render(<NoteEditor moduleId="a1" handleRef={handle} />);
    await waitFor(() => expect(handle.current).not.toBeNull());

    const puts = () => calls.filter((c) => c.init?.method === "PUT");
    handle.current!.setBody("first keystroke");
    handle.current!.setBody("second keystroke");
    expect(puts()).toHaveLength(0);

    await waitFor(() => expect(puts().length).toBeGreaterThan(0), { timeout: 5000 });
    expect(puts()).toHaveLength(1);
    const body = JSON.parse(String(puts()[0].init?.body));
    expect(body.mtime_ns).toBe(fixtures.note.mtime_ns);
    expect(body.body).toBe("second keystroke");
  });

  it("names the three exits when the server answers 409 (§6.2)", async () => {
    const current = { ...fixtures.note, body: "changed on disk", mtime_ns: 1758000000000000042 };
    const { calls } = stubApi((url, init) =>
      url.includes("/note") && init?.method === "PUT"
        ? conflict({ detail: "stale mtime_ns", current })
        : undefined,
    );

    const handle: { current: NoteEditorHandle | null } = { current: null };
    render(<NoteEditor moduleId="a1" handleRef={handle} />);
    await waitFor(() => expect(handle.current).not.toBeNull());

    handle.current!.setBody("my local edit");

    await waitFor(
      () =>
        expect(
          screen.getByText(/changed on disk since you opened it, so the save was refused/),
        ).toBeInTheDocument(),
      { timeout: 5000 },
    );
    for (const name of [
      "Keep mine and overwrite the file",
      "Reload the file and lose my edits",
      "Show me the difference first",
    ])
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    expect(screen.getByText(/save refused · a1\/notes.md · mtime mismatch/)).toBeInTheDocument();

    // Overwriting re-PUTs with the mtime_ns the 409 handed back, never the stale one.
    await userEvent.click(screen.getByRole("button", { name: "Keep mine and overwrite the file" }));
    await waitFor(() => {
      const last = calls.filter((c) => c.init?.method === "PUT").at(-1);
      expect(JSON.parse(String(last?.init?.body)).mtime_ns).toBe(current.mtime_ns);
    });
  });
});
