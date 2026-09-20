"""Shared assembly helpers for the routers. Read-only; all writes go through `store`."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from .. import derive, ladder, store
from ..curriculum import Module, Resource, Track, load_track
from ..queue import CheckRow, by_module, check_rows

MUST_COVER_ONLY = True
EXCERPT_CHARS = 600


def track() -> Track:
    return load_track()


def plan_data(tr: Track) -> dict[str, Any]:
    """`plan.yaml` with the date fields normalised."""
    plan = dict(store.read_plan(tr))
    plan["start_date"] = _as_date(plan.get("start_date"), tr.start_date)
    offset_from = plan.get("offset_from")
    plan["offset_from"] = _as_date(offset_from, None) if offset_from else None
    plan["offset_weeks"] = int(plan.get("offset_weeks", 0))
    plan["weekly_budget_hours"] = float(plan.get("weekly_budget_hours", tr.weekly_budget_hours))
    return plan


def _as_date(value: Any, fallback: date | None) -> date | None:
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        return date.fromisoformat(value[:10])
    return fallback


def soft_date(module: Module, plan: dict[str, Any]) -> date:
    """End of the module's week window, plus any schedule shift."""
    start: date = plan["start_date"]
    return start + timedelta(weeks=module.weeks[1] + plan["offset_weeks"])


def expected_hours_by_now(module: Module, plan: dict[str, Any], today: date) -> float:
    """The module's budget, prorated over how much of its week window has gone by."""
    first = module.weeks[0] + plan["offset_weeks"]
    last = module.weeks[1] + plan["offset_weeks"]
    span = max(1, last - first + 1)
    week = derive.track_week(today, plan["start_date"])
    elapsed = min(span, max(0, week - first + 1))
    return round(module.budget_hours * elapsed / span, 2)


def must_cover_states(rows: list[CheckRow]) -> list[ladder.CheckState]:
    return [r.schedule.state for r in rows if r.check.must_cover]


def module_row(
    module: Module,
    rows: list[CheckRow],
    minutes: dict[str, dict[str, int]],
    plan: dict[str, Any],
    states: dict[str, ladder.CheckState],
    today: date,
) -> dict[str, Any]:
    """The module card shown on Plan and at the top of the module page."""
    mine = must_cover_states(rows)
    state = ladder.module_state(mine)
    phase_minutes = minutes.get(module.id, {p: 0 for p in store.PHASES})
    actual_hours = round(sum(phase_minutes.values()) / 60.0, 2)
    blocked = any(
        ladder.STATE_ORDER.index(states.get(p, "not_started"))
        < ladder.STATE_ORDER.index("familiar")
        for p in module.prerequisites
    )
    at_risk = any(ladder.is_at_risk(r.schedule.state, r.schedule.next_due, today) for r in rows)
    due = soft_date(module, plan)
    expected = expected_hours_by_now(module, plan, today)
    behind = (today > due and actual_hours < module.budget_hours) or (
        expected > 0 and actual_hours < expected
    )
    return {
        "id": module.id,
        "title": module.title,
        "phase": module.phase,
        "track": module.track,
        "weeks": module.weeks,
        "budget_hours": module.budget_hours,
        "actual_hours": actual_hours,
        "minutes": phase_minutes,
        "over_budget": actual_hours > module.budget_hours > 0,
        "expected_hours_by_now": expected,
        "behind": behind,
        "soft_date": due.isoformat(),
        "offset_weeks": plan["offset_weeks"],
        "state": state,
        "coverage": round(ladder.coverage(mine), 4),
        "must_cover_total": len(mine),
        "checks_total": len(module.checks),
        "prerequisites": module.prerequisites,
        "not_started": state == "not_started",
        "at_risk": at_risk,
        "blocked": blocked,
    }


