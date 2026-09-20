# learn

A local, single-user web app that runs a **track** — a curriculum you write, in any
subject — and measures whether it is actually working. The app is an eval harness for the
learner: every "done when you can…" line in the curriculum
is a **Check** with a typed answer, a hidden reference, a confidence rating taken *before*
answering, and a self-grade taken after. Attempts are trials, rubrics are graders,
confidence ratings are judge calibration, and the error ledger is error analysis. A Check
reaches `durable` the way a system passes requalification — two clean passes in separate
sessions at least seven days apart.

It deliberately refuses to optimise for the feeling of progress: no streaks, no points, no
badges, no single percent-complete bar, no "mark as complete". What is yours is counted only
in core checks at **solid** or **lasting**, and in artefacts that exist. Files are the truth —
everything lives as Markdown and YAML in `vault/`, which is a git repository the app commits
to at each session close; `.cache/` is a derived SQLite index you can delete at any time.
Nothing leaves your machine except the two explicit AI actions, which use your own Anthropic
credential.

## The screens

Four places, and the session lives in the rail foot rather than in a bar across the top.

| Where | Route | What it is for |
| --- | --- | --- |
| **Desk** | `/` | What to do tonight: the plan you wrote last time, the warm-up, and — for anyone who scrolls — what the months so far have actually bought. |
| **The track** | `/track` | The whole calendar: what you left unfinished, the phase you are in, and the rest compressed. |
| **Review** | `/review` | Checks due for a re-test, most overdue first. |
| **Weekly debrief** | `/review/weekly` | The cold sweep, how well you know what you know, mistakes worth keeping, next week. Named for the curriculum's `debrief_day` — "Sunday debrief" by default. |
| **Shipped** | `/shipped` | The capstone artefacts. Each one exists or does not — there is no percentage. |

A module (`/modules/:id`) is one page, not five tabs. It is a syllabus of **topics**: each
topic owns its sources, its note and the checks that prove it. Alongside the syllabus, a
sidebar holds the **chores** (set-up, once — tick them off), the session habit as a sentence,
the hours as a budget, and the note files on disk.

**Focus mode** opens from any topic's note: the source on the left with a position you can
stamp into the note, the note on the right, and the **jots** you dump mid-video underneath.
Jots stay unfiled until the wrap-up folds them into the topic note under `## Jots`. A pop-out
jotter floats over the source when you want the whole width for the video.

A check attempt (`/modules/:id/checks/:checkId`) is three moments:

1. **How sure** — the confidence slider. It cannot be skipped; it is the only thing that
   makes the calibration readout mean anything.
2. **Write** — the editor, from memory. Paste and autocomplete are off for code checks.
   **Submit and freeze** ends it: the answer is final from that moment.
3. **Compare** — freezing is what reveals the reference, side by side with what you wrote.
   You mark each rubric line yourself; the AI can give a second opinion beside your mark but
   never replaces it. **Record and move on** writes the grade and returns to the topic.

Closing a session is the **Wrap up** sheet: forty words on what changed, an IF/THEN plan for
next time (the first thing you will see on the Desk), anything you got wrong that is not
already logged, and how spent you are. Nothing closes without all three.

## Start

```bash
uv run learn init --track ../tracks/llm-engineering-and-evals/track.yaml
uv run learn        # http://127.0.0.1:8765, opens a browser
```

`learn init` copies a track into the vault as `vault/track.yaml` and creates the folders
around it; it refuses to overwrite an existing one without `--force`. After that, `learn`
on its own is the whole thing.

```bash
uv run learn --port 8798 --no-browser          # somewhere else, quietly
uv run learn --curriculum ../tracks/starter/track.yaml   # run a track without installing it
uv run learn --vault ~/other-subject/vault     # a second subject, a second vault
uv run learn check ../tracks/starter/track.yaml          # validate a curriculum
uv run learn schema                            # regenerate curriculum/schema.json
```

`BROWSER=none uv run learn` still skips the browser, and `--no-browser` is the flag for it.
`LEARN_PORT` is the environment form of `--port`.

The tracks that ship with the repo are under `../tracks/`: `starter` (a commented
template), `linear-algebra` (a worked example in a different subject), and
`llm-engineering-and-evals` (the flagship, 40 weeks). Writing your own is
`docs/curriculum-schema.md` at the repo root.

On first run the app creates `vault/`, seeds `vault/plan.yaml` from the curriculum's start
date and weekly budget, and runs `git init` inside `vault/` if it is not already a repo. If
`git` is not installed it falls back to timestamped copies under `.cache/backups/` (keeping
the last 20) and says so in the UI. `.cache/` is disposable: `rm -rf .cache` and restart,
and the index rebuilds from the files with identical results.

## AI actions (optional)

