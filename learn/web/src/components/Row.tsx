import { Link } from "react-router";
import type { ReactNode } from "react";
import type { RowTone } from "../types";

/** The mono column is 86px wide: "05 Sep" fits where an ISO date wraps. */
export const shortDate = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

export interface ProofCounts {
  total: number;
  /** Squares filled solid: checks that are yours. */
  lasting: number;
  /** Squares half-filled: attempted but not yet proved. */
  partial: number;
}

/**
 * One line of the track: marker bar, mono week/date column, title and sub-line,
 * proof squares, one amber warning, one action. Nothing else earns a column.
 */
export default function Row({
  tone = "later",
  weeks,
  date,
  title,
  to,
  sub,
  proof,
  proofText,
  warning,
  action,
  onAction,
  primary = false,
  children,
}: {
  tone?: RowTone;
  weeks: string;
  date: string;
  title: string;
  to?: string;
  sub: string;
  proof: ProofCounts;
  proofText: string;
  warning?: string | null;
  action?: string;
  onAction?(): void;
  primary?: boolean;
  children?: ReactNode;
}) {
  const squares = Array.from({ length: proof.total }, (_, i) =>
    i < proof.lasting ? "full" : i < proof.lasting + proof.partial ? "part" : "none",
  );

  return (
    <div className="row2" data-tone={tone}>
      <div className="row-mark" />
      <div className="row-when">
        {weeks}
        <br />
        {date}
      </div>
      <div className="row-main">
        {to ? (
          <Link className="row-title" to={to}>
            {title}
          </Link>
        ) : (
          <span className="row-title">{title}</span>
        )}
        <div className="row-sub">{sub}</div>
      </div>
      <div className="row-proof">
        <div
          className="row-squares"
          role="img"
          aria-label={proofText}
          title={proofText}
        >
          {squares.map((fill, i) => (
            <span key={i} className="row-square" data-fill={fill} />
          ))}
        </div>
        <div className="row-proof-text">{proofText}</div>
      </div>
      <div className="row-warn">{warning ?? ""}</div>
      {children ??
        (action ? (
          <button
            type="button"
            className={primary ? "btn btn-primary" : "btn"}
            onClick={onAction}
          >
            {action}
          </button>
        ) : null)}
    </div>
  );
}
