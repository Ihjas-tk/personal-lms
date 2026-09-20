"""Session lifecycle and the warm-up draw (spec §3)."""

from __future__ import annotations

from datetime import UTC, date, datetime
from typing import Any, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .. import git, ladder, store
from ..queue import check_rows, warmup_items
from .common import track
from .plan import current_module_id

router = APIRouter(prefix="/sessions", tags=["sessions"])

MIN_REFLECTION_WORDS = 40


class StartBody(BaseModel):
    module_id: str | None = None


class PatchBody(BaseModel):
    phase: Literal["new", "review", "build"] | None = None
    warmup_skipped: bool | None = None


class ErrorEntry(BaseModel):
    """`text` is the prompt the error is about; it defaults to the diagnosis when absent."""

    diagnosis: str
    text: str = ""
    category: str | None = None
    check_id: str | None = None


class CloseBody(BaseModel):
    reflection: str
    if_cue: str
    then_action: str
    fatigue: int = Field(ge=1, le=5)
    minutes: dict[str, int] | None = None
    errors: list[ErrorEntry] = Field(default_factory=list)


def _view(session: store.SessionFile | None) -> dict[str, Any] | None:
    """The session as the client holds it: stored meta plus the derived fields.

    `checks_attempted` and `errors_logged` are counted from the vault rather than
    tallied in the browser, so the wrap-up summary survives a reload mid-session.
    """
    if session is None:
        return None
    # Discarding a session frees its id for the next one the same day, so matching on
    # the id alone can inherit the discarded session's graded attempts. The start time
    # settles it: nothing that happened before this session opened belongs to it.
    started = _moment(session.meta.get("started"))
    mine = [
        a
        for a in store.iter_attempt_files()
        if a.meta.get("session_id") == session.id
        and _moment(a.meta.get("started")) >= started
    ]
    open_paths = [a.path for a in mine if not a.submitted]
    return {
        "path": session.path,
        **session.meta,
        "elapsed_seconds": _elapsed_seconds(session.meta),
        "open_attempt_path": open_paths[0] if open_paths else None,
        "checks_attempted": len(mine),
        "errors_logged": sum(
            1
            for e in store.read_errors()
            if e.get("session_id") == session.id and _moment(e.get("ts")) >= started
        ),
        "body": session.body,
    }


def _moment(value: Any) -> datetime:
    """An ISO timestamp as an aware datetime; anything unparseable reads as the epoch."""
    try:
        parsed = datetime.fromisoformat(str(value))
    except (TypeError, ValueError):
        return datetime.min.replace(tzinfo=UTC)
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=UTC)


def _elapsed_seconds(meta: dict[str, Any]) -> int:
    """Wall-clock seconds from start to close, or to now while the session is open."""
    try:
        started = datetime.fromisoformat(str(meta.get("started")))
    except (TypeError, ValueError):
        return 0
    closed = meta.get("closed")
    end = datetime.fromisoformat(str(closed)) if closed else store.now()
    return max(0, int((end - started).total_seconds()))


def _accrue(meta: dict[str, Any], moment: datetime) -> dict[str, Any]:
    """Move wall-clock time since the last phase switch into the current phase tag."""
    meta = dict(meta)
    minutes = {p: int((meta.get("minutes") or {}).get(p, 0)) for p in store.PHASES}
    started = meta.get("phase_started")
    if started:
        elapsed = (moment - datetime.fromisoformat(str(started))).total_seconds() / 60.0
        minutes[str(meta.get("phase", "new"))] += max(0, int(round(elapsed)))
    meta["minutes"] = minutes
    meta["phase_started"] = moment.isoformat()
    return meta


@router.get("/current")
def get_current() -> dict[str, Any] | None:
    """The one open session, or `null`."""
    return _view(store.current_session())


@router.post("/start")
def start_session(body: StartBody) -> dict[str, Any] | None:
    """Begin a session and start the timer on the `new` phase."""
    if store.current_session() is not None:
        raise HTTPException(409, "a session is already open")
    tr = track()
    module_id = body.module_id or current_module_id(tr)
    if module_id is None or tr.module(module_id) is None:
        raise HTTPException(404, f"unknown module {module_id}")
    moment = store.now()
    meta = {
        "id": store.new_session_id(),
        "module_id": module_id,
        "started": moment.isoformat(),
        "closed": None,
        "minutes": {p: 0 for p in store.PHASES},
        "fatigue": None,
        "warmup_skipped": False,
        "phase": "new",
        "phase_started": moment.isoformat(),
    }
    return _view(store.write_session(meta, ""))


@router.patch("/current")
def patch_current(body: PatchBody) -> dict[str, Any] | None:
    """Switch the phase tag (accruing elapsed minutes) or record a skipped warm-up."""
    session = store.current_session()
    if session is None:
        raise HTTPException(404, "no open session")
    meta = _accrue(session.meta, store.now())
    if body.phase is not None:
        meta["phase"] = body.phase
    if body.warmup_skipped is not None:
        meta["warmup_skipped"] = body.warmup_skipped
    return _view(store.write_session(meta, session.body))


@router.post("/close")
def close_session(body: CloseBody) -> dict[str, Any]:
    """Close with a reflection, an if-then plan and any errors; then snapshot the vault."""
    session = store.current_session()
    if session is None:
        raise HTTPException(404, "no open session")
    words = len(body.reflection.split())
    if words < MIN_REFLECTION_WORDS:
        raise HTTPException(422, f"reflection is {words} words, needs {MIN_REFLECTION_WORDS}")
    if not body.if_cue.strip() or not body.then_action.strip():
        raise HTTPException(422, "the if-then plan needs both a cue and an action")
    for entry in body.errors:
        if not entry.diagnosis.strip():
            raise HTTPException(422, "every logged error needs a diagnosis")

    moment = store.now()
    meta = _accrue(session.meta, moment)
    if body.minutes:
        meta["minutes"] = {p: int(body.minutes.get(p, meta["minutes"][p])) for p in store.PHASES}
    meta["closed"] = moment.isoformat()
    meta["fatigue"] = body.fatigue
    meta.pop("phase_started", None)
    text = (
        f"## Reflection\n{body.reflection.strip()}\n\n"
        f"## Next session\nIF {body.if_cue.strip()}\nTHEN I will {body.then_action.strip()}\n"
    )
    closed = store.write_session(meta, text)
    for entry in body.errors:
        if entry.category and entry.category not in ladder.ERROR_CATEGORIES:
            raise HTTPException(422, f"unknown error category {entry.category}")
        store.append_error(
            {
                "session_id": closed.id,
                "module_id": meta.get("module_id"),
                "check_id": entry.check_id,
                "text": entry.text or entry.diagnosis,
                "diagnosis": entry.diagnosis,
                "category": entry.category,
            }
        )
    snapshot = git.snapshot(f"session close {closed.id}")
    return {**(_view(closed) or {}), "snapshot": snapshot}


@router.post("/discard")
def discard_session() -> dict[str, Any]:
    """Abandon the open session and any attempts it opened."""
    session = store.current_session()
    if session is None:
        raise HTTPException(404, "no open session")
    store.discard_session(session.id)
    return {"ok": True, "discarded": session.id}


@router.get("/warmup")
def get_warmup() -> list[dict[str, Any]]:
    """5–8 warm-up items for the current session."""
    today = date.today()
    tr = track()
    sessions = [s for s in store.iter_sessions() if s.closed]
    last_module = str(sessions[-1].meta.get("module_id")) if sessions else None
    return warmup_items(tr, check_rows(tr, today), last_module, today)
