import type { ReactNode } from "react";

/**
 * The violet tonight panel. One per screen at most — it is the only thing on the
 * page allowed to be loud, so nothing competes with "what do I do".
 */
export default function Band({
  eyebrow,
  cue,
  action,
  hint,
  aside,
}: {
  eyebrow: string;
  cue: string;
  action: ReactNode;
  hint: string;
  aside?: ReactNode;
}) {
  return (
    <section className="band">
      <div className="band-grid">
        <div>
          <div className="band-eyebrow">{eyebrow}</div>
          <p className="band-cue">{cue}</p>
          <div className="band-actions">
            {action}
            <span className="band-hint">{hint}</span>
          </div>
        </div>
        {aside}
      </div>
    </section>
  );
}
