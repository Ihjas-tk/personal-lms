# Discovery research for open-sourcing `learn`

Research · 2026-09-20 · Package B of `docs/superpowers/plans/2026-09-20-open-source-plan.md`.
Star counts and topic counts pulled from the GitHub REST/search API on 2026-09-20.

---

## 1. Positioning

GitHub's default repository search covers **name, description and topics only** — README text needs an explicit `in:readme` qualifier ([docs](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories)). So `About` and topics are *retrieval*; the README is *conversion* and Google bait. Relevance behaves like a ratio of matching to total words, so padding hurts — a 3-word `About` outranked an 8-word one in one worked test ([Markepear](https://www.markepear.dev/blog/github-search-engine-optimization)).

Topic sizes measured today (repos carrying the topic = competition):

| Phrase | Topic size | Top repo | Verdict |
| --- | --- | --- | --- |
| `self-hosted` | 36,027 | awesome-selfhosted | Browsed, never rankable. Carry it — it's the filter r/selfhosted readers use. |
| `markdown` | 39,557 | markitdown | The data-format promise. Carry it. |
| `local-first` | 21,595 | — | 2025–26 zeitgeist word, pairs with the vault story. Carry it. |
| `spaced-repetition` | 2,200 | fsrs4anki 4.1k | Highest-intent term `learn` can honestly claim. **Primary.** |
| `flashcards` | 2,583 | Anki-Android 11.8k | High volume, wrong expectation. See §7. |
| `srs` | 480 | Anki-Android | Cheap, exact. |
| `study-planner` | 298 | security-study-plan 5.1k | Incumbents are plan *lists*, not apps. Winnable. |
| `active-recall` | 160 | 718 | Tiny, exact, correct. **Top-10 on day one.** |
| `study-tracker` | 140 | kaogong-study-tracker 244 | Literal category; leader has 244 stars. **Winnable outright.** |
| `learning-tracker` | 36 | a 3-star repo | Essentially unclaimed. **Claim it.** |
| `retrieval-practice` | 31 | — | Unclaimed, scientifically correct. **Claim it.** |
| `learning-management-system` | 609 | frappe/lms 3.2k | The repo is named `personal-lms` but is not this category. §5. |

The structural insight: head terms (`self-hosted`, `local-first`, `markdown`) are where the *audience* is; tail terms (`study-tracker`, `learning-tracker`, `active-recall`, `retrieval-practice`) are where `learn` can be **the best result in the world on launch day**, because incumbents there have 3–244 stars. Buy the tail, browse the head.

### `About` description (≤ 350 chars; 213 used)

> Self-hosted, local-first study tracker for any curriculum: every "done when you can…" is a typed self-test with a hidden reference, confidence rating and spaced re-test. Markdown + YAML in a git vault. No streaks.

### README H1 and tagline

Put the category words *in the H1 text* — Stirling-PDF's `Stirling PDF - The Open-Source PDF Platform` pattern — because you have zero brand equity and `learn` is a generic word.

```markdown
# learn — a self-hosted study tracker that measures whether you actually know it

Point it at any curriculum. Every "done when you can…" line becomes a typed self-test with the
reference hidden until you freeze your answer. Rate your confidence first; the app tells you how
calibrated you were. Everything lives as Markdown and YAML in a git repo you own.
```

Second line, for the people who will quote you: **"an eval harness for the learner."**

### Three alternative angles

| Angle | Upside | Trade-off |
| --- | --- | --- |
| **"Anki for skills, not facts"** | Rides the biggest term in the space (Anki 31.3k stars; 2,401 repos under `anki`). Instantly legible. | Invites a comparison you lose: no FSRS queue, no mobile, no shared decks. Sets flashcard expectations the product will disappoint. Use inside the comparison table, never as the description. |
| **"A personal, self-hosted LMS"** | Matches the repo name; `learning-management-system` is 609 repos. | LMS means multi-user, enrolment, SCORM, grading others. Reviewers mark it down for missing all of them, and the app's real differentiators are invisible in the category. This is today's framing and the weakest of the three. |
| **"An eval harness for your own learning"** | Genuinely new language; lands hard with the ML/LLM crowd — the flagship track's exact audience. | Zero search volume, meaningless outside ML. Must be the *second* sentence, never the `About`. |

**Recommendation:** lead with study-tracker/active-recall in description and topics; use the eval-harness line as the memorable second sentence; put Anki and Obsidian only inside an explicit comparison table — Karakeep's `## Alternatives`, which names seven competitors, is the cleanest legitimate way to own competitor queries.

### The "how it is different" table

