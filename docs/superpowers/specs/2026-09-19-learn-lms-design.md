# `learn` — a local, file-first learning tracker for the LLM + evals track

Design spec · 2026-09-19 · approved by the learner in conversation (scope: "evidence-based core").

Research this design rests on: `research/sources/09-learning-science-features.md`, `10-ux-patterns.md`, `11-stack-options.md`. The content it is seeded from: `llm-evals-track.md`.

## 1. Purpose and principles

One self-directed learner (MSc Data Science 2022, oil and gas, 10–15 hrs/week) is following a 40-week track in LLM engineering and AI evaluation. The app runs that track and measures it. It is a single-user, local web app. Nothing leaves the machine except the two explicit AI actions, which call the Anthropic API with the learner's own credential.

The design metaphor, chosen because it is what the learner is studying: **the app is an eval harness for the learner.** Checks are tasks, attempts are trials, rubrics are graders, confidence ratings are judge calibration, the error ledger is error analysis, and a check reaches `durable` the way a system passes requalification: two clean passes, spaced.

Principles (each is backed in `09-learning-science-features.md`):

1. **Files are the truth.** Markdown and YAML in `vault/` are canonical; SQLite is a deletable index. Deleting `.cache/` is a no-op.
2. **Performance during study is not learning.** The app never optimises for the feeling of progress. No streaks, points, badges, single long progress bar, or "mark complete".
3. **A checkbox is not a self-test.** Every "done when you can…" line is a Check with a typed answer, a hidden reference, a confidence rating, and a self-grade. The reference is un-renderable until an answer is submitted; the store enforces this, not the UI.
4. **Durable, not done.** A Check is `durable` only after two passes in separate sessions at least 7 days apart. Module coverage counts Proficient and Durable only.
5. **AI interrogates, critiques, diffs. It never produces.** Two actions only: Tidy (copy-edit with hard invariants and per-hunk review) and Explain-back critique (grades against a rubric, never rewrites). Both are unavailable while an attempt is open.
6. **Boring while working, informative at the bookends.** No live counters mid-session. Calibration, hours and errors appear at session close and in the weekly review.

## 2. Screens

Left rail with five destinations. No nested menus.

### 2.1 Today (default route)
- Top: the **if-then plan** written at the last session close, verbatim, and one **Start session** button. If no plan exists, a short prompt to write one.
- **Next action**, one line, precomputed: earliest due re-test, else the first unattempted Check of the current module, else the current module's next unread resource.
- **Due for review: N** (count only; block hidden when 0).
- **This week**: hours logged vs budget as a stacked bar (new / review / build) with a plain sentence ("3.5 h under budget this week"). Amber, never red.
- **Activity strip**: 40 weeks × 7 days, hours-per-day intensity. No number, no streak.