def plan_payload(today: date | None = None) -> dict[str, Any]:
    """The whole `/api/plan` body: phases, module cards, headline coverage."""
    day = today or date.today()
    tr = track()
    plan = plan_data(tr)
    rows = check_rows(tr, day)
    grouped = by_module(rows)
    minutes = store.module_minutes()
    module_states = {
        m.id: ladder.module_state(must_cover_states(grouped.get(m.id, []))) for m in tr.modules
    }
    cards = {
        m.id: module_row(m, grouped.get(m.id, []), minutes, plan, module_states, day)
        for m in tr.modules
    }
    all_states = [r.schedule.state for r in rows if r.check.must_cover]
    return {
        "start_date": plan["start_date"].isoformat(),
        "offset_weeks": plan["offset_weeks"],
        "offset_from": plan["offset_from"].isoformat() if plan["offset_from"] else None,
        "weekly_budget_hours": plan["weekly_budget_hours"],
        "coverage": round(ladder.coverage(all_states), 4),
        "attempted_pct": round(
            ladder.share(all_states, ("attempted", "familiar", "proficient", "durable")), 4
        ),
        "durable_pct": round(ladder.share(all_states, ("durable",)), 4),
        "must_cover_total": len(all_states),
        "phases": [
            {
                "id": p.id,
                "title": p.title,
                "weeks": p.weeks,
                "modules": [cards[m.id] for m in tr.modules_of(p.id)],
            }
            for p in tr.phases
        ],
    }


def session_days() -> dict[date, dict[str, int]]:
    """Minutes per calendar day, split by phase tag. The hours readouts all start here."""
    days: dict[date, dict[str, int]] = {}
    for session in store.iter_sessions():
        started = str(session.meta.get("started") or "")[:10]
        try:
            day = date.fromisoformat(started)
        except ValueError:
            continue
        bucket = days.setdefault(day, dict.fromkeys(store.PHASES, 0))
        for phase, minutes in (session.meta.get("minutes") or {}).items():
            if phase in bucket:
                bucket[phase] += int(minutes or 0)
    return days


# ---------------------------------------------------------------- module workspace


def source_row(resource: Resource, saved: dict[str, Any]) -> dict[str, Any]:
    """One reading with its stored position: `video · 95 of 116 min` and what to do next."""
    row = {**resource.model_dump(), **store.RESOURCE_DEFAULT, **saved}
    length = resource.span
    unit = resource.unit
    position = row.get("position")
    state = str(row.get("state") or "queued")
    marked = bool(row.get("done"))
    done = marked or state in derive.DONE_RESOURCE_STATES
    if done:
        pct = 1.0
    elif position and length:
        pct = min(1.0, round(float(position) / float(length), 4))
    else:
        pct = 0.0
    if position:
        meta = f"{resource.kind} · {_plain(position)} of {length} {unit}"
    elif state == "queued":
        meta = f"{resource.kind} · not opened"
    else:
        meta = f"{resource.kind} · {length} {unit}"
    if done:
        action = "Notes"
    elif position or state != "queued":
        action = "Resume"
    elif row.get("path"):
        action = "Open"
    else:
        action = "Start"
    return {
        **row,
        "length": length,
        "unit": unit,
        "pct": pct,
        "meta": meta,
        "action": action,
        "counts": done,
        "done": marked,
        "done_at": row.get("done_at"),
    }


def _plain(value: Any) -> str:
    """`95` not `95.0` and not `95.03`.

    Minutes accrue a second at a time while focus mode is open, so a stored position
    is usually fractional. Every unit the schema has — minutes, pages, items — is
    counted in whole numbers when it is read aloud, so the meta line rounds.
    """
    return str(int(round(float(value))))


def check_row(row: CheckRow, today: date) -> dict[str, Any]:
    """A check as the workspace shows it: public row plus its warning and its button."""
    warning = None
    if row.overdue_days:
        warning = f"{row.overdue_days} {'day' if row.overdue_days == 1 else 'days'} overdue"
    elif row.schedule.overconfident_miss:
        warning = "missed while sure"
    return {
        **row.public(today),
        "warning": warning,
        "action": "Attempt" if row.schedule.state == "not_started" else "Re-test",
    }


