import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TidyDialog from "../components/TidyDialog";
import { sseResponse, stubApi } from "./server";

const ORIGINAL = "# Attention\n\nthe scale is 1/sqrt(d_k) .\n";
const TIDIED = "# Attention\n\nThe scale is 1/sqrt(d_k).\n";

describe("Tidy merge view", () => {
  it("streams into a shadow buffer, then accepts the tidied buffer", async () => {
    stubApi((url) =>
      url.endsWith("/api/ai/tidy")
        ? sseResponse([
            { event: "delta", data: { text: TIDIED.slice(0, 12) } },
            { event: "delta", data: { text: TIDIED.slice(12) } },
            { event: "stats", data: { tokens_added: 0 } },
            { event: "done", data: { text: TIDIED, stats: { tokens_added: 0 } } },
          ])
        : undefined,
    );
    const onAccept = vi.fn();

    render(
      <TidyDialog
        moduleId="a1"
        original={ORIGINAL}
        onAccept={onAccept}
        onClose={() => {}}
      />,
    );

    await waitFor(() => expect(screen.getByTestId("merge-host")).toBeInTheDocument());
    expect(screen.getByText("Tidy · review each change")).toBeInTheDocument();
    expect(screen.getByText(/Numbers, code, maths and links are checked/)).toBeInTheDocument();
    expect(screen.getByText(/A snapshot is committed before anything is written/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Take all" }));
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onAccept.mock.calls[0][0]).toBe(TIDIED);
  });

  it("renders the refusal as an alert with no diff and no way to accept (§6.1)", async () => {
    stubApi((url) =>
      url.endsWith("/api/ai/tidy")
        ? sseResponse([
            { event: "delta", data: { text: "changed" } },
            { event: "rejected", data: { reason: "A number changed: 1/sqrt(d_k) → 1/sqrt(d)." } },
          ])
        : undefined,
    );
    const onAccept = vi.fn();

    render(
      <TidyDialog moduleId="a1" original={ORIGINAL} onAccept={onAccept} onClose={() => {}} />,
    );

    const card = await screen.findByTestId("tidy-rejected");
    expect(card).toHaveAttribute("role", "alert");
    expect(
      screen.getByText(/Refused — the tidy changed something it is not allowed to change/),
    ).toBeInTheDocument();
    expect(screen.getByText(/A number changed/)).toBeInTheDocument();
    expect(
      screen.getByText(/Your note was not touched and there is no diff to review/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Take all" })).toBeNull();
    expect(screen.getByRole("button", { name: "Keep original" })).toBeInTheDocument();
    expect(onAccept).not.toHaveBeenCalled();
  });

  it("starts the buffer over when the server retries, then reviews the second pass", async () => {
    stubApi((url) =>
      url.endsWith("/api/ai/tidy")
        ? sseResponse([
            { event: "delta", data: { text: "wrong pass" } },
            { event: "retry", data: { reason: "a number changed: '3' became '30'" } },
            { event: "delta", data: { text: TIDIED } },
            { event: "stats", data: { tokens_added: 0 } },
            { event: "done", data: { text: TIDIED, stats: { tokens_added: 0 } } },
          ])
        : undefined,
    );
    render(<TidyDialog moduleId="a1" original={ORIGINAL} onClose={() => {}} onAccept={() => {}} />);
    const note = await screen.findByTestId("tidy-retry");
    expect(note.textContent).toContain("'3' became '30'");
    expect(await screen.findByTestId("merge-host")).toBeTruthy();
    expect(screen.queryByTestId("tidy-rejected")).toBeNull();
  });

});

const RICH =
  "> From: [*Karpathy, Let's build GPT*](https://x.invalid/gpt) (video)\n" +
  "> Module: Transformers from scratch · Topic: Causal self-attention\n\n" +
  "## Scaling\n\n- The scale is 1/sqrt(d_k).\n";

describe("Restructure merge view", () => {
  it("calls the restructure route with the topic, then reviews the richer note", async () => {
    const { calls } = stubApi((url) =>
      url.endsWith("/api/ai/restructure")
        ? sseResponse([
            { event: "delta", data: { text: RICH } },
            { event: "stats", data: { tokens_added: 14 } },
            { event: "done", data: { text: RICH, stats: { tokens_added: 14 } } },
          ])
        : undefined,
    );
    const onAccept = vi.fn();

    render(
      <TidyDialog
        moduleId="a1"
        topicId="attention"
        mode="restructure"
        original={ORIGINAL}
        onAccept={onAccept}
        onClose={() => {}}
      />,
    );

    await waitFor(() => expect(screen.getByTestId("merge-host")).toBeInTheDocument());
    expect(screen.getByText("Restructure · review each change")).toBeInTheDocument();
    expect(screen.getByText(/14 words added for layout and context/)).toBeInTheDocument();
    expect(screen.getByText(/Everything the note said is checked/)).toBeInTheDocument();
    expect(screen.getByText(/A snapshot is committed before anything is written/)).toBeInTheDocument();

    const call = calls.find((c) => c.url.endsWith("/api/ai/restructure"));
    expect(call).toBeTruthy();
    expect(JSON.parse(String(call?.init?.body))).toEqual({
      module_id: "a1",
      topic_id: "attention",
      text: ORIGINAL,
    });

    await userEvent.click(screen.getByRole("button", { name: "Take all" }));
    expect(onAccept.mock.calls[0][0]).toBe(RICH);
  });

  it("names the restructure in the refusal, and offers no diff", async () => {
    stubApi((url) =>
      url.endsWith("/api/ai/restructure")
        ? sseResponse([
            { event: "delta", data: { text: "lossy" } },
            { event: "rejected", data: { reason: "a number was dropped: '512'" } },
          ])
        : undefined,
    );

    render(
      <TidyDialog
        moduleId="a1"
        topicId="attention"
        mode="restructure"
        original={ORIGINAL}
        onAccept={() => {}}
        onClose={() => {}}
      />,
    );

    expect(await screen.findByTestId("tidy-rejected")).toHaveAttribute("role", "alert");
    expect(
      screen.getByText(/Refused — the restructure dropped or changed something it must keep/),
    ).toBeInTheDocument();
    expect(screen.getByText(/a number was dropped/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Take all" })).toBeNull();
  });

  it("starts the buffer over when the server retries the restructure", async () => {
    stubApi((url) =>
      url.endsWith("/api/ai/restructure")
        ? sseResponse([
            { event: "delta", data: { text: "wrong pass" } },
            { event: "retry", data: { reason: "a number was dropped: '512'" } },
            { event: "delta", data: { text: RICH } },
            { event: "stats", data: { tokens_added: 14 } },
            { event: "done", data: { text: RICH, stats: { tokens_added: 14 } } },
          ])
        : undefined,
    );
    render(
      <TidyDialog
        moduleId="a1"
        topicId="attention"
        mode="restructure"
        original={ORIGINAL}
        onAccept={() => {}}
        onClose={() => {}}
      />,
    );
    const note = await screen.findByTestId("tidy-retry");
    expect(note.textContent).toContain("'512'");
    expect(await screen.findByTestId("merge-host")).toBeTruthy();
  });
});
