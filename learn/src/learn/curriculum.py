"""Load and validate `curriculum/track.yaml` (spec §5.3, redesign plan §1).

Schema v2 adds `areas` (the Desk ridge columns), per-module `topics` (the module
workspace syllabus), resource `length`/`unit` and phase `order_note`. A v1 file still
loads: each `must_cover` line becomes an `idea` topic and everything unassigned falls
into an implicit final topic `other`.
"""

from __future__ import annotations

import logging
import re
from datetime import date
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, Field, model_validator

from .config import get_config

ResourceKind = Literal["paper", "video", "course", "repo", "doc", "book"]
ResourceUnit = Literal["min", "pages", "items"]
CheckType = Literal["explain", "code", "derive", "judge", "numeric"]
TrackName = Literal["llm", "evals", "shared"]
TopicKind = Literal["idea", "chore", "habit"]

OTHER_TOPIC_ID = "other"
OTHER_TOPIC_TITLE = "Also in this module"
_SLUG = re.compile(r"[^a-z0-9]+")

log = logging.getLogger(__name__)
_warned: set[str] = set()


class Area(BaseModel):
    """One Desk ridge column: a capability the track builds."""

    id: str
    title: str
    scope: str = ""


class Resource(BaseModel):
    id: str
    title: str
    kind: ResourceKind
    url: str | None = None
    est_minutes: int = 0
    length: int | None = None
    unit: ResourceUnit = "min"

    @property
    def span(self) -> int:
        """How long the resource is, in `unit`; `est_minutes` when `length` is absent."""
        return int(self.length if self.length is not None else self.est_minutes)


class Check(BaseModel):
    id: str
    module: str
    type: CheckType
    must_cover: bool = True
    prompt: str
    rubric: list[str] = Field(default_factory=list)
    reference: str = ""
    known_prior: bool = False
    est_minutes: int = 0
    draft: bool = False

    def public(self) -> dict:
        """The check without its reference answer — the only shape routers may return."""
        return self.model_dump(exclude={"reference"})


class Topic(BaseModel):
    """One line of the module syllabus: an idea to prove, a chore to tick, a habit to keep."""

    id: str
    title: str
    summary: str = ""
    kind: TopicKind = "idea"
    resources: list[str] = Field(default_factory=list)
    checks: list[str] = Field(default_factory=list)
    derived: bool = False  # built by the v1 tolerance path or the implicit `other` topic


class Module(BaseModel):
    id: str
    phase: str
    area: str = ""
    track: TrackName = "shared"
    title: str
    weeks: list[int]
    budget_hours: float = 0
    prerequisites: list[str] = Field(default_factory=list)
    must_cover: list[str] = Field(default_factory=list)
    topics: list[Topic] = Field(default_factory=list)
    resources: list[Resource] = Field(default_factory=list)
    checks: list[Check] = Field(default_factory=list)

    @model_validator(mode="after")
    def _check_ownership(self) -> Module:
        if len(self.weeks) != 2:
            raise ValueError(f"module {self.id}: weeks must be [start, end]")
        for check in self.checks:
            if check.module != self.id:
                raise ValueError(
                    f"check {check.id} claims module {check.module}, found in {self.id}"
                )
        self.topics = _fit_topics(self)
        return self

    def topic(self, topic_id: str) -> Topic | None:
        return next((t for t in self.topics if t.id == topic_id), None)

    def topics_of(self, kind: TopicKind) -> list[Topic]:
        return [t for t in self.topics if t.kind == kind]

    def topic_of_check(self, check_id: str) -> str | None:
        """The authored topic a check belongs to; `None` for the implicit `other` bucket.

        A v1 file has no authored topics, so every check answers `None` — the workspace
        opens on no topic in particular rather than on a topic that was never written.
        """
        for topic in self.topics:
            if check_id in topic.checks:
                return None if topic.derived else topic.id
        return None

    def resource(self, resource_id: str) -> Resource | None:
        return next((r for r in self.resources if r.id == resource_id), None)


def _slug(text: str, fallback: int) -> str:
    """A filename-safe topic id from a `must_cover` sentence."""
    out = _SLUG.sub("-", text.lower()).strip("-")[:48].strip("-")
    return out or f"topic-{fallback + 1}"


def _fit_topics(module: Module) -> list[Topic]:
    """Validate authored topics, or build them from `must_cover`; file the leftovers.

    Authored (v2) topics own the module's resources and checks: each id may appear in
    at most one topic. Anything left over — and in a v1 file that is everything — goes
    into the implicit `other` topic so no resource or check is unreachable.
    """
    resource_ids = [r.id for r in module.resources]
    check_ids = [c.id for c in module.checks]
    seen_resource: dict[str, str] = {}
    seen_check: dict[str, str] = {}

    if module.topics:
        topics = list(module.topics)
        _unique([t.id for t in topics], f"topic in module {module.id}")
        for topic in topics:
            _claim(module.id, topic, topic.resources, resource_ids, seen_resource, "resource")
            _claim(module.id, topic, topic.checks, check_ids, seen_check, "check")
            if topic.kind == "idea" and not topic.resources and not topic.checks:
                raise ValueError(
                    f"module {module.id}: idea topic {topic.id} needs a resource or a check"
                )
    else:
        topics = [
            Topic(id=_slug(text, i), title=text, kind="idea", derived=True)
            for i, text in enumerate(module.must_cover)
        ]
        _unique([t.id for t in topics], f"topic in module {module.id}")

    left_resources = [r for r in resource_ids if r not in seen_resource]
    left_checks = [c for c in check_ids if c not in seen_check]
    if left_resources or left_checks:
        other = next((t for t in topics if t.id == OTHER_TOPIC_ID), None)
        if other is None:
            other = Topic(id=OTHER_TOPIC_ID, title=OTHER_TOPIC_TITLE, kind="idea", derived=True)
            topics.append(other)
        other.resources = [*other.resources, *left_resources]
        other.checks = [*other.checks, *left_checks]
        if module.id not in _warned:
            _warned.add(module.id)
            log.warning(
                "module %s: %d resource(s) and %d check(s) are in no topic; filed under %r",
                module.id,
                len(left_resources),
                len(left_checks),
                OTHER_TOPIC_ID,
            )
    return topics


