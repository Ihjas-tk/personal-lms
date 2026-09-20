"""`/api/review/*`, the error ledger and the capstone board."""

from __future__ import annotations

from datetime import date
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .. import derive, ladder, store
from ..queue import check_rows, cold_sweep, due_queue
from .common import capstone_rows, plan_data, session_days, track
from .plan import week_hours

router = APIRouter(tags=["review"])

SKIPS_PER_QUARTER = 2
WEEKS_PER_QUARTER = 13
TRACK_WEEKS = 40


class ErrorBody(BaseModel):
    diagnosis: str
    text: str = ""
    category: str | None = None
    check_id: str | None = None
    module_id: str | None = None


class ErrorPatch(BaseModel):
    id: str
    resolution: str | None = None
    resolved: bool | None = None
    converted_check_id: str | None = None


class CapstonePatch(BaseModel):
    id: str
    state: str | None = None
    notes: str | None = None
    path: str | None = None
    next_action: str | None = None


@router.get("/review/due")
def get_due() -> list[dict[str, Any]]:
    """The re-test queue, most overdue first, overconfident misses breaking ties."""
    today = date.today()
    return [r.public(today) for r in due_queue(check_rows(track(), today), today)]


@router.get("/review/weekly")
def get_weekly() -> dict[str, Any]:
    """Calibration, error triage, hours, burn-up, capstone and weeks-on-plan."""
    today = date.today()
    tr = track()
    plan = plan_data(tr)
    rows = check_rows(tr, today)
    pairs = [
        (int(a.meta.get("confidence_pre") or 0), a.meta["score"])
        for a in store.iter_attempt_files()
        if a.submitted and a.meta.get("score") in ("cant", "partial", "fluent")
    ]
    brier = ladder.brier_score(pairs)
    weeks_elapsed = max(0, (today - plan["start_date"]).days // 7)
    quarters = weeks_elapsed // WEEKS_PER_QUARTER + 1
    used = max(0, plan["offset_weeks"])
    return {
        "calibration": {
            "brier": round(brier, 4) if brier is not None else 0.0,
            "n": len(pairs),
            "buckets": _buckets(pairs),
            "sentence": _calibration_sentence(brier, pairs),
        },
        "retrieval_sweep": cold_sweep(rows, tr, today),
        "errors": [e for e in store.read_errors() if not e.get("resolved")],
        "hours": _hours(tr, plan, today),
        "hours_last_4_weeks": derive.hours_by_week(
            session_days(), plan["start_date"], derive.week_now(today, plan["start_date"])
        ),
        "burn_up": _burn_up(tr, plan),
        "capstone": get_capstone(),
        "shipped": [
            {"id": c["id"], "title": c["title"], "state": c["state"]} for c in capstone_rows()
        ],
        "weeks_on_plan": weeks_elapsed,
        "banked_skips": max(0, SKIPS_PER_QUARTER * quarters - used),
        "replan": _replan(tr, plan, weeks_elapsed),
    }


def _buckets(pairs: list[tuple[int, str]]) -> list[dict[str, Any]]:
    """Reliability table with the empty buckets zeroed, so the client can render every row.

    `said` and `was` are the debrief's words for the same two numbers as
    `mean_confidence` and `observed`; both pairs stay so older clients keep working.
    """
    return [
        {
            "bucket": b["bucket"],
            "n": b["n"],
            "mean_confidence": b["mean_confidence"] or 0,
            "observed": b["accuracy"] or 0.0,
            "said": b["mean_confidence"] or 0,
            "was": b["accuracy"] or 0.0,
        }
        for b in ladder.reliability_table(pairs)
    ]


def _replan(tr: Any, plan: dict[str, Any], weeks_elapsed: int) -> list[dict[str, Any]]:
    """Modules whose week window covers next week — the scope the replan block edits."""
    week = weeks_elapsed + 2
    offset = plan["offset_weeks"]
    return [
        {"module_id": m.id, "title": m.title, "weeks": m.weeks}
        for m in tr.modules
        if m.weeks[0] + offset <= week <= m.weeks[1] + offset
    ]


def _calibration_sentence(brier: float | None, pairs: list[tuple[int, str]]) -> str:
    if brier is None or not pairs:
        return "No graded attempts yet."
    mean_confidence = sum(c for c, _ in pairs) / len(pairs)
    hit_rate = sum(1 for _, s in pairs if s == "fluent") / len(pairs) * 100
    gap = mean_confidence - hit_rate
    direction = "overconfident" if gap > 5 else "underconfident" if gap < -5 else "well calibrated"
    return (
        f"Brier {brier:.2f} over {len(pairs)} attempts; "
        f"you are {direction} by {abs(gap):.0f} points."
    )


def _hours(tr: Any, plan: dict[str, Any], today: date) -> dict[str, Any]:
    """This week's stacked bar, plus budget vs actual for every module."""
    minutes = store.module_minutes()
    return {
        "week_hours": week_hours(plan, today),
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "budget_hours": m.budget_hours,
                "actual_hours": round(sum((minutes.get(m.id) or {}).values()) / 60.0, 2),
            }
            for m in tr.modules
        ],
    }


