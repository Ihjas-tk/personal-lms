import { Chip } from "./Chip";
import type { LadderState, RidgeColumn } from "../types";

/** Segment order is bottom-up: the column is `flex-direction: column-reverse`. */
const SEGMENTS: { key: keyof RidgeColumn["counts"]; state: LadderState; name: string }[] = [
  { key: "lasting", state: "durable", name: "lasting" },
  { key: "solid", state: "proficient", name: "solid" },
  { key: "shaky", state: "familiar", name: "shaky" },
  { key: "tried", state: "attempted", name: "tried" },
  { key: "untouched", state: "not_started", name: "untouched" },
];

const LEGEND = [
  ["lasting — two clean passes a week apart", "var(--good)", ""],
  ["solid", "var(--vio)", ""],
  ["shaky", "var(--amber)", ""],
  ["tried", "var(--vio-line)", ""],
  ["untouched", "var(--surf2)", "1px solid var(--line)"],
] as const;

/** One column per skill area — never one number for the whole track. */
export default function Ridge({
  columns,
  foot,
}: {
  columns: RidgeColumn[];
  foot: string;
}) {
  return (
    <div className="panel">
      <div className="ridge">
        {columns.map((col) => {
          const c = col.counts;
          const total = SEGMENTS.reduce((sum, s) => sum + c[s.key], 0);
          const yours = c.lasting + c.solid;
          return (
            <div className="ridge-col" key={col.area_id}>
              <div className="ridge-count">
                {yours} / {total}
              </div>
              <div
                className="ridge-bar"
                role="img"
                aria-label={`${col.title}: ${SEGMENTS.map((s) => `${c[s.key]} ${s.name}`).join(", ")}`}
              >
                {SEGMENTS.map((s) =>
                  c[s.key] === 0 ? null : (
                    <div
                      key={s.key}
                      className="ridge-seg"
                      data-state={s.state}
                      style={{ flex: c[s.key] }}
                      title={`${c[s.key]} ${s.name}`}
                    />
                  ),
                )}
              </div>
              <div>
                <div className="ridge-name">{col.title}</div>
                <div className="ridge-scope">{col.scope}</div>
              </div>
              <div className="ridge-delta">
                {col.delta_4w > 0 ? (
                  <Chip tone="good">+{col.delta_4w} in four weeks</Chip>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div className="ridge-legend">
        {LEGEND.map(([label, background, border]) => (
          <span key={label}>
            <i style={{ background, border: border || undefined }} />
            {label}
          </span>
        ))}
        <span className="push">{foot}</span>
      </div>
    </div>
  );
}
