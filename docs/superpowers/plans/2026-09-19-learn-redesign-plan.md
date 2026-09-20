# `learn` redesign — implementation plan

2026-09-19. Source of truth for the design: `learn/docs/ux/redesign/design_handoff_learn_redesign/README.md` (screens, layout, copy, tokens, order of work), `Learn Design System.dc.html` (normative tokens, type, state vocabulary, naming, the three extra states, file verdicts) and `Learn Redesign.dc.html` (the interactive prototype). This plan adds the one thing the handoff does not cover: the data-model change the module workspace needs, and the API contract for the new screens. The v1 spec (`../specs/2026-09-19-learn-lms-design.md`) still governs everything the redesign does not touch (vault layout, ladder rules, AI guardrails, reveal gate).

## 0. What changes, in one paragraph

Four destinations (Desk `/`, The track `/track`, Review `/review` + `/review/weekly`, Shipped `/shipped`); the session moves into the rail foot and can start from a module ("Work here now"); the module page becomes a syllabus of **topics**, each owning its sources, its note and the checks that prove it, with chores and habits in a sidebar; notes open in a **focus mode** (source beside note, timestamp stamping, unfiled jots, pop-out jotter); the check attempt is staged in three moments; session close is the **Wrap up** modal; the weekly review is the **Sunday debrief**; the capstone board is **Things that exist**. New tokens, three self-hosted fonts, and fourteen renames in the UI (API ids do not change).

## 1. Curriculum schema v2 (`curriculum/track.yaml`)

`version: 2`. Everything from v1 stays; additions in bold. The loader must also accept a v1 file (no `topics`) by wrapping each `must_cover` string into a topic of kind `idea` with no resources or checks, and putting unassigned resources/checks into an implicit final topic `other` titled "Also in this module".

```yaml
version: 2
start_date: 2026-09-22
weekly_budget_hours: 12
areas:                                   # exactly six; the Desk ridge columns, in this order
  - {id: transformers, title: Transformers & training, scope: "a1 · a2 · p0"}
  - {id: adapt-serve,  title: Adapt & serve,            scope: "a3 · a4"}
  - {id: context-rag,  title: Context & retrieval,      scope: "a5 · a6"}
  - {id: agents-prod,  title: Agents & production,      scope: "a7 · a8"}
  - {id: evals-found,  title: Evals foundation,         scope: "b0 · b1 · b2 · b3"}
  - {id: evals-prod,   title: Evals in production,      scope: "b4 · b5 · b6 · b7 · b8 · b9 · writeup"}
phases:
  - id: p2
    title: v0 app + evals foundation
    weeks: [9, 14]
    modules: [b0, b1, b2, b3, a5, a6]
    order_note: "Do them in this order: error analysis before judges, judges before the harness."   # NEW, optional
modules:
  - id: a1
    area: transformers                   # NEW, required, one of areas[].id
    ...existing fields...
    topics:                              # NEW; replaces must_cover as the source of truth (must_cover may remain for v1 readers)
      - id: attention                    # unique within the module; used as the note filename
        title: Causal self-attention
        summary: "One head, the mask before the softmax, and the shapes through a multi-head merge."
        kind: idea                       # idea | chore | habit
        resources: [a1-karpathy-gpt, a1-cs336-a1]   # ids from this module's resources; each resource in exactly one topic
        checks: [a1-mha-from-memory]     # ids from this module's checks; each check in exactly one topic
      - id: setup-gpu
        title: Rent a GPU (Modal or RunPod) and run one nanochat step
        kind: chore                      # chores: no resources/checks needed; tickable in the sidebar
      - id: habit-email-course
        title: Start the free 17-part evals email course this week
        kind: habit                      # habits: rendered as a sentence in the sidebar; no state
    resources:
      - id: a1-karpathy-gpt
        ...existing...
        length: 116                      # NEW, optional; defaults to est_minutes
        unit: min                        # NEW, optional; min | pages | items; default min
```

Validation (in `curriculum.py`): every `area` exists; every idea topic has ≥1 check or ≥1 resource; each resource id and check id appears in at most one topic; topic ids unique per module; unassigned resources/checks go to the implicit `other` topic with a warning logged once.

## 2. Vault additions (all written only by `store.py`)

```
vault/modules/<id>/notes/<topic_id>.md      per-topic note; frontmatter {topic, title, updated}; body markdown
vault/modules/<id>/notes.md                 legacy module note; still read; listed under "All notes"
vault/modules/<id>/chores.yaml              {topic_id: {done: true, done_at: ISO}}
vault/modules/<id>/resources.yaml           existing; ADD per resource: position (number, in the resource's unit), position_updated
vault/jots.jsonl                            {id, ts, module_id, topic_id, resource_id?, stamp?, text, filed: false|ISO}
```
Rules: notes are atomic writes with `mtime_ns` concurrency exactly like the module note; the index gets a `notes` row per topic note; jots are append-only with a filed-marker line (same fold-by-id pattern as the error ledger).

