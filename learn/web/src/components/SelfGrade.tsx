import { ERROR_CATEGORIES } from "../types";
import {
  DIAGNOSIS_Q,
  GOES_TO_ERROR_LOG,
  MARK_IT_SUB,
  MARK_IT_YOURSELF,
  OVERALL,
  SCORE,
  SECOND_OPINION,
  errorCategoryLabel,
} from "../labels";
import type { CritiqueLine, ErrorCategory, RubricMark, Score } from "../types";

const MARKS: RubricMark[] = ["met", "partial", "missing"];
const SCORES: Score[] = ["cant", "partial", "fluent"];
const title = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}`;

/** "AI agrees — …" when the machine landed on the same mark; otherwise it says so. */
function critiqueLine(line: CritiqueLine, mine: RubricMark | null): string {
  const head = mine && line.verdict === mine ? "AI agrees" : `AI: ${line.verdict}`;
  const evidence = line.evidence ? ` — “${line.evidence}”` : "";
  const missing = line.missing ? ` · ${line.missing}` : "";
  return `${head}${evidence}${missing}`;
}

/**
 * Stage 3's grading card: your mark per rubric line, the AI's as a sub-line, the
 * overall score, and — below fluent — the diagnosis that goes to the error log.
 */
export default function SelfGrade({
  rubric,
  marks,
  onMark,
  score,
  onScore,
  category,
  onCategory,
  diagnosis,
  onDiagnosis,
  critique,
  aside,
}: {
  rubric: string[];
  marks: (RubricMark | null)[];
  onMark(index: number, mark: RubricMark): void;
  score: Score | null;
  onScore(score: Score): void;
  category: ErrorCategory | null;
  onCategory(c: ErrorCategory): void;
  diagnosis: string;
  onDiagnosis(text: string): void;
  critique?: CritiqueLine[] | null;
  /** The second-opinion control, rendered in the card header. */
  aside?: React.ReactNode;
}) {
  return (
    <div className="grade">
      <header className="grade-head">
        <div>
          <h2>{MARK_IT_YOURSELF}</h2>
          <p>{MARK_IT_SUB}</p>
        </div>
        {aside}
      </header>

      {rubric.map((line, i) => {
        const ai = critique?.find((c) => c.rubric_index === i);
        return (
          <div className="grade-line" key={line}>
            <div className="grade-text">
              <div>{line}</div>
              {ai ? (
                <p className="grade-ai" data-testid={`critique-${i}`}>
                  {critiqueLine(ai, marks[i])}
                </p>
              ) : null}
            </div>
            <div className="seg" role="group" aria-label={`Rubric line ${i + 1}`}>
              {MARKS.map((mk) => (
                <button
                  key={mk}
                  type="button"
                  aria-pressed={marks[i] === mk}
                  onClick={() => onMark(i, mk)}
                >
                  {mk}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div className="grade-foot">
        <div>
          <div className="grade-label">{OVERALL}</div>
          <div className="seg" role="group" aria-label="Overall score">
            {SCORES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={score === s}
                onClick={() => onScore(s)}
              >
                {title(SCORE[s])}
              </button>
            ))}
          </div>
        </div>

        {score && score !== "fluent" ? (
          <div className="grade-diagnosis">
            <label className="grade-label" htmlFor="diagnosis">
              {DIAGNOSIS_Q}
            </label>
            <textarea
              id="diagnosis"
              rows={3}
              value={diagnosis}
              onChange={(e) => onDiagnosis(e.target.value)}
            />
            <div className="grade-cat">
              <label className="sr-only" htmlFor="category">
                Error category
              </label>
              <select
                id="category"
                className="pill-select"
                value={category ?? ""}
                onChange={(e) => onCategory(e.target.value as ErrorCategory)}
              >
                <option value="" disabled>
                  Choose a category…
                </option>
                {ERROR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {errorCategoryLabel(c)}
                  </option>
                ))}
              </select>
              <span className="grade-hint">{GOES_TO_ERROR_LOG}</span>
            </div>
          </div>
        ) : (
          <p className="grade-hint grade-hint-wide">
            A {SECOND_OPINION} never changes the mark you give yourself.
          </p>
        )}
      </div>
    </div>
  );
}
