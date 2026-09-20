"""The two AI actions over HTTP (spec §7), with the Anthropic client stubbed out.

No test here touches the network: `conftest.offline_ai` clears the environment and
replaces `ai.get_client`, and every test that needs a call installs its own fake
stream. The fakes deliberately mirror the real surface — an async context manager
with `text_stream` and `get_final_message()` — so the request keyword arguments can
be asserted against the SDK facts the spec pins down.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from types import SimpleNamespace
from typing import Any

import anthropic
import httpx2
import pytest
from starlette.testclient import TestClient

from conftest import close_session, full_attempt, open_session
from learn import ai, config, store

NOTE = "the mask is applied before the softmax, with -1e9 in the masked slots\n"
TIDIED = "The mask is applied before the softmax, with -1e9 in the masked slots.\n"

CRITIQUE_JSON = json.dumps(
    {
        "lines": [
            {
                "rubric_index": 0,
                "verdict": "met",
                "evidence": "I divided the scores by sqrt(d_k)",
                "missing": "",
            },
            {
                "rubric_index": 1,
                "verdict": "partial",
                "evidence": "then I masked the scores",
                "missing": "does not say when the mask is applied relative to the softmax",
            },
            {"rubric_index": 9, "verdict": "met", "evidence": "x", "missing": ""},
            {"rubric_index": 2, "verdict": "nonsense", "evidence": "x", "missing": ""},
        ]
    }
)


# ---------------------------------------------------------------- fakes


@dataclass
class _Usage:
    input_tokens: int = 1200
    output_tokens: int = 340


@dataclass
class _Final:
    stop_reason: str = "end_turn"
    content: list[Any] = field(default_factory=list)
    usage: _Usage = field(default_factory=_Usage)
    stop_details: Any = None


class _FakeStream:
    def __init__(self, chunks: list[str], final: _Final, error: Exception | None) -> None:
        self._chunks, self._final, self._error = chunks, final, error

    async def __aenter__(self) -> _FakeStream:
        if self._error is not None:
            raise self._error
        return self

    async def __aexit__(self, *exc: object) -> bool:
        return False

    @property
    def text_stream(self) -> Any:
        async def gen() -> Any:
            for chunk in self._chunks:
                yield chunk

        return gen()

    async def get_final_message(self) -> _Final:
        return self._final


class _FakeMessages:
    """Records the keyword arguments of the last `stream()` call."""

    def __init__(self, chunks: list[str], final: _Final, error: Exception | None) -> None:
        self._chunks, self._final, self._error = chunks, final, error
        self.kwargs: dict[str, Any] = {}

    def stream(self, **kwargs: Any) -> _FakeStream:
        self.kwargs = kwargs
        return _FakeStream(self._chunks, self._final, self._error)


def install(
    monkeypatch: pytest.MonkeyPatch,
    *,
    text: str = "",
    chunks: list[str] | None = None,
    stop_reason: str = "end_turn",
    stop_details: Any = None,
    error: Exception | None = None,
) -> _FakeMessages:
    """Point `ai.get_client()` at a fake whose stream replays `chunks` then `text`."""
    final = _Final(
        stop_reason=stop_reason,
        content=[SimpleNamespace(type="text", text=text)],
        stop_details=stop_details,
    )
    messages = _FakeMessages(chunks if chunks is not None else [text], final, error)
    client = SimpleNamespace(beta=SimpleNamespace(messages=messages))
    monkeypatch.setattr(ai, "get_client", lambda: client)
    return messages


def frames(body: str) -> list[tuple[str, Any]]:
    """Parse an SSE response body into `[(event, parsed data)]`."""
    out: list[tuple[str, Any]] = []
    for block in body.strip().split("\n\n"):
        event, data = "message", ""
        for line in block.splitlines():
            if line.startswith("event: "):
                event = line[len("event: ") :]
            elif line.startswith("data: "):
                data = line[len("data: ") :]
        if data:
            out.append((event, json.loads(data)))
    return out


def _sdk_error(kind: type, status: int) -> Exception:
    request = httpx2.Request("POST", "https://api.anthropic.com/v1/messages")
    if kind is anthropic.APIConnectionError:
        return anthropic.APIConnectionError(request=request)
    return kind("boom", response=httpx2.Response(status, request=request), body=None)


# ---------------------------------------------------------------- health


def test_health_names_both_credential_paths(client: TestClient) -> None:
    """An unset env var is not proof of no credential, so the reason names both (§7)."""
    body = client.get("/api/health").json()
    assert body["ai_available"] is False
    assert "ANTHROPIC_API_KEY" in body["ai_reason"]
    assert "learn/.env" in body["ai_reason"]


def test_status_trusts_an_env_credential_without_a_network_call(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-test")
    assert ai.status() == (True, "ready")


def test_status_trusts_a_resolved_profile(monkeypatch: pytest.MonkeyPatch) -> None:
    """No env var, but the SDK resolved a token from a stored profile."""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setattr(ai, "get_client", lambda: SimpleNamespace(api_key=None, auth_token="tok"))
    assert ai.status() == (True, "ready")


def test_status_does_not_trust_a_client_with_no_credential(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """SDK 1.x constructs a client with nothing in it; that must not read as ready."""
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.setattr(ai, "get_client", lambda: SimpleNamespace(api_key=None, auth_token=None))
    ok, reason = ai.status()
    assert ok is False
    assert "learn/.env" in reason


# ---------------------------------------------------------------- tidy


def test_tidy_streams_deltas_then_stats_then_done(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    messages = install(monkeypatch, text=TIDIED, chunks=["The mask is ", "applied…"])
    response = client.post("/api/ai/tidy", json={"module_id": "a1", "text": NOTE})
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")

    events = frames(response.text)
    assert [e for e, _ in events] == ["delta", "delta", "stats", "done"]
    assert [d["text"] for e, d in events if e == "delta"] == ["The mask is ", "applied…"]
    stats = dict(events[2][1])
    assert stats == {"tokens_added": 0, "input_tokens": 1200, "output_tokens": 340}
    assert events[3][1]["text"] == TIDIED
    assert events[3][1]["stats"] == stats

    # SDK facts the spec pins (§7): exact model, adaptive thinking with no budget,
    # medium effort, server-side fallback beta, cached system block, no prefill.
    kwargs = messages.kwargs
    assert kwargs["model"] == ai.MODEL == "claude-sonnet-5"
    assert kwargs["thinking"] == {"type": "adaptive"}
    assert "budget_tokens" not in kwargs["thinking"]
    assert kwargs["output_config"] == {"effort": "medium"}
    assert kwargs["betas"] == ["server-side-fallback-2026-07-01"]
    assert kwargs["fallbacks"] == "default"
    assert kwargs["system"][0]["cache_control"] == {"type": "ephemeral"}
    assert [m["role"] for m in kwargs["messages"]] == ["user"]

    logged = store.read_ai_log()
    assert len(logged) == 1
    assert logged[0]["mode"] == "tidy"
    assert logged[0]["target"] == "a1"
    assert logged[0]["accepted"] is True
    assert set(logged[0]) == {
        "ts",
        "mode",
        "target",
        "input_tokens",
        "output_tokens",
        "tokens_added",
        "accepted",
    }


def test_tidy_rejects_an_edit_that_breaks_an_invariant(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A changed number never reaches the MergeView: `rejected`, and no `done`."""
    install(monkeypatch, text=TIDIED.replace("-1e9", "-1e4"))
    response = client.post("/api/ai/tidy", json={"module_id": "a1", "text": NOTE})
    events = frames(response.text)
    # The fake replays the same bad edit, so the one retry is refused as well.
    assert [e for e, _ in events] == ["delta", "retry", "delta", "stats", "rejected"]
    assert "a number" in events[1][1]["reason"]
    assert "a number" in events[4][1]["reason"]
    assert [entry["accepted"] for entry in store.read_ai_log()] == [False, False]


