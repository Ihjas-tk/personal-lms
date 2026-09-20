import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SourcePane from "../components/SourcePane";
import type { SourceRow } from "../types";

const video: SourceRow = {
  id: "p0-karpathy-deep-dive",
  title: "Karpathy, Deep Dive into LLMs like ChatGPT",
  kind: "video",
  url: "https://www.youtube.com/watch?v=7xTGNNLPyMI",
  est_minutes: 211,
  state: "read",
  minutes: 2,
  path: null,
  position: 1.95,
  length: 211,
  unit: "min",
  pct: 1,
  meta: "video · 2 of 211 min",
  action: "Resume",
} as unknown as SourceRow;

function mount(position: number, onPosition = vi.fn()) {
  const utils = render(
    <SourcePane
      source={video}
      position={position}
      onPosition={onPosition}
      paused={false}
      onPause={() => {}}
      onStamp={() => {}}
    />,
  );
  const iframe = () => screen.getByTitle(video.title) as HTMLIFrameElement;
  return { ...utils, iframe, onPosition };
}

describe("SourcePane embed", () => {
  it("does not reload the iframe as the position ticks", () => {
    const { rerender, iframe } = mount(1.95);
    const first = iframe().src;
    expect(first).toContain("start=117");
    rerender(
      <SourcePane
        source={video}
        position={1.95 + 1 / 60}
        onPosition={() => {}}
        paused={false}
        onPause={() => {}}
        onStamp={() => {}}
      />,
    );
    expect(iframe().src).toBe(first);
  });

  it("reloads the iframe only on a deliberate seek", () => {
    const { iframe, onPosition } = mount(10);
    fireEvent.click(screen.getByRole("button", { name: "−15s" }));
    expect(onPosition).toHaveBeenCalledWith(9.75);
    expect(iframe().src).toContain("start=585");
  });
});
