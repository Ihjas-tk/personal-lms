import { useState } from "react";
import { Link } from "react-router";
import { CapstoneChip } from "./Chip";
import {
  ALL_NOTES,
  BEHIND_LINE,
  PRODUCES,
  PUSH_BACK,
  SETUP_ONCE,
  TIME_HERE,
} from "../labels";
import { agoShort } from "../time";
import { patchChore, shiftPlan } from "../api";
import type { ModuleWorkspace } from "../types";

/**
 * The 300px column: the chores that are not syllabus, the habit as a sentence,
 * the hours as a budget, the note files, and what the module is meant to produce.
 */
export default function ModuleSidebar({
  module: m,
  onChanged,
  onOpenNote,
}: {
  module: ModuleWorkspace;
  onChanged(next: ModuleWorkspace): void;
  onOpenNote(topicId: string): void;
}) {
  const [shifting, setShifting] = useState(false);
  const [shifted, setShifted] = useState(false);
  const pct = m.budget_hours ? Math.min(100, (m.actual_hours / m.budget_hours) * 100) : 0;
  // The server works this out: the soft date passed with budget unspent, or less
  // logged than the elapsed share of the module's week window expects (§1d).
  const behind = m.behind;

  const tick = (topicId: string, done: boolean) => {
    void patchChore(m.id, topicId, done)
      .then(onChanged)
      .catch(() => {});
  };

  const push = async () => {
    setShifting(true);
    try {
      await shiftPlan(1);
      setShifted(true);
    } finally {
      setShifting(false);
    }
  };

  return (
    <aside className="modside">
      {m.chores.length || m.habits.length ? (
        <section className="card-pane">
          <header className="card-pane-head">
            <h2>{SETUP_ONCE}</h2>
          </header>
          {m.chores.map((c) => (
            <button
              key={c.topic_id}
              type="button"
              role="checkbox"
              aria-checked={c.done}
              className="chore"
              onClick={() => tick(c.topic_id, !c.done)}
            >
              <span className="chore-box" aria-hidden="true">
                {c.done ? "✓" : ""}
              </span>
              <span className="chore-label">{c.title}</span>
            </button>
          ))}
          {m.habits.length ? (
            <p className="habit">Habit: {m.habits.map((h) => h.title).join("; ")}</p>
          ) : null}
        </section>
      ) : null}

      <section className="card-box">
        <h2>{TIME_HERE}</h2>
        <div className="time-row">
          <span>Logged</span>
          <span className="mono">{m.actual_hours.toFixed(1)} h</span>
        </div>
        <div className="time-track">
          <div className="time-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="time-note">
          of a {m.budget_hours} h budget. Weeks {m.weeks[0]}–{m.weeks[1]}
          {m.soft_date ? `, soft date ${m.soft_date}` : ""}
          {behind ? ` — ${BEHIND_LINE}.` : "."}
        </p>
        <button
          type="button"
          className="btn btn-wide"
          disabled={shifting || shifted}
          onClick={() => void push()}
        >
          {shifted ? "Pushed back a week" : PUSH_BACK}
        </button>
      </section>

      <section className="card-box">
        <div className="card-box-head">
          <h2>{ALL_NOTES}</h2>
          <span>
            {m.all_notes.length} file{m.all_notes.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="notefiles">
          {m.all_notes.map((n) =>
            n.topic_id ? (
              <button
                key={n.path}
                type="button"
                className="mono notefile"
                onClick={() => onOpenNote(n.topic_id as string)}
              >
                <span className="notefile-path">{n.path}</span>
                <span>{agoShort(n.updated)}</span>
              </button>
            ) : (
              <span key={n.path} className="mono notefile" data-plain="true">
                <span className="notefile-path">{n.path}</span>
                <span>{agoShort(n.updated)}</span>
              </span>
            ),
          )}
          {m.all_notes.length === 0 ? (
            <p className="muted notefile-empty">No note files yet.</p>
          ) : null}
        </div>
      </section>

      {m.capstone.length ? (
        <section className="card-box">
          <h2>{PRODUCES}</h2>
          <ul className="produces">
            {m.capstone.map((a) => (
              <li key={a.id}>
                <Link to="/shipped">{a.title}</Link>
                <CapstoneChip state={a.state} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
