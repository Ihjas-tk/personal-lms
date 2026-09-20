"""The module workspace: topics, per-topic notes, chores, resource positions and jots."""

from __future__ import annotations

from starlette.testclient import TestClient

from learn import config

WORKSPACE_KEYS = {
    "area_id",
    "topics",
    "chores",
    "habits",
    "all_notes",
    "step_summary",
    "overdue_retests",
    "soft_date",
}


def test_module_payload_carries_the_workspace_fields(either_client: TestClient) -> None:
    """Contract §3: the module page is one object on either schema version."""
    body = either_client.get("/api/modules/a1").json()
    assert WORKSPACE_KEYS <= set(body)
    assert body["area_id"]
    assert body["overdue_retests"] == 0
    assert body["all_notes"] == []
    topic = body["topics"][0]
    assert set(topic) == {
        "id",
        "title",
        "summary",
        "kind",
        "n",
        "state",
        "derived_state",
        "state_set_by_you",
        "state_set_at",
        "sources",
        "note",
        "checks",
        "proof_text",
    }
    assert topic["n"] == 1 and topic["kind"] == "idea"
    assert topic["state"] == "not_started"
    assert body["step_summary"].endswith("untouched")


def test_v1_module_shows_must_cover_as_topics_and_an_other_bucket(client: TestClient) -> None:
    """The tolerance path over HTTP: three ideas plus everything else in `other`."""
    body = client.get("/api/modules/a1").json()
    ids = [t["id"] for t in body["topics"]]
    assert ids == [
        "causal-self-attention",
        "positional-encoding",
        "residual-stream-and-layer-norm-placement",
        "other",
    ]
    other = body["topics"][-1]
    assert other["title"] == "Also in this module"
    assert len(other["sources"]) == 3
    assert len(other["checks"]) == 4
    assert body["chores"] == [] and body["habits"] == []


def test_v2_module_splits_ideas_chores_and_habits(client_v2: TestClient) -> None:
    body = client_v2.get("/api/modules/a1").json()
    assert [t["id"] for t in body["topics"]] == ["attention", "residual", "positional"]
    assert body["chores"] == [
        {
            "topic_id": "setup-gpu",
            "title": "Rent a GPU and run one training step",
            "done": False,
            "done_at": None,
        }
    ]
    assert body["habits"] == [
        {
            "topic_id": "habit-email-course",
            "title": "Start the free 17-part evals email course this week",
        }
    ]
    assert body["step_summary"] == "0 done · 0 in progress · 3 untouched"
    assert body["topics"][0]["proof_text"] == "0 of 2 solid"


def test_topic_sources_read_as_a_position(client_v2: TestClient) -> None:
    """`video · 95 of 116 min`, a fraction for the bar, and the button that follows from it."""
    before = client_v2.get("/api/modules/a1").json()["topics"][0]["sources"][0]
    assert before["meta"] == "video · not opened"
    assert (before["pct"], before["action"], before["position"]) == (0.0, "Start", None)

    body = client_v2.patch(
        "/api/modules/a1/resources/a1-karpathy-gpt", json={"position": 95}
    ).json()
    source = body["topics"][0]["sources"][0]
    assert source["meta"] == "video · 95 of 116 min"
    assert source["pct"] == 0.819
    assert source["action"] == "Resume"
    assert source["position_updated"] is not None
    assert body["topics"][0]["state"] == "not_started"  # a position is not progress yet

    paper = client_v2.patch(
        "/api/modules/a1/resources/a1-attention-paper",
        json={"position": 3, "state": "read"},
    ).json()["topics"][0]["sources"][1]
    assert paper["meta"] == "paper · 3 of 15 pages"
    assert client_v2.get("/api/modules/a1").json()["topics"][0]["state"] == "in_progress"


def test_resource_position_is_refused_when_negative(client_v2: TestClient) -> None:
    assert (
        client_v2.patch(
            "/api/modules/a1/resources/a1-karpathy-gpt", json={"position": -2}
        ).status_code
        == 422
    )


