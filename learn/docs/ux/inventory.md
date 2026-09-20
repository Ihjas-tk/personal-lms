# `learn` — component and style inventory

Factual record of the UI as it exists at the time of capture. Paths are relative to
`web/`. API field names are the ones the client declares in `src/types.ts`.

Screenshots of every screen and state listed here are in `screens/`.

---

## 1. Routes and screen components

The router is `react-router` v7 in `src/App.tsx`. The shell is a two-column CSS grid:
a fixed rail plus a single `<main>` column capped at `--maxw` (66rem).

| Route | Screen component | File |
| --- | --- | --- |
| `/` | `Today` | `src/screens/Today.tsx` |
| `/plan` | `Plan` | `src/screens/Plan.tsx` |
| `/modules` | `Modules` | `src/screens/Modules.tsx` |
| `/modules/:id` | `Module` (+ five tabs) | `src/screens/Module.tsx` |
| `/review` | `Review` | `src/screens/Review.tsx` |
| `/review/weekly` | `WeeklyReview` | `src/screens/WeeklyReview.tsx` |
| `/capstone` | `Capstone` | `src/screens/Capstone.tsx` |
| `*` | redirect to `/` | `src/App.tsx` |

`App` also mounts, outside the routes:

- `Rail` — always.
- `SessionBar` — whenever `session` is non-null.
- `Warmup` — replaces the whole routed area while `warmup && session`.
- `CloseSessionDialog` — while `closing`.

### 1.1 `App` (`src/App.tsx`)

Renders the shell, owns three pieces of cross-screen state: `dueCount` (from
`GET /api/review/due`), `closing`, `warmup`. On mount it calls `loadHealth()`,
`loadSession()` and subscribes to `GET /api/events` (SSE `changed`), bumping
`vaultRevision` on every file change. `begin(moduleId)` starts a session, flips into
the warm-up and navigates to the module.

API used: `GET /api/review/due`, `GET /api/health`, `GET /api/sessions/current`,
`POST /api/sessions/start`, `GET /api/events`.

### 1.2 `Today`

Renders: `h2 "Today"`; sub-line; a card holding the last session's if-then plan (or
the no-plan message) and the session button; `h3 "Next action"` card; conditional
`h3 "Due for review"` card; `h3 "This week"` card holding `HoursBar`; `h3 "Activity"`
card holding `ActivityStrip`.

API data (`GET /api/today` → `Today`): `plan_text`, `next_action.{label, module_id,
check_id, resource_id, kind}`, `due_count`, `week_hours.{new, review, build, budget}`,
`activity[].{date, hours}`. Also reads `session` from the store to swap the button
label. Re-fetches on `vaultRevision`.

### 1.3 `Plan`

Renders: `h2 "Coverage NN%"` with the shift button on the same row; a sub-line with
attempted/durable percentages and, when non-zero, the schedule offset sentence; a
four-button filter group; then one `<section>` per phase with an `h3` (phase title +
week range) and a `.grid` of `ModuleCard`s. Phases with no surviving module render
nothing.

`ModuleCard` (same file) renders the module title as a link, a `LadderChip`, a
muted line (`weeks a–b · track · soft date`), and a chip row.

API data (`GET /api/plan` → `Plan`): `coverage`, `attempted_pct`, `durable_pct`,
`offset_weeks`, `offset_from`, `phases[].{id, title, weeks, modules[]}`; each module
uses `id, title, weeks, track, soft_date, state, actual_hours, budget_hours,
coverage, at_risk, blocked`. Write: `POST /api/plan/shift {weeks: 1}`.

### 1.4 `Modules`

Renders: `h2 "Modules"`, sub-line, one table. Columns: Module (link), Phase, Weeks
(mono), Hours (mono `actual/budget`), State (`LadderChip`). Rows are every module of
every phase, flattened in plan order.

API data: `GET /api/plan` → `phases[].modules[].{id, title, weeks, actual_hours,
budget_hours, state}` plus `phases[].title`.

### 1.5 `Module`

Renders: a `row spread` with the module title (`h2`) and a `LadderChip`; a sub-line
`weeks a–b · track · phase id`; a `role="tablist"` of five `button.tab`s; then the
selected tab panel. The active tab lives in the `?tab=` query parameter
(`overview | resources | notes | checks | capstone`, defaulting to `overview`);
switching a tab also deletes `?check=`.

Blanks to `Loading module…` only when `:id` changes; a vault `changed` event
refreshes data in place so the notes editor is not torn down mid-autosave.

API data: `GET /api/modules/:id` → `ModuleDetail` (see tabs below).

### 1.6 Module tabs

| Tab | Component | File |
| --- | --- | --- |
| Overview | `OverviewTab` | `src/screens/tabs/OverviewTab.tsx` |
| Resources | `ResourcesTab` | `src/screens/tabs/ResourcesTab.tsx` |
| Notes | `NotesTab` | `src/screens/tabs/NotesTab.tsx` |
| Checks | `ChecksTab` | `src/screens/tabs/ChecksTab.tsx` |
| Capstone | `ModuleCapstoneTab` | `src/screens/tabs/ModuleCapstoneTab.tsx` |

