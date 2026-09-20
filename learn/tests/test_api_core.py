"""Health, curriculum, plan, modules, notes and resources over HTTP."""

from __future__ import annotations

from pathlib import Path

import pytest
from starlette.testclient import TestClient

from learn import config


def test_health_reports_ai_unavailable(client: TestClient) -> None:
    """With no credential resolvable, health names both credential paths (§7)."""
    body = client.get("/api/health").json()
    assert body["ok"] is True
    assert body["ai_available"] is False
    assert body["vault_git"] is False
    assert "ANTHROPIC_API_KEY" in body["ai_reason"]
    assert "learn/.env" in body["ai_reason"]
    # §6.3: one sentence, verbatim, backticks and all — the client only sets them in mono.
    from learn.ai import NO_CREDENTIAL

    assert body["ai_reason"] == NO_CREDENTIAL


def test_curriculum_parses_the_fixture(client: TestClient) -> None:
    """The authored track, minus every reference answer (no route reveals one early)."""
    body = client.get("/api/curriculum").json()
    assert all("reference" not in c for m in body["modules"] for c in m["checks"])
    assert [p["id"] for p in body["phases"]] == ["p0", "p1"]
    assert len(body["modules"]) == 3
    assert sum(len(m["checks"]) for m in body["modules"]) == 8
    assert len(body["capstone"]) == 2


def test_plan_shape_and_coverage(client: TestClient) -> None:
    body = client.get("/api/plan").json()
    assert body["offset_weeks"] == 0
    assert body["coverage"] == 0.0
    assert body["attempted_pct"] == 0.0
    assert body["durable_pct"] == 0.0
    assert body["must_cover_total"] == 6
    a1 = next(m for m in body["phases"][1]["modules"] if m["id"] == "a1")
    assert a1["state"] == "not_started"
    assert a1["blocked"] is True  # p0-orient is below familiar


def test_plan_shift_moves_soft_dates(client: TestClient) -> None:
    before = client.get("/api/plan").json()["phases"][1]["modules"][0]["soft_date"]
    shifted = client.post("/api/plan/shift", json={"weeks": 1}).json()
    assert shifted["offset_weeks"] == 1
    assert shifted["offset_from"] is not None
    after = shifted["phases"][1]["modules"][0]["soft_date"]
    assert after > before


def test_note_put_with_stale_mtime_returns_409(client: TestClient) -> None:
    """The reveal of a concurrent edit: 409 carrying the current content."""
    first = client.get("/api/modules/a1/note").json()
    ok = client.put(
        "/api/modules/a1/note",
        json={"frontmatter": first["frontmatter"], "body": "v1", "mtime_ns": first["mtime_ns"]},
    )
    assert ok.status_code == 200
    stale = client.put(
        "/api/modules/a1/note",
        json={"frontmatter": first["frontmatter"], "body": "v2", "mtime_ns": first["mtime_ns"]},
    )
    assert stale.status_code == 409
    assert stale.json()["current"]["body"] == "v1"
    assert client.get("/api/modules/a1/note").json()["body"] == "v1"


def test_module_page_and_resource_patch(client: TestClient) -> None:
    module = client.get("/api/modules/a1").json()
    assert module["budget_hours"] == 70
    assert len(module["resources"]) == 3
    assert len(module["checks"]) == 4
    assert all("reference" not in c for c in module["checks"])

    patched = client.patch(
        "/api/modules/a1/resources/a1-karpathy-gpt",
        json={"state": "reconstructed", "minutes_delta": 90},
    )
    assert patched.status_code == 200
    row = next(r for r in patched.json()["resources"] if r["id"] == "a1-karpathy-gpt")
    assert (row["state"], row["minutes"], row["path"], row["counts"]) == (
        "reconstructed",
        90,
        None,
        True,
    )


def test_unknown_ids_are_404(client: TestClient) -> None:
    assert client.get("/api/modules/nope").status_code == 404
    assert client.get("/api/checks/nope").status_code == 404
    assert client.patch("/api/modules/a1/resources/nope", json={"state": "read"}).status_code == 404


def test_external_file_edit_is_reflected(client: TestClient, cfg: config.Config) -> None:
    """Files are the truth: an edit made outside the app shows up on the next read."""
    client.put("/api/modules/a2/note", json={"frontmatter": {}, "body": "from app", "mtime_ns": 0})
    path = cfg.vault / "modules" / "a2" / "notes.md"
    path.write_text("---\ntitle: edited outside\n---\nby hand\n", encoding="utf-8")
    note = client.get("/api/modules/a2/note").json()
    assert note["body"].strip() == "by hand"
    assert note["frontmatter"]["title"] == "edited outside"


def test_client_routes_fall_back_to_the_spa(client: TestClient) -> None:
    """A deep link or a reload on `/plan` must open the app, not 404 (§6)."""
    if not (Path(__file__).resolve().parents[1] / "src" / "learn" / "static").is_dir():
        pytest.skip("frontend not built")
    for path in ("/", "/plan", "/modules/a1", "/review/weekly"):
        response = client.get(path)
        assert response.status_code == 200, path
        assert "<div id=\"root\">" in response.text, path
    assert client.get("/api/modules/nope").status_code == 404
    # An unknown API path must be a real 404, never the SPA shell.
    missing = client.get("/api/does-not-exist")
    assert missing.status_code == 404, missing.text[:80]
    assert "<div id=\"root\">" not in missing.text
