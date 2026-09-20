import type { WeekHours } from "../types";

/**
 * Hours are a budget, not a score: stacked new/review/build, and a plain sentence.
 * `sayBudget` is off where the Desk already prints the server's `slipping` line
 * right beside it — the same sentence twice on one strip read as a stutter.
 */
export function HoursBar({ hours, sayBudget = true }: { hours: WeekHours; sayBudget?: boolean }) {
  const logged = hours.new + hours.review + hours.build;
  const scale = Math.max(hours.budget, logged, 1);
  const pct = (v: number) => `${(v / scale) * 100}%`;
  const delta = hours.budget - logged;
  const sentence =
    logged === 0
      ? `Nothing logged yet. The budget is ${hours.budget} h a week.`
      : Math.abs(delta) < 0.05
        ? "On budget this week."
        : delta > 0
          ? `${delta.toFixed(1)} h under budget this week. Under is fine.`
          : `${Math.abs(delta).toFixed(1)} h over budget this week.`;

  return (
    <div>
      <div className="pane-head">
        <h2>Hours this week</h2>
        <span className="mono" style={{ fontSize: "12.5px", color: "var(--ink3)" }}>
          {logged.toFixed(1)} / {hours.budget}
        </span>
      </div>
      <div
        className="bar"
        style={{ marginTop: "var(--s3)" }}
        role="img"
        aria-label={`${logged.toFixed(1)} hours logged of ${hours.budget} budgeted: new ${hours.new}, review ${hours.review}, build ${hours.build}`}
      >
        <span className="seg-new" style={{ width: pct(hours.new) }} />
        <span className="seg-review" style={{ width: pct(hours.review) }} />
        <span className="seg-build" style={{ width: pct(hours.build) }} />
      </div>
      <div className="legend">
        <span>new {hours.new.toFixed(1)} h</span>
        <span>review {hours.review.toFixed(1)} h</span>
        <span>build {hours.build.toFixed(1)} h</span>
        {sayBudget ? <span>{sentence}</span> : null}
      </div>
    </div>
  );
}
