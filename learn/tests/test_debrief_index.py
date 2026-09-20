"""The Sunday debrief's additions, and the index rows behind "All notes"."""

from __future__ import annotations

import sqlite3

from starlette.testclient import TestClient

from conftest import close_session, full_attempt
from learn import config, index, store


def test_weekly_review_adds_hours_shipped_and_the_said_was_pair(
    either_client: TestClient,
) -> None:
    """Contract §3: the debrief gains four-week hours, the shipped list and bucket wording."""
    full_attempt(either_client, score="fluent", confidence=60)
    close_session(either_client)
    weekly = either_client.get("/api/review/weekly").json()

    hours = weekly["hours_last_4_weeks"]
    assert len(hours) == 1  # week 1 of the track; earlier weeks do not exist
    assert set(hours[0]) == {"week", "new", "review", "build"}

    assert [s["id"] for s in weekly["shipped"]] == ["cap-golden-set", "cap-failure-taxonomy"]
    assert all(set(s) == {"id", "title", "state"} for s in weekly["shipped"])

    bucket = next(b for b in weekly["calibration"]["buckets"] if b["n"])
    assert bucket["said"] == bucket["mean_confidence"] == 60
    assert bucket["was"] == bucket["observed"] == 1.0
    assert weekly["burn_up"] and weekly["capstone"]  # nothing was dropped


def test_index_carries_one_row_per_note(client_v2: TestClient, cfg_v2: config.Config) -> None:
    """Topic notes are indexed with their path, mtime and word count."""
    client_v2.put(
        "/api/modules/a1/notes/attention",
        json={"frontmatter": {}, "body": "mask before the softmax", "mtime_ns": 0},
    )
    client_v2.put("/api/modules/a1/note", json={"frontmatter": {}, "body": "legacy", "mtime_ns": 0})
    index.rebuild()

    conn = sqlite3.connect(cfg_v2.index_db)
    try:
        rows = conn.execute("SELECT path, topic_id, words FROM notes ORDER BY path").fetchall()
        hits = conn.execute(
            "SELECT count(*) FROM notes_fts WHERE notes_fts MATCH 'softmax'"
        ).fetchone()[0]
    finally:
        conn.close()
    assert rows == [("a1/attention.md", "attention", 4), ("a1/notes.md", None, 1)]
    assert hits == 1


def test_topic_note_survives_a_javascript_json_round_trip(cfg_v2: config.Config) -> None:
    """Same optimistic-concurrency contract as the module note, one file down."""
    store.write_topic_note("a1", "attention", {}, "v1", 0)
    exact = store.read_topic_note("a1", "attention")["mtime_ns"]
    saved = store.write_topic_note("a1", "attention", {}, "v2", int(float(exact)))
    assert saved["body"] == "v2"
    assert saved["frontmatter"]["topic"] == "attention"


def test_merge_jot_lines_keeps_one_jots_section(cfg: config.Config) -> None:
    """Filing twice appends to the existing section instead of starting a second one."""
    body = store.merge_jot_lines("# Notes\n\nthe mechanism\n", ["- [1:00] one"])
    assert body == "# Notes\n\nthe mechanism\n\n## Jots\n- [1:00] one\n"
    twice = store.merge_jot_lines(body, ["- [2:00] two"])
    assert twice.count("## Jots") == 1
    assert twice.endswith("- [1:00] one\n- [2:00] two\n")
    later = store.merge_jot_lines(twice + "\n## After\ntail\n", ["- [3:00] three"])
    assert "- [3:00] three\n\n## After" in later
    assert store.merge_jot_lines("body\n", []) == "body\n"
