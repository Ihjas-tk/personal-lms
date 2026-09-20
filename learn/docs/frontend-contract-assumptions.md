# Frontend contract assumptions (from the frontend build agent, 2026-09-19)

The spec fixes paths and a few payloads. Everything below was inferred by the frontend and lives in `web/src/types.ts`. The integration pass must make the backend match these or update both sides consistently.

| Endpoint | Assumed shape |
|---|---|
| `GET /today` | `{plan_text: string\|null, next_action: {label, module_id, check_id?, resource_id?, kind: "retest"\|"check"\|"resource"\|"none"}, due_count: number, week_hours: {new, review, build, budget}, activity: [{date, hours}]}` |
| `GET /plan` | `{phases: [{id, title, weeks:[n,n], modules: ModuleSummary[]}], coverage, attempted_pct, durable_pct, offset_weeks, offset_from}`; `ModuleSummary` adds `actual_hours, state, soft_date, at_risk, blocked, coverage` (computed server-side) |
| `POST /plan/shift` | returns the updated `Plan` |
| `GET /modules/{id}` | `ModuleDetail` = module fields + `resources: ResourceRow[]` (curriculum fields merged with `resources.yaml` state) + `checks: CheckSummary[]` + `capstone: CapstoneArtefact[]` + `actual_hours, coverage, offset_weeks` |
| `PATCH /modules/{id}/resources/{rid}` | returns the whole updated `ModuleDetail` |
| `GET /checks/{id}` | `CheckSummary` + `rubric: string[]` + `attempts: AttemptSummary[]`; `draft_reference: boolean` surfaces the "draft reference, verify" badge; optional `overconfident_miss` on the latest attempt |
| `POST /checks/{id}/attempts` | body `{session_id: string\|null, confidence_pre: number}` (null when no open session); returns `{attempt_path, check_id, started}` |
| `POST /attempts/submit` | returns `{attempt_path, score, reference, next_due, state, overconfident_miss}` |
| `GET /review/due` | `DueItem[]` with `{check_id, module_id, prompt, type, overdue_days, next_due, overconfident_miss, state}`, already sorted |
| `GET /sessions/warmup` | `DueItem` + `reason: "due"\|"last_session"\|"old_module"\|"error"\|"unattempted"` + optional `error_id` |
| `GET /review/weekly` | `{retrieval_sweep, calibration:{brier, buckets:[{bucket, n, mean_confidence, observed}], sentence}, errors, hours:{week_hours, modules}, burn_up:[{week, planned, durable}], capstone, weeks_on_plan, banked_skips, replan}` |
| `GET /sessions/current` | `Session\|null` with `{id, module_id, started, closed, phase, minutes, elapsed_seconds, warmup_skipped, open_attempt_path}` — `open_attempt_path` is used client-side to block AI while an attempt is open |
| `PATCH /sessions/current` | `{phase?}` for the phase switch, `{warmup_skipped?: true}` |
| `POST /sessions/close` | `{reflection, if_cue, then_action, fatigue, errors: [{category, diagnosis, check_id?}]}` |
| `POST /sessions/discard` | `{ok}`, empty body |
| `GET/POST/PATCH /errors` | `LedgerError = {id, ts, check_id, module_id, category, diagnosis, resolved, resolution?}`; PATCH body `{id, resolved?, resolution?}` |
| `GET/PATCH /capstone` | PATCH body `{id, state?, path?, notes?, next_action?}`, returns the full array |
| `POST /vault/snapshot` | body `{message}`, returns `{ok, committed}` |
| `POST /ai/tidy` (SSE) | `delta` as `{text}` (bare JSON string also accepted); `stats` as `{tokens_added, input_tokens?, output_tokens?}`; `rejected` as `{reason}`; `done` as `{text?, stats?}`; `error` as `{message}` |
| `POST /ai/critique` (SSE) | one `done` frame `{lines: [{rubric_index, verdict: met\|partial\|missing, evidence, missing}]}` |
| `GET /events` | `EventSource`; a `changed` event (or bare `message`) bumps a revision counter |
| errors generally | non-2xx bodies read as `{detail}`; 409 on `…/note` as `{detail, current: Note}` (client also tolerates the body being the Note itself) |

UI decisions: the rail's fifth destination is a flat Modules index at `/modules`; the Keshav template for `paper` resources is inserted client-side into the note buffer (no endpoint).

---

## Resolution (integration pass, 2026-09-19)

Every row above is now the live contract. The backend was changed to match the frontend's
typed shapes in all but one case: `WeeklyReview.retrieval_sweep` is typed `DueItem[]`, not
`WarmupItem[]` — the cold sweep is drawn from attempted checks and has no `reason`, and the
screen never reads one.

Backend responses that changed: `/plan` (flat `coverage`/`attempted_pct`/`durable_pct`,
module flags flattened), `/today` (`plan_text`, `next_action.label`/`check_id`/`resource_id`
and never null, `week_hours` as `{new, review, build, budget}`, activity in hours),
`/modules/{id}` (flat, `must_cover`), `PATCH …/resources/{rid}` (returns the module),
`/checks/{id}` and every queue row (`check_id`, `module_id`, `draft_reference`),
`POST /checks/{id}/attempts` (`check_id` + `started`, nullable `session_id`),
`/review/due`, `/errors`, `/capstone`, `/sessions/warmup` (bare arrays),
`/review/weekly` (`retrieval_sweep`, flat `weeks_on_plan`/`banked_skips`, `replan`,
`hours.week_hours`, buckets carry `observed`), `/sessions/*` (the session object itself,
with `elapsed_seconds` and `open_attempt_path`; close takes `if_cue`/`then_action`),
`/sessions/discard` (`{ok}`), and the note 409 (`current` at the top level).
