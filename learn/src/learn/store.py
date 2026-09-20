"""The only module that writes to `vault/`. Atomic writes, frontmatter files, JSONL ledgers."""

from __future__ import annotations

import json
import os
import re
import tempfile
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any

import frontmatter
import yaml

from .config import Config, get_config
from .curriculum import Track
from .ladder import Attempt

RESOURCE_STATES = ("queued", "skimmed", "read", "reconstructed", "taught")
CAPSTONE_STATES = ("not_started", "draft", "working", "reviewed", "done")
PHASES = ("new", "review", "build")
_SAFE_ID = re.compile(r"^[A-Za-z0-9._-]+$")


class StaleWriteError(Exception):
    """Raised when a `PUT` echoes an out-of-date `mtime_ns`."""

    def __init__(self, current: dict[str, Any]) -> None:
        super().__init__("mtime_ns mismatch")
        self.current = current


class NotFoundError(Exception):
    """Raised when a vault path or record does not exist."""


def cfg() -> Config:
    return get_config()


def now() -> datetime:
    """Timezone-aware local now."""
    return datetime.now().astimezone()


def _stamp(moment: datetime) -> str:
    """ISO 8601 basic form, safe as a filename component."""
    return moment.strftime("%Y%m%dT%H%M%S%z")


def write_atomic(path: Path, text: str) -> int:
    """Write via temp file + `os.replace`; return the new `mtime_ns`."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=".tmp-", suffix=path.suffix)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp, path)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise
    return path.stat().st_mtime_ns


def read_yaml(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def write_yaml(path: Path, data: dict[str, Any]) -> int:
    return write_atomic(path, yaml.safe_dump(data, sort_keys=True, allow_unicode=True))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    """Append-only ledger write (no rewrite, so atomicity is the O_APPEND of one short line)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False, default=str) + "\n")


def _safe(value: str) -> str:
    if not _SAFE_ID.match(value):
        raise NotFoundError(f"unsafe id: {value!r}")
    return value


def vault_relative(path: Path) -> str:
    return path.relative_to(cfg().vault).as_posix()


def resolve_in_vault(relative: str) -> Path:
    """Resolve a vault-relative path, refusing anything that escapes the vault."""
    vault = cfg().vault
    target = (vault / relative).resolve()
    if not target.is_relative_to(vault):
        raise NotFoundError(f"path outside vault: {relative}")
    return target


# ---------------------------------------------------------------- plan


def read_plan(track: Track) -> dict[str, Any]:
    """Read `plan.yaml`, seeding it from the track on first run."""
    data = read_yaml(cfg().plan_file)
    if not data:
        data = {
            "start_date": track.start_date,
            "offset_weeks": 0,
            "offset_from": None,
            "weekly_budget_hours": track.weekly_budget_hours,
        }
        cfg().ensure()
        write_yaml(cfg().plan_file, data)
    return data


def shift_plan(track: Track, weeks: int) -> dict[str, Any]:
    """Add `weeks` to the soft-date offset, effective the next Monday."""
    plan = dict(read_plan(track))
    today = date.today()
    monday = today.fromordinal(today.toordinal() + (7 - today.weekday()) % 7 or 7)
    plan["offset_weeks"] = int(plan.get("offset_weeks", 0)) + int(weeks)
    plan["offset_from"] = monday
    write_yaml(cfg().plan_file, plan)
    return plan


# ---------------------------------------------------------------- notes


def note_path(module_id: str) -> Path:
    return cfg().module_dir(_safe(module_id)) / "notes.md"


def notes_dir(module_id: str) -> Path:
    return cfg().module_dir(_safe(module_id)) / "notes"


def topic_note_path(module_id: str, topic_id: str) -> Path:
    return notes_dir(module_id) / f"{_safe(topic_id)}.md"


def note_label(module_id: str, topic_id: str | None) -> str:
    """How a note file is shown to the learner: `a1/attention.md`, `a1/notes.md`."""
    return f"{module_id}/{topic_id}.md" if topic_id else f"{module_id}/notes.md"


def read_note(module_id: str, title: str = "") -> dict[str, Any]:
    """Return `{frontmatter, body, mtime_ns}`; an absent note reads as empty."""
    path = note_path(module_id)
    if not path.exists():
        return {
            "frontmatter": {
                "title": title or module_id,
                "status": "new",
                "tags": [],
                "updated": None,
            },
            "body": "",
            "mtime_ns": 0,
        }
    post = frontmatter.loads(path.read_text(encoding="utf-8"))
    return {
        "frontmatter": dict(post.metadata),
        "body": post.content,
        "mtime_ns": path.stat().st_mtime_ns,
    }


