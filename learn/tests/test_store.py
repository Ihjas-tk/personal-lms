"""Store round-trip, atomic writes and `mtime_ns` optimistic concurrency."""

from __future__ import annotations

import struct
from pathlib import Path

import pytest

from learn import config, store
from learn.curriculum import load_track


def test_atomic_write_leaves_no_temp_files(cfg: config.Config) -> None:
    """The temp file is replaced, not left behind, and the mtime is returned."""
    target = cfg.vault / "modules" / "a1" / "notes.md"
    mtime = store.write_atomic(target, "hello\n")
    assert target.read_text() == "hello\n"
    assert mtime == target.stat().st_mtime_ns
    assert not list(target.parent.glob(".tmp-*"))


def test_atomic_write_does_not_clobber_on_failure(cfg: config.Config, monkeypatch) -> None:
    """A write that raises mid-flight leaves the previous content intact."""
    target = cfg.vault / "modules" / "a1" / "notes.md"
    store.write_atomic(target, "original\n")

    def boom(*_: object, **__: object) -> None:
        raise OSError("disk full")

    monkeypatch.setattr(store.os, "replace", boom)
    with pytest.raises(OSError):
        store.write_atomic(target, "replacement\n")
    assert target.read_text() == "original\n"
    assert not list(target.parent.glob(".tmp-*"))


def test_note_round_trip(cfg: config.Config) -> None:
    """Frontmatter and body survive a write/read cycle."""
    empty = store.read_note("a1", "Transformers")
    assert empty["mtime_ns"] == 0 and empty["body"] == ""
    written = store.write_note("a1", {"title": "Transformers", "tags": ["llm"]}, "# Notes\n", 0)
    again = store.read_note("a1")
    assert again["body"].strip() == "# Notes"
    assert again["frontmatter"]["tags"] == ["llm"]
    assert again["mtime_ns"] == written["mtime_ns"]


def test_stale_mtime_raises(cfg: config.Config) -> None:
    """A second write echoing the old mtime is refused with the current content."""
    store.write_note("a1", {"title": "t"}, "first\n", 0)
    with pytest.raises(store.StaleWriteError) as exc:
        store.write_note("a1", {"title": "t"}, "second\n", 0)
    assert exc.value.current["body"].strip() == "first"


def test_error_ledger_is_append_only(cfg: config.Config) -> None:
    """Resolving appends a delta; the ledger folds by id with the last write winning."""
    entry = store.append_error({"text": "mask order", "diagnosis": "applied after softmax"})
    store.patch_error(entry["id"], {"resolved": True, "resolution": "re-derived it"})
    lines = store.read_jsonl(cfg.errors_file)
    assert len(lines) == 2
    folded = store.read_errors()
    assert len(folded) == 1 and folded[0]["resolved"] is True
    assert folded[0]["text"] == "mask order"


def test_resolve_in_vault_refuses_escape(cfg: config.Config) -> None:
    with pytest.raises(store.NotFoundError):
        store.resolve_in_vault("../../etc/passwd")


def test_plan_is_seeded_from_the_track(cfg: config.Config) -> None:
    plan = store.read_plan(load_track())
    assert plan["offset_weeks"] == 0
    assert Path(cfg.plan_file).exists()


def test_note_mtime_survives_a_javascript_json_round_trip(cfg: config.Config) -> None:
    """A browser cannot echo an 18-digit integer exactly; the write must still succeed.

    `mtime_ns` is far past 2^53, so a client's `JSON.parse` snaps it to the nearest
    double. Rejecting that would 409 every save after the first one.
    """
    store.write_note("a1", {}, "v1", 0)
    exact = store.read_note("a1")["mtime_ns"]
    through_js = int(struct.unpack("d", struct.pack("d", float(exact)))[0])

    saved = store.write_note("a1", {}, "v2", through_js)
    assert saved["body"] == "v2"
    assert store.read_note("a1")["body"] == "v2"

    with pytest.raises(store.StaleWriteError):
        store.write_note("a1", {}, "v3", exact - 10**9)
