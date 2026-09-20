# Handoff: `learn` UX redesign

## Overview
`learn` is a local, single-user study app for one learner following a 40-week self-study
track in LLM engineering and AI evaluation, 10–15 h a week, four or five evenings a week,
for nine months. The organising idea is that **the app is an eval harness for the learner**:
the track's "done when you can…" lines are typed self-tests ("checks"), graded against a
rubric, spaced over weeks, with confidence recorded before each answer the way an AI judge
is calibrated. Reading, notes and hours are inputs; passed checks and shipped capstone
artefacts are the only outputs that count.

The learner's verdict on v1 was that it was functionally complete and unpleasant: no guided
path, everything a card in a column, seven chips per row with no hierarchy, jargon they never
learned, and no reason to want to spend four evenings a week there for nine months.

This pass delivers: a revised information architecture with the session at the centre, seven
redesigned screens light and dark, a component system, a plain-language naming scheme, and
the three states the screens do not show (tidy merge review, note conflict, AI unavailable).

## About the design files
The two files in this bundle are **design references written in HTML** — prototypes showing
intended look and behaviour, not production code to lift. The task is to **recreate these
designs in the existing codebase**: React 19 with plain CSS custom properties, no Tailwind,
no component library, CodeMirror 6 for the editor and its merge view, KaTeX / Shiki / Mermaid
in the preview. The API does not change; every screen's data already exists in today's
endpoints.

## Fidelity
**High fidelity.** Colours, type, spacing, radii, shadows and copy are final. Recreate them
faithfully using the codebase's own patterns. Where a value is not stated here, read it off
`Learn Design System.dc.html`, which is the normative source for tokens.

---

## Information architecture

Today: five rail destinations (Today, Plan, Modules, Review, Capstone), a module page with
five tabs, a session bar bolted across the top, warm-up as a full-screen takeover and close
as a dialog.

**Now: four destinations, and the session lives in the rail.**

| Destination | Route | Replaces |
| --- | --- | --- |
| Desk | `/` | Today |
| The track | `/track` | Plan + Modules, merged |
| Review | `/review`, `/review/weekly` | Review + Weekly review |
| Shipped | `/shipped` | Capstone |

- The rail foot holds the session: elapsed time (mono, tabular), the module, the
  new/review/build phase switch and **Wrap up**. `SessionBar` is deleted.
- When no session is open the same slot reads "Not working yet. Week 10 of 40." with a
  **Start a session** button.
- A module page can start a session itself ("Work here now"), so the place the work happens
  is the place the work begins. That was design problem #1 in the brief.
- The five capabilities the brief protects (see today's plan and start; work a module;
  attempt checks; review; track the capstone) all remain reachable.

---

## Screens

### 1. Desk (`/`) — `data-screen-label="Desk"`

**Purpose.** Answer "what do I do" in the first ten seconds, then, for anyone who scrolls,
show what nine months of work has actually bought.

**Layout.** Single column, max-width 1220px, page padding 34px top / 40px sides / 80px bottom,
inside a 244px-rail grid. Reads top to bottom in three acts.

1. **Tonight** — one full-width band. `border-radius:24px; padding:38px 40px;
   background:var(--vio); color:var(--on-vio); box-shadow:var(--shadow-lg)`. Inside, a
   `grid-template-columns:minmax(0,1.35fr) minmax(0,1fr); gap:36px`:
   - Left: eyebrow (11.5px/700/.16em uppercase, opacity .7) reading "The plan you wrote on
     Sunday"; the cue sentence in Playfair Display 31px/1.3, max-width 24ch; then a
     `padding:14px 26px; border-radius:14px; background:var(--on-vio); color:var(--vio);
     font-weight:700` primary button ("Start · about 2 hours") and a 13px hint at .82 opacity.
   - Right: the warm-up on a `var(--surf)` card, radius 16, padding 16/18 — heading "First
     ten minutes", four numbered items (mono index, 12.5px prompt, 11px reason), and a rule
     with "Skippable, and the skip is recorded rather than punished."
