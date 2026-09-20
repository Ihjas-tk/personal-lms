# `learn` — UX redesign brief

Prepared 2026-09-19 for a Claude Design pass. Everything in this folder is the package: this brief, `screens/` (every screen and state, light and dark), `inventory.md` (components, tokens, chip vocabulary, every string), `flows.md` (the flows as they exist today), and `tokens.css` (the current design tokens).

## 1. What this is

A local, single-user study app for one learner: a data scientist (MSc 2022, works in oil and gas) following a 40-week self-study track in LLM engineering and AI evaluation, 10–15 hours a week, in the evenings after work. It runs on their laptop. Nothing is shared or social.

The one idea behind it: **the app is an eval harness for the learner.** The track's "done when you can…" lines are typed self-tests ("Checks"), graded against a rubric, spaced over weeks, with confidence tracked the way an AI judge is calibrated. Reading, notes and hours are the inputs; passed checks and shipped capstone artefacts are the only outputs that count.

The learner's verdict on v1: **"the overall experience is not great."** It is functionally complete and correct. It is not pleasant, not guided, and does not feel like a place you would want to spend four evenings a week for nine months.

## 2. Who uses it and when

- One person, at a desk, 2–3 hour sessions, four or five times a week, for 40 weeks.
- Arrives tired. Needs to be told what to do in the first ten seconds, then left alone.
- Comfortable with code and maths; the notes are full of Python and LaTeX.
- Already knows the material's vocabulary (attention, RAG, evals). Does not know the app's vocabulary (durable, must cover, overconfident miss) and should not have to learn it.

## 3. The flows that matter (see `flows.md` for exact steps)

1. **A session.** Open app → see the plan I wrote last time → Start → 5-minute warm-up of due items → work in a module (read, take notes, attempt checks) → close with a short reflection and next time's "IF cue THEN first ten minutes" plan.
2. **A check.** Rate confidence → type the answer with no reference visible → submit → self-grade each rubric line and pick can't / partial / fluent → reference appears → if not fluent, write a one-line diagnosis and pick an error category.
3. **A weekly review.** Cold retrieval sweep → calibration readout → error triage → hours vs budget → capstone board → replan.
4. **Tidy a note.** Explicit AI menu → streamed copy-edit → merge view → accept or reject hunk by hunk.

## 4. Non-negotiables (from the learning-science research; do not design these away)

