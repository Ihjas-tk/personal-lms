# UX Patterns for a Local Single-User LLM-Engineering Learning Tracker

Research date: 2026-09-19. All claims carry a source URL; "accessed" dates are 2026-09-19 unless noted.
Scope: personal, local-first, single-user, 40-week self-study tracker for a data scientist studying LLM engineering and AI evals. Material = modules (topics, resource links, hour budgets, "done when you can…" checks, capstone checklist). Wanted = progress tracking, code+math notes per module, concept checklists, upfront coverage checklist, "AI beautify my notes".

---

## A. Patterns to borrow

Difficulty key: **S** = a day or less; **M** = a few days; **L** = a week+ or a real subsystem.

| # | Pattern | Source tool (URL, accessed 2026-09-19) | What it does there | Why it fits this learner | Difficulty |
|---|---|---|---|---|---|
| A1 | **Plain-Markdown files with YAML front-matter as the only source of truth; DB is a derived index** | Obsidian vault model — <https://obsidian.md/help/bases>; explainer <https://floatboat.ai/blog/what-is-obsidian-vault> | A vault is a folder of Markdown on disk; properties live in YAML front-matter; the `.base` file stores only view config (filters, columns, sort), never the data | The learner's notes are the durable asset over 40 weeks. Files survive the app being rewritten, and `grep`/git/an LLM CLI all work on them unchanged | M |
| A2 | **Database *views* over notes, not a separate database** (table / cards / kanban / list grouped by a property) | Obsidian Bases core plugin, 5 view types — <https://obsidian.md/help/bases>; 2026 context <https://www.obsibrain.com/blog/obsidian-bases-guide> | Reads YAML properties already in notes and renders a filterable table/card/kanban; deleting the view loses nothing | Gives "all 40 modules, grouped by status, sorted by week" for free, and a kanban of `todo / doing / done` without inventing a schema | M |
| A3 | **Mastery ladder instead of a binary checkbox** — Not started → Attempted → Familiar → Proficient → Mastered, with level *demotion* on poor performance | Khan Academy — <https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work> | Five levels; course % counts only Proficient+Mastered; a weak result on a mixed-skill assessment demotes you | Maps exactly to "done when you can…" self-checks. A checkbox lies after 8 weeks; a demotable level makes decay visible, which is the whole point of a 40-week plan | S |
| A4 | **Percentage that only counts the high bar** | Khan Academy course mastery, same URL | Only Proficient/Mastered count toward the course percentage | Stops the coverage checklist from showing 80% when 80% is "skimmed a paper" | S |
| A5 | **Triage ladder for resources: Inbox → Later / Shortlist → Archive, with reading position** | Readwise Reader library locations — <https://docs.readwise.io/reader/guides/filtering/syntax-guide>; design lineage from Superhuman-style triage <https://blog.readwise.io/p/f8c0f71c-fe5f-4025-af57-f9f65c53fed7/> | Documents carry a location (inbox/later/shortlist/archive) plus reading progress, and are filterable on both | A module has 10–20 papers/videos/repos. A resource needs three states (queued / reading / done) plus "% through", not a checkbox. Shortlist = "this week's reading" | S |
| A6 | **Concept syllabus as a DAG shown as a concept map, with unlock state** | Exercism syllabus/concept exercises — <https://exercism.org/docs/building/tracks/syllabus> and <https://exercism.org/docs/building/tracks/concept-exercises> | Concepts form a tree rendered as a concept map; practice exercises stay locked until prerequisite concepts are learned | The upfront coverage checklist *is* a concept DAG (tokenization → attention → KV cache → serving; eval harness → LLM-as-judge → rubric calibration). Showing prerequisites answers "what can I legitimately start next?" | M |
| A7 | **Separate "learn" and "practice" tracks over the same concept set** | Exercism learning vs practice mode — <https://forum.exercism.org/t/learn-vs-practice-mode/38380> | Concept exercises teach; practice exercises drill, and one practice item can touch several concepts | Reading a paper ≠ being able to write the eval harness. Two axes per concept ("read it" / "built something with it") is more honest than one | S |
| A8 | **Retrieval-practice review queue derived from the "done when you can…" statements** | Anki + FSRS (default scheduler since 23.10; current release 26.09.2 bundling FSRS 6.6.2) — <https://github.com/ankitects/anki/releases>; FSRS project <https://github.com/open-spaced-repetition/fsrs4anki>; evidence: retrieval + distributed practice are "two of the most robust" desirable difficulties — <https://journals.physiology.org/doi/full/10.1152/advan.00173.2025> (2025) | Schedules items at the point of near-forgetting; grading updates memory state | Over 40 weeks week-3 material is gone by week 20 unless it is re-surfaced. Each "done when you can…" line is already a card front — zero extra authoring | M (rendering) / L (if you implement FSRS yourself — don't; see B7) |
| A9 | **Cards authored inline in the note, not in a separate app** | RemNote inline flashcard syntax (`==`, `>>`) — <https://help.remnote.com/en/articles/8663109-flashcard-basics>; concept <https://www.remnote.com/feature/spaced-repetition> | Front/back written directly in the note text; a document-scoped queue exists alongside the global one | Keeps the Markdown file the single artefact (A1) and makes "review only module 7" trivial | S |
| A10 | **Incremental extract → cloze, with an explicit priority queue** | SuperMemo incremental reading — <https://www.super-memory.com/help/read.htm>; priority queue <http://super-memory.com/archive/help2008/priority.htm> | Material enters a queue; articles are progressively broken into extracts then cloze items; every element carries a 0–100% priority so low-priority work can be postponed indefinitely without being lost | A 40-week plan *will* overrun. Priority + postpone is the humane alternative to a red overdue badge (see B1) | M |
| A11 | **Today view: one screen that answers "what do I do now"**, assembled from items whose start date is today | Things 3 Today — <https://culturedcode.com/things/features/>; design read <https://guptadeepak.com/tools/top-10-task-management-apps-2026/> | Pulls today's items from every list into one view; minimalism over feature count | Single highest-value screen for a solo learner. "Open the app → here is the next 90 minutes" beats any dashboard | S |
| A12 | **Time budget as estimate-vs-actual with a visual overrun signal** | Toggl Track project time estimates — <https://support.toggl.com/en-us/article/project-time-estimates-19si700/> and <https://toggl.com/track/time-reporting/> | Per-project or per-task hour estimates; tracked time turns **red** once it exceeds the estimate; optional alerts | The material already ships hour budgets. Actual-vs-budget per module is the signal that tells the learner to cut scope at week 12 rather than week 39 | S |
| A13 | **Soft, resettable deadlines** — dates that pace you with no penalty, self-resettable | Coursera — <https://www.coursera.support/s/article/learner-000001570>; rationale and completion-rate effect <https://blog.coursera.org/coursera-update-striking-a-balance-with-start/> and <https://blog.coursera.org/life-gets-way-coursera-solving-biggest-challenge-online-learning> | Deadlines are relative to start, carry no grade penalty in most courses, and learners can self-reset to get an extension; Coursera reports this raised completion vs. permanently open self-paced courses | Pacing beats both "no dates" (drift) and "hard dates" (guilt and abandonment). A one-click "shift my schedule by 2 weeks" is the single most important escape hatch | S |
| A14 | **Commitment framing with an akrasia horizon** — changes to the plan only take effect ≥1 week out | Beeminder — <https://blog.beeminder.com/dial/> (akrasia horizon ≈ one week, from grocery-habit research) and <https://blog.beeminder.com/akrasia/> | Long-term goal is auto-broken into daily guidance; you may re-dial the road, but changes start a week in the future | Borrow the *delay*, not the money. "You can cut module 14, effective next Monday" prevents mid-session bargaining while keeping the plan editable | S |
| A15 | **Per-hunk accept/reject of a proposed edit, inline, red/green** | Cursor / Windsurf inline diff — <https://forum.cursor.com/t/bring-back-per-change-apply-inline-diff-review-you-re-throwing-away-your-best-ux-advantage/160856>; pattern definition <https://aiuxplayground.com/glossary/diff-patch-review/>; demand evidence <https://github.com/anthropics/claude-code/issues/31395> and <https://github.com/kirodotdev/Kiro/issues/8968> | Agent edits appear as inline hunks; user accepts some, rejects others; only approved hunks land | This is the correct shape for "AI beautify my notes" (see E) | M |
| A16 | **Authorship shading: AI-written text rendered in grey, the learner's in black** | iA Writer 7 Authorship — <https://ia.net/topics/ia-writer-7> and <https://ia.net/writer/support/editor/authorship> | Pasted/AI text is greyed; "Paste Edits From AI" diffs your draft against the AI version so you can see what was retained vs. changed | The strongest anti-"loss of voice" affordance found. In a study log, knowing which sentences *you* actually understood well enough to write is load-bearing | M |
| A17 | **Local LLM path with the vault as grounding** | Obsidian Copilot + Ollama — <https://github.com/logancyang/obsidian-copilot>; 2026 survey <https://localaimaster.com/blog/local-ai-obsidian-integration> and <https://anthemcreation.com/en/artificial-intelligence/ai-plugins-obsidian-2026-comparison/> | Chat + RAG grounded in the vault, runnable entirely against a local model | "Must run locally" is a hard requirement. Design the AI call behind an interface with an Ollama-compatible adapter so the beautify button works offline | M |
| A18 | **AI generates candidate Q/A pairs, a separate reviewed system schedules them** | Obsidian Copilot → Spaced Repetition plugin handoff — <https://anthemcreation.com/en/artificial-intelligence/ai-plugins-obsidian-2026-comparison/>; plugin <https://github.com/st3v3nmw/obsidian-spaced-repetition> | LLM drafts Anki-style pairs from notes; the SR plugin owns scheduling | Cheap way to populate the review queue from dense notes, with a human gate before anything enters the schedule | S |
| A19 | **Heatmap as a low-salience texture, never a score** | GitHub contribution graph (borrow the shape only) — critique <https://dev.to/sylwia-lask/your-github-contribution-graph-means-absolutely-nothing-and-heres-why-2kjc> and <https://mandar.dev/2026/03/07/the-productivity-paradox/> | Calendar grid of daily activity intensity | A 40-week calendar showing hours/day is genuinely useful for spotting a three-week stall. Show intensity, and never show a streak counter (B1) | S |
| A20 | **Git as the history layer** | Obsidian-style plain-file vaults are git-friendly by construction — <https://glyphformac.com/blog/local-first-markdown-notes-mac>; Obsidian file model <https://obsidian.md/help/bases> | Files on disk → `git log`, `git diff`, restore any note to any prior day | Free undo for the AI-beautify feature and a real record of how understanding changed. Auto-commit on save; never build a bespoke version store | S |

