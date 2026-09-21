# Required, optional and either/or resources

Plan · 2026-09-21 · Fable plans, Opus executes (two packages in parallel).

## Problem

A topic lists its resources flat, so the app presents every one as required. The flagship
track has lane choices ("Raschka ch 2-5 or CS336 Assignment 1, not both") that live as a chore
in another topic, and resources that belong on more than one topic (CS336 lectures 3-4 cover
RoPE, RMSNorm and SwiGLU but only `attention` lists them). The learner wants the pick-one rule
enforceable in the data and a required / optional tag in the UI.

## Schema additions (v2, backward compatible; every field optional)

Resource:
- `required: bool = true` — false = an optional extra. Optional resources never block a topic.
- `alternative_of: str | null` — id of another resource in the same track; this one substitutes
  for it. Alternatives form a group (the primary plus everything pointing at it); the group is
  satisfied when any member is done. `learn check` rejects an unknown id, a self-reference, a
  chain (an alternative of an alternative), and a group whose members disagree on `required`.
- `lane: str | null` — free label shown as a chip ("Raschka lane", "CS336 lane"). Display only.
- `focus: str | null` — one line shown under the title when a resource is reused on a topic with a
  narrower purpose ("lectures 3 and 4 only: RoPE, RMSNorm, SwiGLU").

Topic `resources` stays a list of ids. A resource may appear on several topics. The topic-level
rule: **finished** = every required primary is done, and for each alternative group any member is
done; optional resources are ignored. Exposed per source: `required`, `lane`, `alternative_of`,
`group` (the primary's id), `focus`. Exposed per topic: `required_total`, `required_done`.

## Package A — app (schema, derivation, UI)

curriculum.py models + validation; `derive.topic_state` takes the resource rows, not bare states;
`routers/common.py` exposes the fields; `learn/curriculum/schema.json` regenerated;
`docs/curriculum-schema.md` and `tracks/starter/track.yaml` show the fields; UI: source rows get a
`required` / `optional` tag, alternatives are drawn as one "pick one" group with the lane chip on
each member, and the topic header counts required sources ("2 of 3 required"). Tests everywhere.

## Package B — data (flagship track)

Review every module's topics against `tracks/llm-engineering-and-evals/README.md` (the syllabus)
and `research/`. Apply the two fixes the learner named (attention: Raschka ch 2-5 is
`alternative_of` CS336 lectures 1-4 with lanes; rope-deltas also lists CS336 lectures 1-4 with a
`focus` on lectures 3-4), then the same treatment across all 20 modules: mark optional extras,
express every "or" as an alternative group, put a resource on every topic it serves. Keep the
chore `pick-one-lane`. `learn check` must pass. Then copy the track over `learn/vault/track.yaml`.

## Order

A and B run in parallel (B uses the field names above). Then: regenerate schema, run suites,
copy the track into the vault, restart the server, commit, push.
