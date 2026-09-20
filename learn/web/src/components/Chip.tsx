import type { CapstoneState, LadderState, ResourceState, Score } from "../types";
import {
  CAPSTONE,
  LADDER,
  LADDER_TONE,
  RESOURCE,
  SCORE,
  type Tone,
} from "../labels";

export type { Tone };

/** Four tones, and the text is always there — colour is never the only signal. */
export function Chip({
  children,
  tone = "plain",
  title,
}: {
  children: React.ReactNode;
  tone?: Tone;
  title?: string;
}) {
  return (
    <span className="chip" data-tone={tone} title={title}>
      {children}
    </span>
  );
}

export function LadderChip({ state }: { state: LadderState }) {
  return <Chip tone={LADDER_TONE[state]}>{LADDER[state]}</Chip>;
}

export const RESOURCE_STATES: ResourceState[] = [
  "queued",
  "skimmed",
  "read",
  "reconstructed",
  "taught",
];

export function ResourceChip({ state }: { state: ResourceState }) {
  const counts = state === "reconstructed" || state === "taught";
  return (
    <Chip
      tone={counts ? "good" : "plain"}
      title={counts ? "Counts toward the module" : "Does not count toward the module"}
    >
      {RESOURCE[state]}
    </Chip>
  );
}

export function ScoreChip({ score }: { score: Score }) {
  const tone: Tone = score === "fluent" ? "good" : score === "partial" ? "amber" : "plain";
  return <Chip tone={tone}>{SCORE[score]}</Chip>;
}

export function CapstoneChip({ state }: { state: CapstoneState }) {
  const tone: Tone = state === "done" ? "good" : state === "not_started" ? "plain" : "vio";
  return <Chip tone={tone}>{CAPSTONE[state]}</Chip>;
}

export const ladderLabel = (s: LadderState) => LADDER[s];
export const scoreLabel = (s: Score) => SCORE[s];
