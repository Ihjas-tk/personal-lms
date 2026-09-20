"""The Tidy invariant checker (spec §7.1), on hand-written before/after pairs.

Every `edited` string below is what a *misbehaving* copy-editor might return. The
checker is the only thing standing between that and the learner's note, so each
forbidden edit gets its own case, and one honest copy-edit proves it is not simply
rejecting everything.
"""

from __future__ import annotations

from learn import invariants
from learn.invariants import check

NOTE = """\
# Attention

The mask is applied before teh softmax, with -1e9 in the masked slots

```python
def mask(scores, m):
    return scores + m  # additive, not multiplicative
```

Use `torch.masked_fill` when the mask is boolean. Cost is $O(n^2 d)$ per layer.

$$
A = \\mathrm{softmax}(QK^\\top / \\sqrt{d_k})V
$$

See https://arxiv.org/abs/1706.03762 for the original paper.

> Attention is all you need.
> We propose a new simple network architecture.

- [x] re-derive the shapes from memory
- [ ] write the backward pass

There are 8 heads and 512 model dimensions, so each head is 64 wide.
"""

CLEAN = NOTE.replace("teh softmax", "the softmax").replace("masked slots\n", "masked slots.\n")


def test_an_honest_copy_edit_passes() -> None:
    """Spelling and a missing full stop: nothing the checker guards was touched."""
    result = check(NOTE, CLEAN)
    assert result.ok, result.reason
    assert result.reason is None
    assert result.new_token_share <= 0.10


def test_a_changed_code_block_is_rejected() -> None:
    edited = CLEAN.replace("return scores + m", "return scores * m")
    result = check(NOTE, edited)
    assert not result.ok
    assert "fenced code block" in (result.reason or "")


def test_a_changed_language_tag_is_rejected() -> None:
    """The tag is part of the block: `python` becoming `py` is a content change."""
    edited = CLEAN.replace("```python", "```py")
    result = check(NOTE, edited)
    assert not result.ok
    assert "fenced code block" in (result.reason or "")


def test_a_changed_inline_code_span_is_rejected() -> None:
    edited = CLEAN.replace("`torch.masked_fill`", "`torch.where`")
    result = check(NOTE, edited)
    assert not result.ok
    assert "inline code span" in (result.reason or "")


def test_rewritten_math_is_rejected() -> None:
    edited = CLEAN.replace("$O(n^2 d)$", "$O(d n^2)$")
    result = check(NOTE, edited)
    assert not result.ok
    assert "math expression" in (result.reason or "")


def test_restating_display_math_in_prose_is_rejected() -> None:
    edited = CLEAN.replace(
        "$$\nA = \\mathrm{softmax}(QK^\\top / \\sqrt{d_k})V\n$$",
        "A is the softmax of the scaled scores times V.",
    )
    result = check(NOTE, edited)
    assert not result.ok
    assert "math expression" in (result.reason or "")


def test_a_changed_number_is_rejected() -> None:
    edited = CLEAN.replace("512 model dimensions", "768 model dimensions")
    result = check(NOTE, edited)
    assert not result.ok
    assert "a number" in (result.reason or "")


def test_a_changed_url_is_rejected() -> None:
    edited = CLEAN.replace("https://arxiv.org/abs/1706.03762", "https://arxiv.org/abs/1810.04805")
    result = check(NOTE, edited)
    assert not result.ok
    assert "a URL" in (result.reason or "")


def test_a_dropped_checklist_item_is_rejected() -> None:
    edited = CLEAN.replace("- [ ] write the backward pass\n", "")
    result = check(NOTE, edited)
    assert not result.ok
    assert "checklist item" in (result.reason or "")


def test_a_flipped_checklist_state_is_rejected() -> None:
    edited = CLEAN.replace("- [ ] write the backward pass", "- [x] write the backward pass")
    result = check(NOTE, edited)
    assert not result.ok
    assert "checklist item" in (result.reason or "")


def test_a_changed_blockquote_line_is_rejected() -> None:
    edited = CLEAN.replace("> Attention is all you need.", "> Attention is all that you need.")
    result = check(NOTE, edited)
    assert not result.ok
    assert "blockquote line" in (result.reason or "")


def test_more_than_ten_percent_new_words_is_rejected() -> None:
    """A paraphrase that keeps every guarded artefact still fails the vocabulary gate."""
    original = (
        "The mask is applied before the softmax.\n\n"
        "It stops a token from attending to its own future.\n"
    )
    edited = (
        "The mask is applied before the softmax.\n\n"
        "It prevents any given token from attending to positions that lie ahead of "
        "it within the sequence, which preserves causality throughout training.\n"
    )
    result = check(original, edited)
    assert not result.ok
    assert "do not appear in the note" in (result.reason or "")
    assert result.new_token_share > 0.10
    assert result.tokens_added > 0


def test_list_markers_headings_and_ordinals_are_not_numbers() -> None:
    """Renumbering an ordered list and the `1st`/`2nd` suffixes must not trip the checker."""
    original = "## 2 rules\n\n1. first\n1. second\n\nThe 1st pass is slow, the 2nd is fast.\n"
    edited = "## 2 rules\n\n1. first\n2. second\n\nThe 1st pass is slow, the 2nd is fast.\n"
    result = check(original, edited)
    assert result.ok, result.reason


def test_stats_are_reported_even_when_the_tidy_passes() -> None:
    """The `stats` frame is emitted for accepted tidies too, so the numbers must be real."""
    original = "the mask is applied before the softmax\n"
    edited = "The mask is applied before the softmax.\n"
    result = check(original, edited)
    assert result.ok, result.reason
    assert result.tokens_added == 0
    assert result.new_token_share == 0.0


# ------------------------------------------------------- spelling fixes vs rewrites


def test_spelling_fixes_do_not_count_towards_the_rewrite_limit() -> None:
    """A typo-heavy note corrected word for word is a copy-edit, not a rewrite."""
    original = (
        "# Tokaenization\n\nthere is muplte ways a model can snwer the question, "
        "aqnd the computaion is essentailly the same. Our of the 50 aybe 20 where coret."
    )
    edited = (
        "# Tokenization\n\nThere is multiple ways a model can answer the question, "
        "and the computation is essentially the same. Out of the 50 maybe 20 were correct."
    )
    result = invariants.check(original, edited)
    assert result.ok, result.reason
    # "muplte" → "multiple" is three edits away, so that one still counts as new.
    assert result.tokens_added == 1


def test_a_genuine_rewrite_is_still_refused() -> None:
    original = "the cat sat on the mat and looked at the dog for a while"
    edited = "a feline rested upon the rug while observing the hound briefly"
    result = invariants.check(original, edited)
    assert not result.ok
    assert "rewrite" in (result.reason or "")


def test_a_short_word_swap_is_not_a_spelling_fix() -> None:
    """cat → dog is one edit away from nothing in the note; cat → cot would be a fix."""
    assert not invariants._is_spelling_fix("dog", {"cat", "sat"})
    assert invariants._is_spelling_fix("cot", {"cat", "sat"})
    assert not invariants._is_spelling_fix("30", {"3o"})
