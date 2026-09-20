"""The learner decides a topic's state; the derived state is only the fallback."""

from __future__ import annotations

from fastapi.testclient import TestClient


def _first_idea(client: TestClient, module_id: str) -> dict:
    detail = client.get(f"/api/modules/{module_id}").json()
    assert detail["topics"], "fixture module needs at least one idea topic"
    return detail["topics"][0]


def test_topic_state_defaults_to_derived(client_v2: TestClient) -> None:
    topic = _first_idea(client_v2, "a1")
    assert topic["state"] == topic["derived_state"]
    assert topic["state_set_by_you"] is False
    assert topic["state_set_at"] is None


def test_learner_can_set_and_clear_a_topic_state(client_v2: TestClient) -> None:
    topic = _first_idea(client_v2, "a1")
    tid = topic["id"]

    done = client_v2.patch(f"/api/modules/a1/topics/{tid}", json={"state": "proved"})
    assert done.status_code == 200, done.text
    row = next(t for t in done.json()["topics"] if t["id"] == tid)
    assert row["state"] == "proved"
    assert row["state_set_by_you"] is True
    assert row["state_set_at"]
    assert row["derived_state"] == topic["derived_state"]  # the truth stays visible
    assert done.json()["step_summary"].startswith("1 ")

    cleared = client_v2.patch(f"/api/modules/a1/topics/{tid}", json={"state": None})
    row = next(t for t in cleared.json()["topics"] if t["id"] == tid)
    assert row["state"] == topic["derived_state"]
    assert row["state_set_by_you"] is False


def test_topic_state_rejects_unknown_values_and_non_ideas(client_v2: TestClient) -> None:
    topic = _first_idea(client_v2, "a1")
    bad = client_v2.patch(f"/api/modules/a1/topics/{topic['id']}", json={"state": "finished"})
    assert bad.status_code == 422
    chores = client_v2.get("/api/modules/a1").json()["chores"]
    if chores:
        chore = client_v2.patch(
            f"/api/modules/a1/topics/{chores[0]['topic_id']}", json={"state": "proved"}
        )
        assert chore.status_code == 422
    missing = client_v2.patch("/api/modules/a1/topics/nope", json={"state": "proved"})
    assert missing.status_code == 404
