import { useState } from "react";
import { JOTTER_FOOT, SIDE_BY_SIDE } from "../labels";

/**
 * The pop-out jotter: when the source needs the whole screen, this 340px window
 * floats bottom-right and takes lines without moving anything behind it.
 */
export default function Jotter({
  topicTitle,
  stamp,
  onFile,
  onStamp,
  onRestore,
}: {
  topicTitle: string;
  stamp: string;
  onFile(text: string): void;
  onStamp(): string;
  onRestore(): void;
}) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onFile(text.trim());
    setText("");
  };

  return (
    <div className="jotter" role="group" aria-label="Pop-out jotter">
      <div className="jotter-bar">
        <span className="jotter-title">Jotter · {topicTitle}</span>
        <span className="mono jotter-stamp">{stamp}</span>
        <button
          type="button"
          className="jotter-restore"
          aria-label={SIDE_BY_SIDE}
          title={SIDE_BY_SIDE}
          onClick={onRestore}
        >
          ⤢
        </button>
      </div>
      <textarea
        className="jotter-area mono"
        aria-label="Jot lines"
        value={text}
        rows={5}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            send();
          }
        }}
      />
      <div className="jotter-foot">
        <span>{JOTTER_FOOT}</span>
        <button
          type="button"
          className="btn btn-soft"
          onClick={() => setText((t) => `${t}${t && !t.endsWith(" ") ? " " : ""}${onStamp()} `)}
        >
          Stamp
        </button>
      </div>
    </div>
  );
}
