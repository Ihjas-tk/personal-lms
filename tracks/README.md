# Tracks

A **track** is one YAML file holding the areas, phases, modules, topics and resources of a
curriculum. Behind every `done when you can…` line sits a **Check**: a prompt, a rubric, and
a reference the app hides until you freeze your own answer. The app ships no content of its
own.

| Track | What it is |
| --- | --- |
| [`starter/`](starter/track.yaml) | The smallest curriculum that still exercises every part of the app: two areas, one phase, two modules. Every optional field appears once, with its default in the comment beside it. Copy this one. |
| [`linear-algebra/`](linear-algebra/track.yaml) | A twelve-week worked example in a subject with nothing to do with the flagship. It uses 3Blue1Brown videos, Strang's book and MIT 18.06, and you answer its checks with hand arithmetic. |
| [`llm-engineering-and-evals/`](llm-engineering-and-evals/) | The flagship: forty weeks of LLM engineering and AI evaluation, written for one learner's context. It ships with the [research](llm-engineering-and-evals/research/) it came from and a [prose syllabus](llm-engineering-and-evals/README.md). |

## Start from one

```bash
uv run learn init --track tracks/starter/track.yaml
uv run learn
```

`learn init` copies the track into your vault as `vault/track.yaml` and creates the folders
around it. The vault then owns its curriculum, so edit `vault/track.yaml` in place.

## Write your own

```bash
cp -r tracks/starter tracks/my-subject && uv run learn check tracks/my-subject/track.yaml
```

`learn check` prints `field.path: what is wrong`, one line per error, instead of a traceback.
Every field and default is documented in [`docs/curriculum-schema.md`](../docs/curriculum-schema.md).
