"""`/api/jots` — the unfiled lines captured in focus mode, and filing them into a note."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .. import store
from .common import track

router = APIRouter(tags=["jots"])


class JotBody(BaseModel):
    module_id: str
    topic_id: str | None = None
    resource_id: str | None = None
    stamp: str | None = None
    text: str


class FileBody(BaseModel):
    ids: list[str] = Field(default_factory=list)
    topic_id: str
    module_id: str | None = None


@router.get("/jots")
def get_jots(module_id: str | None = None, unfiled: bool | None = None) -> list[dict[str, Any]]:
    """The jot ledger, folded by id; `unfiled=true` is what the wrap-up modal shows."""
    return store.read_jots(module_id, unfiled)


@router.post("/jots")
def post_jot(body: JotBody) -> dict[str, Any]:
    """Append one jot. It stays unfiled until it lands in a topic note."""
    module = track().module(body.module_id)
    if module is None:
        raise HTTPException(404, f"unknown module {body.module_id}")
    if body.topic_id and module.topic(body.topic_id) is None:
        raise HTTPException(404, f"unknown topic {body.topic_id} in module {body.module_id}")
    if not body.text.strip():
        raise HTTPException(422, "a jot needs some text")
    return store.append_jot(body.model_dump())


@router.post("/jots/file")
def file_jots(body: FileBody) -> dict[str, Any]:
    """Append the named jots to a topic note under `## Jots` and mark them filed."""
    if not body.ids:
        raise HTTPException(422, "no jots to file")
    module_id = body.module_id or _module_of(body.ids)
    module = track().module(module_id or "")
    if module is None:
        raise HTTPException(404, f"unknown module {module_id}")
    topic = module.topic(body.topic_id)
    if topic is None:
        raise HTTPException(404, f"unknown topic {body.topic_id} in module {module.id}")
    try:
        return store.file_jots(module.id, topic.id, body.ids, topic.title)
    except store.NotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc


def _module_of(ids: list[str]) -> str | None:
    """Jots filed together must come from one module — the note lives in exactly one."""
    wanted = {j["module_id"] for j in store.read_jots() if j["id"] in set(ids)}
    if len(wanted) > 1:
        raise HTTPException(422, "those jots belong to different modules")
    return str(next(iter(wanted))) if wanted else None