**`OverviewTab`** — four cards: `h4 "Must cover"` (bulleted `must_cover[]`),
`h4 "Hours"` (chips + an over-budget sentence), `h4 "Schedule"` (`weeks`,
`soft_date`, `offset_weeks`), `h4 "Resources"` (`resources.length` and the count in
`reconstructed`/`taught`). Read-only.

**`ResourcesTab`** — one table: Resource (title, linked to `url` when present; a
"Keshav template" sub-link for `kind === "paper"`), Kind, State (`ResourceChip` plus a
`<select>` of the five ladder states), Minutes (mono count plus `+15`, `+30`, `+60`
buttons), Path (mono, `—` when null). Exports `KESHAV_STUB`, the three-pass note
template inserted by `NotesTab`.

API data: `resources[].{id, title, kind, url, state, minutes, path}`.
Write: `PATCH /api/modules/:id/resources/:rid` with `{state | minutes_delta | path}`;
the response replaces the whole `ModuleDetail`.

**`NotesTab`** — optional Keshav banner (when `?keshav=` is set), optional notice
banner, then `NoteEditor` with an `AiMenu` toolbar, then `TidyDialog` when open.
Accepting a tidy runs `POST /api/vault/snapshot`, re-reads the note for a fresh
`mtime_ns`, then `PUT`s.

API: `GET/PUT /api/modules/:id/note`, `POST /api/vault/snapshot`, `POST /api/ai/tidy`
(through `TidyDialog`).

**`ChecksTab`** — either the `AttemptFlow` (when `?check=` is set) or a `.stack` of
`CheckCard`s. Each card: the prompt (weight 560), a `LadderChip`, then a chip row and
the Attempt/Re-test button.

API data: `checks[].{id, prompt, type, must_cover, draft_reference,
overconfident_miss, attempt_count, last_score, next_due, state}`.

**`ModuleCapstoneTab`** — a muted "not counted in coverage" line, then one card per
artefact assigned to this module: title, state chip, a state `<select>` and a path
input. Exports `CAPSTONE_STATES`.

API data: `capstone[]` from `GET /api/modules/:id`. Write: `PATCH /api/capstone`.

> **Known defect (blocks this tab in the shipped build).** `GET /api/modules/{id}`
> builds `capstone` as `[c.model_dump() for c in tr.capstone …]`
> (`src/learn/routers/modules.py`, `module_detail`), straight off the curriculum
> model, which carries no `state`/`notes`/`path`/`next_action` — unlike
> `GET /api/capstone`, which merges the stored row over a default. `a.state.replace(…)`
> therefore throws on `undefined` and React unmounts the whole module page (blank
> screen, every tab) for any module that owns an artefact. Screen `14-module-capstone`
> was captured with the module payload patched to the merged shape.

### 1.7 `Review`

Renders: `h2 "Due now"` with a "Weekly review →" link; a sub-line; either the empty
state or a `.stack` of cards. Each card: prompt, `LadderChip`, then a chip row (type
chip, module link, overdue/due chip, optional overconfident-miss chip) and a
"Re-test" button. Shows the first four items, with a link button for the rest.
Opening a re-test replaces the whole screen with `AttemptFlow`.

API data: `GET /api/review/due` → `DueItem[]`: `check_id, module_id, prompt, type,
overdue_days, next_due, overconfident_miss, state`.

### 1.8 `WeeklyReview`

Six numbered blocks in a fixed order:

1. `h3 "1 · Cold retrieval sweep"` — cards from `retrieval_sweep[]` with an "Attempt"
   deep link into the module's Checks tab; empty state when the list is empty.
2. `h3 "2 · Calibration"` — Brier score (mono), the generated sentence, and a
   reliability table (Confidence bucket / n / Mean stated / Observed pass rate; empty
   buckets print `—`).
3. `h3 "3 · Error ledger triage"` — `ErrorTriage`.
4. `h3 "4 · Hours and burn-up"` — `HoursBar`, then a Week / Planned durable / Actual
   durable table.
5. `h3 "5 · Capstone board"` — a `.grid` of tight cards, title + state chip.
6. `h3 "6 · Replan"` — next week's scope sentence and a free-text if-then textarea
   that is local-only (explicitly labelled scratch space; nothing is POSTed).

API data: `GET /api/review/weekly` → `WeeklyReview`: `weeks_on_plan`, `banked_skips`,
`retrieval_sweep[]`, `calibration.{brier, sentence, buckets[]}`, `errors[]`,
`hours.week_hours`, `burn_up[]`, `capstone[]`, `replan[]`.

### 1.9 `Capstone`

Renders: `h2 "Capstone"`, the sub-line "Eight artefacts. Each one is a thing that
exists, or does not.", then one card per artefact: title + state chip, description,
module deep links, a state `<select>` and a path input, then "Next action" and "Notes"
fields. Every field commits on blur.

