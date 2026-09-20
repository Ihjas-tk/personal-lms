"""`GET /api/health`."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from .. import ai, git

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, Any]:
    """Liveness plus AI and vault-git availability."""
    available, reason = ai.status()
    return {"ok": True, "ai_available": available, "ai_reason": reason, "vault_git": git.is_repo()}
