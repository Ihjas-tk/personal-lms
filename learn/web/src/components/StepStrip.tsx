import { THINGS_TO_COVER } from "../labels";
import type { Topic } from "../types";

/**
 * One button per idea topic, in order. Violet when selected, `--good-soft` when
 * proved. It and the card headers are both handles on the same `openTopic`.
 */
export default function StepStrip({
  topics,
  openId,
  summary,
  onOpen,
}: {
  topics: Topic[];
  openId: string | null;
  summary: string;
  onOpen(id: string): void;
}) {
  const current = topics.find((t) => t.id === openId) ?? topics[0];

  return (
    <section className="stepstrip">
      <div className="stepstrip-head">
        <div className="stepstrip-line">
          {THINGS_TO_COVER(topics.length)}{" "}
          {current ? (
            <>
              You are on <strong>{`${current.n} · ${current.title}`}</strong>.
            </>
          ) : null}
        </div>
        <div className="mono stepstrip-summary">{summary}</div>
      </div>
      <div className="stepstrip-buttons" role="group" aria-label="Topics">
        {topics.map((t) => (
          <button
            key={t.id}
            type="button"
            className="step"
            data-state={t.state}
            aria-pressed={t.id === openId}
            onClick={() => onOpen(t.id)}
          >
            <span className="mono step-n">{t.n}</span>
            <span className="step-title">{t.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
