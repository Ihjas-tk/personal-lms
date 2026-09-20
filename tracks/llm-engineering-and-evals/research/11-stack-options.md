# Implementation Stack Evaluation — Local Learning Tracker

**Date of research:** 2026-09-19. Every version and API claim below carries a source URL and the date the fact was confirmed. Versions were read from the authoritative package registries (`registry.npmjs.org`, `pypi.org/pypi/<pkg>/json`, GitHub Releases API) on 2026-09-19 unless noted otherwise.

**Target environment (given):** macOS, `uv` 0.12, Node 24, no Docker, single user, offline-capable except for the Claude API call, data must be git-friendly and human-readable.

---

## 0. Environment sanity check

| Fact | Value | Source (confirmed 2026-09-19) |
|---|---|---|
| `uv` latest | 0.12.17, released 2026-09-18 | https://api.github.com/repos/astral-sh/uv/releases/latest |
| Node 24 status | v24.21.0 (2026-09-07), **Active LTS "Krypton"** | https://nodejs.org/dist/index.json |
| Vite 8 Node floor | `^20.19.0 || >=22.12.0` — Node 24 is fine | https://registry.npmjs.org/vite/8.3.0 (`engines`) |
| Mermaid 12 Node floor | `>=22.12.0` — Node 24 is fine | https://registry.npmjs.org/mermaid/12.0.0 (`engines`) |
| FastAPI Python floor | `>=3.10` | https://pypi.org/project/fastapi/ |
| Anthropic Python SDK floor | `>=3.10` (1.x raised it) | https://pypi.org/project/anthropic/ |