def same_mtime(sent: int, current: int) -> bool:
    """Compare two `mtime_ns` values at the precision a JSON round-trip survives.

    An `mtime_ns` is around 1.8e18, well past JavaScript's 2^53 safe-integer range, so
    a browser client physically cannot echo the number back byte-exact — `JSON.parse`
    snaps it to the nearest double, a grid roughly 256 ns wide. Comparing as doubles is
    exactly the resolution the contract can carry, and no two real writes to one file
    land inside 256 ns, so a genuine concurrent edit is still caught.
    """
    return float(sent) == float(current)


def write_note(module_id: str, meta: dict[str, Any], body: str, mtime_ns: int) -> dict[str, Any]:
    """Optimistic-concurrency note write; raises `StaleWriteError` on an mtime mismatch."""
    path = note_path(module_id)
    current = path.stat().st_mtime_ns if path.exists() else 0
    if not same_mtime(mtime_ns, current):
        raise StaleWriteError(read_note(module_id))
    meta = dict(meta)
    meta["updated"] = now().isoformat()
    post = frontmatter.Post(body, **meta)
    new_mtime = write_atomic(path, frontmatter.dumps(post) + "\n")
    return {"frontmatter": meta, "body": body, "mtime_ns": new_mtime}


# ---------------------------------------------------------------- topic notes


def read_topic_note(module_id: str, topic_id: str, title: str = "") -> dict[str, Any]:
    """Return `{frontmatter, body, mtime_ns, path}`; an absent note reads as empty."""
    path = topic_note_path(module_id, topic_id)
    label = note_label(module_id, topic_id)
    if not path.exists():
        return {
            "frontmatter": {"topic": topic_id, "title": title or topic_id, "updated": None},
            "body": "",
            "mtime_ns": 0,
            "path": label,
        }
    post = frontmatter.loads(path.read_text(encoding="utf-8"))
    return {
        "frontmatter": dict(post.metadata),
        "body": post.content,
        "mtime_ns": path.stat().st_mtime_ns,
        "path": label,
    }


def write_topic_note(
    module_id: str, topic_id: str, meta: dict[str, Any], body: str, mtime_ns: int
) -> dict[str, Any]:
    """Optimistic-concurrency topic-note write, exactly like the module note."""
    path = topic_note_path(module_id, topic_id)
    current = path.stat().st_mtime_ns if path.exists() else 0
    if not same_mtime(mtime_ns, current):
        raise StaleWriteError(read_topic_note(module_id, topic_id))
    meta = dict(meta)
    meta["topic"] = topic_id
    meta.setdefault("title", topic_id)
    meta["updated"] = now().isoformat()
    post = frontmatter.Post(body, **meta)
    new_mtime = write_atomic(path, frontmatter.dumps(post) + "\n")
    return {
        "frontmatter": meta,
        "body": body,
        "mtime_ns": new_mtime,
        "path": note_label(module_id, topic_id),
    }


def note_rows(module_id: str) -> list[dict[str, Any]]:
    """Every note file of one module — the legacy module note first, then topic notes."""
    out: list[dict[str, Any]] = []
    for path, topic_id in _note_files(module_id):
        post = frontmatter.loads(path.read_text(encoding="utf-8"))
        stat = path.stat()
        out.append(
            {
                "path": note_label(module_id, topic_id),
                "module_id": module_id,
                "topic_id": topic_id,
                "updated": str(post.metadata.get("updated") or "")
                or datetime.fromtimestamp(stat.st_mtime).astimezone().isoformat(),
                "words": len(post.content.split()),
                "mtime_ns": stat.st_mtime_ns,
                "body": post.content,
            }
        )
    return out


def _note_files(module_id: str) -> list[tuple[Path, str | None]]:
    legacy = note_path(module_id)
    files: list[tuple[Path, str | None]] = [(legacy, None)] if legacy.exists() else []
    directory = notes_dir(module_id)
    if directory.is_dir():
        files += [(p, p.stem) for p in sorted(directory.glob("*.md"))]
    return files


# ---------------------------------------------------------------- chores


def read_chores(module_id: str) -> dict[str, Any]:
    return read_yaml(cfg().module_dir(_safe(module_id)) / "chores.yaml")


