"""The attempt flow: the reveal gate, the error ledger and the AI 423 lock."""

from __future__ import annotations

import json
from datetime import date, datetime, timedelta

import frontmatter
from starlette.testclient import TestClient

from conftest import full_attempt, open_session
from learn import config

REFERENCE_MARKER = "REFERENCE-A1-MHA"


def test_reference_is_never_exposed_before_freeze(client: TestClient) -> None:
    """The gate: the reference appears only once the answer is frozen, never before."""
    check = client.get("/api/checks/a1-mha-from-memory")
    assert check.status_code == 200
    assert REFERENCE_MARKER not in check.text
    assert "reference" not in check.json()

    session_id = open_session(client)
    start = client.post(
        "/api/checks/a1-mha-from-memory/attempts",
        json={"session_id": session_id, "confidence_pre": 70},
    )
    assert start.status_code == 200
    assert REFERENCE_MARKER not in start.text
    assert "reference" not in start.json()["check"]
    assert start.json()["check_id"] == "a1-mha-from-memory"
    assert start.json()["started"]
    path = start.json()["attempt_path"]

    # The module page, the due queue and the warm-up all stay clean while it is open.
    for route in ("/api/modules/a1", "/api/review/due", "/api/sessions/warmup", "/api/desk"):
        assert REFERENCE_MARKER not in client.get(route).text, route

    freeze = client.post(
        "/api/attempts/freeze",
        json={"attempt_path": path, "answer": "scaled dot product then mask"},
    )
    assert freeze.status_code == 200
    assert REFERENCE_MARKER in freeze.json()["reference"]
    assert freeze.json()["draft_reference"] is True
    assert freeze.json()["rubric"]
    assert freeze.json()["attempt_path"] == path

    # Frozen, not graded: the ladder has not moved and the check row is still clean.
    frozen_check = client.get("/api/checks/a1-mha-from-memory")
    assert REFERENCE_MARKER not in frozen_check.text
    assert frozen_check.json()["state"] == "not_started"

    submit = client.post(
        "/api/attempts/submit",
        json={
            "attempt_path": path,
            "rubric": ["met", "missing", "met", "met"],
            "score": "partial",
            "category": "off_by_one_masking",
            "diagnosis": "I applied the mask after the softmax.",
        },
    )
    assert submit.status_code == 200
    assert REFERENCE_MARKER in submit.json()["reference"]
    assert submit.json()["state"] == "familiar"


def test_freezing_keeps_the_answer_the_grade_cannot_rewrite_it(
    client: TestClient, cfg: config.Config
) -> None:
    """What was written from memory is what is stored, whatever the submit call says."""
    session_id = open_session(client)
    start = client.post(
        "/api/checks/a1-mha-from-memory/attempts",
        json={"session_id": session_id, "confidence_pre": 40},
    ).json()
    client.post(
        "/api/attempts/freeze",
        json={"attempt_path": start["attempt_path"], "answer": "the frozen words"},
    )
    again = client.post(
        "/api/attempts/freeze",
        json={"attempt_path": start["attempt_path"], "answer": "second thoughts"},
    )
    assert again.status_code == 409

    client.post(
        "/api/attempts/submit",
        json={"attempt_path": start["attempt_path"], "rubric": ["met"], "score": "fluent"},
    )
    attempt = client.get("/api/checks/a1-mha-from-memory").json()["attempts"][0]
    assert attempt["submitted"]
    assert attempt["score"] == "fluent"
    stored = frontmatter.loads((cfg.vault / attempt["path"]).read_text())
    assert "the frozen words" in stored.content
    assert "second thoughts" not in stored.content


def test_submit_still_accepts_the_old_combined_form(client: TestClient) -> None:
    """Backwards compatibility: answer and grade in one call, with no freeze step."""
    result = full_attempt(client, score="fluent")
    assert REFERENCE_MARKER in result["submit"]["reference"]
    assert result["submit"]["draft_reference"] is True


def test_submit_without_a_frozen_answer_is_refused(client: TestClient) -> None:
    session_id = open_session(client)
    start = client.post(
        "/api/checks/a1-mha-from-memory/attempts",
        json={"session_id": session_id, "confidence_pre": 40},
    ).json()
    bad = client.post(
        "/api/attempts/submit",
        json={"attempt_path": start["attempt_path"], "rubric": ["met"], "score": "fluent"},
    )
    assert bad.status_code == 422


