"""Checks and the staged attempt flow (spec §4.2, redesign §5).

The reveal gate is the freeze: `POST /attempts/freeze` and `POST /attempts/submit` are
the only two responses in the app that carry a reference answer, and no `GET` ever does.
"""

from __future__ import annotations

from datetime import date
from typing import Any, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from .. import ladder, store
from ..queue import check_rows
from .common import track

router = APIRouter(tags=["checks"])

RubricMark = Literal["met", "partial", "missing"]


class StartBody(BaseModel):
    """`session_id` is null when the learner re-tests outside a session (§2.4's queue)."""

    session_id: str | None = None
    confidence_pre: int = Field(ge=0, le=100)
    warmup: bool = False


class FreezeBody(BaseModel):
    """Stage 2 → 3. The answer is final here; nothing is graded yet."""

    attempt_path: str
    answer: str


class SubmitBody(BaseModel):
    """The grade. `answer` is optional: present only in the old combined form."""

    attempt_path: str
    answer: str | None = None
    rubric: list[RubricMark] = Field(default_factory=list)
    score: Literal["cant", "partial", "fluent"]
    category: str | None = None
    diagnosis: str | None = None


def _row(check_id: str, today: date):
    tr = track()
    check = tr.check(check_id)
    if check is None:
        raise HTTPException(404, f"unknown check {check_id}")
    row = next(r for r in check_rows(tr, today) if r.check.id == check_id)
    return check, row


@router.get("/checks/{check_id}")
def get_check(check_id: str) -> dict[str, Any]:
    """Prompt, type, rubric, derived state and attempt history. The reference is omitted."""
    today = date.today()
    check, row = _row(check_id, today)
    attempts = [
        {
            "path": a.path,
            "check_id": check_id,
            "session_id": a.meta.get("session_id"),
            "started": a.meta.get("started"),
            "submitted": a.meta.get("submitted"),
            "confidence_pre": a.meta.get("confidence_pre"),
            "score": a.meta.get("score"),
            "rubric": list(a.meta.get("rubric") or []),
            "category": a.meta.get("category"),
            "warmup": bool(a.meta.get("warmup")),
            "ai_critique_used": bool(a.meta.get("ai_critique_used")),
        }
        for a in store.iter_attempt_files()
        if a.meta.get("check_id") == check_id
    ]
    return {**row.public(today), "attempts": attempts}


@router.post("/checks/{check_id}/attempts")
def start_attempt(check_id: str, body: StartBody) -> dict[str, Any]:
    """Open an attempt. The response deliberately carries no reference answer."""
    today = date.today()
    check, row = _row(check_id, today)
    session = store.current_session()
    if body.session_id is not None and (session is None or session.id != body.session_id):
        raise HTTPException(409, "no open session with that id")
    session_id = body.session_id or (session.id if session else "")
    path = store.start_attempt(check_id, check.module, session_id, body.confidence_pre)
    return {
        "attempt_path": path,
        "check_id": check_id,
        "started": store.read_attempt(path).meta["started"],
        "session_id": session_id or None,
        "confidence_pre": body.confidence_pre,
        "check": row.public(today),
    }


@router.post("/attempts/freeze")
def freeze_attempt(body: FreezeBody) -> dict[str, Any]:
    """Stage 2 → 3: store the answer, stamp it frozen, and only now reveal the reference."""
    today = date.today()
    try:
        existing = store.read_attempt(body.attempt_path)
    except store.NotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    if existing.submitted:
        raise HTTPException(409, "attempt already frozen")
    check, _ = _row(str(existing.meta.get("check_id")), today)
    item = store.freeze_attempt(body.attempt_path, body.answer)
    return {
        "attempt_path": item.path,
        "reference": check.reference,
        "draft_reference": check.draft,
        "rubric": list(check.rubric),
        "frozen": item.meta["submitted"],
    }


@router.post("/attempts/submit")
def submit_attempt(body: SubmitBody) -> dict[str, Any]:
    """Record the self-grade and the error ledger; freeze first when the answer came along.

    Two shapes are accepted: a frozen attempt plus a grade (the staged flow), and the
    old combined form that carries the answer and the grade in one call.
    """
    today = date.today()
    try:
        existing = store.read_attempt(body.attempt_path)
    except store.NotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc
    if existing.graded:
        raise HTTPException(409, "attempt already submitted")
    if body.answer is None and not existing.submitted:
        raise HTTPException(422, "the attempt is not frozen; send the answer or freeze it first")
    check_id = str(existing.meta.get("check_id"))
    check, _ = _row(check_id, today)
    if body.score != "fluent" and not (body.diagnosis and body.category):
        raise HTTPException(422, "a diagnosis and an error category are required below fluent")
    if body.category and body.category not in ladder.ERROR_CATEGORIES:
        raise HTTPException(422, f"unknown error category {body.category}")

    item = store.submit_attempt(
        body.attempt_path,
        body.answer,
        list(body.rubric),
        body.score,
        body.category,
        body.diagnosis,
        warmup=bool(existing.meta.get("warmup")),
    )
    if body.score != "fluent":
        store.append_error(
            {
                "check_id": check_id,
                "module_id": check.module,
                "session_id": existing.meta.get("session_id"),
                "attempt_path": item.path,
                "text": check.prompt,
                "diagnosis": body.diagnosis,
                "category": body.category,
            }
        )
    _, row = _row(check_id, today)
    sched = row.schedule
    return {
        "attempt_path": item.path,
        "reference": check.reference,
        "draft_reference": check.draft,
        "score": body.score,
        "state": sched.state,
        "durable": sched.durable,
        "overconfident_miss": ladder.is_overconfident_miss(
            int(existing.meta.get("confidence_pre") or 0), body.score
        ),
        "next_due": sched.next_due.isoformat() if sched.next_due else None,
    }