- **No streaks, points, badges, XP, leaderboards, or a single long progress bar.** Progress is shown as artefacts shipped and checks made durable, per module, never as one hero percentage.
- **No "mark complete."** A check becomes durable only after two fluent passes in separate sessions at least seven days apart.
- **A check is typed, never a checkbox.** Confidence is asked before the answer. The reference answer is invisible until the answer is submitted. For code checks, paste is disabled.
- **AI is never inline or ambient.** No chat box, no autocomplete, no suggestions while typing. Two explicit actions only: Tidy (copy-edit with a reviewable diff) and Explain-back critique (grades, never rewrites). Both unavailable while an answer is being written.
- **Boring while working, informative at the bookends.** No live counters, scores or dashboards mid-session. Calibration, hours and errors belong at session close and in the weekly review.
- **Hours are a budget, not a score.** Overrun is amber, never red.
- **Soft dates.** A one-click "shift my schedule by a week."
- The five things a user can do (see today's plan / start; work a module; attempt checks; review; track the capstone) must all remain reachable. The current five-item rail is not sacred; the capabilities are.

## 5. What is wrong today (the design problems to solve)

Ranked by how much they hurt the nightly experience.

1. **No guided path.** The module Overview tab (`screens/05-*`) is a brief with no call to action. A user lands on it and asks "what am I to do from this page?" The session can only be started from Today, so the module page, where the work happens, has no way to begin working. **The app needs one obvious next step on every screen, and the module page needs to be the place a session runs.**
2. **The session is a separate concept bolted on.** Timer and phase switch live in a bar; warm-up is a screen; close is a dialog; the plan is on Today. To the learner it should be one continuous thing: I sat down, I worked, I stood up.
3. **"Must cover" mixes three kinds of item in one bullet list.** Reading topics, setup chores (create a Databricks account, migrate to uv) and behaviours (start the email course) sit together with no state and no link to the resource or check that satisfies them. Nothing on the list can be acted on.
4. **Chips are the only visual vocabulary.** A check card carries six or seven chips (type, must cover, draft reference, attempt count, last score, due date, flag). Everything important and everything incidental has the same weight. The one thing that matters, "attempt this now" or "re-test due," is not primary.
5. **First contact reads as failure.** "0.0 of 25 h", "0% covered", "not started," an empty activity grid of 280 grey squares. There is no first-run state, no explanation of what durable or coverage mean, no sense of "you are here, week 1 of 40."
6. **Everything is a card in a column.** Five tabs, all the same shape; a rail with five plain links; no hierarchy between primary content and metadata; the 66rem column leaves half the screen empty on a laptop.
7. **The attempt flow is a long, dense page.** Prompt, answer, rubric self-grade, overall score, diagnosis, category, critique panel and the full reference all stack at once after submit. The moment of revelation (comparing your answer to the reference) has no staging.
8. **Resources are a flat list with a state dropdown.** No "this week's reading," no reading position, no distinction between a 4-hour video and a 2-page post, no way to open the resource and take notes side by side.
9. **Weekly review is six stacked blocks and a 40-row table.** It should feel like a calm debrief, not a report.
10. **Notes are an empty editor.** Nothing prompts the generative note-taking the research recommends (mechanism, contrast, open-question blocks; "why does this work and not the alternative?").
11. **Jargon without help.** durable, must cover, draft reference verify, overconfident miss, proficient, reconstructed, taught. Each needs either a plainer name or a first-use explanation.
12. **No character.** System font, 15px, one weight, grey cards, flat dark mode. Nine months is a long time to spend in a place with no identity. The subject (LLM engineering, evals) could inform the visual language: monospace accents, the feel of a good terminal or a lab notebook, warm rather than corporate.

## 6. What we want from the design pass

1. **A revised information architecture** that puts the session at the centre and gives every screen one next step. Feel free to collapse the five destinations or the five tabs.
2. **Key screens, light and dark:** first-run / Today; the module workspace (reading + notes + checks in one working view); the check attempt in its three stages (before, submit, compare); session close; weekly review; the plan with a "you are here."
3. **A component system:** type scale, spacing, a reduced state vocabulary (at most four states shown at once), how metadata recedes and actions lead, empty states, the merge-view diff, error and 409 prompts.
4. **The "must cover" list redesigned** as something actionable: topics link to the check that proves them, chores are tick-able tasks, behaviours become session prompts.
5. **Naming.** Plain-language proposals for the jargon in §5.11.
6. A short rationale per screen tied back to the non-negotiables in §4.

## 7. Constraints for implementability

- React 19 + plain CSS custom properties (see `tokens.css`); no Tailwind, no component library. Whatever is designed should map to tokens and a small set of components.
- The editor is CodeMirror 6 in source mode; the preview renders KaTeX, Shiki code blocks and Mermaid. The diff review is CodeMirror's merge view. These can be restyled, not replaced.
- The API does not change. Every screen's data is in `inventory.md`; the design can regroup it freely but not invent new data.
- Desktop only, 1280–1600 px wide. Light and dark, following the OS.
- Keyboard reachable, visible focus, no colour-only state.

## 8. How to run it

```bash
cd learn && uv run learn      # http://127.0.0.1:8765
```
Files: `web/src/screens/*` (one file per screen), `web/src/components/*`, `web/src/styles/tokens.css` and `app.css`. The spec the app was built to is `../superpowers/specs/2026-09-19-learn-lms-design.md`; the research behind the non-negotiables is `../../research/sources/09-learning-science-features.md` and `10-ux-patterns.md`.
