import { useCallback, useEffect, useRef, useState } from "react";
import { markdown } from "@codemirror/lang-markdown";
import type { EditorView } from "@codemirror/view";
import CodeMirror from "./CodeMirror";
import NoteConflict from "./NoteConflict";
import { ConflictError, getNote, getTopicNote, putNote, putTopicNote } from "../api";
import type { Note } from "../types";

export type SaveState =
  | { kind: "idle" }
  | { kind: "dirty" }
  | { kind: "saving" }
  | { kind: "saved"; at: number }
  | { kind: "conflict"; current: Note }
  | { kind: "error"; message: string };

const DEBOUNCE_MS = 1500;

export interface NoteEditorHandle {
  body: string;
  setBody(next: string, opts?: { save?: boolean }): void;
  /** Drop text in at the cursor — what the prompt chips and the stamp buttons use. */
  insert(text: string): void;
}

export interface NoteStatus {
  /** Display path: `a1/attention.md`. */
  path: string;
  state: SaveState;
}

/**
 * The note for one topic (or the legacy module note when `topicId` is absent),
 * with the same debounce, `mtime_ns` echo and 409 refusal as before. §6.2's three
 * exits live in `NoteConflict`.
 */
export default function NoteEditor({
  moduleId,
  topicId,
  handleRef,
  toolbar,
  onStatus,
  showStatus = true,
}: {
  moduleId: string;
  topicId?: string | null;
  /** Mutable escape hatch so the AI menu and the stamp buttons can drive the buffer. */
  handleRef?: React.RefObject<NoteEditorHandle | null>;
  toolbar?: React.ReactNode;
  onStatus?(status: NoteStatus): void;
  showStatus?: boolean;
}) {
  const [note, setNote] = useState<Note | null>(null);
  const [body, setBody] = useState("");
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const mtime = useRef<number>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedFor = useRef<string | null>(null);
  const view = useRef<EditorView | null>(null);
  const key = `${moduleId}/${topicId ?? ""}`;
  const path = note?.path ?? (topicId ? `${moduleId}/${topicId}.md` : `${moduleId}/notes.md`);

  useEffect(() => {
    let alive = true;
    setNote(null);
    const load = topicId ? getTopicNote(moduleId, topicId) : getNote(moduleId);
    load
      .then((n) => {
        if (!alive) return;
        mtime.current = n.mtime_ns;
        loadedFor.current = key;
        setNote(n);
        setBody(n.body);
        setState({ kind: "idle" });
      })
      .catch((e: Error) => alive && setState({ kind: "error", message: e.message }));
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [moduleId, topicId, key]);

  useEffect(() => {
    onStatus?.({ path, state });
  }, [onStatus, path, state]);

  const save = useCallback(
    async (next: string) => {
      setState({ kind: "saving" });
      const payload = {
        body: next,
        mtime_ns: mtime.current,
        frontmatter: note?.frontmatter,
      };
      try {
        const saved = topicId
          ? await putTopicNote(moduleId, topicId, payload)
          : await putNote(moduleId, payload);
        mtime.current = saved.mtime_ns;
        setState({ kind: "saved", at: Date.now() });
      } catch (e) {
        if (e instanceof ConflictError) setState({ kind: "conflict", current: e.current });
        else setState({ kind: "error", message: (e as Error).message });
      }
    },
    [moduleId, topicId, note?.frontmatter],
  );

  const change = useCallback(
    (next: string, opts?: { save?: boolean }) => {
      setBody(next);
      if (loadedFor.current !== key) return;
      if (timer.current) clearTimeout(timer.current);
      setState({ kind: "dirty" });
      if (opts?.save === false) return;
      timer.current = setTimeout(() => void save(next), DEBOUNCE_MS);
    },
    [key, save],
  );

  const insert = useCallback(
    (text: string) => {
      const v = view.current;
      if (!v) {
        change(`${body.replace(/\s*$/, "")}\n${text}`);
        return;
      }
      const at = v.state.selection.main.head;
      v.dispatch({
        changes: { from: at, to: at, insert: text },
        selection: { anchor: at + text.length },
      });
      v.focus();
    },
    [body, change],
  );

  if (handleRef)
    handleRef.current = note ? { body, setBody: change, insert } : null;

  const reload = () => {
    if (state.kind !== "conflict") return;
    mtime.current = state.current.mtime_ns;
    setNote(state.current);
    setBody(state.current.body);
    setState({ kind: "idle" });
  };

  /** Overwrite means: take the disk `mtime_ns` the 409 handed back, then PUT mine. */
  const overwrite = () => {
    if (state.kind !== "conflict") return;
    mtime.current = state.current.mtime_ns;
    void save(body);
  };

  if (!note && state.kind === "error")
    return <p className="err">Could not load the note: {state.message}</p>;
  if (!note) return <p className="muted">Loading note…</p>;

  return (
    <div className="noteedit">
      {toolbar || showStatus ? (
        <div className="noteedit-bar">
          <div className="noteedit-tools">{toolbar}</div>
          {showStatus ? <SaveIndicator state={state} /> : null}
        </div>
      ) : null}

      {state.kind === "conflict" ? (
        <NoteConflict
          path={path}
          mine={body}
          disk={state.current.body}
          onOverwrite={overwrite}
          onReload={reload}
        />
      ) : null}

      <CodeMirror
        value={body}
        onChange={change}
        extensions={[markdown()]}
        viewRef={view}
        ariaLabel={topicId ? `Note for ${topicId}` : `Notes for module ${moduleId}`}
        testId="note-editor"
      />
    </div>
  );
}

/** "saved 4s ago" — the one live region on the page (§Interactions, a11y). */
export function saveText(state: SaveState, now = Date.now()): string {
  switch (state.kind) {
    case "saving":
      return "saving…";
    case "dirty":
      return "unsaved";
    case "saved": {
      const s = Math.max(0, Math.round((now - state.at) / 1000));
      return s < 60 ? `saved ${s}s ago` : `saved ${Math.round(s / 60)}m ago`;
    }
    case "conflict":
      return "save refused";
    case "error":
      return `save failed: ${state.message}`;
    default:
      return "not edited yet";
  }
}

function SaveIndicator({ state }: { state: SaveState }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (state.kind !== "saved") return;
    const t = setInterval(() => tick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, [state.kind]);
  return (
    <span className="noteedit-status mono" role="status" aria-live="polite">
      {saveText(state)}
    </span>
  );
}
