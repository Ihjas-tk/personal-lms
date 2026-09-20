"""`GET /api/desk` and `GET /api/track`: the two overview payloads of contract §3."""

from __future__ import annotations

from datetime import date, timedelta

from starlette.testclient import TestClient

from conftest import close_session, full_attempt, open_session, seed_attempt
from learn import config

DESK_KEYS = {
    "first_run",
    "week_now",
    "weeks_total",
    "debrief_day",
    "plan",
    "start_label",
    "first_action",
    "warmup",
    "standing",
    "ridge",
    "gains",
    "calibration_by_week",
    "newly_proved",
    "hours",
    "slipping",
}


def test_desk_first_run_offers_one_thing_to_do(either_client: TestClient) -> None:
    """No closed session yet: the band is the first action, and nothing has moved."""
    body = either_client.get("/api/desk").json()
    assert set(body) == DESK_KEYS
    assert body["first_run"] is True
    assert body["plan"] is None
    assert body["first_action"]["check_id"]
    assert body["first_action"]["module_id"]
    assert body["start_label"] == "Start · about 2 hours"
    assert body["standing"]["checks_lasting"] == 0
    # Derived from the fixture curriculum (phases run to week 10), not a constant.
    assert body["standing"]["weeks_left"] == 10
    assert body["gains"] == {
        "lasting_delta_4w": 0,
        "solid_delta_4w": 0,
        "checks_attempted_4w": 0,
        "hours_4w": 0.0,
    }
    assert body["calibration_by_week"] == []
    assert body["newly_proved"] == []
    assert all(c["counts"]["untouched"] == sum(c["counts"].values()) for c in body["ridge"])


def test_desk_after_a_closed_session_reads_the_plan(either_client: TestClient) -> None:
    """One closed session ends the first run and the if-then plan becomes the band."""
    full_attempt(either_client)
    close_session(either_client)
    body = either_client.get("/api/desk").json()
    assert body["first_run"] is False
    assert body["first_action"] is None
    assert body["plan"]["written_on"] == "Sunday"  # curriculum `debrief_day`
    assert body["plan"]["text"].startswith("IF it is Sunday after breakfast THEN I will")
    assert body["gains"]["checks_attempted_4w"] == 1
    assert body["newly_proved"][0]["check_id"] == "a1-mha-from-memory"
    assert body["newly_proved"][0]["state"] == "proficient"
    assert body["slipping"].endswith("Under is fine.")


def test_desk_warmup_is_four_items_with_a_chip_each(client_v2: TestClient) -> None:
    body = client_v2.get("/api/desk").json()
    assert 0 < len(body["warmup"]) <= 4
    for item in body["warmup"]:
        assert item["chip"] in ("due", "new", "old", "error")
        assert item["prompt"] and item["reason"]
        assert set(item) == {"check_id", "module_id", "prompt", "reason", "chip"}


def test_desk_ridge_counts_one_area_at_a_time(
    client_v2: TestClient, cfg_v2: config.Config
) -> None:
    """Two clean passes a week apart make a check lasting — in its own area's column."""
    today = date.today()
    seed_attempt(cfg_v2, "a1-mha-from-memory", "a1", today - timedelta(days=20), session_id="s1")
    seed_attempt(cfg_v2, "a1-mha-from-memory", "a1", today - timedelta(days=2), session_id="s2")
    seed_attempt(cfg_v2, "b0-open-coding", "b0", today - timedelta(days=1), score="partial")
    ridge = {c["area_id"]: c for c in client_v2.get("/api/desk").json()["ridge"]}
    assert ridge["transformers"]["counts"] == {
        "lasting": 1,
        "solid": 0,
        "shaky": 0,
        "tried": 0,
        "untouched": 4,
    }
    assert ridge["transformers"]["delta_4w"] == 1
    assert ridge["evals-found"]["counts"]["shaky"] == 1
    assert ridge["evals-found"]["title"] == "Evals foundation"

    desk = client_v2.get("/api/desk").json()
    assert desk["standing"]["checks_lasting"] == 1
    assert desk["standing"]["core_total"] == 6
    assert desk["gains"]["lasting_delta_4w"] == 1
    assert [r["check_id"] for r in desk["newly_proved"]] == ["a1-mha-from-memory"]


