import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import Band from "../components/Band";
import Ridge from "../components/Ridge";
import Stat from "../components/Stat";
import { HoursBar } from "../components/HoursBar";
import { DEBRIEF, ladderLabel } from "../labels";
import { useStore } from "../store";
import type { Desk as DeskData } from "../types";

const plural = (n: number, one: string) => `${one}${n === 1 ? "" : "s"}`;

export default function Desk({ onStart }: { onStart(moduleId: string): void }) {
  const desk = useStore((s) => s.desk);
  const error = useStore((s) => s.deskError);
  const loadDesk = useStore((s) => s.loadDesk);
  const session = useStore((s) => s.session);
  const revision = useStore((s) => s.vaultRevision);
  const navigate = useNavigate();

  useEffect(() => {
    void loadDesk();
  }, [loadDesk, revision, session]);

  if (error && !desk) return <p className="err">Could not load the desk: {error}</p>;
  if (!desk) return <p className="muted">Loading…</p>;

  const fr = desk.first_run;
  const st = desk.standing;
  const target = desk.warmup[0]?.module_id ?? desk.first_action?.module_id ?? null;

  return (
    <div data-screen-label="Desk">
      <div className="deskline">
        <span>
          week {desk.week_now} of {desk.weeks_total}
        </span>
        <span>
          {st.skips_banked === 0
            ? "nothing banked"
            : `${st.skips_banked} schedule ${plural(st.skips_banked, "skip")} banked`}
        </span>
      </div>

      <Band
        eyebrow={fr ? "Your first session" : "The plan you wrote on Sunday"}
        cue={
          desk.plan?.text ??
          desk.first_action?.label ??
          "No cue yet. You will write your own at the end of this session."
        }
        action={
          session ? (
            <button
              type="button"
              className="btn btn-big"
              onClick={() => navigate(`/modules/${session.module_id}`)}
            >
              Back to the session
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-big"
              disabled={!target}
              onClick={() => target && onStart(target)}
            >
              {desk.start_label}
            </button>
          )
        }
        hint={
          fr
            ? "You will write your own cue at the end."
            : "Warm-up first, then the module it belongs to."
        }
        aside={<Warmup desk={desk} />}
      />

      <div className="stats">
        <Stat
          value={String(st.checks_lasting)}
          label="checks are yours"
          sub={`of ${st.core_total} core checks · proved cold, twice`}
        />
        <Stat
          value={String(st.artefacts_exist)}
          label="capstone artefacts exist"
          sub={`of ${st.artefacts_total}${st.artefact_note ? ` · ${st.artefact_note}` : ""}`}
        />
        <Stat
          value={String(st.weeks_left)}
          label="weeks left on the plan"
          sub={`at ${st.weekly_budget} h a week · ${st.skips_banked} ${plural(st.skips_banked, "skip")} banked`}
        />
      </div>

      <div className="section-head">
        <h2>What you can actually do</h2>
        <span style={{ fontSize: "12.5px", color: "var(--ink3)" }}>
          {fr
            ? "Nothing proved yet — this fills in from the checks you pass"
            : `${st.checks_lasting} of ${st.core_total} core checks are yours`}
        </span>
      </div>
      <div style={{ marginTop: "var(--s4)" }}>
        <Ridge
          columns={desk.ridge}
          foot="A bar moves only when a check is passed cold, from memory"
        />
      </div>

      <div className="trio">
        <Gains desk={desk} />
        <Calibration desk={desk} />
        <Proved desk={desk} />
      </div>

      <div className="strip">
        <div className="strip-grow">
          <HoursBar hours={desk.hours} sayBudget={false} />
        </div>
        <div className="strip-grow" style={{ flexBasis: "240px" }}>
          <h2>Slipping</h2>
          <p style={{ margin: "var(--s2) 0 0", fontSize: "12.5px", color: "var(--ink2)" }}>
            {desk.slipping}
          </p>
        </div>
        <Link className="btn btn-soft" to="/review/weekly">
          {DEBRIEF}
        </Link>
      </div>
    </div>
  );
}

