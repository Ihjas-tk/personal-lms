"""Regression: the module payload's capstone rows must carry stored-state fields.

Before this test, `/modules/{id}` returned bare curriculum artefacts (no `state`),
and the React module page unmounted entirely for every module owning an artefact.
"""

from __future__ import annotations

from fastapi.testclient import TestClient


def _module_with_artefact(client: TestClient) -> tuple[str, str]:
    board = client.get("/api/capstone").json()
    assert board, "fixture track needs at least one capstone artefact"
    item = board[0]
    return item["modules"][0], item["id"]


def test_module_capstone_rows_have_state(client: TestClient) -> None:
    module_id, _ = _module_with_artefact(client)
    detail = client.get(f"/api/modules/{module_id}").json()
    assert detail["capstone"], "module should list its artefacts"
    for row in detail["capstone"]:
        assert row["state"] == "not_started"
        assert set(row) >= {"id", "title", "state", "notes", "path", "next_action"}


def test_module_capstone_reflects_patch(client: TestClient) -> None:
    module_id, item_id = _module_with_artefact(client)
    client.patch("/api/capstone", json={"id": item_id, "state": "draft", "notes": "started"})
    detail = client.get(f"/api/modules/{module_id}").json()
    row = next(r for r in detail["capstone"] if r["id"] == item_id)
    assert row["state"] == "draft"
    assert row["notes"] == "started"
    board = client.get("/api/capstone").json()
    assert next(r for r in board if r["id"] == item_id)["state"] == "draft"