2. **Standing** — three headline numbers in a `repeat(3,1fr)` grid between two 1px rules,
   each cell padding 26/28 with a right border on the first two. Value in Playfair 38px/1,
   label 13px `--ink2`, sub-line 11.5px `--ink3`. Content: "2 — checks are yours — of 84
   core checks · proved cold, twice"; "1 — capstone artefacts exist — of 8 · the golden
   dataset is in draft"; "30 — weeks left on the plan — at 12 h a week · 2 skips banked".
3. **The capability ridge** — a card, radius 20, padding 26/28/20. Inside, a
   `grid-template-columns:repeat(6,minmax(0,1fr)); gap:14px`; each column is
   `grid-template-rows:22px 168px 44px 26px; gap:10px; align-content:start` so all six bars
   share a top and a baseline. The bar is `display:flex; flex-direction:column-reverse;
   gap:3px; height:168px` with one segment per state, `flex:<count>`, `min-height:6px`,
   radius 5: lasting `--good`, solid `--vio`, shaky `--amber`, tried `--vio-line`,
   untouched `--surf2` with a `--line` border. Count above in mono 11.5px, name (12.5/600)
   and scope (11px) below, then a fixed 26px slot for the four-week delta chip.
   Legend and the sentence "A bar moves only when a check is passed cold, from memory" sit on
   a rule beneath.
4. **Movement** — `repeat(3,1fr)`, gap 20: *Four weeks of gains* (mono 22px deltas in
   `--vio` beside 13px prose), *Knowing what you know* (Brier by week as bars,
   `height: round(value*140)px`, last bar `--vio`, the rest `--vio-line`), and
   *Newly proved* (a feed with an 8px square marker).
5. **Footer strip** — `--surf2`, radius 20, padding 22/26, flex with 36px gaps: hours this
   week as a stacked new/review/build bar, "Slipping" prose, and the **Sunday debrief** button.
   Deliberately the quietest thing on the page.

**Non-negotiables honoured.** No streak, no points, no badges, no single hero progress bar.
Progress is per-area capability plus artefacts shipped. Hours are a budget: "7.2 h under
budget this week. Under is fine."

**First-run.** Toggle in the prototype's rail foot. The band reads "Your first session" with
"Start with one thing: explain, without notes, the difference between pretraining, SFT, RLHF
and inference-time scaling."; the three headline numbers read 0 / 0 / 40; every ridge column
is fully untouched; gains read "0 — checks proved so far — the first one is about ten minutes
away"; calibration says it needs three graded attempts before it says anything. No empty
280-cell activity grid anywhere — `ActivityStrip` is deleted.

### 2. The track (`/track`) — `data-screen-label="Track"`

**Purpose.** Where am I in 40 weeks, what did I leave behind, what is next.

**Layout.**
- Header: "The track" (Playfair 32) and "40 weeks, nine phases. 2% of core checks are lasting;
  7% have been attempted.", with a "Push everything back a week" secondary button.
- **Week strip**: a card containing 40 flex cells, gap 2, height 30, radius 4 — past weeks
  `--ink3` at opacity .35, the current phase `--vio-line`, the current week `--vio`,
  the rest `--surf2`. Under it, mono labels "week 1 · Jul 2026", "↑ week 10 — you are here",
  "week 40 · Apr 2027", and the sentence that soft dates are soft.
- **Three bands**, each a Playfair 19px heading, a count chip, a one-line blurb, and a list:
  1. *Left unfinished* (amber chip) — modules whose weeks have passed with overdue checks.
  2. *This phase — v0 app + evals foundation* (violet chip, "weeks 9–14") — the six modules in
     the order to do them, stated in the blurb: "error analysis before judges, judges before
     the harness".
  3. *After this* (plain chip, "13 modules · weeks 15–40") — the rest compressed to five muted
     rows on a `--surf2` list, no actions but "Preview".
- **Row anatomy** (this is the `Row` component): a 4px full-height marker bar
  (amber = late, violet = now, `--line` = later); an 86px mono column with week range and
  date; the title (15px/650) with a 12px sub-line of track and hours; a 150px proof column
  holding the squares and "1 of 11 lasting"; a 128px right-aligned amber warning; then the
  action button. Padding 14/18, 1px bottom rule, 16px gaps.

