import { useState } from "react";
import { SECOND_OPINION } from "../labels";
import { critique as callCritique } from "../api";
import type { CritiqueLine } from "../types";

const title = `${SECOND_OPINION[0].toUpperCase()}${SECOND_OPINION.slice(1)}`;

/**
 * The second opinion (§7.2). It runs only on a submitted attempt, it writes its
 * verdict as a sub-line under each rubric row, and it never touches the score.
 */
export default function CritiquePanel({
  attemptPath,
  blockedReason,
  onResult,
}: {
  attemptPath: string;
  blockedReason: string | null;
  onResult(lines: CritiqueLine[]): void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const run = async () => {
    setBusy(true);
    setError(null);
    await callCritique(
      { attempt_path: attemptPath },
      {
        onDone: (result) => {
          onResult(result?.lines ?? []);
          setDone(true);
        },
        onError: (m) => setError(m),
      },
    );
    setBusy(false);
  };

  return (
    <div className="critique">
      <button
        type="button"
        className="btn"
        disabled={!!blockedReason || busy || done}
        title={blockedReason ?? undefined}
        aria-disabled={!!blockedReason}
        onClick={run}
      >
        {busy ? "Asking…" : done ? `${title} given` : `Ask for a ${SECOND_OPINION}`}
      </button>
      {blockedReason ? <p className="critique-reason">{blockedReason}</p> : null}
      {error ? (
        <p className="err" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
