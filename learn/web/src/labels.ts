/**
 * The fourteen renames (`Learn Design System.dc.html` §5). API ids never change —
 * `durable`, `must_cover`, `overconfident_miss` and friends stay on the wire; only
 * what the learner reads is rewritten here. Every screen goes through this file.
 */
import type {
  CapstoneState,
  LadderState,
  ResourceState,
  Score,
  TopicState,
} from "./types";

/** durable → lasting · proficient → solid · familiar → shaky · attempted → tried. */
export const LADDER: Record<LadderState, string> = {
  not_started: "untouched",
  attempted: "tried",
  familiar: "shaky",
  proficient: "solid",
  durable: "lasting",
};

export type Tone = "plain" | "good" | "amber" | "vio";

export const LADDER_TONE: Record<LadderState, Tone> = {
  not_started: "plain",
  attempted: "plain",
  familiar: "amber",
  proficient: "vio",
  durable: "good",
};

/** The ridge's six stacked segments, bottom to top. */
export const LADDER_ORDER: LadderState[] = [
  "durable",
  "proficient",
  "familiar",
  "attempted",
  "not_started",
];

/** reconstructed / taught → rebuilt it / taught it. */
export const RESOURCE: Record<ResourceState, string> = {
  queued: "not opened",
  skimmed: "skimmed",
  read: "read",
  reconstructed: "rebuilt it",
  taught: "taught it",
};

export const SCORE: Record<Score, string> = {
  cant: "couldn't",
  partial: "partly",
  fluent: "fluent",
};

export const CAPSTONE: Record<CapstoneState, string> = {
  not_started: "not started",
  draft: "draft",
  working: "working",
  reviewed: "reviewed",
  done: "exists",
};

export const ERROR_CATEGORY: Record<string, string> = {
  notation_shape: "notation and shapes",
  misremembered_mechanism: "misremembered mechanism",
  conflated_two_things: "conflated two things",
  off_by_one_masking: "off by one, masking",
  statistical_reasoning: "statistical reasoning",
  api_library: "api or library",
  didnt_know: "did not know it",
};

/** must cover → core. */
export const CORE = "core";
/** overconfident miss → missed while sure. */
export const MISSED_WHILE_SURE = "missed while sure";
/** draft reference, verify → reference not yet checked by you. */
export const DRAFT_REFERENCE = "reference not yet checked by you";
/** Weekly review → "<day> debrief". The day comes from the curriculum. */
export const DEFAULT_DEBRIEF_DAY = "Sunday";
export const debriefLabel = (day?: string | null) =>
  `${day?.trim() || DEFAULT_DEBRIEF_DAY} debrief`;
/** The label on the default day, for anything rendered before the Desk has loaded. */
export const DEBRIEF = debriefLabel();
/** Close session → Wrap up · Stand up well. */
export const WRAP_UP = "Wrap up";
export const WRAP_UP_TITLE = "Stand up well";
/** Explain-back critique → second opinion. */
export const SECOND_OPINION = "second opinion";
/** Capstone artefacts → Things that exist. */
export const SHIPPED = "Things that exist";

/** coverage 2% → "N of M checks are yours". */
export const coverage = (yours: number, total: number) =>
  `${yours} of ${total} check${total === 1 ? "" : "s"} are yours`;

export const ladderLabel = (s: LadderState) => LADDER[s];
export const scoreLabel = (s: Score) => SCORE[s];
export const resourceLabel = (s: ResourceState) => RESOURCE[s];
export const capstoneLabel = (s: CapstoneState) => CAPSTONE[s];
export const errorCategoryLabel = (c: string) => ERROR_CATEGORY[c] ?? c.replace(/_/g, " ");

/* ------------------------------------------- B2: the workspace vocabulary */

/** Topic states as the syllabus reads them. */
export const TOPIC: Record<TopicState, string> = {
  proved: "done",
  in_progress: "in progress",
  not_started: "not started",
};

export const TOPIC_TONE: Record<TopicState, Tone> = {
  proved: "good",
  in_progress: "vio",
  not_started: "plain",
};

export const topicLabel = (s: TopicState) => TOPIC[s];

const WORDS = [
  "No",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];

/** "Six things to cover." — counts under thirteen are written out, as the copy does. */
export const countWord = (n: number) => (n >= 0 && n < WORDS.length ? WORDS[n] : String(n));

