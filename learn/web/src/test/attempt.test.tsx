import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import Attempt from "../screens/Attempt";
import { useStore } from "../store";
import { fixtures, stubApi } from "./server";

const started = (url: string, init?: RequestInit) =>
  url.endsWith("/attempts") && init?.method === "POST"
    ? new Response(JSON.stringify(fixtures.attemptStart), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    : undefined;

const mount = () =>
  render(
    <MemoryRouter initialEntries={["/modules/a1/checks/a1-mha-from-memory"]}>
      <Routes>
        <Route path="/modules/:id/checks/:checkId" element={<Attempt />} />
        <Route path="/modules/:id" element={<p>back on the module</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("staged check attempt (§5)", () => {
  beforeEach(() => {
    useStore.setState({ session: null, health: fixtures.health as never });
  });

  it("gates each stage: no editor before confidence, no rubric or reference before the freeze", async () => {
    const { calls } = stubApi(started);
    mount();

    await waitFor(() => expect(screen.getByText(/how sure are you/)).toBeInTheDocument());
    expect(screen.queryByTestId("answer-editor")).toBeNull();
    expect(screen.queryByText(fixtures.check.rubric[0])).toBeNull();
    expect(screen.queryByText(/reference implementation/)).toBeNull();

    const lock = screen.getByRole("button", { name: /Lock it in and start writing/ });
    expect(lock).toBeDisabled();

    fireEvent.change(screen.getByRole("slider"), { target: { value: "55" } });
    await waitFor(() => expect(lock).toBeEnabled());
    await userEvent.click(lock);

    // Stage 2: the editor, the confidence read-out, and paste off for a code check.
    await waitFor(() => expect(screen.getByTestId("answer-editor")).toBeInTheDocument());
    expect(screen.getByText(/sure: 55/)).toBeInTheDocument();
    expect(screen.getByText(/Paste and autocomplete are disabled/)).toBeInTheDocument();
    expect(screen.queryByText(fixtures.check.rubric[0])).toBeNull();
    const open = calls.find((c) => c.init?.method === "POST" && c.url.endsWith("/attempts"));
    expect(JSON.parse(String(open?.init?.body))).toMatchObject({ confidence_pre: 55 });

    await userEvent.click(screen.getByRole("textbox", { name: /Answer for/ }));
    await userEvent.keyboard("q @ k.T");
    await userEvent.click(screen.getByRole("button", { name: "Submit and freeze" }));

    // Stage 3: freezing is the reveal — the rubric and the reference arrive together,
    // and they arrive from the freeze call, not from anything loaded earlier.
    await waitFor(() =>
      expect(screen.getByText(fixtures.check.rubric[0])).toBeInTheDocument(),
    );
    expect(screen.getByText("What you wrote")).toBeInTheDocument();
    expect(screen.getByText("The reference")).toBeInTheDocument();
    expect(screen.getByText(/reference implementation/)).toBeInTheDocument();

    const froze = calls.find((c) => c.url.endsWith("/api/attempts/freeze"));
    expect(JSON.parse(String(froze?.init?.body))).toMatchObject({
      attempt_path: fixtures.attemptStart.attempt_path,
      answer: expect.stringContaining("q"),
    });
    // The open answer is what blocked AI; freezing ends it.
    expect(calls.every((c) => !c.url.endsWith("/api/attempts/submit"))).toBe(true);
  });

  it("requires every mark, a score and — below fluent — a diagnosis before recording", async () => {
    const { calls } = stubApi(started);
    mount();

    await waitFor(() => expect(screen.getByRole("slider")).toBeInTheDocument());
    fireEvent.change(screen.getByRole("slider"), { target: { value: "55" } });
    await userEvent.click(screen.getByRole("button", { name: /Lock it in/ }));
    await waitFor(() => expect(screen.getByTestId("answer-editor")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("textbox", { name: /Answer for/ }));
    await userEvent.keyboard("q @ k.T");
    await userEvent.click(screen.getByRole("button", { name: "Submit and freeze" }));

    const record = await screen.findByRole("button", { name: "Record and move on" });
    expect(record).toBeDisabled();

    for (const group of screen.getAllByRole("group", { name: /Rubric line/ }))
      // eslint-disable-next-line testing-library/prefer-screen-queries
      await userEvent.click(group.querySelector<HTMLButtonElement>("button")!);
    await userEvent.click(screen.getByRole("button", { name: "Partly" }));
    expect(record).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/What exactly differed/), "mask after softmax");
    await userEvent.selectOptions(
      screen.getByLabelText("Error category"),
      "off_by_one_masking",
    );
    await waitFor(() => expect(record).toBeEnabled());

    await userEvent.click(record);
    // Recording sends only the grade, and returns to the topic that owns the check.
    await waitFor(() => expect(screen.getByText("back on the module")).toBeInTheDocument());
    const graded = calls.find((c) => c.url.endsWith("/api/attempts/submit"));
    const body = JSON.parse(String(graded?.init?.body));
    expect(body.answer).toBeUndefined();
    expect(body).toMatchObject({ score: "partial", category: "off_by_one_masking" });
  });
});