API data: `GET /api/capstone` → `CapstoneArtefact[]`. Write: `PATCH /api/capstone`.

---

## 2. Shared components (`src/components`)

| Component | File | Renders | API / store data |
| --- | --- | --- | --- |
| `Rail` | `Rail.tsx` | Left nav: `h1 "learn"`, five `NavLink`s, a numeric due badge on Review, and a foot note when the vault is not a git repo. | props `dueCount`, `vaultGit` (from `GET /api/health`). |
| `SessionBar` | `SessionBar.tsx` | Sticky bar: elapsed `HH:MM` (mono, tabular), a module link, a three-button phase segment, "Close session", "Discard". Adds a banner once elapsed ≥ 3 h. | store `session`, `elapsed`; `PATCH /api/sessions/current`, `POST /api/sessions/discard`. |
| `Warmup` | `Warmup.tsx` | `h3 "Warm-up n of m"`, a reason chip, an optional overconfident-miss chip, "Skip warm-up", an `AttemptFlow` for the current item, and a next/finish button. | `GET /api/sessions/warmup` → `WarmupItem[]`; `PATCH /api/sessions/current {warmup_skipped}`. |
| `CloseSessionDialog` | `CloseSessionDialog.tsx` | Modal sheet: reflection textarea with a live word count (40-word minimum), an IF / THEN fieldset, an errors fieldset (category select + diagnosis textarea per row), a 1–5 fatigue segment, and Close/Keep-working buttons. | `POST /api/sessions/close` with `SessionClose`. |
| `AttemptFlow` | `AttemptFlow.tsx` | The whole check attempt, in three stages (`confidence` → `answering` → `graded`): a chip header with an elapsed-minutes counter, a Prompt card, then `ConfidenceSlider`, the answer editor, the frozen answer, `SelfGrade`, a "Recorded" card, `CritiquePanel` and the Reference card. | `GET /api/checks/:id`, `POST /api/checks/:id/attempts`, `POST /api/attempts/submit`; store `session`, `health`. |
| `ConfidenceSlider` | `ConfidenceSlider.tsx` | A labelled 0–100 range (step 5), the mono value read-out, and the lock button. Untouched state shows a hint and keeps the button disabled. | none (callback only). |
| `SelfGrade` | `SelfGrade.tsx` | `h4 "Self-grade each rubric line"`, one `.rubric-line` per rubric entry (text + optional AI critique line + a met/partial/missing segment), `h4 "Overall score"` with a Can't/Partial/Fluent segment, and — below fluent — a required diagnosis textarea and category select. | props: `rubric[]`, `critique[]` (`CritiqueLine`). |
| `CritiquePanel` | `CritiquePanel.tsx` | A tight card: title, a one-sentence disclaimer, and the Run critique / Critiquing… / Done button; shows the blocked reason and any error. | `POST /api/ai/critique` (SSE, one `done` frame carrying `lines[]`). |
| `NoteEditor` | `NoteEditor.tsx` | A toolbar row (slot + save indicator + a Side/Below/Editor-only segment), the 409 conflict banner, then a `CodeMirror` and a `Markdown` preview in `.editor-wrap`. Autosaves 1.5 s after the last keystroke. | `GET/PUT /api/modules/:id/note` (`frontmatter`, `body`, `mtime_ns`). |
| `TidyDialog` | `TidyDialog.tsx` | A wide modal with four phases: `streaming` (shadow `<pre>`), `review` (a `@codemirror/merge` MergeView with per-chunk revert arrows), `rejected` (banner), `error` (banner). Footer: Accept all / Reject all / Keep original. | `POST /api/ai/tidy` (SSE `delta`, `stats`, `rejected`, `done`, `error`). |
| `AiMenu` | `AiMenu.tsx` | A `AI ▾` button and a `role="menu"` popover. Entries are always present, disabled — never hidden — when blocked, with the reason both as a `role="note"` paragraph and as the `title` tooltip. | prop `blockedReason` from `aiBlockedReason(health, session)`. |
| `Chip` / `LadderChip` / `ResourceChip` / `ScoreChip` | `Chip.tsx` | Pill spans; see §4. | props only. |
| `HoursBar` / `ActivityStrip` | `HoursBar.tsx` | A stacked new/review/build bar with a three-swatch legend and a plain over/under sentence; a 40 × 7 day intensity grid with a per-cell `title`, no number and no streak. | `WeekHours`, `ActivityDay[]`. |
| `ErrorTriage` | `ErrorTriage.tsx` | One card per unresolved ledger error: category chip, module link, timestamp, diagnosis, a Resolution textarea, a Resolve button, and either a "Re-test the Check it came from" link or the track.yaml note. | `LedgerError[]`; `PATCH /api/errors`. |
| `Markdown` | `Markdown.tsx` | `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex`, with `pre` routed to `CodeBlock`. | prop string. |
| `CodeBlock` | `CodeBlock.tsx` | ```` ```mermaid ```` → lazily-loaded Mermaid 12 (`neutral` / `dark` by `prefers-color-scheme`); the six Shiki languages → `github-light` / `github-dark`; anything else → plain `<pre><code>`. | prop string. |
| `CodeMirror` | `CodeMirror.tsx` | A controlled CodeMirror 6 view: line numbers, history, active-line highlight, default highlight style, line wrapping. No autocompletion anywhere. `blockPaste` cancels paste and drop for code checks. | prop string. |
| `highlighter.ts` | `highlighter.ts` | Not a component: the lazy Shiki core factory, `SHIKI_LANGS` = `python, typescript, bash, json, yaml, sql`, and `prefersDark()`. | — |

### 2.1 Store (`src/store.ts`)

Zustand store holding `health`, `healthLoaded`, `session`, `elapsed`, `vaultRevision`.
`aiBlockedReason(health, session)` returns, in order: `health.ai_reason` (or
`"AI is unavailable."`) when `ai_available` is false; `"An attempt is open. Submit or
leave it before using AI."` when `session.open_attempt_path` is set; otherwise `null`.
A failed `GET /api/health` synthesises `ai_reason: "The server is not reachable."`.

