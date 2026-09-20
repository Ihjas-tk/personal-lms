import { useState } from "react";
import { FILE_AT_CLOSE, JOT_PLACEHOLDER, UNFILED_JOTS } from "../labels";
import type { Jot } from "../types";

/**
 * The lines dumped mid-video, on `--surf2` under the editor. They stay unfiled
 * until the wrap-up folds them into the note, so nothing is lost and nothing is
 * written behind the learner's back.
 */
export default function JotStrip({
  jots,
  onAdd,
}: {
  jots: Jot[];
  onAdd(text: string): void;
}) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <div className="jotstrip">
      <div className="jotstrip-head">
        <h3>{UNFILED_JOTS}</h3>
        <span>{FILE_AT_CLOSE}</span>
      </div>
      <div className="jotstrip-list">
        {jots.map((j) => (
          <div className="jotstrip-line" key={j.id}>
            <span className="mono jotstrip-at">{j.stamp ?? "—"}</span>
            <span>{j.text}</span>
          </div>
        ))}
        {jots.length === 0 ? (
          <p className="jotstrip-empty">Nothing jotted yet this session.</p>
        ) : null}
      </div>
      <div className="jotstrip-input">
        <input
          type="text"
          value={text}
          aria-label="Jot a line"
          placeholder={JOT_PLACEHOLDER}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          }}
        />
        <span className="mono jotstrip-hint">⌘↵</span>
      </div>
    </div>
  );
}