No blockers. Note that **Vite 8, not Vite 7, is current** (stable 2026-03-12, Rolldown is now the only bundler and is on by default — https://vite.dev/blog/announcing-vite8), and **Next.js is at 16.x, not 15.x**. The brief's assumptions of "React 19, Vite 7?" and "Next.js 15/16" needed updating.

---

## (A) Comparison of the five options

Scoring: ●●● = strong, ●● = adequate, ● = weak/painful.

| Criterion | **1. FastAPI + files/SQLite + Vite React/TS** | **2. Python-only UI (Streamlit / NiceGUI / Reflex / Gradio / Textual)** | **3. Node-only (Next 16 or Vite+Hono) ± Electron/Tauri shell** | **4. Zero-backend single-file HTML + direct browser → Anthropic** | **5. Obsidian vault as backend + thin local web app** |
|---|---|---|---|---|---|
| **Install friction** | ●● Two toolchains (uv + npm), but both already present. `uv sync` + `npm ci` + one build. No Docker, no Rust. | ●●● Single `uv run` command, one toolchain. NiceGUI/Streamlit/Gradio ship their own JS bundles. Reflex compiles a Next.js app under the hood (slower first run, Node needed anyway). Textual is terminal-only. | ●● Node only, so one toolchain — but Python is the user's home language for any content-processing scripts. **Desktop shell adds real cost:** Tauri 2 needs Rust via rustup + Xcode CLT (https://v2.tauri.app/start/prerequisites/); Electron 44 adds a ~200 MB runtime per app. | ●●● Zero install. Open the file. | ●● Needs Obsidian installed (proprietary, not open source) *plus* the thin web app's own toolchain. |
| **Data portability** | ●●● Markdown + YAML frontmatter on disk is the source of truth; SQLite/JSON is a *derived* index you can delete. Fully git-friendly. | ●●● Same — storage is orthogonal to the UI framework here. | ●●● Same. | ● localStorage is browser-scoped, not a file, not in git. File System Access API can write real files but is Chromium-only, requires a user gesture per session, and re-granting the directory handle is fiddly. | ●●● Best-in-class: it *is* a folder of markdown. Obsidian's own design principle is that "the source of truth is always the file itself" and properties live in YAML frontmatter (https://obsidian.md/help/properties). |
| **Editor richness** (markdown + code blocks + LaTeX + Mermaid + checklists + diff) | ●●● Full control: CodeMirror 6 for editing, react-markdown/KaTeX/Shiki/Mermaid for preview, `@codemirror/merge` or react-diff-viewer-continued for the accept/reject diff. | ● to ●● **This is where Python-only UIs break down.** NiceGUI is the best of them (`ui.codemirror` wraps CodeMirror 6 with 140+ languages, plus `ui.markdown` and `ui.mermaid` — https://nicegui.io/documentation/codemirror), but there is **no built-in side-by-side diff widget** and no live markdown preview beside the editor; you'd hand-build a Vue component. Streamlit's whole-script rerun model fights stateful editors (every widget interaction reruns the script top-to-bottom; custom components trigger a full rerun — https://docs.streamlit.io/develop/api-reference/execution-flow/st.rerun). Gradio is built for model demos, not document editing. Reflex can do it but you're writing React-in-Python and still debugging React. Textual can't render LaTeX or Mermaid at all. | ●●● Identical component palette to option 1. | ●● Same components are available, but you must inline or CDN-load them, and there is no build step to tree-shake Mermaid (~1 MB+) or Shiki grammars. | ●● Obsidian itself has an excellent editor (it *is* CodeMirror 6 + MathJax + Mermaid). The thin web app beside it would be for progress/hours only — but then you have **two editors** and a sync problem. |
| **AI integration ease** | ●●● Anthropic **Python** SDK server-side; key never leaves the machine; stream SSE to the browser. Async client, retries, typed errors all free. | ●●● Same SDK, same process — arguably the simplest of all. | ●● `@anthropic-ai/sdk` server-side is fine, but the user is a data scientist: Python is the language they'll want to extend the prompt logic in. | ● Requires shipping the API key into page JS and setting `anthropic-dangerous-direct-browser-access: true`. The header **is still required and still works** (Anthropic rejects browser-origin calls without it — see §4 below), but the key is then readable by any extension or anyone who opens the file. No streaming-proxy, no server-side prompt versioning. | ●● Depends on the thin app; effectively option 1 or 3 with a different storage root. |
| **Maintenance risk** | ●● Two dependency trees. React 19.3 + Vite 8 are both current and fast-moving; pin them. FastAPI 0.141.x is still sub-1.0 but extremely stable in practice. | ●● Streamlit/Gradio/Reflex all move fast and break custom components between minors. NiceGUI is small-team but very actively maintained (3.17.1 shipped 2026-09-18). Reflex is still 0.9.x — pre-1.0 after years. | ●● Next.js 16 is a big framework for a single-user note app; its release cadence is the fastest here. Hono + Vite is much lighter. **Electron/Tauri roughly doubles your upgrade surface** for zero functional gain locally. | ●●● Almost none — but only because there is almost nothing there. Offset by CDN-pinning risk and the File System Access API being a non-standard-across-browsers moving target. | ● **Highest.** Obsidian is closed-source with no stable on-disk API contract, and the adjacent ecosystem has shown this risk: Logseq shipped a 2.0 DB beta (2026-07-13) in which "the database version is always canonical" rather than the markdown files (https://github.com/logseq/docs/blob/master/db-version.md). You'd also be racing Obsidian's own file watcher for writes. |
| **One-command start** | ●●● `uv run learn` → FastAPI serves the pre-built SPA from `StaticFiles(..., html=True)` and opens the browser. Dev mode is two commands (`uv run dev` + `npm run dev`) — acceptable, and scriptable to one. | ●●● `uv run app.py`. The single best score here. | ●● `npm run dev`. Fine. With Tauri, `npm run tauri dev` also fine — but the *first* run compiles Rust (minutes). | ●●● `open index.html`. | ●● Two apps to launch. |

### Per-framework notes for option 2 (verified)

| Framework | Latest | Date | Verdict for this app |
|---|---|---|---|
| Streamlit | 1.64.0 | 2026-09-15 | **No.** The rerun-everything model is hostile to a stateful editor with unsaved buffer + diff accept/reject. |
| NiceGUI | 3.17.1 | 2026-09-18 | **Closest viable Python-only option.** Has `ui.codemirror`, `ui.markdown`, `ui.mermaid`, `ui.editor`. Missing: a diff view. You'd write a Vue/CodeMirror-merge component — at which point you're doing frontend work in a less-documented harness than React. |
| Reflex | 0.9.11.post1 | 2026-09-15 | **No.** Still pre-1.0; compiles to Next.js, so you inherit Node *and* a Python abstraction over it. |
| Gradio | 6.28.0 | 2026-09-18 | **No.** Optimised for ML demo I/O, not document authoring. |
| Textual | 8.2.8 | 2026-06-30 | **No.** Cannot render KaTeX or Mermaid. Lovely for a companion CLI (`learn log 45m`), not for the main UI. |

(All from `https://pypi.org/pypi/<name>/json`, read 2026-09-19.)

---

## (B) Recommendation

**Build option 1: FastAPI (Python) + markdown-files-as-truth + a Vite 8 / React 19 / TypeScript frontend, served by FastAPI in production mode. No desktop shell — open `localhost` in the browser.**

Reasons, in order of weight:

1. **The editor is the product.** Everything hard about this app — a markdown buffer with live LaTeX/Mermaid preview, and an AI-beautify action that must show a reviewable diff before mutating the learner's own notes — lives in the editor. CodeMirror 6 + `@codemirror/merge` is the only mature, no-compromise answer, and it wants a real frontend build. Options 2 and 5 all end with you hand-rolling that component inside a harness that makes it harder, not easier.
2. **Python keeps the AI and content logic where the user lives.** The curriculum loader, the beautify prompt, the quiz generator, the hours rollup — a data scientist will want to iterate on these in Python, not TypeScript. The Anthropic Python SDK's `messages.stream()` + `get_final_message()` is the exact shape this feature needs.
3. **The API key stays server-side.** This alone disqualifies option 4 for anything the user might later put in a shared folder or a public dotfiles repo.
4. **Files are the source of truth, the DB is a cache.** This gets option 5's portability (git-friendly markdown + YAML frontmatter, exactly the Obsidian model) without coupling to a closed-source app whose neighbours are already migrating away from files-as-canonical.
5. **A desktop shell is not worth it for one user.** Tauri 2 costs a Rust toolchain plus Xcode CLT for a window; Electron 44 costs ~200 MB of Chromium. Neither buys anything a browser tab doesn't already give you locally. Add a shell only if you later want a global hotkey, a menu-bar timer, or offline distribution to other people.

**Honourable mention:** if the user would rather never touch TypeScript, **NiceGUI 3.17.1** is the one Python-only framework that gets close — accept a weaker diff view (render a unified diff with `difflib` into `ui.html` with add/remove classes, and an all-or-nothing accept) and you have a working app in a fraction of the code. Treat that as the "small version" fallback, not the target.

**Also worth stealing from option 5:** keep the notes folder *Obsidian-compatible* (plain `.md`, YAML frontmatter, `[[wikilink]]`-safe filenames, no app-specific sidecar files inside the notes dir). Then the user can point Obsidian at the same folder for mobile/offline reading without the app depending on it. That is the pro of option 5 without its con.

---

## (C) Reference architecture

### C.1 Folder layout

```
learning-tracker/
├── pyproject.toml              # uv project; deps + [project.scripts]
├── uv.lock
├── README.md
├── curriculum.yaml             # the content file: modules → topics → resources → self-checks
├── data/                       # ← THE SOURCE OF TRUTH. git-tracked. human-readable.
│   ├── notes/
│   │   ├── 01-linear-algebra.md
│   │   ├── 02-probability.md
│   │   └── ...                 # one markdown file per module, YAML frontmatter
│   ├── progress.json           # checklist state + per-topic status (pretty-printed, sorted keys)
│   └── sessions.jsonl          # append-only hours log, one JSON object per line
├── .cache/                     # ← DERIVED. gitignored. safe to delete at any time.
│   └── index.sqlite3
├── src/tracker/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app, StaticFiles mount, browser auto-open
│   ├── config.py               # paths, settings
│   ├── store.py                # read/write markdown+frontmatter, progress.json, sessions.jsonl
│   ├── index.py                # rebuild SQLite index from files on startup + on change
│   ├── curriculum.py           # parse curriculum.yaml → typed models
│   ├── ai.py                   # Anthropic client, beautify + quiz
│   └── routers/
│       ├── curriculum.py
│       ├── notes.py
│       ├── progress.py
│       ├── sessions.py
│       └── ai.py
├── web/                        # Vite + React + TS
│   ├── package.json
│   ├── vite.config.ts          # build.outDir = "../src/tracker/static", server.proxy /api → :8765
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api.ts              # typed fetch wrappers
│       ├── store.ts            # zustand
│       └── components/...
└── tests/
    ├── test_store.py
    ├── test_index.py
    ├── test_api.py
    └── web/*.test.tsx
```

### C.2 Data model — files first, index derived

**Rule: nothing is ever read from SQLite that cannot be recomputed from `data/`. The index exists only to make search and rollups fast. Deleting `.cache/` must be a no-op.** This is the Obsidian model — properties live in the file's YAML frontmatter and an internal metadata cache is built from them at startup for fast search and queries (https://obsidian.md/help/properties, https://obsidian.md/help/bases/syntax). It is deliberately *not* the Logseq 2.0 DB model, where the database became canonical (https://github.com/logseq/docs/blob/master/db-version.md).

**Note file** — `data/notes/01-linear-algebra.md`:

```markdown
---
module_id: linear-algebra
title: Linear Algebra
status: in_progress          # not_started | in_progress | done
started: 2026-09-01
updated: 2026-09-19T14:02:11+01:00
tags: [math, foundations]
---

# Linear Algebra

Rank-nullity: $\dim(\ker T) + \operatorname{rank}(T) = \dim V$.

```python
import numpy as np
np.linalg.matrix_rank(A)
```

```mermaid
graph LR; V --> W; W --> im
```

- [ ] Prove rank-nullity by hand
- [x] Watch 3B1B ch.1-4
```

**`data/progress.json`** — checklist and per-topic state, written with `json.dumps(obj, indent=2, sort_keys=True, ensure_ascii=False)` + trailing newline so git diffs stay one-line-per-change:

```json
{
  "schema": 1,
  "modules": {
    "linear-algebra": {
      "status": "in_progress",
      "topics": { "rank-nullity": "done", "svd": "not_started" },
      "self_checks": { "sc-01": true, "sc-02": false },
      "checklist": { "read-strang-ch3": true }
    }
  }
}
```

**`data/sessions.jsonl`** — append-only, so two writes never conflict and git merges cleanly:

```json
{"id":"01JF...","module_id":"linear-algebra","start":"2026-09-19T09:00:00+01:00","minutes":45,"note":"SVD reading"}
```

**`.cache/index.sqlite3`** — tables `notes(module_id, path, mtime, size, title, status, body)`, `notes_fts` (FTS5 over body), `sessions(...)`, `meta(key, value)` holding a `content_hash` per file. On startup: stat every file; if `(path, mtime, size)` differs from the row, re-parse and re-insert. Full rebuild takes milliseconds at this scale.

**Anti-drift rules (the part that actually matters):**
1. **Single writer.** Only `store.py` writes files. Routers call it; nothing else touches `data/`.
2. **Write atomically.** Write to `path.with_suffix(".md.tmp")`, `os.replace()` onto the target. No partial files if the process dies mid-save.
3. **Optimistic concurrency against the editor.** `GET /api/notes/{id}` returns the file's `mtime_ns`. `PUT` sends it back; if it no longer matches, return `409` and let the UI show a reload prompt. This catches the case where the user edited the same file in Obsidian or vim while the tab was open.
4. **Rebuild, never repair.** There is no "sync the DB back to files" code path. Ever. If the index looks wrong, drop the table and re-read the folder.
5. **Watch the folder.** `watchfiles` on `data/` invalidates index rows on external edits; a `GET /api/events` SSE stream tells the open tab to refresh. Optional, ~30 lines, and it's what makes editing in Obsidian-alongside actually pleasant.
6. **Frontmatter is authoritative for per-note state** (`status`, `tags`); `progress.json` is authoritative for *cross-note* state (checklists, self-checks). Never store the same fact in both.

### C.3 API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/curriculum` | Parsed `curriculum.yaml`: modules → topics → resources → self-checks |
| `GET` | `/api/modules` | Module list joined with progress + total hours (from index) |
| `GET` | `/api/notes/{module_id}` | `{ frontmatter, body, mtime_ns }` |
| `PUT` | `/api/notes/{module_id}` | Save body + frontmatter; body includes `mtime_ns`; `409` on mismatch |
| `GET` | `/api/search?q=` | FTS5 over note bodies |
| `GET` / `PATCH` | `/api/progress` | Read / merge-patch `progress.json` |
| `GET` | `/api/sessions` | Filterable session list + rollups |
| `POST` | `/api/sessions` | Append one session to `sessions.jsonl` |
| `POST` | `/api/ai/beautify` | **SSE stream.** In: `{module_id, text}`. Out: token deltas, then a final `{original, beautified}` event. Server never writes the file — the client decides. |
| `POST` | `/api/ai/quiz` | Structured output: N questions for a module |
| `GET` | `/api/health` | `{ ok, ai_available: bool, ai_reason: str|null }` — lets the UI grey out the AI buttons before the user clicks |
| `GET` | `/api/events` | SSE: file-changed notifications from `watchfiles` |

### C.4 Frontend components

```
<App>
├─ <Sidebar>              modules, % complete, hours this week
├─ <ModuleView>
│  ├─ <TopicList>         topics + resources + self-check checkboxes
│  ├─ <Checklist>         bound to progress.json via PATCH
│  ├─ <SessionTimer>      start/stop → POST /api/sessions
│  └─ <NoteEditor>
│     ├─ <MarkdownEditor>   CodeMirror 6 + @codemirror/lang-markdown, debounced autosave
│     ├─ <MarkdownPreview>  react-markdown + remark-math + rehype-katex + <MermaidBlock> + <CodeBlock> (Shiki)
│     └─ <BeautifyPanel>    button → SSE → <DiffView> → Accept (PUT) / Reject (discard)
└─ <QuizDrawer>           optional; renders quiz JSON, tracks score locally
```

Key choices:
- **Diff view: `@codemirror/merge` (`MergeView`), not a React diff component.** You already have CodeMirror loaded; the merge view gives per-chunk accept/revert gutters natively, which is exactly the "accept/reject" affordance the brief asks for, and it keeps one editor engine instead of two. `react-diff-viewer-continued` 4.4.0 is the fallback if you want a pure read-only side-by-side (it does declare React 19 in its peer range — verified from its registry metadata).
- **Preview: `react-markdown` 10 + `remark-math` + `rehype-katex`.** Note `remark-math` 6.0.0 (2023-09-19) and `rehype-katex` 7.0.1 (2024-08-19) have not shipped in a while — that is maturity, not abandonment; they track the remark/rehype majors, which have not moved.
- **Highlighting: Shiki 4.** Prefer it over highlight.js for fidelity, but load only the langs you need (`createHighlighterCore` + explicit imports) — the full bundle is large.
- **Mermaid 12** rendered in an isolated `<MermaidBlock>` with `mermaid.render()` in a `useEffect`, lazily `import()`ed so it isn't in the initial chunk.
- **State: zustand 5.** ~1 KB, no provider, no boilerplate. Redux/Jotai are overkill here.
- **Styling: Tailwind v4.** Its CSS-first config (`@import "tailwindcss"`, no `tailwind.config.js` required) removes the one thing that made Tailwind annoying for small projects. Plain CSS + a handful of custom properties is an entirely defensible alternative for a single-user app — pick either, don't mix.

### C.5 The beautify-note call

`src/tracker/ai.py` — current SDK (`anthropic` 1.7.0), async client, streaming, `claude-opus-5`, adaptive thinking, server-side refusal fallbacks:

```python
"""AI actions. The only module that talks to Anthropic."""
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import AsyncIterator

import anthropic

MODEL = "claude-opus-5"

BEAUTIFY_SYSTEM = """\
You are a careful copy-editor for a learner's personal study notes.

You rewrite the note's PRESENTATION only. You never change its MEANING.

Hard constraints:
- Do not add facts, claims, examples, caveats, or conclusions that are not
  already present. Do not delete any claim the note makes.
- Preserve every code block byte-for-byte, including language tags, comments,
  and whitespace. Never "fix" code.
- Preserve every LaTeX expression exactly ($...$ and $$...$$). Never restate
  math in prose and never re-derive it.
- Preserve every ```mermaid block exactly.
- Preserve every checklist item and its checked/unchecked state.
- Preserve every link target and footnote.
- Do NOT emit YAML frontmatter; you are given the body only.

What you MAY do: fix spelling, grammar and punctuation; tighten wordy
sentences without dropping content; impose consistent heading levels and
list markers; merge accidentally split paragraphs; add a heading only where
an unlabelled section clearly already exists.

If the note is already clean, return it unchanged.

Output ONLY the rewritten markdown body. No preamble, no code fence around
the whole document, no commentary.
"""


class AIUnavailable(RuntimeError):
    """No usable Anthropic credential, or the API rejected our credential."""


@dataclass(slots=True)
class AIStatus:
    available: bool
    reason: str | None = None


_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    """Lazily build the async client.

    Credential resolution is the SDK's, not ours: ANTHROPIC_API_KEY, then
    ANTHROPIC_AUTH_TOKEN, then the ANTHROPIC_PROFILE-selected or active
    OAuth profile written by `ant auth login`. An unset ANTHROPIC_API_KEY
    does NOT mean there is no credential.
    """
    global _client
    if _client is None:
        try:
            _client = anthropic.AsyncAnthropic(max_retries=3, timeout=120.0)
        except anthropic.AnthropicError as exc:  # no credential resolvable at all
            raise AIUnavailable(
                "No Anthropic credential found. Either export ANTHROPIC_API_KEY, "
                "or run `ant auth login` (check with `ant auth status`). "
                "Notes and progress tracking work fine without it."
            ) from exc
    return _client


def status() -> AIStatus:
    """Cheap, non-network check used by GET /api/health to grey out AI buttons."""
    if os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"):
        return AIStatus(True)
    try:
        get_client()
    except AIUnavailable as exc:
        return AIStatus(False, str(exc))
    return AIStatus(True)  # an `ant auth login` profile resolved


async def beautify(body: str) -> AsyncIterator[tuple[str, str]]:
    """Yield ("delta", text) chunks, then exactly one ("done", full_text).

    Streaming is used because notes can be long and max_tokens is large;
    it also gives the UI something to show while Claude works.
    """
    client = get_client()
    try:
        async with client.beta.messages.stream(
            model=MODEL,
            max_tokens=32000,
            thinking={"type": "adaptive"},
            output_config={"effort": "medium"},   # copy-editing, not hard reasoning
            # Server-side refusal fallbacks. Harmless here and removes a failure
            # mode; drop these two lines if you want the plain, non-beta client.
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            system=[
                {
                    "type": "text",
                    "text": BEAUTIFY_SYSTEM,
                    "cache_control": {"type": "ephemeral"},  # stable prefix, cache it
                }
            ],
            messages=[
                {
                    "role": "user",
                    "content": (
                        "Rewrite the presentation of this note. Meaning must be "
                        "identical.\n\n<note>\n" + body + "\n</note>"
                    ),
                }
            ],
        ) as stream:
            async for text in stream.text_stream:
                yield ("delta", text)
            final = await stream.get_final_message()

        if final.stop_reason == "refusal":
            raise AIUnavailable(
                f"Claude declined this request "
                f"({getattr(final.stop_details, 'category', 'unknown')})."
            )
        if final.stop_reason == "max_tokens":
            raise AIUnavailable(
                "The note was too long to rewrite in one pass. "
                "Split it and beautify section by section."
            )

        out = "".join(b.text for b in final.content if b.type == "text")
        yield ("done", out)

    except anthropic.AuthenticationError as exc:          # 401
        raise AIUnavailable(
            "Anthropic rejected the credential (401). Check `ant auth status` "
            "or re-export ANTHROPIC_API_KEY."
        ) from exc
    except anthropic.NotFoundError as exc:                # 404 - bad model id
        raise AIUnavailable(f"Model {MODEL!r} not available to this account.") from exc
    except anthropic.RateLimitError as exc:               # 429
        raise AIUnavailable("Rate limited. Wait a moment and try again.") from exc
    except anthropic.APIStatusError as exc:               # any other non-2xx
        raise AIUnavailable(f"Anthropic API error {exc.status_code}: {exc.message}") from exc
    except anthropic.APIConnectionError as exc:           # offline
        raise AIUnavailable(
            "Could not reach the Anthropic API. Everything except the AI "
            "actions works offline."
        ) from exc
```

Router side — SSE, and the server **never writes the file**; the diff is accepted client-side and comes back through the normal `PUT /api/notes/{id}`:

```python
@router.post("/ai/beautify")
async def beautify_note(req: BeautifyRequest):
    async def gen():
        try:
            async for kind, payload in ai.beautify(req.text):
                yield f"event: {kind}\ndata: {json.dumps(payload)}\n\n"
        except ai.AIUnavailable as exc:
            yield f"event: error\ndata: {json.dumps(str(exc))}\n\n"
    return StreamingResponse(gen(), media_type="text/event-stream")
```

Why these API choices, with sources:

- **`claude-opus-5`**, 1M context, $5/$25 per MTok — from the model table in the bundled `claude-api` skill (cached 2026-06-24) and https://platform.claude.com/docs/en/about-claude/models/overview.md.
- **`thinking={"type": "adaptive"}`** — the only on-mode on current models. `budget_tokens` is *removed* on `claude-opus-5` and returns a 400. On Opus 5, omitting `thinking` also runs adaptive. Effort is set at `output_config.effort`, **not** inside the `thinking` object. Source: https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost (fetched 2026-09-19), which also documents the five levels (`low`/`medium`/`high` default/`xhigh`/`max`).
- **`messages.stream()` + `get_final_message()`** — the SDK's accumulating helper; the raw `stream=True` form does no accumulation. Source: bundled `python/claude-api/streaming.md`, matching https://platform.claude.com/docs/en/build-with-claude/streaming.md.
- **`fallbacks: "default"` with beta `server-side-fallback-2026-07-01`** — the scalar form routes by refusal category so you never maintain a model list; it is distinct from the `-2026-06-01` header that gates the array form, and pairing the wrong header with the wrong form 400s. It requires the `client.beta.messages` namespace. Source: bundled `shared/model-migration.md` (Migrating to Claude Opus 5 → New API features).
- **`stop_reason == "refusal"` must be checked before reading `content`**, and `stop_details` is populated *only* for refusals (it is `null` for `end_turn`, `max_tokens`, `tool_use`, …) — hence the `getattr` guard.
- **No assistant prefill.** Prefilling the last assistant turn returns 400 on `claude-opus-5`. If you are tempted to prefill `"---\n"` to force frontmatter-free output, don't — use the system prompt constraint above instead.
- **Prompt caching on the system block** — the system prompt is byte-stable across every beautify call, so one `cache_control` breakpoint there is free money. Note the render order is `tools` → `system` → `messages`, and changing `effort` between requests invalidates the cache (demonstrated with `usage` numbers at https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost) — so keep `effort` fixed per feature.

**Quiz action — structured outputs.** Use `client.messages.parse()` with a Pydantic model; the SDK transforms it to `output_config.format` internally and returns `response.parsed_output`:

```python
from pydantic import BaseModel

class Question(BaseModel):
    prompt: str
    options: list[str]
    answer_index: int
    explanation: str

class Quiz(BaseModel):
    questions: list[Question]

resp = await client.messages.parse(
    model=MODEL, max_tokens=8000,
    thinking={"type": "adaptive"},
    messages=[{"role": "user", "content": f"Write 6 questions on:\n{note_body}"}],
    output_format=Quiz,
)
quiz = resp.parsed_output
```

`output_format` on `messages.parse()` is the Pydantic convenience form; on `messages.create()` you must use `output_config={"format": {"type": "json_schema", "schema": {...}}}` — the bare `output_format` field raises `TypeError` in Python SDK 1.x. `claude-opus-5` is on the supported-model list. Source: https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md (fetched 2026-09-19).

**Missing-API-key behaviour, end to end:**
1. `GET /api/health` returns `{"ai_available": false, "ai_reason": "..."}`.
2. The UI greys out "Beautify" and "Quiz me" and shows the reason in a tooltip. Nothing else is disabled.
3. If the user clicks anyway (race), the SSE stream emits one `error` event with the same human message.
4. The app **never** crashes at import time or startup because of a missing key — the client is built lazily.
5. The message names both credential paths (`ANTHROPIC_API_KEY` **and** `ant auth login`), because an unset env var genuinely does not mean there is no credential; `ant auth status` is the diagnostic. Source: https://platform.claude.com/docs/en/cli-sdks-libraries/cli/authentication (fetched 2026-09-19) — `ant auth login` stores credentials under `$ANTHROPIC_CONFIG_DIR` as `credentials/<profile>.json`, and "Profiles are only consulted when no API key is set."

### C.6 One-command start

**`pyproject.toml`:**

```toml
[project]
name = "learning-tracker"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "fastapi>=0.141,<0.142",
  "uvicorn[standard]>=0.53,<0.54",
  "anthropic>=1.7,<2",
  "pydantic>=2.13,<3",
  "python-frontmatter>=1.3,<2",
  "pyyaml>=6",
  "watchfiles>=1.2,<2",
]

[project.scripts]
learn = "tracker.main:run"

[dependency-groups]
dev = ["pytest>=9.1", "pytest-asyncio", "httpx2", "ruff"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

`uv run learn` resolves, installs into `.venv`, and starts. That is the one command.

**`src/tracker/main.py`** — serve the built SPA and open the browser:

```python
import threading, webbrowser
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn

STATIC = Path(__file__).parent / "static"
PORT = 8765

app = FastAPI(title="learning-tracker")
app.include_router(api_router, prefix="/api")

@app.on_event("startup")
def _startup():
    index.rebuild()          # files → .cache/index.sqlite3

# MUST be mounted last: "/" would otherwise shadow /api.
# html=True serves index.html for unknown paths → client-side routing works.
if STATIC.is_dir():
    app.mount("/", StaticFiles(directory=STATIC, html=True), name="spa")

def run():
    threading.Timer(1.0, lambda: webbrowser.open(f"http://127.0.0.1:{PORT}")).start()
    uvicorn.run(app, host="127.0.0.1", port=PORT, log_level="warning")
```

`StaticFiles(directory=..., html=True)` is the documented single-page-app mode — signature `StaticFiles(directory=None, packages=None, html=False, check_dir=True, follow_symlink=False)`, where `html=True` "automatically loads `index.html` for directories if such file exist". Source: https://starlette.dev/staticfiles/ (fetched 2026-09-19); FastAPI's own mount pattern at https://fastapi.tiangolo.com/tutorial/static-files/. Bind to `127.0.0.1`, never `0.0.0.0`, for a local single-user app.

**Dev mode:** `vite.config.ts` sets `server.proxy = { "/api": "http://127.0.0.1:8765" }` and `build.outDir = "../src/tracker/static"`. Then:

```json
{ "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "start": "npm run build && uv run learn"
}}
```

Hot reload: Vite 8 HMR on the frontend, `uvicorn --reload` on the backend during dev. In production mode there is no Node process at all — FastAPI serves the built assets.

**PEP 723 single-file variant** (for a throwaway prototype or a companion script, *not* the main app — you cannot ship a Vite build this way):

```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = ["anthropic>=1.7", "python-frontmatter", "rich"]
# ///
```

`uv add --script file.py 'anthropic'` generates that block for you; `uv run --with rich script.py` is the ad-hoc equivalent. Source: https://docs.astral.sh/uv/guides/scripts/ (fetched 2026-09-19).

---

## (D) Pinned versions

All confirmed **2026-09-19** from the package registries (`registry.npmjs.org/<pkg>`, `pypi.org/pypi/<pkg>/json`) or the cited docs.

### Python

| Package | Pin | Latest | Released | Licence | Source |
|---|---|---|---|---|---|
| `anthropic` | `>=1.7,<2` | **1.7.0** | 2026-09-18 | MIT | https://pypi.org/project/anthropic/ |
| `fastapi` | `>=0.141,<0.142` | **0.141.1** | 2026-07-29 | MIT | https://pypi.org/project/fastapi/ |
| `uvicorn[standard]` | `>=0.53,<0.54` | **0.53.0** | 2026-09-14 | BSD-3-Clause | PyPI JSON |
| `pydantic` | `>=2.13,<3` | **2.13.5** | 2026-08-28 | MIT | PyPI JSON |
| `python-frontmatter` | `>=1.3,<2` | **1.3.0** | 2026-05-20 | MIT | PyPI JSON |
| `watchfiles` | `>=1.2,<2` | **1.2.0** | 2026-05-18 | MIT | PyPI JSON |
| `pytest` | `>=9.1` | **9.1.1** | 2026-06-19 | MIT | PyPI JSON |
| `httpx2` (test client) | `>=2.13` | **2.13.0** | 2026-09-14 | BSD-3-Clause | PyPI JSON |
| `uv` (tool) | 0.12.x | **0.12.17** | 2026-09-18 | MIT/Apache-2.0 | GitHub Releases API |

> **`httpx2`, not `httpx`.** `anthropic` 1.x is built on `httpx2`; `anthropic.Timeout` *is* `httpx2.Timeout`, and an object from the old `httpx` package is rejected at request time. Source: bundled `python/claude-api/README.md`, pointing at https://github.com/anthropics/anthropic-sdk-python/blob/main/MIGRATION.md.

### Node / frontend

| Package | Pin | Latest | Published | Licence |
|---|---|---|---|---|
| `react` / `react-dom` | `19.3.x` | **19.3.0** | 2026-09-09 | MIT |
| `vite` | `8.3.x` | **8.3.0** | 2026-09-10 | MIT |
| `typescript` | `7.0.x` | **7.0.2** | 2026-07-08 | Apache-2.0 |
| `codemirror` | `6.0.x` | **6.0.2** | 2025-06-19 | MIT |
| `@codemirror/lang-markdown` | `6.5.x` | **6.5.2** | 2026-08-04 | MIT |
| `@codemirror/merge` (diff view) | `6.12.x` | **6.12.2** | 2026-06-09 | MIT |
| `@uiw/react-codemirror` (optional React wrapper) | `4.25.x` | **4.25.11** | — | MIT |
| `react-markdown` | `10.1.x` | **10.1.0** | 2025-03-07 | MIT |
| `remark-math` | `6.0.0` | **6.0.0** | 2023-09-19 | MIT |
| `rehype-katex` | `7.0.1` | **7.0.1** | 2024-08-19 | MIT |
| `katex` | `0.18.x` | **0.18.7** | 2026-09-06 | MIT |
| `shiki` | `4.4.x` | **4.4.3** | 2026-08-10 | MIT |
| `mermaid` | `12.0.x` | **12.0.0** | 2026-09-10 | MIT |
| `zustand` | `5.0.x` | **5.0.15** | 2026-08-13 | MIT |
| `tailwindcss` | `4.3.x` | **4.3.3** | 2026-07-16 | MIT |
| `vitest` | `5.0.x` | **5.0.1** | 2026-09-15 | MIT |
| `@playwright/test` | `1.63.x` | **1.63.0** | 2026-09-04 | Apache-2.0 |
| Node runtime | 24.x | **24.21.0**, Active LTS "Krypton" | 2026-09-07 | — |

**Not selected, for the record:** `react-diff-viewer-continued` 4.4.0 (2026-07-14, MIT, peer range includes `^19.0.0`) — viable fallback diff component; `diff2html` 3.4.56 (2026-01-31, MIT) — needs a unified-diff string, adds a step; `highlight.js` 11.12.0 (2026-08-12, BSD-3-Clause) — lighter than Shiki, lower fidelity; `markdown-it` 15.0.2 (2026-09-11, MIT) — use if you drop React; `next` 16.3.5, `electron` 44.4.3, `@tauri-apps/cli` 2.11.4 (Apache-2.0 OR MIT), `hono` 4.13.8, `express` 5.2.1 — all current, all rejected above.

### Model / API constants

| Item | Value | Source |
|---|---|---|
| Model ID | `claude-opus-5` (no date suffix) | `claude-api` skill model table, cached 2026-06-24 |
| Context / output | 1M in, 128K max output | same |
| Pricing | $5 / $25 per MTok | same |
| Thinking | `{"type": "adaptive"}`; `budget_tokens` → 400 | https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost |
| Effort | `output_config.effort`, default `high` | same |
| Structured outputs | `output_config.format` (`output_format` deprecated) | https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md |
| Refusal fallbacks | `fallbacks: "default"` + beta `server-side-fallback-2026-07-01` | `shared/model-migration.md` |
| Browser CORS header | `anthropic-dangerous-direct-browser-access: true` (still required for browser-origin calls) | see §4 below |

---

## §4 — The zero-backend option, in detail

**Is the header still supported?** Yes. Anthropic's Messages API rejects browser-origin requests unless the caller opts in with `anthropic-dangerous-direct-browser-access: true`; without it the preflight fails with "CORS requests must set 'anthropic-dangerous-direct-browser-access' header". The mechanism has been in place since it was introduced in August 2024 (https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/) and is still in force as of 2026. In the TypeScript SDK the equivalent knob is `dangerouslyAllowBrowser: true` — the official README states browser support is "disabled by default to avoid exposing your secret API credentials" (https://github.com/anthropics/anthropic-sdk-typescript/blob/main/README.md, read 2026-09-19), linking Anthropic's own key-hygiene guidance.

**The trade-off, stated plainly.** The header's name is the documentation. Putting a key in page JS means: any browser extension with content-script access can read it; the key is in the page source of a file that might end up in the user's git repo or a shared folder; there is no server-side rate limit or spend cap; and revocation is manual. For a personal tool where the key is also on the same machine's shell profile, the *marginal* risk is smaller than for a deployed site — but it is strictly worse than option 1 for no benefit, because option 1 already runs entirely on localhost. Additionally, the File System Access API (`showDirectoryPicker`) is the only way to make this option's data portable, and it is Chromium-only with a per-session permission gesture — which defeats "one-command start" more thoroughly than `uv run` ever could.

**Verdict:** use option 4 only for a 30-minute throwaway prototype, and even then put the key in a `?key=` prompt rather than in the file.

---

## (E) Risks and how to test

### Risks

| # | Risk | Likelihood | Mitigation |
|---|---|---|---|
| R1 | **Index/file drift** — SQLite disagrees with `data/` after an external edit | Medium | Single-writer `store.py`; index is derived-only with a hard no-write-back rule; `watchfiles` invalidation; full rebuild on startup is cheap. Test: mutate a file behind the app's back, assert the API reflects it. |
| R2 | **Lost note on a bad beautify** | Medium | Server never writes; client shows `MergeView` and only issues `PUT` on explicit accept. Before every write, `store.py` copies the previous body to `.cache/backups/<id>/<ts>.md` (keep last 20). The folder is a git repo — `git diff` is the real undo. |
| R3 | **Beautify changes meaning despite the prompt** | Medium | The prompt constraints above are necessary but not sufficient. Add a **programmatic post-check** before showing the diff: extract all fenced code blocks, `$...$`/`$$...$$` spans, link targets and `- [ ]`/`- [x]` items from input and output; if the multisets differ, flag the diff as "risky" in the UI (still show it, don't auto-accept). This is 40 lines and catches the failure mode that matters. |
| R4 | **`max_tokens` truncation on a long note** | Low-Medium | 32K output cap with streaming; explicit `stop_reason == "max_tokens"` handling that tells the user to split the note. Thinking tokens count toward `max_tokens` — confirmed at https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost. |
| R5 | **Two front-end majors move fast** (React 19.3, Vite 8 w/ Rolldown) | Medium | Exact-pin in `package.json`, commit `package-lock.json`, and treat upgrades as deliberate work. Rolldown became the *only* bundler in Vite 8 — if an obscure Rollup plugin misbehaves, that's the cause. |
| R6 | **Concurrent edit between the app and Obsidian/vim** | Medium (if the user does keep a vault) | `mtime_ns` optimistic-concurrency token on `PUT`, `409` + reload prompt. SSE file-change events keep the open tab honest. |
| R7 | **Offline** | Low | Only the two AI endpoints need network. `APIConnectionError` → a clear "works offline except AI" message. KaTeX fonts, Shiki grammars and Mermaid are all bundled by Vite, so no CDN at runtime. |
| R8 | **`progress.json` merge conflicts in git** | Low | Sorted keys + 2-space indent keeps diffs minimal; `sessions.jsonl` is append-only so it merges trivially. |
| R9 | **Anthropic SDK 1.x churn** | Low-Medium | 1.0.0 landed 2026-08-20 and minors ship every few days. Pin `>=1.7,<2` and read the CHANGELOG before bumping. The `httpx` → `httpx2` swap is the trap to watch for in any copied snippet. |
| R10 | **Scope creep into a second Obsidian** | High (human risk) | Decide once: this app owns *progress, hours, curriculum and the beautify action*. Editing is a convenience, not a competitor to a real editor. |

### Testing — proportionate for a personal tool

The right amount is "enough that a refactor at 11pm doesn't silently eat notes". Roughly 15–25 tests total.

**pytest (the majority — this is where the risk is):**
- `test_store.py` — round-trip frontmatter (write → read → identical); atomic write leaves no `.tmp` on simulated crash; unicode and emoji survive; `mtime_ns` mismatch raises.
- `test_index.py` — **the load-bearing one.** Build index, delete `.cache/`, rebuild, assert byte-identical query results. Externally modify a file, assert the index catches up. Assert no code path opens `data/` for writing outside `store.py` (a simple AST grep test is fine).
- `test_api.py` — `fastapi.testclient.TestClient`; every endpoint's happy path; `PUT` with a stale `mtime_ns` returns 409; `PATCH /api/progress` merges rather than replaces.
- `test_ai.py` — **never call the real API in tests.** Monkeypatch `ai.get_client`. Cover: missing credential → `AIUnavailable` with a message naming both `ANTHROPIC_API_KEY` and `ant auth login`; `AuthenticationError` → friendly 401 message; `APIConnectionError` → offline message; `stop_reason="refusal"` handled; `stop_reason="max_tokens"` handled. Plus the R3 invariant checker as a pure function with hand-written before/after pairs (code block mangled, LaTeX rewritten, checklist item dropped → all flagged).

**Vitest (a handful):** the R3 invariant checker again if you implement it client-side; the markdown→preview pipeline renders a KaTeX span, a Shiki `<pre>`, and a Mermaid placeholder for a fixture note; zustand store transitions for checklist toggles.

**Playwright (2–3, no more):** (1) open app → pick module → type in the editor → reload → text persisted. (2) beautify with a **stubbed** `/api/ai/beautify` route (`page.route`) → diff appears → accept → file content changed → reject → file unchanged. (3) timer start/stop writes a session and the hours total updates.

**Skip entirely:** coverage thresholds, CI, snapshot tests of rendered markdown, mutation testing, load tests. One user, one machine.

**Manual smoke before each "release" to yourself:** `rm -rf .cache/ && uv run learn` — if the app comes up identical, R1 is genuinely controlled.

---

## Sources

- [anthropic · PyPI](https://pypi.org/project/anthropic/) — SDK 1.7.0, 2026-09-18; Python >=3.10; 1.0.0 on 2026-08-20
- [anthropic-sdk-python MIGRATION.md](https://github.com/anthropics/anthropic-sdk-python/blob/main/MIGRATION.md) — 0.x → 1.x, `httpx2`
- [anthropic-sdk-typescript README](https://github.com/anthropics/anthropic-sdk-typescript) — `dangerouslyAllowBrowser`, browser disabled by default
- [Steering thinking — Claude docs](https://platform.claude.com/docs/en/build-with-claude/thinking-steering-and-cost) — adaptive thinking, effort levels, `output_config.effort`, cache invalidation, thinking tokens vs `max_tokens`
- [Structured outputs — Claude docs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md) — `output_config.format`, `messages.parse()`, deprecation of `output_format`
- [CLI authentication options — Claude docs](https://platform.claude.com/docs/en/cli-sdks-libraries/cli/authentication) — `ant auth login`, profiles, `ant auth status`, precedence
- [Authentication — Claude docs](https://platform.claude.com/docs/en/manage-claude/authentication) — `ANTHROPIC_API_KEY`, key types
- [Models overview — Claude docs](https://platform.claude.com/docs/en/about-claude/models/overview.md) — `claude-opus-5` id, context, pricing
- [Claude's API now supports CORS requests — Simon Willison](https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/) — origin of the browser-access header
- [FastAPI · PyPI](https://pypi.org/project/fastapi/) — 0.141.1, 2026-07-29
- [Static Files — FastAPI](https://fastapi.tiangolo.com/tutorial/static-files/) — `app.mount` pattern
- [StaticFiles — Starlette](https://starlette.dev/staticfiles/) — full signature, `html=True`
- [Running scripts — uv docs](https://docs.astral.sh/uv/guides/scripts/) — `uv run`, `--with`, PEP 723 `# /// script`
- [astral-sh/uv releases](https://github.com/astral-sh/uv/releases) — 0.12.17, 2026-09-18
- [Vite 8.0 is out!](https://vite.dev/blog/announcing-vite8) — stable 2026-03-12, Rolldown default, Node 20.19+/22.12+
- [Node.js release index](https://nodejs.org/dist/index.json) — 24.21.0 Active LTS "Krypton"
- [ui.codemirror — NiceGUI](https://nicegui.io/documentation/codemirror) — CodeMirror 6, 140+ languages, `ui.markdown` / `ui.mermaid`
- [st.rerun — Streamlit docs](https://docs.streamlit.io/develop/api-reference/execution-flow/st.rerun) and [2026 release notes](https://docs.streamlit.io/develop/quick-reference/release-notes/2026) — rerun model, widget-state size cap
- [Properties — Obsidian Help](https://obsidian.md/help/properties) and [Bases syntax](https://obsidian.md/help/bases/syntax) — YAML frontmatter, file-as-source-of-truth, metadata cache
- [logseq/docs db-version.md](https://github.com/logseq/docs/blob/master/db-version.md) — DB version is canonical, not the markdown files
- [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) — Xcode CLT + rustup on macOS
- npm registry metadata (`https://registry.npmjs.org/<pkg>`) and PyPI JSON (`https://pypi.org/pypi/<pkg>/json`) for every version, date, licence and peer range in §D — all read 2026-09-19
