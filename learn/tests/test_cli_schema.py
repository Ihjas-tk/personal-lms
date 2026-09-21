"""The `learn` command line, and the committed JSON Schema that must not drift."""

from __future__ import annotations

import json
import os
from pathlib import Path

import pytest

from learn import config, schema
from learn.cli import main as cli

REPO = Path(__file__).resolve().parents[2]
TRACKS = REPO / "tracks"
FIXTURE = Path(__file__).parent / "fixtures" / "track_v2.yaml"


# ------------------------------------------------------------------- schema


def test_committed_schema_matches_the_models() -> None:
    """Regenerate from the pydantic models; fail if `curriculum/schema.json` is stale."""
    assert schema.SCHEMA_PATH.is_file(), "run `learn schema` to create it"
    committed = schema.SCHEMA_PATH.read_text(encoding="utf-8")
    assert committed == schema.render_schema(), (
        "curriculum/schema.json is out of date with src/learn/curriculum.py — "
        "run `learn schema` and commit the result"
    )


def test_schema_is_json_and_describes_the_root_keys() -> None:
    body = json.loads(schema.SCHEMA_PATH.read_text(encoding="utf-8"))
    assert body["$schema"].startswith("https://json-schema.org/")
    assert set(body["properties"]) >= {
        "version",
        "start_date",
        "weekly_budget_hours",
        "debrief_day",
        "areas",
        "phases",
        "modules",
        "capstone",
    }
    assert body["required"] == ["start_date"]
    assert set(body["$defs"]) >= {"Area", "Phase", "Module", "Topic", "Resource", "Check"}


def test_schema_check_subcommand_passes_on_the_committed_file(capsys) -> None:
    assert cli(["schema", "--check"]) == 0


# -------------------------------------------------------------------- check


@pytest.mark.parametrize("name", ["starter", "linear-algebra", "llm-engineering-and-evals"])
def test_shipped_tracks_validate(name: str, capsys) -> None:
    """Every track under `tracks/` must pass `learn check`."""
    assert cli(["check", str(TRACKS / name / "track.yaml")]) == 0
    assert "OK —" in capsys.readouterr().out


def test_check_summary_counts_optional_and_either_or_resources(capsys) -> None:
    """The summary line says how much of the track is owed and how much is a choice."""
    fixture = Path(__file__).parent / "fixtures" / "track_v2.yaml"
    assert cli(["check", str(fixture)]) == 0
    out = capsys.readouterr().out
    assert "1 optional, 1 either/or group" in out
    assert cli(["check", str(TRACKS / "linear-algebra" / "track.yaml")]) == 0
    assert "0 optional, 0 either/or groups" in capsys.readouterr().out


def test_check_reports_the_failing_field_not_a_traceback(tmp_path: Path, capsys) -> None:
    bad = tmp_path / "track.yaml"
    bad.write_text("version: 2\nphases: [{id: p1, title: One}]\n", encoding="utf-8")
    assert cli(["check", str(bad)]) == 1
    err = capsys.readouterr().err
    assert "start_date: Field required" in err
    assert "phases.0.weeks: Field required" in err
    assert "Traceback" not in err


def test_check_reports_bad_yaml(tmp_path: Path, capsys) -> None:
    bad = tmp_path / "track.yaml"
    bad.write_text("version: 2\n  bad indent: [\n", encoding="utf-8")
    assert cli(["check", str(bad)]) == 1
    assert "not valid YAML" in capsys.readouterr().err


def test_check_reports_a_missing_file(tmp_path: Path, capsys) -> None:
    assert cli(["check", str(tmp_path / "nope.yaml")]) == 1
    assert "no such file" in capsys.readouterr().err


# --------------------------------------------------------------------- init


def test_init_copies_the_track_and_makes_the_folders(tmp_path: Path, capsys) -> None:
    vault = tmp_path / "vault"
    assert cli(["init", "--track", str(FIXTURE), "--vault", str(vault)]) == 0
    assert (vault / "track.yaml").read_bytes() == FIXTURE.read_bytes()
    assert (vault / "modules").is_dir() and (vault / "sessions").is_dir()
    assert (tmp_path / ".cache").is_dir()
    assert "Installed" in capsys.readouterr().out
    config.set_overrides()


def test_init_refuses_to_overwrite_without_force(tmp_path: Path, capsys) -> None:
    vault = tmp_path / "vault"
    assert cli(["init", "--track", str(FIXTURE), "--vault", str(vault)]) == 0
    (vault / "track.yaml").write_text("mine\n", encoding="utf-8")

    assert cli(["init", "--track", str(FIXTURE), "--vault", str(vault)]) == 1
    assert "already exists" in capsys.readouterr().err
    assert (vault / "track.yaml").read_text(encoding="utf-8") == "mine\n"

    assert cli(["init", "--track", str(FIXTURE), "--vault", str(vault), "--force"]) == 0
    assert (vault / "track.yaml").read_bytes() == FIXTURE.read_bytes()
    config.set_overrides()