### 3. Module workspace (`/modules/:id`) — `data-screen-label="Module workspace"`

**Purpose.** Make covering and proving one module obvious, in one page. Replaces the five tabs.

**Layout.**
- Back link, title (Playfair 30), mono sub-line "weeks 3–8 · llm · soft date 2026-09-05 ·
  3.0 of 70 h", an amber "2 re-tests overdue" pill and the primary **Work here now**.
- **Step strip** card: "Six things to cover. You are on **2 · Causal self-attention**." with
  "1 proved · 1 in progress · 4 untouched" in mono, then six step buttons (flex:1, radius 11,
  violet when selected, `--good-soft` when proved).
- **Main column**: one card per topic. Collapsed shows a 32px numbered mark, title (15.5/650),
  a one-line summary and the state chip. Expanded shows three regions:
  - **Source** (left half): the reading *for that topic* with a real position — "video · 95 of
    116 min", "book · 3 of 41 pages", "course · not opened" — a 3px left rail coloured by
    progress, a 4px progress track, the ladder chip (rebuilt it / taught it are `--good`),
    and a Resume / Open / Start button.
  - **Your note** (right half): the note for that topic, mono 12px in a `--surf2` box
    capped at 150px, or a dashed empty state reading "Nothing written here yet. A note that
    only restates the source does not count — write the mechanism, the contrast, and the
    question you cannot answer." Buttons: Continue note (opens focus mode), Mechanism prompt,
    AI ▾.
  - **Proof** (full width, `--surf2`): "the check that closes this topic" — one row per
    check with state, warning and Attempt / Re-test.
- **Sidebar** (300px, sticky): *Set-up, once* (tickable chores — this is where "pick one lane",
  "migrate to uv" go, out of the syllabus), the session habit as a sentence, *Time here*
  (3.0 h against a 70 h budget with "already behind, which is information, not a failure" and
  "Push this module back a week"), and *All notes* (the files on disk, mono).

This is the redesign of "must cover" the brief asked for: ideas link to the check that proves
them, chores are tick-able, the behaviour becomes a session habit.

### 4. Focus mode for notes (overlay)

**Purpose.** Jot while watching or reading, without losing your place.

**Layout.** `position:fixed; inset:0; z-index:45`, full-bleed `--bg`, flex column.
- Header bar (`--surf`, 1px bottom rule, padding 14/22): topic name and `a1/attention.md ·
  saved 4s ago`; a source picker of segmented buttons; on the right the session clock, a
  two-button segment **Side by side / Pop-out jotter**, and **Done**.
- **Side by side**: `grid-template-columns:minmax(0,1.05fr) minmax(0,1fr)`.
  - Source pane (`--surf2`): title and "42:10 / 3:56:00" in mono; the player area as a
    repeating 135° stripe placeholder with a 56px violet play button; a 6px scrub track; then
    **Stamp 42:10 into the note**, **−15s**, **Pause while I write**, and "Minutes watched are
    logged against this resource."
  - Note pane (`--surf`): prompt chips (+ Mechanism, + Contrast with…, + Open question,
    + Stamp timestamp) as dashed violet pills, AI ▾ pushed right; the editor in mono 13px /
    1.85 with KaTeX and fenced code as today; then the **Unfiled jots** strip on `--surf2` —
    timestamped lines captured mid-video, "File them at session close" — and an input row with
    a ⌘↵ hint.
- **Pop-out jotter**: the source takes the full width and a 340px window floats bottom-right
  (`position:absolute; right:28px; bottom:28px`, radius 16, `--shadow-lg`): violet title
  bar with the timestamp and a restore glyph, a mono jotting area, and a foot reading "Stays
  on top · ⌘↵ to file a line" with a Stamp button.

**AI rules unchanged**: no inline AI, no autocomplete, two explicit actions only, both blocked
while an answer is open.

### 5. Check attempt (three stages) — `data-screen-label="Check attempt"`

Same three states as today's `AttemptFlow`, but staged as three moments instead of one page
that grows. Max-width 880px, centred. A three-button segment in the header shows progress
(1 · How sure, 2 · Write, 3 · Compare) — in the real app it advances, it is not a control.