def test_tidy_reports_a_missing_credential_as_one_error_frame(
    client: TestClient, cfg: config.Config
) -> None:
    """The default fixture leaves no credential at all; the route must not 500."""
    response = client.post("/api/ai/tidy", json={"module_id": "a1", "text": NOTE})
    assert response.status_code == 200
    events = frames(response.text)
    assert [e for e, _ in events] == ["error"]
    assert "ANTHROPIC_API_KEY" in events[0][1]["message"]
    assert "learn/.env" in events[0][1]["message"]
    assert store.read_ai_log()[0]["accepted"] is False


@pytest.mark.parametrize(
    ("kind", "status", "expected"),
    [
        (anthropic.AuthenticationError, 401, "rejected the credential (401)"),
        (anthropic.NotFoundError, 404, "not available to this account (404)"),
        (anthropic.RateLimitError, 429, "rate-limited this request (429)"),
        (anthropic.APIStatusError, 503, "Anthropic API error 503"),
        (anthropic.APIConnectionError, 0, "Could not reach the Anthropic API"),
    ],
)
def test_tidy_maps_every_sdk_error_to_one_sentence(
    client: TestClient,
    cfg: config.Config,
    monkeypatch: pytest.MonkeyPatch,
    kind: type,
    status: int,
    expected: str,
) -> None:
    install(monkeypatch, text=TIDIED, error=_sdk_error(kind, status))
    events = frames(client.post("/api/ai/tidy", json={"module_id": "a1", "text": NOTE}).text)
    assert [e for e, _ in events] == ["error"]
    assert expected in events[0][1]["message"]


