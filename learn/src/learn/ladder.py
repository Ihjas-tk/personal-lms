"""Pure ladder, scheduling and derived-state functions (spec §4.3–4.4). No I/O."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Literal

Score = Literal["cant", "partial", "fluent"]
CheckState = Literal["not_started", "attempted", "familiar", "proficient", "durable"]

STEPS: tuple[int, ...] = (2, 7, 21, 60)
MISS_DAYS = 2
DURABLE_GAP_DAYS = 7
DURABLE_MAINTENANCE_DAYS = 60
OVERCONFIDENT_THRESHOLD = 80

STATE_ORDER: tuple[CheckState, ...] = (
    "not_started",
    "attempted",
    "familiar",
    "proficient",
    "durable",
)
ERROR_CATEGORIES: tuple[str, ...] = (
    "notation_shape",
    "misremembered_mechanism",
    "conflated_two_things",
    "off_by_one_masking",
    "statistical_reasoning",
    "api_library",
    "didnt_know",
)


@dataclass(frozen=True)
class Attempt:
    """One graded attempt, in submission order."""

    check_id: str
    session_id: str
    on: date
    score: Score
    confidence_pre: int = 0
    warmup: bool = False
    ai_critique_used: bool = False


@dataclass(frozen=True)
class Schedule:
    """Everything derivable from a check's attempt history."""

    state: CheckState
    next_due: date | None
    step_index: int
    durable: bool
    last_score: Score | None
    attempt_count: int
    overconfident_miss: bool


def is_overconfident_miss(confidence_pre: int, score: Score) -> bool:
    """A confident wipe-out: pre-confidence >= 80 with a `cant` result."""
    return confidence_pre >= OVERCONFIDENT_THRESHOLD and score == "cant"


def is_durable(attempts: list[Attempt]) -> bool:
    """Two `fluent` attempts, different sessions, >= 7 days apart, no `cant` after the first."""
    fluent = [(i, a) for i, a in enumerate(attempts) if a.score == "fluent"]
    for pos, (i, first) in enumerate(fluent):
        for _j, second in fluent[pos + 1 :]:
            if first.session_id == second.session_id:
                continue
            if (second.on - first.on).days < DURABLE_GAP_DAYS:
                continue
            if any(a.score == "cant" for a in attempts[i + 1 :]):
                continue
            return True
    return False


def schedule(attempts: list[Attempt]) -> Schedule:
    """Fold an attempt history into ladder state and the next due date."""
    if not attempts:
        return Schedule("not_started", None, 0, False, None, 0, False)

    ordered = sorted(attempts, key=lambda a: a.on)
    step_index = 0
    next_due: date | None = None
    for attempt in ordered:
        if attempt.score == "fluent":
            step_index = min(step_index + 1, len(STEPS) - 1)
            next_due = attempt.on + timedelta(days=STEPS[step_index])
        elif attempt.score == "partial":
            next_due = attempt.on + timedelta(days=MISS_DAYS)
        else:
            step_index = 0
            next_due = attempt.on + timedelta(days=MISS_DAYS)

    last = ordered[-1]
    miss = is_overconfident_miss(last.confidence_pre, last.score)
    if miss:
        next_due = last.on + timedelta(days=MISS_DAYS)

    durable = is_durable(ordered)
    if durable:
        next_due = last.on + timedelta(days=DURABLE_MAINTENANCE_DAYS)
        state: CheckState = "durable"
    elif last.score == "fluent":
        state = "proficient"
    elif last.score == "partial":
        state = "familiar"
    else:
        state = "attempted"

    return Schedule(state, next_due, step_index, durable, last.score, len(ordered), miss)


def module_state(check_states: list[CheckState]) -> CheckState:
    """Minimum state across must-cover checks; `not_started` only if none was attempted."""
    if not check_states:
        return "not_started"
    if all(s == "not_started" for s in check_states):
        return "not_started"
    floored = [s if s != "not_started" else "attempted" for s in check_states]
    return min(floored, key=STATE_ORDER.index)


def coverage(check_states: list[CheckState]) -> float:
    """Share of must-cover checks at proficient or durable."""
    if not check_states:
        return 0.0
    covered = sum(1 for s in check_states if s in ("proficient", "durable"))
    return covered / len(check_states)


def share(check_states: list[CheckState], states: tuple[CheckState, ...]) -> float:
    """Share of checks in any of `states`."""
    if not check_states:
        return 0.0
    return sum(1 for s in check_states if s in states) / len(check_states)


def overdue_days(next_due: date | None, today: date) -> int:
    """Days past due; 0 when not due yet or never attempted."""
    if next_due is None:
        return 0
    return max(0, (today - next_due).days)


def is_at_risk(state: CheckState, next_due: date | None, today: date) -> bool:
    """Proficient (not yet durable) but the re-test is overdue."""
    return state == "proficient" and next_due is not None and next_due < today


def brier_score(pairs: list[tuple[int, Score]]) -> float | None:
    """Brier score over (confidence_pre, score); `fluent` counts as the hit."""
    if not pairs:
        return None
    total = sum(((c / 100.0) - (1.0 if s == "fluent" else 0.0)) ** 2 for c, s in pairs)
    return total / len(pairs)


def reliability_table(pairs: list[tuple[int, Score]]) -> list[dict]:
    """Confidence buckets of 20 with n, mean confidence and hit rate."""
    buckets: list[dict] = []
    for low in range(0, 100, 20):
        high = low + 20
        inside = [p for p in pairs if low <= p[0] < high or (high == 100 and p[0] == 100)]
        buckets.append(
            {
                "bucket": f"{low}-{high}",
                "n": len(inside),
                "mean_confidence": (
                    round(sum(c for c, _ in inside) / len(inside), 1) if inside else None
                ),
                "accuracy": (
                    round(sum(1 for _, s in inside if s == "fluent") / len(inside), 3)
                    if inside
                    else None
                ),
            }
        )
    return buckets
