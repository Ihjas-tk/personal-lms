import { Link, useLocation } from "react-router";
import Mark from "./Mark";
import SessionCard from "./SessionCard";
import ThemeToggle from "./ThemeToggle";

/** Module and attempt routes belong to the track, so "The track" stays lit there. */
const DESTINATIONS = [
  { to: "/", label: "Desk", match: (p: string) => p === "/" },
  {
    to: "/track",
    label: "The track",
    match: (p: string) => p.startsWith("/track") || p.startsWith("/modules"),
  },
  { to: "/review", label: "Review", match: (p: string) => p.startsWith("/review") },
  { to: "/shipped", label: "Shipped", match: (p: string) => p.startsWith("/shipped") },
];

export default function Rail({
  dueCount,
  shipped,
  vaultGit,
  onWrapUp,
  onStart,
  canStart,
}: {
  dueCount: number;
  shipped: { exist: number; total: number } | null;
  vaultGit: boolean | null;
  onWrapUp(): void;
  onStart(): void;
  canStart: boolean;
}) {
  const { pathname } = useLocation();

  const badge = (to: string) => {
    if (to === "/review" && dueCount > 0)
      return { text: String(dueCount), label: `${dueCount} due for review` };
    if (to === "/shipped" && shipped)
      return {
        text: `${shipped.exist} / ${shipped.total}`,
        label: `${shipped.exist} of ${shipped.total} artefacts exist`,
      };
    return null;
  };

  return (
    <nav className="rail" aria-label="Sections">
      {/* The horizontal lockup, bare: the mark never sits in a tile outside the app icon. */}
      <div className="rail-brand">
        <Mark className="rail-mark" size={28} />
        <h1>learn</h1>
      </div>

      <div className="rail-nav">
        {DESTINATIONS.map((d) => {
          const b = badge(d.to);
          const active = d.match(pathname);
          return (
            <Link
              key={d.to}
              to={d.to}
              className="rail-link"
              aria-current={active ? "page" : undefined}
            >
              <span>{d.label}</span>
              {b ? (
                <span className="rail-badge" aria-label={b.label}>
                  {b.text}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="rail-foot">
        {vaultGit === false ? (
          <p className="rail-note">
            Vault is not a git repo — snapshots fall back to file backups.
          </p>
        ) : null}
        <SessionCard onWrapUp={onWrapUp} onStart={onStart} canStart={canStart} />
        <ThemeToggle />
      </div>
    </nav>
  );
}
