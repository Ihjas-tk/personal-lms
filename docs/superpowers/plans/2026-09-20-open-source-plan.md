# Open-sourcing `learn`: reusable for any subject, discoverable on GitHub

Plan · 2026-09-20 · Fable plans, Opus executes. Three packages; A and B run in parallel, C after both.

## Goal

The repo `Ihjas-tk/study-harness` becomes public. Anyone can clone it, write (or pick) a
curriculum for *their* subject, and run the app. The LLM + evals track stays as the flagship
example, not the product. The README, metadata and repo layout are tuned so the people who
would want this can find it.

## Target layout

```
/                          product root
  README.md                product README (rewritten in C)
  LICENSE                  MIT
  CONTRIBUTING.md  CHANGELOG.md  .github/ (CI, issue + PR templates)
  docs/
    assets/                README screenshots (from learn/docs/ux/screens-v2), social preview
    curriculum-schema.md   "write your own track" — every field, with a worked example
    growth/                discovery research (B) and launch checklist
    superpowers/           design spec + plans (history; unchanged)
  learn/                   the app — location unchanged (src/, web/, tests/, tools/, docs/)
    curriculum/
      schema.json          JSON Schema exported from the pydantic models (kept in sync by a test)
  tracks/                  curricula that ship with the repo
    starter/track.yaml     minimal, heavily commented template (2 areas, 1 phase, 2 modules)
    llm-engineering-and-evals/
      track.yaml           moved from learn/curriculum/track.yaml
      README.md            the syllabus prose, moved from /llm-evals-track.md (+ .html)
      skills-map.md        the 2026–2030 skills map, moved from the old root README (+ skills-map.html)
      research/            moved from /research/sources
    linear-algebra/track.yaml   a second, obviously-different example (videos + book + checks)
```

## Package A — make the app curriculum-agnostic (engineering)

1. **Curriculum resolution.** Order: `--curriculum` flag → `LEARN_CURRICULUM` → `<vault>/track.yaml`
   → legacy `learn/curriculum/track.yaml` if it exists → a clear error naming `learn init`.
   The vault owns its curriculum: `learn init --track <path> [--vault <path>]` copies the track
   into the vault as `track.yaml` and creates the folders. Same flags on `learn`: `--vault`,
   `--port` (`LEARN_PORT`), `--no-browser` (keep `BROWSER=none`). `learn check <track.yaml>`
   validates a curriculum and prints friendly errors (path to the failing field, not a traceback).
2. **Schema generalisation.** `track` becomes a free string (any label the author likes); TS type
   follows. Anything in UI or backend copy that assumes the flagship track — "forty weeks",
   "nine months", "eight artefacts", "Sunday" — is derived from the curriculum (`total weeks` from
   phases; a new optional `debrief_day: Sunday` field drives the "Sunday debrief" label and the
   Desk eyebrow). Grep for the words; do not trust this list to be complete.
3. **Move the flagship track** to `tracks/llm-engineering-and-evals/track.yaml`; update tests,
   e2e configs (`LEARN_CURRICULUM` in `playwright*.config.ts`), `.claude/launch.json`,
   `tools/make_mac_app.py` (nothing to change if resolution falls through the vault), READMEs.
   Then copy it into the learner's real vault as `learn/vault/track.yaml` so their install keeps
   working through the new resolution order (do not commit inside `learn/vault/`, it is their repo).
4. **Starter + second example** under `tracks/`, both passing `learn check`; the linear-algebra
   one should have ≥3 modules, video and book resources, checks of ≥3 types, one capstone artefact.
5. **`learn/curriculum/schema.json`** exported from the pydantic models, with a test that fails
   when it drifts; `docs/curriculum-schema.md` written from the models (every field, defaults,
   which are optional, v1 compatibility note).
6. Tests: pytest + ruff + vitest + tsc green; `npm run build` refreshed into `src/learn/static`.

## Package B — discovery research (no code)

Written to `docs/growth/discovery-research.md`, with sources. Answer, with evidence from real
repos that got traction in 2025–2026: positioning and one-line description (≤ 350 chars) and
tagline; 15–20 GitHub topics ranked; the search phrases people actually use (local-first,
self-hosted, spaced repetition, active recall, study tracker, PKM, markdown, Obsidian…) and where
each goes (description, topics, README H1/intro, `About`); README section order and length that
top self-hosted/learning repos use; trust signals (license, CI badge, screenshots vs GIF, demo,
roadmap, release tags); social-preview image spec; an honest name assessment for `study-harness`
with 5 alternatives; a launch checklist (Show HN wording, r/selfhosted, awesome-selfhosted and
awesome-* PR criteria, Product Hunt, timing) with the rules each venue enforces.

## Package C — README, docs, repo hygiene (after A and B)

README rewrite to B's recommended structure, screenshots in `docs/assets/`, LICENSE (MIT),
CONTRIBUTING, CHANGELOG, `.github/` CI (pytest + vitest + build) and templates, `learn/README.md`
turned into the developer/operator manual, `pyproject` description, GitHub description + topics
applied with `gh`, social preview rendered. Then commit, push, and flip the repo to public.

## Non-negotiables that survive open-sourcing

Files are the truth; typed-answer checks with the reference hidden until frozen; confidence before
answer; the re-test ladder; no streaks/points/badges/single progress bar/"mark complete"; AI never
generates content. The vault (`learn/vault/`) stays git-ignored forever.
