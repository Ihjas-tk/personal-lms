import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Row, { shortDate } from "../components/Row";
import { Chip } from "../components/Chip";
import { countWord } from "../labels";
import { getTrack, shiftPlan } from "../api";
import { useStore } from "../store";
import type { Track as TrackData, TrackRow } from "../types";

const format = (iso: string | null, opts: Intl.DateTimeFormatOptions) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", opts);
};

const monthYear = (iso: string | null) => format(iso, { month: "short", year: "numeric" });

/** The API sends shares as fractions 0–1 (api-v2-notes §2); the copy reads in percent. */
const pct = (share: number) => Math.round(share * 100);

export default function Track() {
  const [data, setData] = useState<TrackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const revision = useStore((s) => s.vaultRevision);

  const load = useCallback(() => {
    getTrack()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    load();
  }, [load, revision]);

  const shift = async () => {
    setBusy(true);
    try {
      await shiftPlan(1);
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (error && !data) return <p className="err">Could not load the track: {error}</p>;
  if (!data) return <p className="muted">Loading…</p>;

  const phase = data.this_phase;
  const phases = new Set(data.weeks.map((w) => w.phase_id).filter(Boolean)).size;

  return (
    <div data-screen-label="Track">
      <div className="screen-head">
        <div>
          <h1>The track</h1>
          <p>
            {data.weeks_total} weeks, {countWord(phases).toLowerCase()} phases.{" "}
            {pct(data.headline.lasting_pct)}% of core checks are lasting;{" "}
            {pct(data.headline.attempted_pct)}% have been attempted.
          </p>
        </div>
        <button type="button" className="btn" onClick={shift} disabled={busy}>
          Push everything back a week
        </button>
      </div>

      <div className="weekstrip">
        <div className="weekcells">
          {data.weeks.map((w) => (
            <div
              key={w.week}
              className="weekcell"
              data-state={w.state}
              title={`week ${w.week}`}
            />
          ))}
        </div>
        <div className="weeklabels">
          <span>week 1 · {monthYear(data.start_date)}</span>
          <span className="here">↑ week {data.week_now} — you are here</span>
          <span>
            week {data.weeks_total} · {monthYear(data.end_date)}
          </span>
        </div>
        <p>
          Every date is soft. Pushing the whole schedule back a week is a normal move and
          costs you one of your banked skips.
        </p>
      </div>

      {data.unfinished.length > 0 ? (
        <Section
          title="Left unfinished"
          count={`${data.unfinished.length} module${data.unfinished.length === 1 ? "" : "s"}`}
          tone="amber"
          blurb="Its weeks have passed and its checks are overdue. Finish it, or decide out loud to drop it."
          rows={data.unfinished}
        />
      ) : null}

      {phase ? (
        <Section
          title={`This phase — ${phase.title}`}
          count={`weeks ${phase.weeks[0]}–${phase.weeks[1]}`}
          tone="vio"
          blurb={
            phase.order_note ??
            `${phase.rows.length} modules, ${phase.hours_budget} hours budgeted.`
          }
          rows={phase.rows}
        />
      ) : null}

      {data.later.length > 0 ? (
        <Section
          title="After this"
          count={`${data.later.length} module${data.later.length === 1 ? "" : "s"}`}
          tone="plain"
          blurb="Not your problem yet. Listed so the shape of the nine months stays visible."
          rows={data.later}
          quiet
        />
      ) : null}
    </div>
  );
}

function Section({
  title,
  count,
  tone,
  blurb,
  rows,
  quiet = false,
}: {
  title: string;
  count: string;
  tone: "plain" | "amber" | "vio";
  blurb: string;
  rows: TrackRow[];
  quiet?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <section className="band-section">
      <div className="band-heading">
        <h2>{title}</h2>
        <Chip tone={tone}>{count}</Chip>
      </div>
      <p className="band-blurb">{blurb}</p>
      <div className="rowlist" data-quiet={quiet}>
        {rows.map((r) => (
          <Row
            key={r.module_id}
            tone={r.tone}
            weeks={`weeks ${r.weeks[0]}–${r.weeks[1]}`}
            date={r.due ? `due ${shortDate(r.due)}` : ""}
            title={r.title}
            to={`/modules/${r.module_id}`}
            sub={subLine(r)}
            proof={{
              total: r.proof.total,
              lasting: r.proof.lasting,
              partial: r.proof.partial,
            }}
            proofText={r.proof_text}
            warning={r.warning}
            action={r.action}
            primary={r.tone !== "later" && r.action !== "Preview"}
            onAction={() => navigate(`/modules/${r.module_id}`)}
          />
        ))}
      </div>
    </section>
  );
}

function subLine(r: TrackRow): string {
  const hours =
    r.hours_logged > 0
      ? `${r.hours_logged.toFixed(1)} of ${r.hours_budget} h logged`
      : "nothing logged yet";
  return [r.track, hours, r.artefact_state === "draft" ? "artefact in draft" : null]
    .filter(Boolean)
    .join(" · ");
}
