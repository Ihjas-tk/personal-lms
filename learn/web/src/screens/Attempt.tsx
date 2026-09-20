import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Markdown from "../components/Markdown";
import { StageSure, StageWrite } from "../components/AttemptStages";
import SelfGrade from "../components/SelfGrade";
import CritiquePanel from "../components/CritiquePanel";
import { Chip } from "../components/Chip";
import {
  BACK_TO_MODULE,
  CORE,
  DRAFT_REFERENCE,
  RECORD_AND_MOVE_ON,
  SPACING_LINE,
  STAGES,
  THE_REFERENCE,
  WHAT_YOU_WROTE,
} from "../labels";
import { freezeAttempt, getCheck, startAttempt, submitAttempt } from "../api";
import { aiBlockedReason, useStore } from "../store";
import type {
  AttemptFreezeResult,
  CheckDetail,
  CritiqueLine,
  ErrorCategory,
  RubricMark,
  Score,
} from "../types";

/**
 * The check attempt as three moments (§5): how sure, write, compare.
 *
 * Freezing is the hinge. Until stage 2 ends the reference does not exist on this
 * client at all — `POST /attempts/freeze` is the only call that hands it over, and
 * the same call is what ends the open answer that blocks the AI actions. Recording
 * the grade afterwards is a separate call, and it returns to the topic it belongs to.
 */
export default function Attempt() {
  const { id = "", checkId = "" } = useParams();
  const navigate = useNavigate();
  const session = useStore((s) => s.session);
  const health = useStore((s) => s.health);
  const setOpenAttempt = useStore((s) => s.setOpenAttempt);
  const loadSession = useStore((s) => s.loadSession);

  const [check, setCheck] = useState<CheckDetail | null>(null);
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [confidence, setConfidence] = useState(50);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptPath, setAttemptPath] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [frozen, setFrozen] = useState<AttemptFreezeResult | null>(null);
  const [marks, setMarks] = useState<(RubricMark | null)[]>([]);
  const [score, setScore] = useState<Score | null>(null);
  const [category, setCategory] = useState<ErrorCategory | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [lines, setLines] = useState<CritiqueLine[] | null>(null);
  const started = useRef<number | null>(null);

  useEffect(() => {
    getCheck(checkId)
      .then(setCheck)
      .catch((e: Error) => setError(e.message));
  }, [checkId]);

  useEffect(() => {
    if (stage !== 2) return;
    const t = setInterval(
      () => setSeconds(Math.floor((Date.now() - (started.current ?? Date.now())) / 1000)),
      1000,
    );
    return () => clearInterval(t);
  }, [stage]);

  const isCode = check?.type === "code";
  /** The rubric the learner marks is the one the freeze handed back. */
  const rubric = frozen?.rubric ?? [];

  const lockIn = async () => {
    setBusy(true);
    setError(null);
    try {
      const open = await startAttempt(checkId, {
        session_id: session?.id ?? null,
        confidence_pre: confidence,
      });
      setAttemptPath(open.attempt_path);
      setOpenAttempt(open.attempt_path);
      started.current = Date.now();
      setStage(2);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const freeze = async () => {
    if (!attemptPath) return;
    setBusy(true);
    setError(null);
    try {
      const result = await freezeAttempt({ attempt_path: attemptPath, answer });
      setFrozen(result);
      setMarks(result.rubric.map(() => null));
      // The answer is final, so the AI lock lifts: the second opinion sits beside the grade.
      setOpenAttempt(null);
      setStage(3);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const complete = useMemo(() => {
    if (!score || marks.length === 0 || marks.some((m) => m === null)) return false;
    return score === "fluent" || Boolean(category && diagnosis.trim());
  }, [score, marks, category, diagnosis]);

  const record = async () => {
    if (!attemptPath || !score) return;
    setBusy(true);
    setError(null);
    try {
      await submitAttempt({
        attempt_path: attemptPath,
        rubric: marks as RubricMark[],
        score,
        category: score === "fluent" ? null : category,
        diagnosis: score === "fluent" ? null : diagnosis,
      });
      // The vault is the tally: re-read the session so the wrap-up counts are right.
      await loadSession();
      navigate(back());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** Back to the module with the topic that owns this check already open. */
  const back = () =>
    check?.topic_id
      ? `/modules/${id}?topic=${encodeURIComponent(check.topic_id)}`
      : `/modules/${id}?check=${encodeURIComponent(checkId)}`;

  if (error && !check)
    return (
      <div className="attempt">
        <p className="err">{error}</p>
        <button type="button" className="btn" onClick={() => navigate(`/modules/${id}`)}>
          {BACK_TO_MODULE}
        </button>
      </div>
    );
  if (!check) return <p className="muted">Loading check…</p>;

  return (
    <div className="attempt" data-screen-label="Check attempt">
      <div className="attempt-top">
        <button type="button" className="backlink" onClick={() => navigate(`/modules/${id}`)}>
          ← {id}
        </button>
        {/* Progress, not a control: it reports where the flow is, it never moves it. */}
        <ol className="stages" aria-label="Attempt progress">
          {STAGES.map((label, i) => (
            <li
              key={label}
              data-now={stage === i + 1}
              aria-current={stage === i + 1 ? "step" : undefined}
            >
              {label}
            </li>
          ))}
        </ol>
      </div>

      <div className="attempt-col">
        <section className="prompt-card">
          <div className="prompt-tags">
            <span className="mono prompt-kind">
              {check.type}
              {check.must_cover ? ` · ${CORE}` : ""}
            </span>
            {check.draft_reference ? <Chip tone="amber">{DRAFT_REFERENCE}</Chip> : null}
          </div>
          <p className="prompt-text">{check.prompt}</p>
        </section>

        {stage === 1 ? (
          <StageSure
            value={confidence}
            touched={touched}
            busy={busy}
            onChange={(n) => {
              setConfidence(n);
              setTouched(true);
            }}
            onLock={() => void lockIn()}
          />
        ) : null}

        {stage === 2 ? (
          <StageWrite
            checkId={check.id}
            isCode={isCode}
            answer={answer}
            seconds={seconds}
            confidence={confidence}
            busy={busy}
            onChange={setAnswer}
            onFreeze={() => void freeze()}
          />
        ) : null}

        {stage === 3 && frozen ? (
          <>
            <div className="compare">
              <section className="compare-pane">
                <header>{WHAT_YOU_WROTE}</header>
                <pre className="mono" data-testid="frozen-answer">
                  {answer}
                </pre>
              </section>
              <section className="compare-pane compare-ref">
                <header>{THE_REFERENCE}</header>
                <div className="compare-ref-body" data-testid="reference">
                  <Markdown>{frozen.reference}</Markdown>
                </div>
              </section>
            </div>

            <SelfGrade
              rubric={rubric}
              marks={marks}
              onMark={(i, m) => setMarks((prev) => prev.map((v, idx) => (idx === i ? m : v)))}
              score={score}
              onScore={setScore}
              category={category}
              onCategory={setCategory}
              diagnosis={diagnosis}
              onDiagnosis={setDiagnosis}
              critique={lines}
              aside={
                <CritiquePanel
                  attemptPath={frozen.attempt_path}
                  blockedReason={aiBlockedReason(health, session)}
                  onResult={setLines}
                />
              }
            />

            <footer className="attempt-foot">
              <button
                type="button"
                className="btn btn-primary btn-big"
                disabled={!complete || busy}
                onClick={() => void record()}
              >
                {busy ? "Recording…" : RECORD_AND_MOVE_ON}
              </button>
              <span>{SPACING_LINE}</span>
            </footer>
            {error ? (
              <p className="err" role="alert">
                {error}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
