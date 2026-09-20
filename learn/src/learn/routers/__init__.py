"""API routers, mounted under `/api` by `main.py`."""

from fastapi import APIRouter

from . import ai, checks, desk, health, jots, modules, plan, review, sessions, vault

ALL: tuple[APIRouter, ...] = (
    health.router,
    plan.router,
    desk.router,
    modules.router,
    checks.router,
    sessions.router,
    review.router,
    jots.router,
    vault.router,
    ai.router,
)

__all__ = ["ALL"]
