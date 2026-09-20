"""The pure derivations behind the Desk, the track and the workspace. No vault, no HTTP."""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from learn import derive
from learn.ladder import Attempt

START = date(2026, 9, 21)  # a Monday
TODAY = START + timedelta(weeks=9)  # week 10


def fluent(check_id: str, on: date, session: str = "s1") -> Attempt:
    return Attempt(check_id=check_id, session_id=session, on=on, score="fluent", confidence_pre=70)


@pytest.mark.parametrize(
    ("checks", "resources", "note", "expected"),
    [
        ([], [], False, "not_started"),
        (["not_started"], ["queued"], False, "not_started"),
        ([], ["queued"], True, "in_progress"),  # a note alone counts as started
        (["not_started"], ["read"], False, "in_progress"),
        (["attempted"], ["queued"], False, "in_progress"),
        (["proficient", "durable"], ["queued"], False, "proved"),
        (["proficient", "familiar"], ["taught"], True, "in_progress"),
        ([], ["reconstructed", "taught"], False, "proved"),  # no check: the sources prove it
        ([], ["taught", "read"], False, "in_progress"),
    ],
)
def test_topic_state_table(
    checks: list[str], resources: list[str], note: bool, expected: str
) -> None:
    """The §3 rule, corner by corner: checks decide it, sources stand in when there are none."""
    assert derive.topic_state(checks, resources, note) == expected


def test_ridge_counts_use_the_redesign_words() -> None:
    counts = derive.ridge_counts(
        ["durable", "proficient", "proficient", "familiar", "attempted", "not_started"]
    )
    assert counts == {"lasting": 1, "solid": 2, "shaky": 1, "tried": 1, "untouched": 1}
    assert derive.ridge_counts([]) == {
        "lasting": 0,
        "solid": 0,
        "shaky": 0,
        "tried": 0,
        "untouched": 0,
    }


def test_step_summary_and_proof_counts() -> None:
    assert derive.step_summary(["proved", "in_progress", "not_started", "not_started"]) == (
        "1 done · 1 in progress · 2 untouched"
    )
    counts = derive.proof_counts(["durable", "proficient", "familiar", "not_started"])
    assert counts == {"total": 4, "lasting": 1, "solid": 1, "partial": 1}
    assert derive.proof_text(1, 11, "lasting") == "1 of 11 lasting"


def test_week_cells_mark_past_current_phase_and_future() -> None:
    cells = derive.week_cells(10, [("p1", 1, 8), ("p2", 9, 14)], weeks_total=16)
    states = {c["week"]: c["state"] for c in cells}
    assert states[3] == "past"
    assert states[9] == "past"  # inside the current phase, but already gone
    assert states[10] == "current"
    assert states[11] == "phase"
    assert states[15] == "future"
    assert cells[0]["phase_id"] == "p1"
    assert len(cells) == 16


def test_weeks_left_counts_the_current_week() -> None:
    assert derive.weeks_left(1) == 40
    assert derive.weeks_left(40) == 1
    assert derive.week_now(START - timedelta(days=3), START) == 1


def test_delta_4w_counts_only_what_moved() -> None:
    """A check that went solid last week counts; one solid two months ago does not."""
    attempts = {
        "old": [fluent("old", TODAY - timedelta(days=60))],
        "new": [fluent("new", TODAY - timedelta(days=3))],
    }
    assert derive.delta_4w(attempts, ["old", "new"], TODAY, "proficient") == 1
    assert derive.delta_4w(attempts, ["old"], TODAY, "proficient") == 0
    assert derive.attempts_in_window(attempts, TODAY) == 1


def test_newly_proved_is_newest_first_and_dated_at_the_moment_it_proved() -> None:
    first = TODAY - timedelta(days=20)
    second = TODAY - timedelta(days=2)
    attempts = {
        "a": [fluent("a", first), fluent("a", first + timedelta(days=8), "s2")],
        "b": [fluent("b", second)],
    }
    rows = derive.newly_proved(attempts)
    assert [r["check_id"] for r in rows] == ["b", "a"]
    assert rows[1]["date"] == first.isoformat()
    assert rows[1]["state"] == "durable"  # two clean passes, eight days apart
    assert rows[0]["state"] == "proficient"


def test_brier_by_week_skips_thin_weeks_and_keeps_the_last_eight() -> None:
    graded: list[tuple[date, int, str]] = []
    for week in range(1, 12):
        day = START + timedelta(weeks=week - 1)
        n = 3 if week % 2 else 2
        graded += [(day, 80, "fluent")] * n
    rows = derive.brier_by_week(graded, START)
    assert [r["week"] for r in rows] == [1, 3, 5, 7, 9, 11]
    assert rows[0]["brier"] == pytest.approx(0.04)
    assert derive.brier_by_week([(START, 90, "cant")], START) == []


def test_hours_by_week_covers_the_last_four_weeks_even_when_empty() -> None:
    days = {
        START + timedelta(weeks=8, days=1): {"new": 60, "review": 30, "build": 0},
        START + timedelta(weeks=9): {"new": 0, "review": 0, "build": 90},
    }
    rows = derive.hours_by_week(days, START, derive.week_now(TODAY, START))
    assert [r["week"] for r in rows] == [7, 8, 9, 10]
    assert rows[2] == {"week": 9, "new": 1.0, "review": 0.5, "build": 0.0}
    assert rows[3]["build"] == 1.5
    assert derive.hours_in_window(days, TODAY) == 3.0


def test_warnings_read_as_sentences() -> None:
    assert derive.overdue_warning(2, 14) == "2 checks 14 days overdue"
    assert derive.overdue_warning(1, 1) == "1 check 1 day overdue"
    assert derive.overdue_warning(0, 14) is None
    assert derive.overdue_warning(2, 0) is None
    assert derive.prerequisite_warning("Golden dataset") == "needs Golden dataset first"
    assert derive.prerequisite_warning(None) is None


def test_start_label_and_slipping_sentence() -> None:
    assert derive.start_label(12) == "Start · about 2 hours"
    assert derive.start_label(5) == "Start · about 1 hour"
    assert derive.start_label(2) == "Start · about 24 minutes"
    assert derive.slipping_sentence(4.8, 12) == "7.2 h under budget this week. Under is fine."
    assert derive.slipping_sentence(13.5, 12).startswith("1.5 h over budget this week.")
    assert derive.slipping_sentence(12, 12) == "Exactly on budget this week."
