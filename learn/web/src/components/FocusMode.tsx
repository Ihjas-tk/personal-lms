import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AiMenu from "./AiMenu";
import JotStrip from "./JotStrip";
import Jotter from "./Jotter";
import NoteEditor, {
  saveText,
  type NoteEditorHandle,
  type NoteStatus,
} from "./NoteEditor";
import SourcePane, { stampOf } from "./SourcePane";
import ResourceStateMenu from "./ResourceStateMenu";
import TidyDialog, { type AiNoteMode } from "./TidyDialog";
import {
  AI_RESTRUCTURE_ITEM,
  AI_SECOND_OPINION_ITEM,
  AI_TIDY_ITEM,
  FOCUS_DONE,
  JOT_PROMPTS,
  POPOUT,
  SIDE_BY_SIDE,
} from "../labels";
import {
  getJots,
  getTopicNote,
  patchResource,
  postJot,
  putTopicNote,
  snapshotVault,
} from "../api";
import { aiBlockedReason, useStore } from "../store";
import type { Jot, ModuleWorkspace, Topic } from "../types";

const clock = (seconds: number) =>
  `${Math.floor(seconds / 3600)}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}`;

/**
 * Focus mode (§4): the source on the left with a position you can stamp, the note
 * on the right, and the unfiled jots underneath. `Done` closes it and flushes the
 * minutes watched against the resource.
 */
