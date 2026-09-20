import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  BACK_15,
  MINUTES_LOGGED,
  OPEN_IN_BROWSER,
  PAUSE_WHILE_WRITING,
  RESUME_POSITION,
} from "../labels";
import type { SourceRow } from "../types";

/** `42:10` for minutes, `p.3` for pages, `#3` for items — the learner's own units. */
export function stampOf(position: number, unit: string): string {
  if (unit !== "min") return unit === "pages" ? `p.${Math.round(position)}` : `#${Math.round(position)}`;
  const total = Math.max(0, Math.round(position * 60));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

/** The inverse, so the manual field round-trips: `1:02:30` → 62.5 minutes. */
export function parsePosition(text: string, unit: string): number | null {
  const clean = text.trim().replace(/^[p#.]+/i, "");
  if (!clean) return null;
  if (unit !== "min") {
    const n = Number(clean);
    return Number.isFinite(n) ? n : null;
  }
  const parts = clean.split(":").map((p) => Number(p));
  if (parts.some((p) => !Number.isFinite(p))) return null;
  const seconds = parts.reduce((acc, p) => acc * 60 + p, 0);
  return seconds / 60;
}

const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/;

/** Embed URL with the player API on, so the pane can pause, seek and read the playhead. */
export function youtubeEmbed(url: string | null | undefined, position: number): string | null {
  const m = url ? YOUTUBE.exec(url) : null;
  if (!m) return null;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return (
    `https://www.youtube.com/embed/${m[1]}?start=${Math.max(0, Math.round(position * 60))}` +
    `&enablejsapi=1&origin=${encodeURIComponent(origin)}`
  );
}

type PlayerCommand = "playVideo" | "pauseVideo" | "seekTo";

/**
 * The left half of focus mode: the source with a real position, a field you can
 * correct by hand, and the two buttons that put that position into the note.
 *
 * For a YouTube source the pane speaks the embed's widget protocol over
 * `postMessage`: it asks the player to report, follows the real playhead, and
 * sends play / pause / seek — so "Pause while I write" pauses the video itself.
 */
export default function SourcePane({
  source,
  position,
  onPosition,
  paused,
  onPause,
  onStamp,
  onPlayerState,
}: {
  source: SourceRow;
  position: number;
  onPosition(next: number): void;
  paused: boolean;
  onPause(next: boolean): void;
  onStamp(): void;
  onPlayerState?(connected: boolean, playing: boolean): void;
}) {
  const id = useId();
  const stamp = stampOf(position, source.unit);
  const [draft, setDraft] = useState(stamp);
  const field = useRef<HTMLInputElement | null>(null);
  const frame = useRef<HTMLIFrameElement | null>(null);
  const connected = useRef(false);

  // The clock keeps moving; the field follows it unless the learner is in it.
  useEffect(() => {
    if (document.activeElement !== field.current) setDraft(stamp);
  }, [stamp]);

  // The embed's start time is pinned when the source opens; it never follows the
  // ticking position (a changing `src` reloads the iframe every second).
  const [embedStart, setEmbedStart] = useState(position);
  useEffect(() => {
    setEmbedStart(position);
    connected.current = false;
    onPlayerState?.(false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-pin only when the source changes
  }, [source.id]);
  const embed = useMemo(
    () =>
      source.kind === "video" || source.kind === "course"
        ? youtubeEmbed(source.url, embedStart)
        : null,
    [source.kind, source.url, embedStart],
  );

  const command = useCallback((func: PlayerCommand, args: unknown[] = []) => {
    const win = frame.current?.contentWindow;
    if (!win || !connected.current) return false;
    win.postMessage(JSON.stringify({ event: "command", func, args }), "*");
    return true;
  }, []);

  // Subscribe to the player once the iframe loads; follow its playhead and state.
  useEffect(() => {
    if (!embed) return;
    const win = () => frame.current?.contentWindow ?? null;
    const subscribe = () =>
      win()?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*");
    const onMessage = (e: MessageEvent) => {
      if (e.source !== win()) return;
      let data: { event?: string; info?: { currentTime?: number; playerState?: number } };
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (data.event === "onReady" || data.event === "initialDelivery") {
        connected.current = true;
        onPlayerState?.(true, false);
      }
      if (data.event === "infoDelivery" && data.info) {
        connected.current = true;
        if (typeof data.info.currentTime === "number") onPosition(data.info.currentTime / 60);
        if (typeof data.info.playerState === "number")
          onPlayerState?.(true, data.info.playerState === 1);
      }
    };
    window.addEventListener("message", onMessage);
    const el = frame.current;
    el?.addEventListener("load", subscribe);
    const retry = setInterval(() => !connected.current && subscribe(), 1500);
    return () => {
      window.removeEventListener("message", onMessage);
      el?.removeEventListener("load", subscribe);
      clearInterval(retry);
    };
  }, [embed, onPosition, onPlayerState]);

  /** A deliberate move: seek the live player, or reload the embed at the new time. */
  const seek = (next: number) => {
    onPosition(next);
    if (!command("seekTo", [Math.max(0, next * 60), true])) setEmbedStart(next);
  };

  const togglePause = () => {
    const next = !paused;
    onPause(next);
    command(next ? "pauseVideo" : "playVideo");
  };

  const pct = source.length ? Math.min(100, (position / source.length) * 100) : 0;

  return (
    <div className="focus-source">
      <div className="focus-source-head">
        <span className="focus-source-title">{source.title}</span>
        <span className="mono focus-source-pos">
          {stamp} / {stampOf(source.length, source.unit)}
        </span>
      </div>

      <div className="focus-stage">
        {embed ? (
          <iframe
            ref={frame}
            className="focus-embed"
            src={embed}
            title={source.title}
            allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="focus-placeholder">
            <div className="focus-placeholder-inner">
              <div className="focus-kind mono">{source.kind}</div>
              <p className="focus-placeholder-title">{source.title}</p>
              <p className="mono focus-placeholder-meta">{source.meta}</p>
              {source.url || source.path ? (
                <a
                  className="btn"
                  href={source.url ?? source.path ?? "#"}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {OPEN_IN_BROWSER}
                </a>
              ) : null}
            </div>
          </div>
        )}
      </div>

      <div className="focus-scrub">
        <div className="focus-scrub-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="focus-controls">
        <button type="button" className="btn btn-primary" onClick={onStamp}>
          Stamp {stamp} into the note
        </button>
        {source.unit === "min" ? (
          <button
            type="button"
            className="btn"
            onClick={() => seek(Math.max(0, position - 0.25))}
          >
            {BACK_15}
          </button>
        ) : null}
        <button type="button" className="btn" aria-pressed={paused} onClick={togglePause}>
          {paused ? RESUME_POSITION : PAUSE_WHILE_WRITING}
        </button>
        <label className="focus-posfield" htmlFor={id}>
          <span>{source.unit === "min" ? "at" : "page"}</span>
          <input
            id={id}
            ref={field}
            className="mono"
            type="text"
            value={draft}
            aria-label="Position in this source"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => {
              const next = parsePosition(e.target.value, source.unit);
              if (next === null) setDraft(stamp);
              else seek(next);
            }}
          />
        </label>
        <span className="focus-note-foot">{MINUTES_LOGGED}</span>
      </div>
    </div>
  );
}
