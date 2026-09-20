import { useNavigate } from "react-router";
import AiMenu from "./AiMenu";
import { LadderChip } from "./Chip";
import {
  AI_SECOND_OPINION_ITEM,
  AI_TIDY_ITEM,
  MECHANISM_PROMPT,
  MECHANISM_TEMPLATE,
  NOTE_CONTINUE,
  NOTE_EMPTY,
  NOTE_HEAD,
  NOTE_START,
  PROOF_HEAD,
  SOURCE_HEAD,
} from "../labels";
import { agoLong } from "../time";
import { patchResource } from "../api";
import ResourceStateMenu from "./ResourceStateMenu";
import TopicStateMenu from "./TopicStateMenu";
import type { ModuleWorkspace, SourceRow, Topic } from "../types";

export interface FocusRequest {
  topicId: string;
  sourceId?: string | null;
  insert?: string | null;
}

/**
 * One topic: collapsed it is a numbered mark, a title, a summary and its state;
 * expanded it is the three things that close it — the source, the note, the proof.
 */
export default function TopicCard({
  topic,
  module: m,
  open,
  onToggle,
  onFocus,
  onChanged,
  blockedReason,
}: {
  topic: Topic;
  module: ModuleWorkspace;
  open: boolean;
  onToggle(): void;
  onFocus(req: FocusRequest): void;
  onChanged(next: ModuleWorkspace): void;
  blockedReason: string | null;
}) {
  const navigate = useNavigate();

  /** "Open" leaves the app, so the row is marked skimmed on the way out. */
  const openSource = (s: SourceRow) => {
    const href = s.url ?? s.path;
    if (href) window.open(href, "_blank", "noopener,noreferrer");
    if (s.state === "queued")
      void patchResource(m.id, s.id, { state: "skimmed" })
        .then(onChanged)
        .catch(() => {});
  };

  return (
    <article className="topic" data-open={open} data-state={topic.state}>
      <div className="topic-head">
        <button type="button" className="topic-head-btn" aria-expanded={open} onClick={onToggle}>
          <span className="mono topic-mark">{topic.n}</span>
          <span className="topic-id">
            <span className="topic-title">{topic.title}</span>
            <span className="topic-summary">{topic.summary}</span>
          </span>
        </button>
        <TopicStateMenu moduleId={m.id} topic={topic} onChanged={onChanged} />
      </div>

      {open ? (
        <div className="topic-body">
          <div className="topic-split">
            <section className="topic-sources">
              <div className="topic-sec-head">
                <h3>{SOURCE_HEAD}</h3>
                <span className="mono">
                  {topic.sources.length} source{topic.sources.length === 1 ? "" : "s"}
                </span>
              </div>
              {topic.sources.map((s) => (
                <div className="source" key={s.id}>
                  <span
                    className="source-rail"
                    data-fill={s.pct >= 1 ? "done" : s.pct > 0 ? "part" : "none"}
                  />
                  <div className="source-main">
                    <div className="source-title">{s.title}</div>
                    <div className="source-meta">
                      <span className="mono">{s.meta}</span>
                      <ResourceStateMenu
                        moduleId={m.id}
                        resourceId={s.id}
                        state={s.state}
                        done={s.done}
                        onChanged={onChanged}
                      />
                    </div>
                    <div className="source-track">
                      <div
                        className="source-fill"
                        data-full={s.pct >= 1}
                        style={{ width: `${Math.round(s.pct * 100)}%` }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      s.action === "Open"
                        ? openSource(s)
                        : onFocus({ topicId: topic.id, sourceId: s.id })
                    }
                  >
                    {s.action}
                  </button>
                </div>
              ))}
              {topic.sources.length === 0 ? (
                <p className="topic-none">No source is attached to this topic.</p>
              ) : null}
            </section>

            <section className="topic-note">
              <div className="topic-sec-head">
                <h3>{NOTE_HEAD}</h3>
                <span>{topic.note.exists ? agoLong(topic.note.updated) : "empty"}</span>
              </div>
              <div className="topic-note-inner">
                {topic.note.exists && topic.note.excerpt.trim() ? (
                  <pre className="mono note-excerpt">{topic.note.excerpt}</pre>
                ) : (
                  <p className="note-empty">{NOTE_EMPTY}</p>
                )}
                <div className="topic-note-actions">
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={() => onFocus({ topicId: topic.id })}
                  >
                    {topic.note.exists ? NOTE_CONTINUE : NOTE_START}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      onFocus({ topicId: topic.id, insert: MECHANISM_TEMPLATE })
                    }
                  >
                    {MECHANISM_PROMPT}
                  </button>
                  <AiMenu
                    blockedReason={blockedReason}
                    items={[
                      {
                        label: AI_TIDY_ITEM,
                        hint: "Opens the note in focus mode first.",
                        onSelect: () => onFocus({ topicId: topic.id }),
                      },
                      {
                        label: AI_SECOND_OPINION_ITEM,
                        hint: "Runs on a submitted answer, from a check attempt.",
                        onSelect: () => {},
                      },
                    ]}
                  />
                </div>
              </div>
            </section>
          </div>

          <section className="topic-proof">
            <div className="topic-sec-head">
              <h3>{PROOF_HEAD}</h3>
              <span>{topic.proof_text}</span>
            </div>
            {topic.checks.map((c, i) => (
              <div className="proof-row" key={c.id}>
                <div className="proof-prompt">{c.prompt}</div>
                <LadderChip state={c.state} />
                {c.warning ? <span className="proof-warn">{c.warning}</span> : null}
                <button
                  type="button"
                  className={i === 0 ? "btn btn-primary" : "btn"}
                  onClick={() => navigate(`/modules/${m.id}/checks/${c.id}`)}
                >
                  {c.action}
                </button>
              </div>
            ))}
            {topic.checks.length === 0 ? (
              <p className="topic-none">No check closes this topic yet.</p>
            ) : null}
          </section>
        </div>
      ) : null}
    </article>
  );
}
