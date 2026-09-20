# `learn` — user flows as they exist today

Each flow is the current behaviour, step by step, naming the screen and the exact
control at each step. No proposals. Screenshot filenames in `screens/` are given where
one exists.

Conventions: **Screen** is the route or overlay; **Control** is the literal label of
the button, link, select or field; *(server)* marks a request and what it writes.

---

## 1. First run

Starting state: an empty vault (`LEARN_VAULT`, default `./vault`). On boot the server
creates `vault/`, `vault/modules/`, `vault/sessions/` and `.cache/`, initialises a git
repo in the vault, rebuilds the SQLite index and starts the file watcher.

| # | Screen | Control / event | What happens |
| --- | --- | --- | --- |
| 1 | — | `learn` starts; browser opens `http://127.0.0.1:8765/` | Client mounts, calls `GET /api/health`, `GET /api/sessions/current` (→ `null`), `GET /api/review/due` (→ `[]`), and opens the `GET /api/events` SSE stream. |
| 2 | Today `/` | — | `GET /api/today`. `plan_text` is null, so the card shows *"No if-then plan yet. Write one at the end of your first session: a cue, and the first ten minutes."* The rail shows no due badge. `screens/01-today-empty-*.png` |
| 3 | Today | — | `next_action` is the first unattempted must-cover check of the first module (`kind: "check"`, label `First attempt: …`), rendered as a link to that module. If the track had no modules at all the label would be *"Nothing is queued. Pick a module and start where you like."* and the Start button would be disabled. |
| 4 | Today | — | *This week* shows `0.0 h` on every segment against the weekly budget; *Activity* is 280 empty cells (40 weeks × 7 days from the plan start date). |
| 5 | Today | Button **Start session** | Enters flow 2. |
| 5′ | Rail | Link **Plan** / **Modules** / **Review** / **Capstone** | The alternative first move: browse without a session. Review shows *"Nothing is due. Go and learn something new."* |
| 6 | — | If the vault is not a git repo | The rail foot shows *"Vault is not a git repo — snapshots fall back to file backups."* and snapshots write to `.cache/backups` instead of committing. |

---

