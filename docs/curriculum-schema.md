# Writing a track

A **track** is one YAML file. It is the only thing that makes the app about your
subject rather than someone else's: phases, modules, what to read, and — the part
that matters — the **checks** that decide whether you actually know it.

Nothing in the file is subject-specific machinery. Linear algebra, Old Norse,
sourdough and distributed systems all fit the same shape.

```bash
learn check tracks/starter/track.yaml            # validate it, see what is in it
learn init --track tracks/starter/track.yaml     # copy it into your vault
learn                                            # http://127.0.0.1:8765
```

`learn init` copies the file into `<vault>/track.yaml`. From then on the vault owns
its curriculum: edit `<vault>/track.yaml` in place and reload the page — the file is
re-read whenever its mtime changes, and a mistake surfaces as an error rather than
being swallowed.

Start from `tracks/starter/track.yaml`, which is this document as a commented file.
`tracks/linear-algebra/track.yaml` is a fuller worked example.

---

## 1. How the app finds your track

In order, first hit wins:

| # | Source | Example |
| - | ------ | ------- |
| 1 | `--curriculum` flag | `learn --curriculum tracks/starter/track.yaml` |
| 2 | `LEARN_CURRICULUM` | `LEARN_CURRICULUM=/path/track.yaml learn` |
| 3 | `<vault>/track.yaml` | what `learn init` writes; the normal case |
| 4 | `learn/curriculum/track.yaml` | the legacy in-repo copy, if it still exists |
| 5 | — | an error naming `learn init` |

The vault itself resolves as `--vault` → `LEARN_VAULT` → `./vault`.

---

## 2. The shape of the file

```
track.yaml
├── version, start_date, weekly_budget_hours, debrief_day
├── areas[]       — the columns of the Desk's ridge
├── phases[]      — chapters of the calendar, in weeks
├── modules[]     — a workspace page each
│   ├── topics[]     — the syllabus: ideas, chores, habits
│   ├── resources[]  — what you read or watch
│   └── checks[]     — what you must be able to do, cold
└── capstone[]    — artefacts that either exist or do not
```

Two rules hold the whole thing together:

* **Ids are local.** A module's `topics` may only name resources and checks declared
  in that same module. Module ids, phase ids, area ids and check ids are global and
  must be unique.
* **Every resource and check belongs to exactly one topic.** Anything you do not
  assign is filed into an implicit topic called `other` ("Also in this module") so it
  is never unreachable; anything assigned twice is an error.

---

## 3. Top-level keys

| Key | Type | Required | Default | What it does |
| --- | ---- | -------- | ------- | ------------ |
| `version` | int | no | `1` | `2` means the file uses `areas` and `topics`. Purely informational — the loader sniffs the shape, not the number. |
| `start_date` | date `YYYY-MM-DD` | **yes** | — | Week 1 is the week containing this date. Every soft date is derived from it. |
| `weekly_budget_hours` | float | no | `12` | Hours you intend to spend a week. Drives the hours bar and the "about N hours" button. |
| `debrief_day` | string | no | `"Sunday"` | The day the weekly review belongs to. Every "<day> debrief" label and the example IF-cue read it. |
| `areas` | list of Area | no | `[]` | The Desk ridge's columns. Omit and one area per phase is synthesised. |
| `phases` | list of Phase | no | `[]` | Chapters of the calendar. The largest `weeks[1]` across them is the track's length. |
| `modules` | list of Module | no | `[]` | The workspace pages. |
| `capstone` | list of CapstoneItem | no | `[]` | Artefacts. |

The track's **total weeks** is derived, never configured: it is the largest
`weeks[1]` over all phases and modules. A four-week track and a three-year one both
render; nothing in the app assumes a length.

### Area

One column on the Desk's ridge: a capability the track builds, counted separately so
there is never one number for the whole track.

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| `id` | string | **yes** | — |
| `title` | string | **yes** | — |
| `scope` | string | no | `""` — free text under the title, e.g. `la1 · la2` |

If you declare `areas`, **every module must set `area`** to one of these ids. If you
omit `areas` entirely, one area is created per phase and modules inherit their phase.
You cannot mix the two.

### Phase

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| `id` | string | **yes** | — |
| `title` | string | **yes** | — |
| `weeks` | `[first, last]`, 1-based inclusive | **yes** | — |
| `modules` | list of module ids | no | `[]` — the do-order for the phase |
| `order_note` | string | no | `null` — shown as the phase's blurb |

`modules` is a display order, not ownership: a module says which phase it is in via
its own `phase` field. Listing a module id that does not exist is an error.

