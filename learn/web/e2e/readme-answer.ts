/**
 * The one check the README's compare screenshot and the README's demo GIF both
 * walk through, and the answer typed into it. They live here so the two capture
 * specs cannot drift apart and tell the reader two different stories.
 *
 * `a1-rope-vs-learned` was picked because the prompt is one line, the reference
 * is prose rather than a page of code, and it renders to about eight lines in
 * the narrow compare column.
 */

/** Transformers from scratch. */
export const DEMO_MODULE = "a1";
/** RoPE, RMSNorm, SwiGLU and pre-norm as deltas from GPT-2. */
export const DEMO_TOPIC = "rope-deltas";
export const DEMO_CHECK = "a1-rope-vs-learned";

/**
 * A partly-correct answer in a learner's voice. It gets the first two rubric
 * lines and half of the third, and misses the last two: the rotation is applied
 * to q and k inside every attention layer rather than once before the first
 * block, and the answer never says the q-k product depends on the offset.
 */
export const DEMO_ANSWER =
  "Learned positional embeddings are a lookup table with one vector per position, " +
  "added to the token embedding at the input. RoPE adds nothing. It rotates the query " +
  "and key vectors by an angle that depends on the position, so the attention score " +
  "ends up depending on how far apart two tokens are rather than where each one sits. " +
  "I think the rotation is applied once before the first block.";

/** Self-marks against the five rubric lines, in order. */
export const DEMO_MARKS = ["met", "met", "partial", "missing", "missing"] as const;

export const DEMO_DIAGNOSIS =
  "I put the rotation once before the first block; it happens inside every attention " +
  "layer. I also never wrote down that the q-k product is a function of (m - n).";

export const DEMO_CATEGORY = "misremembered_mechanism";
