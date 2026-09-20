/**
 * Types for the `learn` API (design spec §8).
 * Field names follow the spec's YAML/markdown examples (§4.1, §5.1, §5.2, §5.3).
 * Anything the spec does not name explicitly is marked ASSUMED in api.ts's header
 * comment so the integration pass can reconcile it.
 */

export type CheckType = "explain" | "code" | "derive" | "judge" | "numeric";
export type LadderState =
  | "not_started"
  | "attempted"
  | "familiar"
  | "proficient"
  | "durable";
export type Score = "cant" | "partial" | "fluent";
export type RubricMark = "met" | "partial" | "missing";
export type ResourceState =
  | "queued"
  | "skimmed"
  | "read"
  | "reconstructed"
  | "taught";
export type ResourceKind =
  | "paper"
  | "video"
  | "course"
  | "repo"
  | "doc"
  | "book";
export type CapstoneState =
  | "not_started"
  | "draft"
  | "working"
  | "reviewed"
  | "done";
export type SessionPhase = "new" | "review" | "build";
export type ErrorCategory =
  | "notation_shape"
  | "misremembered_mechanism"
  | "conflated_two_things"
  | "off_by_one_masking"
  | "statistical_reasoning"
  | "api_library"
  | "didnt_know";

export const ERROR_CATEGORIES: ErrorCategory[] = [
  "notation_shape",
  "misremembered_mechanism",
  "conflated_two_things",
  "off_by_one_masking",
  "statistical_reasoning",
  "api_library",
  "didnt_know",
];

export interface Health {
  ok: boolean;
  ai_available: boolean;
  ai_reason: string | null;
  vault_git: boolean;
}

export interface ActivityDay {
  date: string;
  hours: number;
}

export interface WeekHours {
  new: number;
  review: number;
  build: number;
  budget: number;
}

export interface NextAction {
  label: string;
  module_id: string | null;
  check_id?: string | null;
  resource_id?: string | null;
  kind: "retest" | "check" | "resource" | "none";
}

export interface Today {
  plan_text: string | null;
  /** The module the plan points at; null before anything is scheduled. */
  current_module_id: string | null;
  next_action: NextAction;
  due_count: number;
  week_hours: WeekHours;
  activity: ActivityDay[];
}

export interface ModuleSummary {
  id: string;
  phase: string;
  /** A free label the curriculum author chose; printed, never switched on. */
  track: string;
  title: string;
  weeks: [number, number];
  budget_hours: number;
  actual_hours: number;
  state: LadderState;
  soft_date: string | null;
  at_risk: boolean;
  blocked: boolean;
  coverage: number;
}

export interface PhaseSummary {
  id: string;
  title: string;
  weeks: [number, number];
  modules: ModuleSummary[];
}

export interface Plan {
  phases: PhaseSummary[];
  coverage: number;
  attempted_pct: number;
  durable_pct: number;
  offset_weeks: number;
  offset_from: string | null;
}

export interface ResourceRow {
  id: string;
  title: string;
  kind: ResourceKind;
  url?: string | null;
  est_minutes?: number | null;
  state: ResourceState;
  minutes: number;
  path?: string | null;
  /** Redesign §2: how far through, in the resource's own unit. */
  position?: number | null;
}

export interface CheckSummary {
  id: string;
  module: string;
  /** The topic that owns this check; null for anything in the implicit `other` bucket. */
  topic_id: string | null;
  type: CheckType;
  must_cover: boolean;
  prompt: string;
  state: LadderState;
  next_due: string | null;
  last_score: Score | null;
  attempt_count: number;
  draft_reference: boolean;
  est_minutes?: number | null;
  overconfident_miss?: boolean;
}

export interface CapstoneArtefact {
  id: string;
  title: string;
  description?: string | null;
  modules: string[];
  state: CapstoneState;
  path?: string | null;
  notes?: string | null;
  next_action?: string | null;
}

export interface ModuleDetail {
  id: string;
  phase: string;
  /** A free label the curriculum author chose; printed, never switched on. */
  track: string;
  title: string;
  weeks: [number, number];
  budget_hours: number;
  actual_hours: number;
  soft_date: string | null;
  offset_weeks: number;
  state: LadderState;
  coverage: number;
  /** Redesign §1d: the budget prorated over how much of the week window has passed. */
  expected_hours_by_now: number;
  /** Soft date passed with budget unspent, or less logged than the window expects. */
  behind: boolean;
  must_cover: string[];
  resources: ResourceRow[];
  checks: CheckSummary[];
  capstone: CapstoneArtefact[];
}

export interface Note {
  frontmatter: Record<string, unknown>;
  body: string;
  mtime_ns: number;
  /** Topic notes echo their display path (`a1/attention.md`); the module note does not. */
  path?: string;
}

export interface CheckDetail extends CheckSummary {
  rubric: string[];
  attempts: AttemptSummary[];
}

export interface AttemptSummary {
  path: string;
  check_id: string;
  session_id: string | null;
  started: string;
  submitted: string | null;
  confidence_pre: number;
  score: Score | null;
  rubric: RubricMark[];
  category: ErrorCategory | null;
  diagnosis?: string | null;
  answer?: string | null;
  warmup: boolean;
  ai_critique_used: boolean;
  overconfident_miss?: boolean;
}

export interface AttemptStart {
  attempt_path: string;
  check_id: string;
  started: string;
}

/** `POST /api/attempts/freeze` — the one response that reveals the reference. */
export interface AttemptFreezeResult {
  attempt_path: string;
  reference: string;
  draft_reference: boolean;
  rubric: string[];
  frozen: string;
}

export interface AttemptSubmitResult {
  attempt_path: string;
  score: Score;
  /** Still echoed here: the old combined form reveals it on submit. */
  reference: string;
  next_due: string;
  state: LadderState;
  overconfident_miss: boolean;
}

export interface DueItem {
  check_id: string;
  module_id: string;
  prompt: string;
  type: CheckType;
  overdue_days: number;
  /** Null for a check that has never been attempted (the warm-up draws those too). */
  next_due: string | null;
  overconfident_miss: boolean;
  state: LadderState;
}

export interface WarmupItem extends DueItem {
  reason: "due" | "last_session" | "old_module" | "error" | "unattempted";
  error_id?: string | null;
}

export type * from "./types.session";
export type * from "./types.redesign";