## 2. Start session → warm-up → work → close

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Today `/` | Button **Start session** | *(server)* `POST /api/sessions/start {module_id}` with `next_action.module_id`. Writes `vault/sessions/<date>-<n>.md` with `phase: new`, `phase_started: now`, zeroed `minutes`. A second start while one is open returns 409. |
| 2 | — | — | The client sets `warmup = true` and navigates to `/modules/{id}`. `SessionBar` appears at the top of every screen from here on: elapsed `HH:MM`, the module link, the `new`/`review`/`build` segment, **Close session**, **Discard**. |
| 3 | Warm-up (replaces the routed screen) | — | *(server)* `GET /api/sessions/warmup`. The draw is: up to 3 due re-tests (reason `due re-test`) — or, if nothing is due, unattempted checks (`not yet attempted`); then one check from the previous session's module (`last session`); then one from a module untouched for ≥ 4 weeks (`module ≥4 weeks old`); then one check behind an unresolved ledger error (`unresolved error`). `screens/15-session-warmup-*.png` |
| 4 | Warm-up | The embedded attempt flow | Each item is a normal attempt (flow 3), starting at the confidence slider. |
| 5 | Warm-up | Button **Next warm-up item** | Advances the index; the header counter reads *Warm-up n of m*. |
| 6 | Warm-up | Button **Finish warm-up and start working** (the last item's label) | Leaves the warm-up; the module page renders. |
| 6′ | Warm-up | Button **Skip warm-up** | *(server)* `PATCH /api/sessions/current {warmup_skipped: true}` — the skip is recorded in the session file — then the module page renders. |
| 6″ | Warm-up | Zero items drawn | Shows *"Nothing to warm up on. Straight to the work."* with a **Start working** button. |
| 7 | Module `/modules/:id` | Tabs **Overview / Resources / Notes / Checks / Capstone** | The work itself: read a resource and move it up the ladder (flow 6), take notes (flow 4), attempt checks (flow 3). `screens/16-session-bar-during-work-*.png` |
| 8 | Session bar | Segment buttons **new** / **review** / **build** | *(server)* `PATCH /api/sessions/current {phase}`. Wall-clock minutes since the last switch are accrued into the *outgoing* phase, then the new phase's clock starts. This is the only place the hours split is set. |
| 9 | Session bar | After 3 h elapsed | An amber banner: *"Three hours elapsed. A good place to close — but nothing is blocked."* with a **Dismiss** link button. Nothing is disabled. |
| 10 | Session bar | Button **Close session** | Opens the close dialog. `screens/17-session-close-dialog-*.png` |
| 11 | Close dialog | Textarea *What changed in your understanding, and what can you still not do?* | A live counter reads *N of 40 words minimum*; **Close session** stays disabled below 40 words. The server re-checks and returns 422 otherwise. |
| 12 | Close dialog | Inputs **IF** and **THEN I will (first 10 minutes)** | Both required client-side and server-side (422 with *"the if-then plan needs both a cue and an action"*). |
| 13 | Close dialog | Button **Add an error** → category select + diagnosis textarea | Optional, repeatable; **Remove** deletes a row. An empty diagnosis blocks the close both client- and server-side. |
| 14 | Close dialog | Fatigue segment **1**–**5** | Defaults to 3. |
| 15 | Close dialog | Button **Close session** | *(server)* `POST /api/sessions/close`. Accrues the final phase minutes, stamps `closed` and `fatigue`, writes the body as `## Reflection` + `## Next session\nIF …\nTHEN I will …`, appends each logged error to `vault/errors.jsonl`, then commits the vault (`session close <id>`). |
| 16 | — | — | The store clears `session`, bumps `vaultRevision`; the session bar disappears. The if-then sentence is what Today will render next time. `screens/02-today-with-plan-*.png` |
| 15′ | Close dialog | Button **Keep working** | Closes the dialog, leaves the session open. |
| 15″ | Session bar | Button **Discard** | `window.confirm("Discard this session? Nothing is written to the vault.")`, then *(server)* `POST /api/sessions/discard` — the session file and any attempts it opened are removed. |

---

## 3. Attempt a check

Entry points, all rendering the same `AttemptFlow`:

- Module → **Checks** tab → **Attempt** (no attempts yet) or **Re-test**. `screens/10-module-checks-*.png`
- Review `/review` → **Re-test** on a due card.
- Weekly review → block 1 → **Attempt** link.
- Warm-up → automatically, item by item.

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Checks tab | Button **Attempt** / **Re-test** | Sets `?check={id}`; *(server)* `GET /api/checks/{id}` returns the prompt, type, rubric and attempt history. The **reference answer is not in the payload**. |
| 2 | Attempt flow, stage `confidence` | — | Header chips: the type, `must cover`, `draft reference, verify`. Body: the Prompt card, the confidence slider, and the line *"The rubric and the reference stay hidden until you submit an answer."* `screens/11a-check-attempt-confidence-*.png` |
| 3 | stage `confidence` | Range slider (0–100, step 5) | **Lock confidence and start** stays disabled until the slider is moved; the hint reads *"Move the slider to record a rating — it cannot be skipped."* |
| 4 | stage `confidence` | Button **Lock confidence and start** | *(server)* `POST /api/checks/{id}/attempts {session_id, confidence_pre}` writes an open attempt file. The client records `open_attempt_path`, which from now on blocks every AI action with *"An attempt is open. Submit or leave it before using AI."* |
| 5 | stage `answering` | The answer editor | CodeMirror; markdown for every type except `code`, which uses Python **and cancels paste and drop**, with the note *"Paste and autocomplete are disabled for code Checks — write it from memory."* There is no autocompletion in any editor in the app. A mono elapsed-minutes counter runs in the header. `screens/11-check-attempt-before-submit-*.png` |
| 6 | stage `answering` | Button **Submit and freeze answer** | Client-side only — no request. The answer becomes a read-only `<pre>`, the rubric appears, and the reference still does not. |
| 7 | stage `graded` | Per rubric line: **met** / **partial** / **missing** | Every line must be marked. |
| 8 | stage `graded` | Overall score: **Can't (0)** / **Partial (1)** / **Fluent (2)** | See the branches below. |
| 9 | stage `graded` | Button **Record grade and reveal reference** | Disabled until the grade is complete; the hint reads *"Grade every rubric line and pick an overall score[, then diagnose the gap]."* *(server)* `POST /api/attempts/submit`. |
| 10 | stage `graded`, recorded | — | The *Recorded* card appears (score chip, *"Next due YYYY-MM-DD. State: {state}."*), then the *Explain-back critique* panel (flow 5), then the *Reference* card, rendered as markdown. `open_attempt_path` is cleared, so AI actions unblock. `screens/12-check-attempt-after-submit-*.png` |
| 11 | — | Button **Back to checks** | Clears `?check=` and re-reads the module. |

### Branch 3a — **Fluent (2)**

- No diagnosis and no category are asked for; the client sends `category: null`,
  `diagnosis: null`.
- Nothing is written to the error ledger.
- Scheduling: the spaced step advances one place through `2 → 7 → 21 → 60` days and
  `next_due = submitted + step`.
- State becomes `proficient` — or `durable` if this is the second `fluent` in a
  different session at least 7 days after an earlier one with no `can't` in between, in
  which case `next_due = submitted + 60` days and the chip turns green.

### Branch 3b — **Partial (1)**

- The fieldset *"This goes to the error ledger — both fields required"* appears:
  *What exactly differed from the reference?* plus an **Error category** select
  (`notation_shape`, `misremembered_mechanism`, `conflated_two_things`,
  `off_by_one_masking`, `statistical_reasoning`, `api_library`, `didnt_know`).
  Both are required client-side; the server returns 422 without them.
- *(server)* the entry is appended to `vault/errors.jsonl` automatically — this is
  the second way errors enter the ledger (see flow 8).
- Scheduling: `next_due = submitted + 2` days; the step index is left where it is.
- State becomes `familiar` (amber chip).

### Branch 3c — **Can't (0)**

- Same required diagnosis and category as 3b, same automatic ledger entry.
- Scheduling: the step index resets to 0 and `next_due = submitted + 2` days.
- State becomes `attempted`.
- If `confidence_pre ≥ 80`, the attempt is flagged an **overconfident miss**: the
  *Recorded* card adds *"Flagged as an overconfident miss — it comes back first."*, an
  amber `overconfident miss` chip appears on the check card, in the due queue, in the
  weekly cold sweep and in the warm-up header, and the item sorts ahead of equally
  overdue ones.

---

## 4. Tidy a note

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Module → **Notes** | The editor | Autosave fires 1.5 s after the last keystroke: *(server)* `PUT /api/modules/{id}/note {body, mtime_ns, frontmatter}`. The indicator reads `Unsaved` → `Saving…` → `Saved`. `screens/07-module-notes-*.png`, `screens/07a-module-notes-mermaid-*.png` |
| 2 | Notes | Button **AI ▾** | Opens the menu with two entries: *Tidy — copy-edit with per-chunk review* and *Explain-back critique — open a Check*. `screens/08-module-notes-ai-menu-open-*.png` |
| 3 | Notes | Menu item **Tidy — copy-edit with per-chunk review** | Opens `TidyDialog`; *(server)* `POST /api/ai/tidy {module_id, text}` streams SSE. |
| 4 | Tidy dialog, phase `streaming` | — | *"Copy-editing… the file is untouched until you accept. Streaming into a shadow buffer."* with the raw `delta` text in a `<pre>`. **Accept all** and **Reject all** are disabled. |
| 5 | Tidy dialog | — | The server runs the invariant checker over input vs output before emitting a verdict: fenced code blocks with their language, inline code, `$…$` and `$$…$$` math, URLs, numbers, checklist items with state, and blockquote lines must all match as multisets, and at most 10 % of the output's word tokens may be new. It then emits a `stats` frame and either `done` or `rejected`. |

### Branch 4a — accept

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 6a | Tidy dialog, phase `review` | — | A `@codemirror/merge` MergeView: original left (read-only), tidied right (editable), per-chunk revert arrows in the gutter, unchanged runs collapsed. Caption: *"Left is your note, right is the tidied version… N tokens added."* `screens/09-module-notes-tidy-mergeview-*.png` |
| 7a | Tidy dialog | Gutter arrows | Take or revert individual chunks in the right-hand buffer. Nothing is written yet. |
| 8a | Tidy dialog | Button **Accept all** | Reads the right-hand buffer as it stands, then *(server)*: `POST /api/vault/snapshot {message: "pre-tidy snapshot: {id}/notes.md"}`, `GET …/note` for a fresh `mtime_ns`, `PUT …/note` with the tidied body. |
| 9a | Notes | — | The editor buffer is replaced without re-saving, and a plain banner reads *"Tidy applied and committed."* On failure the banner reads *"Could not apply the tidy: {message}"* instead. |

### Branch 4b — reject

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 6b | Tidy dialog, phase `review` | Button **Reject all** | Overwrites the right-hand buffer with the original text. The dialog stays open; nothing has been written. |
| 7b | Tidy dialog | Button **Keep original** / **Keep original (Esc)** / the Escape key | Aborts the stream and closes. No snapshot, no `PUT`, the file on disk is byte-identical. |

### Branch 4c — rejected by the invariants

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 6c | Tidy dialog, phase `rejected` | — | An amber banner: **"Rejected by the invariant checker."** plus the server's reason (for example *"numbers differ: 1/sqrt(d_k) became 1/d_k"*). No MergeView is ever built. |
| 7c | Tidy dialog | **Accept all** and **Reject all** | Both remain disabled — the dialog cannot leave the rejected phase. |
| 8c | Tidy dialog | Button **Keep original** | The only exit. The note is untouched. The refusal is still logged to `vault/ai-log.jsonl` with `accepted: false`. |
| 6c′ | Tidy dialog, phase `error` | — | A transport or credential failure shows the message in an amber banner with the same disabled footer. |

---

## 5. Explain-back critique

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Module → **Notes** | Menu item **Explain-back critique — open a Check** | Does *not* run anything. Its tooltip reads *"Critique runs on a submitted attempt, from the Checks tab."* and selecting it switches the module to the Checks tab. |
| 2 | Checks tab | **Attempt** / **Re-test** | Run flow 3 through to step 10 — a critique is only possible on an attempt whose grade has been recorded (the server returns 409 for an unsubmitted attempt). |
| 3 | Attempt flow, recorded | Card *Explain-back critique* | The blurb is fixed: *"Grades your submitted answer against the rubric. It never rewrites and never replaces your own score."* |
| 4 | Attempt flow | Button **Run critique** | *(server)* `POST /api/ai/critique {attempt_path}`, one SSE `done` frame carrying `lines[]` of `{rubric_index, verdict, evidence, missing}`. The attempt file is stamped `ai_critique_used: true` and the call is logged to `vault/ai-log.jsonl`. |
| 5 | Attempt flow | — | Each rubric line gains a muted sub-line *"AI: {verdict} — “{evidence}” · {missing}"*. The learner's own marks and score are not altered. The button reads **Done** and is disabled. `screens/13-check-attempt-critique-panel-*.png` |
| 4′ | Attempt flow | Button **Run critique** disabled | When `ai_available` is false, or an attempt is open elsewhere in the session. The reason is shown as a muted line under the card and as the button's `title`. |

### 5a — AI unavailable

`GET /api/health` reports `ai_available: false` with an `ai_reason`. Every AI entry
stays **visible and disabled**, never hidden: the AI menu shows the reason as a
`role="note"` paragraph above the items and as each item's tooltip; the critique panel
shows the same sentence. `screens/22-ai-unavailable-tooltip-*.png`

---

## 6. Move a resource up the ladder

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Module → **Resources** | — | A table of every resource in the track for this module. `screens/06-module-resources-*.png` |
| 2 | Resources | Link on the title | Opens the resource's `url` in a new tab. |
| 3 | Resources | Select **State of {title}** | *(server)* `PATCH /api/modules/{id}/resources/{rid} {state}` writes `vault/modules/{id}/resources.yaml`. The select is disabled while the request is in flight. The response is the whole refreshed `ModuleDetail`, so the chip, the Overview counts and the module header update together. |
| 4 | Resources | — | The ladder is `queued → skimmed → read → reconstructed → taught`. Only `reconstructed` and `taught` turn the chip green; their tooltip says *"Counts toward the module"*, the other three say *"Does not count toward the module"*. Nothing enforces the order — any state can be picked directly. |
| 5 | Resources | Buttons **+15** / **+30** / **+60** | *(server)* the same `PATCH` with `minutes_delta`. Minutes accumulate per resource and feed the module's hours. |
| 6 | Overview tab | — | *"N listed · M reconstructed or taught (the only two states that count)."* |
| 7 | Resources | Link **Keshav template** (papers only) | Navigates to `?tab=notes&keshav={title}` → a plain banner on the Notes tab: *"Insert the Keshav three-pass stub for “{title}”?"* with an **Insert** button that appends the Five-Cs / one-equation / nearest-neighbour stub to the note buffer and drops the query parameter. |
| 8 | — | On failure | `role="alert"` text above the table; the row's previous state stays. |

---

## 7. Shift the schedule

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Plan `/plan` | — | Header *Coverage NN%*, sub-line with attempted and durable shares. `screens/03-plan-*.png` |
| 2 | Plan | Button **Shift schedule +1 week** | `window.confirm("Move every soft date by one week, from next Monday?")`. Cancelling does nothing. |
| 3 | Plan | — | *(server)* `POST /api/plan/shift {weeks: 1}` increments `offset_weeks` in `vault/plan.yaml` and stamps `offset_from` with the next Monday. The button reads **Shifting…** while in flight. |
| 4 | Plan | — | The response replaces the whole plan. Every module's soft date moves by a week; the sub-line gains *"Schedule shifted N weeks from YYYY-MM-DD."*; module cards' `re-test overdue` chips re-derive. |
| 5 | Weekly review | — | The shift is also what spends the quarter's *banked skips*: `banked_skips = 2 × (quarters elapsed) − offset_weeks`, shown in the sub-line as *"N banked skips left this quarter."* |
| 6 | Module → **Overview** | — | The Schedule card echoes *"Weeks a–b · soft date YYYY-MM-DD · shifted N weeks."* |
| — | — | Filters | **All** / **Not started** / **At risk** / **Blocked** narrow the cards. `At risk` = at least one check past its `next_due`; `Blocked` = a prerequisite module below `familiar`. Phases with nothing left render no heading. |

---

## 8. Log and resolve an error

An entry reaches `vault/errors.jsonl` in one of two ways.

### 8a — logged from an attempt (automatic)

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Attempt flow, stage `graded` | Overall score **Can't (0)** or **Partial (1)** | The required fieldset appears. |
| 2 | Attempt flow | Textarea *What exactly differed from the reference?* + select **Error category** | Both must be filled before **Record grade and reveal reference** enables. |
| 3 | Attempt flow | Button **Record grade and reveal reference** | *(server)* `POST /api/attempts/submit` writes the attempt *and* appends a ledger row carrying the check id, module id, session id, attempt path, the check prompt, the diagnosis and the category. |

### 8b — logged at session close (manual)

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Close session dialog | Button **Add an error** | Adds a row: a category select (defaulting to `didnt_know`) and a diagnosis textarea. |
| 2 | Close dialog | Textarea | An empty diagnosis blocks **Close session**; the server also returns 422 *"every logged error needs a diagnosis"*. |
| 3 | Close dialog | Button **Close session** | Each row is appended to the ledger with the session id and module id. |

### 8c — the error resurfaces

| # | Screen | Where |
| --- | --- | --- |
| 1 | Warm-up | One unresolved error contributes the check it was logged against, chipped `unresolved error`. Errors with no check behind them are skipped rather than drawn. |
| 2 | Weekly review → block 3 | Every unresolved row, newest data from `GET /api/review/weekly`. |

### 8d — resolve

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Weekly review → **3 · Error ledger triage** | — | One card per unresolved error: category chip, module link, timestamp, the diagnosis. `screens/19-review-weekly-*.png` |
| 2 | Error triage | Textarea **Resolution** | **Resolve** stays disabled while it is empty. |
| 3 | Error triage | Button **Resolve** | *(server)* `PATCH /api/errors {id, resolved: true, resolution}`. The card is removed from the list immediately. |
| 4 | Error triage | Link **Re-test the Check it came from** | Only when the row carries a `check_id`; deep-links to `/modules/{module}?tab=checks&check={id}`, i.e. straight into flow 3. |
| 4′ | Error triage | No check behind the row | A static note instead: *"To convert this into a Check, add it to your `track.yaml`."* There is no in-app conversion. |
| 5 | Error triage | All rows resolved | *"No unresolved errors in the ledger."* |

---

## 9. Weekly review

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Review `/review` | Link **Weekly review →** | *(server)* `GET /api/review/weekly`. `screens/18-review-due-*.png` → `screens/19-review-weekly-*.png` |
| 2 | Weekly review | — | Sub-line: *"Week N on plan · N banked skips left this quarter."* Six blocks follow, in a fixed order; there is no wizard, no step gating and no completion state. |
| 3 | **1 · Cold retrieval sweep** | Link **Attempt** per item | Up to ten attempted checks ranked overconfident-misses-first, then least-recently-touched module, then most overdue. Each link opens flow 3 in the owning module. Empty: *"Nothing drawn this week."* |
| 4 | **2 · Calibration** | — | Read-only. The Brier score over every graded attempt, one generated sentence (*"Brier 0.29 over 6 attempts; you are overconfident by 22 points."*), and a reliability table in five buckets of 20 (`0-20` … `80-100`) — Confidence bucket / n / Mean stated / Observed pass rate — where empty buckets print `—` rather than `0%`. "Observed pass rate" is the share of attempts in the bucket scored `fluent`. |
| 5 | **3 · Error ledger triage** | Textarea + **Resolve**, link **Re-test the Check it came from** | Flow 8d. |
| 6 | **4 · Hours and burn-up** | — | Read-only. The same stacked new/review/build bar as Today with its over/under sentence, then a Week / Planned durable / Actual durable table over all 40 weeks. |
| 7 | **5 · Capstone board** | — | Read-only here: a grid of tight cards, title plus state chip. Editing happens on `/capstone` (`screens/20-capstone-board-*.png`) or the module's Capstone tab (`screens/14-module-capstone-*.png`). |
| 8 | **6 · Replan** | Textarea *If-then plans for the week* | Next week's scope is listed from the modules whose week window covers it (or *"nothing scheduled"*). The textarea is **local only** — it is never sent anywhere and is lost on navigation, as its own caption says: *"The plan that shows on Today is the one written at session close; this box is your scratch space for the week."* |
| 9 | Weekly review | Link **← Due queue** | Back to `/review`. |

### Related: the due queue

| # | Screen | Control | What happens |
| --- | --- | --- | --- |
| 1 | Rail | Link **Review** + count badge | The badge is `GET /api/review/due`'s length, refreshed on every vault change and session change. |
| 2 | Review `/review` | — | Cards sorted by days overdue, then by overconfident misses. Only the first four are shown — *"Time-boxed to four at a time."* |
| 3 | Review | Button **Show the other N** | Reveals the rest. |
| 4 | Review | Button **Re-test** | Replaces the screen with the attempt flow (flow 3); closing it re-reads the queue. |
| 5 | Review | Empty queue | *"Nothing is due. Go and learn something new."* |

---

## 10. Cross-cutting behaviours worth knowing

1. **The file is the truth.** Every write goes to the vault as markdown or YAML; the
   server pushes a `changed` SSE event, the client bumps `vaultRevision`, and Today and
   the module page re-read in place. The module page deliberately does *not* unmount on
   a refresh, so a note editor is never torn down mid-autosave.
2. **Note conflicts are refused, never merged.** `PUT …/note` echoes the `mtime_ns` the
   client loaded; a mismatch returns 409 with the on-disk content. The editor then shows
   an amber banner — *"This note changed on disk since it was loaded, so the save was
   refused."* — with exactly two exits: **Reload from disk (discards your edits)** or
   **Keep my version and overwrite**. The save indicator reads *Save refused*.
   `screens/21-note-409-conflict-prompt-*.png`
3. **AI is blocked, not hidden.** `aiBlockedReason` returns the health reason first, then
   *"An attempt is open. Submit or leave it before using AI."* Entries stay in place,
   disabled, carrying the reason.
4. **No AI action ever writes a file by itself.** Tidy streams to a shadow buffer and the
   learner's **Accept all** does the snapshot and the `PUT`; critique only stamps
   `ai_critique_used` on the attempt it graded.
5. **The reference answer is never sent before a grade is recorded** — not by
   `GET /api/curriculum`, not by `GET /api/checks/{id}`, not by the attempt-start
   response. It arrives only in the `POST /api/attempts/submit` reply.
6. **One session at a time.** `POST /api/sessions/start` 409s while another is open; the
   session bar is the only place the phase split, the discard and the close live.
