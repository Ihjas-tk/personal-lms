"""JSON Schema for a curriculum file, generated from the pydantic models.

One source of truth: the models in `curriculum.py`. `learn schema` writes the
rendered file to `learn/curriculum/schema.json`, and `learn schema --check`
(which `tests/test_schema_export.py` runs) fails when the committed copy has
drifted from the models.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .config import PROJECT_ROOT
from .curriculum import Track

SCHEMA_PATH = PROJECT_ROOT / "curriculum" / "schema.json"
SCHEMA_ID = "https://github.com/Ihjas-tk/personal-lms/blob/main/learn/curriculum/schema.json"
TITLE = "learn curriculum (track.yaml)"
DESCRIPTION = (
    "A track: areas, phases, modules, topics, resources, checks and capstone artefacts. "
    "Written by hand in YAML; validated with `learn check <track.yaml>`. "
    "See docs/curriculum-schema.md for the prose version."
)


def curriculum_schema() -> dict[str, Any]:
    """The root model's schema, with the identifying keys JSON Schema wants on top."""
    body = Track.model_json_schema(mode="validation")
    defs = body.pop("$defs", None)
    body.pop("title", None)
    body.pop("description", None)
    out: dict[str, Any] = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": SCHEMA_ID,
        "title": TITLE,
        "description": DESCRIPTION,
        **body,
    }
    if defs is not None:
        out["$defs"] = defs
    return out


def render_schema() -> str:
    """The exact bytes the committed file must hold: 2-space JSON, trailing newline."""
    return json.dumps(curriculum_schema(), indent=2, sort_keys=False, ensure_ascii=False) + "\n"


def write_schema(path: Path | None = None) -> Path:
    target = path or SCHEMA_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(render_schema(), encoding="utf-8")
    return target