def test_init_refuses_an_invalid_track(tmp_path: Path, capsys) -> None:
    bad = tmp_path / "bad.yaml"
    bad.write_text("version: 2\n", encoding="utf-8")
    vault = tmp_path / "vault"
    assert cli(["init", "--track", str(bad), "--vault", str(vault)]) == 1
    assert not (vault / "track.yaml").exists()
    assert "not a valid curriculum" in capsys.readouterr().err
    config.set_overrides()


# --------------------------------------------------------------- resolution


@pytest.fixture
def clean_env(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("LEARN_VAULT", raising=False)
    monkeypatch.delenv("LEARN_CURRICULUM", raising=False)
    monkeypatch.delenv("LEARN_PORT", raising=False)
    config.set_overrides()
    yield
    config.set_overrides()
    config.reset()


def test_flag_beats_env_beats_vault(tmp_path: Path, monkeypatch, clean_env) -> None:
    vault = tmp_path / "vault"
    vault.mkdir()
    (vault / "track.yaml").write_text("x\n", encoding="utf-8")
    monkeypatch.setenv("LEARN_VAULT", str(vault))

    # 3. the vault's own copy
    assert config.resolve_curriculum() == vault / "track.yaml"

    # 2. the environment
    env_track = tmp_path / "env.yaml"
    env_track.write_text("x\n", encoding="utf-8")
    monkeypatch.setenv("LEARN_CURRICULUM", str(env_track))
    assert config.resolve_curriculum() == env_track

    # 1. the flag
    flag_track = tmp_path / "flag.yaml"
    flag_track.write_text("x\n", encoding="utf-8")
    config.set_overrides(curriculum=flag_track)
    assert config.resolve_curriculum() == flag_track


def test_legacy_in_repo_copy_is_the_last_resort(tmp_path: Path, monkeypatch, clean_env) -> None:
    """Step 4 only fires when the vault has no track of its own."""
    monkeypatch.setenv("LEARN_VAULT", str(tmp_path / "empty"))
    legacy = tmp_path / "legacy.yaml"
    legacy.write_text("x\n", encoding="utf-8")
    monkeypatch.setattr(config, "LEGACY_CURRICULUM", legacy)
    assert config.resolve_curriculum() == legacy


def test_no_curriculum_anywhere_names_learn_init(tmp_path: Path, monkeypatch, clean_env) -> None:
    monkeypatch.setenv("LEARN_VAULT", str(tmp_path / "empty"))
    monkeypatch.setattr(config, "LEGACY_CURRICULUM", tmp_path / "nowhere.yaml")
    with pytest.raises(config.CurriculumNotFound) as exc:
        config.resolve_curriculum()
    assert "learn init" in str(exc.value)
    assert str(tmp_path / "empty" / "track.yaml") in str(exc.value)


def test_port_flag_beats_env_beats_default(monkeypatch, clean_env) -> None:
    assert config.resolve_port() == 8765
    monkeypatch.setenv("LEARN_PORT", "8798")
    assert config.resolve_port() == 8798
    config.set_overrides(port=9001)
    assert config.resolve_port() == 9001


# --------------------------------------------------------------------- host


def test_host_resolution_order(monkeypatch: pytest.MonkeyPatch) -> None:
    """`--host` → `LEARN_HOST` → 127.0.0.1."""
    monkeypatch.delenv("LEARN_HOST", raising=False)
    config.set_overrides()
    assert config.resolve_host() == "127.0.0.1"
    monkeypatch.setenv("LEARN_HOST", "0.0.0.0")
    assert config.resolve_host() == "0.0.0.0"
    config.set_overrides(host="10.0.0.5")
    assert config.resolve_host() == "10.0.0.5"
    config.set_overrides()


# --------------------------------------------------------------------- .env


def test_dotenv_sets_only_missing_keys(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    env = tmp_path / ".env"
    env.write_text(
        "# comment\nLEARN_TEST_A='quoted'\nexport LEARN_TEST_B=plain\nLEARN_TEST_C=keep\n\nbroken\n"
    )
    monkeypatch.delenv("LEARN_TEST_A", raising=False)
    monkeypatch.delenv("LEARN_TEST_B", raising=False)
    monkeypatch.setenv("LEARN_TEST_C", "already")
    assert config.load_dotenv(env) == ["LEARN_TEST_A", "LEARN_TEST_B"]
    assert os.environ["LEARN_TEST_A"] == "quoted"
    assert os.environ["LEARN_TEST_B"] == "plain"
    assert os.environ["LEARN_TEST_C"] == "already"
    for k in ("LEARN_TEST_A", "LEARN_TEST_B"):
        monkeypatch.delenv(k)


def test_dotenv_missing_file_is_noop(tmp_path: Path) -> None:
    assert config.load_dotenv(tmp_path / "nope") == []
