import { useCallback, useEffect, useRef, useState } from "react";
import { MergeView } from "@codemirror/merge";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import {
  KEEP_ORIGINAL,
  RESTRUCTURE_REFUSED,
  RESTRUCTURE_STATS,
  RESTRUCTURE_TITLE,
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
import { restructure, tidy, type TidyHandlers } from "../api";
import type { TidyStats } from "../types";

type Phase = "streaming" | "review" | "rejected" | "error";
export type AiNoteMode = "tidy" | "restructure";

/** What differs between the two note actions: the call, the title, the two sentences. */
const MODES = {
  tidy: { title: TIDY_TITLE, stats: TIDY_STATS, refused: TIDY_REFUSED },
  restructure: {
    title: RESTRUCTURE_TITLE,
    stats: RESTRUCTURE_STATS,
    refused: RESTRUCTURE_REFUSED,
  },
} as const;

/**
 * Tidy and Restructure (§6.1). The text streams into a shadow buffer and arrives as
 * a diff taken chunk by chunk; left is yours and read-only. A refusal ends the
 * dialog — there is no diff to review and the note was never touched.
 */
export default function TidyDialog({
  moduleId,
  topicId,
  mode = "tidy",
  original,
  onAccept,
  onClose,
}: {
  moduleId: string;
  topicId?: string;
  mode?: AiNoteMode;
  original: string;
  onAccept(text: string): void;
  onClose(): void;
}) {
  const copy = MODES[mode];
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
    const handlers: TidyHandlers = {
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
    };
    void (mode === "restructure"
      ? restructure(
          { module_id: moduleId, topic_id: topicId ?? "", text: original },
          handlers,
          controller.signal,
        )
      : tidy({ module_id: moduleId, text: original }, handlers, controller.signal));
    return () => controller.abort();
  }, [mode, moduleId, topicId, original]);

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
      <div className="scrim" role="dialog" aria-modal="true" aria-label={copy.title}>
        <div className="sheet refusal" role="alert" data-testid="tidy-rejected">
          <div className="refusal-title">{copy.refused}</div>
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
    <div className="scrim" role="dialog" aria-modal="true" aria-label={copy.title}>
      <div className="sheet wide tidy">
        <header className="tidy-head">
          <div>
            <h3>{copy.title}</h3>
            <p>{copy.stats(stats?.tokens_added ?? 0)}</p>
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
