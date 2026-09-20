import { useEffect, useId, useRef, useState } from "react";
import { patchTopicState } from "../api";
import { TOPIC, TOPIC_TONE } from "../labels";
import type { ModuleWorkspace, Topic, TopicState } from "../types";

const CHOICES: { value: TopicState; meaning: string }[] = [
  { value: "not_started", meaning: "Haven't begun this one." },
  { value: "in_progress", meaning: "Working on it." },
  { value: "proved", meaning: "Covered, as far as I'm concerned." },
];

/**
 * The state chip on a topic header, made pressable: the learner decides.
 * The derived state (what the checks and sources say) stays visible underneath.
 */
export default function TopicStateMenu({
  moduleId,
  topic,
  onChanged,
}: {
  moduleId: string;
  topic: Topic;
  onChanged(next: ModuleWorkspace): void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const pick = async (state: TopicState | null) => {
    setOpen(false);
    setBusy(true);
    try {
      onChanged(await patchTopicState(moduleId, topic.id, state));
    } catch {
      /* the chip keeps its old value; the next refresh tells the truth */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rstate tstate" ref={root}>
      <button
        type="button"
        className="chip rstate-btn"
        data-tone={TOPIC_TONE[topic.state]}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Topic state: ${TOPIC[topic.state]}${topic.state_set_by_you ? ", set by you" : ""}. Change`}
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
      >
        {TOPIC[topic.state]}
        {topic.state_set_by_you ? <span className="tstate-you"> · you</span> : null}
        <span aria-hidden="true"> ▾</span>
      </button>
      {open ? (
        <div className="rstate-menu" role="menu" id={id}>
          <div className="rstate-head mono">Where is this topic?</div>
          {CHOICES.map((c) => (
            <button
              key={c.value}
              type="button"
              role="menuitemradio"
              aria-checked={topic.state === c.value}
              className="rstate-item"
              data-counts={c.value === "proved"}
              onClick={() => void pick(c.value)}
            >
              <span className="rstate-label">{TOPIC[c.value]}</span>
              <span className="rstate-meaning">{c.meaning}</span>
            </button>
          ))}
          <div className="rstate-foot">
            {topic.state_set_by_you ? (
              <button type="button" className="tstate-clear" onClick={() => void pick(null)}>
                Let the checks decide (currently {TOPIC[topic.derived_state]})
              </button>
            ) : (
              <>Set by the checks and sources right now. Your call overrides them.</>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
