"""Pure derivations behind the Desk, the track and the module workspace (plan §3).

No I/O and no curriculum imports: every function takes plain values so the shapes the
API promises can be tested without a vault. Ladder rules stay in `ladder.py`; this is
the arithmetic and the wording built on top of them.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Literal

from .ladder import STATE_ORDER, Attempt, CheckState, Score, brier_score, schedule

#: Fallback track length, used only when a caller has no curriculum to ask.
#: Every route passes `Track.total_weeks` instead — no screen may assume forty.
WEEKS_TOTAL = 40
SESSIONS_PER_WEEK = 5
FOUR_WEEKS_DAYS = 28
CALIBRATION_WEEKS = 8
CALIBRATION_MIN_ATTEMPTS = 3
PHASE_TAGS = ("new", "review", "build")

TopicState = Literal["proved", "in_progress", "not_started"]
PROVED_STATES: tuple[CheckState, ...] = ("proficient", "durable")
DONE_RESOURCE_STATES = ("reconstructed", "taught")
TOUCHED_RESOURCE_STATES = ("skimmed", "read", "reconstructed", "taught")

#: Ladder state → the word the redesign uses for it on the ridge.
RIDGE_WORDS: dict[CheckState, str] = {
    "durable": "lasting",
    "proficient": "solid",
    "familiar": "shaky",
    "attempted": "tried",
    "not_started": "untouched",
}
#: `queue.warmup_items` reason → the Desk chip and its one-line explanation.
WARMUP_CHIPS = {
    "due": "due",
    "unattempted": "new",
    "last_session": "new",
    "old_module": "old",
    "error": "error",
}
WARMUP_REASONS = {
    "due": "due for a re-test",
    "unattempted": "never attempted",
    "last_session": "where you were last time",
    "old_module": "not touched in four weeks",
    "error": "an error you logged",
}


# ---------------------------------------------------------------- weeks


def track_week(day: date, start: date) -> int:
    """1-based track week of a calendar day; week 1 is the start week."""
    return max(1, (day - start).days // 7 + 1)


def week_now(today: date, start: date, weeks_total: int = WEEKS_TOTAL) -> int:
    return min(weeks_total, track_week(today, start))


def weeks_left(now: int, weeks_total: int = WEEKS_TOTAL) -> int:
    """Weeks remaining including the current one, so week 1 of a 40-week track reads 40."""
    return max(0, weeks_total - now + 1)


def week_cells(
    now: int, phases: list[tuple[str, int, int]], weeks_total: int = WEEKS_TOTAL
) -> list[dict]:
    """The week strip: one cell per track week, tagged past / phase / current / future."""
    phase_of: dict[int, str] = {}
    for phase_id, first, last in phases:
        for week in range(first, last + 1):
            phase_of.setdefault(week, phase_id)
    here = phase_of.get(now)
    cells = []
    for week in range(1, weeks_total + 1):
        phase_id = phase_of.get(week)
        if week == now:
            state = "current"
        elif week < now:
            state = "past"
        elif here is not None and phase_id == here:
            state = "phase"
        else:
            state = "future"
        cells.append({"week": week, "state": state, "phase_id": phase_id})
    return cells


# ---------------------------------------------------------------- check states


def states_on(
    attempts: dict[str, list[Attempt]], check_ids: list[str], on: date
) -> list[CheckState]:
    """Ladder state of each check as it stood on a past day (the 4-week deltas need this)."""
    return [schedule([a for a in attempts.get(cid, []) if a.on <= on]).state for cid in check_ids]


def count_at_least(states: list[CheckState], floor: CheckState) -> int:
    return sum(1 for s in states if STATE_ORDER.index(s) >= STATE_ORDER.index(floor))


def count_of(states: list[CheckState], state: CheckState) -> int:
    return sum(1 for s in states if s == state)


def ridge_counts(states: list[CheckState]) -> dict[str, int]:
    """Core-check counts per ridge segment, in the redesign's words."""
    counts = dict.fromkeys(RIDGE_WORDS.values(), 0)
    for state in states:
        counts[RIDGE_WORDS[state]] += 1
    return counts


def delta_4w(
    attempts: dict[str, list[Attempt]],
    check_ids: list[str],
    today: date,
    floor: CheckState = "proficient",
    days: int = FOUR_WEEKS_DAYS,
) -> int:
    """How many more checks stand at `floor` or better than four weeks ago."""
    before = states_on(attempts, check_ids, today - timedelta(days=days))
    after = states_on(attempts, check_ids, today)
    return count_at_least(after, floor) - count_at_least(before, floor)


def attempts_in_window(
    attempts: dict[str, list[Attempt]], today: date, days: int = FOUR_WEEKS_DAYS
) -> int:
    cutoff = today - timedelta(days=days)
    return sum(1 for rows in attempts.values() for a in rows if a.on > cutoff)