---

## B. Patterns to avoid

| # | Anti-pattern | Where it comes from | Why to avoid here |
|---|---|---|---|
| B1 | **Streak counters and streak-loss punishment** | Duolingo. Streaks were internally contentious for creating unhealthy anxiety, and users come to value extending the streak over the underlying activity (Journal of Consumer Research finding summarised at <https://thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification>); qualitative case study of gamification misuse in a language app: <https://arxiv.org/pdf/2203.16175> | A 40-week technical curriculum has legitimate zero days (conference, illness, a hard debugging week). A broken streak triggers the abstinence-violation effect and quitting — catastrophic when the asset is a 40-week plan. Replace with A19 (texture) + A12 (budget) + A13 (resettable pacing) |
| B2 | **Metric that rewards touching the app rather than learning** | GitHub green squares: "a green square doesn't tell you what was done, why, or whether it mattered"; a textbook Goodhart's Law case — <https://dev.to/sylwia-lask/your-github-contribution-graph-means-absolutely-nothing-and-heres-why-2kjc>, <https://dev.to/devnenyasha/the-github-chronicles-your-contribution-graph-tells-a-story-but-not-the-one-you-think-1cio> | The learner would start opening notes to keep a number alive. Only ever count things with an artefact attached: a completed self-check, a committed capstone item, a logged hour |
| B3 | **Leaderboards, XP, gems, levels, badges** | Duolingo-style gamification critiqued as engagement-not-fluency — <https://spellings.app/blog/duolingo-effect>; <https://medium.com/@sohail_saifii/how-duolingo-s-gamification-actually-manipulates-dopamine-receptors-d36ece32d79c> | Single-user app: there is nobody to compete with, and extrinsic rewards crowd out the intrinsic motive that made a professional start this curriculum. Also pure build cost for zero function |
| B4 | **Hard deadlines with penalties or red "overdue" badges on every stale item** | The *absence* of penalties is exactly what Coursera found worked — <https://blog.coursera.org/coursera-update-striking-a-balance-with-start/> | A wall of red at week 6 makes the app aversive and it gets abandoned. Use soft dates (A13) and SuperMemo-style postpone-by-priority (A10) |
| B5 | **A canonical database that the Markdown files merely export to** | Logseq 2.0 DB beta (public beta 2026-07-13) makes SQLite canonical and splits the product, with the file-based app becoming "Logseq OG" on maintenance-only — <https://github.com/logseq/docs/blob/master/db-version.md>, <https://kompozy.io/news/logseq-2-0-db-version-beta>, <https://discuss.logseq.com/t/logseq-og-markdown-vs-logseq-db-sqlite/34608> | This is the most instructive negative case in the survey: a beloved local-first tool inverted its source of truth and fractured its user base and its file guarantees. For a one-person 40-week tracker, an export-only guarantee is not a portability guarantee |
| B6 | **Two writers to the same data with no designated loser** | Offline-first analyses note there is no single source of truth once multiple writers exist — <https://rxdb.info/downsides-of-offline-first.html>; and "if you edit the same file in two apps at once, expect normal file conflict risks" — <https://glyphformac.com/blog/local-first-markdown-notes-mac> | The learner will edit notes in Neovim/VS Code while the app is open. Make the file always win, and make the SQLite layer a disposable, rebuildable cache keyed on path + mtime + content hash (see C/D) |
| B7 | **Writing your own spaced-repetition algorithm** | FSRS is a maintained, empirically tuned scheduler (v6.6.2 shipped in Anki 26.09) — <https://github.com/ankitects/anki/releases>, <https://github.com/open-spaced-repetition/fsrs4anki> | Scheduler quality is the whole product in SRS. Use an FSRS port (`ts-fsrs` / `py-fsrs` from the open-spaced-repetition org) or defer to Anki via export |
| B8 | **Whole-document "Improve writing" that silently replaces the text** | Notion AI: rewrites whole sentences into generic corporate-speak and "erases personal voice", over-corrects non-native writing — <https://www.eesel.ai/blog/notion-ai-improve-or-rewrite-content>, <https://www.saner.ai/blogs/notion-ai-review> | Fatal for a code-and-math study log: an LLM smoothing a wrong-but-mine explanation of RoPE into fluent prose destroys the diagnostic value of the note. See E |
| B9 | **Aggressive, repeating, always-on inline suggestions** | Grammarly: suggestions are "aggressive", repeat after dismissal, and push toward short flat prose with "as little voice and style as possible" — <https://concurate.com/grammarly-review/>, <https://translatorstudio.co.uk/grammarly-pros-cons-limitations/> | Beautify must be an explicit, invoked, scoped action — never an ambient underline while the learner is mid-derivation |
| B10 | **Letting an AI feature borrow authority it hasn't earned** | Grammarly killed its "Expert review" feature in March 2026 after putting AI suggestions into named real writers' voices; the CEO conceded it "didn't work very well" — <https://www.niemanlab.org/2026/03/grammarlys-ceo-defends-putting-ai-editorial-suggestions-into-the-voices-of-real-writers-while-noting-it-didnt-work-very-well/> | Don't label AI output as the learner's own understanding. Concretely: never let beautify mark a "done when you can…" check as satisfied, and shade its text (A16) |
| B11 | **A query language as the price of admission to your own data** | Bases was explicitly positioned as no-code views over properties, replacing Dataview-style querying — <https://www.obsibrain.com/blog/obsidian-bases-guide>, <https://obsidian.md/help/bases> | Single user, fixed schema (module/topic/resource/session). Ship 4–5 hard-coded views, not a DSL |
| B12 | **Monaco / full-IDE editor for note-taking** | Monaco is a 2–5 MB bundle and needs web workers; CodeMirror 6 is tree-shakeable from ~50 kB and "works without workers" — <https://www.pistack.xyz/posts/2026-08-22-browser-code-editors-monaco-codemirror-ace-comparison/>, <https://www.pkgpulse.com/guides/monaco-editor-vs-codemirror-6-vs-sandpack-in-browser-2026> | You'd inherit IntelliSense machinery you'll never wire up, and pay for it on every note open |
| B13 | **highlight.js's default "all languages" build, or client-side Shiki** | highlight.js default distribution ≈ 1.6 MB with all languages; Shiki is ~0.25 MB **plus a WASM dependency** and is "not ideal for client-side rendering" — <https://www.pkgpulse.com/guides/shiki-vs-prismjs-vs-highlightjs-syntax-highlighting-2026>, <https://chsm.dev/blog/2025/01/08/comparing-web-code-highlighters> | Local app, but still a cold-start cost per note. See D |
| B14 | **Depending on a vendor cloud for editor features in a local app** | Tiptap's core is MIT but collaboration, comments, document history and the AI Toolkit require the paid Cloud Platform from $49/mo; the free cloud tier was removed in June 2025 — <https://eddyter.com/blogs/tiptap-pricing-explained-2026>, <https://tiptap.dev/product/editor> | Tiptap-the-library is fine; Tiptap-the-platform is a non-starter for an offline single-user tool. Know which side of the line each feature sits on before you build against it |
| B15 | **Mixing capstone/portfolio state into study progress** | Khan Academy keeps mastery % restricted to Proficient+Mastered — <https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work> | The capstone checklist is a deliverable tracker, not a learning tracker. One conflated "% complete" hides that you have read everything and shipped nothing |

---

## C. Recommended information architecture

### C.0 Object model (four nouns, one file each where it makes sense)

```
vault/
  plan.md                # the 40-week plan; the upfront coverage checklist lives here
  concepts.yaml          # the concept DAG: id, title, prereqs[], module
  modules/
    07-llm-as-judge/
      index.md           # front-matter: week, status, hours_budget, concepts[], checks[]
      notes.md           # the code+math note (the big one)
      resources.md       # front-matter list: url, kind, location, position
      capstone.md        # artefact checklist for this module
  sessions/2026-09-19.md # one file per study session (daily-note pattern)
  .cache/index.sqlite    # DERIVED. Deletable. Rebuilt from files.
```
Justified by A1 + A20 (files are the asset, git is the history) and B5/B6 (never invert the source of truth).

### C.1 Navigation

A left rail with exactly five destinations. No nested menus — Things 3's argument is that clarity beats feature count (<https://culturedcode.com/things/features/>).

1. **Today** (default route)
2. **Plan** — the 40-week map + coverage checklist
3. **Modules** — the Bases-style view (A2)
4. **Review** — the retrieval queue (A8)
5. **Capstone** — artefact checklist across all modules (B15: kept separate)

### C.2 Home = **Today** (A11)

Five blocks, top to bottom, nothing else:

- **Next action**, one line, one button: *"Module 07 · finish the LLM-as-judge rubric section · 90 min budgeted"*. Derived from: the earliest soft-dated incomplete item (A13).
- **Due for review: N items** → one button into the Review queue (A8). Shown as a count only; if 0, the block disappears.
- **This week**: soft-dated items for the current week with a `Shift my schedule →` control that pushes everything out a week (A13), effective next Monday (A14).
- **Budget strip**: hours logged this week vs. budgeted, and cumulative vs. plan. Turns amber, not red, on overrun (A12, softened per B4).
- **40-week heatmap**, one row of ~280 cells, hours-per-day intensity, no number attached (A19, guarded by B1/B2).

Explicitly *not* on the home screen: streak, XP, level, badges, an overall "% complete" hero number (B1–B3).

### C.3 **Plan** screen — the upfront coverage checklist

- Rendered as the **concept DAG** (A6), not a flat list: nodes are concepts, edges are prerequisites, colour = mastery level.
- Each node shows the Khan-style ladder (A3): Not started / Attempted / Familiar / Proficient / Mastered.
- One headline figure: **coverage = % of concepts at Proficient or above** (A4). Two sub-figures below it: "seen" (Attempted+) and "built with" (A7).
- Filters: `not started`, `at risk` (Proficient but overdue for review), `blocked` (prereq below Familiar).
- Editing the plan (drop a module, re-order weeks) is allowed but takes effect at the next week boundary (A14).

### C.4 **Modules** list

The Bases pattern (A2): one saved table view plus one kanban view over the same `modules/*/index.md` front-matter. Columns: week, title, status, hours budget vs. actual, concepts at Proficient, checks passed, capstone items done. Kanban grouped by `status`. No query language exposed (B11).

### C.5 **Module page** — five tabs on one route

1. **Overview** — topic list; the concept sub-DAG for this module; hours budget vs. actual with the Toggl-style overrun colour (A12); soft date and a per-module "shift" control (A13).
2. **Resources** — the Readwise triage ladder (A5). Each row: title, kind (paper / video / course / repo), location (`inbox` / `shortlist` / `later` / `archive`), reading position %, and a note link. Default view is Shortlist = this week's reading. Drag between locations.
3. **Notes** — the main editor (section D). Source-mode Markdown with live math and code rendering. Persists to `notes.md` on a debounce; the `AI beautify` button lives here (section E).
4. **Checks** — the "done when you can…" list, rendered as retrieval prompts, not checkboxes. Each check has: the prompt, a mastery level (A3), a free-text answer field, and a "schedule for review" toggle (A8/A9). Marking a check Proficient requires typing an answer — this enforces the testing effect rather than the feeling of fluency, which is the documented failure mode ("because retrieval practice feels difficult, students may mistakenly perceive other more fluent methods as being more effective" — <https://journals.physiology.org/doi/full/10.1152/advan.00173.2025>).
5. **Capstone** — the artefact checklist for this module, with a link to the repo path/commit that satisfies it. Nothing here counts toward coverage (B15).

### C.6 What a **session** looks like

The daily-note pattern, one file in `sessions/`, opened by a single button on Today.

1. Press **Start session** → picks up the Next Action, starts a timer, creates/open `sessions/YYYY-MM-DD.md` with front-matter `module`, `planned_minutes`, `concepts[]`.
2. **Review first** (≤10 min): if the queue is non-empty, the due checks are shown before new material. This is the distributed-practice half of the pair (<https://journals.physiology.org/doi/full/10.1152/advan.00173.2025>).
3. **Work**: split view — resource on the left (or a link out), notes editor on the right. Highlights/extracts made while reading append to `notes.md` as `> quote` blocks with the source URL — the extract step of incremental reading (A10, <https://www.super-memory.com/help/read.htm>).
4. **Close-out prompt** (mandatory, 2 minutes, this is the design's keystone):
   - "Which checks can you now pass?" → set mastery levels (A3), typing an answer for anything above Familiar.
   - "One thing you still can't explain" → appended to the note and pushed into the review queue at high priority (A10 priority queue).
   - Optional: turn 1–3 extracts into cards (A9/A18 — AI may *draft* them, the learner confirms).
5. Timer stops, minutes append to the module actual (A12), session file is git-committed (A20).

A session is never scored, never awards points, and skipping the close-out costs nothing except that the checks stay where they were.

---

## D. Editor and rendering stack

Target: local React app (Vite + Electron/Tauri shell, or a localhost server). All licences below are permissive and compatible with a personal local app.

| Layer | Recommendation | Version (as of 2026-09-19) | Licence | Why |
|---|---|---|---|---|
| Editor core | **CodeMirror 6** | current 6.x line | MIT — <https://codemirror.net/> | Tree-shakeable from ~50 kB for a basic editor, no web workers required, integrates with React through a thin wrapper without bloating the bundle — <https://www.pistack.xyz/posts/2026-08-22-browser-code-editors-monaco-codemirror-ace-comparison/>, <https://www.pkgpulse.com/guides/monaco-editor-vs-codemirror-6-vs-sandpack-in-browser-2026> |
| Editing mode | **Source mode with live decorations** (math/code/mermaid rendered in place, syntax visible) — *not* full WYSIWYG | — | — | A technical learner writes `\mathbb{E}` and fenced Python directly; WYSIWYG fights them. This is the Obsidian live-preview shape, and it keeps the file byte-for-byte what's on disk (A1). CodeMirror 6 decorations/widgets are the right primitive |
| Math | **KaTeX** | v0.18.7 (2026-09-06) — <https://github.com/KaTeX/KaTeX/releases> | MIT — <https://github.com/KaTeX/KaTeX> | Renders synchronously without reflowing the page, no dependencies, deterministic across environments — <https://github.com/KaTeX/KaTeX>. In a live-typing editor, synchronous render is the deciding property |
| Math fallback | MathJax 3 **only if** an unsupported macro appears | — | Apache-2.0 | MathJax 3 closed much of the speed gap and has broader LaTeX + MathML/accessibility coverage — <https://biggo.com/news/202511040733_KaTeX_MathJax_Web_Rendering_Comparison>, <https://mathstohtml.com/katex-vs-mathjax.html>. The documented practical strategy is KaTeX everywhere, MathJax where needed |
| Code highlighting (editor) | **CodeMirror's own Lezer grammars** for the languages in use (Python, TS, Rust, bash, JSON/YAML) | bundled with CM6 | MIT | Already paid for; no second highlighter in the editing path |
| Code highlighting (read-only render) | **Shiki, at build/save time only** — write highlighted HTML into the cache, never highlight on the client | 3.x | MIT — <https://www.pkgpulse.com/guides/shiki-vs-prismjs-vs-highlightjs-syntax-highlighting-2026> | Best fidelity (real TextMate grammars) but ships ~0.25 MB **plus WASM** and is explicitly "not ideal for client-side rendering" (same URL). Local app = you own the build step, so take the quality for free. If you refuse a build step, use **Prism** with only the needed language components (~11 kB gzip core) and avoid highlight.js's ~1.6 MB default bundle (B13) |
| Diagrams | **Mermaid** | 12.0.0 (published ~2026-09-11) | MIT — <https://www.npmjs.com/package/mermaid>, <https://github.com/mermaid-js/mermaid/releases> | Note the change: **ELK is now bundled and is the default layout** for flowchart/state/class/ER/requirement/use-case diagrams, replacing dagre. Lay out matters — pin the major version and re-check diagrams after upgrading. Lazy-load Mermaid only when a ```mermaid fence is present |
| Markdown pipeline | **unified / remark + rehype** (remark-parse → remark-math → remark-gfm → rehype-katex → rehype-stringify) | current | MIT | Same AST for rendering, for the SQLite indexer, and for the AI diff (E). One parser, three consumers |
| Rejected | **Monaco** | — | MIT | 2–5 MB, worker-based, VS Code feature surface you won't use — B12 |
| Rejected | **Tiptap / Milkdown / ProseMirror** as the primary editor | Milkdown ~261k weekly downloads for `@milkdown/core` (week of 2026-09-05..11) — <https://www.pkgpulse.com/guides/monaco-editor-vs-codemirror-6-vs-sandpack-in-browser-2026> | Tiptap core MIT, platform paid | WYSIWYG-over-ProseMirror is excellent for prose, but it holds a rich document model and *serialises* to Markdown — a round-trip risk for hand-tuned LaTeX and fenced code, and it pulls toward Tiptap's paid cloud for history/AI (B14, <https://eddyter.com/blogs/tiptap-pricing-explained-2026>). ProseMirror itself is fully MIT with no paid tier if you ever do need this — <https://eddyter.com/blogs/prosemirror-vs-tiptap-2026-whats-the-difference> |
| Persistence | **Markdown + YAML front-matter on disk = canonical. SQLite = derived, deletable index** (better-sqlite3 or sql.js) | — | MIT / public domain (SQLite) | A2/A1. Index schema: `file(path, mtime, hash)`, `concept`, `check`, `resource`, `session`, `review_state`. On startup, walk the tree, compare mtime+hash, reindex what changed. **If file and DB disagree, the file wins and the row is rebuilt** (B6, <https://rxdb.info/downsides-of-offline-first.html>) |
| History | **git**, auto-commit on session close and before every AI apply | — | GPL-2.0 (the binary; you shell out) | Free undo and free provenance (A20). Do not build a bespoke revision store |
| Spaced repetition | **FSRS via `ts-fsrs`** (open-spaced-repetition) | FSRS 6.6.2 is what Anki 26.09 ships — <https://github.com/ankitects/anki/releases> | MIT | B7 |
| LLM | Provider-agnostic adapter; **Ollama** as the default local backend | — | MIT (Ollama) | "Must run locally" — the Obsidian ecosystem demonstrates the full local RAG path (A17, <https://localaimaster.com/blog/local-ai-obsidian-integration>) |

---

## E. AI-rewrite ("beautify my notes") UX recommendation

The known failure modes are specific and documented: whole-sentence rewrites into generic corporate-speak that erase personal voice and over-correct non-native phrasing (Notion AI — <https://www.eesel.ai/blog/notion-ai-improve-or-rewrite-content>, <https://www.saner.ai/blogs/notion-ai-review>); aggressive, repeating suggestions that flatten style (Grammarly — <https://concurate.com/grammarly-review/>, <https://translatorstudio.co.uk/grammarly-pros-cons-limitations/>); and AI edits wearing a human's authority (Grammarly's killed Expert review — <https://www.niemanlab.org/2026/03/grammarlys-ceo-defends-putting-ai-editorial-suggestions-into-the-voices-of-real-writers-while-noting-it-didnt-work-very-well/>). The design below is built to make each of those structurally impossible.

**1. Invoked, never ambient.** One button, and it only acts on the current selection or the current section (heading-delimited). No underlines, no ghost text while typing. Directly contra B9.

**2. Named, narrow operations — no "Improve writing".** A small menu, each mapping to one prompt with an explicit contract:
- *Tidy formatting* — headings, lists, code-fence languages, LaTeX delimiters, table alignment. **Prose tokens must not change.** This is the default and covers most of what "beautify" actually means for a study log.
- *Fix math typesetting* — `E[x]` → `$\mathbb{E}[x]$`, consistent notation. Symbols only.
- *Add structure* — insert headings/TOC into a wall of text. Moves text, does not rewrite it.
- *Summarise to a "done when you can…" draft* — writes into the Checks tab as a **draft**, never into the note.
- *Draft review cards* — A18; drafts only, learner confirms.

**3. Hard invariants, enforced in code, not in the prompt.** Before showing anything, run the proposed output through the shared remark AST (D) and **reject the whole suggestion** if any of these changed: fenced code block contents; inline code spans; math node contents (for anything but *Fix math typesetting*); any number, URL, or citation; any line inside a blockquote (extracts from sources, A10). A tidy-formatting op that touched a code block is a bug, not a suggestion. This is the direct answer to "silent fact changes" — the class of change that can silently alter a hyperparameter or a loss formula in a note about training.

**4. Per-hunk accept/reject, inline, red/green** (A15, <https://aiuxplayground.com/glossary/diff-patch-review/>, <https://forum.cursor.com/t/bring-back-per-change-apply-inline-diff-review-you-re-throwing-away-your-best-ux-advantage/160856>). Never a modal "here's your new note". Per hunk: `Accept` / `Reject` / `Accept and shorten`. Global: `Accept all`, `Reject all`, `Keep original` — and the last one must be reachable by Escape. The demand for exactly this granularity is visible as feature requests across AI editors (<https://github.com/anthropics/claude-code/issues/31395>, <https://github.com/kirodotdev/Kiro/issues/8968>).

**5. Side-by-side only for the *Add structure* op.** Inline hunks are better for small edits; a two-pane view is only worth the screen when blocks move.

**6. Authorship shading after apply** (A16, <https://ia.net/writer/support/editor/authorship>). Accepted AI spans render in grey; the learner's own text stays full-contrast. Store this as a sidecar `notes.authorship.json` keyed by content hash — never as inline markup, so the `.md` file stays clean (A1). A per-note toggle turns shading off for reading. This gives the learner the single most important signal in a study log: *which sentences did I actually produce myself*. Corollary rule: **AI-shaded text can never satisfy a "done when you can…" check** — that would be exactly the borrowed-authority failure of B10.

**7. Undo is git, not a buffer.** Auto-commit immediately before applying any AI edit, with a message like `pre-ai: modules/07 notes tidy-formatting`. "Revert beautify" = `git checkout` of that path (A20). Survives app crashes, which an in-memory undo stack does not.

**8. Voice preservation, made concrete.** Ship a short style contract in the system prompt derived from the learner's own notes ("keep first-person; keep hedges like 'I think'; keep informal asides; never expand contractions; never replace my terminology with synonyms") — and back it with a mechanical check: if the *Tidy formatting* op changed more than ~10% of prose tokens, refuse the suggestion and say so. Prompts are advisory; the token check is the actual guarantee.

**9. Local by default.** The beautify call goes to the local Ollama adapter (A17). If no local model is reachable, the button is disabled with an explanatory tooltip rather than silently falling back to a network call — this is a local-first app, and a silent egress would violate its premise.

---

## Sources

- Obsidian Bases (official help) — https://obsidian.md/help/bases
- Obsidian Bases guide (2026) — https://www.obsibrain.com/blog/obsidian-bases-guide
- What is an Obsidian vault — https://floatboat.ai/blog/what-is-obsidian-vault
- Local-first markdown notes / file conflicts — https://glyphformac.com/blog/local-first-markdown-notes-mac
- Downsides of offline-first (no single source of truth) — https://rxdb.info/downsides-of-offline-first.html
- Logseq DB version docs — https://github.com/logseq/docs/blob/master/db-version.md
- Logseq 2.0 DB beta (2026-07-13) — https://kompozy.io/news/logseq-2-0-db-version-beta
- Logseq OG vs DB (SQLite canonical) — https://discuss.logseq.com/t/logseq-og-markdown-vs-logseq-db-sqlite/34608
- Anytype / Capacities / Tana local-first comparison (2026) — https://capacities.io/compare/anytype ; https://aiproductivity.ai/blog/tana-vs-anytype/
- Khan Academy mastery levels — https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work
- Readwise Reader filtering / locations — https://docs.readwise.io/reader/guides/filtering/syntax-guide ; https://blog.readwise.io/p/f8c0f71c-fe5f-4025-af57-f9f65c53fed7/
- Exercism syllabus & concept exercises — https://exercism.org/docs/building/tracks/syllabus ; https://exercism.org/docs/building/tracks/concept-exercises ; https://forum.exercism.org/t/learn-vs-practice-mode/38380
- Anki releases (26.09.2, FSRS 6.6.2) — https://github.com/ankitects/anki/releases ; https://github.com/open-spaced-repetition/fsrs4anki
- RemNote flashcard basics / spaced repetition — https://help.remnote.com/en/articles/8663109-flashcard-basics ; https://www.remnote.com/feature/spaced-repetition
- SuperMemo incremental reading & priority queue — https://www.super-memory.com/help/read.htm ; http://super-memory.com/archive/help2008/priority.htm
- Retrieval + distributed practice evidence (2025) — https://journals.physiology.org/doi/full/10.1152/advan.00173.2025 ; https://link.springer.com/article/10.1007/s11251-025-09758-z
- Duolingo streak critique — https://thedecisionlab.com/insights/consumer-insights/streak-creep-the-perils-of-too-much-gamification ; https://arxiv.org/pdf/2203.16175 ; https://spellings.app/blog/duolingo-effect
- GitHub contribution graph critique — https://dev.to/sylwia-lask/your-github-contribution-graph-means-absolutely-nothing-and-heres-why-2kjc ; https://dev.to/devnenyasha/the-github-chronicles-your-contribution-graph-tells-a-story-but-not-the-one-you-think-1cio ; https://mandar.dev/2026/03/07/the-productivity-paradox/
- Things 3 features / task-app comparison (2026) — https://culturedcode.com/things/features/ ; https://guptadeepak.com/tools/top-10-task-management-apps-2026/
- Toggl Track project time estimates — https://support.toggl.com/en-us/article/project-time-estimates-19si700/ ; https://toggl.com/track/time-reporting/
- Coursera deadlines — https://www.coursera.support/s/article/learner-000001570 ; https://blog.coursera.org/coursera-update-striking-a-balance-with-start/ ; https://blog.coursera.org/life-gets-way-coursera-solving-biggest-challenge-online-learning
- Beeminder akrasia horizon / dial — https://blog.beeminder.com/dial/ ; https://blog.beeminder.com/akrasia/
- Cursor inline diff & diff-review pattern — https://forum.cursor.com/t/bring-back-per-change-apply-inline-diff-review-you-re-throwing-away-your-best-ux-advantage/160856 ; https://aiuxplayground.com/glossary/diff-patch-review/ ; https://github.com/anthropics/claude-code/issues/31395 ; https://github.com/kirodotdev/Kiro/issues/8968
- iA Writer Authorship — https://ia.net/topics/ia-writer-7 ; https://ia.net/writer/support/editor/authorship
- Notion AI voice complaints — https://www.eesel.ai/blog/notion-ai-improve-or-rewrite-content ; https://www.saner.ai/blogs/notion-ai-review
- Grammarly critique / Expert review removal (2026-03) — https://concurate.com/grammarly-review/ ; https://translatorstudio.co.uk/grammarly-pros-cons-limitations/ ; https://www.niemanlab.org/2026/03/grammarlys-ceo-defends-putting-ai-editorial-suggestions-into-the-voices-of-real-writers-while-noting-it-didnt-work-very-well/
- Obsidian AI plugins / local LLM (2026) — https://anthemcreation.com/en/artificial-intelligence/ai-plugins-obsidian-2026-comparison/ ; https://localaimaster.com/blog/local-ai-obsidian-integration ; https://github.com/logancyang/obsidian-copilot
- CodeMirror 6 (MIT) — https://codemirror.net/ ; comparisons https://www.pistack.xyz/posts/2026-08-22-browser-code-editors-monaco-codemirror-ace-comparison/ ; https://www.pkgpulse.com/guides/monaco-editor-vs-codemirror-6-vs-sandpack-in-browser-2026
- KaTeX v0.18.7 (2026-09-06), MIT — https://github.com/KaTeX/KaTeX/releases ; https://github.com/KaTeX/KaTeX
- KaTeX vs MathJax — https://biggo.com/news/202511040733_KaTeX_MathJax_Web_Rendering_Comparison ; https://mathstohtml.com/katex-vs-mathjax.html
- Shiki / Prism / highlight.js sizes — https://www.pkgpulse.com/guides/shiki-vs-prismjs-vs-highlightjs-syntax-highlighting-2026 ; https://chsm.dev/blog/2025/01/08/comparing-web-code-highlighters
- Mermaid 12.0.0, ELK default — https://www.npmjs.com/package/mermaid ; https://github.com/mermaid-js/mermaid/releases
- Tiptap licence/pricing, ProseMirror MIT — https://eddyter.com/blogs/tiptap-pricing-explained-2026 ; https://tiptap.dev/product/editor ; https://eddyter.com/blogs/prosemirror-vs-tiptap-2026-whats-the-difference
