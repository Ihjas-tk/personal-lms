import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CapstoneChip } from "../components/Chip";
import { SHIPPED } from "../labels";
import { getCapstone, patchCapstone } from "../api";
import type { CapstoneArtefact } from "../types";

/** Binary by design: a thing exists or it does not. The board reads as a queue. */
export default function Shipped() {
  const [items, setItems] = useState<CapstoneArtefact[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCapstone()
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, []);

  const advance = async (a: CapstoneArtefact) => {
    try {
      setItems(
        await patchCapstone({
          id: a.id,
          state: a.state === "not_started" ? "draft" : a.state,
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (error && !items) return <p className="err">Could not load the board: {error}</p>;
  if (!items) return <p className="muted">Loading…</p>;

  return (
    <div data-screen-label="Capstone board">
      <h1>{SHIPPED}</h1>
      <p style={{ margin: "var(--s2) 0 var(--s7)", fontSize: "14px", color: "var(--ink2)" }}>
        {items.length} artefacts. Each one either exists or does not — there is no
        percentage.
      </p>

      <div className="shipped-grid">
        {items.map((a) => (
          <article className="artefact" key={a.id} data-draft={a.state === "draft"}>
            <div className="artefact-head">
              <h2>{a.title}</h2>
              <CapstoneChip state={a.state} />
            </div>
            {a.description ? <p className="artefact-desc">{a.description}</p> : null}
            <div className="artefact-next">
              {/* The store fills a missing next action with "", not null, so `??` left
                  an empty grey bar on seven of the eight cards. */}
              {a.next_action || "No next action written yet."}
            </div>
            <div className="artefact-foot">
              <span className="mono" style={{ fontSize: "11.5px", color: "var(--ink3)" }}>
                {a.path ?? "—"}
              </span>
              {a.state === "not_started" ? (
                <button type="button" className="btn" onClick={() => void advance(a)}>
                  Start
                </button>
              ) : (
                <Link className="btn btn-primary" to={`/modules/${a.modules[0] ?? ""}`}>
                  Open
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