def patch_chore(module_id: str, topic_id: str, done: bool) -> dict[str, Any]:
    """Tick or untick one set-up chore; ticking stamps `done_at`."""
    data = read_chores(module_id)
    row = {"done": bool(done), "done_at": now().isoformat() if done else None}
    data[_safe(topic_id)] = row
    cfg().ensure()
    write_yaml(cfg().module_dir(module_id) / "chores.yaml", data)
    return row


TOPIC_STATES = ("not_started", "in_progress", "proved")


def read_topic_states(module_id: str) -> dict[str, Any]:
    """Learner-set topic states; absent means "let the checks decide"."""
    return read_yaml(cfg().module_dir(_safe(module_id)) / "topic_states.yaml")


def patch_topic_state(module_id: str, topic_id: str, state: str | None) -> dict[str, Any] | None:
    """Set a topic's state by hand, or clear it (None) so the derived state shows again."""
    if state is not None and state not in TOPIC_STATES:
        raise ValueError(f"unknown topic state {state}")
    data = read_topic_states(module_id)
    key = _safe(topic_id)
    if state is None:
        data.pop(key, None)
        row = None
    else:
        row = {"state": state, "set_at": now().isoformat()}
        data[key] = row
    cfg().ensure()
    write_yaml(cfg().module_dir(module_id) / "topic_states.yaml", data)
    return row


# ---------------------------------------------------------------- resources

RESOURCE_DEFAULT: dict[str, Any] = {
    "state": "queued",
    "minutes": 0,
    "path": None,
    "position": None,
    "position_updated": None,
    "done": False,
    "done_at": None,
}


def read_resources(module_id: str) -> dict[str, Any]:
    return read_yaml(cfg().module_dir(_safe(module_id)) / "resources.yaml")


def patch_resource(
    module_id: str,
    resource_id: str,
    state: str | None = None,
    minutes_delta: int | None = None,
    path: str | None = None,
    position: float | None = None,
    done: bool | None = None,
) -> dict[str, Any]:
    """Merge one resource row and persist `resources.yaml`.

    `done` is the learner's own call that this source is finished; it counts toward
    the module at whatever rung of the ladder it sits on (an article is done when read).
    """
    data = read_resources(module_id)
    row = {**RESOURCE_DEFAULT, **(data.get(resource_id) or {})}
    if state is not None:
        if state not in RESOURCE_STATES:
            raise ValueError(f"unknown resource state {state}")
        row["state"] = state
    if minutes_delta is not None:
        row["minutes"] = max(0, int(row.get("minutes", 0)) + int(minutes_delta))
    if path is not None:
        row["path"] = path or None
    if position is not None:
        if position < 0:
            raise ValueError("position cannot be negative")
        row["position"] = round(float(position), 2)
        row["position_updated"] = now().isoformat()
    if done is not None:
        row["done"] = bool(done)
        row["done_at"] = now().isoformat() if done else None
    data[resource_id] = row
    write_yaml(cfg().module_dir(module_id) / "resources.yaml", data)
    return row


# ---------------------------------------------------------------- attempts


ANSWER_HEADING = "## Answer"
_ANSWER_SECTION = re.compile(r"^##\s+Answer\s*$(.*?)(?=^##\s|\Z)", re.MULTILINE | re.DOTALL)


@dataclass(frozen=True)
class AttemptFile:
    """A parsed attempt file plus its vault-relative path."""

    path: str
    meta: dict[str, Any]
    body: str

    @property
    def submitted(self) -> bool:
        """Frozen: the answer is final. Grading may still be outstanding."""
        return bool(self.meta.get("submitted"))

    @property
    def graded(self) -> bool:
        """The self-grade has been recorded; the attempt counts on the ladder."""
        return self.meta.get("score") in ("cant", "partial", "fluent")

    @property
    def answer(self) -> str:
        return answer_of(self.body)


def answer_of(body: str) -> str:
    """The `## Answer` section of an attempt file, or the whole body if it has no heading."""
    match = _ANSWER_SECTION.search(body)
    return (match.group(1) if match else body).strip()


def _attempt_body(answer: str, diagnosis: str | None = None) -> str:
    body = f"{ANSWER_HEADING}\n{answer.strip()}\n"
    if diagnosis:
        body += f"\n## Diagnosis\n{diagnosis.strip()}\n"
    return body


def attempts_dir(module_id: str) -> Path:
    return cfg().module_dir(_safe(module_id)) / "attempts"


