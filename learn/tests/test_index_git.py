"""The index is disposable, the watcher pushes SSE events, and git has a fallback."""

from __future__ import annotations

import json
import shutil
import sqlite3

from starlette.testclient import TestClient

from conftest import close_session, full_attempt
from learn import config, git, index, main
from learn.routers import vault


def test_deleting_the_cache_is_a_no_op(client: TestClient, cfg: config.Config) -> None:
    """`rm -rf .cache` then rebuild yields a byte-identical `/plan`."""
    full_attempt(client, score="fluent", confidence=80)
    close_session(client)
    index.rebuild()
    before = client.get("/api/plan").json()
    assert cfg.index_db.exists()

    shutil.rmtree(cfg.cache)
    assert not cfg.index_db.exists()
    after_delete = client.get("/api/plan").json()
    index.rebuild()
    after_rebuild = client.get("/api/plan").json()

    assert before == after_delete == after_rebuild
    assert cfg.index_db.exists()


def test_rebuild_picks_up_an_external_edit(client: TestClient, cfg: config.Config) -> None:
    """A file written outside the app lands in the derived tables on the next rebuild."""
    index.rebuild()
    (cfg.vault / "modules" / "a2").mkdir(parents=True, exist_ok=True)
    (cfg.vault / "modules" / "a2" / "notes.md").write_text(
        "---\ntitle: a2\n---\nbyte pair encoding by hand\n", encoding="utf-8"
    )
    counts = index.rebuild()
    assert counts["files"] >= 1

    conn = sqlite3.connect(cfg.index_db)
    try:
        body = conn.execute("SELECT body FROM notes_fts WHERE module_id = 'a2'").fetchone()[0]
        rows = conn.execute("SELECT count(*) FROM checks_state").fetchone()[0]
    finally:
        conn.close()
    assert "byte pair encoding by hand" in body
    assert rows == 8


def test_lifespan_rebuilds_the_index_and_starts_the_watcher(cfg: config.Config) -> None:
    """Startup ensures the vault, inits its repo and builds the index from the files."""
    shutil.rmtree(cfg.cache, ignore_errors=True)
    with TestClient(main.app) as live:
        health = live.get("/api/health").json()
        assert health["ok"] is True
        assert health["vault_git"] is True
        assert health["ai_available"] is False
        assert cfg.index_db.exists()


async def test_sse_stream_emits_changed_events(cfg: config.Config) -> None:
    """The `/api/events` generator opens, then forwards each broker event as an SSE frame.

    Driven directly: this starlette TestClient buffers whole responses, so an endless
    stream cannot be read through it.
    """
    stream = vault._stream()
    assert await anext(stream) == "event: open\ndata: {}\n\n"
    index.broker.publish({"event": "changed", "paths": ["notes.md"]})
    frame = await anext(stream)
    assert frame.startswith("event: changed\ndata: ")
    assert json.loads(frame.split("data: ", 1)[1].strip())["paths"] == ["notes.md"]
    await stream.aclose()
    assert not index.broker._subscribers


def test_snapshot_uses_git_when_available(client: TestClient, cfg: config.Config) -> None:
    assert git.ensure_repo() is True
    client.put("/api/modules/a1/note", json={"frontmatter": {}, "body": "notes", "mtime_ns": 0})
    result = client.post("/api/vault/snapshot", json={"message": "test snapshot"}).json()
    assert result == {"ok": True, "mode": "git", "detail": "test snapshot"}
    assert client.get("/api/health").json()["vault_git"] is True


def test_snapshot_falls_back_to_backups_without_git(
    client: TestClient, cfg: config.Config, monkeypatch
) -> None:
    """With no `git` on PATH the vault is copied into `.cache/backups` instead."""
    monkeypatch.setattr(git.shutil, "which", lambda _: None)
    client.put("/api/modules/a1/note", json={"frontmatter": {}, "body": "notes", "mtime_ns": 0})
    result = client.post("/api/vault/snapshot", json={"message": "fallback"}).json()
    assert result["ok"] is True and result["mode"] == "backup"
    copies = [p for p in cfg.backups.rglob("*.md") if p.is_file()]
    assert copies and copies[0].parent.name == "notes.md"
    assert copies[0].read_text().endswith("notes\n")