def test_topic_note_round_trip_and_conflict(client_v2: TestClient, cfg_v2: config.Config) -> None:
    """Per-topic notes behave exactly like the module note, 409 and all."""
    empty = client_v2.get("/api/modules/a1/notes/attention").json()
    assert empty == {
        "frontmatter": {"topic": "attention", "title": "Causal self-attention", "updated": None},
        "body": "",
        "mtime_ns": 0,
        "path": "a1/attention.md",
    }
    written = client_v2.put(
        "/api/modules/a1/notes/attention",
        json={"frontmatter": empty["frontmatter"], "body": "the mask goes in first\n",
              "mtime_ns": 0},
    )
    assert written.status_code == 200
    assert written.json()["frontmatter"]["updated"] is not None
    assert (cfg_v2.vault / "modules" / "a1" / "notes" / "attention.md").exists()

    stale = client_v2.put(
        "/api/modules/a1/notes/attention",
        json={"frontmatter": {}, "body": "second", "mtime_ns": 0},
    )
    assert stale.status_code == 409
    assert stale.json()["error"] == "stale_mtime"
    assert stale.json()["current"]["body"].strip() == "the mask goes in first"

    module = client_v2.get("/api/modules/a1").json()
    topic = module["topics"][0]
    assert topic["state"] == "in_progress"
    assert topic["note"]["exists"] is True
    assert topic["note"]["excerpt"].strip() == "the mask goes in first"
    assert topic["note"]["path"] == "a1/attention.md"
    assert module["all_notes"] == [
        {
            "path": "a1/attention.md",
            "topic_id": "attention",
            "updated": topic["note"]["updated"],
            "words": 5,
        }
    ]


def test_all_notes_lists_the_legacy_module_note_too(client_v2: TestClient) -> None:
    """The old `notes.md` is still read, and still shows up under "All notes"."""
    client_v2.put("/api/modules/a1/note", json={"frontmatter": {}, "body": "old", "mtime_ns": 0})
    client_v2.put(
        "/api/modules/a1/notes/residual", json={"frontmatter": {}, "body": "new", "mtime_ns": 0}
    )
    notes = client_v2.get("/api/modules/a1").json()["all_notes"]
    assert [n["path"] for n in notes] == ["a1/notes.md", "a1/residual.md"]
    assert [n["topic_id"] for n in notes] == [None, "residual"]


def test_unknown_topics_are_404(client_v2: TestClient) -> None:
    assert client_v2.get("/api/modules/a1/notes/nope").status_code == 404
    assert client_v2.get("/api/modules/nope/notes/attention").status_code == 404
    assert (
        client_v2.put(
            "/api/modules/a1/notes/nope", json={"frontmatter": {}, "body": "x", "mtime_ns": 0}
        ).status_code
        == 404
    )
    assert client_v2.patch("/api/modules/a1/chores/nope", json={"done": True}).status_code == 404


def test_chore_ticking_is_stamped_and_reversible(client_v2: TestClient) -> None:
    ticked = client_v2.patch("/api/modules/a1/chores/setup-gpu", json={"done": True}).json()
    chore = ticked["chores"][0]
    assert chore["done"] is True and chore["done_at"] is not None
    assert ticked["step_summary"] == "0 done · 0 in progress · 3 untouched"  # chores are apart

    unticked = client_v2.patch("/api/modules/a1/chores/setup-gpu", json={"done": False}).json()
    assert unticked["chores"][0] == {
        "topic_id": "setup-gpu",
        "title": "Rent a GPU and run one training step",
        "done": False,
        "done_at": None,
    }


def test_only_chores_can_be_ticked(client_v2: TestClient) -> None:
    """An idea is proved by a check, never by a tick."""
    response = client_v2.patch("/api/modules/a1/chores/attention", json={"done": True})
    assert response.status_code == 422
    assert "not a chore" in response.json()["detail"]


