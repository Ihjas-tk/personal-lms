"""`/api/curriculum`, `/api/plan`, `/api/plan/shift`, `/api/today`."""

from __future__ import annotations

import re
from datetime import date, timedelta
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from .. import store
from ..queue import by_module, check_rows, due_queue
from .common import plan_data, plan_payload, session_days, track

router = APIRouter(tags=["plan"])

TRACK_DAYS = 40 * 7
IF_THEN = re.compile(r"^IF\s+(?P<cue>.+?)\s*$\s*^THEN I will\s+(?P<action>.+?)\s*$", re.M)


class ShiftBody(BaseModel):
    weeks: int = Field(default=1, ge=-8, le=8)


@router.get("/curriculum")
def get_curriculum() -> dict[str, Any]:
    """The parsed track. Reference answers are stripped — no route reveals one before submit."""
    data = track().model_dump(mode="json")
    for module in data.get("modules", []):
        for check in module.get("checks", []):
            check.pop("reference", None)
    return data


@router.get("/plan")
def get_plan() -> dict[str, Any]:
    return plan_payload()


@router.post("/plan/shift")
def post_shift(body: ShiftBody) -> dict[str, Any]:
    """Move every soft date by `weeks`, effective the next Monday."""
    store.shift_plan(track(), body.weeks)
    return plan_payload()


def last_if_then() -> str | None:
    """The if-then plan written at the most recent session close, verbatim, as one line."""
    for session in reversed(store.iter_sessions()):
        if not session.closed:
            continue
        match = IF_THEN.search(session.body)
        if match:
            return f"IF {match.group('cue')} THEN I will {match.group('action')}"
    return None


def current_module_id(tr: Any) -> str | None:
    """Open session's module, else the last session's, else the first non-durable module."""
    sessions = store.iter_sessions()
    for session in reversed(sessions):
        if session.meta.get("module_id"):
            return str(session.meta["module_id"])
    return tr.modules[0].id if tr.modules else None


@router.get("/today")
def get_today() -> dict[str, Any]:
    """Default route payload: plan text, next action, due count, week hours, activity strip."""
    today = date.today()
    tr = track()
    plan = plan_data(tr)
    rows = check_rows(tr, today)
    due = due_queue(rows, today)
    module_id = current_module_id(tr)
    grouped = by_module(rows)

    return {
        "plan_text": last_if_then(),
        "next_action": next_action(tr, grouped, due, module_id),
        "current_module_id": module_id,
        "due_count": len(due),
        "week_hours": week_hours(plan, today),
        "activity": activity_strip(plan["start_date"]),
    }


def next_action(
    tr: Any, grouped: dict[str, list], due: list, module_id: str | None
) -> dict[str, Any]:
    """One precomputed line: earliest due re-test, else first unattempted check, else a resource."""
    if due:
        row = due[0]
        return {
            "kind": "retest",
            "module_id": row.check.module,
            "check_id": row.check.id,
            "resource_id": None,
            "label": f"Re-test: {row.check.prompt}",
        }
    if module_id:
        unattempted = [r for r in grouped.get(module_id, []) if r.schedule.state == "not_started"]
        if unattempted:
            row = unattempted[0]
            return {
                "kind": "check",
                "module_id": module_id,
                "check_id": row.check.id,
                "resource_id": None,
                "label": f"First attempt: {row.check.prompt}",
            }
        states = store.read_resources(module_id)
        module = tr.module(module_id)
        unread = [
            r
            for r in (module.resources if module else [])
            if (states.get(r.id) or {}).get("state", "queued") in ("queued", "skimmed")
        ]
        if unread:
            return {
                "kind": "resource",
                "module_id": module_id,
                "check_id": None,
                "resource_id": unread[0].id,
                "label": f"Read: {unread[0].title}",
            }
    return {
        "kind": "none",
        "module_id": module_id,
        "check_id": None,
        "resource_id": None,
        "label": "Nothing is queued. Pick a module and start where you like.",
    }


def week_hours(plan: dict[str, Any], today: date) -> dict[str, float]:
    """Hours logged this week per phase tag, plus the weekly budget. The client words it."""
    monday = today - timedelta(days=today.weekday())
    totals = {p: 0 for p in store.PHASES}
    for day, bucket in session_days().items():
        if monday <= day <= today:
            for phase in totals:
                totals[phase] += bucket.get(phase, 0)
    hours = {p: round(m / 60.0, 2) for p, m in totals.items()}
    return {**hours, "budget": float(plan["weekly_budget_hours"])}


def activity_strip(start: date) -> list[dict[str, Any]]:
    """One cell per day of the track, by hours-per-day intensity. No streak, no number."""
    days = session_days()
    out = []
    for offset in range(TRACK_DAYS):
        day = start + timedelta(days=offset)
        minutes = sum((days.get(day) or {}).values())
        out.append({"date": day.isoformat(), "hours": round(minutes / 60.0, 2)})
    return out
