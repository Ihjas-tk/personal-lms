"""FastAPI app assembly, lifespan, static mount (last) and the `learn` console script."""

from __future__ import annotations

import contextlib
import os
import threading
import webbrowser
from collections.abc import AsyncIterator
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException
from starlette.responses import Response
from starlette.types import Scope

from . import git, index
from .config import HOST, PORT, get_config
from .routers import ALL

STATIC_DIR = Path(__file__).resolve().parent / "static"
BROWSER_DELAY_SECONDS = 1.0


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Ensure the vault and its repo, rebuild the index, start the file watcher."""
    get_config().ensure()
    git.ensure_repo()
    index.rebuild()
    index.broker.start()
    try:
        yield
    finally:
        await index.broker.stop()


class SpaFiles(StaticFiles):
    """Static files with a history fallback.

    The client routes `/plan`, `/modules/:id`, `/review/weekly` and the rest itself, so
    any path that is not a real file has to come back as `index.html` — otherwise a
    reload or a pasted deep link 404s instead of opening the screen.
    """

    async def get_response(self, path: str, scope: Scope) -> Response:
        # An unknown `/api/*` path is a missing endpoint, not a client route:
        # answer 404 so the browser sees an error instead of parsing index.html.
        if path == "api" or path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not Found")
        try:
            response = await super().get_response(path, scope)
        except HTTPException as exc:
            if exc.status_code != 404:
                raise
            return await super().get_response("index.html", scope)
        if response.status_code == 404:
            return await super().get_response("index.html", scope)
        return response


def create_app() -> FastAPI:
    """Build the app. The static mount is added last so `/api` always wins."""
    app = FastAPI(title="learn", version="0.1.0", lifespan=lifespan)
    for router in ALL:
        app.include_router(router, prefix="/api")
    if STATIC_DIR.is_dir():
        app.mount("/", SpaFiles(directory=STATIC_DIR, html=True), name="static")
    return app


app = create_app()


def run() -> None:
    """Console-script entry point: serve on 127.0.0.1:8765 and open a browser.

    `BROWSER=none` suppresses the browser, which is how the Playwright suite and any
    headless run start the same binary the learner starts.
    """
    import socket
    import sys

    import uvicorn

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        if probe.connect_ex((HOST, PORT)) == 0:
            print(
                f"learn: something is already listening on http://{HOST}:{PORT}/ "
                "(probably another `learn` instance). Stop it, or open that address.",
                file=sys.stderr,
            )
            sys.exit(1)

    if os.environ.get("BROWSER") != "none":
        threading.Timer(
            BROWSER_DELAY_SECONDS, lambda: webbrowser.open(f"http://{HOST}:{PORT}/")
        ).start()
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")
