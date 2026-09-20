import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FocusMode from "../components/FocusMode";
import { parsePosition, stampOf, youtubeEmbed } from "../components/SourcePane";
import { useStore } from "../store";
import { fixtures, stubApi } from "./server";
import type { ModuleWorkspace, Topic } from "../types";

const module = fixtures.module as unknown as ModuleWorkspace;
const topic = module.topics[1] as unknown as Topic;

describe("positions and stamps", () => {
  it("round-trips a position through its own unit", () => {
    expect(stampOf(42.1667, "min")).toBe("42:10");
    expect(stampOf(95, "min")).toBe("1:35:00");
    expect(stampOf(3, "pages")).toBe("p.3");
    expect(parsePosition("42:10", "min")).toBeCloseTo(42.1667, 3);
    expect(parsePosition("p.3", "pages")).toBe(3);
    expect(parsePosition("nonsense", "min")).toBeNull();
  });

  it("embeds a YouTube source at the stored position and nothing else", () => {
    const url = youtubeEmbed("https://www.youtube.com/watch?v=kCc8FmEb1nY", 10);
    expect(url).toMatch(/^https:\/\/www\.youtube\.com\/embed\/kCc8FmEb1nY\?start=600&/);
    // The player API is on so the pane can pause, seek and follow the playhead.
    expect(url).toContain("enablejsapi=1");
    expect(url).toContain("origin=");
    expect(youtubeEmbed("https://example.invalid/paper.pdf", 0)).toBeNull();
  });
});

describe("focus mode (§4)", () => {
  beforeEach(() => {
    useStore.setState({ session: null, health: fixtures.health as never });
  });

  it("names the file, lists the unfiled jots and files a new one on ⌘↵", async () => {
    const { calls } = stubApi();
    render(<FocusMode module={module} topic={topic} onClose={() => {}} />);

    // The header carries the path and the save state in one live line.
    await waitFor(() =>
      expect(screen.getByText(/a1\/attention\.md ·/)).toBeInTheDocument(),
    );
    expect(screen.getByText("Unfiled jots")).toBeInTheDocument();
    expect(screen.getByText(/He reshapes before the transpose/)).toBeInTheDocument();

    const input = screen.getByRole("textbox", { name: "Jot a line" });
    await userEvent.type(input, "mask before softmax{Meta>}{Enter}{/Meta}");

    await waitFor(() => {
      const posted = calls.find(
        (c) => c.url.endsWith("/api/jots") && c.init?.method === "POST",
      );
      expect(JSON.parse(String(posted?.init?.body))).toMatchObject({
        module_id: "a1",
        topic_id: "attention",
        resource_id: "a1-karpathy-gpt",
        text: "mask before softmax",
      });
    });
  });

  it("swaps to the pop-out jotter and back without unmounting the note", async () => {
    stubApi();
    render(<FocusMode module={module} topic={topic} onClose={() => {}} />);

    await waitFor(() => expect(screen.getByTestId("note-editor")).toBeInTheDocument());
    const layout = () => within(screen.getByRole("group", { name: "Note layout" }));
    await userEvent.click(layout().getByRole("button", { name: "Pop-out jotter" }));

    expect(screen.getByRole("group", { name: "Pop-out jotter" })).toBeInTheDocument();
    expect(screen.getByText(/Stays on top · ⌘↵ to file a line/)).toBeInTheDocument();
    // The editor is hidden, not destroyed: unsaved keystrokes survive the swap.
    expect(screen.getByTestId("note-editor")).toBeInTheDocument();

    await userEvent.click(layout().getByRole("button", { name: "Side by side" }));
    expect(screen.queryByRole("group", { name: "Pop-out jotter" })).toBeNull();
  });
});
