"""Filesystem paths for the app, and the order the curriculum is looked for in.

Resolution, highest wins:

1. an explicit override set by the CLI (`learn --vault …` / `learn --curriculum …`)
2. `LEARN_VAULT` / `LEARN_CURRICULUM` in the environment
3. `<vault>/track.yaml` — the vault owns its curriculum after `learn init`
4. the legacy in-repo copy, `learn/curriculum/track.yaml`, if it is still there
5. otherwise `CurriculumNotFound`, naming `learn init`

The port follows the same shape: `--port` → `LEARN_PORT` → 8765.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
HOST = "127.0.0.1"
PORT = 8765

#: Where `learn init` puts the curriculum, and step 3 of the search.
VAULT_TRACK_NAME = "track.yaml"
#: Step 4: the pre-`tracks/` location, kept working for anyone who has not moved.
LEGACY_CURRICULUM = PROJECT_ROOT / "curriculum" / "track.yaml"


class CurriculumNotFound(RuntimeError):
    """No track file could be found. The message lists every place that was tried."""


@dataclass(frozen=True)
class Overrides:
    """CLI flags. They win over the environment and are set before the first read."""

    vault: Path | None = None
    curriculum: Path | None = None
    port: int | None = None
    host: str | None = None


_overrides = Overrides()


def set_overrides(
    vault: str | Path | None = None,
    curriculum: str | Path | None = None,
    port: int | None = None,
    host: str | None = None,
) -> None:
    """Record CLI flags and drop the cache so the next `get_config()` sees them."""
    global _overrides
    _overrides = Overrides(
        vault=Path(vault).expanduser().resolve() if vault else None,
        curriculum=Path(curriculum).expanduser().resolve() if curriculum else None,
        port=port,
        host=host,
    )
    reset()


@dataclass(frozen=True)
class Config:
    """Resolved paths. `.cache/` always sits next to the vault so it stays disposable."""

    vault: Path
    curriculum: Path

    @property
    def cache(self) -> Path:
        return self.vault.parent / ".cache"

    @property
    def index_db(self) -> Path:
        return self.cache / "index.sqlite"

    @property
    def backups(self) -> Path:
        return self.cache / "backups"

    @property
    def modules_dir(self) -> Path:
        return self.vault / "modules"

    @property
    def sessions_dir(self) -> Path:
        return self.vault / "sessions"

    @property
    def plan_file(self) -> Path:
        return self.vault / "plan.yaml"

    @property
    def capstone_file(self) -> Path:
        return self.vault / "capstone.yaml"

    @property
    def errors_file(self) -> Path:
        return self.vault / "errors.jsonl"

    @property
    def ai_log_file(self) -> Path:
        return self.vault / "ai-log.jsonl"

    @property
    def jots_file(self) -> Path:
        return self.vault / "jots.jsonl"

    def module_dir(self, module_id: str) -> Path:
        return self.modules_dir / module_id

    def ensure(self) -> None:
        """Create the directories the store writes into."""
        for path in (self.vault, self.modules_dir, self.sessions_dir, self.cache):
            path.mkdir(parents=True, exist_ok=True)


def resolve_vault() -> Path:
    """Where the learner's files live. Never raises — an empty vault is a valid state."""
    if _overrides.vault is not None:
        return _overrides.vault
    raw = os.environ.get("LEARN_VAULT")
    base = Path(raw).expanduser() if raw else PROJECT_ROOT / "vault"
    return base.resolve()


def resolve_curriculum(vault: Path | None = None) -> Path:
    """The track file, by the order in this module's docstring. Raises if nothing fits."""
    vault = vault if vault is not None else resolve_vault()
    if _overrides.curriculum is not None:
        return _overrides.curriculum
    raw = os.environ.get("LEARN_CURRICULUM")
    if raw:
        return Path(raw).expanduser().resolve()
    in_vault = vault / VAULT_TRACK_NAME
    if in_vault.is_file():
        return in_vault.resolve()
    if LEGACY_CURRICULUM.is_file():
        return LEGACY_CURRICULUM.resolve()
    raise CurriculumNotFound(
        "No curriculum found. Looked for:\n"
        f"  --curriculum PATH      (not given)\n"
        f"  $LEARN_CURRICULUM      (not set)\n"
        f"  {in_vault}\n"
        f"  {LEGACY_CURRICULUM}\n"
        "\n"
        "Pick a track and copy it into the vault, for example:\n"
        "  learn init --track tracks/starter/track.yaml\n"
        "or point at one directly with `learn --curriculum PATH`."
    )


def resolve_host() -> str:
    """`--host` → `LEARN_HOST` → 127.0.0.1. Only a container should bind wider."""
    if _overrides.host:
        return _overrides.host
    return os.environ.get("LEARN_HOST") or HOST


def resolve_port() -> int:
    """`--port` → `LEARN_PORT` → 8765."""
    if _overrides.port is not None:
        return _overrides.port
    raw = os.environ.get("LEARN_PORT")
    if raw:
        try:
            return int(raw)
        except ValueError as exc:
            raise ValueError(f"LEARN_PORT is not a number: {raw!r}") from exc
    return PORT


def _resolve() -> Config:
    vault = resolve_vault()
    return Config(vault=vault, curriculum=resolve_curriculum(vault))


@lru_cache(maxsize=1)
def _cached() -> Config:
    return _resolve()


def get_config() -> Config:
    """Return the process-wide config (cached; call `reset()` after changing env vars)."""
    return _cached()


def reset() -> None:
    """Drop caches so a new `LEARN_VAULT` takes effect (used by tests)."""
    _cached.cache_clear()