- **Prompt card** (always): radius 18, padding 28/32; mono "explain · core" plus one amber
  chip "reference not yet checked by you"; the prompt in Playfair 26px/1.35.
- **Stage 1 — How sure.** "Before you answer — how sure are you?" with "This is the only thing
  that makes the calibration readout mean anything. It cannot be skipped." A 10px track with a
  24px violet-ringed thumb, mono 22px read-out, "no idea" / "certain" ends, and **Lock it in
  and start writing**. Footnote: "The rubric and the reference answer stay hidden until you
  submit." Disabled until the slider is touched (as today).
- **Stage 2 — Write.** A single card: header with "Your answer, from memory" and mono
  "04:12 · sure: 65"; the editor at mono 13px/1.75, min-height 220px; footer on `--surf2`
  with **Submit and freeze** and "Nothing is graded until you freeze it. AI is off while an
  answer is open." For code checks, paste and drop stay cancelled with today's copy.
- **Stage 3 — Compare.** Two panes side by side: "What you wrote" on `--surf` and
  "The reference" on `--vio-soft` with a `--vio-line` border. Below, the self-grade card:
  one row per rubric line with a met / partial / missing segment and, beneath it, the AI
  sub-line in 12px `--ink3` ("AI agrees — …", "AI: partial — …"). Then Overall
  (Couldn't / Partly / Fluent), the required diagnosis box and category pill with "goes to
  the error log", and a `--surf2` footer: **Record and move on** plus "Comes back in 2 days.
  Two clean passes a week apart make it lasting."

The staging is the fix for brief problem #7: the moment of revelation gets its own beat.

### 6. Wrap up (session close, modal)

Scrim `rgba(18,16,32,.55)` with a 3px blur; sheet `min(720px,100%)`, radius 20,
`--shadow-lg`. Violet-soft header: "Stand up well" in Playfair 24 and "2 h 14 m · 1 check
attempted · 1 error logged. Three questions, then it is written to the vault."
Body: the reflection with a live word count that turns `--good` at 40 words ("67 words —
enough."); the IF / THEN plan on a 70px label grid with "This sentence is the first thing you
will see next time."; "Anything you got wrong that is not already logged?" with a category
pill and diagnosis; a 1–5 fatigue segment under "How spent are you?". Footer on `--surf2`:
**Close the session**, **Keep working**, and "Committed to the vault as one markdown file."
Validation is exactly today's: 40 words, both plan fields, a diagnosis per logged error.

### 7. Sunday debrief (`/review/weekly`) — `data-screen-label="Weekly debrief"`

Four blocks instead of six, in a `minmax(0,1fr) 300px` grid with a sticky right column.
1. **Cold sweep** — rows with the prompt, an optional "missed while sure" chip and Attempt.
   Rows wrap their chip and button under the prompt rather than crushing the text.
2. **How well you know what you know** — the Brier score at 24px mono on the right of the
   header, and one bar per confidence bucket: a `--vio-line` "said" bar with a `--vio`
   "actually" bar inset 6px inside it, then a mono read-out "said 88% · was 0%". This replaces
   the five-row reliability table.
3. **Mistakes worth keeping** — one card per unresolved ledger error: category pill, mono
   timestamp, the diagnosis, a "What settled it?" field and Resolve.
4. **Next week** — the scope sentence and the scratch if-then box, still explicitly local.
Sidebar: hours over the last four weeks as bars (the 40-row burn-up table is gone) and a
Things-shipped mini list linking to the board.

### 8. Shipped (`/shipped`) — `data-screen-label="Capstone board"`

"Things that exist. Eight artefacts. Each one either exists or does not — there is no
percentage." A `repeat(auto-fill,minmax(330px,1fr))` grid, gap 16. Each card: title (15.5/700)
and state chip, the description in 12.5px `--ink3`, then the **next action** in a `--surf2`
box (the card leads with it, so the board reads as a queue), then the mono path and an
Open / Start button. The draft artefact takes a `--vio` border.

> **Known defect to fix before this ships**: `GET /api/modules/{id}` builds `capstone`
> straight off the curriculum model, which carries no `state`/`notes`/`path`, so
> `a.state.replace(…)` throws and blanks the whole module page. Merge the stored row over a
> default as `GET /api/capstone` already does.

---

## Interactions & behaviour

- **Nav**: rail buttons switch destination; the active item is `--vio-soft` / `--vio` /
  weight 650. Module and attempt screens keep "The track" lit.
- **Start a session**: from the rail foot, the Desk band, or a module's "Work here now".
  Starting from a module navigates nowhere — it turns the page you are on into the session.
  The rail swaps to the session card; the phase segment patches the session as today.
- **Wrap up** opens the modal; closing clears the session and returns to the Desk.
- **Topic expansion** on the module page: one open at a time, driven by `openTopic`;
  the strip and the card headers are both handles.
- **Focus mode**: opens from any topic's note button; `Done` closes; the segment switches
  between side-by-side and pop-out.
- **Attempt staging**: locking confidence → stage 2, freezing → stage 3, recording → back to
  the module.
- **Theme**: follows the OS (`prefers-color-scheme`) in the real app. The prototype exposes
  a manual toggle at the rail foot for review only — do not ship it.
- **Keyboard and a11y**: keep everything today's build already has — `:focus-visible` at
  2px `--focus`, `aria-pressed` on every segment, `aria-current` on the active rail item,
  `role="alert"` on refusals, `aria-live="polite"` on the save indicator, and text on every
  chip so colour is never the only signal. The ridge needs a text equivalent per column
  (the count line already carries it) and a `title` per segment.
- **Motion**: none beyond default state changes. The learner arrives tired; nothing animates
  while they work.

## State

`screen`, `theme`, `firstRun` (prototype only), `session` (open / closed), `phase`
(new | review | build), `stage` (1–3), `openTopic` (1–6), `noteOpen`, `noteMode`
(split | popout), `closeOpen`. In the real app these map onto the existing zustand store plus
the router; no new server state.

## Design tokens

Normative source: `Learn Design System.dc.html` §1–3. Summary:

**Light** — `--vio #6D3BEE`, `--vio-soft #EFEAFE`, `--vio-line #D8CCFB`,
`--on-vio #FFFFFF`; `--ink #1A1626`, `--ink2 #54506A`, `--ink3 #8A86A0`;
`--bg #F6F5FC`, `--surf #FFFFFF`, `--surf2 #F3F1FB`, `--line #E6E3F1`;
`--amber #9A5A12` / soft `#FCF0E1` / line `#EED9BC`;
`--good #1C7A52` / soft `#E2F4EC` / line `#BFE4D3`.

**Dark** — `--vio #A78BFA`, `--vio-soft #2A2440`, `--vio-line #453B68`,
`--on-vio #16112B`; `--ink #EEEBF8`, `--ink2 #B2ADC8`, `--ink3 #827D9B`;
`--bg #121020`, `--surf #1B1930`, `--surf2 #232038`, `--line #2E2A46`;
`--amber #E0B27A` / `#2F2617` / `#4C3D22`;
`--good #8ED0AC` / `#182C23` / `#2B4A3A`.

**Shadows** — `--shadow: 0 1px 2px rgba(26,22,38,.05), 0 10px 28px -16px rgba(26,22,38,.28)`;
`--shadow-lg: 0 24px 64px -24px rgba(26,22,38,.40)`. Dark: `0 1px 2px rgba(0,0,0,.30),
0 10px 28px -16px rgba(0,0,0,.6)` and `0 24px 64px -24px rgba(0,0,0,.75)`.

**Type** — Playfair Display 500/600 (display and the learner's own sentences);
Plus Jakarta Sans 400/500/600/700 (UI, base 15px/1.55); JetBrains Mono 400/500 (hours, dates,
paths, ids, timestamps, scores). Scale: 38–40 / 31 / 23–26 / 15 / 13.5 / 12.5 / 11.5.

**Space** — 4, 6, 10, 14, 18, 22, 26, 38. Row padding 14/18–22, card padding 20–26, gap
between cards 20, page 34/40/80, band 38/40.

**Radius** — 9 (small controls), 11 (buttons, nav), 14 (inner panels), 16 (cards), 20 (large
cards), 24 (the band). Pills 999.

## Naming

Ship the renames. `Learn Design System.dc.html` §5 has all fourteen with rationale; the
essentials: durable → **lasting**, proficient → **solid**, familiar → **shaky**, attempted →
**tried**, must cover → **core**, coverage N% → **N of 84 checks are yours**, overconfident
miss → **missed while sure**, draft reference verify → **reference not yet checked by you**,
reconstructed/taught → **rebuilt it / taught it**, weekly review → **Sunday debrief**,
close session → **Wrap up**, explain-back critique → **second opinion**, capstone artefacts →
**Things that exist**.

## Brand

**The mark — "the return".** Spaced repetition is a spiral, not a line: you come back to the
same idea and pass it again from further out. Four half-turns whose endpoints all sit on one
horizontal axis, each turn 11 units further out than the last on a 64-unit box, drawn as one
continuous even-weight path.

    <path d="M40 32 A9.5 9.5 0 0 1 21 32 A15 15 0 0 1 51 32 A20.5 20.5 0 0 1 10 32 A26 26 0 0 1 62 32"
          transform="translate(-4,2.75)" stroke="#6D3BEE" stroke-width="4" stroke-linecap="round"/>

| | |
| --- | --- |
| Stroke | Even 4.0 at a 64-unit box, round caps, one path. 4.4 knocked out of a violet fill, 4.2 on dark. |
| Colour | `#6D3BEE` on light · `#A78BFA` on dark · `#FFFFFF` out of `#6D3BEE` or `#1A1626` · `#1A1626` one-colour |
| App icon | Mark at 72%, corner radius 23% of the square |
| Clear space | 10 units on a 64-unit box, every side — nothing sets inside it |
| Min size | 16px. One cut serves every size; there is no simplified small variant to maintain |
| Wordmark | Playfair Display 600, lowercase, tracking +0.005em. Never Jakarta or Mono |
| Lockup | Mark at 1.2× the wordmark's cap height, optical centres aligned, gap = half the mark's width |
| Don't | Taper the stroke, add a dot, close the outer turn into a circle, tilt it, outline it, or put it in any container but the app icon |

The logo does **not** change with progress — the turn count is fixed. The four paths do draw
one at a time cleanly, so the spiral tracing itself out is the intended splash and empty-Desk
animation; it is not built yet.

## Assets
`brand/` holds the mark as SVG: `learn-mark.svg`, `learn-mark-dark.svg`,
`learn-mark-onecolour.svg`, `learn-appicon.svg`, `learn-favicon-16.svg`. Beyond those there
are no images, no icon set and no illustration — the only other graphics are CSS rectangles
and the striped placeholder where the source player mounts. Fonts load from Google Fonts;
self-host them in the app.

## Files
- `Learn Redesign.dc.html` — the interactive prototype. All seven screens, light and dark,
  clickable: rail nav, session start/wrap-up, track → module → topic → attempt, focus mode
  with both layouts. The rail foot carries two review-only toggles (theme, first-run).
- `Learn Design System.dc.html` — the normative component system: tokens, type, spacing,
  state vocabulary with a before/after, the naming table, the three states the prototype does
  not show (tidy merge review and its refusal, note conflict, AI unavailable), and a
  file-by-file keep / re-cut / delete verdict with a six-step order of work.
- `Learn Logo.dc.html` — the identity exploration. Turn 3 at the top is the chosen mark, built
  out: app icon, dark, one-colour, size samples, both lockups, construction and clear space,
  and the spec table. Turns 2 and 1 below are the rejected routes, kept for the record.
- `brand/` — the mark as production SVG, five files.
- `source-package/` — the original brief, flows, inventory and `tokens.css` this pass was
  designed against, plus every screenshot of the old build.

## Order of work
1. Swap `tokens.css` and add the fonts. Nothing else changes; the old screens turn violet.
2. Build `Row`, `Chip`, `Band`, `Stat`, `Ridge`; re-cut Today into the Desk.
3. Collapse the rail to four, move session state into it, delete `SessionBar`.
4. Re-cut the module page as the syllabus; the five tabs go.
5. Stage the attempt flow; then focus mode for notes.
6. Fix the module-capstone payload defect before the board ships.
