/**
 * Typed fetch wrappers for every endpoint in design spec §8.
 *
 * Request/response shapes that the spec names explicitly are used verbatim.
 * Shapes the spec leaves open are marked ASSUMED here and listed in the
 * hand-off notes so the integration pass can reconcile them.
 */
import type {
  AttemptFreezeResult,
  AttemptStart,
  AttemptSubmitResult,
  CapstoneArtefact,
  CheckDetail,
  Debrief,
  Desk,
  DueItem,
  ErrorCategory,
  Health,
  Jot,
  LedgerError,
  ModuleWorkspace,
  Note,
  Plan,
  ResourceState,
  RubricMark,
  Score,
  Session,
  SessionClose,
  SessionPhase,
  Today,
  Track,
  WarmupItem,
} from "./types";
import { ApiError, ConflictError } from "./error";
import type { SseEvent } from "./sse";

export { ApiError, ConflictError };
export type { SseEvent };
export {
  critique,
  restructure,
  sseStream,
  subscribeEvents,
  tidy,
  type TidyHandlers,
} from "./api.ai";

const BASE = "/api";

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = init ?? {};
  const headers = new Headers(rest.headers);
  if (json !== undefined) headers.set("content-type", "application/json");
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    if (res.status === 409 && path.includes("/note")) throw new ConflictError(body);
    const detail =
      (body as { detail?: string } | null)?.detail ?? `${res.status} ${res.statusText}`;
    throw new ApiError(res.status, detail, body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ---------------------------------------------------------------- health */

export const getHealth = () => request<Health>("/health");

/* ------------------------------------------------------ curriculum / plan */

export const getCurriculum = () => request<unknown>("/curriculum");
export const getPlan = () => request<Plan>("/plan");
export const shiftPlan = (weeks: number) =>
  request<Plan>("/plan/shift", { method: "POST", json: { weeks } });

/* -------------------------------------------------------- desk / today */

export const getToday = () => request<Today>("/today");

/** Redesign §3. `/today` stays for anything that still wants the v1 shape. */
export const getDesk = () => request<Desk>("/desk");

/** Redesign §3. Replaces `/plan` on the Track screen; `/plan` stays. */
export const getTrack = () => request<Track>("/track");

/* ------------------------------------------------------------- modules */

export const getModule = (id: string) =>
  request<ModuleWorkspace>(`/modules/${encodeURIComponent(id)}`);

export const getNote = (id: string) =>
  request<Note>(`/modules/${encodeURIComponent(id)}/note`);

/** PUT must echo `mtime_ns`; a mismatch is a 409 carrying the current content. */
export const putNote = (
  id: string,
  payload: { body: string; mtime_ns: number; frontmatter?: Record<string, unknown> },
) =>
  request<Note>(`/modules/${encodeURIComponent(id)}/note`, {
    method: "PUT",
    json: payload,
  });

export const patchResource = (
  moduleId: string,
  resourceId: string,
  patch: {
    state?: ResourceState;
    minutes_delta?: number;
    path?: string | null;
    done?: boolean;
    position?: number | null;
  },
) =>
  request<ModuleWorkspace>(
    `/modules/${encodeURIComponent(moduleId)}/resources/${encodeURIComponent(resourceId)}`,
    { method: "PATCH", json: patch },
  );

/* ------------------------------------------- topic notes, chores and jots */

/** One topic's note. An unwritten note reads as empty with `mtime_ns` 0. */
export const getTopicNote = (moduleId: string, topicId: string) =>
  request<Note>(
    `/modules/${encodeURIComponent(moduleId)}/notes/${encodeURIComponent(topicId)}`,
  );

/** Same `mtime_ns` contract as the module note: a mismatch is a 409 with `current`. */
export const putTopicNote = (
  moduleId: string,
  topicId: string,
  payload: { body: string; mtime_ns: number; frontmatter?: Record<string, unknown> },
) =>
  request<Note>(
    `/modules/${encodeURIComponent(moduleId)}/notes/${encodeURIComponent(topicId)}`,
    { method: "PUT", json: payload },
  );

/** Tick or untick one set-up chore; the whole module comes back. */
/** The learner's own call on a topic; `null` hands it back to the checks. */
export const patchTopicState = (
  moduleId: string,
  topicId: string,
  state: "not_started" | "in_progress" | "proved" | null,
) =>
  request<ModuleWorkspace>(
    `/modules/${encodeURIComponent(moduleId)}/topics/${encodeURIComponent(topicId)}`,
    { method: "PATCH", json: { state } },
  );

export const patchChore = (moduleId: string, topicId: string, done: boolean) =>
  request<ModuleWorkspace>(
    `/modules/${encodeURIComponent(moduleId)}/chores/${encodeURIComponent(topicId)}`,
    { method: "PATCH", json: { done } },
  );

export const getJots = (query: { module_id?: string; unfiled?: boolean } = {}) => {
  const p = new URLSearchParams();
  if (query.module_id) p.set("module_id", query.module_id);
  if (query.unfiled !== undefined) p.set("unfiled", String(query.unfiled));
  const qs = p.toString();
  return request<Jot[]>(`/jots${qs ? `?${qs}` : ""}`);
};

export const postJot = (payload: {
  module_id: string;
  topic_id?: string | null;
  resource_id?: string | null;
  stamp?: string | null;
  text: string;
}) => request<Jot>("/jots", { method: "POST", json: payload });

/** Appends the named jots to one topic note under `## Jots` and marks them filed. */
export const fileJots = (payload: {
  ids: string[];
  topic_id: string;
  module_id?: string | null;
}) => request<Note>("/jots/file", { method: "POST", json: payload });

/* -------------------------------------------------- checks and attempts */

export const getCheck = (id: string) =>
  request<CheckDetail>(`/checks/${encodeURIComponent(id)}`);

export const startAttempt = (
  checkId: string,
  payload: { session_id: string | null; confidence_pre: number },
) =>
  request<AttemptStart>(`/checks/${encodeURIComponent(checkId)}/attempts`, {
    method: "POST",
    json: payload,
  });

/**
 * Stage 2 → 3. The answer is final from here; this is the only call that hands back
 * the reference, and freezing is also what re-opens the AI actions.
 */
export const freezeAttempt = (payload: { attempt_path: string; answer: string }) =>
  request<AttemptFreezeResult>("/attempts/freeze", { method: "POST", json: payload });

/** The grade. `answer` is sent only by the old combined form, which the API still takes. */
export const submitAttempt = (payload: {
  attempt_path: string;
  answer?: string;
  rubric: RubricMark[];
  score: Score;
  category?: ErrorCategory | null;
  diagnosis?: string | null;
}) => request<AttemptSubmitResult>("/attempts/submit", { method: "POST", json: payload });

/* -------------------------------------------------------------- review */

export const getDue = () => request<DueItem[]>("/review/due");
export const getWeeklyReview = () => request<Debrief>("/review/weekly");

/* ------------------------------------------------------------ sessions */

export const getCurrentSession = () => request<Session | null>("/sessions/current");
export const startSession = (moduleId: string) =>
  request<Session>("/sessions/start", { method: "POST", json: { module_id: moduleId } });
export const closeSession = (payload: SessionClose) =>
  request<Session>("/sessions/close", { method: "POST", json: payload });
export const discardSession = () =>
  request<{ ok: boolean }>("/sessions/discard", { method: "POST", json: {} });
export const patchSession = (patch: { phase?: SessionPhase; warmup_skipped?: boolean }) =>
  request<Session>("/sessions/current", { method: "PATCH", json: patch });
export const getWarmup = () => request<WarmupItem[]>("/sessions/warmup");

/* -------------------------------------------------------------- errors */

export const getErrors = () => request<LedgerError[]>("/errors");
export const appendError = (payload: {
  category: ErrorCategory;
  diagnosis: string;
  check_id?: string | null;
  module_id?: string | null;
}) => request<LedgerError>("/errors", { method: "POST", json: payload });
export const resolveError = (payload: {
  id: string;
  resolved?: boolean;
  resolution?: string;
}) => request<LedgerError>("/errors", { method: "PATCH", json: payload });

/* ------------------------------------------------------------ capstone */

export const getCapstone = () => request<CapstoneArtefact[]>("/capstone");
export const patchCapstone = (payload: {
  id: string;
  state?: CapstoneArtefact["state"];
  path?: string | null;
  notes?: string | null;
  next_action?: string | null;
}) => request<CapstoneArtefact[]>("/capstone", { method: "PATCH", json: payload });

/* --------------------------------------------------------------- vault */

export const snapshotVault = (message: string) =>
  request<{ ok: boolean; committed: boolean }>("/vault/snapshot", {
    method: "POST",
    json: { message },
  });
