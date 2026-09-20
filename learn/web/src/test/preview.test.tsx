import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Markdown from "../components/Markdown";
import { fixtures } from "./server";

describe("markdown preview", () => {
  it("renders KaTeX for inline math and a Shiki block for python", async () => {
    const { container } = render(<Markdown>{fixtures.note.body}</Markdown>);

    // rehype-katex turns $…$ into a .katex element.
    await waitFor(() => expect(container.querySelector(".katex")).toBeTruthy());

    // Shiki highlights the fenced python block asynchronously.
    await waitFor(
      () => {
        const block = screen.getByTestId("shiki-block");
        expect(block.getAttribute("data-lang")).toBe("python");
        expect(block.querySelector("pre.shiki")).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });

  it("falls back to a plain pre for languages outside the allow-list", async () => {
    const { container } = render(<Markdown>{"```rust\nfn main() {}\n```\n"}</Markdown>);
    await waitFor(() => expect(container.querySelector("pre")).toBeTruthy());
    expect(screen.queryByTestId("shiki-block")).toBeNull();
    expect(container.querySelector("pre")?.getAttribute("data-lang")).toBeNull();
  });
});
