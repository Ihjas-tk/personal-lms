"""The three AI actions (spec §7). The only module in the app that imports `anthropic`.

The client is built lazily, so a missing credential never crashes startup and never
breaks any non-AI screen. Credential resolution is the SDK's own — `ANTHROPIC_API_KEY`,
then `ANTHROPIC_AUTH_TOKEN`, then any stored profile the SDK knows how to read.
`learn` also loads `learn/.env` at start-up (see `config.load_dotenv`), which is where a
learner is told to put the key; every "unavailable" message names that file.
"""

from __future__ import annotations

import json
import os
from collections.abc import AsyncIterator
from typing import Any

import anthropic

from . import store

MODEL = "claude-sonnet-5"
CRITIQUE_MAX_TOKENS = 8000
#: Effort is the bill. A copy-edit needs almost no thinking; a restructure needs some;
#: only the critique, which is graded against a rubric, is worth `high`.
TIDY_EFFORT = "low"
RESTRUCTURE_EFFORT = "medium"
CRITIQUE_EFFORT = "high"
#: `max_tokens` is sized to the note rather than flat, so a 200-word note cannot bill
#: for a 32000-token ceiling it was never going to use.
MAX_TOKENS_CAP = 32000
TIDY_FLOOR, TIDY_PER_WORD = 1500, 3
RESTRUCTURE_FLOOR, RESTRUCTURE_PER_WORD = 2000, 4
BETAS = ["server-side-fallback-2026-07-01"]
VERDICTS = ("met", "partial", "missing")
#: Every value `append_log` may write as `mode`; the ai-log readers enumerate these.
MODES = ("tidy", "restructure", "critique")

#: List price in dollars per million tokens, `(input, output)`. An unknown model
#: costs 0, so a model swap never invents a number; update this table with the model.
PRICES: dict[str, tuple[float, float]] = {"claude-sonnet-5": (2.00, 10.00)}

#: §6.3 — one sentence, said the same way everywhere it appears. The backticks are
#: literal: the client sets exactly those two spans in mono and never rewords the rest.
NO_CREDENTIAL = (
    "No API credential found. Put `ANTHROPIC_API_KEY=sk-ant-...` in `learn/.env`, "
    "or export ANTHROPIC_API_KEY, then restart learn."
)

TIDY_SYSTEM = """\
You are a careful copy-editor for a learner's personal study notes.

You change the note's PRESENTATION only. You never change its MEANING, and you
never improve it.

You MAY fix:
- spelling and punctuation;
- heading levels, so the hierarchy is consistent;
- list markers, so they are consistent;
- code fences: add a missing fence or a missing language tag;
- LaTeX delimiters, so inline maths uses $...$ and display maths uses $$...$$;
- paragraph breaks, including merging an accidentally split paragraph;
- an exact duplicate sentence, which you may delete.

You MUST NOT:
- add, remove or alter any claim, fact, number, name, example or citation;
- improve the wording of a sentence that is already grammatical;
- standardise terminology, expand an abbreviation, or replace one word with a
  better one;
- reorder sections, sentences or list items;
- expand contractions;
- change the learner's voice, or firm up a hedge ("I think", "maybe", "roughly").

Preserve byte-for-byte: every code block's contents and language tag, every
inline code span, every LaTeX expression, every URL and link target, every
number, every checklist item and its checked state, every blockquote line.
A number that looks mistyped ("3o", "1O", "5O0") stays exactly as written: the
checker compares digits, and correcting it will get the whole edit refused.

The note body is given to you without YAML frontmatter; do not emit any.
If the note is already clean, return it unchanged.

Output ONLY the resulting markdown body: no preamble, no commentary, and no
code fence wrapped around the whole document.
"""

