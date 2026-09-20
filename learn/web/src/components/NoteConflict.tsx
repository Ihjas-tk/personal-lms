import { useEffect, useRef, useState } from "react";
import { MergeView } from "@codemirror/merge";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import {
  CONFLICT_DIFF,
  CONFLICT_OVERWRITE,
  CONFLICT_RELOAD,
  CONFLICT_SUB,
  CONFLICT_TITLE,
  conflictStatus,
} from "../labels";

/**
 * §6.2. A stale `mtime_ns` is refused, never merged. Three exits, each named for
 * what it destroys, plus a read-only diff for the learner who wants to look first.
 */
export default function NoteConflict({
  path,
  mine,
  disk,
  onOverwrite,
  onReload,
}: {
  path: string;
  mine: string;
  disk: string;
  onOverwrite(): void;
  onReload(): void;
}) {
  const [showDiff, setShowDiff] = useState(false);
  const host = useRef<HTMLDivElement | null>(null);
  const merge = useRef<MergeView | null>(null);

  useEffect(() => {
    if (!showDiff || !host.current || merge.current) return;
    const readOnly = [markdown(), EditorView.lineWrapping, EditorState.readOnly.of(true)];
    merge.current = new MergeView({
      a: { doc: disk, extensions: readOnly },
      b: { doc: mine, extensions: readOnly },
      parent: host.current,
      highlightChanges: true,
      gutter: true,
      collapseUnchanged: { margin: 3, minSize: 6 },
    });
    return () => {
      merge.current?.destroy();
      merge.current = null;
    };
  }, [showDiff, disk, mine]);

  return (
    <div className="conflict" role="alert">
      <div className="conflict-body">
        <div className="conflict-title">{CONFLICT_TITLE}</div>
        <p className="conflict-sub">{CONFLICT_SUB}</p>
        <div className="conflict-exits">
          <button type="button" className="btn btn-primary" onClick={onOverwrite}>
            {CONFLICT_OVERWRITE}
          </button>
          <button type="button" className="btn" onClick={onReload}>
            {CONFLICT_RELOAD}
          </button>
          <button
            type="button"
            className="btn"
            aria-pressed={showDiff}
            onClick={() => setShowDiff((v) => !v)}
          >
            {CONFLICT_DIFF}
          </button>
        </div>
      </div>
      {showDiff ? (
        <div data-testid="conflict-diff">
          <p className="mono conflict-legend">
            left · the file on disk · right · yours, still unsaved
          </p>
          <div className="merge-host" ref={host} />
        </div>
      ) : null}
      <div className="conflict-status mono">{conflictStatus(path)}</div>
    </div>
  );
}