---

## 3. Design tokens (`src/styles/tokens.css`)

`:root` also sets `color-scheme: light dark`. The dark values live in a single
`@media (prefers-color-scheme: dark)` block; there is no manual theme toggle and no
`data-theme` attribute anywhere in the app.

| Custom property | Light | Dark |
| --- | --- | --- |
| `--ink` | `#1b1d20` | `#e7e6e2` |
| `--ink-2` | `#4a4f55` | `#b4b3ae` |
| `--ink-3` | `#72787f` | `#8b8a85` |
| `--bg` | `#fbfbfa` | `#17181a` |
| `--bg-2` | `#ffffff` | `#1e1f22` |
| `--bg-3` | `#f2f1ee` | `#26272a` |
| `--line` | `#e0dfda` | `#333438` |
| `--line-2` | `#cbcac4` | `#45464b` |
| `--accent` | `#2f5d8a` | `#8fb8de` |
| `--accent-soft` | `#e6eef6` | `#223243` |
| `--amber` | `#8a6a1f` | `#d8bd7c` |
| `--amber-soft` | `#f7efd9` | `#38311d` |
| `--good` | `#2f6b4a` | `#8ec7a5` |
| `--good-soft` | `#e3f0e8` | `#1e2f26` |
| `--warn-line` | `#b9a061` | `#7a6a3c` |
| `--focus` | `#2f5d8a` | `#8fb8de` |
| `--font-ui` | `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | same |
| `--font-mono` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` | same |
| `--radius` | `6px` | same |
| `--rail-w` | `13rem` | same |
| `--pad` | `1rem` | same (declared; not referenced anywhere in `app.css`) |
| `--maxw` | `66rem` | same |

Note: `--line` is declared twice in the dark block (`#33343800` then `#333438`); the
second wins, so the effective dark value is `#333438`.

There is no red anywhere in the palette. Amber is the only warning colour, and
`button.primary` is the only place a literal colour is used outside the tokens
(`#fff` in light, `#10171e` in dark, for text on the accent fill).

### 3.1 Typography in use

| Where | Size | Weight | Other |
| --- | --- | --- | --- |
| `body` | `15px` | — | line-height `1.55`, `--font-ui`, antialiased |
| `code`, `pre`, `.cm-editor` | `13.5px` | — | `--font-mono` |
| `h1` (rail wordmark) | `0.8rem` | 600 | uppercase, letter-spacing `0.14em`, `--ink-3` |
| `h2` (screen title) | `1.35rem` | 620 | margin `0 0 0.25rem` |
| `h3` (section) | `1.02rem` | 620 | margin `1.5rem 0 0.5rem` |
| `h4` (card heading) | `0.9rem` | 620 | margin `0 0 0.35rem` |
| `.sub` | inherit | — | `--ink-3`, margin `0 0 1.25rem` |
| `th` | `0.8rem` | 600 | uppercase, letter-spacing `0.05em`, `--ink-3` |
| `table` | `0.9rem` | — | `.preview table` is `0.85rem` |
| `.chip` | `0.78rem` | — | — |
| `.seg button` | `0.82rem` | — | — |
| `.legend` | `0.8rem` | — | `--ink-3` |
| `.rail-foot` | `0.8rem` | — | `--ink-3` |
| `label`, `legend` | `0.85rem` | — | `--ink-2` |
| `.timerbar` | `0.88rem` | — | elapsed uses `--font-mono` + `tabular-nums` |
| `.err` | `0.85rem` | — | colour `--amber` |
| `.attempt-answer` | `13px` | — | `--font-mono`, `white-space: pre-wrap` |
| Today's plan sentence | `1.05rem` | — | inline style |
| Check / due prompt | inherit | 560 | inline style |
| Plan card module link | inherit | 600 | inline style |
| Inline muted helper text | `0.80` / `0.82` / `0.83` / `0.85rem` | — | 15 inline occurrences; see §3.2 |

