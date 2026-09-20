import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../api", () => ({
  patchResource: vi.fn(async (_m: string, _r: string, body: { state: string }) => ({
    id: "a1",
    patched: body.state,
  })),
}));

import ResourceStateMenu from "../components/ResourceStateMenu";
import { patchResource } from "../api";

describe("ResourceStateMenu", () => {
  it("opens the ladder from the chip and records the chosen rung", async () => {
    const onChanged = vi.fn();
    render(
      <ResourceStateMenu moduleId="a1" resourceId="a1-karpathy-gpt" state="queued" onChanged={onChanged} />,
    );
    const chip = screen.getByRole("button", { name: /not opened/ });
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(chip);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(5);
    expect(screen.getByRole("menuitemcheckbox", { name: /Done with this source/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitemradio", { name: /rebuilt it/ }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(patchResource).toHaveBeenCalledWith("a1", "a1-karpathy-gpt", { state: "reconstructed" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("marks a source done at any rung", async () => {
    const onChanged = vi.fn();
    render(<ResourceStateMenu moduleId="a1" resourceId="r" state="read" onChanged={onChanged} />);
    fireEvent.click(screen.getByRole("button", { name: /read/ }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /Done with this source/ }));
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(patchResource).toHaveBeenCalledWith("a1", "r", { done: true });
  });

  it("closes on Escape without changing anything", () => {
    const onChanged = vi.fn();
    render(<ResourceStateMenu moduleId="a1" resourceId="r" state="read" onChanged={onChanged} />);
    fireEvent.click(screen.getByRole("button", { name: /read/ }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(onChanged).not.toHaveBeenCalled();
  });
});