def iter_attempt_files() -> list[AttemptFile]:
    """Every attempt file in the vault, oldest first."""
    out: list[AttemptFile] = []
    for path in sorted(cfg().modules_dir.glob("*/attempts/*.md")):
        post = frontmatter.loads(path.read_text(encoding="utf-8"))
        out.append(AttemptFile(vault_relative(path), dict(post.metadata), post.content))
    return sorted(out, key=lambda a: str(a.meta.get("started", "")))


def read_attempt(relative: str) -> AttemptFile:
    path = resolve_in_vault(relative)
    if not path.exists():
        raise NotFoundError(relative)
    post = frontmatter.loads(path.read_text(encoding="utf-8"))
    return AttemptFile(vault_relative(path), dict(post.metadata), post.content)


def graded_attempts(files: list[AttemptFile] | None = None) -> dict[str, list[Attempt]]:
    """Submitted attempts grouped by check id, in date order (input to `ladder`)."""
    grouped: dict[str, list[Attempt]] = {}
    for item in files if files is not None else iter_attempt_files():
        if not item.submitted or item.meta.get("score") not in ("cant", "partial", "fluent"):
            continue
        moment = datetime.fromisoformat(str(item.meta["submitted"]))
        grouped.setdefault(str(item.meta["check_id"]), []).append(
            Attempt(
                check_id=str(item.meta["check_id"]),
                session_id=str(item.meta.get("session_id", "")),
                on=moment.date(),
                score=item.meta["score"],
                confidence_pre=int(item.meta.get("confidence_pre", 0)),
                warmup=bool(item.meta.get("warmup", False)),
                ai_critique_used=bool(item.meta.get("ai_critique_used", False)),
            )
        )
    for values in grouped.values():
        values.sort(key=lambda a: a.on)
    return grouped


def start_attempt(check_id: str, module_id: str, session_id: str, confidence_pre: int) -> str:
    """Create an open attempt file and return its vault-relative path."""
    started = now()
    path = attempts_dir(module_id) / f"{_safe(check_id)}--{_stamp(started)}.md"
    meta = {
        "check_id": check_id,
        "session_id": session_id,
        "started": started.isoformat(),
        "submitted": None,
        "confidence_pre": int(confidence_pre),
        "score": None,
        "rubric": [],
        "category": None,
        "ai_critique_used": False,
        "warmup": False,
    }
    write_atomic(path, frontmatter.dumps(frontmatter.Post("## Answer\n\n", **meta)) + "\n")
    return vault_relative(path)


def freeze_attempt(relative: str, answer: str) -> AttemptFile:
    """Stage 2 → 3: the answer is final, stamped `submitted`, but not yet graded.

    Freezing is what lifts the reveal gate — the reference is handed back by the
    route that calls this — and what re-opens the AI actions the open attempt locked.
    """
    item = read_attempt(relative)
    if item.submitted:
        raise ValueError("attempt already frozen")
    meta = dict(item.meta)
    meta["submitted"] = now().isoformat()
    text = frontmatter.dumps(frontmatter.Post(_attempt_body(answer), **meta)) + "\n"
    write_atomic(resolve_in_vault(relative), text)
    return read_attempt(relative)


def submit_attempt(
    relative: str,
    answer: str | None,
    rubric: list[str],
    score: str,
    category: str | None,
    diagnosis: str | None,
    warmup: bool = False,
) -> AttemptFile:
    """Record the self-grade. Freezes the answer too when it arrives in the same call.

    `answer` is `None` for an attempt already frozen by `freeze_attempt`; the frozen
    text is kept verbatim so the grade can never rewrite what was written from memory.
    """
    item = read_attempt(relative)
    if item.graded:
        raise ValueError("attempt already submitted")
    meta = dict(item.meta)
    meta.update(
        {
            "submitted": meta.get("submitted") or now().isoformat(),
            "score": score,
            "rubric": list(rubric),
            "category": category,
            "warmup": warmup or bool(meta.get("warmup")),
        }
    )
    body = _attempt_body(item.answer if answer is None else answer, diagnosis)
    text = frontmatter.dumps(frontmatter.Post(body, **meta)) + "\n"
    write_atomic(resolve_in_vault(relative), text)
    return read_attempt(relative)