def test_desk_standing_names_the_draft_artefact(client_v2: TestClient) -> None:
    client_v2.patch("/api/capstone", json={"id": "cap-golden-set", "state": "draft"})
    client_v2.patch("/api/capstone", json={"id": "cap-failure-taxonomy", "state": "done"})
    standing = client_v2.get("/api/desk").json()["standing"]
    assert standing["artefacts_exist"] == 1
    assert standing["artefacts_total"] == 2
    assert standing["artefact_note"] == "the golden dataset is in draft"


def test_track_bands_split_the_whole_track(client_v2: TestClient) -> None:
    """`weeks_total` is derived from the curriculum's phases, not a constant."""
    body = client_v2.get("/api/track").json()
    assert body["weeks_total"] == 10 and len(body["weeks"]) == 10
    assert body["weeks"][body["week_now"] - 1]["state"] == "current"
    assert {c["state"] for c in body["weeks"]} <= {"past", "phase", "current", "future"}
    assert body["headline"] == {
        "lasting_pct": 0.0,
        "attempted_pct": 0.0,
        "core_total": 6,
        "lasting_total": 0,
    }
    assert body["this_phase"]["phase_id"] == "p0"
    assert [r["module_id"] for r in body["this_phase"]["rows"]] == ["p0-orient"]
    assert body["this_phase"]["hours_budget"] == 20.0
    assert [r["module_id"] for r in body["later"]] == ["a1", "b0"]
    assert all(r["action"] == "Preview" and r["tone"] == "later" for r in body["later"])
    assert body["unfinished"] == []


def test_track_row_carries_proof_and_the_prerequisite_warning(client_v2: TestClient) -> None:
    """b0 needs a1; with nothing solid in a1 the row says so in words."""
    row = next(r for r in client_v2.get("/api/track").json()["later"] if r["module_id"] == "b0")
    assert set(row) == {
        "module_id",
        "title",
        "track",
        "weeks",
        "due",
        "tone",
        "hours_logged",
        "hours_budget",
        "proof",
        "proof_text",
        "warning",
        "action",
        "artefact_state",
    }
    assert row["proof"] == {"total": 1, "lasting": 0, "solid": 0, "partial": 0}
    assert row["proof_text"] == "0 of 1 lasting"
    assert row["warning"] == "needs Transformers from scratch first"
    assert row["due"] == "2026-12-01"


def test_track_marks_overdue_checks_and_unfinished_modules(
    client_v2: TestClient, cfg_v2: config.Config
) -> None:
    """Push the plan back eight weeks so week windows fall behind, then read the bands."""
    today = date.today()
    seed_attempt(cfg_v2, "p0-harness-definition", "p0-orient", today - timedelta(days=16))
    client_v2.post("/api/plan/shift", json={"weeks": -8})
    body = client_v2.get("/api/track").json()
    assert body["offset_weeks"] == -8
    left = next(r for r in body["unfinished"] if r["module_id"] == "p0-orient")
    assert left["tone"] == "late"
    assert left["warning"] == "1 check 9 days overdue"  # fluent 16 days ago, due after 7
    assert left["proof"]["solid"] == 1
    assert left["proof_text"] == "0 of 2 lasting"
    assert left["action"] == "Resume"
    assert body["this_phase"]["phase_id"] == "p1"
    assert body["this_phase"]["order_note"].startswith("Do them in this order")


def test_track_still_answers_on_a_v1_file(client: TestClient) -> None:
    """The v1 fixture has no areas and no topics; the track screen still renders."""
    body = client.get("/api/track").json()
    assert body["headline"]["core_total"] == 6
    assert body["this_phase"]["phase_id"] == "p0"
    assert [r["module_id"] for r in body["later"]] == ["a1", "a2"]
    assert client.get("/api/plan").json()["must_cover_total"] == 6


def test_today_and_plan_still_work_beside_the_new_routes(either_client: TestClient) -> None:
    """The v1 routes keep answering; the redesign adds screens, it does not break clients."""
    open_session(either_client, "a1")
    today = either_client.get("/api/today").json()
    assert today["current_module_id"] == "a1"
    assert set(today) == {
        "plan_text",
        "next_action",
        "current_module_id",
        "due_count",
        "week_hours",
        "activity",
    }
    assert either_client.get("/api/plan").json()["coverage"] == 0.0
