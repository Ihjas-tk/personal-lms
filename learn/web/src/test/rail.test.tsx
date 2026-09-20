import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Rail from "../components/Rail";
import { useStore } from "../store";
import { fixtures } from "./server";
import type { Desk } from "../types";

const mount = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Rail
        dueCount={6}
        shipped={{ exist: 1, total: 8 }}
        vaultGit={true}
        onWrapUp={() => {}}
        onStart={() => {}}
        canStart
      />
    </MemoryRouter>,
  );

describe("the rail", () => {
  beforeEach(() => {
    useStore.setState({ session: null, desk: fixtures.desk as unknown as Desk, elapsed: 0 });
  });

  it("heads with the bare lockup — the mark beside the wordmark, no tile", () => {
    const { container } = mount("/");
    const brand = container.querySelector(".rail-brand");
    expect(brand?.querySelector("svg.rail-mark")).toBeInTheDocument();
    expect(brand?.querySelectorAll("path")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("learn");
    // The mark is never boxed outside the app icon: nothing between it and the rail.
    expect(brand?.firstElementChild?.tagName).toBe("svg");
  });

  it("offers exactly four destinations", () => {
    mount("/");
    const links = screen.getAllByRole("link").filter((a) => a.className === "rail-link");
    expect(links.map((a) => a.textContent?.replace(/\d+ \/ \d+|\d+$/, "").trim())).toEqual([
      "Desk",
      "The track",
      "Review",
      "Shipped",
    ]);
  });

  it("marks the current destination", () => {
    mount("/shipped");
    expect(screen.getByRole("link", { name: /Shipped/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Desk" })).not.toHaveAttribute("aria-current");
  });

  it("keeps The track lit on a module route", () => {
    mount("/modules/a1");
    expect(screen.getByRole("link", { name: "The track" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("keeps The track lit on an attempt route", () => {
    mount("/modules/a1/checks/a1-mha-from-memory");
    expect(screen.getByRole("link", { name: "The track" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("badges review with the due count and shipped with n of 8", () => {
    mount("/");
    expect(screen.getByLabelText("6 due for review")).toHaveTextContent("6");
    expect(screen.getByLabelText("1 of 8 artefacts exist")).toHaveTextContent("1 / 8");
  });

  it("says so when no session is open, and offers to start one", () => {
    mount("/");
    expect(screen.getByText(/Not working yet\. Week 10 of 40\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start a session" })).toBeEnabled();
  });

  it("shows the clock, the module, the phase switch and Wrap up during a session", () => {
    useStore.setState({
      elapsed: 8040,
      session: {
        id: "s1",
        module_id: "a1",
        started: "2026-09-19T18:00:00Z",
        closed: null,
        phase: "review",
        minutes: { new: 0, review: 0, build: 0 },
        elapsed_seconds: 8040,
        warmup_skipped: false,
        open_attempt_path: null,
        checks_attempted: 0,
        errors_logged: 0,
      },
    });
    mount("/");
    expect(screen.getByLabelText("Elapsed session time")).toHaveTextContent("2:14");
    expect(screen.getByRole("link", { name: "a1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "review" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "new" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Wrap up" })).toBeInTheDocument();
  });
});