def test_attempt_below_fluent_requires_a_diagnosis(client: TestClient) -> None:
    session_id = open_session(client)
    start = client.post(
        "/api/checks/a1-mha-from-memory/attempts",
        json={"session_id": session_id, "confidence_pre": 90},
    )
    bad = client.post(
        "/api/attempts/submit",
        json={
            "attempt_path": start.json()["attempt_path"],
            "answer": "blank",
            "rubric": ["missing"],
            "score": "cant",
        },
    )
    assert bad.status_code == 422


def test_overconfident_miss_is_flagged_and_logged(client: TestClient, cfg: config.Config) -> None:
    """A confident wipe-out flags the check and writes the error ledger."""
    result = full_attempt(client, score="cant", confidence=90)
    assert result["submit"]["overconfident_miss"] is True

    check = client.get("/api/checks/a1-mha-from-memory").json()
    assert check["state"] == "attempted"
    assert check["overconfident_miss"] is True
    assert check["attempt_count"] == 1

    rows = [json.loads(line) for line in cfg.errors_file.read_text().splitlines() if line.strip()]
    assert rows[0]["category"] == "off_by_one_masking"
    assert rows[0]["check_id"] == "a1-mha-from-memory"

    assert check["next_due"] == (date.today() + timedelta(days=2)).isoformat()
    assert client.get("/api/review/due").json() == []  # forced +2, not due yet

    _backdate(cfg, days=10)
    queue = client.get("/api/review/due").json()
    assert queue[0]["check_id"] == "a1-mha-from-memory"
    assert queue[0]["module_id"] == "a1"
    assert queue[0]["overdue_days"] == 8


def _backdate(cfg: config.Config, days: int) -> None:
    """Rewrite every attempt file's `submitted` date `days` into the past."""
    for path in cfg.vault.glob("modules/*/attempts/*.md"):
        post = frontmatter.loads(path.read_text())
        moment = datetime.fromisoformat(str(post["submitted"])) - timedelta(days=days)
        post["submitted"] = moment.isoformat()
        path.write_text(frontmatter.dumps(post) + "\n")


def test_double_submit_is_409(client: TestClient) -> None:
    result = full_attempt(client)
    again = client.post(
        "/api/attempts/submit",
        json={
            "attempt_path": result["submit"]["attempt_path"],
            "answer": "again",
            "rubric": ["met"],
            "score": "fluent",
        },
    )
    assert again.status_code == 409


def test_ai_endpoints_are_locked_while_an_attempt_is_open(client: TestClient) -> None:
    """423 while an attempt is open (spec §7.3); the route opens again once it is submitted."""
    session_id = open_session(client)
    start = client.post(
        "/api/checks/a1-mha-from-memory/attempts",
        json={"session_id": session_id, "confidence_pre": 40},
    )
    locked = client.post("/api/ai/tidy", json={"module_id": "a1", "text": "x"})
    assert locked.status_code == 423
    critique = client.post("/api/ai/critique", json={"attempt_path": start.json()["attempt_path"]})
    assert critique.status_code == 423

    client.post(
        "/api/attempts/submit",
        json={
            "attempt_path": start.json()["attempt_path"],
            "answer": "done",
            "rubric": ["met"],
            "score": "fluent",
        },
    )
    reopened = client.post("/api/ai/tidy", json={"module_id": "a1", "text": "x"})
    assert reopened.status_code == 200
    assert "event: error" in reopened.text  # no credential in the test environment


def test_freezing_is_what_unlocks_the_ai_actions(client: TestClient) -> None:
    """Freezing ends the open answer, so the second opinion is available beside it."""
    session_id = open_session(client)
    start = client.post(
        "/api/checks/a1-mha-from-memory/attempts",
        json={"session_id": session_id, "confidence_pre": 40},
    ).json()
    path = start["attempt_path"]
    assert client.post("/api/ai/critique", json={"attempt_path": path}).status_code == 423

    client.post("/api/attempts/freeze", json={"attempt_path": path, "answer": "written"})
    assert client.get("/api/sessions/current").json()["open_attempt_path"] is None

    critique = client.post("/api/ai/critique", json={"attempt_path": path})
    assert critique.status_code == 200  # frozen counts as submitted for §7.2
    assert "event: error" in critique.text  # no credential in the test environment
