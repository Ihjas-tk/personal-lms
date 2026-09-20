import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import CodeMirror from "./CodeMirror";
import {
  FREEZE_FOOT,
  FREEZING,
  FROM_MEMORY,
  HIDDEN_UNTIL_SUBMIT,
  HOW_SURE,
  HOW_SURE_SUB,
  LOCK_IT_IN,
  NO_PASTE,
  SUBMIT_AND_FREEZE,
} from "../labels";

const mmss = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

/** Stage 1. Confidence is the only thing that makes the calibration mean anything. */
export function StageSure({
  value,
  touched,
  busy,
  onChange,
  onLock,
}: {
  value: number;
  touched: boolean;
  busy: boolean;
  onChange(next: number): void;
  onLock(): void;
}) {
  return (
    <section className="stage-card">
      <h2>{HOW_SURE}</h2>
      <p className="stage-sub">{HOW_SURE_SUB}</p>
      <div className="sure">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          aria-label="How sure are you, before you answer"
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="mono sure-read">{value}</span>
      </div>
      <div className="sure-ends">
        <span>no idea</span>
        <span>certain</span>
      </div>
      <button
        type="button"
        className="btn btn-primary btn-big"
        disabled={!touched || busy}
        onClick={onLock}
      >
        {busy ? "Opening…" : LOCK_IT_IN}
      </button>
      <p className="stage-foot">{HIDDEN_UNTIL_SUBMIT}</p>
    </section>
  );
}

/**
 * Stage 2. Nothing is graded until it is frozen, and AI is off the whole time.
 * Freezing is a server call — `onFreeze` posts the answer and only then reveals
 * the reference — so the button reports that it is working.
 */
export function StageWrite({
  checkId,
  isCode,
  answer,
  seconds,
  confidence,
  busy = false,
  onChange,
  onFreeze,
}: {
  checkId: string;
  isCode: boolean;
  answer: string;
  seconds: number;
  confidence: number;
  busy?: boolean;
  onChange(next: string): void;
  onFreeze(): void;
}) {
  return (
    <section className="stage-card stage-write">
      <header>
        <span>{FROM_MEMORY}</span>
        <span className="mono">
          {mmss(seconds)} · sure: {confidence}
        </span>
      </header>
      <div className="write-body">
        <CodeMirror
          value={answer}
          onChange={onChange}
          extensions={[isCode ? python() : markdown()]}
          blockPaste={isCode}
          ariaLabel={`Answer for ${checkId}`}
          testId="answer-editor"
        />
        {isCode ? <p className="stage-foot">{NO_PASTE}</p> : null}
      </div>
      <footer>
        <button
          type="button"
          className="btn btn-primary btn-big"
          disabled={busy || answer.trim().length === 0}
          onClick={onFreeze}
        >
          {busy ? FREEZING : SUBMIT_AND_FREEZE}
        </button>
        <span>{FREEZE_FOOT}</span>
      </footer>
    </section>
  );
}