### Module

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| `id` | string | **yes** | — |
| `phase` | phase id | **yes** | — |
| `area` | area id | **yes when `areas` is declared** | `""` |
| `track` | string | no | `""` — a free label, printed and nothing else |
| `title` | string | **yes** | — |
| `weeks` | `[first, last]` | **yes** | — must be exactly two numbers |
| `budget_hours` | float | no | `0` |
| `prerequisites` | list of module ids | no | `[]` |
| `must_cover` | list of strings | no | `[]` — v1 only, see §7 |
| `topics` | list of Topic | no | `[]` |
| `resources` | list of Resource | no | `[]` |
| `checks` | list of Check | no | `[]` |

`track` used to be a fixed set of labels. It is now any string you like — a
discipline (`geometry`), a mode (`theory` / `practice`), or nothing at all. The app
prints it under the module title and never branches on it.

`prerequisites` drives one warning: "needs <title> first", raised when no check in
the prerequisite module has reached solid.

### Topic

One line of the module syllabus.

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| `id` | string | **yes** | — |
| `title` | string | **yes** | — |
| `summary` | string | no | `""` |
| `kind` | `idea` \| `chore` \| `habit` | no | `idea` |
| `resources` | list of resource ids in this module | no | `[]` |
| `checks` | list of check ids in this module | no | `[]` |
| `derived` | bool | no | `false` — set by the loader; do not write it |

* **`idea`** — something to understand and then prove. It owns its sources, its note
  and the checks that close it. **An idea topic with no resources and no checks is an
  error**: a line that can never be finished has no business in the syllabus.
* **`chore`** — a one-off set-up task, ticked in the sidebar. Not scored.
* **`habit`** — a sentence you keep doing. Never ticked, never scored.

### Resource

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| `id` | string | **yes** | — |
| `title` | string | **yes** | — |
| `kind` | see below | **yes** | — |
| `url` | string | no | `null` |
| `est_minutes` | int | no | `0` |
| `length` | int | no | `null` — how long, in `unit` |
| `unit` | `min` \| `pages` \| `items` | no | `min` |
| `required` | bool | no | `true` — `false` is an optional extra |
| `alternative_of` | resource id | no | `null` — this one substitutes for that one |
| `lane` | string | no | `null` — a chip beside the title |
| `focus` | string | no | `null` — one line under the title |

**Resource kinds:** `paper`, `video`, `course`, `repo`, `doc`, `book`.

`length` + `unit` is the modern pair: a book is `length: 90, unit: pages`, a problem
set is `unit: items`, a video is `unit: min`. `est_minutes` is the fallback used when
`length` is absent, and it is what the session planner adds up.

#### Required, optional and either/or

A resource is **required** unless you say otherwise. `required: false` marks an extra:
it is listed, it is openable, it is tagged `optional` in the workspace, and it never
blocks a topic. Touching one still counts as having started the topic.

`alternative_of` names another resource in the track — any module — that this one
stands in for. The named resource is the **primary**; it plus everything pointing at it
is a **group**, and the group is satisfied as soon as any one member is finished. That
is how "Raschka chapters 2–5 **or** the CS336 lectures, not both" lives in the data
instead of in a chore. A group counts once toward the topic's required total, so a
topic with a two-way choice and nothing else reads "0 of 1 required", not "0 of 2".

`lane` is a free label (`Raschka lane`, `CS336 lane`) printed as a chip on each member,
so a choice says whose lane you are picking. `focus` is one line under the title, for a
resource that appears on several topics with a narrower purpose on this one
("lectures 3 and 4 only: RoPE, RMSNorm, SwiGLU"). Both are display only.

`learn check` refuses, in this order: an `alternative_of` that names a resource the
track does not have (`resource <id>: unknown alternative_of <target>`); one that names
itself (`resource <id>: alternative_of points at itself`); one that names another
alternative, since a group has exactly one obvious primary (`resource <id>:
alternative_of <target> is itself an alternative; point both at <primary>`); and a
group whose members disagree about `required`, which would make it half-owed
(`resource <id>: required must match <target>, the primary of its alternative group`).

```yaml
topics:
  - id: attention
    title: Causal self-attention
    resources: [cs336-lec-1-4, raschka-ch-2-5, blog-annotated, cs336-lec-1-4-rope]
resources:
  - {id: cs336-lec-1-4, title: CS336 lectures 1–4, kind: video, lane: CS336 lane}
  - {id: raschka-ch-2-5, title: "Raschka, ch 2–5", kind: book, lane: Raschka lane,
     alternative_of: cs336-lec-1-4}          # do either one, not both
  - {id: blog-annotated, title: The Annotated Transformer, kind: doc, required: false}
  - {id: cs336-lec-1-4-rope, title: CS336 lectures 1–4, kind: video,
     focus: "lectures 3 and 4 only: RoPE, RMSNorm, SwiGLU"}   # reused, narrower here
```

### Check