/* ---------------------------------------------------- module workspace */
export const WORK_HERE_NOW = "Work here now";
export const WORKING_HERE = "Working here";
export const BACK_TO_TRACK = "← The track";
export const THINGS_TO_COVER = (n: number) =>
  `${countWord(n)} thing${n === 1 ? "" : "s"} to cover.`;
export const RE_TESTS_OVERDUE = (n: number) =>
  `${n} re-test${n === 1 ? "" : "s"} overdue`;
export const SOURCE_HEAD = "Source";
/** Required is the default, so only the extras are tagged — tagging every row is noise. */
export const RESOURCE_OPTIONAL = "optional";
/** The label over an either/or group: finish any one member and the group is closed. */
export const RESOURCE_PICK_ONE = "pick one";
/** "1 of 2 required" — either/or groups count once; optional extras do not count. */
export const TOPIC_REQUIRED = (done: number, total: number) => `${done} of ${total} required`;
export const NOTE_HEAD = "Your note";
export const PROOF_HEAD = "Proof — the check that closes this topic";
export const NOTE_EMPTY =
  "Nothing written here yet. A note that only restates the source does not count — " +
  "write the mechanism, the contrast, and the question you cannot answer.";
export const NOTE_CONTINUE = "Continue note";
export const NOTE_START = "Start a note";
export const MECHANISM_PROMPT = "Mechanism prompt";
export const SETUP_ONCE = "Set-up, once";
export const TIME_HERE = "Time here";
export const ALL_NOTES = "All notes";
export const PRODUCES = "Things this module produces";
export const BEHIND_LINE = "already behind, which is information, not a failure";
export const PUSH_BACK = "Push this module back a week";

/** The template the "Mechanism prompt" button drops into a note. */
export const MECHANISM_TEMPLATE = `## Mechanism

What actually happens, step by step:

## Contrast with…

## The question I cannot answer yet
`;

/* --------------------------------------------------------- focus mode */
export const FOCUS_DONE = "Done";
export const SIDE_BY_SIDE = "Side by side";
export const POPOUT = "Pop-out jotter";
export const MINUTES_LOGGED = "Minutes watched are logged against this resource.";
export const PAUSE_WHILE_WRITING = "Pause while I write";
export const RESUME_POSITION = "Resume";
export const BACK_15 = "−15s";
export const UNFILED_JOTS = "Unfiled jots";
export const FILE_AT_CLOSE = "File them at session close";
export const JOT_PLACEHOLDER = "Jot a line without losing your place…";
export const JOTTER_FOOT = "Stays on top · ⌘↵ to file a line";
export const OPEN_IN_BROWSER = "Open in browser";

/** The four dashed prompt chips above the note editor, and what each inserts. */
export const JOT_PROMPTS: { label: string; template: string }[] = [
  { label: "+ Mechanism", template: "\n**Mechanism.** " },
  { label: "+ Contrast with…", template: "\n**Contrast with…** " },
  { label: "+ Open question", template: "\n**Open question.** " },
  { label: "+ Stamp timestamp", template: "" },
];

/* ------------------------------------------------------ check attempt */
export const STAGES = ["1 · How sure", "2 · Write", "3 · Compare"];
export const HOW_SURE = "Before you answer — how sure are you?";
export const HOW_SURE_SUB =
  "This is the only thing that makes the calibration readout mean anything. It cannot be skipped.";
export const LOCK_IT_IN = "Lock it in and start writing";
export const HIDDEN_UNTIL_SUBMIT =
  "The rubric and the reference answer stay hidden until you freeze your answer.";
export const FROM_MEMORY = "Your answer, from memory";
export const SUBMIT_AND_FREEZE = "Submit and freeze";
export const FREEZE_FOOT =
  "Nothing is graded until you freeze it. AI is off while an answer is open.";
export const NO_PASTE =
  "Paste and autocomplete are disabled for code checks — write it from memory.";
export const WHAT_YOU_WROTE = "What you wrote";
export const THE_REFERENCE = "The reference";
export const FREEZING = "Freezing…";
export const MARK_IT_YOURSELF = "Mark it yourself, line by line";
export const MARK_IT_SUB = `The AI can give a ${SECOND_OPINION}. It never overwrites your mark.`;
export const OVERALL = "Overall";
export const DIAGNOSIS_Q = "What exactly differed from the reference?";
export const GOES_TO_ERROR_LOG = "goes to the error log";
export const RECORD_AND_MOVE_ON = "Record and move on";
export const BACK_TO_MODULE = "Back to the module";
export const SPACING_LINE =
  "Comes back in 2 days. Two clean passes a week apart make it lasting.";