RESTRUCTURE_SYSTEM = """\
You restructure a learner's own study notes into a version they will understand
quickly months from now.

The note was typed fast, usually while watching or reading the source named in the
context block above it. You lay out what is already there. You do not teach,
correct, extend or second-guess it.

WHAT YOU PRODUCE

1. A context block, first thing in the note: one blockquote, one line per source,
   written exactly as `> From: *<title>* (<kind>)`, or as
   `> From: [*<title>*](<url>) (<kind>)` when the context block gives a url; then one
   last line `> Module: <module title> · Topic: <topic title>`. Use only the titles,
   kinds and urls the context block gives you. If it names no source, write the
   module and topic line alone.
2. Then the learner's content, reorganised so its shape is visible:
   - headings (`##`, `###`) that name what sits under them;
   - bullet points for anything the note lists, one fact per bullet;
   - a short definition line for a term the note introduces, in the note's own words;
   - a compact markdown table when the note compares two or more things along the
     same axes, built only from what the note already says;
   - a line starting `Why it matters:` where the note itself says why something
     matters. Never invent the reason.

WHAT YOU MUST KEEP

Every claim, fact, number, name, example, definition and code block in the note
survives, in the learner's own words wherever those words carry the meaning. You may
add structure, headings, labels, list markers, the source lines, and short connective
wording ("so", "then", "in other words"). Nothing the note does not say may appear as
a fact.

Preserve byte-for-byte: every code block's contents and language tag, every inline
code span, every LaTeX expression, every URL, every number, every checklist item and
its checked state. A number that looks mistyped ("3o", "1O", "5O0") stays exactly as
written: the checker compares digits and will refuse the whole result.

Keep the learner's hedges — "I think", "maybe", "roughly", "not sure" — and keep
their voice. If a claim looks wrong to you, leave it exactly as it is: do not correct
it, do not soften it, and do not remark on it anywhere in the output. No asides to
the learner, no "(check this)", no HTML comments.

If the note has a `## Jots` section, it stays last and verbatim.

WHAT YOU MUST NOT DO

- add a fact, an example, a definition or a number the note does not contain;
- correct, improve, complete or annotate a claim;
- drop a sentence because it is rough, redundant or hard to place;
- summarise: the result says everything the note said, at least as fully;
- separate two things the note deliberately connects.

You may fix spelling and grammar.

The note body is given to you without YAML frontmatter; do not emit any.
Output ONLY the resulting markdown body: no preamble, no commentary, and no code
fence wrapped around the whole document.
"""

CRITIQUE_SYSTEM = """\
You grade a learner's explain-back answer against a rubric.

You are given the check's prompt, the rubric lines, a reference answer, and the
learner's answer.

The reference answer is a KEY for you only. DO NOT QUOTE IT, do not paraphrase
it, and do not reveal any part of it in your output. Use it only to judge whether
the learner's answer covers each rubric line.

For every rubric line, in order, return:
- rubric_index: the 0-based index of the rubric line;
- verdict: "met", "partial" or "missing";
- evidence: a short, exact quotation from THE LEARNER'S OWN ANSWER that supports
  the verdict. Quote nothing else. If the learner wrote nothing relevant, return
  an empty string.
- missing: one line naming what the answer does not establish, in the learner's
  own terms.

The "missing" line NAMES the gap; it never fills it. Never supply the missing
content, the correct derivation, the right number, or a hint that amounts to the
answer. "Does not say what happens to the mask before the softmax" is right;
"should say the mask adds -inf before the softmax" is not.

You do not grade the attempt overall. The learner's own self-grade is the
recorded score; your job is to give them something to compare it against.
"""

CRITIQUE_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "required": ["lines"],
    "properties": {
        "lines": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["rubric_index", "verdict", "evidence", "missing"],
                "properties": {
                    "rubric_index": {"type": "integer"},
                    "verdict": {"type": "string", "enum": list(VERDICTS)},
                    "evidence": {"type": "string"},
                    "missing": {"type": "string"},
                },
            },
        }
    },
}


class AIUnavailable(RuntimeError):
    """No usable Anthropic credential, or the API refused or could not be reached."""


_client: anthropic.AsyncAnthropic | None = None