The four muted helper sizes, by file: `0.80rem` — `AiMenu`; `0.82rem` — `NoteEditor`
(save indicator), `ErrorTriage` (×2), `CloseSessionDialog` (word count),
`CritiquePanel`, `AttemptFlow` (paste-disabled note), `WeeklyReview` (replan foot);
`0.83rem` — `CritiquePanel`, `SelfGrade` (AI line), `ConfidenceSlider`,
`CloseSessionDialog` (validation hint), `AttemptFlow` (grading hint); `0.85rem` —
`Plan` (module meta).

### 3.2 Spacing in use

- Shell: rail `1.25rem 0.75rem`, rail links `0.4rem 0.6rem`, `main` `1.75rem 2rem 5rem`.
- Cards: `.card` `1rem 1.1rem` padding, `0.85rem` bottom margin; `.card.tight`
  `0.7rem 0.9rem`.
- Flex helpers: `.row` gap `0.6rem`, `.stack` gap `0.6rem`, `.grid` gap `0.75rem` with
  `repeat(auto-fill, minmax(17rem, 1fr))`.
- Tabs: `.tabs` gap `1.25rem`; `button.tab` padding `0.4rem 0.1rem`.
- Chips: padding `0.05rem 0.55rem`, radius `999px`, inner gap `0.3rem`.
- Buttons: padding `0.35rem 0.8rem`, radius `var(--radius)`; `.seg button`
  `0.15rem 0.55rem`.
- Inputs/selects/textareas: padding `0.35rem 0.5rem`, width `100%`.
- Fieldsets: padding `0.6rem 0.8rem`, margin `0 0 0.8rem`.
- Tables: `th` `0.35rem 0.5rem`, `td` `0.45rem 0.5rem`, both with a `--line` bottom rule.
- Dialog: `.scrim` padding `3rem 1rem`, `.sheet` padding `1.25rem 1.4rem`, width
  `min(48rem, 100%)`; `.sheet.wide` `min(70rem, 100%)`; radius `8px`.
- Editor: `.editor-wrap` gap `0.9rem`, two equal columns in `side` layout; both
  `.cm-host .cm-editor` and `.editor-wrap .preview` capped at `34rem` with their own
  scrollers. `.merge-host` capped at `60vh`, MergeView min-height `20rem`.
- Bars: `.bar` height `0.7rem`, radius `999px`; activity cells `0.62rem` square with a
  `2px` gap, 7 rows.
- Timer bar: padding `0.45rem 2rem`, sticky at `z-index: 30`; the scrim is `z-index: 40`,
  the AI menu list `z-index: 20`.
- One breakpoint only: `@media (max-width: 62rem)` collapses `.critique-grid` and the
  side-by-side editor to a single column.
- Ad-hoc inline margins used across components: `0.2rem`, `0.25rem`, `0.3rem`,
  `0.35rem`, `0.4rem`, `0.5rem`, `0.55rem`, `0.6rem`, `0.8rem`, `0.9rem`, `1rem`.

---

## 4. Chip and badge vocabulary

All chips are the same pill (`.chip`) with one of four `data-tone` values. Every chip
carries text; colour is never the only signal.

| Tone | Background | Border | Text |
| --- | --- | --- | --- |
| `plain` (default) | `--bg-3` | `--line-2` | `--ink-2` |
| `good` | `--good-soft` | `--good` | `--good` |
| `amber` | `--amber-soft` | `--warn-line` | `--amber` |
| `accent` | `--accent-soft` | `--accent` | `--accent` |

### 4.1 Ladder chips (`LadderChip`) — check and module state

| Label | Tone | Meaning |
| --- | --- | --- |
| `not started` | plain | no attempt recorded |
| `attempted` | plain | attempted, not yet familiar |
| `familiar` | amber | mid-ladder; amber marks "not safe yet" |
| `proficient` | accent | last attempt was fluent |
| `durable` | good | two fluent attempts, different sessions, ≥ 7 days apart |

### 4.2 Resource chips (`ResourceChip`)

| Label | Tone | Meaning (from the `title` tooltip) |
| --- | --- | --- |
| `queued` | plain | "Does not count toward the module" |
| `skimmed` | plain | "Does not count toward the module" |
| `read` | plain | "Does not count toward the module" |
| `reconstructed` | good | "Counts toward the module" |
| `taught` | good | "Counts toward the module" |

### 4.3 Score chips (`ScoreChip`)

| Label | Tone |
| --- | --- |
| `can't` | plain |
| `partial` | amber |
| `fluent` | good |

### 4.4 Capstone state chips (plain `Chip`)

Label is the state with `_` replaced by a space: `not started`, `draft`, `working`,
`reviewed`, `done`. Tone is `good` for `done` and `plain` for every other state.

### 4.5 Free-text chips

