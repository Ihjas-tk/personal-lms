import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import StepStrip from "../components/StepStrip";
import TopicCard, { type FocusRequest } from "../components/TopicCard";
import ModuleSidebar from "../components/ModuleSidebar";
import FocusMode from "../components/FocusMode";
import { BACK_TO_TRACK, RE_TESTS_OVERDUE, WORKING_HERE, WORK_HERE_NOW } from "../labels";
import { getModule } from "../api";
import { aiBlockedReason, useStore } from "../store";
import type { ModuleWorkspace } from "../types";

/** The one topic to open when the page arrives with nothing asked for. */
function firstOpen(m: ModuleWorkspace): string | null {
  const started = m.topics.find((t) => t.state === "in_progress");
  if (started) return started.id;
  const unproved = m.topics.find((t) => t.state !== "proved");
  return (unproved ?? m.topics[0])?.id ?? null;
}

/**
 * The module workspace (§3): a numbered syllabus, one topic open at a time, with
 * the sidebar holding everything that is not the syllabus. Replaces the five tabs.
 */
export default function Module() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const revision = useStore((s) => s.vaultRevision);
  const session = useStore((s) => s.session);
  const health = useStore((s) => s.health);
  const startSession = useStore((s) => s.startSession);

  const [detail, setDetail] = useState<ModuleWorkspace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<FocusRequest | null>(null);
  const [starting, setStarting] = useState(false);

  const reload = useCallback(() => {
    getModule(id)
      .then(setDetail)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  // Blank only when the module itself changes: a vault `changed` event refreshes
  // in place, so focus mode is never torn down under the learner's hands.
  useEffect(() => {
    setDetail(null);
    setError(null);
    setFocus(null);
  }, [id]);

  useEffect(() => {
    if (!focus) reload();
  }, [reload, revision, focus]);

  const wanted = params.get("topic");
  // An attempt sends the learner back by check id; the topic that owns it opens.
  const fromCheck = params.get("check");
  const openId = useMemo(() => {
    if (!detail) return null;
    if (wanted && detail.topics.some((t) => t.id === wanted)) return wanted;
    if (fromCheck) {
      const owner = detail.topics.find((t) => t.checks.some((c) => c.id === fromCheck));
      if (owner) return owner.id;
    }
    return firstOpen(detail);
  }, [detail, wanted, fromCheck]);

  const setOpen = (topicId: string) => {
    const p = new URLSearchParams(params);
    p.delete("check");
    if (topicId === openId) p.delete("topic");
    else p.set("topic", topicId);
    setParams(p, { replace: true });
  };

  if (error) return <p className="err">Could not load the module: {error}</p>;
  if (!detail) return <p className="muted">Loading module…</p>;

  const here = session?.module_id === detail.id;
  const focusTopic = focus ? detail.topics.find((t) => t.id === focus.topicId) : null;

  return (
    <div data-screen-label="Module workspace">
      <Link className="backlink" to="/track">
        {BACK_TO_TRACK}
      </Link>

      <header className="mod-head">
        <div>
          <h1>{detail.title}</h1>
          <div className="mono mod-sub">
            weeks {detail.weeks[0]}–{detail.weeks[1]}
            {detail.track ? ` · ${detail.track}` : ""}
            {detail.soft_date ? ` · soft date ${detail.soft_date}` : ""} ·{" "}
            {detail.actual_hours.toFixed(1)} of {detail.budget_hours} h
          </div>
        </div>
        <div className="mod-actions">
          {detail.overdue_retests > 0 ? (
            <span className="pill-amber">{RE_TESTS_OVERDUE(detail.overdue_retests)}</span>
          ) : null}
          <button
            type="button"
            className="btn btn-primary btn-big"
            disabled={here || starting || Boolean(session)}
            title={
              session && !here ? `A session is already open on ${session.module_id}.` : undefined
            }
            onClick={() => {
              setStarting(true);
              void startSession(detail.id).finally(() => setStarting(false));
            }}
          >
            {here ? WORKING_HERE : WORK_HERE_NOW}
          </button>
        </div>
      </header>

      <StepStrip
        topics={detail.topics}
        openId={openId}
        summary={detail.step_summary}
        onOpen={setOpen}
      />

      <div className="mod-grid">
        <div className="mod-topics">
          {detail.topics.map((t) => (
            <TopicCard
              key={t.id}
              topic={t}
              module={detail}
              open={t.id === openId}
              onToggle={() => setOpen(t.id)}
              onFocus={setFocus}
              onChanged={setDetail}
              blockedReason={aiBlockedReason(health, session)}
            />
          ))}
          {detail.topics.length === 0 ? (
            <p className="empty">This module has no topics yet.</p>
          ) : null}
        </div>

        <ModuleSidebar
          module={detail}
          onChanged={setDetail}
          onOpenNote={(topicId) => setFocus({ topicId })}
        />
      </div>

      {focusTopic ? (
        <FocusMode
          module={detail}
          topic={focusTopic}
          sourceId={focus?.sourceId}
          initialInsert={focus?.insert}
          onClose={() => setFocus(null)}
          onChanged={setDetail}
        />
      ) : null}
    </div>
  );
}