export default function FocusMode({
  module: m,
  topic,
  sourceId,
  initialInsert,
  onClose,
  onChanged,
}: {
  module: ModuleWorkspace;
  topic: Topic;
  sourceId?: string | null;
  initialInsert?: string | null;
  onClose(): void;
  onChanged?(next: ModuleWorkspace): void;
}) {
  const health = useStore((s) => s.health);
  const session = useStore((s) => s.session);
  const elapsed = useStore((s) => s.elapsed);
  const blocked = aiBlockedReason(health, session);

  const [mode, setMode] = useState<"split" | "popout">("split");
  const [pick, setPick] = useState(
    Math.max(0, topic.sources.findIndex((s) => s.id === sourceId)),
  );
  const source = topic.sources[pick] ?? null;
  const [position, setPosition] = useState(source?.position ?? 0);
  const [paused, setPaused] = useState(false);
  /** Once the YouTube player reports in, it owns the position; we only count minutes. */
  const [player, setPlayer] = useState({ connected: false, playing: false });
  const [jots, setJots] = useState<Jot[]>([]);
  const [status, setStatus] = useState<NoteStatus | null>(null);
  const [aiMode, setAiMode] = useState<AiNoteMode | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handle = useRef<NoteEditorHandle | null>(null);
  const accrued = useRef(0);
  const positionRef = useRef(position);
  positionRef.current = position;
  const logged = source?.kind === "video" || source?.kind === "course";

  useEffect(() => {
    setPosition(topic.sources[pick]?.position ?? 0);
  }, [pick, topic.sources]);

  /** Minutes watched accrue in the background and land at most once a minute. */
  const flush = useCallback(
    async (minutes: number) => {
      if (!source) return;
      if (minutes <= 0 && source.position === positionRef.current) return;
      try {
        const next = await patchResource(m.id, source.id, {
          minutes_delta: minutes,
          position: positionRef.current,
        });
        onChanged?.(next);
      } catch {
        /* a lost minute is not worth an interruption */
      }
    },
    [m.id, source, onChanged],
  );

  useEffect(() => {
    if (!logged || paused) return;
    // With a live player, minutes accrue only while it is actually playing, and the
    // position comes from its playhead rather than from this clock.
    if (player.connected && !player.playing) return;
    const t = setInterval(() => {
      accrued.current += 1;
      if (!player.connected)
        setPosition((p) => (source?.unit === "min" ? p + 1 / 60 : p));
      if (accrued.current >= 60) {
        const minutes = Math.floor(accrued.current / 60);
        accrued.current -= minutes * 60;
        void flush(minutes);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [logged, paused, player.connected, player.playing, source?.unit, flush]);

  const close = useCallback(() => {
    if (logged) void flush(Math.floor(accrued.current / 60));
    accrued.current = 0;
    onClose();
  }, [logged, flush, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !aiMode) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, aiMode]);

  const loadJots = useCallback(() => {
    getJots({ module_id: m.id, unfiled: true })
      .then((rows) => setJots(rows.filter((j) => !j.topic_id || j.topic_id === topic.id)))
      .catch(() => setJots([]));
  }, [m.id, topic.id]);

  useEffect(loadJots, [loadJots]);

  useEffect(() => {
    if (!initialInsert) return;
    const t = setTimeout(() => handle.current?.insert(initialInsert), 50);
    return () => clearTimeout(t);
  }, [initialInsert]);

  const stamp = source ? stampOf(position, source.unit) : "";

  const addJot = (text: string) => {
    void postJot({
      module_id: m.id,
      topic_id: topic.id,
      resource_id: source?.id ?? null,
      stamp: stamp || null,
      text,
    })
      .then(() => loadJots())
      .catch((e: Error) => setNotice(e.message));
  };

  /** §7.1: snapshot, then write. Neither action's text reaches disk unreviewed. */
  const acceptAiEdit = async (text: string) => {
    const label = aiMode === "restructure" ? "restructure" : "tidy";
    setAiMode(null);
    try {
      await snapshotVault(`pre-${label} snapshot: ${topic.id}`);
      const current = await getTopicNote(m.id, topic.id);
      await putTopicNote(m.id, topic.id, {
        body: text,
        mtime_ns: current.mtime_ns,
        frontmatter: current.frontmatter,
      });
      handle.current?.setBody(text, { save: false });
      setNotice(`${label[0].toUpperCase()}${label.slice(1)} applied and committed.`);
    } catch (e) {
      setNotice(`Could not apply the ${label}: ${(e as Error).message}`);
    }
  };

  const aiItems = useMemo(
    () => [
      { label: AI_TIDY_ITEM, onSelect: () => setAiMode("tidy") },
      { label: AI_RESTRUCTURE_ITEM, onSelect: () => setAiMode("restructure") },
      {
        label: AI_SECOND_OPINION_ITEM,
        hint: "Runs on a submitted answer, from a check attempt.",
        onSelect: () =>
          setNotice("A second opinion runs on a submitted answer — open a check attempt."),
      },
    ],
    [],
  );

  return (
    <div className="focus" role="dialog" aria-modal="true" aria-label={`Note — ${topic.title}`}>
      <header className="focus-head">
        <div className="focus-id">
          <div className="focus-topic">{topic.title}</div>
          <div className="mono focus-path" aria-live="polite">
            {status ? `${status.path} · ${saveText(status.state)}` : ""}
          </div>
        </div>

        <div className="focus-sources-wrap">
          <div className="seg focus-sources" role="group" aria-label="Source">
            {topic.sources.map((s, i) => (
              <button key={s.id} type="button" aria-pressed={i === pick} onClick={() => setPick(i)}>
                {s.title.length > 34 ? `${s.title.slice(0, 33)}…` : s.title}
              </button>
            ))}
          </div>
          {/* Why this source is on this topic, when it serves several. */}
          {source?.focus ? <div className="focus-source-focus">{source.focus}</div> : null}
        </div>

        <div className="focus-right">
          {source ? (
            <ResourceStateMenu
              moduleId={m.id}
              resourceId={source.id}
              state={source.state}
              done={source.done}
              onChanged={(next) => onChanged?.(next)}
            />
          ) : null}
          <span className="mono focus-clock">
            {session ? `${clock(elapsed)} · ${session.phase}` : "no session"}
          </span>
          <div className="seg" role="group" aria-label="Note layout">
            <button type="button" aria-pressed={mode === "split"} onClick={() => setMode("split")}>
              {SIDE_BY_SIDE}
            </button>
            <button type="button" aria-pressed={mode === "popout"} onClick={() => setMode("popout")}>
              {POPOUT}
            </button>
          </div>
          <button type="button" className="btn btn-primary" onClick={close}>
            {FOCUS_DONE}
          </button>
        </div>
      </header>

      <div className="focus-body" data-mode={mode}>
        {source ? (
          <SourcePane
            source={source}
            position={position}
            onPosition={setPosition}
            paused={paused}
            onPause={setPaused}
            onPlayerState={(connected, playing) => setPlayer({ connected, playing })}
            onStamp={() => handle.current?.insert(`[${stamp}] `)}
          />
        ) : (
          <div className="focus-source">
            <p className="empty">No source is attached to this topic yet.</p>
          </div>
        )}

        {/* Kept mounted in pop-out mode: unmounting would drop unsaved keystrokes. */}
        <div className="focus-note" hidden={mode === "popout"}>
            <div className="focus-prompts">
              {JOT_PROMPTS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="prompt-chip"
                  onClick={() =>
                    handle.current?.insert(p.template || (stamp ? `[${stamp}] ` : ""))
                  }
                >
                  {p.label}
                </button>
              ))}
              <div className="focus-ai">
                <AiMenu blockedReason={blocked} items={aiItems} />
              </div>
            </div>
            {notice ? (
              <p className="focus-notice" role="status">
                {notice}
              </p>
            ) : null}
            <div className="focus-editor">
              <NoteEditor
                moduleId={m.id}
                topicId={topic.id}
                handleRef={handle}
                showStatus={false}
                onStatus={setStatus}
              />
            </div>
            <JotStrip jots={jots} onAdd={addJot} />
        </div>
      </div>

      {mode === "popout" ? (
        <div className="focus-popout">
          <Jotter
            topicTitle={topic.id}
            stamp={stamp}
            onFile={addJot}
            onStamp={() => (stamp ? `[${stamp}]` : "")}
            onRestore={() => setMode("split")}
          />
        </div>
      ) : null}

      {aiMode && handle.current ? (
        <TidyDialog
          moduleId={m.id}
          topicId={topic.id}
          mode={aiMode}
          original={handle.current.body}
          onAccept={acceptAiEdit}
          onClose={() => setAiMode(null)}
        />
      ) : null}
    </div>
  );
}
