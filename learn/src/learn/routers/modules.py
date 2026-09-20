"""`/api/modules/{id}`, its note (with `mtime_ns` concurrency) and its resource rows."""

from __future__ import annotations

from datetime import date
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .. import derive, ladder, store
from ..queue import by_module, check_rows
from .common import (
    capstone_rows,
    check_row,
    chore_rows,
    module_row,
    must_cover_states,
    note_index,
    plan_data,
    topic_rows,
    track,
)

router = APIRouter(prefix="/modules", tags=["modules"])


class NoteBody(BaseModel):
    frontmatter: dict[str, Any] = Field(default_factory=dict)
    body: str = ""
    mtime_ns: int = 0


class ResourcePatch(BaseModel):
    state: str | None = None
    minutes_delta: int | None = None
    path: str | None = None
    position: float | None = None
    done: bool | None = None


class ChorePatch(BaseModel):
    done: bool = True


def module_detail(module_id: str) -> dict[str, Any]:
    """The whole module page in one flat object: card, topics, sidebar, checks, capstone."""
    today = date.today()
    tr = track()
    module = tr.module(module_id)
    if module is None:
        raise HTTPException(404, f"unknown module {module_id}")
    plan = plan_data(tr)
    rows = check_rows(tr, today)
    grouped = by_module(rows)
    states = {
        m.id: ladder.module_state(must_cover_states(grouped.get(m.id, []))) for m in tr.modules
    }
    mine = grouped.get(module_id, [])
    topics, resources = topic_rows(module, mine, today)
    card = module_row(module, mine, store.module_minutes(), plan, states, today)
    return {
        **card,
        "area_id": module.area,
        "must_cover": module.must_cover,
        "resources": resources,
        "checks": [check_row(r, today) for r in mine],
        "capstone": capstone_rows(module_id),
        "topics": topics,
        "chores": chore_rows(module),
        "habits": [{"topic_id": t.id, "title": t.title} for t in module.topics_of("habit")],
        "all_notes": note_index(module_id),
        "step_summary": derive.step_summary([t["state"] for t in topics]),
        "overdue_retests": sum(1 for r in mine if r.overdue_days > 0),
    }


@router.get("/{module_id}")
def get_module(module_id: str) -> dict[str, Any]:
    """Module definition plus resource states, check states and hours."""
    return module_detail(module_id)


@router.get("/{module_id}/note")
def get_note(module_id: str) -> dict[str, Any]:
    module = track().module(module_id)
    if module is None:
        raise HTTPException(404, f"unknown module {module_id}")
    return store.read_note(module_id, module.title)


@router.put("/{module_id}/note")
def put_note(module_id: str, body: NoteBody) -> Any:
    """Write the note; 409 with the current content when `mtime_ns` is stale.

    `current` sits at the top level of the 409 body, beside `detail`, so the client can
    offer the on-disk version without unwrapping FastAPI's error envelope.
    """
    if track().module(module_id) is None:
        raise HTTPException(404, f"unknown module {module_id}")
    try:
        return store.write_note(module_id, body.frontmatter, body.body, body.mtime_ns)
    except store.StaleWriteError as exc:
        return JSONResponse(
            status_code=409,
            content={
                "detail": "The note changed on disk since it was loaded.",
                "error": "stale_mtime",
                "current": exc.current,
            },
        )


@router.get("/{module_id}/notes/{topic_id}")
def get_topic_note(module_id: str, topic_id: str) -> dict[str, Any]:
    """The note for one topic; an unwritten note reads as empty with `mtime_ns` 0."""
    topic = _topic(module_id, topic_id)
    return store.read_topic_note(module_id, topic_id, topic.title)


@router.put("/{module_id}/notes/{topic_id}")
def put_topic_note(module_id: str, topic_id: str, body: NoteBody) -> Any:
    """Write the topic note; 409 with the current content when `mtime_ns` is stale."""
    _topic(module_id, topic_id)
    try:
        return store.write_topic_note(
            module_id, topic_id, body.frontmatter, body.body, body.mtime_ns
        )
    except store.StaleWriteError as exc:
        return JSONResponse(
            status_code=409,
            content={
                "detail": "The note changed on disk since it was loaded.",
                "error": "stale_mtime",
                "current": exc.current,
            },
        )


@router.patch("/{module_id}/resources/{resource_id}")
def patch_resource(module_id: str, resource_id: str, body: ResourcePatch) -> dict[str, Any]:
    """Merge one resource's state, minutes, position or local path; return the module."""
    module = track().module(module_id)
    if module is None or not any(r.id == resource_id for r in module.resources):
        raise HTTPException(404, f"unknown resource {resource_id}")
    try:
        store.patch_resource(
            module_id,
            resource_id,
            body.state,
            body.minutes_delta,
            body.path,
            body.position,
            body.done,
        )
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    return module_detail(module_id)


class TopicStatePatch(BaseModel):
    state: str | None = None  # not_started | in_progress | proved; None = let the checks decide


@router.patch("/{module_id}/topics/{topic_id}")
def patch_topic_state(module_id: str, topic_id: str, body: TopicStatePatch) -> dict[str, Any]:
    """Set or clear the learner's own state for an idea topic; return the refreshed module."""
    topic = _topic(module_id, topic_id)
    if topic.kind != "idea":
        raise HTTPException(422, f"topic {topic_id} is a {topic.kind}; only ideas carry a state")
    try:
        store.patch_topic_state(module_id, topic_id, body.state)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    return module_detail(module_id)


@router.patch("/{module_id}/chores/{topic_id}")
def patch_chore(module_id: str, topic_id: str, body: ChorePatch) -> dict[str, Any]:
    """Tick or untick one set-up chore; return the refreshed module."""
    topic = _topic(module_id, topic_id)
    if topic.kind != "chore":
        raise HTTPException(422, f"topic {topic_id} is a {topic.kind}, not a chore")
    store.patch_chore(module_id, topic_id, body.done)
    return module_detail(module_id)


def _topic(module_id: str, topic_id: str) -> Any:
    """The topic, or 404 — notes and chores are addressed by topic id, never by path."""
    module = track().module(module_id)
    if module is None:
        raise HTTPException(404, f"unknown module {module_id}")
    topic = module.topic(topic_id)
    if topic is None:
        raise HTTPException(404, f"unknown topic {topic_id} in module {module_id}")
    return topic
