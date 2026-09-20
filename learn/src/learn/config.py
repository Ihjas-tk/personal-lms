"""Filesystem paths for the app. `LEARN_VAULT` / `LEARN_CURRICULUM` override the defaults."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
HOST = "127.0.0.1"
PORT = 8765


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


def _resolve() -> Config:
    vault = Path(os.environ.get("LEARN_VAULT") or PROJECT_ROOT / "vault").expanduser()
    curriculum = Path(
        os.environ.get("LEARN_CURRICULUM") or PROJECT_ROOT / "curriculum" / "track.yaml"
    ).expanduser()
    return Config(vault=vault.resolve(), curriculum=curriculum.resolve())


@lru_cache(maxsize=1)
def _cached() -> Config:
    return _resolve()


def get_config() -> Config:
    """Return the process-wide config (cached; call `reset()` after changing env vars)."""
    return _cached()


def reset() -> None:
    """Drop caches so a new `LEARN_VAULT` takes effect (used by tests)."""
    _cached.cache_clear()
