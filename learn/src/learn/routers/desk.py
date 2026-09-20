"""`GET /api/desk` and `GET /api/track` — the two overview screens (plan §3).

Thin: every number comes from `derive`, every file read from `store`. `/today` and
`/plan` still answer for older clients; these two are what the redesign reads.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from fastapi import APIRouter

from .. import derive, store
from ..curriculum import Module, Track
from ..queue import CheckRow, by_module, check_rows, warmup_items
from .common import capstone_rows, must_cover_states, plan_data, session_days, soft_date, track
from .plan import last_if_then, week_hours
from .review import SKIPS_PER_QUARTER, WEEKS_PER_QUARTER

router = APIRouter(tags=["overview"])

WARMUP_LIMIT = 4
EXISTS_STATES = ("working", "reviewed", "done")
PLAN_WRITTEN_ON = "Sunday"


@router.get("/desk")
def get_desk() -> dict[str, Any]:
    """Everything the Desk shows, in the order it shows it (plan §3)."""
    today = date.today()
    tr = track()
    plan = plan_data(tr)
    start: date = plan["start_date"]
    now = derive.week_now(today, start)
    rows = check_rows(tr, today)
    attempts = store.graded_attempts()
    core = [r for r in rows if r.check.must_cover]
    core_ids = [r.check.id for r in core]
    core_states = [r.schedule.state for r in core]
    closed = [s for s in store.iter_sessions() if s.closed]
    hours = week_hours(plan, today)
    logged = round(sum(v for k, v in hours.items() if k != "budget"), 2)
    days = session_days()
    return {
        "first_run": not closed,
        "week_now": now,
        "weeks_total": derive.WEEKS_TOTAL,
        "plan": _plan_line(),
        "start_label": derive.start_label(plan["weekly_budget_hours"]),
        "first_action": _first_action(tr, rows) if not closed else None,
        "warmup": _warmup(tr, rows, closed, today),
        "standing": _standing(tr, plan, core_states, now, today),
        "ridge": _ridge(tr, rows, attempts, today),
        "gains": {
            "lasting_delta_4w": derive.delta_4w(attempts, core_ids, today, "durable"),
            "solid_delta_4w": derive.delta_4w(attempts, core_ids, today, "proficient"),
            "checks_attempted_4w": derive.attempts_in_window(attempts, today),
            "hours_4w": derive.hours_in_window(days, today),
        },
        "calibration_by_week": derive.brier_by_week(_graded(), start),
        "newly_proved": _newly_proved(tr, attempts),
        "hours": hours,
        "slipping": derive.slipping_sentence(logged, hours["budget"]),
    }


def _plan_line() -> dict[str, Any] | None:
    text = last_if_then()
    return {"text": text, "written_on": PLAN_WRITTEN_ON} if text else None


def _first_action(tr: Track, rows: list[CheckRow]) -> dict[str, Any] | None:
    """First-run only: the one check to open, from the first module of the first phase."""
    order = [m.id for p in tr.phases for m in tr.modules_of(p.id)]
    ranked = sorted(
        (r for r in rows if r.check.must_cover and r.schedule.state == "not_started"),
        key=lambda r: order.index(r.check.module) if r.check.module in order else len(order),
    )
    if not ranked:
        return None
    first = ranked[0]
    return {
        "label": first.check.prompt,
        "module_id": first.check.module,
        "check_id": first.check.id,
    }


def _warmup(
    tr: Track, rows: list[CheckRow], closed: list[Any], today: date
) -> list[dict[str, Any]]:
    """The first ten minutes: at most four items, each openable as a normal attempt."""
    last_module = str(closed[-1].meta.get("module_id")) if closed else None
    picked = warmup_items(tr, rows, last_module, today)[:WARMUP_LIMIT]
    return [
        {
            "check_id": item["check_id"],
            "module_id": item["module_id"],
            "prompt": item["prompt"],
            "reason": derive.WARMUP_REASONS.get(item["reason"], item["reason"]),
            "chip": derive.WARMUP_CHIPS.get(item["reason"], "new"),
        }
        for item in picked
    ]


def _standing(
    tr: Track, plan: dict[str, Any], core_states: list[str], now: int, today: date
) -> dict[str, Any]:
    """The three headline numbers: checks that are yours, artefacts, weeks left."""
    board = capstone_rows()
    draft = next((c for c in board if c["state"] == "draft"), None)
    weeks_elapsed = max(0, (today - plan["start_date"]).days // 7)
    quarters = weeks_elapsed // WEEKS_PER_QUARTER + 1
    return {
        "checks_lasting": sum(1 for s in core_states if s == "durable"),
        "core_total": len(core_states),
        "artefacts_exist": sum(1 for c in board if c["state"] in EXISTS_STATES),
        "artefacts_total": len(board),
        "artefact_note": f"the {draft['title'].lower()} is in draft" if draft else None,
        "weeks_left": derive.weeks_left(now),
        "weekly_budget": plan["weekly_budget_hours"],
        "skips_banked": max(0, SKIPS_PER_QUARTER * quarters - max(0, plan["offset_weeks"])),
    }


def _ridge(
    tr: Track, rows: list[CheckRow], attempts: dict[str, list[Any]], today: date
) -> list[dict[str, Any]]:
    """One column per area, counted over core checks only."""
    grouped = by_module(rows)
    out = []
    for area in tr.areas:
        mine = [
            row
            for module in tr.modules_in_area(area.id)
            for row in grouped.get(module.id, [])
            if row.check.must_cover
        ]
        ids = [r.check.id for r in mine]
        out.append(
            {
                "area_id": area.id,
                "title": area.title,
                "scope": area.scope,
                "counts": derive.ridge_counts([r.schedule.state for r in mine]),
                "delta_4w": derive.delta_4w(attempts, ids, today, "proficient"),
            }
        )
    return out


def _graded() -> list[tuple[date, int, str]]:
    """(day, confidence, score) for every submitted, graded attempt."""
    return [
        (
            date.fromisoformat(str(a.meta["submitted"])[:10]),
            int(a.meta.get("confidence_pre") or 0),
            str(a.meta["score"]),
        )
        for a in store.iter_attempt_files()
        if a.submitted and a.meta.get("score") in ("cant", "partial", "fluent")
    ]


def _newly_proved(tr: Track, attempts: dict[str, list[Any]]) -> list[dict[str, Any]]:
    out = []
    for row in derive.newly_proved(attempts):
        check = tr.check(row["check_id"])
        if check is None:
            continue
        out.append({**row, "module_id": check.module, "prompt": check.prompt})
    return out


# ---------------------------------------------------------------- the track


@router.get("/track")
def get_track() -> dict[str, Any]:
    """Forty weeks in three bands: what was left behind, what is now, what comes after."""
    today = date.today()
    tr = track()
    plan = plan_data(tr)
    start: date = plan["start_date"]
    offset = plan["offset_weeks"]
    now = derive.week_now(today, start)
    rows = check_rows(tr, today)
    grouped = by_module(rows)
    minutes = store.module_minutes()
    core_states = [r.schedule.state for r in rows if r.check.must_cover]
    phase_weeks = [(p.id, p.weeks[0] + offset, p.weeks[1] + offset) for p in tr.phases]
    phase = _current_phase(tr, offset, now)

    unfinished = [
        m
        for m in tr.modules
        if m.weeks[1] + offset < now
        and not _all_solid(must_cover_states(grouped.get(m.id, [])))
        and (phase is None or m.phase != phase.id)
    ]
    in_phase = tr.modules_of(phase.id) if phase else []
    seen = {m.id for m in [*unfinished, *in_phase]}
    later = [m for m in tr.modules if m.id not in seen]
    lasting = derive.count_of(core_states, "durable")
    attempted = derive.count_at_least(core_states, "attempted")
    total = len(core_states)

    def row(module: Module, tone: str | None = None, band: str = "") -> dict[str, Any]:
        return _track_row(module, grouped, minutes, plan, tr, today, now, tone, band)

    return {
        "start_date": start.isoformat(),
        "end_date": (start + timedelta(weeks=derive.WEEKS_TOTAL + offset)).isoformat(),
        "week_now": now,
        "weeks_total": derive.WEEKS_TOTAL,
        "headline": {
            "lasting_pct": round(lasting / total, 4) if total else 0.0,
            "attempted_pct": round(attempted / total, 4) if total else 0.0,
            "core_total": total,
            "lasting_total": lasting,
        },
        "offset_weeks": offset,
        "offset_from": plan["offset_from"].isoformat() if plan["offset_from"] else None,
        "weeks": derive.week_cells(now, phase_weeks),
        "unfinished": [row(m, "late") for m in unfinished],
        "this_phase": {
            "phase_id": phase.id if phase else None,
            "title": phase.title if phase else "",
            "weeks": [phase.weeks[0] + offset, phase.weeks[1] + offset] if phase else [],
            "hours_budget": round(sum(m.budget_hours for m in in_phase), 2),
            "order_note": phase.order_note if phase else None,
            "rows": [row(m) for m in in_phase],
        },
        "later": [row(m, band="later") for m in later],
    }


def _all_solid(states: list[str]) -> bool:
    return bool(states) and all(s in ("proficient", "durable") for s in states)


def _current_phase(tr: Track, offset: int, now: int) -> Any:
    """The phase week `now` falls in; the last one started, else the first."""
    for phase in tr.phases:
        if phase.weeks[0] + offset <= now <= phase.weeks[1] + offset:
            return phase
    started = [p for p in tr.phases if p.weeks[0] + offset <= now]
    if started:
        return started[-1]
    return tr.phases[0] if tr.phases else None


def _track_row(
    module: Module,
    grouped: dict[str, list[CheckRow]],
    minutes: dict[str, dict[str, int]],
    plan: dict[str, Any],
    tr: Track,
    today: date,
    now: int,
    tone: str | None,
    band: str,
) -> dict[str, Any]:
    """One `Row`: week window, hours, proof squares, the warning and the button."""
    rows = grouped.get(module.id, [])
    states = must_cover_states(rows)
    offset = plan["offset_weeks"]
    first, last = module.weeks[0] + offset, module.weeks[1] + offset
    if tone is None:
        if last < now and not _all_solid(states):
            tone = "late"
        elif first <= now <= last:
            tone = "now"
        else:
            tone = "later"
    logged = round(sum((minutes.get(module.id) or {}).values()) / 60.0, 2)
    proof = derive.proof_counts(states)
    draft = next(
        (c for c in capstone_rows(module.id) if c["state"] == "draft"),
        None,
    )
    return {
        "module_id": module.id,
        "title": module.title,
        "track": module.track,
        "weeks": [first, last],
        "due": soft_date(module, plan).isoformat(),
        "tone": tone,
        "hours_logged": logged,
        "hours_budget": module.budget_hours,
        "proof": proof,
        "proof_text": derive.proof_text(proof["lasting"], proof["total"], "lasting"),
        "warning": _warning(module, rows, grouped, tr),
        "action": _action(band, logged, rows),
        "artefact_state": "draft" if draft else None,
    }


def _warning(
    module: Module, rows: list[CheckRow], grouped: dict[str, list[CheckRow]], tr: Track
) -> str | None:
    """Overdue re-tests first; otherwise the prerequisite module with nothing solid in it."""
    overdue = [r for r in rows if r.overdue_days > 0]
    if overdue:
        return derive.overdue_warning(len(overdue), max(r.overdue_days for r in overdue))
    for prereq in module.prerequisites:
        states = must_cover_states(grouped.get(prereq, []))
        if not any(s in ("proficient", "durable") for s in states):
            found = tr.module(prereq)
            return derive.prerequisite_warning(found.title if found else prereq)
    return None


def _action(band: str, logged: float, rows: list[CheckRow]) -> str:
    if band == "later":
        return "Preview"
    started = logged > 0 or any(r.schedule.attempt_count for r in rows)
    return "Resume" if started else "Open"