def _claim(
    module_id: str,
    topic: Topic,
    ids: list[str],
    known: list[str],
    seen: dict[str, str],
    label: str,
) -> None:
    """Bind one topic's resource or check ids, refusing unknown ids and double ownership."""
    for item in ids:
        if item not in known:
            raise ValueError(f"module {module_id}: topic {topic.id} lists unknown {label} {item}")
        if item in seen:
            raise ValueError(
                f"module {module_id}: {label} {item} is in topics {seen[item]} and {topic.id}"
            )
        seen[item] = topic.id


class Phase(BaseModel):
    id: str
    title: str
    weeks: list[int]
    modules: list[str] = Field(default_factory=list)
    order_note: str | None = None


class CapstoneItem(BaseModel):
    id: str
    title: str
    modules: list[str] = Field(default_factory=list)
    description: str = ""


class Track(BaseModel):
    version: int = 1
    start_date: date
    weekly_budget_hours: float = 12
    areas: list[Area] = Field(default_factory=list)
    phases: list[Phase] = Field(default_factory=list)
    modules: list[Module] = Field(default_factory=list)
    capstone: list[CapstoneItem] = Field(default_factory=list)

    @model_validator(mode="after")
    def _cross_references(self) -> Track:
        module_ids = [m.id for m in self.modules]
        _unique(module_ids, "module")
        _unique([p.id for p in self.phases], "phase")
        _unique([c.id for c in self.checks], "check")
        _unique([a.id for a in self.areas], "area")
        phase_ids = {p.id for p in self.phases}
        for module in self.modules:
            if module.phase not in phase_ids:
                raise ValueError(f"module {module.id}: unknown phase {module.phase}")
            for prereq in module.prerequisites:
                if prereq not in module_ids:
                    raise ValueError(f"module {module.id}: unknown prerequisite {prereq}")
        for phase in self.phases:
            for mid in phase.modules:
                if mid not in module_ids:
                    raise ValueError(f"phase {phase.id}: unknown module {mid}")
        self._fit_areas()
        return self

    def _fit_areas(self) -> None:
        """Bind modules to areas; a v1 file with no `areas` gets one area per phase."""
        if not self.areas:
            self.areas = [
                Area(
                    id=phase.id,
                    title=phase.title,
                    scope=" · ".join(m.id for m in self.modules_of(phase.id)),
                )
                for phase in self.phases
            ]
            for module in self.modules:
                module.area = module.area or module.phase
            return
        area_ids = {a.id for a in self.areas}
        for module in self.modules:
            if not module.area:
                raise ValueError(f"module {module.id}: area is required when areas are declared")
            if module.area not in area_ids:
                raise ValueError(f"module {module.id}: unknown area {module.area}")

    @property
    def checks(self) -> list[Check]:
        return [c for m in self.modules for c in m.checks]

    def module(self, module_id: str) -> Module | None:
        return next((m for m in self.modules if m.id == module_id), None)

    def check(self, check_id: str) -> Check | None:
        return next((c for c in self.checks if c.id == check_id), None)

    def phase(self, phase_id: str) -> Phase | None:
        return next((p for p in self.phases if p.id == phase_id), None)

    def area(self, area_id: str) -> Area | None:
        return next((a for a in self.areas if a.id == area_id), None)

    def modules_of(self, phase_id: str) -> list[Module]:
        return [m for m in self.modules if m.phase == phase_id]

    def modules_in_area(self, area_id: str) -> list[Module]:
        return [m for m in self.modules if m.area == area_id]


def _unique(values: list[str], label: str) -> None:
    seen: set[str] = set()
    for value in values:
        if value in seen:
            raise ValueError(f"duplicate {label} id: {value}")
        seen.add(value)


def load_track(path: Path | None = None) -> Track:
    """Parse and validate the track file. Result is cached on (path, mtime_ns)."""
    target = path or get_config().curriculum
    stat = target.stat()
    return _load_cached(str(target), stat.st_mtime_ns)


_cache: dict[tuple[str, int], Track] = {}


def _load_cached(path: str, mtime_ns: int) -> Track:
    key = (path, mtime_ns)
    hit = _cache.get(key)
    if hit is None:
        raw = yaml.safe_load(Path(path).read_text(encoding="utf-8")) or {}
        hit = Track.model_validate(raw)
        _cache.clear()
        _cache[key] = hit
    return hit


def reset() -> None:
    """Drop the parsed-track cache."""
    _cache.clear()
    _warned.clear()