def get_client() -> anthropic.AsyncAnthropic:
    """Lazily build the async client. Raises `AIUnavailable` when none can be built."""
    global _client
    if _client is None:
        try:
            _client = anthropic.AsyncAnthropic(max_retries=3, timeout=120.0)
        except anthropic.AnthropicError as exc:  # no credential resolvable at all
            raise AIUnavailable(NO_CREDENTIAL) from exc
    return _client


def reset_client() -> None:
    """Drop the cached client (used by tests and after a credential change)."""
    global _client
    _client = None


def status() -> tuple[bool, str]:
    """`(ai_available, ai_reason)` for `GET /api/health`. Cheap: never touches the network."""
    if os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"):
        return True, "ready"
    try:
        client = get_client()
    except AIUnavailable as exc:
        return False, str(exc)
    # SDK 1.x builds a client without any credential and only fails on the first
    # request, so "constructed" is not "usable": check what it actually resolved.
    if getattr(client, "api_key", None) or getattr(client, "auth_token", None):
        return True, "ready"
    return False, NO_CREDENTIAL


# ---------------------------------------------------------------- error mapping


def _mapped(exc: Exception) -> AIUnavailable:
    """One human sentence per SDK failure. Most specific subclass first."""
    if isinstance(exc, anthropic.AuthenticationError):  # 401
        return AIUnavailable(
            "Anthropic rejected the credential (401). Check the key in `learn/.env` "
            "or re-export ANTHROPIC_API_KEY."
        )
    if isinstance(exc, anthropic.NotFoundError):  # 404, usually a bad model id
        return AIUnavailable(f"Model {MODEL!r} is not available to this account (404).")
    if isinstance(exc, anthropic.RateLimitError):  # 429
        return AIUnavailable("Anthropic rate-limited this request (429). Try again in a moment.")
    if isinstance(exc, anthropic.APIStatusError):  # any other non-2xx
        return AIUnavailable(f"Anthropic API error {exc.status_code}: {exc.message}")
    if isinstance(exc, anthropic.APIConnectionError):  # offline, DNS, TLS
        return AIUnavailable(
            "Could not reach the Anthropic API. Everything except the AI actions works offline."
        )
    return AIUnavailable(f"Unexpected Anthropic client error: {exc}")


def _check_stop(final: Any, long_hint: str) -> None:
    """`refusal` and `max_tokens` both mean the content is not usable."""
    if final.stop_reason == "refusal":
        category = getattr(getattr(final, "stop_details", None), "category", "unknown")
        raise AIUnavailable(f"Claude declined this request ({category}).")
    if final.stop_reason == "max_tokens":
        raise AIUnavailable(long_hint)


def _text_of(final: Any) -> str:
    return "".join(block.text for block in final.content if block.type == "text")


def _usage(final: Any) -> tuple[int, int]:
    usage = getattr(final, "usage", None)
    return int(getattr(usage, "input_tokens", 0) or 0), int(getattr(usage, "output_tokens", 0) or 0)


def cost_usd(input_tokens: int, output_tokens: int, model: str = MODEL) -> float:
    """List price of one call in dollars, or 0 for a model the table does not know."""
    price_in, price_out = PRICES.get(model, (0.0, 0.0))
    return round((input_tokens * price_in + output_tokens * price_out) / 1_000_000, 6)


def budget(body: str, floor: int, per_word: int) -> int:
    """`max_tokens` for one pass over `body`: proportional, floored, capped."""
    return min(MAX_TOKENS_CAP, max(floor, per_word * len(body.split())))


# ---------------------------------------------------------------- tidy


