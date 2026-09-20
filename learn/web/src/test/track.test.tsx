import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Track from "../screens/Track";
import Ridge from "../components/Ridge";
import { useStore } from "../store";
import { fixtures, stubApi } from "./server";
import type { Desk } from "../types";

describe("the track", () => {
  beforeEach(() => {
    useStore.setState({ vaultRevision: 0 });
  });

  it("draws forty week cells with one current week", async () => {
    stubApi();
    const { container } = render(
      <MemoryRouter>
        <Track />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("The track")).toBeInTheDocument());
    expect(container.querySelectorAll(".weekcell")).toHaveLength(40);
    expect(container.querySelectorAll('.weekcell[data-state="current"]')).toHaveLength(1);
    expect(screen.getByText("↑ week 10 — you are here")).toBeInTheDocument();
  });

  it("renders the three bands as rows carrying their warnings", async () => {
    stubApi();
    const { container } = render(
      <MemoryRouter>
        <Track />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Left unfinished")).toBeInTheDocument());
    expect(
      screen.getByText("This phase — v0 app + evals foundation"),
    ).toBeInTheDocument();
    expect(screen.getByText("After this")).toBeInTheDocument();
    expect(
      screen.getByText(/error analysis before judges, judges before the harness/),
    ).toBeInTheDocument();

    // Every row: title link, mono weeks, proof text, warning, action.
    const rows = container.querySelectorAll(".row2");
    expect(rows).toHaveLength(5);

    const late = container.querySelector('.row2[data-tone="late"]') as HTMLElement;
    expect(within(late).getByRole("link", { name: "Transformers from scratch" })).toHaveAttribute(
      "href",
      "/modules/a1",
    );
    expect(late.querySelector(".row-when")?.textContent).toContain("weeks 3–8");
    expect(late.querySelector(".row-when")?.textContent).toContain("due 05 Sep");
    expect(within(late).getByText("1 of 11 lasting")).toBeInTheDocument();
    expect(within(late).getByText("two checks 14 days overdue")).toBeInTheDocument();
    expect(within(late).getByRole("button", { name: "Resume" })).toBeInTheDocument();
    // 11 core checks, one of them proved.
    expect(late.querySelectorAll(".row-square")).toHaveLength(11);
    expect(late.querySelectorAll('.row-square[data-fill="full"]')).toHaveLength(1);
    expect(late.querySelectorAll('.row-square[data-fill="part"]')).toHaveLength(2);

    expect(screen.getByText("needs Golden dataset first")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Preview" })).toHaveLength(1);
  });

  it("pushes the whole schedule back a week", async () => {
    const { calls } = stubApi();
    render(
      <MemoryRouter>
        <Track />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("The track")).toBeInTheDocument());
    await userEvent.click(
      screen.getByRole("button", { name: "Push everything back a week" }),
    );
    await waitFor(() =>
      expect(
        calls.find((c) => c.url.endsWith("/api/plan/shift") && c.init?.method === "POST"),
      ).toBeTruthy(),
    );
    const call = calls.find((c) => c.url.endsWith("/api/plan/shift"));
    expect(JSON.parse(String(call?.init?.body))).toEqual({ weeks: 1 });
  });
});

describe("the capability ridge", () => {
  it("gives every column a segment per state, sized by its count", () => {
    const desk = fixtures.desk as unknown as Desk;
    const { container } = render(
      <Ridge columns={desk.ridge} foot="A bar moves only when a check is passed cold" />,
    );

    const columns = container.querySelectorAll(".ridge-col");
    expect(columns).toHaveLength(6);

    // Transformers: 1 lasting, 1 solid, 1 shaky, 1 tried, 7 untouched → 2 of 11.
    const first = columns[0] as HTMLElement;
    expect(within(first).getByText("2 / 11")).toBeInTheDocument();
    const segments = first.querySelectorAll(".ridge-seg");
    expect(segments).toHaveLength(5);
    expect(segments[0].getAttribute("data-state")).toBe("durable");
    expect((segments[0] as HTMLElement).style.flexGrow).toBe("1");
    expect((segments[4] as HTMLElement).style.flexGrow).toBe("7");
    expect(segments[4].getAttribute("title")).toBe("7 untouched");

    // An untouched area draws one segment only, and still says what it holds.
    const last = columns[5] as HTMLElement;
    expect(last.querySelectorAll(".ridge-seg")).toHaveLength(1);
    expect(within(last).getByText("0 / 32")).toBeInTheDocument();

    // A four-week gain is a chip with text, not a colour.
    expect(within(first).getByText("+1 in four weeks")).toBeInTheDocument();
  });
});
