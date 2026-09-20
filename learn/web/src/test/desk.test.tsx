import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Desk from "../screens/Desk";
import { useStore } from "../store";
import { fixtures, stubApi } from "./server";

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const mount = (onStart = () => {}) =>
  render(
    <MemoryRouter>
      <Desk onStart={onStart} />
    </MemoryRouter>,
  );

const stats = (container: HTMLElement) =>
  [...container.querySelectorAll(".stat")].map((s) => ({
    value: s.querySelector(".stat-value")?.textContent,
    label: s.querySelector(".stat-label")?.textContent,
    sub: s.querySelector(".stat-sub")?.textContent,
  }));

describe("the Desk", () => {
  beforeEach(() => {
    useStore.setState({ desk: null, deskError: null, session: null, vaultRevision: 0 });
  });

  it("leads with the cue, the start button and the warm-up", async () => {
    stubApi();
    mount();

    await waitFor(() =>
      expect(screen.getByText(/The plan you wrote on Sunday/)).toBeInTheDocument(),
    );
    expect(screen.getByText(/IF it is Tuesday/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start · about 2 hours" }),
    ).toBeEnabled();
    expect(screen.getByText("First ten minutes")).toBeInTheDocument();
    // Warm-up items are links straight to the attempt.
    expect(
      screen.getByRole("link", { name: /Write multi-head causal self-attention/ }),
    ).toHaveAttribute("href", "/modules/a1/checks/a1-mha-from-memory");
    expect(
      screen.getByText("Skippable, and the skip is recorded rather than punished."),
    ).toBeInTheDocument();
  });

  it("shows the three standing numbers, counted not percentaged", async () => {
    stubApi();
    const { container } = mount();

    await waitFor(() => expect(screen.getByText("checks are yours")).toBeInTheDocument());
    expect(stats(container)).toEqual([
      { value: "2", label: "checks are yours", sub: "of 84 core checks · proved cold, twice" },
      {
        value: "1",
        label: "capstone artefacts exist",
        sub: "of 8 · the golden dataset is in draft",
      },
      {
        value: "30",
        label: "weeks left on the plan",
        sub: "at 12 h a week · 2 skips banked",
      },
    ]);
    // No hero percentage anywhere on the page.
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it("starts a session on the warm-up's module", async () => {
    stubApi();
    const onStart = vi.fn();
    mount(onStart);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Start ·/ })).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: /Start ·/ }));
    expect(onStart).toHaveBeenCalledWith("a1");
  });

  it("reads as a first run when the server says so", async () => {
    stubApi((url) => (url.endsWith("/api/desk") ? json(fixtures.deskFirstRun) : undefined));
    const { container } = mount();

    await waitFor(() => expect(screen.getByText("Your first session")).toBeInTheDocument());
    expect(screen.getByText(/Start with one thing/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start the first session" }),
    ).toBeInTheDocument();
    expect(screen.getByText("You will write your own cue at the end.")).toBeInTheDocument();

    // 0 / 0 / 40, and nothing proved.
    expect(stats(container).map((s) => s.value)).toEqual(["0", "0", "40"]);
    expect(
      screen.getByText(/Nothing proved yet\. A check becomes yours after two clean passes/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/starts reading after three graded attempts/),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Nothing proved yet — this fills in from the checks you pass"),
    ).toBeInTheDocument();
  });

  it("draws the mark on the first run and nowhere else", async () => {
    stubApi((url) => (url.endsWith("/api/desk") ? json(fixtures.deskFirstRun) : undefined));
    const first = mount();
    await waitFor(() => expect(screen.getByText("Your first session")).toBeInTheDocument());
    const mark = first.container.querySelector(".desk-mark");
    expect(mark).toBeInTheDocument();
    // One continuous path, not four — the spiral draws as a single stroke.
    expect(mark?.querySelectorAll("path")).toHaveLength(1);
    // Decorative: the lockup and the animation carry no name of their own.
    expect(mark).toHaveAttribute("aria-hidden", "true");

    first.unmount();
    useStore.setState({ desk: null, deskError: null, session: null, vaultRevision: 0 });

    stubApi();
    const returning = mount();
    await waitFor(() =>
      expect(screen.getByText(/The plan you wrote on Sunday/)).toBeInTheDocument(),
    );
    expect(returning.container.querySelector(".desk-mark")).toBeNull();
  });
});
