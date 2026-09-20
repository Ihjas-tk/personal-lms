import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../api", () => ({
  patchTopicState: vi.fn(async (_m: string, _t: string, state: string | null) => ({
    id: "a1",
    patched: state,
  })),
}));

import TopicStateMenu from "../components/TopicStateMenu";
import { patchTopicState } from "../api";
import type { Topic } from "../types";

const topic = {
  id: "attention",
  title: "Causal self-attention",
  summary: "",
  kind: "idea",
  n: 1,
  state: "in_progress",
  derived_state: "in_progress",
  state_set_by_you: false,
  state_set_at: null,
  sources: [],
  note: { exists: false, path: "a1/attention.md", excerpt: "", updated: null },
  checks: [],
  proof_text: "0 of 0 solid",
} as unknown as Topic;

describe("TopicStateMenu", () => {
  it("lets the learner mark a topic done", async () => {
    const onChanged = vi.fn();
    render(<TopicStateMenu moduleId="a1" topic={topic} onChanged={onChanged} />);
    fireEvent.click(screen.getByRole("button", { name: /Topic state: in progress/ }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /done/ }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(patchTopicState).toHaveBeenCalledWith("a1", "attention", "proved");
  });

  it("offers to hand the state back to the checks once overridden", async () => {
    const onChanged = vi.fn();
    render(
      <TopicStateMenu
        moduleId="a1"
        topic={{ ...topic, state: "proved", state_set_by_you: true, state_set_at: "2026-09-20" }}
        onChanged={onChanged}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /set by you/ }));
    fireEvent.click(screen.getByRole("button", { name: /Let the checks decide/ }));
    await waitFor(() => expect(patchTopicState).toHaveBeenCalledWith("a1", "attention", null));
  });
});
