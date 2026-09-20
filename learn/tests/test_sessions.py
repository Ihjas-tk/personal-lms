"""Session lifecycle, warm-up, review, errors, capstone and today."""

from __future__ import annotations

from starlette.testclient import TestClient

from conftest import REFLECTION, close_session, full_attempt, open_session
from learn import config


def test_session_close_requires_reflection_and_if_then(client: TestClient) -> None:
    open_session(client)
    assert close_session(client, reflection="too short").status_code == 422
    assert close_session(client, if_cue="  ").status_code == 422
    assert close_session(client, then_action="").status_code == 422
    assert close_session(client, fatigue=9).status_code == 422

    ok = close_session(client)
    assert ok.status_code == 200
    session = ok.json()
    assert session["closed"] is not None
    assert session["fatigue"] == 3
    assert "IF it is Sunday after breakfast" in session["body"]
    assert "THEN I will re-derive" in session["body"]
    assert ok.json()["snapshot"]["ok"] is True


def test_only_one_session_is_open_at_a_time(client: TestClient) -> None:
    open_session(client)
    assert client.post("/api/sessions/start", json={"module_id": "a1"}).status_code == 409
    assert client.get("/api/sessions/current").json()["module_id"] == "a1"


def test_phase_switch_accrues_minutes(client: TestClient) -> None:
    open_session(client)
    patched = client.patch("/api/sessions/current", json={"phase": "review"})
    assert patched.status_code == 200
    assert patched.json()["phase"] == "review"
    assert set(patched.json()["minutes"]) == {"new", "review", "build"}
    closed = close_session(client, minutes={"new": 95, "review": 20, "build": 40}).json()
    assert closed["minutes"] == {"new": 95, "review": 20, "build": 40}
    module = client.get("/api/modules/a1").json()
    assert module["actual_hours"] == 2.58


def test_discard_removes_the_session_and_its_open_attempts(client: TestClient) -> None:
    session_id = open_session(client)
    client.post(
        "/api/checks/a1-mha-from-memory/attempts",
        json={"session_id": session_id, "confidence_pre": 50},
    )
    discarded = client.post("/api/sessions/discard", json={}).json()
    assert discarded == {"ok": True, "discarded": session_id}
    assert client.get("/api/sessions/current").json() is None
    assert client.get("/api/checks/a1-mha-from-memory").json()["attempts"] == []


def test_warmup_draws_attemptable_items_with_a_reason(client: TestClient) -> None:
    """Every warm-up row is a check the client can open, tagged with why it was drawn."""
    full_attempt(client, score="cant", confidence=90)
    close_session(client)
    open_session(client)
    items = client.get("/api/sessions/warmup").json()
    assert 1 <= len(items) <= 8
    assert all(item["check_id"] and "reference" not in item for item in items)
    reasons = {item["reason"] for item in items}
    assert reasons <= {"due", "unattempted", "last_session", "old_module", "error"}
    assert items[0]["reason"] in ("due", "unattempted")


def test_error_ledger_read_append_and_resolve(client: TestClient) -> None:
    created = client.post(
        "/api/errors",
        json={
            "text": "conflated MHA and MQA",
            "diagnosis": "same KV heads",
            "category": "conflated_two_things",
        },
    )
    assert created.status_code == 200
    error_id = created.json()["id"]
    assert len(client.get("/api/errors", params={"unresolved": True}).json()) == 1
    resolved = client.patch("/api/errors", json={"id": error_id, "resolution": "re-read the paper"})
    assert resolved.json()["resolved"] is True
    assert client.get("/api/errors", params={"unresolved": True}).json() == []
    assert client.post("/api/errors", json={"text": "x", "diagnosis": " "}).status_code == 422


def test_capstone_board(client: TestClient) -> None:
    items = client.get("/api/capstone").json()
    assert len(items) == 2
    assert items[0]["state"] == "not_started"
    patched = client.patch("/api/capstone", json={"id": "cap-golden-set", "state": "draft"})
    golden = next(i for i in patched.json() if i["id"] == "cap-golden-set")
    assert golden["state"] == "draft"
    bad = client.patch("/api/capstone", json={"id": "cap-golden-set", "state": "bogus"})
    assert bad.status_code == 422
    assert client.patch("/api/capstone", json={"id": "nope", "state": "draft"}).status_code == 404


def test_weekly_review_and_today(client: TestClient, cfg: config.Config) -> None:
    full_attempt(client, score="fluent", confidence=60)
    close_session(client)

    weekly = client.get("/api/review/weekly").json()
    assert weekly["calibration"]["n"] == 1
    assert weekly["calibration"]["brier"] is not None
    assert len(weekly["burn_up"]) == 40
    assert weekly["banked_skips"] >= 0
    assert weekly["hours"]["week_hours"]["budget"] > 0
    assert all(b["mean_confidence"] is not None for b in weekly["calibration"]["buckets"])

    today = client.get("/api/today").json()
    assert today["plan_text"] == (
        "IF it is Sunday after breakfast "
        "THEN I will re-derive the attention gradient on paper for 10 minutes"
    )
    assert today["next_action"]["kind"] in ("retest", "check", "resource", "none")
    assert today["next_action"]["label"]
    assert len(today["activity"]) == 280
    assert set(today["week_hours"]) == {"new", "review", "build", "budget"}
    written = sorted(cfg.sessions_dir.glob("*.md"))[-1].read_text()
    assert REFLECTION[:20] in written


def test_current_session_counts_attempts_and_errors(client: TestClient) -> None:
    """§1b: the wrap-up summary reads these off the vault, not off a browser tally."""
    session_id = open_session(client)
    blank = client.get("/api/sessions/current").json()
    assert blank["checks_attempted"] == 0
    assert blank["errors_logged"] == 0

    start = client.post(
        "/api/checks/a1-mha-from-memory/attempts",
        json={"session_id": session_id, "confidence_pre": 80},
    ).json()
    assert client.get("/api/sessions/current").json()["checks_attempted"] == 1

    client.post(
        "/api/attempts/submit",
        json={
            "attempt_path": start["attempt_path"],
            "answer": "half of it",
            "rubric": ["partial"],
            "score": "partial",
            "category": "off_by_one_masking",
            "diagnosis": "mask after softmax again",
        },
    )
    current = client.get("/api/sessions/current").json()
    assert current["checks_attempted"] == 1
    assert current["errors_logged"] == 1  # the grade wrote the ledger row
