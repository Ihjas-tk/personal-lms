import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";

vi.mock("../api", () => ({
  patchResource: vi.fn(async () => ({ id: "a1" })),
  patchTopicState: vi.fn(async () => ({ id: "a1" })),
}));

import TopicCard from "../components/TopicCard";
import { fixtures } from "./server";
import type { ModuleWorkspace, SourceRow, Topic } from "../types";

const module_ = fixtures.module as unknown as ModuleWorkspace;
/** The fixture topic: a two-lane either/or group plus one optional extra. */
const attention = module_.topics[1];

const mount = (topic: Topic = attention) =>
  render(
    <MemoryRouter>
      <TopicCard
        topic={topic}
        module={module_}
        open
        onToggle={() => {}}
        onFocus={() => {}}
        onChanged={() => {}}
        blockedReason={null}
      />
    </MemoryRouter>,
  );

/** The row a title sits in, so a tag can be asserted against its own source. */
const rowOf = (title: string) =>
  screen.getByText(title).closest(".source") as HTMLElement;

describe("source rows: required, optional and either/or", () => {
  it("tags the optional extra and leaves required rows untagged", () => {
    mount();
    const extra = rowOf("The Annotated Transformer");
    expect(within(extra).getByText("optional")).toBeInTheDocument();
    // …and its focus line says why it is on this topic at all.
    expect(within(extra).getByText("the attention section only")).toBeInTheDocument();

    // Required is the default: tagging every row would be noise.
    const required = rowOf("Karpathy, Let's build GPT");
    expect(within(required).queryByText("optional")).toBeNull();
    expect(screen.getAllByText("optional")).toHaveLength(1);
  });

  it("draws the alternatives as one pick-one group with a lane on each member", () => {
    mount();
    const group = screen.getByText("pick one").closest(".source-group") as HTMLElement;
    expect(group).not.toBeNull();

    const titles = within(group)
      .getAllByText(/Karpathy|Attention Is All/)
      .map((el) => el.textContent);
    expect(titles).toHaveLength(2);
    expect(within(group).getByText("video lane")).toBeInTheDocument();
    expect(within(group).getByText("paper lane")).toBeInTheDocument();

    // The optional extra stands on its own, outside the bracket.
    expect(within(group).queryByText("The Annotated Transformer")).toBeNull();
    expect(screen.getByText("pick one")).toHaveAttribute("data-done", "false");
  });

  it("marks the group done as soon as one member is", () => {
    const done = {
      ...attention,
      required_done: 1,
      sources: attention.sources.map((s: SourceRow) =>
        s.id === "a1-attention-paper" ? { ...s, counts: true, done: true, pct: 1 } : s,
      ),
    };
    mount(done);
    expect(screen.getByText("pick one")).toHaveAttribute("data-done", "true");
  });

  it("counts required groups in the header, an either/or group once", () => {
    mount();
    // Three sources, but only one thing is actually owed.
    expect(screen.getByText(/3 sources/)).toBeInTheDocument();
    expect(screen.getByText("0 of 1 required")).toBeInTheDocument();

    // A topic with no required source at all says nothing about requirements.
    mount({ ...attention, required_total: 0, required_done: 0 });
    expect(screen.queryAllByText(/of 1 required/)).toHaveLength(1);
  });
});
