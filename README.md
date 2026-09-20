[![CI](https://github.com/Ihjas-tk/study-harness/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Ihjas-tk/study-harness/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/Ihjas-tk/study-harness)](LICENSE)
[![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-blue)](https://www.python.org/)

<p align="center">
  <img src="docs/assets/mark.svg" width="72" alt="learn's mark: a four-turn spiral">
</p>

# learn: a self-hosted study tracker that measures whether you actually know it

`learn` evaluates you the way you would evaluate a model. Point it at a curriculum and
every *"done when you can…"* line becomes a typed self-test, with the reference hidden
until you freeze your answer. Everything it records is Markdown and YAML in a git repo you
own. It is FastAPI and React on localhost, with no account and no streaks.

[Quick start](#quick-start) | [No streaks](#no-streaks-no-points-no-badges) |
[Write a track](docs/curriculum-schema.md) |
[Compared to Anki](#compared-to-anki-obsidian-spaced-repetition-logseq-remnote)

![Rating confidence, typing an answer from memory, then the hidden reference appearing beside it](docs/assets/demo.gif)

## Quick start

```bash
git clone https://github.com/Ihjas-tk/study-harness && cd study-harness/learn
uv sync                                      # deps and the `learn` command
(cd web && npm install && npm run build)     # the UI: required, see below
uv run learn init --track ../tracks/starter/track.yaml
uv run learn                                 # http://127.0.0.1:8765
```

From the repo root:

```bash
docker compose run --rm learn learn init --track /app/tracks/starter/track.yaml
docker compose up -d      # same address; ./vault is bind-mounted
```

The Node build is **required on a fresh clone**: the server serves the UI from the
git-ignored `learn/src/learn/static`, so without it every page 404s.

## How it works

**Point it at a curriculum.** A track is one YAML file of areas, phases, modules, topics,
resources and artefacts, with a **Check** behind every *done when you can…* line.

**Read where the source is.** A module is one page, laid out as a syllabus of topics.
**Focus mode** puts the video on the left, the note on the right, and a jot line
underneath.

**Say how sure you are, then answer from memory.** The slider cannot be skipped, and paste
and autocomplete are off for code checks. **Submit and freeze** ends the attempt.

![A frozen answer beside the revealed reference, with rubric lines self-marked](docs/assets/attempt-compare.png)

**Freezing reveals the reference**, which is not sent to the browser until your answer is
stamped. You mark the rubric yourself against the confidence you gave before you knew:
*you said 90%, you were right 62% of the time.*

**Then it comes back.** Re-tests land at 2, 7, 21 and 60 days, sooner if you missed
something you were sure of. **`lasting`** needs two clean passes seven days apart, making
it a requalification rather than a score you keep. Mistakes go to an append-only ledger.

![A module page with the topic syllabus, its sources and the hours budget](docs/assets/module.png)

## No streaks, no points, no badges

There is no percent-complete bar and no "mark as complete". The app counts core checks at
**solid** or **lasting**, and artefacts that exist.

This is a measurement choice rather than a health claim. A streak measures
attendance, which is not what I wanted to know. The evidence does not say streaks harm you:
a large randomised trial found they *raised* engagement with no discouragement effect
([Aulagnon et al., 2026](https://www.ipr.northwestern.edu/documents/working-papers/2026/wp-26-05.pdf)).

What replaced them has better evidence. Practice testing was one of only two techniques
rated high-utility in a review of ten
([Dunlosky et al., 2013](https://journals.sagepub.com/doi/abs/10.1177/1529100612453266)),
and its advantage shows up late: restudying wins after five minutes and loses badly after a
week ([Roediger & Karpicke, 2006](https://pubmed.ncbi.nlm.nih.gov/16507066/)). Nobody has
evaluated this app, and the design claims nothing on its own.

## Your data

```
vault/                             a git repo, made on first run
  track.yaml  plan.yaml            curriculum, dates, weekly budget
  errors.jsonl  ai-log.jsonl       append-only ledgers
  modules/<id>/notes/<topic>.md    one note per topic
  modules/<id>/attempts/*.md       one per attempt, answer frozen
  sessions/*.md                    reflection, the next if-then plan
```

```yaml
check_id: rag-eval-golden-set
confidence_pre: 70                 # taken before you saw anything
submitted: 2026-09-20T21:04:11
score: partial
category: conflated_two_things
```

`git log` is your history, and the app commits at each session close. **No telemetry, no
account.** Two optional AI actions use your own `ANTHROPIC_API_KEY`; nothing else needs one.
**It is local-only with no authentication, so keep it off the internet.**

## Use it for any subject

I built this for my own forty-week track, then made it work for any subject. Three
tracks ship here: [`starter`](tracks/starter/track.yaml), a commented template with every
optional field; [`linear-algebra`](tracks/linear-algebra/track.yaml), twelve weeks of
3Blue1Brown and Strang; and
[`llm-engineering-and-evals`](tracks/llm-engineering-and-evals/), the forty-week flagship.
Copy the starter and run `uv run learn check my-subject/track.yaml`, which prints
`field.path: what is wrong`, one line per error, instead of a traceback. Set
`debrief_day: Saturday` and the weekly debrief renames itself. Every field is in
[`docs/curriculum-schema.md`](docs/curriculum-schema.md).

## Compared to Anki, Obsidian Spaced Repetition, Logseq, RemNote

| Project | What it is | Where `learn` differs |
| --- | --- | --- |
| [Anki](https://github.com/ankitects/anki) | Atomic-fact SRS: FSRS, mobile, shared decks | Anki tests recognition from a revealed card. `learn` tests typed skills like "derive X", with the reference withheld until you freeze. It has no mobile app, no decks, and a fixed ladder instead of FSRS. |
| [Obsidian Spaced Repetition](https://github.com/st3v3nmw/obsidian-spaced-repetition) | Reviews notes you wrote | The nearest in mechanism, with no typed answer, hidden reference or calibration. |
| [Logseq](https://github.com/logseq/logseq) | PKM, flashcards built in | It captures and links well, with no assessment model, so no rubric, confidence or ladder. |
| [RemNote](https://www.remnote.com/) | Notes plus flashcards, hosted | It is closed, hosted and paid for. `learn` is MIT and runs offline. |
| [SilverBullet](https://github.com/silverbulletmd/silverbullet) | Markdown-vault platform, MIT | The closest architectural analogue, but a notes platform that assesses nothing. |

## Roadmap

- **FSRS scheduling**, alongside the fixed ladder.
- **An Ollama adapter**, so AI actions need no hosted key.
- **Spoken explain-back**, transcribed and graded against the rubric.
- **A concept graph** drawn from the curriculum rather than backlinks.
- **Curriculum import from Markdown**, so a syllabus you wrote becomes a track.

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) has the setup, the tests and the design constraints a PR
must respect. Open an issue before a big one. The operator manual is
[`learn/README.md`](learn/README.md).

## License

[MIT](LICENSE). Code of conduct: [Contributor Covenant 3.0](CODE_OF_CONDUCT.md).
