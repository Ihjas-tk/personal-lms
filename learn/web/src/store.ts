import { create } from "zustand";
import * as api from "./api";
import { AI_ANSWER_OPEN, AI_UNREACHABLE, DEFAULT_DEBRIEF_DAY } from "./labels";
import type { Desk, Health, Session, SessionClose, SessionPhase } from "./types";

interface AppState {
  health: Health | null;
  healthLoaded: boolean;
  /** `GET /api/desk` — the Desk screen and the rail's week counter read the same copy. */
  desk: Desk | null;
  deskError: string | null;
  session: Session | null;
  /** Wall-clock seconds since the session started; ticked locally. */
  elapsed: number;
  /** Bumped whenever the server reports a vault file change (SSE `changed`). */
  vaultRevision: number;

  loadHealth(): Promise<void>;
  loadDesk(): Promise<void>;
  loadSession(): Promise<void>;
  startSession(moduleId: string): Promise<Session>;
  setPhase(phase: SessionPhase): Promise<void>;
  skipWarmup(): Promise<void>;
  closeSession(payload: SessionClose): Promise<void>;
  discardSession(): Promise<void>;
  setOpenAttempt(path: string | null): void;
  tick(): void;
  bumpVault(): void;
}

/**
 * §6.3: three reasons, each stated in the same plain words wherever it appears.
 * An open answer wins — it is the rule the learner is being held to, not a fault
 * in the world.
 *
 * The server now sends the credential sentence verbatim, so nothing is rewritten
 * here; the backticks it marks its two literals with are dropped because `AiMenu`
 * sets exactly those spans in mono itself.
 */
export const aiBlockedReason = (
  health: Health | null,
  session: Session | null,
): string | null => {
  if (session?.open_attempt_path) return AI_ANSWER_OPEN;
  if (health && !health.ok) return AI_UNREACHABLE;
  if (health && !health.ai_available)
    return (health.ai_reason ?? "").replace(/`/g, "") || AI_UNREACHABLE;
  return null;
};

export const useStore = create<AppState>((set, get) => ({
  health: null,
  healthLoaded: false,
  desk: null,
  deskError: null,
  session: null,
  elapsed: 0,
  vaultRevision: 0,

  async loadHealth() {
    try {
      const health = await api.getHealth();
      set({ health, healthLoaded: true });
    } catch {
      set({
        health: {
          ok: false,
          ai_available: false,
          ai_reason: "The server is not reachable.",
          vault_git: false,
        },
        healthLoaded: true,
      });
    }
  },

  async loadDesk() {
    try {
      set({ desk: await api.getDesk(), deskError: null });
    } catch (e) {
      set({ deskError: (e as Error).message });
    }
  },

  async loadSession() {
    try {
      const session = await api.getCurrentSession();
      set({ session, elapsed: session?.elapsed_seconds ?? 0 });
    } catch {
      set({ session: null, elapsed: 0 });
    }
  },

  async startSession(moduleId) {
    const session = await api.startSession(moduleId);
    set({ session, elapsed: session.elapsed_seconds ?? 0 });
    return session;
  },

  async setPhase(phase) {
    const session = await api.patchSession({ phase });
    set({ session });
  },

  async skipWarmup() {
    const session = await api.patchSession({ warmup_skipped: true });
    set({ session });
  },

  async closeSession(payload) {
    await api.closeSession(payload);
    set({ session: null, elapsed: 0, vaultRevision: get().vaultRevision + 1 });
  },

  async discardSession() {
    await api.discardSession();
    set({ session: null, elapsed: 0 });
  },

  setOpenAttempt(path) {
    const session = get().session;
    if (!session) return;
    set({ session: { ...session, open_attempt_path: path } });
  },

  tick() {
    if (!get().session) return;
    set({ elapsed: get().elapsed + 1 });
  },

  bumpVault() {
    set({ vaultRevision: get().vaultRevision + 1 });
  },
}));

/**
 * The curriculum's debrief day, from `GET /api/desk`. Falls back to the model's
 * own default while the Desk payload is still in flight, so no screen ever has to
 * hard-code a day of the week.
 */
export const useDebriefDay = (): string =>
  useStore((s) => s.desk?.debrief_day) ?? DEFAULT_DEBRIEF_DAY;
