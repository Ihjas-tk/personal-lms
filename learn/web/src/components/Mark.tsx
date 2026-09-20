import type { CSSProperties } from "react";

/**
 * The brand mark — "the return": four half-turns on one horizontal axis, each 11
 * units further out than the last on a 64-unit box, drawn as one continuous path
 * of even weight. Normative source: `learn/docs/ux/redesign/design_handoff_learn_redesign`
 * (§ Brand) and `web/public/brand/mark.svg`.
 *
 * One cut serves every size; there is no simplified small variant. Never taper the
 * stroke, add a dot, close the outer turn, tilt it, outline it, or put it in a
 * container other than the app icon.
 *
 * Colour comes from `currentColor`, so the caller sets `color: var(--vio)` and the
 * mark is #6D3BEE on light and #A78BFA on dark without a second asset.
 */

/** The single path. Exported so the Desk's draw-on animation can measure it. */
export const MARK_PATH =
  "M40 32 A9.5 9.5 0 0 1 21 32 A15 15 0 0 1 51 32 A20.5 20.5 0 0 1 10 32 A26 26 0 0 1 62 32";

export default function Mark({
  size = 28,
  strokeWidth = 4,
  className,
  style,
}: {
  /** Edge of the square the mark is drawn in, in px. 16 is the floor. */
  size?: number;
  /** Even 4.0 at a 64-unit box. 4.4 knocked out of a violet fill, 4.2 on dark. */
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="mark-path"
        d={MARK_PATH}
        transform="translate(-4,2.75)"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
