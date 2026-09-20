# API v2 — decisions made while implementing plan §3 (backend, 2026-09-19)

Frontend packages must code against these exact shapes. Base contract: `docs/superpowers/plans/2026-09-19-learn-redesign-plan.md` §3.

1. `standing.artefacts_total` = `len(capstone)` (8 on the real track).
2. `headline.lasting_pct` / `attempted_pct` are fractions 0–1 (4 dp), same convention as `/plan` `coverage` / `durable_pct`.
3. `topics[].note.path` and `all_notes[].path` are display forms like `a1/attention.md` (legacy module note: `a1/notes.md`). On disk: `vault/modules/a1/notes/attention.md`. Notes are addressed by topic id in the API (`/modules/{id}/notes/{topic}`), never by path.
4. `topics` contains only `kind: idea` topics, numbered `n` from 1. Chores are in `chores[]`, habits in `habits[]`.
5. Row `warning` uses digits: `"2 checks 14 days overdue"`, `"1 check 1 day overdue"`; prerequisite form `"needs <module title> first"` (raised when no check in the prerequisite module is proficient-or-better). Overdue wins over prerequisite.
6. `sources[].action`: `Notes` (rebuilt/taught) → `Resume` (has a position or state past queued) → `Open` (local `path` set) → `Start`. `checks[].action` is `Attempt` or `Re-test`; `checks[].warning` is `"N days overdue"`, else `"missed while sure"`, else null.
7. `slipping`: under → `"7.2 h under budget this week. Under is fine."`; over → `"1.5 h over budget this week. Over is fine too, if you are not fraying."`; equal → `"Exactly on budget this week."`
8. `start_label`: weekly budget ÷ 5 sessions, rounded to whole hours (`"Start · about 2 hours"`); minutes when under an hour.
9. `first_action.label` is the check prompt verbatim; it is the first unattempted core check in phase/module order. Present on first run only.
10. `warmup[].reason` short phrases: `"due for a re-test"`, `"never attempted"`, `"not touched in four weeks"`, `"an error you logged"`; `chip` ∈ due | new | old | error.
11. `ridge[].delta_4w` and `gains.solid_delta_4w` = change in core checks at proficient-or-better over 28 days; `gains.lasting_delta_4w` uses durable.
12. `artefact_state` is `"draft"` or null only.
13. `newly_proved[].date` = day the check first reached solid/lasting; `state` = state today. `calibration_by_week[].week` = track week from the plan start date.
14. Week cells: a past week inside the current phase reads `"past"` (past beats phase).
15. `POST /jots/file` accepts optional `module_id`; inferred from the jots when omitted; 422 if the jots span modules. Filing appends a filed-marker line (fold by id); `ts` stays the capture time.
16. v1 curriculum tolerance also synthesises one area per phase when `areas` is missing, so the Desk ridge renders on a v1 file.
17. `all_notes` / `note.exists` are read from files via `store.note_rows`, not the sqlite `notes` table (tests run without the index lifespan).

Weekly debrief additions: `hours_last_4_weeks: [{week, new, review, build}]`, `shipped: [{id, title, state}]`, buckets carry `said` and `was` alongside the old `mean_confidence` / `observed`.

Curriculum: phase p2's module list is in do-order (`b0, b1, b2, b3, a5, a6`) to match its `order_note`; the Track "This phase" band renders modules in list order.

---

## Package D additions (integration, 2026-09-19)

### The freeze step

The attempt is two calls now, because the reveal and the grade are two different moments.

```
POST /attempts/freeze  {attempt_path, answer}
  → {attempt_path, reference, draft_reference, rubric, frozen}
POST /attempts/submit  {attempt_path, rubric, score, category?, diagnosis?}
  → unchanged shape (attempt_path, reference, draft_reference, score, state,
                     durable, overconfident_miss, next_due)
```

18. **Freezing stamps `submitted` and stores the answer; it does not grade.** A frozen
    attempt has `submitted` set and `score` null, so it is invisible to the ladder
    (`store.graded_attempts` needs both) and the check's state does not move until the
    grade lands.
19. **The reveal gate is the freeze.** `reference` appears in exactly two responses —
    `POST /attempts/freeze` and `POST /attempts/submit` — plus the critique prompt. It is
    in no `GET`: not `/checks/{id}`, not the attempt-start body, not `/modules/{id}`, not
    `/curriculum`, not the due queue or the warm-up.
20. **`POST /attempts/submit` still accepts the old combined form.** `answer` is optional:
    send it and the call freezes and grades in one step (the v1 behaviour); omit it and the
    attempt must already be frozen, or the call is 422. A frozen answer is never rewritten
    by the grade — `answer` on a frozen attempt is ignored in favour of what was frozen.
21. **409s.** Freezing an already-frozen attempt is 409; grading an already-graded one is
    409. Freezing then grading is the normal path and neither is a conflict.
22. **Freezing is what unlocks the AI.** `store.open_attempts` counts unfrozen attempts
    only, so `/ai/tidy` and `/ai/critique` stop returning 423 the moment the answer is
    frozen — which is what lets the second opinion sit beside the self-grade at stage 3.
    `/ai/critique` still requires `submitted`, which a frozen attempt has.

### Session counters

23. `GET /sessions/current` gains `checks_attempted` (attempts started in this session) and
    `errors_logged` (ledger rows carrying this session id). Both are counted from the vault,
    not tallied in the browser, so they survive a reload mid-session. Both also require the
    row's timestamp to be at or after the session's `started`: discarding a session frees
    its id for the next one the same day, and without that guard a new session inherited the
    discarded one's graded attempts.

### `topic_id` on every check

24. Every check row — `GET /checks/{id}`, `modules[].checks[]`, `topics[].checks[]`, the due
    queue, the warm-up draw — carries `topic_id`: the authored topic that owns the check, or
    `null` when it is in the implicit `other` bucket (which is every check on a v1 file). The
    client uses it to return to the module with the right topic already open after recording
    a grade.

### `behind` and `expected_hours_by_now`

25. Every module card (`GET /modules/{id}`, and the `/plan` cards, which share one builder)
    gains `expected_hours_by_now` — the budget prorated over how much of the module's week
    window has passed — and `behind`, true when the soft date has passed with budget unspent,
    or when less is logged than the elapsed share of the window expects. The sidebar reads
    `behind` rather than working it out from dates in the browser.

### Health

26. `health.ai_reason` for a missing credential is exactly, backticks and all:
    ``No API credential found. Run `ant auth login`, or set `ANTHROPIC_API_KEY`.`` It is the
    same sentence `ai.NO_CREDENTIAL` puts in an SSE `error` frame, so the reason reads the
    same wherever it appears. The client no longer rewrites it — it only drops the backticks,
    because it sets exactly those two spans in mono itself.

### Contract corrections found while reconciling

27. `DueItem.next_due` is nullable: the warm-up draws never-attempted checks, which have no
    schedule yet. (`types.ts` said `string`.)
28. `GET /today` carries `current_module_id`, which the types had not recorded.
29. `headline.lasting_pct` / `attempted_pct` are fractions 0–1 (note 2). The Track screen was
    printing them raw — "0.0667% have been attempted" — and now multiplies.
30. A resource's `meta` line rounds the stored position (`video · 95 of 116 min`): minutes
    accrue a second at a time in focus mode, so the stored value is usually fractional.
