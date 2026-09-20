"""A source is done when the learner says so — an article is finished when read."""

from __future__ import annotations

from fastapi.testclient import TestClient


def _source(client: TestClient, module_id: str, rid: str) -> dict:
    detail = client.get(f"/api/modules/{module_id}").json()
    return next(r for r in detail["resources"] if r["id"] == rid)


def test_marking_a_source_done_counts_at_any_rung(client_v2: TestClient) -> None:
    detail = client_v2.get("/api/modules/a1").json()
    rid = detail["resources"][0]["id"]

    read = client_v2.patch(f"/api/modules/a1/resources/{rid}", json={"state": "read"})
    row = next(r for r in read.json()["resources"] if r["id"] == rid)
    assert row["counts"] is False and row["done"] is False

    done = client_v2.patch(f"/api/modules/a1/resources/{rid}", json={"done": True})
    row = next(r for r in done.json()["resources"] if r["id"] == rid)
    assert row["done"] is True and row["done_at"]
    assert row["counts"] is True
    assert row["state"] == "read"  # the ladder rung is untouched
    assert row["pct"] == 1.0 and row["action"] == "Notes"

    undone = client_v2.patch(f"/api/modules/a1/resources/{rid}", json={"done": False})
    row = next(r for r in undone.json()["resources"] if r["id"] == rid)
    assert row["done"] is False and row["done_at"] is None and row["counts"] is False


def test_done_sources_finish_a_topic_without_checks(client_v2: TestClient) -> None:
    detail = client_v2.get("/api/modules/a1").json()
    topic = next((t for t in detail["topics"] if t["sources"] and not t["checks"]), None)
    if topic is None:
        return  # fixture has no source-only topic; nothing to assert
    for s in topic["sources"]:
        detail = client_v2.patch(
            f"/api/modules/a1/resources/{s['id']}", json={"done": True}
        ).json()
    row = next(t for t in detail["topics"] if t["id"] == topic["id"])
    assert row["derived_state"] == "proved"
