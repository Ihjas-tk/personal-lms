"""Derived check rows, the re-test queue and warm-up selection (spec §2.4, §3)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any

from . import ladder, store
from .curriculum import Check, Track

WARMUP_DUE_SLOTS = 3
STALE_MODULE_WEEKS = 4


@dataclass(frozen=True)
class CheckRow:
    """A curriculum check plus everything derived from its attempts."""

    check: Check
    schedule: ladder.Schedule
    overdue_days: int
    topic_id: str | None = None

    def public(self, today: date) -> dict[str, Any]:
        """JSON shape for the API. Never carries the reference answer.

        `check_id`/`module_id` duplicate `id`/`module` so one row serves the check card,
        the due queue and the warm-up draw without a per-caller rename.
        """
        sched = self.schedule
        return {
            **self.check.public(),
            "check_id": self.check.id,
            "module_id": self.check.module,
            "draft_reference": self.check.draft,
            "state": sched.state,
            "next_due": sched.next_due.isoformat() if sched.next_due else None,
            "last_score": sched.last_score,
            "attempt_count": sched.attempt_count,
            "durable": sched.durable,
            "overconfident_miss": sched.overconfident_miss,
            "overdue_days": self.overdue_days,
            "at_risk": ladder.is_at_risk(sched.state, sched.next_due, today),
            "topic_id": self.topic_id,
        }


def check_rows(track: Track, today: date | None = None) -> list[CheckRow]:
    """Build a row per curriculum check from the attempt files."""
    day = today or date.today()
    grouped = store.graded_attempts()
    rows = []
    for module in track.modules:
        for check in module.checks:
            sched = ladder.schedule(grouped.get(check.id, []))
            rows.append(
                CheckRow(
                    check,
                    sched,
                    ladder.overdue_days(sched.next_due, day),
                    module.topic_of_check(check.id),
                )
            )
    return rows


def by_module(rows: list[CheckRow]) -> dict[str, list[CheckRow]]:
    out: dict[str, list[CheckRow]] = {}
    for row in rows:
        out.setdefault(row.check.module, []).append(row)
    return out


def due_queue(rows: list[CheckRow], today: date | None = None) -> list[CheckRow]:
    """Checks due for re-test, most overdue first, overconfident misses breaking ties."""
    day = today or date.today()
    due = [r for r in rows if r.schedule.next_due is not None and r.schedule.next_due <= day]
    def key(row: CheckRow) -> tuple[int, bool, str]:
        return (-row.overdue_days, not row.schedule.overconfident_miss, row.check.id)

    return sorted(due, key=key)


def last_touched(track: Track) -> dict[str, date]:
    """Most recent attempt date per module."""
    touched: dict[str, date] = {}
    for item in store.iter_attempt_files():
        if not item.submitted:
            continue
        module_id = str(item.path).split("/")[1] if "/" in item.path else ""
        day = str(item.meta.get("submitted"))[:10]
        try:
            parsed = date.fromisoformat(day)
        except ValueError:
            continue
        if module_id and (module_id not in touched or touched[module_id] < parsed):
            touched[module_id] = parsed
    return touched


def warmup_items(
    track: Track,
    rows: list[CheckRow],
    last_session_module: str | None,
    today: date | None = None,
) -> list[dict[str, Any]]:
    """5–8 opening items: due re-tests, last session's module, a stale module, one open error.

    Every item is a check row, so the client can open each one with the normal attempt
    flow. The unresolved-error slot contributes the check that error was logged against;
    an error with no check behind it is skipped rather than drawn as an un-attemptable row.
    """
    day = today or date.today()
    picked: list[dict[str, Any]] = []
    used: set[str] = set()
    by_id = {r.check.id: r for r in rows}

    def take(row: CheckRow, reason: str, error_id: str | None = None) -> None:
        if row.check.id in used:
            return
        used.add(row.check.id)
        picked.append({"reason": reason, "error_id": error_id, **row.public(day)})

    due = due_queue(rows, day)
    source = due if due else [r for r in rows if r.schedule.state == "not_started"]
    for row in source[:WARMUP_DUE_SLOTS]:
        take(row, "due" if due else "unattempted")

    if last_session_module:
        for row in [r for r in rows if r.check.module == last_session_module]:
            take(row, "last_session")
            break

    touched = last_touched(track)
    cutoff = day - timedelta(weeks=STALE_MODULE_WEEKS)
    stale = sorted(
        (m for m in track.modules if touched.get(m.id) and touched[m.id] <= cutoff),
        key=lambda m: touched[m.id],
    )
    for module in stale:
        rows_here = [r for r in rows if r.check.module == module.id]
        if rows_here:
            take(rows_here[0], "old_module")
            break

    for error in store.read_errors():
        row = by_id.get(str(error.get("check_id") or ""))
        if not error.get("resolved") and row is not None:
            take(row, "error", str(error["id"]))
            break

    return picked[:8]


def cold_sweep(
    rows: list[CheckRow], track: Track, today: date | None = None, limit: int = 10
) -> list[dict]:
    """Weekly cold-retrieval sweep: overconfident misses first, then least-recently-tested."""
    day = today or date.today()
    touched = last_touched(track)
    attempted = [r for r in rows if r.schedule.attempt_count > 0]
    ranked = sorted(
        attempted,
        key=lambda r: (
            not r.schedule.overconfident_miss,
            touched.get(r.check.module, date.min),
            -r.overdue_days,
        ),
    )
    return [r.public(day) for r in ranked[:limit]]