def set_ai_critique_used(relative: str, used: bool = True) -> AttemptFile:
    """Record on the attempt that the explain-back critique was run against it (§7.2)."""
    item = read_attempt(relative)
    meta = dict(item.meta)
    meta["ai_critique_used"] = bool(used)
    text = frontmatter.dumps(frontmatter.Post(item.body, **meta)) + "\n"
    write_atomic(resolve_in_vault(relative), text)
    return read_attempt(relative)


def open_attempts(session_id: str | None = None) -> list[AttemptFile]:
    """Attempts started but not submitted (the AI 423 gate)."""
    return [
        a
        for a in iter_attempt_files()
        if not a.submitted and (session_id is None or a.meta.get("session_id") == session_id)
    ]


# ---------------------------------------------------------------- sessions


@dataclass(frozen=True)
class SessionFile:
    """A parsed session file plus its vault-relative path."""

    path: str
    meta: dict[str, Any]
    body: str

    @property
    def id(self) -> str:
        return str(self.meta.get("id", ""))

    @property
    def closed(self) -> bool:
        return bool(self.meta.get("closed"))


def iter_sessions() -> list[SessionFile]:
    """Every session file, oldest first."""
    out: list[SessionFile] = []
    for path in sorted(cfg().sessions_dir.glob("*.md")):
        post = frontmatter.loads(path.read_text(encoding="utf-8"))
        out.append(SessionFile(vault_relative(path), dict(post.metadata), post.content))
    return sorted(out, key=lambda s: str(s.meta.get("started", "")))


def current_session() -> SessionFile | None:
    """The one open (unclosed) session, if any."""
    return next((s for s in reversed(iter_sessions()) if not s.closed), None)


def _session_path(session_id: str) -> Path:
    return cfg().sessions_dir / f"{_safe(session_id)}.md"


def new_session_id() -> str:
    """`<YYYY-MM-DD>-<n>`, counting up within the day."""
    today = date.today().isoformat()
    taken = {s.id for s in iter_sessions()}
    n = 1
    while f"{today}-{n}" in taken:
        n += 1
    return f"{today}-{n}"


def write_session(meta: dict[str, Any], body: str) -> SessionFile:
    """Create or replace a session file."""
    path = _session_path(str(meta["id"]))
    write_atomic(path, frontmatter.dumps(frontmatter.Post(body, **meta)) + "\n")
    return SessionFile(vault_relative(path), dict(meta), body)


def discard_session(session_id: str) -> None:
    """Delete an abandoned session and any attempts it opened."""
    for attempt in open_attempts(session_id):
        resolve_in_vault(attempt.path).unlink(missing_ok=True)
    _session_path(session_id).unlink(missing_ok=True)


def module_minutes() -> dict[str, dict[str, int]]:
    """Logged minutes per module per phase tag, from closed and open sessions."""
    totals: dict[str, dict[str, int]] = {}
    for session in iter_sessions():
        module_id = str(session.meta.get("module_id") or "")
        if not module_id:
            continue
        bucket = totals.setdefault(module_id, {p: 0 for p in PHASES})
        for phase, minutes in (session.meta.get("minutes") or {}).items():
            if phase in bucket:
                bucket[phase] += int(minutes or 0)
    return totals


# ---------------------------------------------------------------- errors


def read_errors() -> list[dict[str, Any]]:
    """Fold the append-only ledger by id, last write winning."""
    folded: dict[str, dict[str, Any]] = {}
    for row in read_jsonl(cfg().errors_file):
        key = str(row.get("id"))
        folded[key] = {**folded.get(key, {}), **row}
    return list(folded.values())


def append_error(row: dict[str, Any]) -> dict[str, Any]:
    """Append a new ledger entry, minting an id."""
    moment = now()
    entry = {
        "id": f"err-{_stamp(moment)}-{len(read_jsonl(cfg().errors_file)) + 1}",
        "ts": moment.isoformat(),
        "resolved": False,
        "resolution": None,
        "converted_check_id": None,
        **row,
    }
    append_jsonl(cfg().errors_file, entry)
    return entry


def patch_error(error_id: str, patch: dict[str, Any]) -> dict[str, Any]:
    """Resolve or amend an entry by appending the delta."""
    existing = next((e for e in read_errors() if e["id"] == error_id), None)
    if existing is None:
        raise NotFoundError(error_id)
    delta = {"id": error_id, "ts": now().isoformat(), **patch}
    append_jsonl(cfg().errors_file, delta)
    return {**existing, **delta}


# ---------------------------------------------------------------- jots

JOTS_HEADING = "## Jots"