| Label | Tone | Where | Meaning |
| --- | --- | --- | --- |
| `<check type>` — `explain`, `code`, `derive`, `judge`, `numeric` | plain | Checks tab, Review card, `AttemptFlow` header | the check's type |
| `must cover` | accent | Checks tab, `AttemptFlow` header | counts toward module coverage |
| `draft reference, verify` | amber | Checks tab, `AttemptFlow` header | reference is AI-drafted, not yet verified (tooltip: "Reference was AI-drafted and not yet verified") |
| `overconfident miss` | amber | Checks tab, Review, Weekly sweep, Warm-up | pre-confidence ≥ 80 with a `can't` result |
| `N attempt` / `N attempts` | plain | Checks tab | attempt count |
| `due YYYY-MM-DD` | plain | Checks tab, Review (when not overdue) | next re-test date |
| `N day overdue` / `N days overdue` | amber | Review | days past `next_due` |
| `X.X / Y h` | amber when over budget, else plain | Plan card | hours actual vs budget |
| `X.X of Y h` | amber when over budget, else plain | Overview tab | same, different wording |
| `over budget` | amber | Overview tab | only shown when over |
| `NN% covered` | plain | Plan card, Overview tab | must-cover coverage |
| `re-test overdue` | amber | Plan card | module `at_risk` |
| `prerequisite below familiar` | amber | Plan card | module `blocked` |
| warm-up reason: `due re-test`, `last session`, `module ≥4 weeks old`, `unresolved error`, `not yet attempted` | plain | Warm-up header | why the item was drawn |
| `<error category>` — `notation_shape`, `misremembered_mechanism`, `conflated_two_things`, `off_by_one_masking`, `statistical_reasoning`, `api_library`, `didnt_know` | plain | Error triage | ledger category, raw snake_case |

### 4.6 Non-chip badges

- **Rail due badge** (`.rail-badge`): the bare due count, tabular-nums, `--ink-3`,
  right-aligned inside the Review nav link, only when `dueCount > 0`. Accessible name
  `"N due for review"`.
- **Active rail link**: `--accent-soft` background, `--ink` text, weight 600.
- **Selected tab**: `--ink` text, weight 600, 2 px `--accent` bottom border.
- **Pressed segment button** (`.seg button[aria-pressed="true"]`): `--accent-soft`
  background, `--accent` text, weight 600.

---

## 5. Empty states, error messages and notices

### 5.1 Empty states (`.empty` — dashed `--line-2` border, centred, `--ink-3`)

| String | Where |
| --- | --- |
| `Nothing is due. Go and learn something new.` | Review, empty due queue |
| `Nothing drawn this week.` | Weekly review, block 1 |
| `No checks defined for this module.` | Checks tab |
| `No resources listed for this module.` | Resources tab |
| `No capstone artefact is assigned to this module.` | Module Capstone tab |
| `No unresolved errors in the ledger.` | Error triage (weekly block 3) |

Non-`.empty` empty-ish states:

| String | Where |
| --- | --- |
| `No if-then plan yet. Write one at the end of your first session: a cue, and the first ten minutes.` | Today, when `plan_text` is null |
| `Nothing is queued. Pick a module and start where you like.` | Today, next action, server-generated (`kind: "none"`) |
| `Nothing to warm up on. Straight to the work.` | Warm-up with zero drawn items |
| `nothing scheduled` | Weekly review block 6, when `replan` is empty |
| `—` | Resources table, null path; calibration table, empty bucket |

### 5.2 Loading states

`Loading…` (Today, Plan, Modules, Review, Weekly review, Capstone), `Loading module…`
(Module), `Loading note…` (`NoteEditor`), `Loading check…` (`AttemptFlow`),
`Drawing warm-up items…` (`Warmup`). All are `<p class="muted">`.

### 5.3 Error strings (`.err` — `--amber`, `0.85rem`)

| String | Where |
| --- | --- |
| `Could not load Today: {message}` | Today |
| `Could not load the plan: {message}` | Plan |
| `Could not load modules: {message}` | Modules |
| `Could not load the module: {message}` | Module |
| `Could not load the queue: {message}` | Review |
| `Could not load the weekly review: {message}` | Weekly review |
| `Could not load the capstone board: {message}` | Capstone |
| `Could not load the note: {message}` | `NoteEditor` |
| `Could not draw warm-up items: {message}` | `Warmup` (with a "Go to the module" button) |
| `{message}` (bare) | `AttemptFlow` load failure (with a "Back" button), `ResourcesTab`, `ModuleCapstoneTab`, `ErrorTriage`, `CritiquePanel`, `CloseSessionDialog`, `AttemptFlow` submit failure — all `role="alert"` |
| `Could not apply the tidy: {message}` | `NotesTab` notice banner |
| `Save failed: {message}` | `NoteEditor` save indicator |

Message text comes from `ApiError.detail` (the FastAPI `detail` field) or, failing
that, `"{status} {statusText}"`.

### 5.4 Store-generated reasons

| String | Condition |
| --- | --- |
| `The server is not reachable.` | `GET /api/health` threw |
| `AI is unavailable.` | `ai_available` false and `ai_reason` null |
| `An attempt is open. Submit or leave it before using AI.` | `session.open_attempt_path` is set |
| `The note changed on disk since it was loaded.` | `ConflictError` message (409 on `PUT …/note`) |

