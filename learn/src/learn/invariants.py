"""The Tidy invariant checker (spec §7.1).

A pure function. Given the note the learner wrote and the note the model returned,
it decides whether the model stayed inside the copy-editor's remit. Everything the
model is forbidden to touch is extracted from both documents and compared as a
multiset: fenced code blocks (with their language tag), inline code spans, `$…$`
and `$$…$$` math, URLs, numbers, checklist items with their state, and blockquote
lines. On top of that, an output whose vocabulary is more than 10% new words is
rejected, which catches paraphrasing that slips past every structural check.

Structure comes from a real markdown parser (`markdown-it-py`); only the
line-shaped features markdown-it's CommonMark core does not model (task lists,
`$` math) fall back to regex, and those run over source text whose code blocks and
inline code have already been masked out by the parser's own token map.
"""

from __future__ import annotations

import re
from collections import Counter
from collections.abc import Callable, Iterable
from dataclasses import dataclass

from markdown_it import MarkdownIt

#: Share of new output word tokens above which a tidy is rejected (spec §7.1).
NEW_TOKEN_LIMIT = 0.10

_md = MarkdownIt("commonmark")

_INLINE_CODE = re.compile(r"(?<!`)(`+)(?!`)(.+?)(?<!`)\1(?!`)", re.DOTALL)
_DISPLAY_MATH = re.compile(r"\$\$(.+?)\$\$", re.DOTALL)
_INLINE_MATH = re.compile(r"(?<!\$)\$(?!\$)([^\n$]+?)(?<!\$)\$(?!\$)")
_BARE_URL = re.compile(r"\b(?:https?|ftp)://[^\s<>\]\)\"'`]+")
_CHECKLIST = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+\[([ xX])\]\s*(.*?)\s*$", re.MULTILINE)
_BLOCKQUOTE = re.compile(r"^\s*(>+)\s?(.*?)\s*$", re.MULTILINE)
_NUMBER = re.compile(r"\d+(?:[.,]\d+)*(?:[eE][+-]?\d+)?")
_ORDINAL = re.compile(r"(?:st|nd|rd|th)\b", re.IGNORECASE)
_WORD = re.compile(r"[0-9a-z]+(?:'[a-z]+)?")
_TRAILING_PUNCT = ".,;:!?"


@dataclass(frozen=True)
class InvariantResult:
    """The verdict on one tidy.

    `tokens_added` counts output word tokens that do not occur anywhere in the
    input; `new_token_share` is that count over the total number of output word
    tokens. Both are reported whether or not the tidy passed, because the UI
    shows them in the `stats` frame either way.
    """

    ok: bool
    reason: str | None
    tokens_added: int
    new_token_share: float


# ---------------------------------------------------------------- extraction


def _walk(tokens: Iterable) -> Iterable:
    for token in tokens:
        yield token
        if token.children:
            yield from _walk(token.children)


def _code_blocks(text: str) -> tuple[list[str], list[tuple[int, int]]]:
    """Fenced and indented code, as `"<lang>\\n<content>"`, plus their line spans."""
    blocks: list[str] = []
    spans: list[tuple[int, int]] = []
    for token in _md.parse(text):
        if token.type not in ("fence", "code_block"):
            continue
        lang = (token.info or "").strip() if token.type == "fence" else ""
        blocks.append(f"{lang}\n{token.content}")
        if token.map:
            spans.append((token.map[0], token.map[1]))
    return blocks, spans


def _inline_code(text: str) -> list[str]:
    return [t.content for t in _walk(_md.parse(text)) if t.type == "code_inline"]


def _link_targets(text: str) -> list[str]:
    """Link and image destinations, as the parser resolved them."""
    out: list[str] = []
    for token in _walk(_md.parse(text)):
        if token.type == "link_open":
            out.append(str(token.attrGet("href") or ""))
        elif token.type == "image":
            out.append(str(token.attrGet("src") or ""))
    return [url for url in out if url]


def _text_tokens(text: str) -> str:
    """Every text node joined. List markers, heading `#`s and link targets are gone."""
    return "\n".join(t.content for t in _walk(_md.parse(text)) if t.type == "text")


