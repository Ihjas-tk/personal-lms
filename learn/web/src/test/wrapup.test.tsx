import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WrapUp from "../components/WrapUp";
import { useStore } from "../store";
import { fixtures, stubApi } from "./server";
import type { Session } from "../types";

/** The session the server reports: it carries its own attempt and error counts (§1b). */
const SESSION = fixtures.session as Session;

const FORTY_WORDS = Array.from({ length: 44 }, (_, i) => `word${i}`).join(" ");

describe("wrap up (§6)", () => {
  beforeEach(() => {
    useStore.setState({ session: SESSION, elapsed: 8040 });
  });

  it("holds the close until forty words and both plan fields are there", async () => {
    stubApi();
    render(<WrapUp onDone={() => {}} />);

    const close = screen.getByRole("button", { name: "Close the session" });
    expect(close).toBeDisabled();
    // Counted by the server, not tallied in the browser.
    expect(
      screen.getByText(/2 h 14 m · 1 check attempted · 1 error logged/),
    ).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/What changed in your understanding/), "short");
    expect(close).toBeDisabled();
    expect(screen.getByText("1 of 40 words.")).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(/What changed in your understanding/));
    await userEvent.click(screen.getByLabelText(/What changed in your understanding/));
    await userEvent.paste(FORTY_WORDS);
    await waitFor(() => expect(screen.getByText("44 words — enough.")).toBeInTheDocument());
    expect(close).toBeDisabled(); // the plan is still empty

    await userEvent.type(screen.getByLabelText("IF"), "it is Sunday after breakfast");
    expect(close).toBeDisabled();
    await userEvent.type(screen.getByLabelText("THEN"), "re-derive the mask on paper");
    await waitFor(() => expect(close).toBeEnabled());
  });

  it("files the session's unfiled jots into their topic note before closing", async () => {
    const { calls } = stubApi();
    const onDone = vi.fn();
    render(<WrapUp onDone={onDone} />);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /File 2 jots into their notes/ })).toBeEnabled(),
    );

    await userEvent.click(screen.getByLabelText(/What changed in your understanding/));
    await userEvent.paste(FORTY_WORDS);
    await userEvent.type(screen.getByLabelText("IF"), "it is Sunday");
    await userEvent.type(screen.getByLabelText("THEN"), "re-derive the mask");
    await userEvent.click(screen.getByRole("button", { name: "Close the session" }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    const filed = calls.find((c) => c.url.endsWith("/api/jots/file"));
    expect(JSON.parse(String(filed?.init?.body))).toEqual({
      ids: fixtures.jots.map((j) => j.id),
      topic_id: "attention",
      module_id: "a1",
    });
    expect(calls.some((c) => c.url.endsWith("/api/sessions/close"))).toBe(true);
  });
});