Two actions exist and only two: **Tidy** (copy-edit a note under hard invariants, reviewed
as a diff before anything touches the file) and a **second opinion** (grades an answer you
have already frozen against its rubric; it never rewrites and never replaces your own score).
Both are unavailable while an answer is open — freezing the answer is what unlocks them.

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # or:
ant auth login                        # check with: ant auth status
```

**Everything else works fully without a credential.** Notes, Checks, attempts, scheduling,
sessions, review and the capstone board never call out. With no credential the two AI menu
entries are disabled — not hidden — with the reason shown, and `GET /api/health` reports
`ai_available: false`. Every AI call, including a refused or rejected one, is appended to
`vault/ai-log.jsonl`.

## Your data

```
vault/                       git repo, auto-initialised
  track.yaml                 your curriculum, put here by `learn init`
  plan.yaml                  start date, week offset, weekly budget
  capstone.yaml              artefact states
  errors.jsonl               error ledger, append-only
  ai-log.jsonl               every AI call
  jots.jsonl                 lines jotted in focus mode, append-only, filed into notes
  modules/<id>/notes/<topic>.md  one note per topic (frontmatter + markdown)
  modules/<id>/notes.md      the older whole-module note; still read, still listed
  modules/<id>/chores.yaml   which set-up chores are ticked, and when
  modules/<id>/resources.yaml  per-resource state, minutes, position, local path
  modules/<id>/attempts/*.md   one file per attempt, answer frozen at stage 2
  sessions/*.md              reflection and the next if-then plan
```

### Where the curriculum comes from

In order, first hit wins:

1. `learn --curriculum PATH`
2. `LEARN_CURRICULUM`
3. `<vault>/track.yaml` — what `learn init` writes; the normal case
4. `learn/curriculum/track.yaml`, the legacy in-repo copy, if it still exists
5. otherwise an error naming `learn init`

The vault resolves the same way: `--vault` → `LEARN_VAULT` → `./vault`.

### Editing notes in another editor

Safe, and expected — the files are the point. The app watches `vault/` and refreshes when
something changes underneath it. The one rule: a note `PUT` must echo the `mtime_ns` it was
loaded with, so if you edit `notes.md` in another editor while the app has it open, the
app's next autosave is **refused with a 409** rather than overwriting you. The editor then
shows a refusal with three exits, each named for what it destroys — keep mine and overwrite
the file, reload the file and lose my edits, or show me the difference first. Nothing is lost
silently either way. Reload whenever in doubt.

## Editing the curriculum

`vault/track.yaml` holds areas, phases, modules, topics, resources, capstone artefacts and
every Check. Edit it in place and reload the page; it is re-parsed and validated whenever
the file's mtime changes, and a validation error surfaces rather than being swallowed.
`uv run learn check vault/track.yaml` validates it from the command line and prints the
path to the failing field rather than a traceback.

Every field, with its default, is documented in `docs/curriculum-schema.md` at the repo
root; `curriculum/schema.json` is the same thing as JSON Schema, generated from the
pydantic models by `learn schema` and kept in sync by `tests/test_cli_schema.py`.

Rubrics and reference answers in the seeded file were AI-drafted from the track's sources
and carry `draft: true`. The check shows **"reference not yet checked by you"** for as long
as that flag is set. When you have read a reference and satisfied yourself that it is
correct, delete the `draft: true` line from that Check and the badge disappears. Editing a
Check's `id` starts its history over — attempts are keyed by id — so rename deliberately.

## Dev mode

```bash
uv run uvicorn learn.main:app --reload     # API on :8765
cd web && npm run dev                      # Vite on :5173, proxies /api to :8765
```

The production build is served by the Python app from `src/learn/static`:

```bash
cd web && npm run build
```

## Tests

```bash
uv run pytest -q                    # backend
cd web && npm test                  # vitest
cd web && npx tsc -b                # typecheck
cd web && npx playwright test       # browser flows, against a temp vault
cd web && npx playwright test -c playwright.ux.config.ts   # screenshot capture
```

Playwright drives the built app (run `npm run build` first) on port **8799** against a
throwaway vault under `/tmp` and the flagship track named explicitly in `LEARN_CURRICULUM`
— never port 8765 and never your own `vault/` — and stubs every AI call, so it never needs
a credential. Both configs start that server themselves. The
capture run writes every screen, light and dark, to `docs/ux/screens-v2/`.

Smoke test before a release: `rm -rf .cache && uv run learn`.

The design this implements is `docs/superpowers/specs/2026-09-19-learn-lms-design.md`; the
redesign of the screens is `docs/superpowers/plans/2026-09-19-learn-redesign-plan.md` and the
hand-off it was drawn from, under `docs/ux/redesign/`. `docs/api-v2-notes.md` records the
decisions the API contract left open.

### The words on the screen

The UI says `lasting` where the API says `durable`, `solid` for `proficient`, `shaky` for
`familiar`, `tried` for `attempted`, `core` for `must_cover`, and `missed while sure` for
`overconfident_miss`. Ids on the wire never change; `web/src/labels.ts` is the one place the
renames live.

## Mac app icon

`python3 tools/make_mac_app.py` builds two small app bundles in `~/Applications`:

- **learn.app** — starts the server in the background if it is not running (log in `.cache/learn.log`), waits for it, and opens the browser. If it is already running, it just opens the browser. Drag it to the Dock.
- **Stop learn.app** — stops the server on port 8765.

Re-run the script if you move the project folder or `uv` changes location. The icon is rendered from `tools/icon.html` with the project's Playwright.
