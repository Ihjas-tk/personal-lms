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

---

## Package A additions (open-sourcing, 2026-09-20)

The app no longer knows what subject it is running. Everything below exists so a
curriculum written for any subject renders without a code change.

31. **Curriculum resolution order**, highest first: `learn --curriculum PATH` →
    `LEARN_CURRICULUM` → `<vault>/track.yaml` → `learn/curriculum/track.yaml` (the
    legacy in-repo copy, if it is still there) → `config.CurriculumNotFound`, whose
    message lists every path tried and names `learn init`. The vault resolves the
    same way, one step shorter: `--vault` → `LEARN_VAULT` → `<project>/vault`. The
    port too: `--port` → `LEARN_PORT` → 8765. CLI flags are recorded with
    `config.set_overrides(...)`, which clears the `lru_cache` behind `get_config()`,
    so tests that set `LEARN_VAULT` / `LEARN_CURRICULUM` and call `config.reset()`
    behave exactly as before.

32. **`track` is a free string.** `Module.track` was `Literal["llm","evals","shared"]`
    and is now `str`, defaulting to `""` (it was `"shared"`). The UI prints it and
    never switches on it; `ModuleSummary.track` and `ModuleDetail.track` in `types.ts`
    are `string`. A module with no label renders without a dangling separator.

33. **`weeks_total` is derived, not a constant.** `Track.total_weeks` is the largest
    `weeks[1]` across phases and modules. `GET /desk` and `GET /track` both report it,
    `standing.weeks_left` and the `/track` week strip are computed against it, and
    `end_date` is `start_date + total_weeks + offset`. `derive.WEEKS_TOTAL` survives
    only as the default argument for callers with no curriculum in hand — no route
    uses it any more.

34. **New curriculum field `debrief_day: str = "Sunday"`.** Exposed on both overview
    payloads as `debrief_day`, and used for `plan.written_on` (which was the module
    constant `PLAN_WRITTEN_ON`). The client reads it through `useDebriefDay()` and
    renders `debriefLabel(day)` → `"<day> debrief"`; the Wrap-up IF-cue placeholder
    uses `ifCuePlaceholder(day)`. `labels.DEBRIEF` remains, as the label on the
    default day, for anything rendered before the Desk payload lands.

35. **Payload additions are additive.** `GET /desk` gains `debrief_day`; `GET /track`
    gains `debrief_day`. No field was removed or renamed.

36. **The flagship track moved** to `tracks/llm-engineering-and-evals/track.yaml`, and
    is copied into `learn/vault/track.yaml` for the existing install (step 3 of the
    resolution order). `learn/curriculum/` now holds only the generated
    `schema.json`. Both Playwright configs name the moved file in `LEARN_CURRICULUM`,
    because they run against an empty throwaway vault that has no track of its own.

37. **`curriculum/schema.json`** is generated from the `Track` root model by
    `learn schema` (`src/learn/schema.py`); `learn schema --check` fails on drift and
    `tests/test_cli_schema.py` runs it. The prose version is
    `docs/curriculum-schema.md` at the repo root.

38. **`POST /ai/restructure {module_id, topic_id, text}`** is the third AI action and the
    second one over a note. It streams the same frames as `/ai/tidy` — `delta`, `retry`,
    `stats`, `done`, `rejected`, `error` — with the same single retry, the same 423 while
    an answer is open, and 404 when the module or the topic is unknown. It differs in what
    it sends and what it checks: the router hands the model the topic's module title, topic
    title and every resource it owns (title, kind, url, curriculum order), and the result
    is judged by `invariants.check_structure` rather than `invariants.check`. That checker
    keeps the code, inline-code, maths, URL and checklist comparisons as *retention* — the
    result may add, never lose — drops the blockquote comparison (the `> From:` line is a
    new blockquote) and the 10 percent new-token limit, and adds a content floor: at least
    90 percent of the note's own words of five letters or more must still be there. Numbers
    may not be lost, changed or invented, except for the ones already in the context block,
    since the source line is built from it. Log rows carry `mode: "restructure"` and
    `target: "<module_id>/<topic_id>"`, and every row now also carries
    `estimated_cost_usd`, priced from `ai.PRICES`. `GET /review/weekly` gains
    `ai_spend: {days, calls, usd}` over the last seven days.
