"""The two AI actions as SSE routes (spec §7).

Neither route writes a note. Tidy streams a shadow buffer to the client and stops;
the learner accepts the diff in the MergeView, which issues the normal snapshot +
`PUT`. Critique only stamps `ai_critique_used` on the attempt it graded. Every call,
including a refused or rejected one, lands in `vault/ai-log.jsonl`.
"""

from __future__ import annotations

import json
import re
from collections.abc import AsyncIterator
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .. import ai, invariants, store
from .common import track

router = APIRouter(prefix="/ai", tags=["ai"])

SSE_HEADERS = {"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
_ANSWER = re.compile(r"^##\s*Answer\s*$(.*?)(?=^##\s|\Z)", re.MULTILINE | re.DOTALL)


class TidyBody(BaseModel):
    module_id: str
    text: str


class CritiqueBody(BaseModel):
    attempt_path: str


def _frame(event: str, payload: Any) -> str:
    """One SSE frame. `json.dumps` never emits a raw newline, so one `data:` line is enough."""
    return f"event: {event}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"


def _reject_while_attempt_open() -> None:
    """423 while an attempt is open in the current session (spec §7.3).

    Scoped to the current session, as the spec words it: an attempt abandoned in a
    session that has since been closed is stale, and must not lock the AI out forever.
    """
    session = store.current_session()
    if session is not None and store.open_attempts(session.id):
        raise HTTPException(423, "an attempt is open; AI actions are unavailable until you submit")


def _answer_of(body: str) -> str:
    """The `## Answer` section of an attempt file, or the whole body if it has no heading."""
    match = _ANSWER.search(body)
    return (match.group(1) if match else body).strip()


@router.post("/tidy")
async def tidy(body: TidyBody) -> StreamingResponse:
    """Copy-edit a note under the hard invariants of §7.1. The file is never touched."""
    _reject_while_attempt_open()

    async def generate() -> AsyncIterator[str]:
        try:
            async for kind, payload in ai.tidy(body.text):
                if kind == "delta":
                    yield _frame("delta", {"text": payload})
                    continue
                result = invariants.check(body.text, payload["text"])
                stats = {
                    "tokens_added": result.tokens_added,
                    "input_tokens": payload["input_tokens"],
                    "output_tokens": payload["output_tokens"],
                }
                yield _frame("stats", stats)
                if result.ok:
                    yield _frame("done", {"text": payload["text"], "stats": stats})
                else:
                    yield _frame("rejected", {"reason": result.reason})
                ai.append_log(
                    mode="tidy",
                    target=body.module_id,
                    input_tokens=payload["input_tokens"],
                    output_tokens=payload["output_tokens"],
                    tokens_added=result.tokens_added,
                    accepted=result.ok,
                )
        except ai.AIUnavailable as exc:
            ai.append_log(mode="tidy", target=body.module_id, accepted=False)
            yield _frame("error", {"message": str(exc)})

    return StreamingResponse(generate(), media_type="text/event-stream", headers=SSE_HEADERS)


@router.post("/critique")
async def critique(body: CritiqueBody) -> StreamingResponse:
    """Explain-back critique of a submitted attempt (§7.2). One `done` frame, or `error`."""
    _reject_while_attempt_open()
    try:
        attempt = store.read_attempt(body.attempt_path)
    except store.NotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    if not attempt.submitted:
        raise HTTPException(409, "the attempt has not been submitted yet")

    check_id = str(attempt.meta.get("check_id") or "")
    check = track().check(check_id)
    if check is None:
        raise HTTPException(404, f"unknown check {check_id}")

    async def generate() -> AsyncIterator[str]:
        try:
            result = await ai.critique(
                check.prompt, list(check.rubric), check.reference, _answer_of(attempt.body)
            )
        except ai.AIUnavailable as exc:
            ai.append_log(mode="critique", target=attempt.path, accepted=False)
            yield _frame("error", {"message": str(exc)})
            return
        store.set_ai_critique_used(attempt.path)
        ai.append_log(
            mode="critique",
            target=attempt.path,
            input_tokens=result["input_tokens"],
            output_tokens=result["output_tokens"],
            accepted=True,
        )
        yield _frame("done", {"lines": result["lines"]})

    return StreamingResponse(generate(), media_type="text/event-stream", headers=SSE_HEADERS)