def test_jots_append_unfiled_and_then_land_in_the_note(client_v2: TestClient) -> None:
    """Focus mode captures lines; wrap-up files them under `## Jots` and marks them filed."""
    first = client_v2.post(
        "/api/jots",
        json={
            "module_id": "a1",
            "topic_id": "attention",
            "resource_id": "a1-karpathy-gpt",
            "stamp": "42:10",
            "text": "mask before the softmax",
        },
    ).json()
    second = client_v2.post(
        "/api/jots", json={"module_id": "a1", "topic_id": "attention", "text": "check merge order"}
    ).json()
    assert first["filed"] is False
    unfiled = client_v2.get("/api/jots", params={"module_id": "a1", "unfiled": True}).json()
    assert [j["id"] for j in unfiled] == [first["id"], second["id"]]

    note = client_v2.post(
        "/api/jots/file", json={"ids": [first["id"], second["id"]], "topic_id": "attention"}
    ).json()
    assert note["path"] == "a1/attention.md"
    assert note["body"] == "## Jots\n- [42:10] mask before the softmax\n- check merge order\n"
    assert client_v2.get("/api/jots", params={"unfiled": True}).json() == []
    filed = client_v2.get("/api/jots", params={"module_id": "a1"}).json()
    assert all(j["filed"] for j in filed)
    assert filed[0]["stamp"] == "42:10"

    third = client_v2.post(
        "/api/jots", json={"module_id": "a1", "topic_id": "attention", "text": "and one more"}
    ).json()
    again = client_v2.post(
        "/api/jots/file", json={"ids": [third["id"]], "topic_id": "attention"}
    ).json()
    assert again["body"].count("## Jots") == 1
    assert again["body"].endswith("- and one more\n")


def test_jots_refuse_nonsense(client_v2: TestClient) -> None:
    assert client_v2.post("/api/jots", json={"module_id": "a1", "text": "  "}).status_code == 422
    assert (
        client_v2.post("/api/jots", json={"module_id": "nope", "text": "x"}).status_code == 404
    )
    assert (
        client_v2.post(
            "/api/jots", json={"module_id": "a1", "topic_id": "nope", "text": "x"}
        ).status_code
        == 404
    )
    assert client_v2.post("/api/jots/file", json={"ids": [], "topic_id": "attention"}).status_code
    assert (
        client_v2.post(
            "/api/jots/file", json={"ids": ["jot-missing"], "topic_id": "attention"}
        ).status_code
        == 404
    )
    jot = client_v2.post("/api/jots", json={"module_id": "a1", "text": "x"}).json()
    assert (
        client_v2.post(
            "/api/jots/file", json={"ids": [jot["id"]], "topic_id": "open-coding"}
        ).status_code
        == 404
    )


def test_check_rows_carry_their_topic_id(client_v2: TestClient) -> None:
    """§1c: every check row names the topic that owns it, so a record can come back to it."""
    body = client_v2.get("/api/modules/a1").json()
    topic = next(t for t in body["topics"] if t["checks"])
    assert topic["checks"][0]["topic_id"] == topic["id"]

    check_id = topic["checks"][0]["check_id"]
    assert client_v2.get(f"/api/checks/{check_id}").json()["topic_id"] == topic["id"]
    assert all(c["topic_id"] == topic["id"] for c in body["checks"] if c["id"] == check_id)


def test_topic_id_is_null_for_a_check_in_no_authored_topic(client: TestClient) -> None:
    """The v1 tolerance path files everything under the implicit `other` topic: no id."""
    body = client.get("/api/modules/a1").json()
    assert all(c["topic_id"] is None for c in body["checks"])
    assert client.get("/api/checks/a1-mha-from-memory").json()["topic_id"] is None


def test_module_reports_whether_it_is_behind(either_client: TestClient) -> None:
    """§1d: the sidebar is told it is behind rather than working it out from dates."""
    # p0-orient's window is open (week 1 of its weeks 1-2) with nothing logged against it.
    open_now = either_client.get("/api/modules/p0-orient").json()
    assert open_now["actual_hours"] == 0
    assert open_now["expected_hours_by_now"] == 10.0  # half of a 20 h budget, one week in
    assert open_now["behind"] is True

    # a1 does not start until week 3, so no time can have been lost in it yet.
    later = either_client.get("/api/modules/a1").json()
    assert later["expected_hours_by_now"] == 0.0
    assert later["behind"] is False