def read_jots(module_id: str | None = None, unfiled: bool | None = None) -> list[dict[str, Any]]:
    """Fold the append-only jot ledger by id, last write winning (like the error ledger)."""
    folded: dict[str, dict[str, Any]] = {}
    for row in read_jsonl(cfg().jots_file):
        key = str(row.get("id"))
        folded[key] = {**folded.get(key, {}), **row}
    rows = list(folded.values())
    if module_id is not None:
        rows = [r for r in rows if r.get("module_id") == module_id]
    if unfiled is True:
        rows = [r for r in rows if not r.get("filed")]
    elif unfiled is False:
        rows = [r for r in rows if r.get("filed")]
    return rows


def append_jot(row: dict[str, Any]) -> dict[str, Any]:
    """Append one jot, minting an id. `filed` is false until it lands in a note."""
    moment = now()
    entry = {
        "id": f"jot-{_stamp(moment)}-{len(read_jsonl(cfg().jots_file)) + 1}",
        "ts": moment.isoformat(),
        "module_id": None,
        "topic_id": None,
        "resource_id": None,
        "stamp": None,
        "filed": False,
        **row,
    }
    cfg().ensure()
    append_jsonl(cfg().jots_file, entry)
    return entry


def jot_line(jot: dict[str, Any]) -> str:
    """One filed jot as a note line: `- [42:10] text`, or `- text` with no stamp."""
    text = str(jot.get("text") or "").strip()
    stamp = str(jot.get("stamp") or "").strip()
    return f"- [{stamp}] {text}" if stamp else f"- {text}"


def merge_jot_lines(body: str, lines: list[str]) -> str:
    """Append lines under a `## Jots` heading, creating the section if it is absent."""
    if not lines:
        return body
    rows = body.splitlines()
    if JOTS_HEADING in rows:
        start = rows.index(JOTS_HEADING) + 1
        end = next(
            (i for i in range(start, len(rows)) if rows[i].startswith("## ")),
            len(rows),
        )
        while end > start and not rows[end - 1].strip():
            end -= 1
        rows = [*rows[:start], *rows[start:end], *lines, *rows[end:]]
    else:
        tail = [] if not rows or not rows[-1].strip() else [""]
        rows = [*rows, *tail, JOTS_HEADING, *lines]
    return "\n".join(rows).rstrip("\n") + "\n"


def file_jots(module_id: str, topic_id: str, ids: list[str], title: str = "") -> dict[str, Any]:
    """Append the named jots to a topic note and mark each one filed. Returns the note."""
    wanted = [j for j in read_jots(module_id) if j["id"] in set(ids) and not j.get("filed")]
    if not wanted:
        raise NotFoundError("no unfiled jots with those ids")
    wanted.sort(key=lambda j: str(j.get("ts", "")))
    note = read_topic_note(module_id, topic_id, title)
    body = merge_jot_lines(note["body"], [jot_line(j) for j in wanted])
    written = write_topic_note(module_id, topic_id, note["frontmatter"], body, note["mtime_ns"])
    stamped = now().isoformat()
    for jot in wanted:
        append_jsonl(
            cfg().jots_file,
            {"id": jot["id"], "filed": stamped, "topic_id": topic_id},
        )
    return written


# ---------------------------------------------------------------- ai log


def read_ai_log() -> list[dict[str, Any]]:
    return read_jsonl(cfg().ai_log_file)


def append_ai_log(row: dict[str, Any]) -> dict[str, Any]:
    """Append one AI call to `ai-log.jsonl` (spec §7). Timestamped here, not by the caller."""
    entry = {"ts": now().isoformat(), **row}
    cfg().ensure()
    append_jsonl(cfg().ai_log_file, entry)
    return entry


# ---------------------------------------------------------------- capstone


def read_capstone() -> dict[str, Any]:
    return read_yaml(cfg().capstone_file)


def patch_capstone(item_id: str, patch: dict[str, Any]) -> dict[str, Any]:
    """Merge one capstone artefact's state."""
    data = read_capstone()
    blank = {"state": "not_started", "notes": "", "path": None, "next_action": ""}
    row = dict(data.get(item_id) or blank)
    if "state" in patch and patch["state"] not in CAPSTONE_STATES:
        raise ValueError(f"unknown capstone state {patch['state']}")
    row.update({k: v for k, v in patch.items() if v is not None})
    data[item_id] = row
    cfg().ensure()
    write_yaml(cfg().capstone_file, data)
    return row
