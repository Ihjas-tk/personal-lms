/**
 * Review, sessions and the AI surfaces. Split out of `types.ts` so that file stays
 * one screenful; `types.ts` re-exports everything here, so every import is unchanged.
 */
import type {
  CapstoneArtefact,
  DueItem,
  ErrorCategory,
  RubricMark,
  SessionPhase,
  WeekHours,
} from "./types";

export interface CalibrationBucket {
  bucket: string;
  n: number;
  mean_confidence: number;
  observed: number;
  /** Redesign §3: what you said (0–100) against what happened (0–100). */
  said?: number;
  was?: number;
}

export interface LedgerError {
  id: string;
  ts: string;
  check_id: string | null;
  module_id: string | null;
  category: ErrorCategory;
  diagnosis: string;
  resolved: boolean;
  resolution?: string | null;
  /** Present on errors written by an attempt submitted inside a session. */
  session_id?: string | null;
  text?: string | null;
}

export interface BurnUpPoint {
  week: number;
  planned: number;
  durable: number;
}

export interface WeeklyReview {
  /** The cold sweep is drawn from attempted checks, not the warm-up draw — no `reason`. */
  retrieval_sweep: DueItem[];
  calibration: {
    brier: number;
    buckets: CalibrationBucket[];
    sentence: string;
  };
  errors: LedgerError[];
  hours: { week_hours: WeekHours; modules: { id: string; title: string; budget_hours: number; actual_hours: number }[] };
  burn_up: BurnUpPoint[];
  capstone: CapstoneArtefact[];
  /** What the AI actions cost at list price over the last seven days. */
  ai_spend?: { days: number; calls: number; usd: number };
  weeks_on_plan: number;
  banked_skips: number;
  replan: { module_id: string; title: string; weeks: [number, number] }[];
}

export interface Session {
  id: string;
  module_id: string;
  started: string;
  closed: string | null;
  phase: SessionPhase;
  minutes: Record<SessionPhase, number>;
  elapsed_seconds: number;
  warmup_skipped: boolean;
  open_attempt_path: string | null;
  /** Attempts started in this session, counted from the vault (§1b). */
  checks_attempted: number;
  /** Ledger rows carrying this session id. */
  errors_logged: number;
}

export interface SessionClose {
  reflection: string;
  if_cue: string;
  then_action: string;
  fatigue: number;
  errors: { category: ErrorCategory; diagnosis: string; check_id?: string | null }[];
}

export interface CritiqueLine {
  rubric_index: number;
  verdict: RubricMark;
  evidence: string;
  missing: string;
}

export interface CritiqueResult {
  lines: CritiqueLine[];
}

export interface TidyStats {
  tokens_added: number;
  input_tokens?: number;
  output_tokens?: number;
}