### 5.5 Banners and notices

| String | Style | Where |
| --- | --- | --- |
| `This note changed on disk since it was loaded, so the save was refused.` + two buttons | amber `.banner`, `role="alert"` | `NoteEditor` 409 |
| `Rejected by the invariant checker.` + the server's reason | amber `.banner`, `role="alert"` | `TidyDialog` |
| `{error message}` | amber `.banner`, `role="alert"` | `TidyDialog` error phase |
| `Three hours elapsed. A good place to close — but nothing is blocked.` + `Dismiss` | amber `.banner`, `role="status"` | `SessionBar` |
| `Insert the Keshav three-pass stub for “{title}”?` + `Insert` | plain `.banner` | Notes tab, `?keshav=` |
| `Tidy applied and committed.` | plain `.banner`, `role="status"` | Notes tab after an accepted tidy |
| `Vault is not a git repo — snapshots fall back to file backups.` | `.rail-foot` | Rail, when `vault_git` is false |

### 5.6 Inline guidance and validation copy

| String | Where |
| --- | --- |
| `The plan you wrote last time, and one thing to do next.` | Today sub-line |
| `Must-cover checks at proficient or durable. Attempted N% · durable N%.` (+ ` Schedule shifted N weeks from YYYY-MM-DD.`) | Plan sub-line |
| `Every module in the track, in plan order.` | Modules sub-line |
| `Sorted by days overdue, then by overconfident misses. Time-boxed to four at a time.` | Review sub-line |
| `Week N on plan · N banked skips left this quarter.` | Weekly review sub-line |
| `Eight artefacts. Each one is a thing that exists, or does not.` | Capstone sub-line |
| `Capstone artefacts are not counted in module coverage.` | Module Capstone tab |
| `Over the budget for this module. That is information, not a failure — decide whether to shift the schedule or narrow the scope.` | Overview tab |
| `N listed · N reconstructed or taught (the only two states that count).` | Overview tab |
| `How confident are you, before you answer? (required)` | `ConfidenceSlider` label |
| `Move the slider to record a rating — it cannot be skipped.` | `ConfidenceSlider`, untouched |
| `The rubric and the reference stay hidden until you submit an answer.` | `AttemptFlow`, confidence stage |
| `Paste and autocomplete are disabled for code Checks — write it from memory.` | `AttemptFlow`, code checks |
| `The reference appears once the self-grade is recorded.` | `AttemptFlow`, graded stage before submit |
| `Grade every rubric line and pick an overall score[, then diagnose the gap].` | `AttemptFlow`, incomplete grade |
| `Next due YYYY-MM-DD. State: {state}.[ Flagged as an overconfident miss — it comes back first.]` | `AttemptFlow`, Recorded card |
| `This goes to the error ledger — both fields required` | `SelfGrade` fieldset legend |
| `What exactly differed from the reference?` | `SelfGrade` diagnosis label |
| `Grades your submitted answer against the rubric. It never rewrites and never replaces your own score.` | `CritiquePanel` |
| `Copy-editing… the file is untouched until you accept. Streaming into a shadow buffer.` | `TidyDialog`, streaming |
| `Left is your note, right is the tidied version. Use the arrows in the gutter to take or revert a chunk.[ N tokens added.]` | `TidyDialog`, review |
| `Critique runs on a submitted attempt, from the Checks tab.` | AI menu item hint (`title`) |
| `What changed in your understanding, and what can you still not do?` | Close dialog, reflection label |
| `N of 40 words minimum.` | Close dialog, live counter |
| `Next session plan` / `Errors to log (each needs a diagnosis)` | Close dialog legends |
| `All three fields are required to close.` | Close dialog, invalid |
| `Fatigue (1 fresh – 5 spent)` | Close dialog label |
| `To convert this into a Check, add it to your `track.yaml`.` | Error triage, error with no check |
| `The plan that shows on Today is the one written at session close; this box is your scratch space for the week.` | Weekly review block 6 |
| `Insert the Keshav three-pass stub…` | see §5.5 |

Placeholders: `path or commit reference` (capstone path inputs),
`it is Sunday after breakfast` (IF), `re-derive the attention gradient on paper`
(THEN), `IF … THEN I will …` (weekly replan textarea).

Confirm dialogs (native `window.confirm`):
`Move every soft date by one week, from next Monday?` (Plan shift) and
`Discard this session? Nothing is written to the vault.` (Session bar).

---

## 6. Interaction inventory — every control, per screen

### Rail (always present)
Links: `Today`, `Plan`, `Modules`, `Review` (+ numeric badge), `Capstone`.

### Session bar (whenever a session is open)
Link: the module id. Buttons: `new`, `review`, `build` (phase segment,
`aria-pressed`); `Close session` (primary); `Discard`. Over-cap banner adds `Dismiss`
(link button).

### Today (`/`)
- Button `Start session` (primary; disabled when `next_action.module_id` is null) **or**
  `Back to the open session` (primary) when a session is open.
