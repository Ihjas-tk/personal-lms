import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AiMenu from "../components/AiMenu";
import { aiBlockedReason } from "../store";
import {
  AI_ANSWER_OPEN,
  AI_NO_CREDENTIAL,
  AI_RESTRUCTURE_ITEM,
  AI_SECOND_OPINION_ITEM,
  AI_TIDY_ITEM,
  AI_UNREACHABLE,
} from "../labels";
import { fixtures } from "./server";
import type { Health, Session } from "../types";

describe("AI availability (§7.3)", () => {
  it("keeps all three entries, disabled, with the reason in plain words (§6.3)", async () => {
    // The server sends the sentence; the client only drops the backticks that mark
    // the two literals it sets in mono.
    const reason = aiBlockedReason(fixtures.health as Health, null);
    expect(reason).toBe(AI_NO_CREDENTIAL);

    render(
      <AiMenu
        blockedReason={reason}
        items={[
          { label: AI_TIDY_ITEM, onSelect: () => {} },
          { label: AI_RESTRUCTURE_ITEM, onSelect: () => {} },
          { label: AI_SECOND_OPINION_ITEM, onSelect: () => {} },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /AI/ }));

    // The reason is stated once, inside the menu, not only as a tooltip.
    expect(screen.getByRole("note")).toHaveTextContent(
      "No API credential found. Put ANTHROPIC_API_KEY=sk-ant-... in learn/.env, " +
        "or export ANTHROPIC_API_KEY, then restart learn.",
    );
    for (const name of [/^Tidy/, /^Restructure/, /^Second opinion/]) {
      const item = screen.getByRole("menuitem", { name });
      expect(item).toBeDisabled();
      expect(item).toHaveAttribute("title", AI_NO_CREDENTIAL);
    }
  });

  it("blocks AI while an answer is open, even when the key is present", () => {
    const health: Health = { ok: true, ai_available: true, ai_reason: null, vault_git: true };
    const session = { open_attempt_path: "vault/…/x.md" } as Session;
    expect(aiBlockedReason(health, session)).toBe(AI_ANSWER_OPEN);
    expect(aiBlockedReason(health, null)).toBeNull();
  });

  it("says the server is not reachable when health itself failed", () => {
    const down: Health = {
      ok: false,
      ai_available: false,
      ai_reason: "The server is not reachable.",
      vault_git: false,
    };
    expect(aiBlockedReason(down, null)).toBe(AI_UNREACHABLE);
  });
});
