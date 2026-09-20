import { useCallback, useEffect, useRef, useState } from "react";
import { MergeView } from "@codemirror/merge";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import {
  KEEP_ORIGINAL,
  TIDY_KEEP,
  TIDY_REFUSED,
  TIDY_REFUSED_TAIL,
  TIDY_RETRYING,
  TIDY_REVERT_ALL,
  TIDY_SNAPSHOT,
  TIDY_STATS,
  TIDY_TAKE_ALL,
  TIDY_TITLE,
} from "../labels";
import { tidy } from "../api";
import type { TidyStats } from "../types";

type Phase = "streaming" | "review" | "rejected" | "error";

/**
 * Tidy (§6.1). The text streams into a shadow buffer and arrives as a diff taken
 * chunk by chunk; left is yours and read-only. A refusal ends the dialog — there
 * is no diff to review and the note was never touched.
 */
export default function TidyDialog({
  moduleId,
  original,
  onAccept,
  onClose,
}: {
  moduleId: string;
  original: string;
  onAccept(text: string): void;
  onClose(): void;
}) {
  const [phase, setPhase] = useState<Phase>("streaming");
  const [shadow, setShadow] = useState("");
  const [stats, setStats] = useState<TidyStats | null>(null);
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState("");
  const host = useRef<HTMLDivElement | null>(null);
  const merge = useRef<MergeView | null>(null);
  const shadowRef = useRef("");
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abort.current = controller;
    shadowRef.current = "";
    void tidy(
      { module_id: moduleId, text: original },
      {
        onDelta: (text) => {
          shadowRef.current += text;
          setShadow(shadowRef.current);
        },
        onStats: (s) => setStats(s),
        onRetry: (reason) => {
          shadowRef.current = "";
          setShadow("");
          setRetry(reason);
        },
        onRejected: (reason) => {
          setMessage(reason);
          setPhase("rejected");
        },
        onDone: (payload) => {
          if (payload?.text) {
            shadowRef.current = payload.text;
            setShadow(payload.text);
          }
          if (payload?.stats) setStats(payload.stats);
          setPhase("review");
        },
        onError: (m) => {
          setMessage(m);
          setPhase("error");
        },
      },
      controller.signal,
    );
    return () => controller.abort();
  }, [moduleId, original]);

  useEffect(() => {
    if (phase !== "review" || !host.current || merge.current) return;
    merge.current = new MergeView({
      a: {
        doc: original,
        extensions: [markdown(), EditorView.lineWrapping, EditorState.readOnly.of(true)],
      },
      b: { doc: shadowRef.current, extensions: [markdown(), EditorView.lineWrapping] },
      parent: host.current,
      revertControls: "a-to-b",
      highlightChanges: true,
      gutter: true,
      collapseUnchanged: { margin: 3, minSize: 6 },
    });
    return () => {
      merge.current?.destroy();
      merge.current = null;
    };
  }, [phase, original]);

  const close = useCallback(() => {
    abort.current?.abort();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  if (phase === "rejected" || phase === "error")
    return (
      <div className="scrim" role="dialog" aria-modal="true" aria-label={TIDY_TITLE}>
        <div className="sheet refusal" role="alert" data-testid="tidy-rejected">
          <div className="refusal-title">{TIDY_REFUSED}</div>
          <p className="refusal-body">
            {message} {TIDY_REFUSED_TAIL}
          </p>
          <button type="button" className="btn" onClick={close}>
            {KEEP_ORIGINAL}
          </button>
        </div>
      </div>
    );

  return (
    <div className="scrim" role="dialog" aria-modal="true" aria-label={TIDY_TITLE}>
      <div className="sheet wide tidy">
        <header className="tidy-head">
          <div>
            <h3>{TIDY_TITLE}</h3>
            <p>{TIDY_STATS(stats?.tokens_added ?? 0)}</p>
          </div>
          <button type="button" className="btn" onClick={close}>
            {TIDY_KEEP}
          </button>
        </header>

        {retry ? (
          <p className="tidy-retry" data-testid="tidy-retry" role="status">
            {TIDY_RETRYING(retry)}
          </p>
        ) : null}
        {phase === "streaming" ? (
          <pre className="mono tidy-shadow" data-testid="tidy-shadow">
            {shadow}
          </pre>
        ) : (
          <div className="merge-host" ref={host} data-testid="merge-host" />
        )}

        <footer className="tidy-foot">
          <button
            type="button"
            className="btn btn-primary"
            disabled={phase !== "review"}
            onClick={() => onAccept(merge.current?.b.state.doc.toString() ?? shadowRef.current)}
          >
            {TIDY_TAKE_ALL}
          </button>
          <button
            type="button"
            className="btn"
            disabled={phase !== "review"}
            onClick={() =>
              merge.current?.b.dispatch({
                changes: {
                  from: 0,
                  to: merge.current.b.state.doc.length,
                  insert: original,
                },
              })
            }
          >
            {TIDY_REVERT_ALL}
          </button>
          <span className="tidy-note">{TIDY_SNAPSHOT}</span>
        </footer>
      </div>
    </div>
  );
}