async def tidy(body: str, violation: str | None = None) -> AsyncIterator[tuple[str, Any]]:
    """Copy-edit a note body.

    Yields `("delta", text)` for each streamed chunk, then exactly one
    `("done", {"text", "input_tokens", "output_tokens"})`. The invariant check and
    the SSE framing are the router's job; this function only talks to the API.
    `violation` is the checker's reason from a refused first pass; the router
    retries once with it so the model knows exactly what it must leave alone.
    """
    client = get_client()
    ask = "Copy-edit this note. Its meaning must be identical afterwards."
    if violation:
        ask += (
            f" A previous copy-edit of this note was refused because {violation}. "
            "Redo it and leave that exactly as it is written in the note, even if it "
            "looks like a typo."
        )
    try:
        async with client.beta.messages.stream(
            model=MODEL,
            max_tokens=budget(body, TIDY_FLOOR, TIDY_PER_WORD),
            thinking={"type": "adaptive"},
            output_config={"effort": TIDY_EFFORT},
            betas=BETAS,
            fallbacks="default",
            system=[
                {
                    "type": "text",
                    "text": TIDY_SYSTEM,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[
                {
                    "role": "user",
                    "content": ask + "\n\n<note>\n" + body + "\n</note>",
                }
            ],
        ) as stream:
            async for text in stream.text_stream:
                yield ("delta", text)
            final = await stream.get_final_message()
    except AIUnavailable:
        raise
    except Exception as exc:
        raise _mapped(exc) from exc

    _check_stop(
        final,
        "The note was too long to copy-edit in one pass. Tidy it section by section.",
    )
    input_tokens, output_tokens = _usage(final)
    yield (
        "done",
        {
            "text": _text_of(final),
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        },
    )


# ---------------------------------------------------------------- restructure


def _source_line(source: dict[str, Any]) -> str:
    title = str(source.get("title") or "").strip()
    kind = str(source.get("kind") or "").strip()
    url = str(source.get("url") or "").strip()
    return f"- {title} ({kind})" + (f" — {url}" if url else "")


def context_block(context: dict[str, Any]) -> str:
    """The module, topic and sources as the model sees them. One block, sent once."""
    lines = [
        f"module: {context.get('module_title') or ''}",
        f"topic: {context.get('topic_title') or ''}",
    ]
    sources = context.get("sources") or []
    lines.append("sources:" if sources else "sources: none")
    lines.extend(_source_line(s) for s in sources)
    return "\n".join(lines)


async def restructure(
    body: str, context: dict[str, Any], violation: str | None = None
) -> AsyncIterator[tuple[str, Any]]:
    """Re-lay a note body out, keeping everything it says.

    Same streaming shape as `tidy`: `("delta", text)` per chunk, then exactly one
    `("done", {...})`. `context` is `{module_title, topic_title, sources}` — the
    router builds it from the curriculum, and it travels once, in the user turn, so
    the cached system block stays byte-identical between calls.
    """
    client = get_client()
    ask = (
        "Restructure this note so it reads well months from now. "
        "Everything it says must survive."
    )
    if violation:
        ask += (
            f" A previous restructure of this note was refused because {violation}. "
            "Redo it and keep that exactly as it is written in the note, even if it "
            "looks like a mistake."
        )
    content = (
        f"{ask}\n\n<context>\n{context_block(context)}\n</context>\n\n<note>\n{body}\n</note>"
    )
    try:
        async with client.beta.messages.stream(
            model=MODEL,
            max_tokens=budget(body, RESTRUCTURE_FLOOR, RESTRUCTURE_PER_WORD),
            thinking={"type": "adaptive"},
            output_config={"effort": RESTRUCTURE_EFFORT},
            betas=BETAS,
            fallbacks="default",
            system=[
                {
                    "type": "text",
                    "text": RESTRUCTURE_SYSTEM,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": content}],
        ) as stream:
            async for text in stream.text_stream:
                yield ("delta", text)
            final = await stream.get_final_message()
    except AIUnavailable:
        raise
    except Exception as exc:
        raise _mapped(exc) from exc

    _check_stop(
        final,
        "The note was too long to restructure in one pass. Split it and try again.",
    )
    input_tokens, output_tokens = _usage(final)
    yield (
        "done",
        {
            "text": _text_of(final),
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        },
    )


# ---------------------------------------------------------------- critique


def _critique_message(prompt: str, rubric: list[str], reference: str, answer: str) -> str:
    lines = "\n".join(f"{i}. {line}" for i, line in enumerate(rubric))
    return (
        f"<check_prompt>\n{prompt}\n</check_prompt>\n\n"
        f"<rubric>\n{lines}\n</rubric>\n\n"
        f'<reference do_not_quote="true">\n{reference}\n</reference>\n\n'
        f"<learner_answer>\n{answer}\n</learner_answer>\n\n"
        f"Grade the learner's answer against each rubric line, in order."
    )


async def critique(prompt: str, rubric: list[str], reference: str, answer: str) -> dict[str, Any]:
    """Grade a submitted answer against the rubric.

    Returns `{"lines": [...], "input_tokens": int, "output_tokens": int}`. Structured
    output is enforced with a strict JSON schema and parsed server-side, so the router
    can emit the whole critique as one `done` frame.
    """
    client = get_client()
    try:
        async with client.beta.messages.stream(
            model=MODEL,
            max_tokens=CRITIQUE_MAX_TOKENS,
            thinking={"type": "adaptive"},
            output_config={
                "effort": CRITIQUE_EFFORT,
                "format": {"type": "json_schema", "schema": CRITIQUE_SCHEMA},
            },
            betas=BETAS,
            fallbacks="default",
            system=[
                {
                    "type": "text",
                    "text": CRITIQUE_SYSTEM,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[
                {
                    "role": "user",
                    "content": _critique_message(prompt, rubric, reference, answer),
                }
            ],
        ) as stream:
            async for _ in stream.text_stream:  # drained; the critique ships in one frame
                pass
            final = await stream.get_final_message()
    except AIUnavailable:
        raise
    except Exception as exc:
        raise _mapped(exc) from exc

    _check_stop(
        final,
        "The critique ran out of room. Shorten the answer or the rubric and try again.",
    )
    try:
        parsed = json.loads(_text_of(final))
    except json.JSONDecodeError as exc:
        raise AIUnavailable("Claude returned a critique that was not valid JSON.") from exc

    input_tokens, output_tokens = _usage(final)
    return {
        "lines": _clean_lines(parsed, len(rubric)),
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
    }


def _clean_lines(parsed: Any, rubric_len: int) -> list[dict[str, Any]]:
    """Coerce the model's rows to the frontend's shape and drop anything malformed."""
    rows = parsed.get("lines") if isinstance(parsed, dict) else None
    out: list[dict[str, Any]] = []
    for row in rows or []:
        if not isinstance(row, dict) or row.get("verdict") not in VERDICTS:
            continue
        try:
            index = int(row.get("rubric_index"))
        except (TypeError, ValueError):
            continue
        if rubric_len and not 0 <= index < rubric_len:
            continue
        out.append(
            {
                "rubric_index": index,
                "verdict": row["verdict"],
                "evidence": str(row.get("evidence") or ""),
                "missing": str(row.get("missing") or ""),
            }
        )
    return out


# ---------------------------------------------------------------- log


def append_log(
    mode: str,
    target: str,
    input_tokens: int = 0,
    output_tokens: int = 0,
    tokens_added: int = 0,
    accepted: bool = False,
) -> dict[str, Any]:
    """Append one row to `vault/ai-log.jsonl` (spec §7). `store` does the writing.

    `mode` is one of `MODES`. `estimated_cost_usd` is this call at `PRICES` list price;
    it is an estimate because it ignores cache reads, which only ever make it cheaper.
    """
    return store.append_ai_log(
        {
            "mode": mode,
            "target": target,
            "input_tokens": int(input_tokens),
            "output_tokens": int(output_tokens),
            "tokens_added": int(tokens_added),
            "accepted": bool(accepted),
            "estimated_cost_usd": cost_usd(int(input_tokens), int(output_tokens)),
        }
    )
