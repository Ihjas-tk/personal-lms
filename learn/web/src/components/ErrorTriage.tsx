import { useState } from "react";
import { Link } from "react-router";
import { Chip } from "./Chip";
import { resolveError } from "../api";
import type { LedgerError } from "../types";

/** §2.4 block 3: resolve each unresolved error, or convert it to a Check. */
export default function ErrorTriage({ errors }: { errors: LedgerError[] }) {
  const [rows, setRows] = useState(errors.filter((e) => !e.resolved));
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [failed, setFailed] = useState<string | null>(null);

  const resolve = async (id: string) => {
    try {
      await resolveError({ id, resolved: true, resolution: drafts[id] ?? "" });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setFailed((e as Error).message);
    }
  };

  if (rows.length === 0)
    return <p className="empty">No unresolved errors in the ledger.</p>;

  return (
    <div className="stack">
      {failed ? (
        <p className="err" role="alert">
          {failed}
        </p>
      ) : null}
      {rows.map((e) => (
        <article className="card" key={e.id}>
          <div className="row spread">
            <div className="row">
              <Chip>{e.category}</Chip>
              {e.module_id ? (
                <Link to={`/modules/${e.module_id}`}>{e.module_id}</Link>
              ) : null}
            </div>
            <span className="muted" style={{ fontSize: "0.82rem" }}>
              {e.ts}
            </span>
          </div>
          <p style={{ margin: "0.5rem 0" }}>{e.diagnosis}</p>
          <label htmlFor={`res-${e.id}`}>Resolution</label>
          <textarea
            id={`res-${e.id}`}
            rows={2}
            value={drafts[e.id] ?? ""}
            onChange={(ev) => setDrafts((d) => ({ ...d, [e.id]: ev.target.value }))}
          />
          <div className="row" style={{ marginTop: "0.5rem" }}>
            <button
              type="button"
              disabled={!(drafts[e.id] ?? "").trim()}
              onClick={() => resolve(e.id)}
            >
              Resolve
            </button>
            {e.check_id ? (
              <Link to={`/modules/${e.module_id ?? ""}/checks/${e.check_id}`}>
                Re-test the Check it came from
              </Link>
            ) : (
              <span className="muted" style={{ fontSize: "0.82rem" }}>
                To convert this into a Check, add it to your <code>track.yaml</code>.
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
