"""Derived SQLite index over `vault/`, plus the watchfiles → SSE change stream.

Nothing here ever writes back to files. Deleting `.cache/` is a no-op: the index is
rebuilt from the files on startup and every route reads the files, not this index.
"""

from __future__ import annotations

import asyncio
import contextlib
import hashlib
import sqlite3
from pathlib import Path
from typing import Any

from . import store
from .config import get_config
from .curriculum import load_track
from .ladder import schedule

SCHEMA = """
CREATE TABLE IF NOT EXISTS files (path TEXT PRIMARY KEY, mtime_ns INTEGER, size INTEGER, hash TEXT);
CREATE TABLE IF NOT EXISTS attempts (
  path TEXT PRIMARY KEY, check_id TEXT, session_id TEXT, submitted TEXT,
  confidence_pre INTEGER, score TEXT, warmup INTEGER
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, module_id TEXT, started TEXT, closed TEXT, minutes INTEGER, fatigue INTEGER
);
CREATE TABLE IF NOT EXISTS resources (
  module_id TEXT, resource_id TEXT, state TEXT, minutes INTEGER, path TEXT,
  PRIMARY KEY (module_id, resource_id)
);
CREATE TABLE IF NOT EXISTS checks_state (
  check_id TEXT PRIMARY KEY, module_id TEXT, state TEXT, next_due TEXT,
  attempt_count INTEGER, overconfident_miss INTEGER
);
CREATE TABLE IF NOT EXISTS notes (
  path TEXT PRIMARY KEY, module_id TEXT, topic_id TEXT, mtime_ns INTEGER, words INTEGER,
  updated TEXT
);
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(module_id, body);
"""


def connect() -> sqlite3.Connection:
    """Open (creating if needed) the index database."""
    cfg = get_config()
    cfg.cache.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(cfg.index_db, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def _scan_files(conn: sqlite3.Connection) -> int:
    """Refresh the `files` table by comparing (path, mtime_ns, size)."""
    vault = get_config().vault
    known = {r["path"]: (r["mtime_ns"], r["size"]) for r in conn.execute("SELECT * FROM files")}
    seen: set[str] = set()
    changed = 0
    for path in sorted(vault.rglob("*")):
        if not path.is_file() or path.name.startswith(".tmp-") or ".git" in path.parts:
            continue
        rel = path.relative_to(vault).as_posix()
        stat = path.stat()
        seen.add(rel)
        if known.get(rel) == (stat.st_mtime_ns, stat.st_size):
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        conn.execute(
            "INSERT OR REPLACE INTO files VALUES (?,?,?,?)",
            (rel, stat.st_mtime_ns, stat.st_size, digest),
        )
        changed += 1
    for gone in set(known) - seen:
        conn.execute("DELETE FROM files WHERE path = ?", (gone,))
        changed += 1
    return changed


def rebuild() -> dict[str, int]:
    """Rebuild every derived table from the files on disk."""
    cfg = get_config()
    cfg.ensure()
    conn = connect()
    try:
        with conn:
            changed = _scan_files(conn)
            for table in (
                "attempts",
                "sessions",
                "resources",
                "checks_state",
                "notes",
                "notes_fts",
            ):
                conn.execute(f"DELETE FROM {table}")
            attempt_files = store.iter_attempt_files()
            for item in attempt_files:
                conn.execute(
                    "INSERT OR REPLACE INTO attempts VALUES (?,?,?,?,?,?,?)",
                    (
                        item.path,
                        item.meta.get("check_id"),
                        item.meta.get("session_id"),
                        item.meta.get("submitted"),
                        item.meta.get("confidence_pre") or 0,
                        item.meta.get("score"),
                        int(bool(item.meta.get("warmup"))),
                    ),
                )
            for session in store.iter_sessions():
                minutes = sum(int(v or 0) for v in (session.meta.get("minutes") or {}).values())
                conn.execute(
                    "INSERT OR REPLACE INTO sessions VALUES (?,?,?,?,?,?)",
                    (
                        session.id,
                        session.meta.get("module_id"),
                        str(session.meta.get("started") or ""),
                        str(session.meta.get("closed") or ""),
                        minutes,
                        session.meta.get("fatigue") or 0,
                    ),
                )
            track = load_track()
            grouped = store.graded_attempts(attempt_files)
            for module in track.modules:
                for rid, row in (store.read_resources(module.id) or {}).items():
                    conn.execute(
                        "INSERT OR REPLACE INTO resources VALUES (?,?,?,?,?)",
                        (
                            module.id,
                            rid,
                            row.get("state"),
                            row.get("minutes") or 0,
                            row.get("path"),
                        ),
                    )
                for note in store.note_rows(module.id):
                    conn.execute(
                        "INSERT OR REPLACE INTO notes VALUES (?,?,?,?,?,?)",
                        (
                            note["path"],
                            module.id,
                            note["topic_id"],
                            note["mtime_ns"],
                            note["words"],
                            note["updated"],
                        ),
                    )
                    conn.execute(
                        "INSERT INTO notes_fts (module_id, body) VALUES (?,?)",
                        (module.id, note["body"]),
                    )
                for check in module.checks:
                    sched = schedule(grouped.get(check.id, []))
                    conn.execute(
                        "INSERT OR REPLACE INTO checks_state VALUES (?,?,?,?,?,?)",
                        (
                            check.id,
                            module.id,
                            sched.state,
                            sched.next_due.isoformat() if sched.next_due else None,
                            sched.attempt_count,
                            int(sched.overconfident_miss),
                        ),
                    )
            counts = {
                "files": conn.execute("SELECT count(*) FROM files").fetchone()[0],
                "attempts": len(attempt_files),
                "changed": changed,
            }
    finally:
        conn.close()
    return counts


class Broker:
    """Fan-out of `changed` events to open SSE subscribers."""

    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[dict[str, Any]]] = set()
        self._task: asyncio.Task[None] | None = None

    def subscribe(self) -> asyncio.Queue[dict[str, Any]]:
        queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=64)
        self._subscribers.add(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue[dict[str, Any]]) -> None:
        self._subscribers.discard(queue)

    def publish(self, event: dict[str, Any]) -> None:
        for queue in list(self._subscribers):
            with contextlib.suppress(asyncio.QueueFull):
                queue.put_nowait(event)

    async def _watch(self) -> None:
        from watchfiles import awatch

        vault = get_config().vault
        async for batch in awatch(vault, recursive=True):
            paths = sorted({Path(p).name for _, p in batch})
            await asyncio.to_thread(rebuild)
            self.publish({"event": "changed", "paths": paths[:20]})

    def start(self) -> None:
        """Start the watcher if the vault exists and none is running."""
        if self._task is None and get_config().vault.exists():
            self._task = asyncio.create_task(self._watch())

    async def stop(self) -> None:
        if self._task is not None:
            self._task.cancel()
            with contextlib.suppress(asyncio.CancelledError, Exception):
                await self._task
            self._task = None


broker = Broker()
