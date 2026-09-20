"""Shared fixtures. Every test runs against a throwaway vault and the fixture track."""

from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Any

import frontmatter
import pytest
from starlette.testclient import TestClient

from learn import ai, config, curriculum, main

FIXTURE_TRACK = Path(__file__).parent / "fixtures" / "track.yaml"
FIXTURE_TRACK_V2 = Path(__file__).parent / "fixtures" / "track_v2.yaml"

REFLECTION = (
    "Today I rebuilt causal attention twice and the second pass was faster because I finally "
    "separated the mask from the softmax in my head rather than treating them as one step. "
    "What I still cannot do is derive the backward pass for the attention weights without "
    "checking a reference, and my reshape order for merging heads is still guesswork under time "
    "pressure, so that is the thing to drill next session before anything else at all."
)


@pytest.fixture(autouse=True)
def offline_ai(monkeypatch: pytest.MonkeyPatch) -> Any:
    """No test ever reaches Anthropic.

    The developer's own `ANTHROPIC_API_KEY` must not leak into the suite, so the
    environment is cleared and `get_client` is replaced by a raising stub. Tests that
    exercise a call monkeypatch `ai.get_client` themselves on top of this.
    """

    def no_credential() -> None:
        raise ai.AIUnavailable(ai.NO_CREDENTIAL)

    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_AUTH_TOKEN", raising=False)
    monkeypatch.setattr(ai, "get_client", no_credential)
    ai.reset_client()
    yield
    ai.reset_client()


def _configure(tmp_path: Path, monkeypatch: pytest.MonkeyPatch, track: Path) -> config.Config:
    monkeypatch.setenv("LEARN_VAULT", str(tmp_path / "vault"))
    monkeypatch.setenv("LEARN_CURRICULUM", str(track))
    config.reset()
    curriculum.reset()
    resolved = config.get_config()
    resolved.ensure()
    return resolved


@pytest.fixture
def cfg(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> config.Config:
    """Point the app at a temp vault and the v1 fixture curriculum."""
    yield _configure(tmp_path, monkeypatch, FIXTURE_TRACK)
    config.reset()
    curriculum.reset()


@pytest.fixture
def cfg_v2(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> config.Config:
    """The same temp vault against the schema-v2 fixture curriculum."""
    yield _configure(tmp_path, monkeypatch, FIXTURE_TRACK_V2)
    config.reset()
    curriculum.reset()


@pytest.fixture(params=["v1", "v2"])
def either_cfg(request: pytest.FixtureRequest, tmp_path: Path, monkeypatch) -> config.Config:
    """Both schema versions, for the routes that must behave the same on either file."""
    track = FIXTURE_TRACK if request.param == "v1" else FIXTURE_TRACK_V2
    yield _configure(tmp_path, monkeypatch, track)
    config.reset()
    curriculum.reset()


@pytest.fixture
def client(cfg: config.Config) -> TestClient:
    """A TestClient without lifespan, so no file watcher runs during unit tests."""
    return TestClient(main.app)


@pytest.fixture
def client_v2(cfg_v2: config.Config) -> TestClient:
    return TestClient(main.app)


@pytest.fixture
def either_client(either_cfg: config.Config) -> TestClient:
    """A client against the v1 fixture and again against the v2 fixture."""
    return TestClient(main.app)


def open_session(client: TestClient, module_id: str = "a1") -> str:
    """Start a session and return its id."""
    response = client.post("/api/sessions/start", json={"module_id": module_id})
    assert response.status_code == 200, response.text
    return response.json()["id"]


def close_session(client: TestClient, **overrides: Any) -> Any:
    """Close the open session with valid defaults."""
    body = {
        "reflection": REFLECTION,
        "if_cue": "it is Sunday after breakfast",
        "then_action": "re-derive the attention gradient on paper for 10 minutes",
        "fatigue": 3,
    }
    body.update(overrides)
    return client.post("/api/sessions/close", json=body)


def seed_attempt(
    cfg: config.Config,
    check_id: str,
    module_id: str,
    on: date,
    score: str = "fluent",
    confidence: int = 70,
    session_id: str = "seed-1",
) -> Path:
    """Write a submitted attempt file dated in the past.

    The HTTP flow can only submit attempts dated today, so every test that needs a
    ladder history — overdue re-tests, four-week deltas, a durable check — writes the
    files the same way an editor would.
    """
    moment = f"{on.isoformat()}T10:00:00+00:00"
    meta = {
        "check_id": check_id,
        "session_id": session_id,
        "started": moment,
        "submitted": moment,
        "confidence_pre": confidence,
        "score": score,
        "rubric": ["met"],
        "category": None,
        "ai_critique_used": False,
        "warmup": False,
    }
    path = (
        cfg.vault
        / "modules"
        / module_id
        / "attempts"
        / f"{check_id}--{on.strftime('%Y%m%d')}-{session_id}.md"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        frontmatter.dumps(frontmatter.Post("## Answer\nseeded\n", **meta)) + "\n",
        encoding="utf-8",
    )
    return path


def full_attempt(
    client: TestClient,
    check_id: str = "a1-mha-from-memory",
    score: str = "fluent",
    confidence: int = 70,
    module_id: str = "a1",
) -> dict[str, Any]:
    """Session → start attempt → submit, returning the submit payload."""
    session_id = open_session(client, module_id)
    start = client.post(
        f"/api/checks/{check_id}/attempts",
        json={"session_id": session_id, "confidence_pre": confidence},
    )
    assert start.status_code == 200, start.text
    body: dict[str, Any] = {
        "attempt_path": start.json()["attempt_path"],
        "answer": "my answer",
        "rubric": ["met", "met"],
        "score": score,
    }
    if score != "fluent":
        body |= {"category": "off_by_one_masking", "diagnosis": "mask applied after softmax"}
    submit = client.post("/api/attempts/submit", json=body)
    assert submit.status_code == 200, submit.text
    return {"start": start.json(), "submit": submit.json(), "session_id": session_id}