function Warmup({ desk }: { desk: DeskData }) {
  if (desk.warmup.length === 0) return null;
  return (
    <div className="warmup">
      <div className="warmup-head">
        <h2>First ten minutes</h2>
        <span style={{ fontSize: "11.5px", color: "var(--ink3)" }}>
          {desk.warmup.length} items · about 5 min
        </span>
      </div>
      <ol className="warmup-list">
        {desk.warmup.map((w, i) => (
          <li className="warmup-item" key={w.check_id}>
            <span className="warmup-index" aria-hidden="true">
              {i + 1}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <Link
                className="warmup-prompt"
                to={`/modules/${w.module_id}/checks/${w.check_id}`}
              >
                {w.prompt}
              </Link>
              <span className="warmup-reason" style={{ display: "block" }}>
                {w.reason}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <p className="warmup-foot">
        Skippable, and the skip is recorded rather than punished.
      </p>
    </div>
  );
}

function Gains({ desk }: { desk: DeskData }) {
  const g = desk.gains;
  const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : "0");
  const rows: [string, string][] = desk.first_run
    ? [
        ["0", "checks proved so far — the first one is about ten minutes away"],
        ["0", "artefacts started of the eight the capstone needs"],
        [String(desk.weeks_total), "weeks of plan ahead of you"],
      ]
    : [
        [signed(g.lasting_delta_4w), "checks became lasting — proved twice, a week apart"],
        [signed(g.solid_delta_4w), "checks became solid"],
        [signed(g.checks_attempted_4w), "checks attempted for the first time"],
        [g.hours_4w.toFixed(1), "hours logged in those four weeks"],
      ];
  return (
    <div className="pane">
      <h2>Four weeks of gains</h2>
      <p className="pane-sub">Movement, not totals.</p>
      {rows.map(([num, label]) => (
        <div className="gain" key={label}>
          <div className="gain-num" data-flat={!num.startsWith("+") && !num.startsWith("−")}>
            {num}
          </div>
          <div className="gain-text">{label}</div>
        </div>
      ))}
    </div>
  );
}

function Calibration({ desk }: { desk: DeskData }) {
  const points = desk.calibration_by_week;
  const now = points.length ? points[points.length - 1].brier : null;
  return (
    <div className="pane">
      <div className="pane-head">
        <h2>Knowing what you know</h2>
        <span className="mono" style={{ fontSize: "13px" }}>
          {now === null ? "—" : now.toFixed(2)}
        </span>
      </div>
      <p className="pane-sub">Brier score by week. Lower is better.</p>
      <div className="brier">
        {points.map((p, i) => (
          <div className="brier-col" key={p.week}>
            <div
              className="brier-bar"
              data-last={i === points.length - 1}
              style={{ height: `${Math.max(4, Math.round(p.brier * 140))}px` }}
              title={`week ${p.week}: ${p.brier.toFixed(2)}`}
            />
            <span>w{p.week}</span>
          </div>
        ))}
      </div>
      <p className="pane-sub" style={{ marginTop: "var(--s4)", marginBottom: 0 }}>
        {points.length === 0
          ? "Rate your confidence before each answer and this starts reading after three graded attempts."
          : "Your confidence against what actually happened, week by week."}
      </p>
    </div>
  );
}

function Proved({ desk }: { desk: DeskData }) {
  return (
    <div className="pane">
      <div className="pane-head">
        <h2>Newly proved</h2>
        <Link className="btn-inline" to="/review">
          All →
        </Link>
      </div>
      <p className="pane-sub">The only progress that counts.</p>
      {desk.newly_proved.length === 0 ? (
        <p className="feed-text">
          Nothing proved yet. A check becomes yours after two clean passes, at least a week
          apart. Reading alone never moves anything here.
        </p>
      ) : (
        desk.newly_proved.map((p, i) => (
          <div className="feed-item" key={p.check_id}>
            <span className="feed-dot" data-fresh={i === 0} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <Link className="feed-text" to={`/modules/${p.module_id}`}>
                {p.prompt}
              </Link>
              <span className="feed-when" style={{ display: "block" }}>
                {ladderLabel(p.state)} · {p.date}
              </span>
            </span>
          </div>
        ))
      )}
    </div>
  );
}
