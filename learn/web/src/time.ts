/** Small date readouts. Everything the learner reads about time goes through here. */

export function daysAgo(iso: string | null | undefined, now = Date.now()): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.floor((now - t) / 86_400_000));
}

/** "edited today" · "edited 12 days ago" · "empty". */
export function agoLong(iso: string | null | undefined, now = Date.now()): string {
  const d = daysAgo(iso, now);
  if (d === null) return "empty";
  if (d === 0) return "edited today";
  return `edited ${d} day${d === 1 ? "" : "s"} ago`;
}

/** The All-notes column: "today", "1 d", "19 d". */
export function agoShort(iso: string | null | undefined, now = Date.now()): string {
  const d = daysAgo(iso, now);
  if (d === null) return "—";
  return d === 0 ? "today" : `${d} d`;
}

export const oneDecimal = (n: number) => n.toFixed(1);
