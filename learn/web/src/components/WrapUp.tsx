import { useEffect, useMemo, useState } from "react";
import { ERROR_CATEGORIES } from "../types";
import {
  CLOSE_THE_SESSION,
  ENOUGH,
  EXTRA_ERROR_Q,
  FATIGUE_Q,
  KEEP_WORKING,
  NOT_YET,
  PLAN_FOOT,
  PLAN_Q,
  REFLECTION_Q,
  VAULT_FOOT,
  WRAP_UP_SUB,
  WRAP_UP_TITLE,
  errorCategoryLabel,
  fileJotsLabel,
} from "../labels";
import { fileJots, getJots } from "../api";
import { useStore } from "../store";
import type { ErrorCategory, Jot, SessionClose } from "../types";

const MIN_WORDS = 40;
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

const summary = (seconds: number, checks: number, errors: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const time = h ? `${h} h ${m} m` : `${m} m`;
  return `${time} · ${checks} check${checks === 1 ? "" : "s"} attempted · ${errors} error${
    errors === 1 ? "" : "s"
  } logged.`;
};

/**
 * Wrap up (§6). Same three required answers as before — forty words, both plan
 * fields, a diagnosis per logged error — plus the jots the session left unfiled.
 */
export default function WrapUp({ onDone }: { onDone(): void }) {
  const closeSession = useStore((s) => s.closeSession);
  const loadSession = useStore((s) => s.loadSession);
  const session = useStore((s) => s.session);
  const elapsed = useStore((s) => s.elapsed);

  const [reflection, setReflection] = useState("");
  const [ifCue, setIfCue] = useState("");
  const [thenAction, setThenAction] = useState("");
  const [fatigue, setFatigue] = useState(3);
  const [errors, setErrors] = useState<SessionClose["errors"]>([]);
  const [jots, setJots] = useState<Jot[]>([]);
  const [filed, setFiled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDone();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  // The summary line is the server's count, not a browser tally, so it survives a reload.
  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const moduleId = session?.module_id;
  useEffect(() => {
    if (!moduleId) return;
    getJots({ module_id: moduleId, unfiled: true })
      .then(setJots)
      .catch(() => setJots([]));
  }, [moduleId]);

  const count = words(reflection);
  const valid = useMemo(
    () =>
      count >= MIN_WORDS &&
      ifCue.trim().length > 0 &&
      thenAction.trim().length > 0 &&
      errors.every((e) => e.diagnosis.trim().length > 0),
    [count, ifCue, thenAction, errors],
  );

  /** Jots are filed per topic — a note lives in exactly one. */
  const fileAll = async () => {
    const byTopic = new Map<string, string[]>();
    for (const j of jots) {
      if (!j.topic_id) continue;
      byTopic.set(j.topic_id, [...(byTopic.get(j.topic_id) ?? []), j.id]);
    }
    for (const [topicId, ids] of byTopic)
      await fileJots({ ids, topic_id: topicId, module_id: session?.module_id });
    setFiled(true);
  };

  const submit = async () => {
    setBusy(true);
    setFailure(null);
    try {
      if (jots.length && !filed) await fileAll();
      await closeSession({
        reflection,
        if_cue: ifCue,
        then_action: thenAction,
        fatigue,
        errors,
      });
      onDone();
    } catch (e) {
      setFailure((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-label={WRAP_UP_TITLE}>
      <div className="wrap">
        <header className="wrap-head">
          <h2>{WRAP_UP_TITLE}</h2>
          <p className="mono wrap-summary">
            {summary(elapsed, session?.checks_attempted ?? 0, session?.errors_logged ?? 0)}{" "}
            {WRAP_UP_SUB}
          </p>
        </header>

        <div className="wrap-body">
          <div>
            <label className="wrap-q" htmlFor="reflection">
              {REFLECTION_Q}
            </label>
            <textarea
              id="reflection"
              rows={6}
              value={reflection}
              aria-describedby="reflection-count"
              onChange={(e) => setReflection(e.target.value)}
            />
            <p
              id="reflection-count"
              className="wrap-count"
              data-enough={count >= MIN_WORDS}
              aria-live="polite"
            >
              {count >= MIN_WORDS ? ENOUGH(count) : NOT_YET(count, MIN_WORDS)}
            </p>
          </div>

          <div>
            <div className="wrap-q">{PLAN_Q}</div>
            <div className="plan-grid">
              <label className="mono" htmlFor="if-cue">
                IF
              </label>
              <input
                id="if-cue"
                type="text"
                placeholder="it is Sunday after breakfast"
                value={ifCue}
                onChange={(e) => setIfCue(e.target.value)}
              />
              <label className="mono" htmlFor="then-action">
                THEN
              </label>
              <input
                id="then-action"
                type="text"
                placeholder="re-derive the attention mask on paper"
                value={thenAction}
                onChange={(e) => setThenAction(e.target.value)}
              />
            </div>
            <p className="wrap-foot">{PLAN_FOOT}</p>
          </div>

          <div>
            <div className="wrap-q">{EXTRA_ERROR_Q}</div>
            {errors.map((err, i) => (
              <div className="wrap-error" key={i}>
                <select
                  className="pill-select"
                  aria-label={`Error ${i + 1} category`}
                  value={err.category}
                  onChange={(e) =>
                    setErrors((prev) =>
                      prev.map((x, idx) =>
                        idx === i ? { ...x, category: e.target.value as ErrorCategory } : x,
                      ),
                    )
                  }
                >
                  {ERROR_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {errorCategoryLabel(c)}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  aria-label={`Error ${i + 1} diagnosis`}
                  value={err.diagnosis}
                  onChange={(e) =>
                    setErrors((prev) =>
                      prev.map((x, idx) => (idx === i ? { ...x, diagnosis: e.target.value } : x)),
                    )
                  }
                />
                <button
                  type="button"
                  className="btn-inline"
                  onClick={() => setErrors((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-inline"
              onClick={() =>
                setErrors((prev) => [...prev, { category: "didnt_know", diagnosis: "" }])
              }
            >
              + Add another
            </button>
          </div>

          <div>
            <div className="wrap-q">{FATIGUE_Q}</div>
            <div className="seg" role="group" aria-label="How spent are you">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={fatigue === n}
                  onClick={() => setFatigue(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {jots.length ? (
            <div className="wrap-jots">
              <button
                type="button"
                className="btn"
                disabled={filed}
                onClick={() => void fileAll()}
              >
                {filed ? "Filed" : fileJotsLabel(jots.length)}
              </button>
              <span>They are appended under “## Jots” in each topic's note.</span>
            </div>
          ) : null}

          {failure ? (
            <p className="err" role="alert">
              {failure}
            </p>
          ) : null}
        </div>

        <footer className="wrap-foot-bar">
          <button
            type="button"
            className="btn btn-primary btn-big"
            disabled={!valid || busy}
            onClick={() => void submit()}
          >
            {busy ? "Closing…" : CLOSE_THE_SESSION}
          </button>
          <button type="button" className="btn btn-big" onClick={onDone}>
            {KEEP_WORKING}
          </button>
          <span>{VAULT_FOOT}</span>
        </footer>
      </div>
    </div>
  );
}