def _durable_week(module: Any, plan: dict[str, Any]) -> int | None:
    """The week index at which this module's must-cover checks first all reached durable."""
    must = [c.id for c in module.checks if c.must_cover]
    if not must:
        return None
    grouped = store.graded_attempts()
    dates = sorted({a.on for cid in must for a in grouped.get(cid, [])})
    for day in dates:
        states = [
            ladder.schedule([a for a in grouped.get(cid, []) if a.on <= day]).state for cid in must
        ]
        if ladder.module_state(states) == "durable":
            return max(0, (day - plan["start_date"]).days // 7 + 1)
    return None


def _burn_up(tr: Any, plan: dict[str, Any]) -> list[dict[str, Any]]:
    """Modules durable vs planned, cumulative by track week."""
    reached = {m.id: _durable_week(m, plan) for m in tr.modules}
    out = []
    for week in range(1, TRACK_WEEKS + 1):
        planned = sum(1 for m in tr.modules if m.weeks[1] + plan["offset_weeks"] <= week)
        actual = sum(1 for w in reached.values() if w is not None and w <= week)
        out.append({"week": week, "planned": planned, "durable": actual})
    return out


@router.get("/errors")
def get_errors(unresolved: bool = False) -> list[dict[str, Any]]:
    """Read the folded ledger; `unresolved=true` filters to open entries."""
    rows = store.read_errors()
    if unresolved:
        rows = [r for r in rows if not r.get("resolved")]
    return rows


@router.post("/errors")
def post_error(body: ErrorBody) -> dict[str, Any]:
    """Append an entry. A diagnosis is mandatory."""
    if not body.diagnosis.strip():
        raise HTTPException(422, "an error entry needs a diagnosis")
    if body.category and body.category not in ladder.ERROR_CATEGORIES:
        raise HTTPException(422, f"unknown error category {body.category}")
    row = body.model_dump()
    row["text"] = row["text"] or row["diagnosis"]
    return store.append_error(row)


@router.patch("/errors")
def patch_error(body: ErrorPatch) -> dict[str, Any]:
    """Resolve an entry with text, or record the check it was converted into."""
    patch = body.model_dump(exclude={"id"}, exclude_none=True)
    if body.resolution and body.resolved is None:
        patch["resolved"] = True
    try:
        return store.patch_error(body.id, patch)
    except store.NotFoundError as exc:
        raise HTTPException(404, str(exc)) from exc


@router.get("/capstone")
def get_capstone() -> list[dict[str, Any]]:
    """The curriculum's capstone artefacts with their stored state. Not counted in coverage."""
    return capstone_rows()


@router.patch("/capstone")
def patch_capstone(body: CapstonePatch) -> list[dict[str, Any]]:
    """Update one artefact's state, notes, path or next action; return the whole board."""
    if not any(c.id == body.id for c in track().capstone):
        raise HTTPException(404, f"unknown capstone item {body.id}")
    try:
        store.patch_capstone(body.id, body.model_dump(exclude={"id"}, exclude_none=True))
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    return get_capstone()
