import { useEffect, useState } from "react";
import { Link } from "react-router";
import Row, { shortDate } from "../components/Row";
import { MISSED_WHILE_SURE, debriefLabel, ladderLabel } from "../labels";
import { getDue } from "../api";
import { useDebriefDay, useStore } from "../store";
import type { DueItem } from "../types";

const FIRST_BATCH = 4;

export default function Review() {
  const [items, setItems] = useState<DueItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const revision = useStore((s) => s.vaultRevision);
  const debriefDay = useDebriefDay();

  useEffect(() => {
    getDue()
      .then(setItems)
      .catch((e: Error) => setError(e.message));
  }, [revision]);

  if (error && !items) return <p className="err">Could not load the queue: {error}</p>;
  if (!items) return <p className="muted">Loading…</p>;

  const shown = showAll ? items : items.slice(0, FIRST_BATCH);

  return (
    <div data-screen-label="Review">
      <div className="screen-head">
        <div>
          <h1>Due now</h1>
          <p>
            Sorted by days overdue, then by what you missed while sure. Time-boxed to four
            at a time.
          </p>
        </div>
        <Link className="btn" to="/review/weekly">
          {debriefLabel(debriefDay)}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="empty">Nothing is due. Go and learn something new.</p>
      ) : (
        <>
          <div className="rowlist">
            {shown.map((item) => (
              <Row
                key={item.check_id}
                tone={item.overdue_days > 0 ? "late" : "now"}
                weeks={item.type}
                date={item.next_due ? `due ${shortDate(item.next_due)}` : ""}
                title={item.prompt}
                to={`/modules/${item.module_id}/checks/${item.check_id}`}
                sub={item.module_id}
                proof={{ total: 0, lasting: 0, partial: 0 }}
                proofText={ladderLabel(item.state)}
                warning={warning(item)}
              >
                <Link
                  className="btn btn-primary"
                  to={`/modules/${item.module_id}/checks/${item.check_id}`}
                >
                  Re-test
                </Link>
              </Row>
            ))}
          </div>
          {!showAll && items.length > FIRST_BATCH ? (
            <button
              type="button"
              className="btn"
              style={{ marginTop: "var(--s4)" }}
              onClick={() => setShowAll(true)}
            >
              Show the other {items.length - FIRST_BATCH}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

function warning(item: DueItem): string | null {
  const parts = [
    item.overconfident_miss ? MISSED_WHILE_SURE : null,
    item.overdue_days > 0
      ? `${item.overdue_days} day${item.overdue_days === 1 ? "" : "s"} overdue`
      : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}