### 2.2 Plan
- Phases 0–7 as rows; modules as cards inside them with week range, budget vs actual hours, and the module ladder (`not_started`, `attempted`, `familiar`, `proficient`, `durable`), derived from its Checks (see §4.4).
- Headline: **coverage = % of must-cover Checks at proficient or durable**. Sub-figures: attempted %, durable %.
- **Shift schedule** button: moves every soft date by +1 week, effective the next Monday. Stored in `plan.yaml` as an offset in weeks plus the date it applies from.
- Filters: `not started`, `at risk` (proficient but re-test overdue), `blocked` (module's prerequisite phase below familiar).

### 2.3 Module page, five tabs, one route `/modules/:id`
1. **Overview**: must-cover topics, resources summary, hours budget vs actual (amber on overrun), soft date, per-module shift.
2. **Resources**: rows of title, kind (`paper` / `video` / `course` / `repo` / `doc` / `book`), state ladder `queued → skimmed → read → reconstructed → taught`, minutes logged, optional local path. Only `reconstructed` and `taught` count toward the module. Kind `paper` rows show a Keshav template link that inserts a stub into the note (five Cs, the one equation, what I'd have to implement, nearest-neighbour paper, three things I couldn't follow).
3. **Notes**: the editor (§6). Autosave on a 1.5 s debounce. AI menu with Tidy and Explain-back (Explain-back is reached from a Check, see below, but also listed here for discoverability with a link).
4. **Checks**: the done-when list as Check cards. Each shows prompt, type, ladder state, next due, last score, attempt count. Clicking opens the attempt flow (§4).
5. **Capstone**: artefacts assigned to this module, with state `not_started / draft / working / reviewed / done` and an optional path or commit reference. Not counted in coverage.

### 2.4 Review
- **Due now**: the re-test queue, sorted by overdue days then by `overconfident_miss` flag. Time-boxed: shows the first 4; "show more" for the rest.
- **Weekly review** (a separate sub-route, `/review/weekly`), six blocks in order: cold retrieval sweep (10 items across modules touched, weighted to overconfident misses and modules untouched ≥3 weeks), calibration readout (Brier score + reliability table by confidence bucket, one sentence), error ledger triage (each unresolved error: resolve with text, or convert to a Check), hours vs budget and burn-up (modules durable vs planned by week), capstone board, replan (edit next week's scope; write the week's if-then plans). A "weeks on plan" counter with two banked skips per quarter is shown here and nowhere else.

### 2.5 Capstone
The eight capstone artefacts from the track (golden dataset, failure taxonomy, evaluators + calibration report, harness with CI gate, RAG/agent metrics, safety slice, model-swap requalification, write-up) with state, linked modules, notes field, and next action. The only long-horizon progress view.

## 3. Session flow

- **Start session** (from Today): choose module (defaults to next action's module), start timer, create `vault/sessions/<YYYY-MM-DD>-<n>.md`. Then **warm-up**: 5–8 items drawn as 3 due re-tests (or unattempted checks if none due) + 1 from the last session's module + 1 from a module ≥4 weeks old + 1 unresolved error. Each is a short typed answer with self-grade; it records an attempt like any Check. Warm-up can be skipped with one click; skipping is logged.
- **Work**: the module page. The timer shows elapsed minutes and current phase tag (`new` / `review` / `build`), switchable by the learner. AI actions available except while an attempt is open. Cap: after 3 h elapsed the app prompts to close; it does not block.
- **Close session** (required to stop the timer, but the timer can be abandoned via "discard session"): three fields, all required to close: (a) reflection, min 40 words: what changed in my understanding, what I still can't do; (b) next if-then plan in a forced template with two inputs, `IF <cue>` and `THEN I will <first 10 minutes>`; (c) optional errors to log (each requires a diagnosis). Fatigue rating 1–5. Minutes by phase append to the module's actuals.

## 4. Checks and attempts

### 4.1 Check definition (from `track.yaml`)
```yaml
- id: a1-mha-from-memory
  module: a1
  type: code            # explain | code | derive | judge | numeric
  must_cover: true      # counts toward coverage
  prompt: "Write multi-head causal self-attention from memory with a correct mask and correct shapes."
  rubric:
    - "Scaled dot-product with 1/sqrt(d_k)"
    - "Causal mask applied before softmax with -inf, not after with 0"
    - "Heads split and merged with correct reshape/transpose order"
    - "Output projection applied"
  reference: |            # markdown; hidden until an attempt is submitted
    ```python
    ...
    ```
  known_prior: false    # true = pre-credited from the MSc; still must be passed cold to count
  est_minutes: 30
```

### 4.2 Attempt flow
1. Open the Check. Show prompt and type. Reference hidden. For `code` type the editor has paste disabled and no autocomplete.
2. **Confidence before answering**: slider 0–100, required.
3. Type the answer. Timer runs (informational).
4. **Submit** → answer frozen; the rubric appears; learner self-grades each rubric line met / partial / missing and picks an overall score `cant / partial / fluent` (0/1/2). Only now does the reference render.
5. If score < fluent: the diff-diagnosis field appears, required, plus an error category from a fixed list: `notation_shape`, `misremembered_mechanism`, `conflated_two_things`, `off_by_one_masking`, `statistical_reasoning`, `api_library`, `didnt_know`. This writes an error-ledger entry.
6. Optional: **Explain-back critique** (AI) on the submitted answer (§7.2).
7. Save attempt file. Compute the next due date (§4.3).

### 4.3 Ladder and scheduling (computed, never stored)
- Ladder steps in days: `[2, 7, 21, 60]`.
- A `fluent` attempt advances one step and sets `next_due = attempt_date + step`. A `partial` keeps the step and sets `next_due = +2`. A `cant` resets to step 0 and sets `next_due = +2`.
- `overconfident_miss` = `confidence_pre >= 80 and score == cant` → flag on the attempt; next due forced to +2 and the item is sorted first in the queue.
- **Durable** = two `fluent` attempts in different sessions with ≥7 days between them, and no `cant` after the earlier of the two. Once durable, `next_due = +60` maintenance.
- Warm-up attempts count. Attempts made while an AI critique was used still count, but a Check whose latest attempt used the Socratic-style help cannot be durable (v1 has no Socratic mode, so this is a stored flag reserved for later).

### 4.4 Derived states
- Check ladder state: `not_started` (no attempts), `attempted` (any attempt, latest score cant), `familiar` (latest partial), `proficient` (latest fluent, not yet durable), `durable`.
- Module ladder state: the minimum state across `must_cover` Checks, except `not_started` only if none attempted.
- Coverage = proficient-or-durable must-cover Checks ÷ all must-cover Checks.

## 5. Data layout

```
learn/
  pyproject.toml            uv project; script `learn` starts the server and opens the browser
  src/learn/                FastAPI app (see §8)
  web/                      Vite + React + TS (see §6)
  curriculum/track.yaml     seeded content (§5.3)
  vault/                    learner data, git repo (auto-initialised on first run if absent)
    plan.yaml               start_date, offset_weeks, offset_from, weekly_budget_hours
    capstone.yaml           artefact states
    errors.jsonl            error ledger, append-only
    ai-log.jsonl            every AI call
    modules/<module_id>/
      notes.md              frontmatter: title, status, tags, updated
      resources.yaml        {resource_id: {state, minutes, path}}
      attempts/<check_id>--<ISO8601>.md
    sessions/<YYYY-MM-DD>-<n>.md
  .cache/index.sqlite       derived
  tests/
```

### 5.1 Attempt file
```markdown
---
check_id: a1-mha-from-memory
session_id: 2026-10-03-1
started: 2026-10-03T19:02:11+04:00
submitted: 2026-10-03T19:31:40+04:00
confidence_pre: 70
score: partial              # cant | partial | fluent
rubric: [met, missing, met, met]
category: off_by_one_masking
ai_critique_used: true
warmup: false
---
## Answer
(the learner's text, verbatim)

## Diagnosis
I applied the mask after softmax with zeros instead of -inf before it.
```

### 5.2 Session file
```markdown
---
id: 2026-10-03-1
module_id: a1
started: 2026-10-03T19:00:00+04:00
closed: 2026-10-03T21:35:00+04:00
minutes: {new: 95, review: 20, build: 40}
fatigue: 3
warmup_skipped: false
---
## Reflection
...
## Next session
IF it is Sunday after breakfast
THEN I will re-derive the attention gradient on paper for 10 minutes
```

### 5.3 Curriculum file (`track.yaml`)
```yaml
version: 1
start_date: 2026-09-22
weekly_budget_hours: 12
phases:
  - id: p0
    title: Orient & set up
    weeks: [1, 2]
    modules: [p0-orient]
  ...
modules:
  - id: a1
    phase: p1
    track: llm            # llm | evals | shared
    title: Transformers from scratch
    weeks: [3, 8]
    budget_hours: 70
    prerequisites: [p0-orient]
    must_cover:
      - Causal self-attention
      - BPE tokenization
      ...
    resources:
      - id: a1-karpathy-gpt
        title: "Karpathy, Let's build GPT"
        kind: video
        url: https://...
        est_minutes: 480
    checks: [...]           # §4.1
capstone:
  - id: cap-golden-set
    title: Golden dataset
    modules: [b2]
    description: ...
```
Rubrics and reference answers in the seeded file are AI-drafted from the track's sources and carry `draft: true`; the Check card shows a "draft reference, verify" badge until the learner edits the YAML and removes the flag.

### 5.4 Index and anti-drift rules
- Only `store.py` writes to `vault/`. Atomic writes via temp file + `os.replace`.
- `GET` note returns `mtime_ns`; `PUT` must echo it; mismatch → 409 with the current content.
- Index tables: `files(path, mtime_ns, size, hash)`, `attempts`, `sessions`, `resources`, `checks_state` (derived), `notes_fts`. Rebuilt on startup by comparing (path, mtime, size); `watchfiles` on `vault/` invalidates rows and pushes an SSE `changed` event.
- No code path writes from the index back to files.
- Git: on first run, if `vault/` is not a repo, `git init` it. Before applying any AI edit and at every session close, `git add -A && git commit -m "<reason>"` inside `vault/`. If `git` is missing, fall back to `.cache/backups/<path>/<ts>.md` (keep 20) and show a notice.

## 6. Frontend

- Vite 8, React 19, TypeScript 7, zustand, plain CSS with custom properties (no Tailwind), served in production from `src/learn/static` via `StaticFiles(html=True)`. Dev: `npm run dev` proxies `/api` to `127.0.0.1:8765`.
- Editor: CodeMirror 6 with `@codemirror/lang-markdown`, source mode. Live preview pane rendered with `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex`; code blocks via Shiki (`createHighlighterCore`, Python, TypeScript, bash, JSON, YAML, SQL only); ```mermaid fences lazily load Mermaid 12. Preview is toggleable side-by-side or below.
- Diff review for Tidy: `@codemirror/merge` `MergeView` with per-chunk accept/revert; global Accept all / Reject all / Keep original (Escape).
- Code-type Check editor: CodeMirror with paste handler blocked and no completion extensions.
- Theme: light and dark via `prefers-color-scheme`; tokens in one CSS file. Typeface stack: system UI for chrome, a monospace for code. Keep the visual language quiet; the notes and checks are the content.
- Accessibility: every control keyboard-reachable; focus rings visible; no colour-only state (state chips carry text).

## 7. AI actions

Both go through `src/learn/ai.py`, the only module that imports `anthropic`. Client is built lazily; a missing credential never crashes startup. `GET /api/health` reports `ai_available` and `ai_reason`; the UI greys the buttons with the reason. Model `claude-opus-5`, `thinking={"type":"adaptive"}`, `output_config={"effort": ...}`, `client.beta.messages.stream(...)` with `betas=["server-side-fallback-2026-07-01"]`, `fallbacks="default"`, system block with `cache_control`. Handle `stop_reason` `refusal` and `max_tokens`. Map SDK errors to one human sentence each (401, 404, 429, 5xx, connection). Every call appends `{ts, mode, target, input_tokens, output_tokens, tokens_added, accepted}` to `vault/ai-log.jsonl`.

### 7.1 Tidy (`POST /api/ai/tidy`, SSE)
- Input: `{module_id, text}` where text is the note body (no frontmatter) or a selection.
- System prompt: copy-edit only; may fix spelling, punctuation, heading levels, list markers, code fences and language tags, LaTeX delimiters, paragraph breaks, exact duplicate sentences. Must not add, remove or alter any claim, fact, number, name, example, citation; must not improve wording, standardise terminology, reorder content, or expand contractions; preserve voice and hedges. Effort `medium`. `max_tokens` 32000.
- **Invariant checker** (pure function, `src/learn/invariants.py`, runs server-side before the `done` event): parse input and output with a markdown parser; compare as multisets: fenced code block contents, inline code spans, `$…$` and `$$…$$` contents, URLs, numbers (regex, excluding list markers and heading levels), checklist items with state, blockquote lines. If any differ → emit `event: rejected` with the specific reason and do not emit `done`. Also compute the share of output word tokens not present in the input; if > 10% → rejected with reason. Emit `event: stats` with tokens added.
- UI: stream into a shadow buffer, then open the MergeView; nothing touches the file until the learner accepts; accept issues the normal `PUT` after a `POST /api/vault/snapshot` git commit.

### 7.2 Explain-back critique (`POST /api/ai/critique`, SSE)
- Input: `{attempt_path}`. Server loads the attempt; refuses with 409 unless `submitted` is set.
- Prompt: given the Check prompt, the rubric, the reference (as a key, marked "do not quote"), and the learner's answer; return per-rubric-line `met | partial | missing` with a short quotation from the learner's own answer as evidence and one line naming what is missing, without supplying the missing content. Effort `high`. Structured output via `output_config.format` JSON schema; parsed server-side; streamed as one `done` event.
- UI: renders beside the learner's self-grade so the two can be compared; the learner's self-grade remains the recorded score (the AI does not grade).

### 7.3 Availability rules
- `POST /api/ai/*` returns 423 while any attempt is open (started, not submitted) in the current session.
- No inline suggestions, no chat box, no autocomplete anywhere.

## 8. Backend

FastAPI 0.141, uvicorn, pydantic 2, python-frontmatter, pyyaml, watchfiles, anthropic ≥1.7,<2. Python ≥3.12 via uv. Bind `127.0.0.1:8765`.

Modules: `main.py` (app, static mount last, browser open), `config.py` (paths), `curriculum.py` (load + validate `track.yaml`), `store.py` (single writer), `index.py` (rebuild, watch), `ladder.py` (pure scheduling/state functions), `queue.py` (review and warm-up selection), `invariants.py`, `ai.py`, `git.py`, `routers/`.

Endpoints (prefix `/api`):

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | `{ok, ai_available, ai_reason, vault_git: bool}` |
| GET | `/curriculum` | parsed track |
| GET | `/plan` | phases, modules with derived state, coverage, offsets |
| POST | `/plan/shift` | `{weeks}` → updates `plan.yaml` |
| GET | `/modules/{id}` | module + resources state + checks state + hours |
| GET / PUT | `/modules/{id}/note` | `{frontmatter, body, mtime_ns}`; PUT echoes `mtime_ns`, 409 on mismatch |
| PATCH | `/modules/{id}/resources/{rid}` | `{state?, minutes_delta?, path?}` |
| GET | `/checks/{id}` | prompt, type, rubric, state, attempts (reference omitted) |
| POST | `/checks/{id}/attempts` | start: `{session_id, confidence_pre}` → attempt path |
| POST | `/attempts/submit` | `{attempt_path, answer, rubric, score, category?, diagnosis?}` → returns reference |
| GET | `/review/due` | queue |
| GET | `/review/weekly` | calibration, errors, hours, burn-up, weeks-on-plan |
| GET | `/sessions/current` · POST `/sessions/start` · POST `/sessions/close` · POST `/sessions/discard` · PATCH `/sessions/current` (phase switch) | session lifecycle |
| GET | `/sessions/warmup` | warm-up items for the current session |
| GET / POST / PATCH | `/errors` | ledger read, append, resolve |
| GET / PATCH | `/capstone` | artefact states |
| GET | `/today` | plan text, next action, due count, week hours, activity strip |
| POST | `/vault/snapshot` | git commit with message |
| POST | `/ai/tidy` · POST `/ai/critique` | SSE |
| GET | `/events` | SSE file-change notifications |

## 9. Testing

pytest (~15): store round-trip and atomic write; note `PUT` with stale `mtime_ns` → 409; index rebuild after `rm -rf .cache` yields identical `/plan`; external file edit reflected after rebuild; reveal gate (reference absent from `GET /checks/{id}` and from the attempt-start response; present only in the submit response); ladder scheduling table-driven cases incl. durable and overconfident miss; invariant checker with hand-written before/after pairs (code block mangled, math rewritten, number changed, checklist dropped, >10% new tokens); AI error mapping with a monkeypatched client; `423` while an attempt is open.
Vitest (3–5): ladder state display, MergeView accept path updates buffer, markdown preview renders KaTeX and a Shiki block.
Playwright (2): edit note → reload → persisted; Tidy with stubbed route → merge view → accept → PUT called → reject → unchanged.
Manual smoke before each release: `rm -rf .cache && uv run learn`.

## 10. Build order

1. Backend core (store, curriculum loader with a small fixture, index, ladder, queue, routers, tests).
2. Frontend shell (rail, Today, Plan, Module tabs, notes editor with preview, typed API client from §8) — can run in parallel with 1 against the API contract.
3. Checks/attempts/sessions/errors/review/capstone end to end.
4. AI actions, invariants, MergeView, git snapshot.
5. Seed `track.yaml` from `llm-evals-track.md` and the source reports: all phases, modules, resources, capstone, and every done-when line as a Check with a rubric and a draft reference.
6. Integration: run, Playwright, fix, README with the one-command start and credential setup (`ANTHROPIC_API_KEY` or `ant auth login`).

## 11. Out of scope for v1 (recorded for later)
FSRS atomic flashcards; video player with enforced pauses; spoken explain-back; concept prerequisite graph; Socratic unstick mode; "ask me questions" mode; Ollama adapter; mobile layout.