## 3. API contract v2 (prefix `/api`; everything not listed is unchanged)

### `GET /desk`  (replaces `/today` on the Desk; keep `/today` working)
```
{
  first_run: bool,                        // no closed session yet
  week_now: int, weeks_total: 40,
  plan: {text: "IF … THEN …", written_on: "Sunday"} | null,
  start_label: "Start · about 2 hours",   // from weekly_budget_hours / sessions-per-week (default 5)
  first_action: {label, module_id, check_id} | null,   // first-run only
  warmup: [{check_id, module_id, prompt, reason, chip: "due"|"new"|"old"|"error"}],   // ≤4 items
  standing: {
    checks_lasting: int, core_total: int,
    artefacts_exist: int, artefacts_total: 8, artefact_note: "the golden dataset is in draft" | null,
    weeks_left: int, weekly_budget: 12, skips_banked: int
  },
  ridge: [{area_id, title, scope, counts: {lasting, solid, shaky, tried, untouched}, delta_4w: int}],
  gains: {lasting_delta_4w, solid_delta_4w, checks_attempted_4w, hours_4w},
  calibration_by_week: [{week, brier}],   // last 8 weeks with ≥3 graded attempts; else []
  newly_proved: [{check_id, module_id, prompt, date, state}],   // last 5 reaching solid/lasting
  hours: {new, review, build, budget},    // this week
  slipping: "7.2 h under budget this week. Under is fine." | "…over…"
}
```
Ridge counts use check ladder states mapped: durable→lasting, proficient→solid, familiar→shaky, attempted→tried, not_started→untouched; core checks only (`must_cover: true`).

### `GET /track`  (replaces `/plan`; keep `/plan` working)
```
{
  start_date, end_date, week_now, weeks_total,
  headline: {lasting_pct, attempted_pct, core_total, lasting_total},
  offset_weeks, offset_from,
  weeks: [{week, state: "past"|"phase"|"current"|"future", phase_id}],
  unfinished: [Row],                                    // modules whose weeks passed with < all core checks solid
  this_phase: {phase_id, title, weeks:[a,b], hours_budget, order_note, rows: [Row]},
  later: [Row]                                          // remaining modules, compressed
}
Row = {module_id, title, track, weeks:[a,b], due: "2026-10-17", tone: "late"|"now"|"later",
       hours_logged, hours_budget, proof: {total, lasting, solid, partial}, proof_text: "1 of 11 lasting",
       warning: "two checks 14 days overdue" | "needs Golden dataset first" | null,
       action: "Resume"|"Open"|"Preview", artefact_state: "draft"|null}
```
`POST /plan/shift` unchanged.

### `GET /modules/{id}`  (extended; existing fields stay)
```
{ ...existing card, resources, checks, capstone, must_cover...,
  area_id, overdue_retests: int, soft_date,
  topics: [{id, title, summary, kind, n, state: "proved"|"in_progress"|"not_started",
            sources: [{...resource row..., position, length, unit, pct, meta: "video · 95 of 116 min", action: "Resume"|"Open"|"Start"|"Notes"}],
            note: {exists, path: "a1/attention.md", excerpt (first 600 chars), updated} ,
            checks: [check rows with state, warning, action],
            proof_text: "0 of 1 solid"}],
  chores: [{topic_id, title, done, done_at}],
  habits: [{topic_id, title}],
  all_notes: [{path, topic_id|null, updated, words}],
  step_summary: "1 proved · 1 in progress · 4 untouched"
}
```
Topic state: `proved` when every check in the topic is proficient or durable (idea topics with no checks: proved when every resource is reconstructed/taught); `in_progress` when any attempt, any resource beyond queued, or a note exists; else `not_started`.

### Topic notes and jots
- `GET /modules/{id}/notes/{topic}` → `{frontmatter, body, mtime_ns, path}`; `PUT` echoes `mtime_ns`; 409 body `{detail, current}` as the module note.
- `PATCH /modules/{id}/resources/{rid}` accepts `position` (and still `state`, `minutes_delta`, `path`); returns the full module.
- `PATCH /modules/{id}/chores/{topic}` body `{done: bool}` → returns the full module.
- `GET /jots?module_id=&unfiled=true` · `POST /jots` `{module_id, topic_id, resource_id?, stamp?, text}` · `POST /jots/file` `{ids: [...], topic_id}` appends the lines to the topic note under a `## Jots` heading (one line each, `- [stamp] text`) and marks them filed → returns the note.

