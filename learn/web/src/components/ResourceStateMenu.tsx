import { useEffect, useId, useRef, useState } from "react";
import { patchResource } from "../api";
import { RESOURCE } from "../labels";
import type { ModuleWorkspace, ResourceState } from "../types";
import { RESOURCE_STATES } from "./Chip";

/** One line per rung, in the learner's own words, so the ladder explains itself. */
const MEANING: Record<ResourceState, string> = {
  queued: "Haven't opened it.",
  skimmed: "Pass one: know what it claims.",
  read: "Read it properly; could summarise it.",
  reconstructed: "Rebuilt it: re-derived or re-ran the thing myself.",
  taught: "Taught it: explained it cold to someone, or passed a check with it.",
};

/**
 * The state chip on a source row, made pressable. Two separate calls, both the
 * learner's: how far up the ladder they are, and whether the source is *done* —
 * an article is finished when read, so "done" counts at any rung.
 */
export default function ResourceStateMenu({
  moduleId,
  resourceId,
  state,
  done = false,
  onChanged,
}: {
  moduleId: string;
  resourceId: string;
  state: ResourceState;
  done?: boolean;
  onChanged(next: ModuleWorkspace): void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const counts = done || state === "reconstructed" || state === "taught";

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

  const send = async (patch: { state?: ResourceState; done?: boolean }) => {
    setOpen(false);
    setBusy(true);
    try {
      onChanged(await patchResource(moduleId, resourceId, patch));
    } catch {
      /* the row keeps its old chip; the next refresh will tell the truth */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rstate" ref={root}>
      <button
        type="button"
        className="chip rstate-btn"
        data-tone={counts ? "good" : "plain"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Where you are with this source: ${RESOURCE[state]}${done ? ", done" : ""}. Change`}
        disabled={busy}
        onClick={() => setOpen((o) => !o)}
      >
        {RESOURCE[state]}
        {done ? " · done" : ""} <span aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="rstate-menu" role="menu" id={id}>
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={done}
            className="rstate-item rstate-done"
            data-counts="true"
            onClick={() => void send({ done: !done })}
          >
            <span className="rstate-label">{done ? "✓ Done with this source" : "Done with this source"}</span>
            <span className="rstate-meaning">
              {done
                ? "Counts toward the module. Click to reopen it."
                : "Finished, at whatever rung you're on. An article is done when it's read."}
            </span>
          </button>
          <div className="rstate-head mono">How far did you take it?</div>
          {RESOURCE_STATES.map((s) => (
            <button
              key={s}
              type="button"
              role="menuitemradio"
              aria-checked={s === state}
              className="rstate-item"
              data-counts={s === "reconstructed" || s === "taught"}
              onClick={() => (s === state ? setOpen(false) : void send({ state: s }))}
            >
              <span className="rstate-label">{RESOURCE[s]}</span>
              <span className="rstate-meaning">{MEANING[s]}</span>
            </button>
          ))}
          <div className="rstate-foot">
            “Rebuilt it” and “taught it” count on their own; anything else counts once you mark it done.
          </div>
        </div>
      ) : null}
    </div>
  );
}
