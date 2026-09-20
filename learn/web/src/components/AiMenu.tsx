import { useEffect, useRef, useState } from "react";
import { AI_CREDENTIAL_CODE } from "../labels";

export interface AiMenuItem {
  label: string;
  hint?: string;
  onSelect(): void;
}

/** The credential sentence names two literals; both are set in mono where it appears. */
function Reason({ text }: { text: string }) {
  const pattern = new RegExp(`(${AI_CREDENTIAL_CODE.join("|")})`, "g");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        AI_CREDENTIAL_CODE.includes(part) ? (
          <code key={i}>{part}</code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/**
 * §6.3. Blocked, never hidden: the entries stay where they are, disabled, with the
 * reason stated once in plain words inside the menu rather than only as a tooltip.
 */
export default function AiMenu({
  items,
  blockedReason,
}: {
  items: AiMenuItem[];
  blockedReason: string | null;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div className="menu" ref={wrap}>
      <button
        type="button"
        className="btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        AI ▾
      </button>
      {open ? (
        <div className="menu-list" role="menu">
          {blockedReason ? (
            <p className="menu-reason" role="note">
              <Reason text={blockedReason} />
            </p>
          ) : null}
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={!!blockedReason}
              title={blockedReason ?? item.hint}
              aria-disabled={!!blockedReason}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
