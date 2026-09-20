import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Chip, CapstoneChip } from "../components/Chip";
import { MISSED_WHILE_SURE, debriefLabel, errorCategoryLabel } from "../labels";
import { getWeeklyReview, resolveError } from "../api";
import { useDebriefDay } from "../store";
import type { CalibrationBucket, Debrief as DebriefData, LedgerError } from "../types";

/** Four blocks and a sticky sidebar. Everything numeric lives here, never during work. */
export default function Debrief() {
  const [data, setData] = useState<DebriefData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState("");
  const debriefDay = useDebriefDay();

  useEffect(() => {
    getWeeklyReview()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error && !data) return <p className="err">Could not load the debrief: {error}</p>;
  if (!data) return <p className="muted">Loading…</p>;

  const open = data.errors.filter((e) => !e.resolved);

  return (
    <div data-screen-label="Weekly debrief">
      <h1>{debriefLabel(debriefDay)}</h1>
      <p style={{ margin: "var(--s2) 0 var(--s7)", fontSize: "14px", color: "var(--ink2)" }}>
        Week {data.weeks_on_plan} on plan · {data.banked_skips} schedule skip
        {data.banked_skips === 1 ? "" : "s"} banked this quarter.
      </p>

      <div className="debrief-grid">
        <div className="debrief-main">
          <div className="block">
            <div className="block-head">
              <div>
                <h2>1 · Cold sweep</h2>
                <p>
                  {data.retrieval_sweep.length} checks, drawn cold. Missed-while-sure comes
                  first.
                </p>
              </div>
            </div>
            {data.retrieval_sweep.length === 0 ? (
              <div className="block-body">
                <p className="muted" style={{ margin: 0 }}>
                  Nothing drawn this week.
                </p>
              </div>
            ) : (
              data.retrieval_sweep.map((item) => (
                <div className="sweep-row" key={item.check_id}>
                  <div className="sweep-prompt">{item.prompt}</div>
                  {item.overconfident_miss ? (
                    <Chip tone="amber">{MISSED_WHILE_SURE}</Chip>
                  ) : null}
                  <Link
                    className="btn btn-soft"
                    to={`/modules/${item.module_id}/checks/${item.check_id}`}
                  >
                    Attempt
                  </Link>
                </div>
              ))
            )}
          </div>

          <Calibration
            brier={data.calibration.brier}
            sentence={data.calibration.sentence}
            buckets={data.calibration.buckets}
          />

          <div className="block">
            <div className="block-head">
              <div>
                <h2>3 · Mistakes worth keeping</h2>
                <p>
                  {open.length} open. Write what fixed it, or re-test the check it came
                  from.
                </p>
              </div>
            </div>
            {open.length === 0 ? (
              <div className="block-body">
                <p className="muted" style={{ margin: 0 }}>
                  Nothing open. Everything logged has been settled.
                </p>
              </div>
            ) : (
              open.map((e) => (
                <ErrorCard
                  key={e.id}
                  error={e}
                  onResolved={(next) =>
                    setData({
                      ...data,
                      errors: data.errors.map((x) => (x.id === next.id ? next : x)),
                    })
                  }
                />
              ))
            )}
          </div>

          <div className="block">
            <div className="block-body">
              <h2 style={{ margin: 0, fontSize: "16px" }}>4 · Next week</h2>
              <p style={{ margin: "var(--s2) 0 var(--s4)", fontSize: "13px" }}>
                Scheduled: {data.replan.map((m) => m.title).join(", ") || "nothing"}.
              </p>
              <label htmlFor="weekplan">If-then plans for the week</label>
              <textarea
                id="weekplan"
                className="scratch"
                rows={3}
                value={plan}
                placeholder="IF … THEN I will …"
                onChange={(ev) => setPlan(ev.target.value)}
              />
              <p style={{ margin: "var(--s3) 0 0", fontSize: "12px", color: "var(--ink3)" }}>
                Scratch space, local to this page. The plan on your desk is the one you
                write when you wrap up a session.
              </p>
            </div>
          </div>
        </div>

        <div className="debrief-side">
          <Hours data={data} />
          <div className="pane">
            <div className="pane-head">
              <h2 style={{ fontSize: "14px" }}>Things shipped</h2>
              <Link className="btn-inline" to="/shipped">
                Board →
              </Link>
            </div>
            <div style={{ marginTop: "var(--s4)" }}>
              {(data.shipped ?? data.capstone).map((a) => (
                <div className="mini-row" key={a.id}>
                  <span style={{ minWidth: 0 }}>{a.title}</span>
                  <CapstoneChip state={a.state} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calibration({
  brier,
  sentence,
  buckets,
}: {
  brier: number;
  sentence: string;
  buckets: CalibrationBucket[];
}) {
  return (
    <div className="block">
      <div className="block-head">
        <div>
          <h2>2 · How well you know what you know</h2>
          <p>{sentence}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: "24px", color: "var(--ink)" }}>
            {brier.toFixed(3)}
          </div>
          <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Brier</div>
        </div>
      </div>
      <div className="block-body">
        {buckets.map((b) => {
          const said = b.said ?? Math.round(b.mean_confidence);
          const was = b.was ?? Math.round(b.observed * 100);
          return (
            <div className="calib-row" key={b.bucket}>
              <div className="calib-bucket">{b.bucket}</div>
              <div
                className="calib-track"
                role="img"
                aria-label={
                  b.n === 0
                    ? `${b.bucket}: no attempts`
                    : `${b.bucket}: said ${said}%, was ${was}%`
                }
              >
                <div className="calib-said" style={{ width: `${b.n === 0 ? 0 : said}%` }} />
                <div className="calib-was" style={{ width: `${b.n === 0 ? 0 : was}%` }} />
              </div>
              <div className="calib-readout">
                {b.n === 0 ? "—" : `said ${said}% · was ${was}%`}
              </div>
            </div>
          );
        })}
        <div className="legend">
          <span>
            <i style={{ background: "var(--vio-line)" }} />
            said
          </span>
          <span>
            <i style={{ background: "var(--vio)" }} />
            actually
          </span>
        </div>
      </div>
    </div>
  );
}

function ErrorCard({
  error,
  onResolved,
}: {
  error: LedgerError;
  onResolved(next: LedgerError): void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const resolve = async () => {
    setBusy(true);
    try {
      onResolved(await resolveError({ id: error.id, resolved: true, resolution: text }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="errcard">
      <div className="errcard-meta">
        <Chip>{errorCategoryLabel(error.category)}</Chip>
        <span className="mono" style={{ fontSize: "11.5px", color: "var(--ink3)" }}>
          {error.ts.slice(0, 10)}
        </span>
      </div>
      <p>{error.diagnosis}</p>
      <div className="errcard-form">
        <input
          type="text"
          aria-label={`What settled the ${errorCategoryLabel(error.category)} error?`}
          placeholder="What settled it?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="button"
          className="btn"
          disabled={busy || text.trim().length === 0}
          onClick={() => void resolve()}
        >
          Resolve
        </button>
      </div>
    </div>
  );
}

function Hours({ data }: { data: DebriefData }) {
  const weeks =
    data.hours_last_4_weeks ??
    data.burn_up.slice(-4).map((p) => ({ week: p.week, new: 0, review: 0, build: 0 }));
  const totals = weeks.map((w) => w.new + w.review + w.build);
  const max = Math.max(1, ...totals);
  return (
    <div className="pane">
      <h2 style={{ fontSize: "14px" }}>Hours, last four weeks</h2>
      <div className="hoursbars" style={{ marginTop: "var(--s4)" }}>
        {weeks.map((w, i) => (
          <div key={w.week}>
            <div
              className="hoursbar-fill"
              data-last={i === weeks.length - 1}
              style={{ height: `${Math.max(4, Math.round((totals[i] / max) * 70))}px` }}
              title={`week ${w.week}: ${totals[i].toFixed(1)} h`}
            />
            <span>w{w.week}</span>
          </div>
        ))}
      </div>
      <p style={{ margin: "var(--s4) 0 0", fontSize: "12px", color: "var(--ink3)" }}>
        The budget is a ceiling, not a target.
      </p>
    </div>
  );
}