/* ------------------------------------------------------------ wrap up */
export const WRAP_UP_SUB = "Three questions, then it is written to the vault.";
export const REFLECTION_Q =
  "What changed in your understanding, and what can you still not do?";
export const PLAN_Q = "Next time, when you sit down";
export const PLAN_FOOT = "This sentence is the first thing you will see next time.";
export const ifCuePlaceholder = (day?: string | null) =>
  `it is ${day?.trim() || DEFAULT_DEBRIEF_DAY} after breakfast`;
export const EXTRA_ERROR_Q = "Anything you got wrong that is not already logged?";
export const FATIGUE_Q = "How spent are you?";
export const CLOSE_THE_SESSION = "Close the session";
export const KEEP_WORKING = "Keep working";
export const VAULT_FOOT = "Committed to the vault as one markdown file.";
export const ENOUGH = (n: number) => `${n} words — enough.`;
export const NOT_YET = (n: number, min: number) => `${n} of ${min} words.`;
export const fileJotsLabel = (n: number) =>
  `File ${n} jot${n === 1 ? "" : "s"} into their notes`;

/* --------------------------------------------- tidy, conflict, AI off */
export const TIDY_TITLE = "Tidy · review each change";
export const TIDY_STATS = (added: number) =>
  `${countWord(added)} word${added === 1 ? "" : "s"} added, nothing else. ` +
  "Numbers, code, maths and links are checked before you see this.";
export const TIDY_KEEP = "Keep original · Esc";
export const TIDY_TAKE_ALL = "Take all";
export const TIDY_REVERT_ALL = "Revert all";
export const TIDY_SNAPSHOT = "A snapshot is committed before anything is written.";
export const TIDY_RETRYING = (reason: string) =>
  `The first pass was refused (${reason}), so this is a second pass with that pinned.`;
export const TIDY_REFUSED = "Refused — the tidy changed something it is not allowed to change";
export const TIDY_REFUSED_TAIL =
  "Your note was not touched and there is no diff to review. The refusal is logged.";
export const KEEP_ORIGINAL = "Keep original";

/** The debrief's one cost line: list price, so the real bill is this or less. */
export const aiSpendLine = (spend: { days: number; calls: number; usd: number }) =>
  spend.calls === 0
    ? `No AI calls in the last ${spend.days} days.`
    : `AI spend, last ${spend.days} days: $${spend.usd.toFixed(2)} over ${spend.calls} call` +
      `${spend.calls === 1 ? "" : "s"}, at list price.`;

/* --------------------------------------------- restructure */
export const RESTRUCTURE_TITLE = "Restructure · review each change";
export const RESTRUCTURE_STATS = (added: number) =>
  `${countWord(added)} word${added === 1 ? "" : "s"} added for layout and context. ` +
  "Everything the note said is checked to still be there before you see this.";
export const RESTRUCTURE_REFUSED =
  "Refused — the restructure dropped or changed something it must keep";

export const CONFLICT_TITLE =
  "This note changed on disk since you opened it, so the save was refused";
export const CONFLICT_SUB =
  "Both versions still exist. Your edits are held in the editor until you choose.";
export const CONFLICT_OVERWRITE = "Keep mine and overwrite the file";
export const CONFLICT_RELOAD = "Reload the file and lose my edits";
export const CONFLICT_DIFF = "Show me the difference first";
export const conflictStatus = (path: string) => `save refused · ${path} · mtime mismatch`;

/** §6.3 — one plain sentence per reason, stated inside the menu, never as a tooltip alone. */
export const AI_NO_CREDENTIAL =
  "No API credential found. Put ANTHROPIC_API_KEY=sk-ant-... in learn/.env, " +
  "or export ANTHROPIC_API_KEY, then restart learn.";
/** The two literals in that sentence are set in mono wherever it is rendered. */
export const AI_CREDENTIAL_CODE = ["learn/.env", "ANTHROPIC_API_KEY"];
export const AI_ANSWER_OPEN = "An answer is open. Submit or leave it before using AI.";
export const AI_UNREACHABLE = "The server is not reachable.";
export const AI_TIDY_ITEM = "Tidy — copy-edit, shown as a diff";
export const AI_RESTRUCTURE_ITEM =
  "Restructure — richer layout and source context, shown as a diff";
export const AI_SECOND_OPINION_ITEM = `${SECOND_OPINION[0].toUpperCase()}${SECOND_OPINION.slice(1)} — grades an answer you have already submitted`;