### `GET /review/weekly`  (extended)
Add `hours_last_4_weeks: [{week, new, review, build}]`, `shipped: [{id, title, state}]`, and per calibration bucket `said` (mean confidence) and `was` (observed rate) fields (keep the existing ones). Everything else unchanged.

### Sessions
Unchanged API. The rail foot reads `/sessions/current`. "Work here now" = `POST /sessions/start {module_id}` then stay on the page.

## 4. Frontend map

Tokens and fonts: replace `web/src/styles/tokens.css` with the design-system palette (light and dark, `--on-vio`, `--red-soft/--red-line`, `--shadow`, `--shadow-lg`, the three families). Fonts self-hosted through `@fontsource/playfair-display` (500, 600), `@fontsource/plus-jakarta-sans` (400, 500, 600, 700), `@fontsource/jetbrains-mono` (400, 500), imported in `main.tsx`. Spacing scale 4/6/10/14/18/22/26/38 as `--s1…--s8`; radii 9/11/14/16/20/24 as tokens.

Renames are a single `web/src/labels.ts` map used by every screen; API ids stay (`durable`, `must_cover`, `overconfident_miss`, …).

New components (`web/src/components/`): `Band`, `Row`, `Stat`, `Ridge`, `StepStrip`, `Jotter` (focus mode shell), `WrapUp` (modal), `TopicCard`, `SessionCard` (rail foot). Re-cut: `Rail`, `Chip` (four tones: plain, good, amber, vio), `AttemptFlow` (three stages), `TidyDialog` (restyle, Take all / Revert all, refusal state per §6.1), `NoteEditor` (kept, wrapped by Jotter), `CritiquePanel` (sub-lines under rubric rows, "second opinion"). Delete: `SessionBar`, `ActivityStrip` (inside `HoursBar`), `Today`, `Plan`, `Modules`, `screens/tabs/*`, `Warmup` (folds into the Desk band), `CloseSessionDialog` (replaced by `WrapUp`).

Screens (`web/src/screens/`): `Desk`, `Track`, `Module` (workspace), `Review`, `Debrief`, `Shipped`; overlay `FocusMode` mounted from `Module`; `Attempt` as a route `/modules/:id/checks/:checkId` so the staged flow has its own page.

Routes: `/` Desk · `/track` · `/modules/:id` · `/modules/:id/checks/:checkId` · `/review` · `/review/weekly` · `/shipped`. Old routes (`/plan`, `/modules`, `/capstone`) redirect.

## 5. Work packages and order

| # | Package | Owner | Depends on |
|---|---|---|---|
| A | Backend: schema v2 loader (+ v1 tolerance), topic notes, chores, jots, resource position, `/desk`, `/track`, module v2, weekly additions, tests | Opus agent | this plan |
| C | Curriculum: convert `track.yaml` to v2 (areas, topics with summaries, every resource and check assigned, chores and habits split out of must_cover) | Opus agent | this plan (schema §1); validated later by A's loader |
| B1 | Frontend foundation: tokens, fonts, labels map, Rail + SessionCard, Band/Row/Chip/Stat/Ridge, Desk, Track, Shipped, Debrief, deletions, routes with redirects, vitest | Opus agent | this plan (contract §3) |
| B2 | Frontend workspace: Module (StepStrip, TopicCard, sidebar), FocusMode/Jotter (side-by-side + pop-out, stamps, unfiled jots), staged Attempt route, WrapUp modal (with jot filing), TidyDialog restyle + refusal, conflict and AI-unavailable states | Opus agent | B1 merged |
| D | Integration: reconcile contract, run real app on seeded v2 track, update Playwright (existing flows + capture spec), fix, README, screenshots | Opus agent | A, C, B1, B2 |

A, C and B1 run in parallel. B2 after B1. D last.

## 6. Acceptance

- Every screen in the README reproduced light and dark with the stated copy; `Learn Design System.dc.html` tokens verbatim; no ad-hoc spacing.
- Non-negotiables intact: no streak/points/badges/single progress bar; reference hidden until submit; confidence before writing; AI explicit-only and blocked while an attempt is open; hours amber not red.
- `rm -rf .cache && uv run learn` clean on the v2 track; the v1 fixture track still loads (tolerance path tested).
- pytest, vitest, tsc, Playwright all green; the two spec'd flows plus: start a session from a module, stamp a jot in focus mode and file it at wrap-up, tick a chore, staged attempt end to end.
