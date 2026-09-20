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
});
