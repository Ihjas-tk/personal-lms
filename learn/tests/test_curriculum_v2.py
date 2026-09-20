"""Schema v2: areas, topics, resource lengths — and the v1 file that must still load."""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml
from pydantic import ValidationError

from learn.curriculum import OTHER_TOPIC_ID, Track, load_track

FIXTURES = Path(__file__).parent / "fixtures"


def _v2() -> dict:
    return yaml.safe_load((FIXTURES / "track_v2.yaml").read_text(encoding="utf-8"))


def test_v1_file_wraps_must_cover_into_idea_topics() -> None:
    """A v1 track has no `topics`; every `must_cover` line becomes one (plan §1)."""
    track = load_track(FIXTURES / "track.yaml")
    a1 = track.module("a1")
    assert a1 is not None
    ideas = a1.topics_of("idea")
    assert [t.title for t in ideas[:3]] == a1.must_cover
    assert all(t.derived for t in ideas)
    assert all(t.kind == "idea" for t in a1.topics)


def test_v1_file_files_everything_under_the_other_topic() -> None:
    """Nothing is unreachable: unassigned resources and checks land in `other`."""
    track = load_track(FIXTURES / "track.yaml")
    a1 = track.module("a1")
    assert a1 is not None
    other = a1.topic(OTHER_TOPIC_ID)
    assert other is not None
    assert other.title == "Also in this module"
    assert other.resources == [r.id for r in a1.resources]
    assert other.checks == [c.id for c in a1.checks]


def test_v1_file_gets_one_area_per_phase() -> None:
    """With no `areas` block the ridge falls back to the phases, so the Desk still draws."""
    track = load_track(FIXTURES / "track.yaml")
    assert [a.id for a in track.areas] == [p.id for p in track.phases]
    assert {m.id: m.area for m in track.modules} == {
        "p0-orient": "p0",
        "a1": "p1",
        "a2": "p1",
    }
    assert track.area("p1") is not None and track.area("p1").scope == "a1 · a2"


def test_v2_fixture_assigns_every_resource_and_check() -> None:
    """The authored topics own everything, so no implicit `other` topic appears."""
    track = load_track(FIXTURES / "track_v2.yaml")
    assert track.version == 2
    for module in track.modules:
        assert module.topic(OTHER_TOPIC_ID) is None
        owned_resources = [r for t in module.topics for r in t.resources]
        owned_checks = [c for t in module.topics for c in t.checks]
        assert sorted(owned_resources) == sorted(r.id for r in module.resources)
        assert sorted(owned_checks) == sorted(c.id for c in module.checks)


def test_v2_fixture_carries_the_new_fields() -> None:
    track = load_track(FIXTURES / "track_v2.yaml")
    assert [a.id for a in track.areas] == ["transformers", "evals-found"]
    assert track.phase("p1").order_note.startswith("Do them in this order")
    a1 = track.module("a1")
    video = a1.resource("a1-karpathy-gpt")
    assert (video.length, video.unit, video.span) == (116, "min", 116)
    repo = a1.resource("a1-nanogpt")
    assert (repo.length, repo.unit, repo.span) == (None, "min", 240)
    assert [t.kind for t in a1.topics] == ["idea", "idea", "idea", "chore", "habit"]


def test_unknown_area_is_refused() -> None:
    raw = _v2()
    raw["modules"][0]["area"] = "nowhere"
    with pytest.raises(ValidationError, match="unknown area nowhere"):
        Track.model_validate(raw)


def test_a_module_without_an_area_is_refused() -> None:
    raw = _v2()
    del raw["modules"][1]["area"]
    with pytest.raises(ValidationError, match="area is required"):
        Track.model_validate(raw)


def test_a_resource_in_two_topics_is_refused() -> None:
    raw = _v2()
    module = raw["modules"][1]
    module["topics"][1]["resources"].append("a1-karpathy-gpt")
    with pytest.raises(ValidationError, match="a1-karpathy-gpt is in topics"):
        Track.model_validate(raw)


def test_a_check_in_two_topics_is_refused() -> None:
    raw = _v2()
    raw["modules"][1]["topics"][1]["checks"].append("a1-mha-from-memory")
    with pytest.raises(ValidationError, match="a1-mha-from-memory is in topics"):
        Track.model_validate(raw)


def test_a_topic_may_not_claim_a_foreign_resource() -> None:
    raw = _v2()
    raw["modules"][1]["topics"][0]["resources"].append("b0-error-analysis")
    with pytest.raises(ValidationError, match="unknown resource b0-error-analysis"):
        Track.model_validate(raw)


def test_an_idea_topic_needs_a_resource_or_a_check() -> None:
    raw = _v2()
    raw["modules"][1]["topics"].append({"id": "empty", "title": "Nothing here", "kind": "idea"})
    with pytest.raises(ValidationError, match="idea topic empty needs a resource or a check"):
        Track.model_validate(raw)


def test_chores_and_habits_need_nothing() -> None:
    """A chore is a tick and a habit is a sentence; neither owns sources or checks."""
    raw = _v2()
    raw["modules"][1]["topics"].append({"id": "extra", "title": "Tidy the repo", "kind": "chore"})
    track = Track.model_validate(raw)
    assert track.module("a1").topic("extra").kind == "chore"


def test_duplicate_topic_ids_are_refused() -> None:
    raw = _v2()
    raw["modules"][1]["topics"].append(
        {"id": "attention", "title": "Again", "kind": "chore"},
    )
    with pytest.raises(ValidationError, match="duplicate topic in module a1 id: attention"):
        Track.model_validate(raw)


def test_unassigned_rows_join_an_authored_other_topic() -> None:
    """Half-authored v2: what the author did not file goes to `other`, not into the void."""
    raw = _v2()
    raw["modules"][2]["topics"] = [
        {"id": "open-coding", "title": "Open coding", "kind": "idea", "checks": ["b0-open-coding"]}
    ]
    track = Track.model_validate(raw)
    other = track.module("b0").topic(OTHER_TOPIC_ID)
    assert other.resources == ["b0-error-analysis"]
    assert other.checks == ["b0-taxonomy-judgement"]