def note_summary(note: dict[str, Any] | None, module_id: str, topic_id: str) -> dict[str, Any]:
    """`{exists, path, excerpt, updated}` for a topic, whether or not the file is there."""
    if note is None:
        return {
            "exists": False,
            "path": store.note_label(module_id, topic_id),
            "excerpt": "",
            "updated": None,
        }
    return {
        "exists": True,
        "path": note["path"],
        "excerpt": note["body"][:EXCERPT_CHARS],
        "updated": note["updated"] or None,
    }


def topic_rows(
    module: Module, rows: list[CheckRow], today: date
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """The syllabus: idea topics with their sources, note and proof, plus the flat resources."""
    saved = store.read_resources(module.id)
    resources = [source_row(r, saved.get(r.id) or {}) for r in module.resources]
    by_resource = {r["id"]: r for r in resources}
    by_check = {r.check.id: r for r in rows}
    notes = {n["topic_id"]: n for n in store.note_rows(module.id)}
    chosen = store.read_topic_states(module.id)
    topics = []
    for number, topic in enumerate(module.topics_of("idea"), start=1):
        sources = [by_resource[rid] for rid in topic.resources if rid in by_resource]
        checks = [check_row(by_check[cid], today) for cid in topic.checks if cid in by_check]
        note = note_summary(notes.get(topic.id), module.id, topic.id)
        states = [c["state"] for c in checks]
        solid = derive.count_at_least(states, "proficient")
        # A source the learner marked done is finished whatever rung it sits on.
        finished = ["taught" if s["done"] else s["state"] for s in sources]
        derived = derive.topic_state(states, finished, note["exists"])
        # The learner's own call wins over the derived state; the derived one stays visible.
        mine = chosen.get(topic.id) or {}
        state = mine.get("state") or derived
        topics.append(
            {
                "id": topic.id,
                "title": topic.title,
                "summary": topic.summary,
                "kind": topic.kind,
                "n": number,
                "state": state,
                "derived_state": derived,
                "state_set_by_you": bool(mine),
                "state_set_at": mine.get("set_at"),
                "sources": sources,
                "note": note,
                "checks": checks,
                "proof_text": derive.proof_text(solid, len(states), "solid"),
            }
        )
    return topics, resources


def ai_context(module_id: str, topic_id: str) -> dict[str, Any] | None:
    """What a note is *about*, for the AI actions: its module, its topic, its sources.

    `None` when either id is unknown, so the router can answer 404. Sources come out
    in curriculum order, titles and urls exactly as the track file wrote them.
    """
    module = track().module(module_id)
    if module is None:
        return None
    topic = module.topic(topic_id)
    if topic is None:
        return None
    sources = [module.resource(rid) for rid in topic.resources]
    return {
        "module_title": module.title,
        "topic_title": topic.title,
        "sources": [
            {"title": r.title, "kind": r.kind, "url": r.url or ""} for r in sources if r
        ],
    }


def chore_rows(module: Module) -> list[dict[str, Any]]:
    saved = store.read_chores(module.id)
    return [
        {
            "topic_id": topic.id,
            "title": topic.title,
            "done": bool((saved.get(topic.id) or {}).get("done")),
            "done_at": (saved.get(topic.id) or {}).get("done_at"),
        }
        for topic in module.topics_of("chore")
    ]


def note_index(module_id: str) -> list[dict[str, Any]]:
    """Every note file of the module, for the workspace's "All notes" list."""
    return [
        {
            "path": note["path"],
            "topic_id": note["topic_id"],
            "updated": note["updated"],
            "words": note["words"],
        }
        for note in store.note_rows(module_id)
    ]


CAPSTONE_DEFAULT = {"state": "not_started", "notes": "", "path": None, "next_action": ""}


def capstone_rows(module_id: str | None = None) -> list[dict[str, Any]]:
    """Capstone artefacts merged with their stored state (defaults filled).

    Used by both `/capstone` and `/modules/{id}` so every consumer sees the same
    shape; a missing `state` here once blanked the whole module page.
    """
    saved = store.read_capstone()
    return [
        {**item.model_dump(), **CAPSTONE_DEFAULT, **(saved.get(item.id) or {})}
        for item in track().capstone
        if module_id is None or module_id in item.modules
    ]