- Link: the next-action label → `/modules/{id}` (a muted span when there is no module).
- Link: `N due for review` → `/review` (only when `due_count > 0`).
- No controls in the This week / Activity cards; the activity cells carry a `title`
  tooltip only.

### Plan (`/plan`)
- Button `Shift schedule +1 week` (→ `Shifting…` while in flight).
- Filter group buttons `All`, `Not started`, `At risk`, `Blocked` (`aria-pressed`, the
  active one takes `.primary`).
- Per card: module title link → `/modules/{id}`.

### Modules (`/modules`)
- Per row: module title link → `/modules/{id}`. Nothing else is interactive.

### Module (`/modules/:id`)
- Tabs: `Overview`, `Resources`, `Notes`, `Checks`, `Capstone`.

**Overview** — no controls.

**Resources** — per row: the title link (external, `target="_blank"`); a
`Keshav template` link for papers → `?tab=notes&keshav=…`; a `State of {title}`
select (`queued`, `skimmed`, `read`, `reconstructed`, `taught`); buttons `+15`, `+30`,
`+60`.

**Notes** — `AI ▾` menu button, with items `Tidy — copy-edit with per-chunk review` and
`Explain-back critique — open a Check`; save-state indicator (`Saving…` / `Unsaved` /
`Saved` / `Save refused` / `Save failed: …`); preview layout segment `Side`, `Below`,
`Editor only`; the CodeMirror buffer. Conditional: `Insert` (Keshav banner);
`Reload from disk (discards your edits)` and `Keep my version and overwrite` (409
banner).

**Checks** — per card: `Attempt` (no attempts yet) or `Re-test` (primary).

**Capstone** — per card: a `State of {title}` select (`not started`, `draft`,
`working`, `reviewed`, `done`) and a `Path or commit for {title}` text input
(commits on blur).

### Attempt flow (inside Checks, Review or Warm-up)
- Header: `Back to checks`.
- Stage `confidence`: the range slider, then `Lock confidence and start`
  (→ `Starting…`; disabled until the slider is touched).
- Stage `answering`: the answer editor, then `Submit and freeze answer` (primary;
  disabled while the answer is empty).
- Stage `graded`, before recording: per rubric line a `met` / `partial` / `missing`
  segment; an overall `Can't (0)` / `Partial (1)` / `Fluent (2)` segment; below fluent,
  a diagnosis textarea and an `Error category` select; then
  `Record grade and reveal reference` (primary; → `Saving…`).
- Stage `graded`, after recording: `Run critique` (→ `Critiquing…` → `Done`;
  disabled when blocked or already run).

### Tidy dialog
`Keep original (Esc)` (header), `Accept all` (primary), `Reject all`,
`Keep original` (footer), plus the MergeView's per-chunk revert arrows in the gutter.
Escape closes.

### Warm-up
`Skip warm-up`; the embedded attempt flow's own controls;
`Next warm-up item` / `Finish warm-up and start working`.

### Close session dialog
Reflection textarea; `IF` and `THEN I will (first 10 minutes)` inputs; per logged
error a category select, a diagnosis textarea and a `Remove` link button;
`Add an error`; a `1`–`5` fatigue segment; `Close session` (primary; → `Closing…`;
disabled until valid) and `Keep working`.

### Review (`/review`)
- Link `Weekly review →`.
- Per card: the module-id link → `/modules/{id}`; `Re-test` (primary).
- `Show the other N` (link button) when more than four items are due.

### Weekly review (`/review/weekly`)
- Link `← Due queue`.
- Block 1: per item an `Attempt` link → `/modules/{id}?tab=checks&check={id}`.
- Block 3 (`ErrorTriage`): per error a Resolution textarea, a `Resolve` button
  (disabled until the textarea has content), and either a
  `Re-test the Check it came from` link or a static note.
- Block 6: the `If-then plans for the week` textarea (local only).
- Blocks 2, 4 and 5 are read-only.

### Capstone (`/capstone`)
Per card: module id links; a `State of {title}` select; a
`Path or commit for {title}` input; a `Next action` input; a `Notes` textarea. All
inputs commit on blur; the select commits on change.

---

## 7. Accessibility affordances present today

- `:focus-visible` — 2 px `--focus` outline, 2 px offset, 3 px radius, applied globally.
- Roles in use: `tablist`/`tab`, `group` (filter, phase, fatigue, rubric lines, overall
  score, preview layout), `menu`/`menuitem`, `dialog` with `aria-modal`, `status`,
  `alert`, `note`, `img` (hours bar and activity strip, both with a descriptive
  `aria-label`).
- `aria-pressed` on every segment button; `aria-selected` on tabs; `aria-current="page"`
  on the active rail link; `aria-live="polite"` on the note save indicator.
- Every chip carries text, never colour alone.
- Disabled AI actions stay visible and keep an explanatory `title` and `role="note"`
  paragraph instead of disappearing.
- The CodeMirror content element is given an `aria-label` per instance
  (`Notes for module {id}`, `Answer for {check id}`).