def _mask_code(text: str) -> str:
    """Blank out the lines occupied by code blocks, keeping line numbers stable."""
    _, spans = _code_blocks(text)
    lines = text.splitlines()
    for start, end in spans:
        for i in range(start, min(end, len(lines))):
            lines[i] = ""
    return "\n".join(lines)


def _prose(text: str) -> str:
    """Source text with code blocks blanked and inline code spans removed."""
    return _INLINE_CODE.sub(" ", _mask_code(text))


def _math(text: str) -> list[str]:
    """`$$…$$` first, then `$…$` over what is left, so display math is not split."""
    prose = _prose(text)
    display = [m.group(1).strip() for m in _DISPLAY_MATH.finditer(prose)]
    rest = _DISPLAY_MATH.sub(" ", prose)
    inline = [m.group(1).strip() for m in _INLINE_MATH.finditer(rest)]
    return display + inline


def _strip_math(text: str) -> str:
    return _INLINE_MATH.sub(" ", _DISPLAY_MATH.sub(" ", text))


def _urls(text: str) -> list[str]:
    """Parsed link destinations plus bare URLs left sitting in prose."""
    bare = [m.group(0).rstrip(_TRAILING_PUNCT) for m in _BARE_URL.finditer(_prose(text))]
    return sorted(_link_targets(text) + bare)


def _numbers(text: str) -> list[str]:
    """Numbers in prose. List markers and heading levels never reach a text node."""
    source = _strip_math(_text_tokens(text))
    out: list[str] = []
    for match in _NUMBER.finditer(source):
        if _ORDINAL.match(source, match.end()):  # 1st, 22nd, 3rd, 4th
            continue
        out.append(match.group(0))
    return out


def _checklist(text: str) -> list[str]:
    return [
        f"[{'x' if m.group(1).lower() == 'x' else ' '}] {m.group(2)}"
        for m in _CHECKLIST.finditer(_mask_code(text))
    ]


def _blockquotes(text: str) -> list[str]:
    return [
        f"{m.group(1)} {m.group(2)}" for m in _BLOCKQUOTE.finditer(_mask_code(text)) if m.group(2)
    ]


def _words(text: str) -> list[str]:
    return _WORD.findall(_prose(text).lower())


# ---------------------------------------------------------------- comparison


def _show(value: str, limit: int = 60) -> str:
    flat = " ".join(value.split())
    return flat if len(flat) <= limit else flat[: limit - 1] + "…"


def _diff(label: str, before: list[str], after: list[str]) -> str | None:
    """One human sentence naming the first difference, or `None` when they match."""
    left, right = Counter(before), Counter(after)
    if left == right:
        return None
    removed = sorted((left - right).elements())
    added = sorted((right - left).elements())
    if removed and added:
        return f"{label} changed: {_show(removed[0])!r} became {_show(added[0])!r}"
    if removed:
        return f"{label} was removed: {_show(removed[0])!r}"
    return f"{label} was added: {_show(added[0])!r}"


_CHECKS: tuple[tuple[str, Callable[[str], list[str]]], ...] = (
    ("a fenced code block", lambda t: _code_blocks(t)[0]),
    ("an inline code span", _inline_code),
    ("a math expression", _math),
    ("a URL", _urls),
    ("a number", _numbers),
    ("a checklist item", _checklist),
    ("a blockquote line", _blockquotes),
)


def check(original: str, edited: str) -> InvariantResult:
    """Compare a tidied note against the original. Pure; no I/O, no network."""
    before_words = set(_words(original))
    after_words = _words(edited)
    new_tokens = [w for w in after_words if w not in before_words]
    tokens_added = len(new_tokens)
    share = (tokens_added / len(after_words)) if after_words else 0.0

    for label, extract in _CHECKS:
        reason = _diff(label, extract(original), extract(edited))
        if reason:
            return InvariantResult(False, reason, tokens_added, share)

    if share > NEW_TOKEN_LIMIT:
        return InvariantResult(
            False,
            f"{share:.0%} of the words in the result do not appear in the note "
            f"(the limit is {NEW_TOKEN_LIMIT:.0%}); this reads as a rewrite, not a copy-edit",
            tokens_added,
            share,
        )
    return InvariantResult(True, None, tokens_added, share)