def brier_by_week(
    graded: list[tuple[date, int, Score]],
    start: date,
    weeks: int = CALIBRATION_WEEKS,
    min_attempts: int = CALIBRATION_MIN_ATTEMPTS,
) -> list[dict]:
    """Brier by track week, keeping only weeks with enough graded attempts to mean anything."""
    by_week: dict[int, list[tuple[int, Score]]] = {}
    for on, confidence, score in graded:
        by_week.setdefault(track_week(on, start), []).append((confidence, score))
    kept = sorted(w for w, pairs in by_week.items() if len(pairs) >= min_attempts)
    out = []
    for week in kept[-weeks:]:
        value = brier_score(by_week[week])
        out.append({"week": week, "brier": round(value, 4) if value is not None else 0.0})
    return out


def newly_proved(attempts: dict[str, list[Attempt]], limit: int = 5) -> list[dict]:
    """The last checks to first reach solid or lasting, newest first."""
    out = []
    for check_id, rows in attempts.items():
        for day in sorted({a.on for a in rows}):
            if schedule([a for a in rows if a.on <= day]).state in PROVED_STATES:
                out.append(
                    {
                        "check_id": check_id,
                        "date": day.isoformat(),
                        "state": schedule(rows).state,
                    }
                )
                break
    out.sort(key=lambda row: (row["date"], row["check_id"]), reverse=True)
    return out[:limit]


# ---------------------------------------------------------------- topics


def topic_state(
    check_states: list[CheckState], resource_states: list[str], note_exists: bool
) -> TopicState:
    """Proved, in progress or not started, per plan §3."""
    if check_states:
        if all(s in PROVED_STATES for s in check_states):
            return "proved"
    elif resource_states and all(s in DONE_RESOURCE_STATES for s in resource_states):
        return "proved"
    started = (
        any(s != "not_started" for s in check_states)
        or any(s in TOUCHED_RESOURCE_STATES for s in resource_states)
        or note_exists
    )
    return "in_progress" if started else "not_started"


def step_summary(states: list[str]) -> str:
    """`1 done · 1 in progress · 4 untouched` for the step strip."""
    proved = sum(1 for s in states if s == "proved")
    going = sum(1 for s in states if s == "in_progress")
    return f"{proved} done · {going} in progress · {len(states) - proved - going} untouched"


def proof_counts(states: list[CheckState]) -> dict[str, int]:
    """The squares beside a track row: total, lasting, solid and merely partial."""
    return {
        "total": len(states),
        "lasting": count_of(states, "durable"),
        "solid": count_of(states, "proficient"),
        "partial": count_of(states, "familiar") + count_of(states, "attempted"),
    }


def proof_text(count: int, total: int, word: str) -> str:
    return f"{count} of {total} {word}"


# ---------------------------------------------------------------- warnings and sentences


def overdue_warning(checks: int, days: int) -> str | None:
    """`2 checks 14 days overdue`, or nothing when nothing is late."""
    if checks <= 0 or days <= 0:
        return None
    return (
        f"{checks} {'check' if checks == 1 else 'checks'} "
        f"{days} {'day' if days == 1 else 'days'} overdue"
    )


def prerequisite_warning(title: str | None) -> str | None:
    """`needs Golden dataset first` when a prerequisite module has no solid check yet."""
    return f"needs {title} first" if title else None


def start_label(weekly_budget: float, sessions: int = SESSIONS_PER_WEEK) -> str:
    """`Start · about 2 hours`, from the weekly budget over sessions per week."""
    hours = weekly_budget / max(1, sessions)
    if hours < 1:
        return f"Start · about {int(round(hours * 60))} minutes"
    whole = int(round(hours))
    return f"Start · about {whole} hour{'' if whole == 1 else 's'}"


def slipping_sentence(logged: float, budget: float) -> str:
    """Hours are a budget, never a debt: under is fine, over is worth noticing."""
    gap = round(budget - logged, 1)
    if gap > 0:
        return f"{gap:g} h under budget this week. Under is fine."
    if gap < 0:
        return f"{abs(gap):g} h over budget this week. Over is fine too, if you are not fraying."
    return "Exactly on budget this week."


# ---------------------------------------------------------------- hours


def hours_by_week(
    day_minutes: dict[date, dict[str, int]], start: date, now: int, weeks: int = 4
) -> list[dict]:
    """Hours per phase tag for the last `weeks` track weeks, oldest first."""
    out = []
    for week in range(max(1, now - weeks + 1), now + 1):
        first = start + timedelta(weeks=week - 1)
        last = first + timedelta(days=6)
        totals = dict.fromkeys(PHASE_TAGS, 0)
        for day, bucket in day_minutes.items():
            if first <= day <= last:
                for tag in totals:
                    totals[tag] += int(bucket.get(tag, 0) or 0)
        out.append({"week": week, **{k: round(v / 60.0, 2) for k, v in totals.items()}})
    return out


def hours_in_window(
    day_minutes: dict[date, dict[str, int]], today: date, days: int = FOUR_WEEKS_DAYS
) -> float:
    cutoff = today - timedelta(days=days)
    minutes = sum(
        sum(int(v or 0) for v in bucket.values())
        for day, bucket in day_minutes.items()
        if cutoff < day <= today
    )
    return round(minutes / 60.0, 2)