The only thing that moves the ridge.

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| `id` | string | **yes** | — |
| `module` | module id | **yes** | — must equal the id of the module it sits in |
| `type` | see below | **yes** | — |
| `prompt` | string | **yes** | — what you must do, from memory |
| `rubric` | list of strings | no | `[]` — one line per thing you mark yourself |
| `reference` | string | no | `""` — hidden until you freeze your answer |
| `must_cover` | bool | no | `true` |
| `known_prior` | bool | no | `false` |
| `est_minutes` | int | no | `0` |
| `draft` | bool | no | `false` |

**Check types:**

| Type | What it asks for |
| --- | --- |
| `explain` | Say it back from memory, in prose, to someone who does not know it. |
| `code` | Write working code from memory. Paste and autocomplete are disabled. |
| `derive` | Work it out step by step, usually on paper. |
| `numeric` | Produce a number and show the arithmetic. |
| `judge` | Mark someone else's work against a standard, and say why. |

Three flags decide how a check is counted:

* **`must_cover: true`** (the default) makes the check *core*. Coverage, the ridge and
  "N of M checks are yours" count core checks at solid or lasting, and nothing else.
  Set it to `false` for enrichment you want available but not owed.
* **`known_prior: true`** says you already knew this before the track started. It is
  still attemptable and still scheduled; it is excluded from "what the track bought
  you" so old knowledge cannot be claimed as new progress.
* **`draft: true`** says the reference answer has not been verified by a human. The
  check shows "reference not yet checked by you" until you read the reference,
  satisfy yourself that it is right, and delete the line. AI-drafted references must
  carry this flag.

The `reference` is never sent to the browser by any `GET`. It appears in exactly two
responses: freezing an answer, and submitting one. The store enforces that, not the UI.

### CapstoneItem

| Field | Type | Required | Default |
| --- | --- | --- | --- |
| `id` | string | **yes** | — |
| `title` | string | **yes** | — |
| `modules` | list of module ids | no | `[]` |
| `description` | string | no | `""` |

An artefact exists or does not. There is no percentage and no partial credit.

---

## 4. What `learn check` enforces

Beyond the field types:

* unique ids for modules, phases, areas and checks;
* `weeks` is exactly two numbers;
* every `module.phase` names a real phase, every `prerequisite` a real module, every
  id in `phase.modules` a real module;
* when `areas` is declared, every module sets a real `area`;
* a check's `module` matches the module it is written in;
* a topic's `resources` and `checks` name ids in the same module, and no id is
  claimed by two topics;
* an `idea` topic has at least one resource or one check;
* every `alternative_of` names a real resource, is not the resource itself, is not
  another alternative, and agrees with its primary about `required`.

Failures print as `path.to.field: message`, one per line, and exit 1. A valid file
prints one summary line and exits 0.

---

## 5. The machine-readable schema

`learn/curriculum/schema.json` is JSON Schema (draft 2020-12), generated from the
same pydantic models the app validates with:

```bash
learn schema            # regenerate learn/curriculum/schema.json
learn schema --check    # exit 1 if the committed file has drifted
learn schema --out /tmp/x.json
```

`tests/test_cli_schema.py` runs `--check`, so the committed file cannot fall behind
the models. Point your editor's YAML language server at it for completion.

---

## 6. A worked example

A complete, valid file in thirty lines — one module, one topic, one source, one
check, one artefact:

```yaml
version: 2
start_date: 2026-10-05
weekly_budget_hours: 5
debrief_day: Saturday

areas:
  - {id: core, title: The core idea, scope: m1}

phases:
  - {id: p1, title: Week one, weeks: [1, 2], modules: [m1]}

modules:
  - id: m1
    phase: p1
    area: core
    title: Bayes' rule
    weeks: [1, 2]
    budget_hours: 5
    topics:
      - {id: rule, title: Why the denominator is there, resources: [r1], checks: [c1]}
    resources:
      - {id: r1, title: '3Blue1Brown, Bayes theorem', kind: video, length: 15, unit: min}
    checks:
      - id: c1
        module: m1
        type: derive
        prompt: From the definition of conditional probability, derive Bayes' rule.
        rubric: [Starts from P(A and B) written two ways, Solves for P(A|B), Names each term]
        reference: P(A|B)P(B) = P(A and B) = P(B|A)P(A), so P(A|B) = P(B|A)P(A) / P(B).

capstone:
  - {id: cap, title: 'A one-page explanation, written cold', modules: [m1]}
```

---

## 7. v1 files

A file written before `areas` and `topics` existed still loads, unchanged:

* with no `areas`, one area is synthesised per phase and each module inherits its
  phase, so the Desk's ridge still draws;
* with no `topics`, each `must_cover:` line on the module becomes an `idea` topic of
  its own (`derived: true`);
* every resource and check then lands in the implicit `other` topic.

Those derived topics have no sources and no notes of their own, so a v1 file gets the
old flat module page rather than a syllabus. Prefer v2: write `topics` and let them
own their resources and checks. `must_cover` on a module is ignored once `topics` is
present — the field name collides with the per-check `must_cover` flag, which is
unrelated and still very much in use.
