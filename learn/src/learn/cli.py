"""The `learn` command line: serve (the default), `init`, `check` and `schema`.

`learn` with no subcommand still means "serve", so the launcher bundles and
`uv run learn` keep working exactly as before. Everything else is a subcommand:

    learn                                   serve on 127.0.0.1:8765
    learn --port 8798 --no-browser          serve elsewhere, quietly
    learn --curriculum tracks/x/track.yaml  serve a track without installing it
    learn init --track tracks/starter/track.yaml
    learn check tracks/starter/track.yaml
    learn schema --check

Validation errors are printed as `field.path: message`, one per line — a pydantic
traceback is not something a curriculum author should ever have to read.
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

import yaml
from pydantic import ValidationError

from . import config
from .curriculum import Track

EPILOG = "Files are the truth: everything the app records lives in the vault, as text."


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="learn",
        description="Local, file-first learning tracker. With no subcommand, serves the app.",
        epilog=EPILOG,
    )
    _serve_flags(parser)
    sub = parser.add_subparsers(dest="command", metavar="{init,check,schema}")

    init = sub.add_parser(
        "init",
        help="copy a track into a vault and create the folders",
        description="Install a curriculum into a vault as `track.yaml`.",
    )
    init.add_argument("--track", required=True, metavar="PATH", help="the track.yaml to install")
    init.add_argument("--vault", metavar="PATH", help="where to install it (default: ./vault)")
    init.add_argument(
        "--force", action="store_true", help="overwrite an existing vault track.yaml"
    )

    check = sub.add_parser(
        "check",
        help="validate a curriculum file and say what is in it",
        description="Validate a track.yaml. Exit 0 and a one-line summary, or exit 1 and why.",
    )
    check.add_argument("track", metavar="TRACK", help="path to a track.yaml")

    schema = sub.add_parser(
        "schema",
        help="write the JSON Schema for a curriculum file",
        description="Export the JSON Schema generated from the pydantic models.",
    )
    schema.add_argument("--out", metavar="PATH", help=f"where to write it (default: {SCHEMA_REL})")
    schema.add_argument(
        "--check",
        action="store_true",
        dest="check_only",
        help="exit 1 if the file on disk differs from the generated schema",
    )
    return parser


def _serve_flags(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--vault", metavar="PATH", help="vault directory (env: LEARN_VAULT)")
    parser.add_argument(
        "--curriculum", metavar="PATH", help="track.yaml to run (env: LEARN_CURRICULUM)"
    )
    parser.add_argument(
        "--port", type=int, metavar="N", help="port to serve on (env: LEARN_PORT, default 8765)"
    )
    parser.add_argument(
        "--host",
        metavar="ADDR",
        help="interface to bind (env: LEARN_HOST, default 127.0.0.1; 0.0.0.0 inside a container)",
    )
    parser.add_argument(
        "--no-browser", action="store_true", help="do not open a browser (same as BROWSER=none)"
    )


# ------------------------------------------------------------------ dispatch


def main(argv: list[str] | None = None) -> int:
    config.load_dotenv()
    args = build_parser().parse_args(argv)
    if args.command == "init":
        return cmd_init(args)
    if args.command == "check":
        return cmd_check(Path(args.track))
    if args.command == "schema":
        return cmd_schema(args)
    return cmd_serve(args)


# --------------------------------------------------------------------- serve


def cmd_serve(args: argparse.Namespace) -> int:
    """Set the overrides the flags carry, then hand over to the server."""
    import os

    config.set_overrides(
        vault=args.vault, curriculum=args.curriculum, port=args.port, host=args.host
    )
    try:
        cfg = config.get_config()
    except config.CurriculumNotFound as exc:
        print(f"learn: {exc}", file=sys.stderr)
        return 1
    if not cfg.curriculum.is_file():
        print(f"learn: curriculum file not found: {cfg.curriculum}", file=sys.stderr)
        return 1
    if args.no_browser:
        os.environ["BROWSER"] = "none"
    from .main import serve

    return serve()


# ---------------------------------------------------------------------- init

VAULT_SUBDIRS = ("modules", "sessions")


def cmd_init(args: argparse.Namespace) -> int:
    """Copy a track into the vault as `track.yaml` and make the folders around it."""
    source = Path(args.track).expanduser()
    if not source.is_file():
        print(f"learn init: no such track file: {source}", file=sys.stderr)
        return 1
    if cmd_check(source, quiet=True) != 0:
        print(
            f"learn init: {source} is not a valid curriculum — nothing was copied.\n"
            f"Run `learn check {source}` to see what is wrong.",
            file=sys.stderr,
        )
        return 1

    config.set_overrides(vault=args.vault)
    vault = config.resolve_vault()
    target = vault / config.VAULT_TRACK_NAME
    if target.exists() and not args.force:
        print(
            f"learn init: {target} already exists. Pass --force to replace it "
            "(your notes, attempts and sessions are not touched either way).",
            file=sys.stderr,
        )
        return 1

    vault.mkdir(parents=True, exist_ok=True)
    for name in VAULT_SUBDIRS:
        (vault / name).mkdir(parents=True, exist_ok=True)
    (vault.parent / ".cache").mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)

    track = _parse(source)
    assert track is not None  # cmd_check above already validated it
    print(f"Installed {source} → {target}")
    print(f"  {_summary(track)}")
    print(f"  vault: {vault}")
    print("\nNext: run `learn` and open http://127.0.0.1:8765/")
    return 0


# --------------------------------------------------------------------- check


def cmd_check(path: Path, quiet: bool = False) -> int:
    """Validate one curriculum file. 0 and a summary, or 1 and the failing fields."""
    path = path.expanduser()
    if not path.is_file():
        print(f"learn check: no such file: {path}", file=sys.stderr)
        return 1
    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    except yaml.YAMLError as exc:
        print(f"learn check: {path} is not valid YAML\n  {exc}", file=sys.stderr)
        return 1
    if not isinstance(raw, dict):
        print(
            f"learn check: {path} must be a YAML mapping at the top level, "
            f"found {type(raw).__name__}",
            file=sys.stderr,
        )
        return 1
    try:
        track = Track.model_validate(raw)
    except ValidationError as exc:
        print(f"learn check: {path} is not a valid curriculum", file=sys.stderr)
        for line in _error_lines(exc):
            print(f"  {line}", file=sys.stderr)
        return 1
    if not quiet:
        print(f"{path}: OK — {_summary(track)}")
    return 0


def _error_lines(exc: ValidationError) -> list[str]:
    """`modules.3.checks.0.prompt: Field required` — where it is, then what is wrong."""
    lines = []
    for err in exc.errors():
        where = ".".join(str(part) for part in err["loc"]) or "(top level)"
        lines.append(f"{where}: {err['msg']}")
    return lines


def _parse(path: Path) -> Track | None:
    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        return Track.model_validate(raw)
    except (yaml.YAMLError, ValidationError, OSError):
        return None


def _summary(track: Track) -> str:
    def n(count: int, word: str) -> str:
        return f"{count} {word}{'' if count == 1 else 's'}"

    parts = [
        n(len(track.areas), "area"),
        n(len(track.phases), "phase"),
        n(len(track.modules), "module"),
        n(len(track.checks), "check"),
        n(len(track.capstone), "artefact"),
        f"{track.total_weeks} weeks from {track.start_date.isoformat()}",
    ]
    return ", ".join(parts)


# -------------------------------------------------------------------- schema

SCHEMA_REL = "curriculum/schema.json"


def cmd_schema(args: argparse.Namespace) -> int:
    from .schema import SCHEMA_PATH, render_schema

    out = Path(args.out).expanduser() if args.out else SCHEMA_PATH
    rendered = render_schema()
    if args.check_only:
        current = out.read_text(encoding="utf-8") if out.is_file() else ""
        if current == rendered:
            print(f"{out}: up to date")
            return 0
        print(
            f"learn schema: {out} is out of date. Run `learn schema` to regenerate it.",
            file=sys.stderr,
        )
        return 1
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(rendered, encoding="utf-8")
    print(f"Wrote {out}")
    return 0
