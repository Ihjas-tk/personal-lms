"""Vault version control: `git init` on first run, a commit per snapshot, file-copy fallback."""

from __future__ import annotations

import shutil
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

from .config import get_config


def git_available() -> bool:
    """True when a `git` executable is on PATH."""
    return shutil.which("git") is not None


def _run(args: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args], cwd=str(cwd), capture_output=True, text=True, check=False, timeout=30
    )


def is_repo() -> bool:
    """True when the vault itself is a git work tree."""
    vault = get_config().vault
    return (vault / ".git").exists()


def ensure_repo() -> bool:
    """Initialise `vault/` as a repo if it is not one. Returns whether it is a repo now."""
    if not git_available():
        return False
    cfg = get_config()
    cfg.ensure()
    if is_repo():
        return True
    if _run(["init"], cfg.vault).returncode != 0:
        return False
    _run(["config", "user.email", "learn@localhost"], cfg.vault)
    _run(["config", "user.name", "learn"], cfg.vault)
    return is_repo()


def _backup() -> dict[str, Any]:
    """Fallback: copy every vault file into `.cache/backups/<path>/<ts>`, keeping 20."""
    cfg = get_config()
    stamp = datetime.now().strftime("%Y%m%dT%H%M%S")
    copied = 0
    for path in sorted(cfg.vault.rglob("*")):
        if not path.is_file() or ".git" in path.parts:
            continue
        rel = path.relative_to(cfg.vault)
        target_dir = cfg.backups / rel
        target_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target_dir / f"{stamp}{rel.suffix}")
        copied += 1
        keep = sorted(target_dir.iterdir(), reverse=True)[:20]
        for stale in sorted(target_dir.iterdir()):
            if stale not in keep:
                stale.unlink(missing_ok=True)
    return {"ok": True, "mode": "backup", "detail": f"copied {copied} files to .cache/backups"}


def snapshot(message: str) -> dict[str, Any]:
    """Commit the whole vault; fall back to `.cache/backups` when git is unavailable."""
    cfg = get_config()
    cfg.ensure()
    if not ensure_repo():
        return _backup()
    _run(["add", "-A"], cfg.vault)
    result = _run(["commit", "-m", message], cfg.vault)
    if result.returncode != 0:
        detail = (result.stdout + result.stderr).strip().splitlines()
        if any("nothing to commit" in line for line in detail):
            return {"ok": True, "mode": "git", "detail": "nothing to commit"}
        return {"ok": False, "mode": "git", "detail": detail[0] if detail else "commit failed"}
    return {"ok": True, "mode": "git", "detail": message}
