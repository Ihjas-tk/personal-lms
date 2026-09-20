import { useEffect } from "react";
import { Link } from "react-router";
import { useStore } from "../store";
import { WRAP_UP } from "../labels";
import type { SessionPhase } from "../types";

const PHASES: SessionPhase[] = ["new", "review", "build"];

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
}

/**
 * The session lives in the rail foot: elapsed time, the module, the phase switch
 * and Wrap up. When nothing is open the same slot says so and offers a start.
 */
export default function SessionCard({
  onWrapUp,
  onStart,
  canStart,
}: {
  onWrapUp(): void;
  onStart(): void;
  canStart: boolean;
}) {
  const session = useStore((s) => s.session);
  const elapsed = useStore((s) => s.elapsed);
  const desk = useStore((s) => s.desk);
  const tick = useStore((s) => s.tick);
  const setPhase = useStore((s) => s.setPhase);

  useEffect(() => {
    if (!session) return;
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [tick, session]);

  if (!session) {
    const week = desk ? `Week ${desk.week_now} of ${desk.weeks_total}.` : "";
    return (
      <div className="session-idle">
        <p>Not working yet. {week}</p>
        <button
          type="button"
          className="btn btn-primary btn-wide"
          onClick={onStart}
          disabled={!canStart}
        >
          Start a session
        </button>
      </div>
    );
  }

  return (
    <div className="session-card">
      <div className="session-top">
        <div className="session-eyebrow">Session</div>
        <div className="session-clock" aria-label="Elapsed session time">
          {clock(elapsed)}
        </div>
      </div>
      <Link className="session-module" to={`/modules/${session.module_id}`}>
        {session.module_id}
      </Link>
      <div className="session-phases" role="group" aria-label="Session phase">
        {PHASES.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={session.phase === p}
            onClick={() => void setPhase(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary btn-wide" onClick={onWrapUp}>
        {WRAP_UP}
      </button>
    </div>
  );
}