| Project | Stars | What it is | Where `learn` differs |
| --- | --- | --- | --- |
| [Anki](https://github.com/ankitects/anki) | 31.3k | Atomic-fact SRS | Anki tests recognition of facts; you self-grade a revealed card. `learn` tests *skills* ("derive X", "write Y") with a typed answer, a reference hidden until frozen, and a syllabus behind it. |
| [Logseq](https://github.com/logseq/logseq) | 45.0k | PKM, AGPL, flashcards built in | Captures and links. No assessment model — no rubric, no confidence, no re-test ladder. |
| [Trilium](https://github.com/TriliumNext/Trilium) | 37.9k | Personal knowledge base, AGPL | Same: a place to put things, not a way to prove you know them. |
| [Obsidian Spaced Repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition) | 2.6k | Reviews notes you wrote | Nearest-in-mechanism competitor. No typed answer, no hidden reference, no confidence, no calibration, no error ledger. |
| [SilverBullet](https://github.com/silverbulletmd/silverbullet) | 6.1k | Markdown-vault platform, MIT | Closest *architectural* analogue (plain files, self-hosted, MIT). Different job: notes platform, not a tracker with an assessment model. |
| [Orbit](https://github.com/andymatuschak/orbit) | 1.8k | Matuschak's experimental SRS | Closest in *spirit*, but it is a hosted platform for authors embedding prompts for readers, and it is dormant. |
| [olmps/memo](https://github.com/olmps/memo) | 1.9k | Programming-oriented SRS | Card-shaped; no curriculum, no artefacts, no session bookends. |
| [frappe/lms](https://github.com/frappe/lms) | 3.2k | Institutional LMS, AGPL | Multi-user courses and enrolment. `learn` has no accounts and no server beyond localhost. |
| RemNote | closed | Notes + flashcards, cloud, paid | Closed, hosted, subscription. `learn` is MIT, offline, your files. |

The cell nobody else fills — and therefore the first row: **confidence captured before the answer, with a calibration readout**, and **a reference that is un-renderable until the answer is frozen** (enforced in the store, not the UI). Second: **"lasting" requires two clean passes ≥ 7 days apart** — nobody else models durability as requalification.

---

## 2. GitHub topics

Rules: **no more than 20**, **50 characters or less**, **lowercase letters, numbers and hyphens** ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)). Matching is *exact* — no stemming — so carry both halves of compounds and both spellings where two exist. Topic *pages* rank almost purely by stars; topic *search* is far more varied, which is why the tail pays. Ship 1–14; hold 15–20 in reserve.

| # | Topic | Size | Top repo | Reasoning |
| --- | --- | --- | --- | --- |
| 1 | `spaced-repetition` | 2,200 | fsrs4anki 4.1k | Highest-intent claimable term. |
| 2 | `active-recall` | 160 | 718 | Exact, tiny, precisely what the app does. |
| 3 | `self-hosted` | 36,027 | awesome-selfhosted | The audience's own word; needed for r/selfhosted credibility. |
| 4 | `local-first` | 21,595 | — | The architecture, with real 2025–26 momentum. |
| 5 | `study-tracker` | 140 | 244 | Literal category, weak incumbent. |
| 6 | `learning-tracker` | 36 | 3 | Unclaimed. Take the #1 slot. |
| 7 | `retrieval-practice` | 31 | — | Unclaimed, correct, signals seriousness. |
| 8 | `markdown` | 39,557 | markitdown 186k | The data promise; heavily browsed. |
| 9 | `fastapi` | 94,542 | fastapi 102k | Stack discovery + the awesome-fastapi path later. |
| 10 | `python` | 889k | — | Cheap, expected, how language filters work. |
| 11 | `react` | 531k | — | Same. |
| 12 | `srs` | 480 | Anki-Android 11.8k | Cheap exact-match for the flashcard crowd's shorthand. |
| 13 | `selfhosted` | — | — | The unhyphenated spelling; exact matching means you need both. |
| 14 | `study-planner` | 298 | 5.1k | Adjacent intent; incumbents are plan lists, not apps. |
| 15 | `personal-knowledge-management` | 1,055 | — | Reserve. Adjacent, slightly misdescribes the app. |
| 16 | `note-taking` | 3,892 | AppFlowy 76.9k | Reserve. True but not the point. |
| 17 | `learning-management-system` | 609 | frappe/lms 3.2k | Reserve. Only if you keep `personal-lms` (§5). |
| 18 | `knowledge-management` | 4,714 | Trilium 37.9k | Reserve. |
| 19 | `education` | 32,440 | freeCodeCamp 456k | Reserve. Huge and vague. |
| 20 | `flashcards` | 2,583 | Anki-Android 11.8k | **Reserve with a caveat** — brings people who want a card app. Add only once the comparison table is live to catch them. |

Apply with `gh repo edit Ihjas-tk/<repo> --add-topic spaced-repetition --add-topic active-recall …`.

---

## 3. README structure that works

Eleven READMEs pulled raw and measured today:

| Repo | Stars | Lines / words | First visual | Badges | Demo link |
| --- | --- | --- | --- | --- | --- |
| [Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF) | 92.6k | 70 / 307 | PNG, **L24** | L9–23, below H1 | none |
| [Memos](https://github.com/usememos/memos) | 63.2k | 72 / 336 | PNG, **L18** | L13–16 | yes, L11 |
| [Open Notebook](https://github.com/lfnovo/open-notebook) | 39.3k | 397 / 2253 | PNG, L57 | L4–7 | none |
| [Trilium](https://github.com/TriliumNext/Trilium) | 37.9k | 266 / 1513 | PNG, **L17** | L3–6 | none |
| [Khoj](https://github.com/khoj-ai/khoj) | 37.4k | 108 / 481 | **GIF**, L60 | L5–8 | cloud, L54 |
| [Sim](https://github.com/simstudioai/sim) | 29.7k | 166 / 805 | banner **L15** | L2–10 | yes, L23 |
| [Karakeep](https://github.com/karakeep-app/karakeep) | 29.2k | 125 / 943 | PNG, **L20** | L3–12, above H1 | `## Demo` L57 |
| [Docmost](https://github.com/docmost/docmost) | 21.7k | 63 / **178** | PNG, L34 | **none** | cloud, L15 |
| [Linkwarden](https://github.com/linkwarden/linkwarden) | 19.8k | 153 / 952 | hero **L24** | L6–14 | CTA L20 |
| [Wealthfolio](https://github.com/wealthfolio/wealthfolio) | 9.0k | **868 / 3776** | WEBP, L68 | L45–48 | none |
| [SilverBullet](https://github.com/silverbulletmd/silverbullet) | 6.1k | 128 / 757 | **none** | L1–5, above H1 | none |

What the concise winners share: a **screenshot within the first ~25 lines**, a **one-command install block by L30–40**, **four or fewer badges**, everything else linked out. The failure mode is visible in the two longest (Wealthfolio 868 lines, Open Notebook 397) — the install guide pasted inline. Docmost proves the floor: 178 words, zero badges, 21.7k stars; traction came from one positioning line, not the README.

Three of eleven run an explicit "why" section (`## Why Memos?`, `## ❓Why TriliumNext?`, `## Why did I build it?`); two run a comparison (Open Notebook's `vs Google NotebookLM` table at L74, *before* quickstart; Karakeep's prose `## Alternatives`). Alt text in the best is descriptive and keyword-bearing (Sim: `alt="Tables in Sim — structured data your agents can query"`); Linkwarden's hero has none.

### Recommended outline — target ~800 words, ~150 lines

| # | Section | Words | Contents |
| --- | --- | --- | --- |
| 0 | Badges — 3, above H1 | — | CI, license, Python version. Add `v/release` once tagged. |
| 1 | `# learn — a self-hosted study tracker that measures whether you actually know it` | 15 | Category keywords in the H1 text itself. |
| 2 | Tagline + keyword-dense paragraph | 60 | Name in prose: self-hosted, local-first, single-user, active recall, spaced re-test, confidence calibration, Markdown + YAML, git, FastAPI, React. |
| 3 | One-line CTA row | 10 | `**[Quick start](#quick-start)** · **[Why no streaks](#no-streaks)** · [Write your own track](docs/curriculum-schema.md)` |
| 4 | **Demo GIF by line ~20** | — | One 10–20 s loop: confidence slider → typed answer → freeze → reference revealed. Descriptive alt text. 2–3 static PNGs later. |
| 5 | `## Quick start` | 90 | Three lines: clone, `uv sync`, `uv run learn`. Docker compose immediately below. Everything else links out. |
| 6 | `## How it works` | 150 | The loop in five beats: pick a track → topic note → typed check with hidden reference → confidence + calibration → re-test ladder (2/7/21/60) → error ledger → session bookends. Your only genuinely novel content; give it the most room. |
| 7 | `## No streaks, no points, no badges` | 110 | The section people quote on HN. Frame as a design choice with evidence (§7) — not as "streaks are bad". |
| 8 | `## Your data` | 80 | Vault tree (6–8 lines), a frontmatter sample, "`git log` is your history", "no telemetry, no account, two optional AI calls with your own key". |
| 9 | `## Use it for any subject` | 70 | `tracks/starter/`, `tracks/linear-algebra/`, `learn check <track.yaml>`, link to the schema doc. This is what makes the repo reusable — keep it high. |
| 10 | `## Compared to Anki, Obsidian SR, Logseq, RemNote` | 110 | The §1 table trimmed to 5 rows. Keyword surface *and* the fastest way a reader self-qualifies. |
| 11 | `## Roadmap` / `## Contributing` / `## License` | 60 | Bullets and links only. |

Hard-cut at ~950 words.

### Keyword placement rules

1. **`About` is the highest-leverage field** — it is in the default search index and the README is not ([docs](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories)). Keyword-first, under ~220 chars; padding dilutes the match ratio ([Markepear](https://www.markepear.dev/blog/github-search-engine-optimization)).
2. **Repo name carries real weight** — `deep-learning-with-python-notebooks` outranks Keras (4× the stars) for its query; put the primary keyword early ([Infrasity 2026](https://www.infrasity.com/blog/github-seo)). See §5.
3. **Topics: ship 12–14 of the 20.** Exact match only; six is the credibility floor ([Nakora 2026](https://nakora.ai/blog/github-seo)).
4. **H1 + first 120 words** contain every target keyword once, in prose. README keyword tweaks barely moved *GitHub-internal* rank in Markepear's test — optimise the README for Google and humans, `About` and topics for GitHub search.
5. **Alt text**, descriptive and keyword-bearing: `alt="A typed check with the reference hidden and the confidence slider set to 70"`, `alt="Calibration readout: when you said 90%, you were right 62% of the time"`.
6. **Set the `homepage` field** to the schema doc — same metadata surface.

---

## 4. Trust and polish signals

**License — ship MIT.** Apache-2.0's patent grant, retaliation clause, NOTICE and state-changes requirements ([choosealicense](https://choosealicense.com/licenses/apache-2.0/)) buy protection against a risk a Markdown study tracker does not have, and add per-PR bookkeeping. AGPL exists to close the network-service loophole — irrelevant for a localhost single-user app ([FOSSA](https://fossa.com/resources/devops-tools/license-compatibility-checker/agpl-3-0-vs-mit/)). The pattern among comparable apps is clean: *hostable-for-others* goes AGPL ([immich](https://github.com/immich-app/immich) 114.6k, [karakeep](https://github.com/karakeep-app/karakeep) 29.2k, [mealie](https://github.com/mealie-recipes/mealie) 13.3k); *local-first / run-it-yourself* goes MIT or Apache-2.0 ([actual](https://github.com/actualbudget/actual) MIT 29.0k, [silverbullet](https://github.com/silverbulletmd/silverbullet) MIT 6.1k, [datasette](https://github.com/simonw/datasette) Apache-2.0 11.5k). `learn` is squarely the second group, and MIT is what its two nearest analogues chose. awesome-selfhosted accepts any FOSS license so this is not a gate there — but it must be a real `LICENSE` file, because r/opensource requires an OSI-listed license file to post at all.

**Badges — three, in this order: CI → license → Python.** Add `v/release` after tagging.

```
https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg?branch=main
https://img.shields.io/github/license/OWNER/REPO
https://img.shields.io/badge/python-3.12%2B-blue
https://img.shields.io/github/v/release/OWNER/REPO
```

Skip stars (already in the GitHub header, self-congratulatory at zero), "PRs welcome" (say it in CONTRIBUTING), and coverage until above ~70%. Badge value collapsed for anything fakeable ([ReadmeDesign](https://readmedesign.com/blog/anti-badge-backlash-github-profile), [daily.dev](https://daily.dev/blog/readme-badges-github-best-practices/)); shields' own tracker has an open [badge best practices](https://github.com/badges/shields/issues/2868) issue.

**Tag `v0.1.0` today.** Not vanity: awesome-selfhosted requires a tagged release *and* that the project "was first released more than 4 months ago" ([CONTRIBUTING](https://github.com/awesome-selfhosted/awesome-selfhosted-data/blob/master/CONTRIBUTING.md)) — the clock starts at your first tag, not your listing attempt. Releases also give watchers a releases-only subscription and expose `/releases.atom`, which selfh.st and update trackers poll ([docs](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)). Use **SemVer 0.x**, not CalVer: the vault's Markdown/YAML layout is a format contract users care about, and 0.x honestly signals "I may still break your vault schema" ([pydevtools](https://pydevtools.com/handbook/explanation/versioning-python-packages-semver-calver-and-pep-440/)). CHANGELOG in [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) form (`Added / Changed / Deprecated / Removed / Fixed / Security`, newest first, dated); paste each entry into the Release body.

**Hygiene — write four, defer four.** GitHub's [community profile](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories) (at `/community`) checks README, CODE_OF_CONDUCT, LICENSE, CONTRIBUTING, security policy, issue templates in `.github/ISSUE_TEMPLATE`, and a PR template. *Write:* README; `LICENSE`; `CONTRIBUTING.md` (~20 lines — `uv sync`, `npm i`, how to run pytest/vitest, "open an issue before a big PR"); **YAML issue forms** (`bug_report.yml` + `config.yml` with `blank_issues_enabled: false`) — forms are current practice over markdown templates ([docs](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)). *Cheap enough to add:* [Contributor Covenant 3.0](https://www.contributor-covenant.org/version/3/0/code_of_conduct/) (released 28 July 2025) — two-minute copy-paste, turns the checklist green. *Defer:* SECURITY.md (instead, one README line: "local-only, no auth by design — do not expose it to the internet"); PR template; `.github/FUNDING.yml` (a sponsor button on a zero-star repo reads as presumptuous).

**Social preview: 1280 × 640 PNG, under 1 MB.** GitHub: "at least 640 by 320 pixels (1280 by 640 pixels for best display)", "PNG, JPG, or GIF", "under 1 MB in size" ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview)). The trap: GitHub's 2:1 is **not** the OG standard — Slack, Discord, Facebook and LinkedIn follow 1.91:1 (1200 × 630) and X crops toward 16:9, so your top and bottom bands get trimmed. Keep all text inside the centre ~66% (a 1080 × 540 inset). What works: repo name large, the one-line tagline, and a *cropped detail* of one screen — the confidence slider or the calibration readout — never a full screenshot, which becomes mush at thumbnail size. Set it at Settings → General → Social preview; there is no other `og:image` override, and with nothing set GitHub auto-generates a card from `opengraph.githubassets.com` ([GitHub Blog](https://github.blog/news-insights/product-news/custom-open-graph-images-for-repositories/)).

**Demo GIF above the fold, then static PNGs.** An analysis of 116 top-starred READMEs found a single demo GIF produced the largest measured jump in "visual proof", and projects reaching 1,000 stars in month one "almost always include a demo GIF or video within the first 300 lines" ([screencli](https://screencli.sh/blog/add-demo-gif-github-readme)) — directional, not causal. Video in markdown does **not** work for files committed to the repo: GitHub renders video only for files uploaded through the web UI ([community #133813](https://github.com/orgs/community/discussions/133813)); caps are 10 MB for images and GIFs ([docs](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files)), but keep the hero under ~3 MB or it stalls on mobile. `vhs` is terminal-only and useless here — this is a web UI. Use **Playwright video recording** (`use: { video: 'on', size: {width:1280,height:720} }`, [docs](https://playwright.dev/docs/videos)), which regenerates deterministically when the UI changes and is already configured for e2e. Then:

```bash
ffmpeg -i demo.webm -vf "fps=12,scale=900:-1:flags=lanczos" frames/%04d.png
gifski --fps 12 --width 900 --quality 80 -o demo.gif frames/*.png
gifsicle -O3 --lossy=65 demo.gif -o demo.gif
```

Selig's 2025 benchmark: naive ffmpeg 409.4 MB → palettegen 45.8 MB → `gifsicle -O3 --lossy=65` **23.8 MB**, ~94% reduction ([post](https://christianselig.com/2025/08/high-quality-low-filesize-gifs/)). At 12 fps / 900 px / ~15 s you land around 2–3 MB.

**"Try it in 60 seconds."** uv is the default Python entry point in 2026 ([State of Python Packaging 2026](https://learn.repoforge.io/posts/the-state-of-python-packaging-in-2026/)). The entry point is a project command, so `uv run learn` is right — but `uv sync` first, or the first run is a silent multi-second install.

````markdown
## Quick start

```bash
git clone https://github.com/Ihjas-tk/<repo> && cd <repo>
uv sync                              # installs Python + deps
uv run learn init --track tracks/starter
uv run learn                         # opens http://127.0.0.1:8765
```
Your data lives in `vault/` — plain Markdown and YAML, committed to git. No account, no cloud.
````

**Ship a Dockerfile and compose file anyway**, immediately below. Docker Compose is the lingua franca of the self-hosted audience — the [2025 Self-Host User Survey](https://selfh.st/survey/2025-results/) (4,081 responses) assumes containers as the deployment layer, and self-hosted projects routinely field "please add a docker-compose.yml" requests. A ~15-line compose file with one bind mount for the vault costs an hour and is table stakes for r/selfhosted and awesome-selfhosted readers. Offer `uvx`/`pipx` only if you publish to PyPI — and `learn` is **taken on PyPI**, so a distribution needs another name (§5).

---

## 5. Name assessment

**`personal-lms` is free but weak.** 220 repos match `personal-lms in:name`; every one has 0–1 stars, so there is no collision worth worrying about, and `personal-lms` is free on PyPI. The problems are semantic:

- **"LMS" sets the wrong expectation** — Moodle, Canvas, frappe/lms: multi-user, enrolment, SCORM, grading *other people*. Reviewers benchmark against that and find it lacking, while the real differentiators (calibration, hidden references, the re-test ladder) are invisible in the category.
- **"personal-" reads as "someone's hobby repo"** — exactly the impression a launch must avoid.
- **The category has no search volume.** `learning-management-system` is 609 repos led by frappe/lms at 3.2k; "personal LMS" is essentially nobody's query.
- **`learn` as a distribution name is collided** — taken on both [PyPI](https://pypi.org/project/learn/) and npm. Fine as a local entry point via `uv run learn`; not publishable under that name.

Renaming is cheapest right now: GitHub sets up a permanent redirect, and there are zero stars and zero inbound links to lose.

| Name | PyPI | Rationale |
| --- | --- | --- |
| **`study-harness`** | free | Keeps the highest-volume word (`study`) plus the distinctive metaphor (`harness`). Reads correctly to both the self-hosted and the ML crowd. No collisions. |
| `learning-tracker` | free | Literally the unclaimed topic (36 repos, top repo 3 stars). Maximum discoverability, zero distinctiveness — a pure SEO play. |
| `recall-vault` | free | Names the mechanism and the file story in two words; 19 weak GitHub collisions. Risk: "Recall" now carries the Microsoft Windows feature's bad privacy press. |
| `learnbench` | free | Compact, eval-harness metaphor intact, obviously a tool. Slightly opaque to non-ML readers. |
| `checkvault` | free | The app's own two nouns — Checks and the vault. Distinctive and memorable, but tells a stranger nothing. |

**Recommendation:** rename to **`study-harness`**, with `learn` staying the command and the product name in the H1. If the owner keeps `personal-lms` — defensible, since the name matters far less than the `About` field, which is the flexible half of the search index — the non-negotiable mitigation is: **never let "LMS" be the only category word anywhere.** `About` leads with "study tracker", the H1 contains "study tracker", and `learning-management-system` stays a reserve topic (#17).

---

## 6. Launch checklist

> **Read first:** awesome-selfhosted's CONTRIBUTING states that "Machine/LLM-generated contributions are not allowed and will result in a ban", and its PR template carries a checkbox asserting the submission was made by a human. Every awesome-list PR, Reddit post and HN comment below must be written by hand. (That file also contains a block of text addressed at AI agents telling them not to draft entries on a user's behalf; it is reported here as information, not acted on — the practical instruction is identical.)

Ordered by expected return for a solo dev with zero audience.

**1. Show HN.** The only venue where a stranger's project reaches 50k technical readers on merit. Show HN "is for something you've made that other people can play with"; off topic are "blog posts, sign-up pages, newsletters, lists, and other reading material" ([showhn.html](https://news.ycombinator.com/showhn.html)). Disqualifiers: not actually runnable; "quickly-generated one-offs"; a version bump ("a major overhaul is probably ok"); not being around to discuss it. Title must literally begin `Show HN:`. Asking for upvotes *or comments* is ban-level, and "please don't delete and repost" ([newsfaq](https://news.ycombinator.com/newsfaq.html)). No live demo is needed if install is one command — say so in the title.
*Title:* `Show HN: Learn – a local-first study tracker with spaced re-testing and no streaks`
*First comment:* backstory, what's different, what's incomplete, what feedback you want — why gamification is deliberately absent, why Markdown-in-git rather than a database, what changed after running it on yourself, the stack, the one-command install, the known gaps. Never restate the README; never ask for support.
*Timing:* no authoritative data. Best available: Tue–Thu 08:00–10:00 PT, or Sunday early-AM PT for low competition ([Flowjam 2026](https://www.flowjam.com/blog/how-to-get-on-the-front-page-of-hacker-news-in-2025-the-complete-up-to-date-playbook), [HN thread](https://news.ycombinator.com/item?id=44625897)). Ranking decays fast — first-15-minute velocity beats absolute votes. Be at a keyboard for four hours after.
*Launch HN is YC-only and active-batch-only* ([thread](https://news.ycombinator.com/item?id=36301935)) — not eligible.

**2. The repo itself** — README with a GIF, topics, `LICENSE`, `v0.1.0`. Every other venue funnels here, and the tag starts the awesome-selfhosted four-month clock.

**3. r/selfhosted — New Project Megathread only, for now.** Rule 6 confines projects under three months old (from first public presence) to the megathread; Rule 5 restricts tool posts to **Wednesdays with the correct flair**; promoted apps must be "production ready and have docs" ([rules mirror](https://rankhog.com/subreddits/selfhosted)). A standalone post now is the most likely removal on this list. Full Wednesday post at month 3+.

**4. Mastodon (fosstodon-style FOSS instances).** Hashtags are followable, so `#FOSS #SelfHosted #OpenSource #SpacedRepetition #PKM` genuinely surface you to strangers — the highest-EV social channel at zero followers. Fosstodon is invite-only and its [rules](https://fosstodon.org/api/v1/instance/rules) ban "commercial promotions" and posts that are "exclusively links and/or which contain excessive hashtags"; a free MIT project with a real write-up is fine, a bare link with eight hashtags is not.

**5. Small awesome-list PRs** — easy merges, exact audience, evergreen. [awesome-fsrs](https://github.com/open-spaced-repetition/awesome-fsrs) (697★; the de-facto spaced-repetition list — no credible generic `awesome-spaced-repetition` exists, only a 1★ stub; strongest fit *if* you implement FSRS); [awesome-local-first](https://github.com/alexanderop/awesome-local-first) (230★, active Aug 2026, no formal CONTRIBUTING — PR the README); [awesome-note-taking](https://github.com/tehtbl/awesome-note-taking/blob/master/contributing.md) (970★; explicit entry format with 📖/🔁/🔒 icons, SPDX license, tech stack, commit within 12 months).

**6. dev.to build-log.** The design essay, not an announcement: the problem, the constraint (Markdown + git, no gamification), the learning-science reasoning, screenshots. Four tags max — `showdev`, `opensource`, `python`, `react`. Publish on your own surface first and set **`canonical_url`** back to it ([dev.to](https://dev.to/arikfr/cross-post-blog-posts-to-devto-414i)).

**7. [awesome-python-applications](https://github.com/mahmoud/awesome-python-applications/blob/master/CONTRIBUTING.md)** (18k★) — remit is literally "free software that works great, and also happens to be open-source Python". The one large Python list you qualify for. `vinta/awesome-python` (322k★) is explicitly "a shortlist, not a catalog" for *Python developers in Python work* — an end-user app fails; don't bother.

**8. r/Anki and the [Anki forums](https://forums.ankiweb.net/).** Perfect topical fit, highest tone risk. Post as "a different thing for a different job", never as an Anki replacement, and be humble about FSRS.

**9. r/opensource — allowed with the "Promotional" flair**, and the repo "MUST have a LICENSE file that MUST be an OSI listed Open Source license" ([rules](https://rankhog.com/subreddits/opensource)). No AI-generated content, no drive-by posting.

**10. Bluesky starter packs.** Hashtags are weak there; being added to dev/open-source [starter packs](https://theblue.social/starter-packs/category/software-development) is the discovery mechanism. Slow compounding, near-zero effort. X is the worst of the three at zero followers — no distribution without an existing graph.

**11. r/SideProject, Indie Hackers.** Low friction, low-signal traffic, no rule risk.

**12. Product Hunt.** Free, no hunter required (self-hunting is now standard). Day resets 12:01 AM PT; Tue–Thu for traffic, Fri–Sun for an easier badge. Asking for upvotes violates the rules. With zero audience and a free no-signup product, expect low EV — do it for the backlink and the badge.

**13. Obsidian forum "Share & showcase" / r/ObsidianMD.** Adjacent audience, but the Obsidian [code of conduct](https://forum.obsidian.md/faq) bans "exclusive self promotion". Only safe angle: "reads the Markdown in your vault", posted after participating elsewhere.

**14. awesome-selfhosted — month 4+.** Data lives in [awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data) as one YAML per project under `software/`. Requirements: one item per PR, first released **more than four months ago**, actively maintained, working installation instructions, a FOSS license from `licenses.yml` (MIT qualifies). A demo is **optional** and must be interactive if given (video demos rejected). A localhost single-user app **does** qualify — the exclusion is for "a desktop, mobile, or command-line application, which relies on a separate file synchronisation/server program", and a FastAPI server with a browser UI *is* the server. Describe it as a self-hostable **web application**, never a "local CLI tool", or it is closed on that clause.

**15. [awesome-fastapi](https://github.com/mjhea0/awesome-fastapi/blob/master/contributing.md)** — the maintainer "tend[s] to only add projects that are at least a year old". Month 12+. [Kludex/awesome-fastapi-projects](https://github.com/Kludex/awesome-fastapi-projects) (1.6k★) has a lower bar and can be done now.

**Do not post:** **r/learnprogramming** — "No app/website review requests/app showcases", and "self promotion from first time posters without prior participation in the subreddit is explicitly forbidden" ([rules](https://rankhog.com/subreddits/learnprogramming)). **r/productivity** — "Self-promotion is not allowed here in any form, even if asked for recommendations" ([rules](https://rankhog.com/subreddits/productivity)). **Lobsters** — invite-only, new users cannot submit unfamiliar domains, self-promo must be under a quarter of one's activity, and "personal productivity systems" is explicitly off-topic ([about](https://lobste.rs/about)).

*Reddit rules above come from a mirror because reddit.com was not directly fetchable here. Re-read each sidebar before posting — megathread and day-of-week rules change.*

---

## 7. What to say honestly

The repo's own `tracks/llm-engineering-and-evals/research/09-learning-science-features.md` holds the primary citations. Use them; do not paraphrase them into marketing.

**Safe to claim, citation inline:**

- *Practice testing is one of only two techniques rated **high utility** in a review of ten study techniques* (the other is distributed practice; summarising, highlighting and rereading were rated low) — [Dunlosky et al., PSPI 14(1), 2013](https://journals.sagepub.com/doi/abs/10.1177/1529100612453266).
- *Across 217 studies, practice testing beats restudy, **g = 0.61** [0.58, 0.65]* — [Adesope, Trevisan & Sundararajan, RER 87(3), 2017](https://journals.sagepub.com/doi/abs/10.3102/0034654316689306).
- *The benefit is a **delayed**-retention effect: restudy wins at five minutes and loses badly at two days and one week* — [Roediger & Karpicke, Psych Science 17(3), 2006](https://pubmed.ncbi.nlm.nih.gov/16507066/). This is the honest justification for the re-test ladder, and more persuasive than any general claim.
- *Generating an answer beats reading one, **d ≈ 0.40** across 86 studies* — [Bertsch et al., Memory & Cognition 35, 2007](https://link.springer.com/article/10.3758/BF03193441). This is why answers are typed and paste is off — not a style preference.
- *Immediate judgments of learning are driven by processing fluency and are near-chance; delayed ones are dramatically more accurate* — [Nelson & Dunlosky, Psych Science 2(4), 1991](https://journals.sagepub.com/doi/10.1111/j.1467-9280.1991.tb00147.x). The honest one-liner for the whole product: **a checkbox records a judgment of learning, not learning.**
- *High-confidence errors are corrected more reliably once feedback arrives — the hypercorrection effect* — [Butterfield & Metcalfe, JEP:LMC 27(6), 2001](https://pubmed.ncbi.nlm.nih.gov/11713883/), with the necessary caveat that they return unless a test follows the feedback ([Butler, Fazio & Marsh, PB&R 18, 2011](https://link.springer.com/article/10.3758/s13423-011-0173-y)) — exactly why an overconfident miss auto-schedules a re-test.

**Flag as contested when you say it:**

- *Tangible, performance-contingent rewards can undermine intrinsic motivation* — [Deci, Koestner & Ryan, Psych Bulletin 125(6), 1999](https://home.ubalt.edu/tmitch/642/articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf). Disputed by Cameron & Pierce; the modern synthesis is conditional ([Cerasoli, Nicklin & Ford 2014, k = 183, N = 212,468](https://selfdeterminationtheory.org/wp-content/uploads/2017/06/2014_Cerasoli_Intrinsic.pdf)). Say "we chose not to, and here is the argument and the counter-argument", not "gamification is bad".
- *Calibration as a benefit.* Certainty-based marking improved course appreciation but **not** summative exam scores in a controlled study ([Adv. Physiol. Educ., 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6544949/)). Say calibration is a **diagnostic, not a score** — which is also the design.

**Would read as hype — do not write it:**

- "Learn 2× faster", "remember forever", "scientifically proven", or "backed by learning science" as a bare badge. Name the technique and link the paper, or say nothing.
- **"Streaks are bad for you."** The one large field experiment — 60,000 students randomised — found streaks raised engagement (+9.4 pp on the intensive margin) and observed **no discouragement effect** ([Aulagnon, Cristia, Cueto & Malamud, IPR WP-26-05, Feb 2026](https://www.ipr.northwestern.edu/documents/working-papers/2026/wp-26-05.pdf)). The defensible line is a design one: *"No streaks — a streak measures attendance, and this app is trying to measure knowledge."* That is honest, it is the real reason, and it survives an HN comment thread. The evidence-based version would not.
- Any efficacy claim about **this app**. Nobody has evaluated `learn`. Always "the design follows X", never "users retain Y% more".
- "FSRS-grade scheduling" or "adaptive algorithm" while the ladder is a fixed 2/7/21/60. Describe it as a fixed ladder — the honesty is a feature to the Anki crowd, who will check.
- "Replaces Anki" / "an Anki alternative". It does not do atomic cards at volume, mobile, or shared decks. Let the comparison table say so in its own words.
- **`flashcards` as a topic before the comparison table is live** (§2, #20). Claiming the word without the context is the one piece of keyword work that would read as bait.

---

## Do this first — 12 items

1. Write `LICENSE` (MIT) and commit it. Nothing else on this list works without it.
2. Set the `About` description to the §1 wording; set `homepage` to the schema doc.
3. Add topics 1–14 from §2 via `gh repo edit --add-topic`.
4. Rewrite the README to the §3 outline: "study tracker" in the H1, ~800 words, everything else linked out.
5. Record the demo GIF with Playwright, compress under 3 MB, place it by line 20 with descriptive alt text.
6. Add 2–3 static screenshots from `learn/docs/ux/screens-v2/` (light) under `docs/assets/`.
7. Write `## No streaks, no points, no badges` using the §7 *design* framing, not the evidence framing.
8. Write the `## Compared to…` table from §1 — both the reader's qualifier and the competitor-keyword surface.
9. Add a Dockerfile and a ~15-line `docker-compose.yml` with one bind mount for the vault.
10. Add `.github/workflows/ci.yml` (pytest + vitest + build), three badges, CONTRIBUTING.md, a YAML issue form, Contributor Covenant 3.0.
11. Render the 1280 × 640 social preview — name, tagline, one cropped UI detail, all inside the centre 66% — and upload it in Settings → General.
12. Tag and publish `v0.1.0` with a Keep-a-Changelog entry. **Do this before anything else public: it starts the awesome-selfhosted four-month clock.**

Then, and only then, flip the repo public and post the Show HN.
