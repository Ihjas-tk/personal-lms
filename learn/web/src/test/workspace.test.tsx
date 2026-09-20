import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import Module from "../screens/Module";
import { useStore } from "../store";
import { fixtures, stubApi } from "./server";

const mount = () =>
  render(
    <MemoryRouter initialEntries={["/modules/a1"]}>
      <Routes>
        <Route path="/modules/:id" element={<Module />} />
      </Routes>
    </MemoryRouter>,
  );

const strip = () => screen.getByRole("group", { name: "Topics" });

describe("module workspace (§3)", () => {
  beforeEach(() => {
    useStore.setState({ session: null, health: fixtures.health as never });
  });

  it("opens the topic in progress and moves the selection when a step is picked", async () => {
    stubApi();
    mount();

    await waitFor(() => expect(strip()).toBeInTheDocument());
    const steps = within(strip());
    const attention = steps.getByRole("button", { name: /Causal self-attention/ });
    const bpe = steps.getByRole("button", { name: /BPE tokenization/ });

    // `in_progress` wins the default, and the strip says which one you are on.
    expect(attention).toHaveAttribute("aria-pressed", "true");
    expect(bpe).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText(/You are on/)).toHaveTextContent("2 · Causal self-attention");
    expect(screen.getByText(fixtures.module.step_summary)).toBeInTheDocument();

    await userEvent.click(bpe);
    await waitFor(() => expect(bpe).toHaveAttribute("aria-pressed", "true"));
    expect(attention).toHaveAttribute("aria-pressed", "false");
  });

  it("shows source, note and proof for the expanded topic only", async () => {
    stubApi();
    mount();

    await waitFor(() => expect(screen.getByText("Source")).toBeInTheDocument());

    // The open topic carries all three regions…
    expect(screen.getByText("Your note")).toBeInTheDocument();
    expect(screen.getByText(/Proof — the check that closes this topic/)).toBeInTheDocument();
    expect(screen.getByText("video · 95 of 116 min")).toBeInTheDocument();
    expect(screen.getByText(/mask added before the softmax/)).toBeInTheDocument();
    expect(
      screen.getByText("Write multi-head causal self-attention from memory."),
    ).toBeInTheDocument();
    expect(screen.getByText("14 days overdue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Re-test" })).toBeInTheDocument();

    // …and the collapsed one carries none of them: one region set on the page.
    expect(screen.getAllByText("Source")).toHaveLength(1);
    expect(screen.queryByText("Explain BPE merges.")).toBeNull();
  });

  it("writes an empty note's copy rather than an empty box", async () => {
    stubApi();
    mount();
    await waitFor(() => expect(strip()).toBeInTheDocument());

    await userEvent.click(within(strip()).getByRole("button", { name: /BPE tokenization/ }));
    await waitFor(() =>
      expect(screen.getByText(/Nothing written here yet/)).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Start a note" })).toBeInTheDocument();
  });

  it("PATCHes the chore when its row is ticked", async () => {
    const { calls } = stubApi();
    mount();

    const chore = await screen.findByRole("checkbox", { name: /Rent a GPU/ });
    expect(chore).toHaveAttribute("aria-checked", "false");
    await userEvent.click(chore);

    await waitFor(() => {
      const patch = calls.find(
        (c) => c.init?.method === "PATCH" && c.url.includes("/chores/setup-gpu"),
      );
      expect(patch).toBeTruthy();
      expect(JSON.parse(String(patch?.init?.body))).toEqual({ done: true });
    });
  });

  it("lists the note files and what the module produces", async () => {
    stubApi();
    mount();

    await waitFor(() => expect(screen.getByText("All notes")).toBeInTheDocument());
    expect(screen.getByText("a1/attention.md")).toBeInTheDocument();
    expect(screen.getByText("a1/notes.md")).toBeInTheDocument();
    expect(screen.getByText("Things this module produces")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "The golden dataset" })).toHaveAttribute(
      "href",
      "/shipped",
    );
  });

  it("starts a session here without leaving the page", async () => {
    const { calls } = stubApi((url, init) =>
      url.endsWith("/api/sessions/start") && init?.method === "POST"
        ? new Response(
            JSON.stringify({
              id: "s1",
              module_id: "a1",
              started: "2026-09-19T18:00:00+00:00",
              closed: null,
              phase: "new",
              minutes: { new: 0, review: 0, build: 0 },
              elapsed_seconds: 0,
              warmup_skipped: false,
              open_attempt_path: null,
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          )
        : undefined,
    );
    mount();

    const cta = await screen.findByRole("button", { name: "Work here now" });
    await userEvent.click(cta);

    await waitFor(() =>
      expect(
        calls.some((c) => c.url.endsWith("/api/sessions/start") && c.init?.method === "POST"),
      ).toBe(true),
    );
    // The page stays put; the button simply reports that this is where the work is.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Working here" })).toBeDisabled(),
    );
  });
});
