"""Table-driven tests for the pure scheduling and derived-state rules (spec §4.3–4.4)."""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from learn import ladder

DAY0 = date(2026, 10, 1)


def att(day: int, score: str, session: str = "s1", confidence: int = 50) -> ladder.Attempt:
    return ladder.Attempt("c1", session, DAY0 + timedelta(days=day), score, confidence)


CASES = [
    ("no attempts", [], "not_started", None, False, False),
    ("single cant", [att(0, "cant")], "attempted", 2, False, False),
    ("single partial", [att(0, "partial")], "familiar", 2, False, False),
    ("single fluent advances to 7", [att(0, "fluent")], "proficient", 7, False, False),
    (
        "two fluents 7 days apart in different sessions",
        [att(0, "fluent", "s1"), att(7, "fluent", "s2")],
        "durable",
        67,
        True,
        False,
    ),
    (
        "two fluents too close",
        [att(0, "fluent", "s1"), att(3, "fluent", "s2")],
        "proficient",
        24,
        False,
        False,
    ),
    (
        "two fluents same session",
        [att(0, "fluent", "s1"), att(10, "fluent", "s1")],
        "proficient",
        31,
        False,
        False,
    ),
    (
        "cant between resets the step",
        [att(0, "fluent", "s1"), att(2, "cant", "s2"), att(20, "fluent", "s3")],
        "proficient",
        27,
        False,
        False,
    ),
    (
        "cant after a durable pair breaks durability",
        [att(0, "fluent", "s1"), att(10, "fluent", "s2"), att(20, "cant", "s3")],
        "attempted",
        22,
        False,
        False,
    ),
    (
        "overconfident miss forces +2 and flags",
        [att(0, "fluent", "s1"), att(9, "cant", "s2", confidence=90)],
        "attempted",
        11,
        False,
        True,
    ),
    (
        "partial keeps the step but re-tests in 2 days",
        [att(0, "fluent", "s1"), att(7, "partial", "s2")],
        "familiar",
        9,
        False,
        False,
    ),
    (
        "step ceiling at 60",
        [att(0, "fluent"), att(1, "fluent"), att(2, "fluent"), att(3, "fluent")],
        "proficient",
        63,
        False,
        False,
    ),
]


@pytest.mark.parametrize(
    "label,attempts,state,due_offset,durable,miss",
    CASES,
    ids=[c[0] for c in CASES],
)
def test_schedule(
    label: str,
    attempts: list[ladder.Attempt],
    state: str,
    due_offset: int | None,
    durable: bool,
    miss: bool,
) -> None:
    result = ladder.schedule(attempts)
    assert result.state == state
    assert result.next_due == (DAY0 + timedelta(days=due_offset) if due_offset else None)
    assert result.durable is durable
    assert result.overconfident_miss is miss


def test_step_ceiling_is_the_last_ladder_step() -> None:
    """Four consecutive fluents cap at the 60-day step, not beyond it."""
    attempts = [att(i, "fluent") for i in range(6)]
    assert ladder.schedule(attempts).step_index == len(ladder.STEPS) - 1


@pytest.mark.parametrize(
    "states,expected",
    [
        ([], "not_started"),
        (["not_started", "not_started"], "not_started"),
        (["not_started", "fluent_placeholder"], "attempted"),
        (["durable", "proficient"], "proficient"),
        (["durable", "durable"], "durable"),
        (["attempted", "durable"], "attempted"),
    ],
)
def test_module_state(states: list[str], expected: str) -> None:
    cleaned = ["proficient" if s == "fluent_placeholder" else s for s in states]
    assert ladder.module_state(cleaned) == expected


def test_coverage_counts_proficient_and_durable_only() -> None:
    assert ladder.coverage(["durable", "proficient", "familiar", "attempted"]) == 0.5
    assert ladder.coverage([]) == 0.0


def test_overconfident_miss_threshold() -> None:
    assert ladder.is_overconfident_miss(80, "cant")
    assert not ladder.is_overconfident_miss(79, "cant")
    assert not ladder.is_overconfident_miss(95, "partial")


def test_brier_and_reliability() -> None:
    pairs = [(100, "fluent"), (0, "cant"), (50, "cant")]
    assert ladder.brier_score(pairs) == pytest.approx(0.25 / 3)
    table = ladder.reliability_table(pairs)
    assert [b["n"] for b in table] == [1, 0, 1, 0, 1]
