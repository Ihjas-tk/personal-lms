import type {
  CapstoneState,
  CheckSummary,
  LadderState,
  ModuleDetail,
  ResourceRow,
  WeeklyReview,
  WeekHours,
} from "./types";
/* ---------------------------------------------------------- redesign v2 */
/** Plan §3: `GET /api/desk`, `GET /api/track`, and the extended weekly payload. */

export interface DeskWarmupItem {
  check_id: string;
  module_id: string;
  prompt: string;
  reason: string;
  chip: "due" | "new" | "old" | "error";
}

export interface RidgeColumn {
  area_id: string;
  title: string;
  scope: string;
  counts: {
    lasting: number;
    solid: number;
    shaky: number;
    tried: number;
    untouched: number;
  };
  delta_4w: number;
}

export interface Desk {
  first_run: boolean;
  week_now: number;
  /** Derived from the curriculum's phases — never a constant. */
  weeks_total: number;
  /** Curriculum `debrief_day`, default "Sunday". Drives every "<day> debrief" label. */
  debrief_day: string;
  plan: { text: string; written_on: string } | null;
  start_label: string;
  first_action: { label: string; module_id: string; check_id: string } | null;
  warmup: DeskWarmupItem[];
  standing: {
    checks_lasting: number;
    core_total: number;
    artefacts_exist: number;
    artefacts_total: number;
    artefact_note: string | null;
    weeks_left: number;
    weekly_budget: number;
    skips_banked: number;
  };
  ridge: RidgeColumn[];
  gains: {
    lasting_delta_4w: number;
    solid_delta_4w: number;
    checks_attempted_4w: number;
    hours_4w: number;
  };
  calibration_by_week: { week: number; brier: number }[];
  newly_proved: {
    check_id: string;
    module_id: string;
    prompt: string;
    date: string;
    state: LadderState;
  }[];
  hours: WeekHours;
  slipping: string;
}

export type RowTone = "late" | "now" | "later";

export interface TrackRow {
  module_id: string;
  title: string;
  track: string;
  weeks: [number, number];
  due: string | null;
  tone: RowTone;
  hours_logged: number;
  hours_budget: number;
  proof: { total: number; lasting: number; solid: number; partial: number };
  proof_text: string;
  warning: string | null;
  action: "Resume" | "Open" | "Preview";
  artefact_state: "draft" | null;
}

export interface TrackWeek {
  week: number;
  state: "past" | "phase" | "current" | "future";
  phase_id: string | null;
}

export interface Track {
  start_date: string;
  end_date: string;
  week_now: number;
  /** Derived from the curriculum's phases — never a constant. */
  weeks_total: number;
  /** Curriculum `debrief_day`, default "Sunday". */
  debrief_day: string;
  headline: {
    lasting_pct: number;
    attempted_pct: number;
    core_total: number;
    lasting_total: number;
  };
  offset_weeks: number;
  offset_from: string | null;
  weeks: TrackWeek[];
  unfinished: TrackRow[];
  this_phase: {
    phase_id: string;
    title: string;
    weeks: [number, number];
    hours_budget: number;
    order_note: string | null;
    rows: TrackRow[];
  } | null;
  later: TrackRow[];
}

/** §3 extends the weekly payload; the v1 fields all stay. */
export interface DebriefExtras {
  hours_last_4_weeks?: { week: number; new: number; review: number; build: number }[];
  shipped?: { id: string; title: string; state: CapstoneState }[];
}

export type Debrief = WeeklyReview & DebriefExtras;

/* ------------------------------------------------- module workspace (§3) */
/** `GET /api/modules/{id}` extended: the syllabus of topics, chores and habits. */

export type TopicKind = "idea" | "chore" | "habit";
export type TopicState = "proved" | "in_progress" | "not_started";
export type ResourceUnit = "min" | "pages" | "items";

/** A resource as the workspace shows it: a position, a percentage and one verb. */
export interface SourceRow extends ResourceRow {
  position: number | null;
  length: number;
  unit: ResourceUnit;
  pct: number;
  /** "video · 95 of 116 min", "course · not opened". */
  meta: string;
  action: "Resume" | "Open" | "Start" | "Notes";
  counts: boolean;
  /** The learner's own call that this source is finished, at whatever rung. */
  done: boolean;
  done_at?: string | null;
  position_updated?: string | null;
}

export interface TopicNote {
  exists: boolean;
  /** Display form: `a1/attention.md`. Notes are addressed by topic id, never by path. */
  path: string;
  excerpt: string;
  updated: string | null;
}

export interface TopicCheck extends CheckSummary {
  check_id: string;
  module_id: string;
  overdue_days: number;
  at_risk: boolean;
  durable: boolean;
  /** "14 days overdue" · "missed while sure" · null. */
  warning: string | null;
  action: "Attempt" | "Re-test";
}

export interface Topic {
  id: string;
  title: string;
  summary: string;
  kind: TopicKind;
  n: number;
  state: TopicState;
  /** What the checks and sources say on their own; `state` may override it. */
  derived_state: TopicState;
  state_set_by_you: boolean;
  state_set_at: string | null;
  sources: SourceRow[];
  note: TopicNote;
  checks: TopicCheck[];
  proof_text: string;
}

export interface Chore {
  topic_id: string;
  title: string;
  done: boolean;
  done_at: string | null;
}

export interface Habit {
  topic_id: string;
  title: string;
}

export interface NoteIndexEntry {
  path: string;
  topic_id: string | null;
  updated: string | null;
  words: number;
}

export interface ModuleWorkspace extends ModuleDetail {
  area_id: string;
  overdue_retests: number;
  topics: Topic[];
  chores: Chore[];
  habits: Habit[];
  all_notes: NoteIndexEntry[];
  step_summary: string;
}

/** `vault/jots.jsonl` — the lines captured in focus mode before they are filed. */
export interface Jot {
  id: string;
  ts: string;
  module_id: string;
  topic_id: string | null;
  resource_id: string | null;
  stamp: string | null;
  text: string;
  filed: string | false | null;
}
