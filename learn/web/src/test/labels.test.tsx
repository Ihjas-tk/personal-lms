import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LadderChip, ResourceChip, ScoreChip } from "../components/Chip";
import * as L from "../labels";
import type { LadderState, ResourceState } from "../types";

describe("the fourteen renames", () => {
  it("maps every ladder state to its plain-language name", () => {
    expect(L.LADDER.durable).toBe("lasting");
    expect(L.LADDER.proficient).toBe("solid");
    expect(L.LADDER.familiar).toBe("shaky");
    expect(L.LADDER.attempted).toBe("tried");
    expect(L.LADDER.not_started).toBe("untouched");
  });

  it("renames the resource ladder in the first person, past tense", () => {
    expect(L.RESOURCE.reconstructed).toBe("rebuilt it");
    expect(L.RESOURCE.taught).toBe("taught it");
  });

  it("keeps the rest of the vocabulary", () => {
    expect(L.CORE).toBe("core");
    expect(L.MISSED_WHILE_SURE).toBe("missed while sure");
    expect(L.DRAFT_REFERENCE).toBe("reference not yet checked by you");
    expect(L.DEBRIEF).toBe("Sunday debrief"); // the default day
    expect(L.WRAP_UP).toBe("Wrap up");
    expect(L.WRAP_UP_TITLE).toBe("Stand up well");
    expect(L.SECOND_OPINION).toBe("second opinion");
    expect(L.SHIPPED).toBe("Things that exist");
    expect(L.CAPSTONE.done).toBe("exists");
  });

  it("takes the debrief day from the curriculum, not from the copy", () => {
    expect(L.debriefLabel("Friday")).toBe("Friday debrief");
    expect(L.debriefLabel("Saturday")).toBe("Saturday debrief");
    expect(L.ifCuePlaceholder("Friday")).toBe("it is Friday after breakfast");
    // Nothing loaded yet, or an author who left the field out: the model's default.
    expect(L.debriefLabel(undefined)).toBe("Sunday debrief");
    expect(L.debriefLabel("  ")).toBe("Sunday debrief");
  });

  it("counts real checks instead of printing a percentage", () => {
    expect(L.coverage(2, 84)).toBe("2 of 84 checks are yours");
    expect(L.coverage(0, 1)).toBe("0 of 1 check are yours");
  });

  it("puts the new words on the chips, never colour alone", () => {
    const ladder: LadderState[] = [
      "not_started",
      "attempted",
      "familiar",
      "proficient",
      "durable",
    ];
    const resources: ResourceState[] = ["reconstructed", "taught"];
    render(
      <>
        {ladder.map((s) => (
          <LadderChip key={s} state={s} />
        ))}
        {resources.map((s) => (
          <ResourceChip key={s} state={s} />
        ))}
        <ScoreChip score="partial" />
      </>,
    );
    for (const text of [
      "untouched",
      "tried",
      "shaky",
      "solid",
      "lasting",
      "rebuilt it",
      "taught it",
      "partly",
    ])
      expect(screen.getByText(text)).toBeInTheDocument();

    // The words they replaced are gone from the UI.
    for (const gone of ["durable", "proficient", "familiar", "attempted"])
      expect(screen.queryByText(gone)).toBeNull();
  });
});
