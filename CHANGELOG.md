# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While the major version is `0`, the vault layout and the curriculum schema may change
in a minor release; each such change will be listed here under **Changed**.

## [Unreleased]

Nothing yet.

## [0.1.0] - 2026-09-20

### Added

- The app: a local, single-user FastAPI + React study tracker. Desk, track calendar, module
  workspace with focus mode, review queue, weekly debrief, and a capstone board.
- Checks as typed self-tests — confidence captured before the answer, the reference
  un-renderable until the answer is frozen, self-graded against a rubric, and a re-test
  ladder at 2 / 7 / 21 / 60 days. `lasting` requires two clean passes at least seven days
  apart.
- An error ledger and session bookends: a warm-up from last time's plan, and a wrap-up that
  will not close without a reflection, an IF/THEN plan and an energy reading.
- File-first storage: everything is Markdown and YAML in a git repository the app commits to
  at each session close. `.cache/` is a derived SQLite index that can be deleted at any time.
- Two optional AI actions, both requiring your own `ANTHROPIC_API_KEY` and both refusing to
  run on an unfrozen answer: copy-edit a note as a reviewed diff, and a second opinion on a
  frozen answer. Every call, including refused ones, is appended to `vault/ai-log.jsonl`.
- The `learn` CLI: `learn` (serve), `learn init --track`, `learn check`, `learn schema`,
  with `--vault`, `--curriculum`, `--port` and `--no-browser`.
- Curriculum resolution order: `--curriculum` → `LEARN_CURRICULUM` → `<vault>/track.yaml` →
  the legacy `learn/curriculum/track.yaml` → an error naming `learn init`.
- Three tracks that ship with the repo: `tracks/starter` (a commented template),
  `tracks/linear-algebra` (a worked example in another subject), and
  `tracks/llm-engineering-and-evals` (the flagship, forty weeks, with its research).
- `learn/curriculum/schema.json`, exported from the pydantic models by `learn schema` and
  kept in sync by a test; the prose reference is `docs/curriculum-schema.md`.
- `Dockerfile` and `docker-compose.yml`, with one bind mount for the vault.
- MIT licence, CI, contributing guide, code of conduct and issue templates.

[Unreleased]: https://github.com/Ihjas-tk/study-harness/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Ihjas-tk/study-harness/releases/tag/v0.1.0
