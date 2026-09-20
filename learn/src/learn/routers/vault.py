"""`POST /api/vault/snapshot` and the `GET /api/events` SSE change stream."""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator
from typing import Any

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .. import git, index

router = APIRouter(tags=["vault"])

HEARTBEAT_SECONDS = 15.0


class SnapshotBody(BaseModel):
    message: str = "snapshot"


@router.post("/vault/snapshot")
def post_snapshot(body: SnapshotBody) -> dict[str, Any]:
    """Commit the vault (or fall back to `.cache/backups`)."""
    return git.snapshot(body.message)


async def _stream() -> AsyncIterator[str]:
    """Yield until the client disconnects, which closes this generator."""
    queue = index.broker.subscribe()
    try:
        yield "event: open\ndata: {}\n\n"
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=HEARTBEAT_SECONDS)
            except TimeoutError:
                yield ": heartbeat\n\n"
                continue
            yield f"event: {event.get('event', 'changed')}\ndata: {json.dumps(event)}\n\n"
    finally:
        index.broker.unsubscribe(queue)


@router.get("/events")
async def get_events() -> StreamingResponse:
    """Server-sent `changed` events, pushed by the watchfiles watcher."""
    return StreamingResponse(
        _stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