def test_tidy_surfaces_a_refusal(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    """`stop_details` is only read once `stop_reason` says refusal."""
    install(
        monkeypatch,
        text=TIDIED,
        stop_reason="refusal",
        stop_details=SimpleNamespace(category="policy"),
    )
    events = frames(client.post("/api/ai/tidy", json={"module_id": "a1", "text": NOTE}).text)
    assert events[-1][0] == "error"
    assert "declined this request (policy)" in events[-1][1]["message"]


def test_tidy_surfaces_a_truncated_response(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    install(monkeypatch, text=TIDIED, stop_reason="max_tokens")
    events = frames(client.post("/api/ai/tidy", json={"module_id": "a1", "text": NOTE}).text)
    assert events[-1][0] == "error"
    assert "too long to copy-edit" in events[-1][1]["message"]


def test_tidy_is_locked_while_an_attempt_is_open(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    """423 before anything is streamed, so the UI sees a status code, not a frame (§7.3)."""
    install(monkeypatch, text=TIDIED)
    session_id = open_session(client)
    client.post(
        "/api/checks/a1-mha-from-memory/attempts",
        json={"session_id": session_id, "confidence_pre": 40},
    )
    locked = client.post("/api/ai/tidy", json={"module_id": "a1", "text": NOTE})
    assert locked.status_code == 423
    assert store.read_ai_log() == []


# ---------------------------------------------------------------- critique


def test_critique_refuses_an_unsubmitted_attempt(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    """409, not a stream: there is nothing to grade until the answer is frozen (§7.2).

    The session is closed first so the §7.3 open-attempt lockout — which is scoped to
    the current session — is not what answers the request.
    """
    install(monkeypatch, text=CRITIQUE_JSON)
    session_id = open_session(client)
    start = client.post(
        "/api/checks/a1-mha-from-memory/attempts",
        json={"session_id": session_id, "confidence_pre": 40},
    )
    close_session(client)
    response = client.post("/api/ai/critique", json={"attempt_path": start.json()["attempt_path"]})
    assert response.status_code == 409
    assert "not been submitted" in response.json()["detail"]


def test_critique_grades_a_submitted_attempt(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    messages = install(monkeypatch, text=CRITIQUE_JSON)
    result = full_attempt(client, score="partial")
    path = result["submit"]["attempt_path"]
    close_session(client)

    response = client.post("/api/ai/critique", json={"attempt_path": path})
    assert response.status_code == 200
    events = frames(response.text)
    assert [e for e, _ in events] == ["done"]
    lines = events[0][1]["lines"]
    # The out-of-range index and the invalid verdict are dropped, not passed through.
    assert lines == [
        {
            "rubric_index": 0,
            "verdict": "met",
            "evidence": "I divided the scores by sqrt(d_k)",
            "missing": "",
        },
        {
            "rubric_index": 1,
            "verdict": "partial",
            "evidence": "then I masked the scores",
            "missing": "does not say when the mask is applied relative to the softmax",
        },
    ]

    # High effort and a strict schema, and the reference travels marked do-not-quote.
    kwargs = messages.kwargs
    assert kwargs["output_config"]["effort"] == "high"
    assert kwargs["output_config"]["format"]["type"] == "json_schema"
    schema = kwargs["output_config"]["format"]["schema"]
    assert schema["properties"]["lines"]["items"]["properties"]["verdict"]["enum"] == [
        "met",
        "partial",
        "missing",
    ]
    sent = kwargs["messages"][0]["content"]
    assert 'do_not_quote="true"' in sent
    assert "REFERENCE-A1-MHA" in sent
    assert "my answer" in sent

    assert store.read_attempt(path).meta["ai_critique_used"] is True
    logged = store.read_ai_log()[-1]
    assert logged["mode"] == "critique"
    assert logged["target"] == path
    assert logged["accepted"] is True


def test_critique_reports_an_sdk_error_as_one_frame(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    install(
        monkeypatch,
        text=CRITIQUE_JSON,
        error=_sdk_error(anthropic.RateLimitError, 429),
    )
    path = full_attempt(client)["submit"]["attempt_path"]
    close_session(client)
    events = frames(client.post("/api/ai/critique", json={"attempt_path": path}).text)
    assert [e for e, _ in events] == ["error"]
    assert "rate-limited" in events[0][1]["message"]
    assert store.read_attempt(path).meta["ai_critique_used"] is False


def test_critique_is_locked_while_another_attempt_is_open(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    install(monkeypatch, text=CRITIQUE_JSON)
    path = full_attempt(client)["submit"]["attempt_path"]
    session_id = store.current_session().id  # type: ignore[union-attr]
    client.post(
        "/api/checks/a1-softmax-gradient/attempts",
        json={"session_id": session_id, "confidence_pre": 50},
    )
    locked = client.post("/api/ai/critique", json={"attempt_path": path})
    assert locked.status_code == 423


def test_critique_404s_on_an_unknown_attempt(client: TestClient, cfg: config.Config) -> None:
    response = client.post("/api/ai/critique", json={"attempt_path": "modules/a1/attempts/no.md"})
    assert response.status_code == 404


# ---------------------------------------------------------------- tidy retry


def _scripted_tidy(passes: list[str]):
    """A fake `ai.tidy` whose n-th call streams `passes[n]`, recording the violations."""
    calls: list[str | None] = []

    async def fake(body: str, violation: str | None = None):
        calls.append(violation)
        text = passes[len(calls) - 1]
        yield ("delta", text)
        yield ("done", {"text": text, "input_tokens": 10, "output_tokens": 5})

    fake.calls = calls  # type: ignore[attr-defined]
    return fake


def test_tidy_retries_once_with_the_checkers_reason(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    original = "Out of 50, 20 were correct and 3o wrong."
    fake = _scripted_tidy(
        ["Out of 50, 20 were correct and 30 wrong.", "Out of 50, 20 were correct and 3o wrong."]
    )
    monkeypatch.setattr(ai, "tidy", fake)
    response = client.post("/api/ai/tidy", json={"module_id": "a1", "text": original})
    events = frames(response.text)
    kinds = [e for e, _ in events]
    assert kinds == ["delta", "retry", "delta", "stats", "done"]
    assert "3" in events[1][1]["reason"] and "30" in events[1][1]["reason"]
    assert fake.calls[0] is None and fake.calls[1] == events[1][1]["reason"]
    assert events[-1][1]["text"] == original
    log = [json.loads(line) for line in (cfg.vault / "ai-log.jsonl").read_text().splitlines()]
    assert [entry["accepted"] for entry in log[-2:]] == [False, True]


def test_tidy_gives_up_after_the_second_refusal(
    client: TestClient, cfg: config.Config, monkeypatch: pytest.MonkeyPatch
) -> None:
    original = "It ran 3o times."
    fake = _scripted_tidy(["It ran 30 times.", "It ran 30 times."])
    monkeypatch.setattr(ai, "tidy", fake)
    response = client.post("/api/ai/tidy", json={"module_id": "a1", "text": original})
    kinds = [e for e, _ in frames(response.text)]
    assert kinds == ["delta", "retry", "delta", "stats", "rejected"]
    assert len(fake.calls) == 2


def test_tidy_prompt_carries_the_violation(monkeypatch: pytest.MonkeyPatch) -> None:
    messages = install(monkeypatch, text="x", chunks=["x"])

    async def run() -> None:
        async for _ in ai.tidy("x", violation="a number changed: '3' became '30'"):
            pass

    import asyncio

    asyncio.run(run())
    content = messages.kwargs["messages"][0]["content"]
    assert "refused because a number changed: '3' became '30'" in content
    assert "leave that exactly as it is written" in content
