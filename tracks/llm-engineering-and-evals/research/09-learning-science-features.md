# Learning-Science Feature Design for a Personal, Local LMS
### One self-directed adult learner · 40-week LLM-engineering + AI-evaluation track · 10–15 hrs/week
**Prepared 2026-09-19.** Every claim below carries a source URL and a date. Where evidence is weak, contested, or absent, this is stated explicitly rather than smoothed over.

---

## TL;DR

**Build (in order):** typed free-recall Checks that replace every "done when you can…" checkbox, with the reference answer hard-gated behind a submitted response · delayed re-tests and a `durable` state (two passes, ≥7 days apart) instead of "mark complete" · a three-tier spaced queue (FSRS only for atomic facts, a successive-relearning ladder for Checks, interleaved weekly review for modules) · confidence-before-answer with a Brier read-out and an auto-retest rule for high-confidence misses · an error ledger that demands a written diagnosis · an artefact board plus a single "next action" line · session bookends (warm-up retrieval in, reflection + if-then plan out) · generative note blocks with short interrogative conceptual prompts · a resource ladder ending in `taught` · system-imposed video pauses · backward-faded worked examples with principle prompts, and a paste-disabled blank-page editor.

**Do not build:** points/badges/XP · leaderboards · a daily streak as the primary mechanic · a single 40-week progress bar · an "AI, summarise/rewrite this" button · "mark complete" · an adaptive path that reorders your own syllabus · daily study notifications · hours-studied as the headline metric · a rich analytics dashboard · anything justified by the Zeigarnik effect · highlighting · multiple-choice quiz generation as the default.

**Three claims this report explicitly refuses to make**, because the evidence is absent or refuted: that handwriting beats typing for notes (meta-analytic g = 0.04, equivalent to zero); that "the Feynman technique" as a named method has been validated (it has not — its *components* have); and that retyping code teaches more than copy-pasting it (no controlled study appears to exist; the no-paste editor is justified by theory and by the Anthropic RCT, not by a direct experiment). A fourth: the popular claim that streaks cause abandonment is **under-evidenced** — the only large field experiment found no discouragement effect. Streaks are deprioritised here for fit reasons (a weekly-budget learner), not because they are known to backfire.

---

## 0. The three design principles everything else follows from

**P1 — Performance during study is not learning.** Soderstrom & Bjork's integrative review is the cleanest statement: conditions that make study feel fluent and fast (rereading, highlighting, watching, copy-pasting working code) inflate immediate performance and depress long-term retention and transfer; conditions that introduce *desirable difficulties* (spacing, interleaving, retrieval, generation, variation) do the reverse. Soderstrom & Bjork, *Learning versus Performance: An Integrative Review*, Perspectives on Psychological Science 10(2):176–199, March 2015 — https://journals.sagepub.com/doi/abs/10.1177/1745691615569000. Practical consequence: **the app must never optimise for the feeling of progress.** Its job is to make the effortful thing the path of least resistance.

**P2 — The learner cannot be trusted to grade himself by feel.** Self-assessment correlates only moderately with objective performance (mean r ≈ .29 across 22 meta-analyses; Zell & Krizan, *Do People Have Insight Into Their Abilities? A Metasynthesis*, Perspectives on Psychological Science 9(2):111–125, March 2014 — https://doi.org/10.1177/1745691613518075), and physician self-assessment against observed competence was essentially uncorrelated in a systematic review of 20 studies (Davis et al., *Accuracy of Physician Self-assessment Compared With Observed Measures of Competence*, JAMA 296(9):1094–1102, 6 Sep 2006 — https://jamanetwork.com/journals/jama/fullarticle/203258). Worse for this learner specifically: the **illusion of explanatory depth** is strongest precisely for *mechanistic/explanatory* knowledge — exactly what "explain why RoPE extrapolates" is (Rozenblit & Keil, *The misunderstood limits of folk science*, Cognitive Science 26(5):521–562, Sep 2002 — https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog2605_1). Practical consequence: **a "done when you can…" checkbox is a lie detector with no teeth.** It must be converted into a produced artefact.

**P3 — Effort that the AI removes is learning that does not happen.** Anthropic's January 2026 RCT is the sharpest evidence available and is directly about this learner's domain (engineers learning an unfamiliar Python async library). Practical consequence: **every AI affordance in the app must be a question-asker or a critic, never a producer.** Detail in §D.

---

## A. Ranked feature list

Ranking is by (expected learning value × confidence in the evidence) ÷ build cost for a solo local app.

---

### A1. "Done when you can…" → **Free-recall Checks with typed answers** (build first)
**Rank 1. Confidence: very high. Expected effect: large.**

**Evidence.**
- Practice testing is one of only two techniques rated *high utility* in the Dunlosky et al. review of 10 study techniques (the other is distributed practice); summarising, highlighting, rereading and imagery were rated *low*. Dunlosky, Rawson, Marsh, Nathan & Willingham, *Improving Students' Learning With Effective Learning Techniques*, Psychological Science in the Public Interest 14(1):4–58, Jan 2013 — https://journals.sagepub.com/doi/abs/10.1177/1529100612453266 (open PDF: https://gwern.net/doc/psychology/spaced-repetition/2013-dunlosky.pdf); summary of the utility ratings: https://www.kent.edu/psychology/all-study-strategies-not-created-equal-according-kent-state-researchers (Jan 2013).
- Meta-analysis of 217 studies: practice testing beats restudy and all other comparison conditions, **g = 0.61 [0.58, 0.65]**, with g ≈ 0.51 the most conservative estimate. Adesope, Trevisan & Sundararajan, *Rethinking the Use of Tests: A Meta-Analysis of Practice Testing*, Review of Educational Research 87(3):659–701, Jun 2017 — https://journals.sagepub.com/doi/abs/10.3102/0034654316689306; accessible summary https://www.learningscientists.org/blog/2017/2/9-1 (9 Feb 2017).
- The effect is a *delayed-retention* effect, not an immediate one: repeated study beat repeated testing at a 5-minute delay and lost badly at 2 days and 1 week. Roediger & Karpicke, *Test-Enhanced Learning*, Psychological Science 17(3):249–255, Mar 2006 — https://pubmed.ncbi.nlm.nih.gov/16507066/ (PDF: https://colinallen.dnsalias.org/Readings/2006_Roediger_Karpicke_PsychSci.pdf).
- Retrieval beats *elaborative* study even on comprehension/inference questions and even when the outcome measure is concept-mapping itself. Karpicke & Blunt, *Retrieval Practice Produces More Learning than Elaborative Studying with Concept Mapping*, Science 331(6018):772–775, 11 Feb 2011 — https://pubmed.ncbi.nlm.nih.gov/21252317/ (PDF: https://learninglab.psych.purdue.edu/downloads/2011/2011_Karpicke_Blunt_Science.pdf).
- **Typed/constructed answers beat checkboxes and beat recognition.** Generating an answer beats reading it, d ≈ 0.40 across 86 studies / 445 effect sizes (Bertsch, Pesta, Wiscott & McDaniel, *The generation effect: A meta-analytic review*, Memory & Cognition 35:201–210, 2007 — https://link.springer.com/article/10.3758/BF03193441, PDF https://mcdaniel97.github.io/Publications/Bertsch%20et%20al.%202007.pdf). With corrective feedback, short-answer initial tests transfer better than multiple-choice ones (Kang, McDermott & Roediger, *Test format and corrective feedback modify the effect of testing on long-term retention*, European Journal of Cognitive Psychology 19(4–5):528–558, 2007 — https://profiles.wustl.edu/en/publications/test-format-and-corrective-feedback-modify-the-effect-of-testing-/).
- **A checkbox is not a self-test at all.** See P2 above (Zell & Krizan 2014; Davis 2006; Rozenblit & Keil 2002). A tick records a *judgment of learning*, and immediate JOLs are driven by processing fluency rather than by future recallability (Nelson & Dunlosky, *When People's Judgments of Learning (JOLs) Are Extremely Accurate at Predicting Subsequent Recall: The "Delayed-JOL Effect"*, Psychological Science 2(4):267–270, Jul 1991 — https://journals.sagepub.com/doi/10.1111/j.1467-9280.1991.tb00147.x).
- Caveat worth knowing: van Gog & Sweller argued the testing effect shrinks or vanishes as material complexity ("element interactivity") rises — relevant to a transformer derivation (*Not New, but Nearly Forgotten*, Educational Psychology Review 27(2):247–264, Jun 2015 — https://link.springer.com/article/10.1007/s10648-014-9310-2). Karpicke & Aue rebutted this convincingly: element interactivity was never quantified, and studies showing retrieval benefits with complex materials were omitted (*The Testing Effect Is Alive and Well with Complex Materials*, Educational Psychology Review 27:317–326, Jun 2015 — https://link.springer.com/article/10.1007/s10648-015-9309-3, PDF https://learninglab.psych.purdue.edu/downloads/2015/2015_Karpicke_Aue_EDPR.pdf). Net: proceed, but expect retrieval of *complex* material to need scaffolds (§A12).

**Mapping to this material.** Every "done when you can…" line becomes a **Check** — a first-class object with a type, not a checkbox:
| Check type | Example from the track | What the app captures |
|---|---|---|
| `code-blank-page` | "write multi-head causal attention from memory with a correct mask" | an editor with no autocomplete, no internet, timer; output saved as a versioned snippet; then a diff against the reference |
| `explain` | "explain why RoPE extrapolates" | free-text box, min ~120 words, written before any reference is opened |
| `derive` | "derive the gradient of softmax cross-entropy" | scratch area (LaTeX or photo-of-paper upload) |
| `judge` | "given these 20 LLM-judge disagreements, produce an error taxonomy" | a worked artefact |
| `numeric` | "compute the CI width you need for n=200 eval items" | typed number + shown working |

**Implementation notes (solo local app).**
- Data model: `Check { id, module_id, prompt, type, reference_answer_md, rubric[], attempts[] }`; `Attempt { started_at, submitted_at, response_text, self_grade, confidence_pre, confidence_post, duration_s, graded_by }`.
- **Hard rule: the reference answer is not renderable until `response_text` is non-empty and `submitted_at` is set.** Enforce in the store, not the UI.
- Grading: self-grade against a 3–5 point rubric *stored with the check*, plus optional AI-as-critic (§D). Score on a 0/1/2 scale (`can't`, `partial`, `fluent`) — not a percentage; percentages invite rounding-up.
- Retain every attempt. The diff between attempt 1 and attempt 3 of "write MHA from memory" is the single most motivating artefact the app can show (§A7).
- No timer pressure by default, but do record duration — time-to-fluency is a better progress signal than a tick.

---

### A2. **Delayed re-test as a separate, scheduled object** (not "mark complete")
**Rank 2. Confidence: very high. Expected effect: large, and it is what makes A1 stick.**

**Evidence.** The testing effect *is* a delay effect (Roediger & Karpicke 2006, above). The durable version is **successive relearning**: retrieval to a criterion, repeated across spaced sessions. Rawson & Dunlosky report it as among the most potent and underused techniques, and note that over-learning within a single session is largely wasted once spaced relearning sessions follow (Rawson & Dunlosky, *Successive Relearning: An Underexplored but Potent Technique for Obtaining and Maintaining Knowledge*, Current Directions in Psychological Science 31(4), Jul 2022 — https://journals.sagepub.com/doi/full/10.1177/09637214221100484; classroom applications: Dunlosky & Rawson, *Practice Tests, Spaced Practice, and Successive Relearning*, Scholarship of Teaching and Learning in Psychology, 2015 — https://www.apa.org/pubs/journals/features/stl-0000024.pdf).

**Implementation notes.** A Check is never "done". Its states are `unattempted → attempted(score) → relearn-due(date) → durable`. `durable` requires **two correct attempts in separate sessions at least 7 days apart** (criterion borrowed directly from successive-relearning protocols). Module completion should require *durable* on the must-cover checks, not *attempted*. This one rule does more than any scheduling algorithm.

---

### A3. **A spaced review queue — but scoped, and FSRS only for the atomic layer**
**Rank 3. Confidence: high for the principle, moderate for the algorithm choice.**

**Evidence.**
- Distributed practice is the second *high utility* technique in Dunlosky et al. 2013 (above).
- Optimal gap scales with how long you need to remember: the meta-analysis over 839 assessments in 317 experiments found the interstudy interval producing peak retention grows with the retention interval (Cepeda, Pashler, Vul, Wixted & Rohrer, *Distributed practice in verbal recall tasks: A review and quantitative synthesis*, Psychological Bulletin 132(3):354–380, 2006 — https://www.yorku.ca/ncepeda/publications/CPVWR2006.html, PDF https://augmentingcognition.com/assets/Cepeda2006.pdf). The follow-up experiment gives usable numbers: optimal gap ≈ **20–40% of a 1-week retention interval, falling to 5–10% of a 1-year interval** (Cepeda, Vul, Rohrer, Wixted & Pashler, *Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention*, Psychological Science 19(11):1095–1102, 2008 — https://journals.sagepub.com/doi/10.1111/j.1467-9280.2008.02209.x, PDF https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf).
- FSRS vs SM-2: the open benchmark covers **10,000 collections / 519,296,315 reviews**; FSRS-6 has lower log-loss than Anki's SM-2 for ~99.6% of users, and the practical claim is materially fewer reviews for the same retention. https://github.com/open-spaced-repetition/srs-benchmark (README, updated 2026) and https://faqs.ankiweb.net/what-spaced-repetition-algorithm. FSRS is a fitted DSR (difficulty/stability/retrievability) model with ~19–21 trainable weights; SM-2 has one hand-set ease factor.
- Honest caveat: **the FSRS benchmark measures prediction of recall on flashcard-style items.** There is no comparable evidence that FSRS-scheduled review of *conceptual explanations or code-writing tasks* is better-calibrated than a simple expanding ladder. Do not over-claim.

**What to space — three tiers, deliberately different mechanisms.**

| Tier | Content | Scheduler | Why |
|---|---|---|---|
| **Atomic facts/notation** — `softmax temperature ↑ ⇒ ?`, RoPE base θ formula, `bf16` exponent bits, definition of precision@k, what `KV-cache` stores, the formula for a Wilson interval | ~150–400 cards over 40 weeks | **FSRS** (use the `py-fsrs` / `rs-fsrs` open-source implementation; local, no server) | High-volume, low element interactivity — exactly the regime FSRS was fit on |
| **Checks** (explanations, derivations, blank-page code) | ~6–12 per module, ~250–400 total | **Successive-relearning ladder**: +2d, +7d, +21d, +60d, reset on a `can't` | Too expensive (10–40 min each) for a per-item optimiser; you can only afford 2–4 per session, so the queue must be a *priority list*, not a due-date flood |
| **Modules** (whole topics) | 1 per 1–2 weeks | **Interleaved weekly review**: each week's review session draws one Check from the current module, one from the previous, one from a module ≥4 weeks old | Interleaving, not just spacing |

- Interleaving evidence is strong and comes from maths practice, the closest analogue to this learner's derivation work: interleaved practice 72% vs blocked 38% on a delayed test, **d = 0.79**, N = 126 (Rohrer, Dedrick & Stershic, *Interleaved Practice Improves Mathematics Learning*, Journal of Educational Psychology 107(3):900–908, 2015 — http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer_et_al_2015JEdPsych.pdf). Replicated in a larger RCT: https://gwern.net/doc/psychology/spaced-repetition/2019-rohrer.pdf.

**Making FSRS fit a 40-week module track.** The genuine tension: FSRS assumes an open-ended review commitment; a course has a finish line and a weekly hour budget.
1. **Cap the queue by time, not by cards.** Give the review queue a fixed 15-minute box per session (≈ 8% of a 3-hour session). Sort by FSRS retrievability ascending, take what fits, let the rest roll. A local app can do this trivially; Anki's "new cards/day" model cannot.
2. **Set desired retention deliberately low for facts (0.85–0.87), high for the capstone-critical set (0.92–0.95).** FSRS exposes this directly; raising retention from 0.85 to 0.95 roughly doubles review load, so spend that budget only on what the capstone needs.
3. **Set the horizon to the capstone date, not to infinity.** For a 40-week track, apply Cepeda's ratio: for material needed ~30 weeks later, the first gap wants to be ~2–6 weeks, not 1 day. Seed new atomic cards with an initial stability that reflects the learner's MSc background instead of treating everything as novel — mark cards `known-prior` and start them at a ~14-day interval.
4. **Suspend, don't delete, on module completion.** Retire a module's cards to a lower-frequency "maintenance" deck after its Check reaches `durable`.
5. **Weekly hour budget is the binding constraint.** With 10–15 hrs/week, budget ≈ 60% new material, 20% Checks/review, 20% capstone artefact work. Show the split as a stacked weekly bar (§A7), not a streak.

---

### A4. **Confidence-before-answer + calibration tracking**
**Rank 4. Confidence: moderate-to-high for the mechanism; modest and contested for the "calibration score" as a motivator.**

**Evidence.**
- Recording confidence *before* seeing feedback turns errors into the most correctable kind: the **hypercorrection effect** — high-confidence errors are corrected more reliably than low-confidence ones once feedback arrives (Butterfield & Metcalfe, *Errors committed with high confidence are hypercorrected*, JEP:LMC 27(6):1491–1494, Nov 2001 — https://pubmed.ncbi.nlm.nih.gov/11713883/). It persists a week, **but high-confidence errors return unless a test intervenes after the feedback** (Butler, Fazio & Marsh, *The hypercorrection effect persists over a week…*, Psychonomic Bulletin & Review 18:1238–1244, 2011 — https://link.springer.com/article/10.3758/s13423-011-0173-y). Design consequence: every corrected high-confidence error must auto-schedule a re-test. Review: Metcalfe, *Learning from Errors*, Annual Review of Psychology 68:465–489, 2017 — https://pmc.ncbi.nlm.nih.gov/articles/PMC3604148 (related).
- **Delay the judgment, not just the test.** Immediate JOLs are near-chance; JOLs made after a delay are dramatically more accurate (Nelson & Dunlosky 1991, above — https://journals.sagepub.com/doi/10.1111/j.1467-9280.1991.tb00147.x). So: ask "how confident are you that you could do this cold in two weeks?" at the *start of the next session*, not at the end of this one.
- Certainty-based marking (Gardner-Medwin, UCL) is the established implementation of confidence-weighted self-testing and is reported to promote reflection and better-targeted study — https://www.ucl.ac.uk/~ucgbarg/tea.htm and https://www.semanticscholar.org/paper/b125bb9daf04edfe2357e21f9ec9cc8f96155590. **Contested:** a controlled study found CBM in formative assessment improved course appreciation but **did not improve summative exam scores** (Front. Physiol. / Adv. Physiol. Educ., 2019 — https://pmc.ncbi.nlm.nih.gov/articles/PMC6544949/). Treat calibration as a *diagnostic*, not as a scoring system.

**Implementation notes.**
- Two sliders per attempt: `confidence_pre` (0–100, before writing) and, optionally, `confidence_post` (before revealing the reference).
- Compute a **Brier score** per module and a reliability plot ("when you said 90%, you were right 62% of the time"). Show this *only* in the weekly review, never as a live counter.
- **Auto-flag rule:** `confidence_pre ≥ 80 AND score = 0` ⇒ tag `overconfident-miss`, push to the front of next session's queue, and schedule a mandatory re-test at +2d (this is the Butler/Fazio/Marsh fix).
- Do not gamify calibration. It is a mirror, not a target.

---

### A5. **The "What I got wrong" log (error ledger)**
**Rank 5. Confidence: moderate-high (derived from robust error-correction findings, weak as a standalone intervention).**

**Evidence.** Metcalfe's review concludes that errors, when followed by corrective feedback, are beneficial rather than harmful to learning — the opposite of the errorless-learning tradition (Metcalfe, *Learning from Errors*, Annual Review of Psychology 68:465–489, Jan 2017 — https://www.annualreviews.org/doi/10.1146/annurev-psych-010416-044022). Combined with hypercorrection (A4) and the pretesting effect — unsuccessful retrieval attempts *before* study improve later learning of the very items missed, across 5 experiments (Richland, Kornell & Kao, *The pretesting effect: Do unsuccessful retrieval attempts enhance learning?*, JEP:Applied 15(3):243–257, Sep 2009 — https://pubmed.ncbi.nlm.nih.gov/19751074/, PDF https://learninglab.uchicago.edu/Pre-Testing_files/RichlandKornellKao.pdf) — errors are the highest-value data the app collects.

**Implementation notes.**
- `Error { id, check_id, date, my_answer, correct_answer, my_diagnosis (free text, required), category }`.
- Categories tuned to this syllabus: `notation/shape`, `misremembered-mechanism`, `conflated-two-things` (e.g. RoPE vs ALiBi; precision vs recall in eval), `off-by-one/masking`, `statistical-reasoning` (CI, multiple comparisons, judge-agreement), `API/library`, `didn't-know`.
- **Require the free-text diagnosis before the error can be filed.** This is the elaborative step; without it the ledger is a list of red marks.
- Auto-generate next week's warm-up quiz from the top 5 unresolved errors.
- Monthly: chart error counts by category. A category that keeps reappearing is a module that needs re-doing, not more cards.

---

### A6. **Artefact-first progress, with "next action" always visible**
**Rank 6. Confidence: mixed — high for goal-setting on complex tasks, moderate for progress visualisation, low for dashboards in general.**

**Evidence.**
- On novel/complex tasks a **learning goal** ("work out a strategy for X") outperforms a **performance goal** ("hit N"), because performance goals divert attention during the declarative stage (Seijts & Latham, *Learning versus performance goals: When should each be used?*, Academy of Management Executive 19(1):124–131, 2005 — https://www-2.rotman.utoronto.ca/facbios/file/22%20-%20Seijts%20&%20Latham%20AME%202005.pdf). For a 40-week self-study track this argues against hour quotas as targets and for *artefact* targets.
- Hours-practised is a weak predictor of skill: deliberate practice explained 26% of variance in games, 21% music, 18% sports, **4% in education and <1% in professions** (Macnamara, Hambrick & Oswald, *Deliberate Practice and Performance…: A Meta-Analysis*, Psychological Science 25(8):1608–1618, Jul 2014 — https://journals.sagepub.com/doi/abs/10.1177/0956797614535810). Hours should therefore be a *budget* (a constraint to respect) and never a *score*.
- Learning-analytics dashboards are much weaker than vendors imply: a systematic review found most papers measure perceptions, few measure behaviour, and almost none run RCTs (Matcha et al., *A Systematic Review of Empirical Studies on Learning Analytics Dashboards: A Self-Regulated Learning Perspective*, IEEE Transactions on Learning Technologies 13(2), 2020 — https://ieeexplore.ieee.org/document/8935080; see also https://link.springer.com/article/10.1007/s10639-023-12401-4, Jan 2024). Build the *minimum* dashboard.
- **Estimation will be wrong and the fix is known.** 70% of students exceeded their own predicted thesis completion time; mean actual 55 days vs predicted ~33 (Buehler, Griffin & Ross, *Exploring the "planning fallacy"*, JPSP 67(3):366–381, 1994 — https://www.semanticscholar.org/paper/f91964dad8c0e54cd58b1aa99e430b900fcf082b). Unpacking a task into components reduces the bias (Kruger & Evans, *If you don't want to be late, enumerate*, JESP 40(5):586–598, 2004 — https://www.researchgate.net/publication/222760308), though segmentation effects are mixed (Forsyth & Burt, *Allocating time to future tasks: the effect of task segmentation on planning fallacy bias*, Memory & Cognition 36(4):791–798, 2008 — https://link.springer.com/article/10.3758/MC.36.4.791).

**What to show (and nothing else).**
1. **Capstone artefact board** — the checklist of capstone artefacts as the *home screen*, each with state `not-started / draft / working / reviewed / done`, and each linked to the modules that feed it. This is the only "progress bar" that maps to a real outcome.
2. **Next action**, one line, always at the top, pre-computed: *"Module 11 · Check: implement KV-cache and measure latency delta · est. 45 min · last touched 6 days ago."*
3. **Hours vs budget**, as a stacked weekly bar of *new / review / build*, with a plain-language note ("you are 3.5 h under budget this week"). No target line to "hit".
4. **Burn-up against the 40-week plan**, showing modules *durable*, not modules *opened*.
5. **Calibration + error-category charts** — weekly only.

**Implementation notes.** Force task unpacking at module start: the learner must list the sub-steps and estimate each; the app sums them and stores both the sum and the single-shot estimate, then shows realised vs estimated at module end. This is a cheap, evidence-backed antidote to a 40-week plan quietly slipping.

---

### A7. **Session bookends: warm-up retrieval in, plan-next-session out**
**Rank 7. Confidence: high for the warm-up, moderate for the plan-out.**

**Evidence.**
- Opening with retrieval rather than review: pretesting improves later learning even of items answered wrong (Richland, Kornell & Kao 2009, above). Interpolated testing during instruction cut mind-wandering from ~39–41% of probes to **19%**, increased note-taking, raised final cumulative test scores to **90% vs 76% (restudy) and 68% (no test)**, and *reduced* self-reported anxiety and cognitive demand (Szpunar, Khan & Schacter, *Interpolated memory tests reduce mind wandering and improve learning of online lectures*, PNAS 110(16):6313–6317, 16 Apr 2013 — https://www.pnas.org/doi/10.1073/pnas.1221764110).
- Ending with reflection rather than more practice: in a field experiment at Wipro, trainees who spent the last 15 minutes of each day writing about what they had learned outperformed controls by **22.8%** on the final assessment despite *less* practice time; across 10 studies, N = 4,340 (Di Stefano, Gino, Pisano & Staats, *Learning by Thinking: How Reflection Can Spur Progress Along the Learning Curve*, HBS Working Paper 14-093 / SSRN, 2014–2016 — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2414478, PDF https://larryferlazzo.edublogs.org/files/2013/08/reflection-1di0i76.pdf). Note: business-school field experiment, not a cognitive-lab study; treat 22.8% as indicative, not as a transportable effect size.

**Implementation notes.** See §C for the full flow. The key structural decision: **the app opens on a 5-minute warm-up quiz, not on a content page.** And the session cannot be closed without writing the next session's first action (this is also where implementation intentions attach — §A8).

---

### A8. **If-then plans (implementation intentions) attached to the next session**
**Rank 8. Confidence: high for the mechanism; the format matters more than the feature.**

**Evidence.**
- Gollwitzer & Sheeran, *Implementation Intentions and Goal Achievement: A Meta-Analysis of Effects and Processes*, Advances in Experimental Social Psychology 38:69–119, 2006 — **d = 0.65 across 94 independent tests**; d = 0.61 for getting started, d = 0.77 for preventing derailment. https://kops.uni-konstanz.de/handle/123456789/10973 · https://www.sciencedirect.com/science/chapter/bookseries/abs/pii/S0065260106380021
- The 2024 update is now the better headline citation and it tightens the design requirement: Sheeran, Listrom & Gollwitzer, *The when and how of planning: Meta-analysis of the scope and components of implementation intentions in 642 tests*, European Review of Social Psychology 36(1), 27 Mar 2024 — **642 tests, d = 0.27–0.66**, with effects **larger when the plan uses a genuine contingent if-then format, when commitment is high, and when the plan is rehearsed**. https://www.tandfonline.com/doi/abs/10.1080/10463283.2024.2334563
- Converging mechanism: unfulfilled goals produce intrusive thoughts and impair unrelated performance, and **writing a specific plan removes the interference as effectively as finishing the task** (Masicampo & Baumeister, *Consider It Done! Plan Making Can Eliminate the Cognitive Effects of Unfulfilled Goals*, JPSP 101(4):667–683, 2011 — https://users.wfu.edu/masicaej/MasicampoBaumeister2011JPSP.pdf). Caveat: 2011-era social psychology, small cells, no direct replication located; it is corroborative, not load-bearing.
- **Do not justify anything by the Zeigarnik effect.** A 2025 meta-analysis of 37 studies (excluding Zeigarnik's own data) found an interrupted:completed recall ratio of **0.99 — no memory advantage at all**; only the *resumption* tendency (Ovsiankina) survives. Ghibellini & Meier, *Interruption, recall and resumption: a meta-analysis of the Zeigarnik and Ovsiankina effects*, Humanities and Social Sciences Communications 12:962, 1 Jul 2025 — https://www.nature.com/articles/s41599-025-05000-w. "Leave a thread open and you'll come back to it" is defensible; "leave it open and you'll remember it better" is refuted.

**Implementation notes.**
- End-of-session field, **required**, with a forced if-then template — free text is not the tested intervention:
  `IF <concrete cue> THEN I will <first 10 minutes of work>.`
  e.g. *"If it's Tuesday and I've closed my work laptop, then I'll open the app and re-derive the attention gradient on paper for 10 minutes."*
- Store the cue separately from the action so the app can show the plan verbatim on the next launch (this is the "rehearsal" moderator).
- Set the plan at the level of the **first ten minutes**, not the session. Starting is the hard part (d = 0.61).
- **Unpack the module at its start** (the planning-fallacy antidote from A6) — the sub-step list is where the if-then actions come from.

---

### A9. **Generative note-taking with self-explanation prompts — never a verbatim capture surface**
**Rank 9. Confidence: high for self-explanation (meta-analytic); the famous note-taking study is effectively refuted and must not be cited as support.**

**Evidence — and a correction to the received wisdom.**
- **The laptop-vs-longhand claim is dead, and so is the tidy "but generative beats verbatim" consolation.** Mueller & Oppenheimer, *The Pen Is Mightier Than the Keyboard*, Psychological Science 25(6):1159–1168, 23 Apr 2014 — https://doi.org/10.1177/0956797614524581 (2018 corrigendum, corrected data: https://osf.io/t43ua/). Morehead, Dunlosky & Rawson found no consistent differences — including versus a group that took **no notes at all** (*How Much Mightier Is the Pen than the Keyboard?*, Educational Psychology Review 31(3):753–780, 4 Feb 2019 — https://link.springer.com/article/10.1007/s10648-019-09468-2). The preregistered 88-author direct replication found conceptual application **g = −0.13 [−0.45, 0.20]** (numerically favouring laptop) and, across 8 matched studies, **total quiz performance g = 0.04 [−0.13, 0.20], k = 8** and **conceptual application g = 0.14 [−0.07, 0.35]** — both statistically equivalent to zero: Urry et al., *Don't Ditch the Laptop Just Yet*, Psychological Science 32(3):326–339, 4 Feb 2021 — https://static1.squarespace.com/static/587ea259197aea1c1d66ec5b/t/601f2ac8268c6a7b9735c877/1612655305004/Urryetal_PSCI_2021.pdf. What *did* replicate strongly is that laptops produce more words (g ≈ −0.91) and more verbatim overlap (g ≈ −0.78). **But the link from verbatim overlap to worse performance was itself not robust in the replication** — so do not build the feature on this literature at all. Build it on self-explanation instead.
- **Self-explanation is the real warrant, and it is strong.** Bisra, Liu, Nesbit, Salimi & Winne, *Inducing Self-Explanation: a Meta-Analysis*, Educational Psychology Review 30(3):703–725, 29 Mar 2018 — https://link.springer.com/article/10.1007/s10648-018-9434-x (PDF https://gwern.net/doc/psychology/spaced-repetition/2018-bisra.pdf). **69 effect sizes, 64 reports, N = 5,917; random-effects g = 0.55 [0.454, 0.650], I² = 65%.** Versus no additional explanation g = .673 (k = 41); versus being *given* an instructional explanation g = .354 (k = 6) — self-explaining still beats being told.
- **The moderators are the feature spec.** Prompts eliciting **conceptual** explanations: **g = .873 (k = 13)**; prompts eliciting **metacognitive** ones ("monitor your understanding"): **g = .192, non-significant**. **Interrogative** prompts g = .559 > **imperative** g = .395. **Content-general** g = .678 ≥ content-specific g = .510. Sessions <30 min g = .709 > sessions >2 h g = .462. **Computer science as a subject: g = .761 [.407, 1.114], k = 9, N = 818.** And by task type: studying **text** g = .787 (k = 14) > solving problems g = .476 > studying **worked examples** g = .362 (k = 8, the weakest). Read plainly: *ask short, general, conceptual "why/how" questions while the learner reads papers; do not bolt them onto worked examples.*
- Foundations: Chi, Bassok, Lewis, Reimann & Glaser, *Self-Explanations*, Cognitive Science 13(2):145–182, 1989 — https://onlinelibrary.wiley.com/doi/abs/10.1207/s15516709cog1302_1 (N = 8; successful students averaged 15.3 self-explanations per worked example and 82% on the posttest vs 2.8 and 46% — observational, tiny N). Causal test: Chi, de Leeuw, Chiu & LaVancher, *Eliciting Self-Explanations Improves Understanding*, Cognitive Science 18(3):439–477, 1994 — https://andymatuschak.org/files/papers/Chi%20et%20al%20-%201994%20-%20Eliciting%20self-explanations%20improves%20understanding.pdf. N = 24 eighth-graders; gains **32% (prompted) vs 22% (unprompted)**, interaction F(1,22) = 5.1, p < .05; on inference/mental-model items **+22.6% vs +12.5%**, t(22) = 2.64, p < .01. Caveat: prompted group also spent nearly twice as long (2 h 5 min vs 1 h 6 min), so time-on-task is not fully controlled.
- **Elaborative interrogation ("why is this true?")**: rated *moderate utility* by Dunlosky et al. 2013 — https://iverson.cm.utexas.edu/courses/310M/Handouts/Dunlosky%20et%20al.%20-%202013%20-%20Improving%20Students%E2%80%99%20Learning%20With%20Effective%20Learni.pdf — and **d = 0.56 (SE .048, 254 effects)** in Donoghue & Hattie, *A Meta-Analysis of Ten Learning Techniques*, Frontiers in Education 6:581216, 31 Mar 2021 — https://www.frontiersin.org/articles/10.3389/feduc.2021.581216/full (242 studies, 1,619 effects, N = 169,179; distributed practice d = 0.85, practice testing d = 0.74). **Flag as contested:** that same table puts rereading at d = 0.47 and highlighting at d = 0.44, contradicting Dunlosky's "low utility" verdicts — a difference driven by inclusion criteria and comparison baselines (many rereading effects are pre/post, not versus an active control). Do not use Donoghue & Hattie to rehabilitate highlighting.
- **Critical moderator for this app:** elaborative interrogation depends on prior knowledge — with too little domain schema, "why?" prompts underperform simply reading the facts (Dunlosky et al. 2013). So gate "why is this true?" behind a first pass, and use "what does this symbol mean / what would break?" earlier.
- **"Explain to a colleague" — support the components, not the brand name.** Kobayashi, *Learning by Preparing-to-Teach and Teaching: A Meta-Analysis*, Japanese Psychological Research 61(3):192–203, 2019 — https://onlinelibrary.wiley.com/doi/10.1111/jpr.12221 — **28 studies**: preparing-to-teach alone **g ≈ 0.35**; preparing **plus actually teaching g ≈ 0.56**. Fiorella & Mayer, Contemporary Educational Psychology 38(4):281–288, 2013 (https://www.sciencedirect.com/science/article/abs/pii/S0361476X13000209) and 39(2):75–85, 2014 (https://www.sciencedirect.com/science/article/abs/pii/S0361476X14000022): on immediate tests, preparing to teach was enough; **on the delayed test, only those who actually taught performed best.** Best-powered extension: Guerrero & Wiley, *Expecting to teach affects learning during study of expository texts*, Journal of Educational Psychology 113(7):1281–1303, 2021 — https://files.eric.ed.gov/fulltext/ED624662.pdf — N = 206, expectation effect **F(1,200) = 4.94, p = .03, η²p = .02**, holding at a one-week delay; but the popular *mechanism* story was **not** supported (no selective focus on important ideas, no greater reorganisation), and expect-to-teach students reported **more stress**.
- **Boundary conditions you must design around** (Fiorella, *Learning by Teaching*, in *In Their Own Words*, STP, 2021/2023 — https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-learning-by-teaching-fiorella.pdf): several studies find **no** benefit of teaching expectancy (Renkl 1995 — students did worse preparing to teach probability worked examples, apparently from anxiety); Roscoe & Chi's **knowledge-telling bias** means an unscaffolded "explain it simply" prompt degrades into paraphrase; teaching **from memory** beat teaching **with notes available** on a delayed test (Koh et al. 2018) — i.e. much of the benefit is retrieval; **oral** explanation beat restudy where written explanation sometimes did not (Hoogerheide et al. 2016; Lachner et al. 2018), with written explanations better organised and oral ones more elaborative; and **explain-and-draw** beat explain-only and draw-only a week later (Fiorella & Kuhlmann 2020).
- **On the "Feynman technique" by name: there is essentially no evidence.** The only study that names and tests it is Reyes et al., *Feynman Technique as a Heutagogical Learning Strategy for Independent and Remote Learning*, Recoletos Multidisciplinary Research Journal 9(2):1–13, 2021 — https://rmrj.usjr.edu.ph/rmrj/index.php/RMRJ/article/download/958/243/5090 — a small single-site pre/post study with no reported effect sizes. The technique is a **folk packaging of three separately evidenced mechanisms** (teaching expectancy ≈ 0.35, producing an explanation for an audience ≈ 0.56, self-explanation 0.55) plus retrieval. Claim the components; do not claim the method.
- Why all this matters disproportionately here: the illusion of explanatory depth is largest for *mechanism* knowledge (Rozenblit & Keil 2002), which is what this syllabus is made of.

**Implementation notes.**
- Notes are **typed blocks**: `claim`, `mechanism`, `derivation`, `open-question`, `contrast` (X vs Y), `code-insight`, `quote` (the only verbatim type; must carry a source). Creating a `quote` immediately demands a paired `mechanism` block in the learner's own words.
- **Prompt library, built to Bisra's moderators — short, interrogative, conceptual, content-general:**
  - *Why does this work, and not the obvious alternative?*
  - *What would break if this were removed?*
  - *How is this different from <nearest neighbour>?* — auto-suggested from the module's concept list (RoPE↔ALiBi, LoRA↔full fine-tune, BM25↔dense retrieval, precision↔recall↔coverage, pairwise↔pointwise judging, bootstrap CI↔normal-approximation CI).
  - **Do not ship metacognitive prompts** ("reflect on whether you understand") during study — g = .192, ns. Metacognition belongs at the bookends (A4, C2), not inline.
- **Fire these prompts while reading papers and text, not while studying worked examples** (g = .787 vs .362); for worked examples use the faded-step principle prompt instead (A11).
- **"Explain to a colleague" should be spoken, from memory, and recorded.** Build it as: notes hidden, 90-second audio recording, auto-transcribed into the note as an `explain` block. Oral + from-memory is the configuration with the best support; the transcript then becomes a `explain`-type Check. Optionally require a hand-drawn diagram alongside (explain-and-draw).
- A note never used in a Check is a **dead note** — count them in the weekly review. Notes exist to be retrieved from.

---

### A10. **Reading-list management with a capability ladder, paper templates, and system-imposed video pauses**
**Rank 10. Confidence: moderate for the templates (expert practice), high for the video-pause design (meta-analytic).**

**Evidence.**
- **Paper reading — expert heuristics, explicitly not RCT evidence.** Keshav, *How to Read a Paper*, ACM SIGCOMM Computer Communication Review 37(3):83–84, 20 Jul 2007 — https://dl.acm.org/doi/10.1145/1273445.1273458 (free PDF http://ccr.sigcomm.org/online/files/p83-keshavA.pdf). **Pass 1 (5–10 min)**: title, abstract, intro, section headings, conclusions, glance at references; then answer the *five Cs* — Category, Context, Correctness, Contributions, Clarity. **Pass 2 (up to 1 h)**: read carefully but **skip proofs**; scrutinise figures, axis labels and error bars; mark unread references. **Pass 3 (4–5 h for an experienced reader)**: **virtually re-implement the paper** — same assumptions, recreate the work, compare with what the authors actually did; surface implicit assumptions and weaknesses. Keshav also gives a literature-survey recipe (3–5 recent papers → their related-work sections → shared citations and recurring authors → top-venue recent proceedings → iterate) that is directly worth encoding as a module-start workflow.
- Andrew Ng, CS230 Lecture 8, *Reading Research Papers* (Stanford, Autumn 2018) — https://www.youtube.com/watch?v=733m6qBH-jI, notes https://www.kdnuggets.com/2019/09/advice-building-machine-learning-career-research-papers-andrew-ng.html: skim 5–10 papers at ~10% each before committing to one; multiple passes (title/abstract/figures → intro+conclusions+figures → whole paper skipping the math → everything); ~5–20 papers for a working understanding of an algorithm, ~50–100 for an area. Checklist while reading: what did they try to do, what were the key elements, what can I use, what should I read next.
  Both are practitioner heuristics with no controlled test. Their credibility is that they converge with evidenced principles — segmenting, progressive deepening, and a third pass that is literally generative reconstruction.
- **Video: build system-imposed pauses, not a pause button.** Meta-analysis: Rey, Beege, Nebel, Wirzberger, Schmitt & Schneider, *A Meta-analysis of the Segmenting Effect*, Educational Psychology Review 31(2):389–419, 4 Jan 2019 — https://link.springer.com/article/10.1007/s10648-018-9456-4 (PDF https://maria-wirzberger.de/wp-content/uploads/2019/01/Rey2019_Article_AMeta-analysisOfTheSegmentingE.pdf). **88 comparisons, N = 7,713**: retention **d = 0.32 [0.20, 0.43]**, transfer **d = 0.36 [0.24, 0.48]**, cognitive load reduced d = 0.23, **learning time longer d = −0.92**. Crucially, **system-paced** retention **d = 0.42 [0.21, 0.63]** versus **learner-paced retention d = 0.19 [−0.04, 0.45], non-significant.** (Note this is materially lower than the median d = 0.79 quoted from Mayer & Pilegard's 10-of-10 review in *The Cambridge Handbook of Multimedia Learning*, 2nd ed., 2014 — https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/principles-for-managing-essential-processing-in-multimedia-learning-segmenting-pretraining-and-modality-principles/DD24C2F48B9B1277CE59F78276110258; prefer the meta-analytic figure.) Corroborating: Biard, Cojean & Jamet, *Effects of segmentation and pacing on procedural learning by video*, Computers in Human Behavior 89:411–417, 2018 — https://www.sciencedirect.com/science/article/abs/pii/S0747563217306829 — N = 68; **pacing helped only when the system imposed the pauses; students barely used a pause button that was merely offered.**
  A useful surprise from Rey's moderator analysis: learners with **high** prior domain knowledge benefited *more* from segmentation than low-knowledge learners — so an MSc-level learner is not exempt.
- **Interpolated retrieval during video is stronger still.** Szpunar, Khan & Schacter, PNAS 110(16):6313–6317, Apr 2013 — https://www.pnas.org/doi/10.1073/pnas.1221764110. 21-min lecture in four ~5-min segments, N = 48 (≈16/group): mind wandering **19% vs 39% (restudy) vs 41% (none)**, F(2,45) = 3.43, p = .041; final cumulative test **90% vs 76% vs 68%**; more note-taking, *less* anxiety, lower subjective cognitive demand. Small cells — treat the percentages as estimates.
- **Cognitive-load constraint on resource choice.** Split-attention and redundancy raise extraneous load, and the **expertise reversal effect** means scaffolds that help novices actively harm knowledgeable learners (Sweller, Ayres, Kalyuga & Chandler, *The Expertise Reversal Effect*, Educational Psychologist 38(1):23–31, 2003 — https://doi.org/10.1207/S15326985EP3801_4, PDF https://mrbartonmaths.com/resourcesnew/8.%20Research/Explicit%20Instruction/The%20Expertise%20Reversal%20Effect.pdf; Kalyuga, Instructional Science special issue, 2009 — https://link.springer.com/article/10.1007/s11251-009-9102-0). Caveat: most demonstrations are lab studies in well-structured domains with briefly-induced "expertise"; generalising to a year of self-study is inference. Practically: for an MSc-level learner, "watch the 3-hour intro course" is often the wrong rung — skip to the paper or the repo.

**Implementation notes.**
- **Resource states form a capability ladder, not a read/unread flag:** `queued → skimmed (pass 1, five Cs filled) → read (pass 2) → reconstructed (pass 3 / ran the code) → taught (produced a spoken explanation or a Check)`. Only `reconstructed` and `taught` count toward module completion; a module at 100% `read` and 0% `taught` shows red.
- **Paper template auto-created on add**, stubbed with Keshav's fields: the five Cs; *the one equation that carries the idea*; *what I would have to implement to believe this*; *nearest-neighbour paper and the disagreement*; *three things I could not follow* → these three auto-become Checks.
- **Video player with enforced segmentation.** The learner (or the app, from chapter markers) defines segments of ≤6 minutes. At each boundary the player pauses **itself**, hides the frame, and requires one typed sentence of recall before play re-enables. Store `recall_text` per segment. Do not ship a voluntary pause button as the mechanism — the evidence says it will not be used.
- **Module-start literature survey** as a first-class workflow implementing Keshav's recipe and Ng's skim-10-first rule: the learner adds 5–10 candidates, does pass 1 on each, and the app surfaces shared citations and recurring authors to pick the 2 that get pass 3.
- Track `est_minutes`, `actual_minutes`, and a 1–3 `payoff` rating. Over 40 weeks this is the only reliable way to learn which *resource types* work for this learner. Store `cost`, `license`, `local_copy_path` so a free-first track survives dead links and paywalls.

---

### A11. **Code- and math-specific practice affordances**
**Rank 11. Confidence: high for faded worked examples and productive failure; explicitly low for the popular "retype, don't copy-paste" claim.**

**Evidence.**
- **Worked examples, and the fading that should replace them.** Sweller & Cooper, *The Use of Worked Examples as a Substitute for Problem Solving in Learning Algebra*, Cognition and Instruction 2(1):59–89, 1985 — https://doi.org/10.1207/s1532690xci0201_3 (PDF https://onderwijs.felienne.nl/vakdidactiek/materiaal/sweller_worked_examples.pdf): worked-example students solved similar post-test problems far faster with far fewer errors — **but the advantage did not extend to structurally varied problems**, i.e. it was near transfer. Meta-analysis: Barbieri, Miller-Cotto, Clerjuste & Chawla, *A Meta-analysis of the Worked Examples Effect on Mathematics Performance*, Educational Psychology Review 35:11, 30 Jan 2023 — https://link.springer.com/article/10.1007/s10648-023-09745-1 — **43 articles, 55 studies, 181 effect sizes, robust variance estimation: g = 0.48, p = .01.**
- **Backward fading with principle prompts is the design that transfers.** Atkinson, Renkl & Merrill, *Transitioning From Studying Examples to Solving Problems: Effects of Self-Explanation Prompts and Fading Worked-Out Steps*, Journal of Educational Psychology 95(4):774–783, Dec 2003 — https://mrbartonmaths.com/resourcesnew/8.%20Research/Making%20the%20most%20of%20examples/Fading%20out%20and%20Prompts.pdf. Fading alone reliably improves **near** transfer but not far transfer; **fading plus self-explanation prompts targeting the principle behind each faded step produced medium-to-large effects on both near and far transfer, without extra time on task.** Theory companion: Renkl & Atkinson, Educational Psychologist 38(1):15–22, 2003; https://link.springer.com/article/10.1023/B:TRUC.0000021815.74806.f6.
  **Contested — flag it:** Barbieri et al. found self-explanation prompts moderated the worked-example effect **negatively**, and Bisra et al. 2018 found worked examples the *weakest* task type for self-explanation (g = .362). Best synthesis: a good worked example already supplies the explanation, so a generic "explain this" prompt is redundant there. Prompt only for the **principle behind the step you just faded out** — which is what Atkinson et al. actually tested — and keep general self-explanation for papers and text.
- **Expertise reversal** (Sweller et al. 2003, above) is why this learner should get **no** worked examples for material adjacent to his MSc (linear algebra, probability, basic optimisation) — blank page from the start — and fading only for genuinely new machinery (rotary embeddings, flash-attention tiling, GRPO-style objectives, judge-calibration statistics, bootstrap/permutation tests on eval sets).
- **Struggle before instruction beats instruction before struggle.** Sinha & Kapur, *When Problem Solving Followed by Instruction Works: Evidence for Productive Failure*, Review of Educational Research 91(5):761–798, Oct 2021 — https://journals.sagepub.com/doi/10.3102/00346543211019105 (ERIC https://eric.ed.gov/?id=EJ1308129). **53 studies, 166 comparisons, Hedges g = 0.36 [0.20, 0.51]**, rising to **g = 0.37–0.58** with high fidelity to productive-failure principles. This is the best justification for the app's core ordering rule: **attempt the Check first, open the resource second.**
- **The "typing code beats copy-pasting" claim has no direct experimental support — say so.** A search of the computing-education literature turns up no controlled comparison of retyping versus copy-paste on learning outcomes; the closest is an observational study of ten programmers that merely catalogues copy-and-paste, observe-and-retype, and memorise-then-retype as strategies (arXiv:2304.10369 — https://arxiv.org/abs/2304.10369). The plausible-but-indirect warrant is the generation effect (Bertsch et al. 2007, d ≈ 0.40) plus the Anthropic RCT's delegation finding. **Build the no-paste editor because the theory and the adjacent RCT point that way, not because the experiment exists.**
- **Reconstruct-from-memory is a validated measure of schema quality** (and by inference a good retrieval task): experts reconstruct programs far better than novices **only when the lines are in meaningful order** — the advantage vanishes on scrambled code (Shneiderman, *Exploratory experiments in programmer behavior*, International Journal of Computer and Information Sciences 5(2):123–143, 1976 — https://doi.org/10.1007/BF00975629; and https://www.sciencedirect.com/science/article/abs/pii/S0020737380800472). Corroborating: McKeithen, Reitman, Rueter & Hirtle, Cognitive Psychology 13(3):307–325, 1981 — https://doi.org/10.1016/0010-0285(81)90012-8; Adelson, Memory & Cognition 9(4):422–433, 1981 (novices cluster by syntax, experts by function). These were assessment studies, not training interventions — the training claim is an inference.
- **"Explain this code in English" sits between tracing and writing in the skill hierarchy** — Lopez, Whalley, Robbins & Lister, *Relationships between reading, tracing and writing skills in introductory programming*, ICER 2008:101–112 — https://dl.acm.org/doi/10.1145/1404520.1404531; extensions Lister et al. ITiCSE 2009 (https://doi.org/10.1145/1595496.1562930) and Venables, Tan & Lister ICER 2009 (https://dl.acm.org/doi/10.1145/1584322.1584336). A 2022 replication qualifies the strength of the relationship, so treat the hierarchy as supported but not settled. Relatedly, students who can write working code often **cannot explain it** (arXiv:2104.06710 — https://arxiv.org/abs/2104.06710) — the knowledge-telling problem in the coding domain, and a direct argument for making `explain-your-own-code` a distinct Check type.
- **Parsons problems: equally effective, more efficient — but under-replicated.** Ericson, Margulieux & Rick, *Solving Parsons problems versus fixing and writing code*, Koli Calling 2017:20–29 — https://doi.org/10.1145/3141880.3141895: significantly less time than fixing buggy code or writing equivalent code, **no significant difference in learning or in one-week retention**. Replicated: Ericson, Foley & Rick, ICER 2018 — https://doi.org/10.1145/3230977.3231000; Ericson, Margulieux et al., CHI 2021 — https://doi.org/10.1145/3411764.3445292. **Contested:** Du, Luxton-Reilly & Denny, *A Review of Research on Parsons Problems*, ACE 2020:195–202 — https://doi.org/10.1145/3373165.3373187 — conclude effectiveness "remains uncertain due to a lack of replication." See also the ITiCSE working-group report, Ericson et al. 2022 — https://juholeinonen.com/assets/pdf/ericson2022parsons.pdf. This literature is overwhelmingly about novices, and expertise reversal predicts diminishing value here — so use Parsons as a **fallback rung when the blank page fails**, never as the default.

**Implementation notes — the practice ladder for one skill (e.g. multi-head causal attention).**
1. **Blank page.** Offline editor, no autocomplete, **paste disabled**, no LLM, 25-minute box. Output saved as a versioned snippet.
2. Stuck >10 min → reveal **one faded step, last step first** (backward fading), and require a one-line answer to *"what principle does this step implement?"* — the Atkinson et al. configuration. Record reveals needed; **reveals-to-solution falling across attempts is the real progress metric**, better than any score.
3. Still stuck → **Parsons mode**: the reference implementation's lines shuffled, reassemble. (Include a scrambled-order variant occasionally as a schema probe, per Shneiderman.)
4. Then reveal the reference and require a written `diff-diagnosis` — *"I forgot the causal mask is `-inf` before the softmax, not `0` after."*
5. Auto-schedule re-tests at +2 d and +7 d (A2) and create atomic cards for whatever the diagnosis names.
6. Separate Check type: **`explain-your-own-code`** — read back your own week-old implementation and explain what each block does, from memory, out loud. Cheap to build, and it targets the exact gap the CS-education literature documents.

**For math:** a `derive` Check requiring a re-do from the starting assumptions with no peeking, self-marked line by line against a stored rubric. Keep every attempt (LaTeX or a photo); the derivation visibly shortening across attempts is the fluency evidence.

**For evaluation and statistics:** the analogue of the blank page is a **blank dataset** — ship each stats Check with a small synthetic CSV and require the number *and* its interpretation before revealing anything. ("Here are 200 judge-vs-human labels; report Cohen's κ, a bootstrap CI, and say whether this judge is fit for the gate.")

---
### A12. **Cognitive-load hygiene in the app itself**
**Rank 12. Confidence: high for the theory, and it is mostly a set of prohibitions.**

**Evidence.** Sweller's intrinsic/extraneous/germane distinction and the redundancy, split-attention and expertise-reversal effects (Sweller, Ayres & Kalyuga, *Cognitive Load Theory*, Springer 2011 — https://link.springer.com/book/10.1007/978-1-4419-8126-4; Kalyuga et al. 2003 — https://www.tandfonline.com/doi/abs/10.1207/S15326985EP3801_4).

**Implementation notes.** One screen, one task. No sidebars during a Check. Math rendered inline with its code (not in a separate pane — split attention). No notifications, no badges, no live counters during work. Dark-on-light monospace for code, KaTeX for math, and never both a transcript and a video playing. The app should be *boring* while the learner is working and informative only at the bookends.

---

## B. The "do not build" list

Each entry states what the popular feature is, what the evidence actually says, and the replacement.

---

### B1. **Points, badges, and XP**
**Do not build.** The gamification meta-analyses look supportive at first glance — Sailer & Homner, *The Gamification of Learning: A Meta-Analysis*, Educational Psychology Review 32:77–112, 15 Aug 2019 — cognitive **g = 0.49 [0.30, 0.69], k = 19**; motivational **g = 0.36 [0.18, 0.54]**; behavioural **g = 0.25 [0.04, 0.46]** — https://eric.ed.gov/?id=EJ1245270; and Bai, Hew & Huang, Educational Research Review 30, 2020, overall **g = 0.504** — https://www.sciencedirect.com/science/article/abs/pii/S1747938X19302908. **But read the moderators.** In Sailer & Homner, motivational and behavioural effects were the *least stable* under high-rigour subsetting, and the significant behavioural moderators were **game fiction and social interaction** — neither of which exists in a single-user local app. The reward-and-status-only configuration is the least-supported slice of that literature. Bai et al. found effects largest at **1–3 months**, consistent with novelty decay. The longitudinal study that tracked exactly this decay found gamified students **declined** in intrinsic motivation, satisfaction and empowerment over a 16-week semester, and scored *worse* on the final exam, mediated by intrinsic motivation (Hanus & Fox, *Assessing the effects of gamification in the classroom*, Computers & Education 80:152–161, 2015 — https://www.sciencedirect.com/science/article/abs/pii/S0360131514001997).
Underlying risk: tangible, expected, task-contingent rewards undermine free-choice intrinsic motivation — engagement-contingent **d = −0.40**, completion-contingent **d = −0.36**, performance-contingent **d = −0.28** across 128 experiments (Deci, Koestner & Ryan, Psychological Bulletin 125(6):627–668, 1999 — https://home.ubalt.edu/tmitch/642/articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf). This is **contested** — Cameron & Pierce and Eisenberger et al. dispute it (https://pubmed.ncbi.nlm.nih.gov/10589299/), Deci et al. rebut (https://www.selfdeterminationtheory.org/SDT/documents/2001_DeciKoestnerRyan.pdf), and the modern synthesis is conditional: incentives that are **directly performance-salient** crowd out intrinsic motivation; indirectly salient ones coexist with it (Cerasoli, Nicklin & Ford, Psychological Bulletin 140(4):980–1008, 2014, **k = 183, N = 212,468** — https://selfdeterminationtheory.org/wp-content/uploads/2017/06/2014_Cerasoli_Intrinsic.pdf).
**Replacement:** *informational competence feedback* — verbal/descriptive feedback enhanced intrinsic motivation in the same Deci meta-analysis. In this app that means "you reconstructed MHA in 18 minutes with 1 reveal, down from 41 minutes with 5 reveals," not "+50 XP."

### B2. **Leaderboards and any social comparison**
**Do not build — it is incoherent at n=1.** Hanus & Fox's gamified condition (leaderboard + badges) is the one that produced the motivational decline. A leaderboard with one participant is either a self-comparison over time (already covered by A1's attempt history, without the framing) or a comparison against fabricated peers.

### B3. **Streaks as the primary progress mechanic** — *nuanced: do not make it primary, and if you build one, build it with repair*
This is the place where the usual advice and the actual evidence diverge, so state it carefully.
- **The "streaks cause abandonment" narrative is under-evidenced.** The single large field experiment found the opposite of a discouragement effect: Aulagnon, Cristia, Cueto & Malamud, *Streaks to Success? The Effects of Highlighting Streaks on Student Effort and Learning*, IPR Working Paper WP-26-05, Northwestern, 19 Feb 2026 — https://www.ipr.northwestern.edu/documents/working-papers/2026/wp-26-05.pdf. **N = 60,000** students randomised across streak-highlighting, personalised reminders, generic reminders, and control. Streaks raised the **intensive margin +9.4 pp** (fraction of weeks connected) vs +6.9 pp for personalised reminders; extensive margin +2.8 pp for streaks vs +3.8 pp for reminders; pooled treatments +21% weekly connections and **+0.10–0.12 SD** on an endline maths test (streak arm +0.13–0.17 SD). The authors state explicitly that they **do not observe a discouragement effect**. *However*: endline test participation was only **2.3% (~1,500 students)** with differential attrition favouring the streak arm, and the streak arm was not significantly different from the other treatment arms — so treat the engagement result as solid and the learning result as suggestive. It is also a preprint, and the population is 4th–6th graders, not a motivated adult professional.
- **Broken streaks do depress subsequent engagement, and repair blunts it.** Silverman & Barasch, *On or Off Track: How (Broken) Streaks Affect Consumer Decisions*, Journal of Consumer Research 49(6):1095–1117, online 30 Jun 2022 — https://academic.oup.com/jcr/article-abstract/49/6/1095/6623414. Seven studies: showing an *intact* streak increases engagement relative to a *broken* one **holding actual past behaviour constant**; the gap widens when the break is attributed internally and **narrows when the streak can be repaired**. Lab/online-panel, short horizon.
- **Theoretical risk is real but indirect:** violating a self-set behavioural goal can leave performance *worse than having set no goal* (Soman & Cheema, *When Goals Are Counterproductive*, Journal of Consumer Research 31(1):52–62, 2004 — https://www-2.rotman.utoronto.ca/facbios/file/goals.pdf); the "what-the-hell effect" term comes from Cochran & Tesser (1996).
- **Duolingo's streak numbers are industry A/B tests with no published methodology** — https://blog.duolingo.com/how-duolingo-streak-builds-habit/ (31 Jan 2022). The "7-day streak ⇒ 3.6× more likely to complete the course" figure is correlational and self-selected. The one directionally useful datapoint: *doubling* allowed streak freezes increased daily active learners by 0.38% — i.e. more forgiveness, more persistence.
- **Do not cite** the widely-circulated "63% more likely to abandon a habit after missing a single day" statistic. It is attributed inconsistently (variously to JPSP 2020 and CHI 2020), has no DOI or authors, and does not survive a source check.

**Recommendation for this app:** a daily streak is a poor fit for a learner with a *weekly* 10–15 hr budget and a job — it converts a weekly commitment into a daily obligation and punishes legitimate rest days. Build instead a **"weeks on plan" counter with two banked skips per quarter and automatic repair** (the Silverman & Barasch moderator, the Duolingo freeze direction, and the goal-violation risk all point the same way), shown **only in the weekly review**. Never a red flame on the home screen. Never a push notification about it.

### B4. **A single long progress bar for the 40-week track**
**Do not build.** The goal-gradient literature predicts exactly the failure: effort rises as the visible remaining distance shrinks (Kivetz, Urminsky & Zheng, *The Goal-Gradient Hypothesis Resurrected*, Journal of Marketing Research 43(1):39–58, 2006 — https://home.uchicago.edu/ourminsky/Goal-Gradient_Illusionary_Goal_Progress.pdf; ~20% acceleration toward card completion, p < .05, with acceleration diminishing and **resetting downward immediately after a reward is earned**, p < .01). A 40-week bar is maximally flat and demotivating for 35 of those weeks. The endowed-progress result (Nunes & Drèze, *The Endowed Progress Effect*, Journal of Consumer Research 32(4):504–512, 2006 — https://academic.oup.com/jcr/article-abstract/32/4/504/1787425; **19% → 34% completion**, ~300 customers) says a pre-advanced short bar beats an empty long one. Both are consumer-loyalty field studies, not learning studies — the transfer to effortful cognitive work is an assumption.
**Replacement:** per-module bars with visible near-term ends, plus the capstone artefact board (A6). Pre-credit the modules the learner's MSc already covers, explicitly and honestly ("2 of 6 checks in this module marked `known-prior` from your background — confirm by passing them cold").

### B5. **An "AI, summarise this paper / rewrite my notes" button** (as normally implemented)
**Do not build it as a producer.** See §D for the constrained version. Evidence: the Anthropic RCT (§0/P3), Bastani et al.'s PNAS field experiment, and Fan et al.'s "metacognitive laziness" finding that ChatGPT improved the *artefact* while leaving **knowledge gain and transfer unchanged** — which is precisely the failure mode of a notes-beautifier. All three cited in full in §D. Also note Dunlosky et al. 2013 rate **summarisation as low utility** even when the learner does it themselves.

### B6. **"Mark complete" on a module**
**Do not build.** Replace with the `durable` criterion (A2). A module with all boxes ticked and no passed delayed re-test is the exact artefact that P1 and P2 warn about.

### B7. **A recommendation engine / adaptive path that reorders the syllabus for you**
**Do not build (for this learner).** Autonomy support correlates with deep learning strategies (**r = .40, k = 10**) and mastery orientation (**r = .32**) while autonomy *thwarting* correlates negatively with performance (**r = −.19**) and — critically — is **unrelated to behavioural engagement**, meaning controlling designs can keep someone clicking while damaging motivational quality (Howard, Slemp & Wang, *Need Support and Need Thwarting: A Meta-Analysis…*, Personality and Social Psychology Bulletin, 30 Jan 2024, **8,693 correlations, 637 samples, N = 388,912** — https://selfdeterminationtheory.org/wp-content/uploads/2024/02/2024_HowardSlempWang_Meta.pdf). Caveat: this corpus is correlational and about teachers supporting students, not software. Still, for one adult who wrote his own 40-week plan, the app's job is to *execute and measure* the plan, not to second-guess it. Offer suggestions in the weekly review; never reorder silently.

### B8. **Daily notifications / reminders to study**
**Mostly do not build.** In the Northwestern RCT, reminders were the better *activation* lever for near-zero-engagement children (+3.8 pp extensive margin). This learner is not in that population — he already has a plan and a budget. One notification is defensible: the **if-then plan's own cue**, shown at the time the learner himself specified (A8), because rehearsal of the plan is a moderator of implementation-intention effects. Everything else is noise.

### B9. **"Time spent studying" as the headline metric**
**Do not build.** Deliberate practice explained **4% of variance in education and <1% in professions** (Macnamara, Hambrick & Oswald, Psychological Science 25(8):1608–1618, Jul 2014 — https://journals.sagepub.com/doi/abs/10.1177/0956797614535810). Performance goals also hurt during the declarative phase of a complex task relative to learning goals (Seijts & Latham 2005 — https://www-2.rotman.utoronto.ca/facbios/file/22%20-%20Seijts%20&%20Latham%20AME%202005.pdf). Hours are a **budget and a fatigue signal**, not a score.

### B10. **A rich learning-analytics dashboard**
**Do not build.** Most dashboard research measures perception, not behaviour or learning; RCTs are rare (Matcha et al., IEEE Transactions on Learning Technologies 13(2):226–245, 2020 — https://ieeexplore.ieee.org/document/8935080; systematic review update, Educational and Information Technologies, Jan 2024 — https://link.springer.com/article/10.1007/s10639-023-12401-4). Build five numbers (A6) and stop.

### B11. **Features justified by the Zeigarnik effect** (e.g. "we left your lesson unfinished so you'll remember it")
**Do not build.** Meta-analytically refuted: interrupted:completed recall ratio **0.99 across 37 studies** (Ghibellini & Meier, Humanities and Social Sciences Communications 12:962, 1 Jul 2025 — https://www.nature.com/articles/s41599-025-05000-w). The *resumption* tendency survives; the *memory* claim does not.

### B12. **Highlighting, and any "collect and organise" surface that is not retrieved from**
**Do not build.** Highlighting, underlining, rereading and summarisation are all **low utility** in Dunlosky et al. 2013 (https://gwern.net/doc/psychology/spaced-repetition/2013-dunlosky.pdf). A note graph you never test yourself against is a filing cabinet.

### B13. **Multiple-choice quiz generation**
**Do not build as the default.** With corrective feedback, short-answer practice transfers better (Kang, McDermott & Roediger 2007 — https://profiles.wustl.edu/en/publications/test-format-and-corrective-feedback-modify-the-effect-of-testing-/), and MCQs on this material would mostly test recognition of terms the learner already recognises. Acceptable only as a **warm-up** format for atomic facts where speed matters.

---

## C. Recommended flows

### C1. Session flow (target 2.5–3 h; the learner does 4–5 of these a week)

| Phase | Minutes | What the app does | Evidence |
|---|---|---|---|
| **0. Open** | 0 | App opens on the **if-then plan written last session**, verbatim, and a single button: *Start*. No dashboard, no feed. | Plan rehearsal moderates implementation-intention effects (Sheeran et al. 2024 — https://www.tandfonline.com/doi/abs/10.1080/10463283.2024.2334563) |
| **1. Warm-up retrieval** | 8–10 | 5–8 items, mixed: 3 FSRS atomic cards, 1 item from last session, 1 item from a module ≥4 weeks old, 1 unresolved error from the ledger. Typed or spoken, never multiple-choice unless purely factual. **Delayed JOL asked here**: "could you do <last session's check> cold right now?" before attempting it. | Testing effect (Adesope 2017, g = 0.61); interleaving (Rohrer 2015, d = 0.79); delayed-JOL accuracy (Nelson & Dunlosky 1991) |
| **2. Attempt before instruction** | 15–30 | The session's main Check is attempted **before** the resource is opened. Failure expected and recorded. | Productive failure: PS-I beats I-PS, **g = 0.36 [0.20, 0.51]**, 53 studies (Sinha & Kapur 2021 — https://journals.sagepub.com/doi/10.3102/00346543211019105); pretesting (Richland, Kornell & Kao 2009) |
| **3. Study block A** | 45–50 | Resource opened with its template (Keshav passes for a paper; forced stop-points for video). Notes must be typed as `mechanism` / `contrast` blocks. Self-explanation prompt fires at each stop-point. | System-paced segmenting, d = 0.42 retention (Rey et al. 2019); interpolated testing (Szpunar et al. 2013); self-explanation, g = 0.55 and g = .761 in CS (Bisra et al. 2018) |
| **4. Break** | 6–10 | Enforced, screen dark, a single deliberate goal-switch prompt (stand up, different task) rather than a phone. | Micro-breaks reduce fatigue and raise vigor, **22 samples, N = 2,335**, though performance benefits are weaker (Albulescu et al., PLOS ONE 17(8):e0272460, 2022 — https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0272460); brief goal deactivation prevented the vigilance decrement entirely (Ariga & Lleras, Cognition 118(3):439–443, 2011 — https://doi.org/10.1016/j.cognition.2010.12.007) |
| **5. Build block** | 45–60 | Code/derivation work on the module or the capstone artefact. Blank-page ladder (A11). AI is available **only in Ask mode** (§D). | Anthropic RCT (§D); backward-faded worked examples with principle prompts (Atkinson, Renkl & Merrill 2003) |
| **6. Re-attempt the Check** | 10–20 | The same Check from phase 2, now attempted properly. Confidence slider before submitting. Diff against reference, write the `diff-diagnosis`. | Generation effect (d = 0.40); hypercorrection (Butterfield & Metcalfe 2001) |
| **7. Close** | 8–10 | Three required fields: (a) **one-paragraph reflection** — what changed in my understanding today, what I still can't do; (b) **next session's if-then plan**; (c) anything to add to the error ledger. Then the app shows the next-session queue and shuts. | Reflection: Wipro field experiment, **+22.8%** vs more practice, 10 studies N = 4,340 (Di Stefano et al. — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2414478); implementation intentions (d = 0.65) |

**Notes on the flow.**
- The *only* numbers shown mid-session are the timer and the phase. Everything evaluative waits for the close.
- Timing structure is worth having but do not oversell it: the one randomised test of Pomodoro-style breaks found **no difference in productivity, task completion or flow** between fixed and self-regulated breaks; the benefits were **mood and efficiency**, and self-regulators reported higher fatigue and distraction (Biwer, Wiradhany, oude Egbrink & de Bruin, *Understanding effort regulation: Comparing "Pomodoro" breaks and self-regulated breaks*, British Journal of Educational Psychology, 2 Mar 2023, N = 87 — https://pubmed.ncbi.nlm.nih.gov/36859717/). So: enforce breaks for sustainability, not because they raise output.
- **Fatigue rule:** cap at 3 hours and refuse to start a phase-5 build block after 2.5 h of elapsed session time. Log a 1–5 fatigue rating at close and correlate it with next-session Check scores; after 40 weeks this learner will know his own curve, which is worth more than any published average.

### C2. Weekly review flow (45–60 min, same slot every week, non-negotiable)

1. **Cold retrieval sweep (15 min).** 10 items sampled across all modules touched so far, weighted toward `overconfident-miss` tags and toward modules not seen in 3+ weeks. This is the interleaving engine.
2. **Calibration read-out (5 min).** Brier score and reliability plot for the week. One sentence: *"You were overconfident on evaluation statistics and well-calibrated on transformer internals."*
3. **Error ledger triage (10 min).** Every unresolved error either (a) gets resolved with a written explanation, (b) becomes an atomic card, or (c) becomes a new Check. Nothing stays unfiled.
4. **Hours vs budget and burn-up (5 min).** Stacked bar: new / review / build. Modules `durable` vs planned. Realised vs estimated minutes for the module (the planning-fallacy feedback loop).
5. **Capstone artefact board (10 min).** For each artefact: what moved, what is blocked, what is the single next action. This is the only place long-horizon progress is displayed.
6. **Re-plan (10 min).** Adjust next week's module scope to the *observed* rate, not the planned rate. Write next week's four if-then plans. Then close.

Run the review **at the same time every week** and treat it as a session — it is the highest-leverage hour in the schedule, because it is where interleaving, calibration, error consolidation and re-planning all happen.

---

## D. Guidance for the AI-assisted note feature

### D1. What the evidence actually says

| Study | Design | Result |
|---|---|---|
| **Anthropic, *How AI assistance impacts the formation of coding skills*, 29 Jan 2026** — https://www.anthropic.com/research/AI-assistance-coding-skills · preprint https://arxiv.org/html/2601.20245v1 | RCT, **N = 52** (26/26) experienced Python developers new to the Trio async library; AI assistant vs web/docs only; 35-min tasks; 14-question evaluation of conceptual understanding, code reading and debugging | AI group **50% vs 67%** on the quiz — a **17% gap, Cohen's d = 0.738, p = 0.010** — with **no significant speed advantage**. Usage pattern decided the outcome: **conceptual-inquiry** users averaged **≥65%**; **AI-delegation** users scored **<40%** despite finishing fastest. Authors: "AI-enhanced productivity is not a shortcut to competence"; cognitive effort, "and even getting painfully stuck," matters. |
| **Bastani et al., *Generative AI without guardrails can harm learning: Evidence from high school mathematics*, PNAS 122(26), Jun 2025** — https://www.pnas.org/doi/10.1073/pnas.2422633122 | Field experiment, ~1,000 students, ~50 classes, 4 × 90-min sessions; GPT-Base vs GPT-Tutor (hints only, teacher-authored guardrails) vs control | With access: **+48%** (Base) and **+127%** (Tutor) on practice performance. **When access was removed, the unguarded GPT-Base group underperformed the control group.** The guardrailed tutor did not harm. The guardrail *is* the intervention. |
| **Fan et al., *Beware of metacognitive laziness*, British Journal of Educational Technology 56:489–530, 2025** — https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/bjet.13544 | Randomised comparison of ChatGPT support vs human expert vs checklist | ChatGPT group produced **better essays** but **no significant advantage in knowledge gain or transfer**; the authors warn of dependence and "metacognitive laziness." **This is the exact failure mode of a notes-beautifier: the artefact improves, the learner does not.** |
| **Kestin, Miller, Klales et al., *AI tutoring outperforms in-class active learning: an RCT…*, Scientific Reports 15:17458, 3 Jun 2025** — https://www.nature.com/articles/s41598-025-97652-6 · coverage https://news.harvard.edu/gazette/story/2024/09/professor-tailored-ai-tutor-to-physics-course-engagement-doubled/ (16 Sep 2024) | Crossover RCT, **N = 194** Harvard physics students, AI-tutored homework vs in-class active learning | **Median learning gains more than double**, ~30% higher post-test, in **less** time (median 49 min vs ~60 min), with higher self-reported engagement. **The constraints are the finding**: the tutor gave **one step at a time**, never the full solution in a message, kept replies to a few sentences, pushed the student to try first, and was given an answer key to suppress hallucination. Limitations: immediate post-test only, custom instruments, one course, proctored sessions, no independent replication. |

**The synthesis is unusually clean for this literature: AI helps when it asks and constrains; it hurts when it produces.**

### D2. The rule

> **The AI may interrogate, critique, diff, and translate the learner's own material. It may not generate, summarise, improve, or complete it.**

### D3. Modes to build (and only these)

**Mode 1 — "Ask me questions about this note" (default, and the most valuable).**
The AI reads the note and returns 3–6 questions only, no answers, no commentary. Directly modelled on the Anthropic RCT's conceptual-inquiry pattern, inverted so the AI does the asking.
System-prompt constraints:
```
You are given the learner's own note. Output ONLY questions.
- 3-6 questions, one line each, no preamble, no answers, no hints.
- At least one must target a MECHANISM the note asserts but does not explain.
- At least one must be a contrast question against the nearest alternative technique.
- At least one must be answerable only by running code or doing arithmetic.
- Never introduce a fact, name, or number that is not in the note.
- If the note is too thin to question, say exactly: "This note has no claims to question yet."
```
Answers are typed by the learner into the note, and each becomes a candidate Check.

**Mode 2 — "Critique my explanation" (grader, not author).**
Input: the learner's Check response plus the stored rubric. Output: per-rubric-line `met / partial / missing` plus a one-line quotation of the learner's own text as evidence. **No rewritten version is produced.** Give this mode the reference answer as a key (the Kestin hallucination guard) but forbid it from quoting the key until the learner has submitted.

**Mode 3 — "Tidy, don't touch" (the constrained version of "beautify my notes").**
This is the only mode that edits, and it is deliberately crippled:
- **Allowed:** fix spelling/typos; normalise heading levels and list markers; wrap code in fenced blocks with a language tag; convert ASCII math to KaTeX **without changing any symbol**; split a wall of text into paragraphs; deduplicate an exact repeated sentence.
- **Forbidden:** adding a sentence, adding a fact, adding a citation, adding an example, strengthening or hedging a claim, reordering arguments, replacing the learner's phrasing with more standard terminology, or "clarifying" anything.
- **Diff is mandatory.** Render a word-level diff; the learner accepts hunk by hunk. Never auto-apply.
- **Hard gate:** if the model's output adds more than ~10% new tokens, or introduces any noun phrase absent from the input, **reject the whole edit** and show the reason. Implement this as a programmatic check outside the model, because the model will not reliably police itself.
- Store `note.human_share` = fraction of surviving tokens the learner typed. Surface it in the weekly review. A note below ~90% is flagged.
System prompt sketch:
```
Copy-edit the note below. You may fix spelling, punctuation, markdown structure,
code fences, and LaTeX rendering ONLY.
You MUST NOT add, remove, or alter any claim, fact, number, name, or example.
You MUST NOT improve the wording, standardise the terminology, or reorder content.
Preserve the author's voice and hedging exactly, including informal phrasing.
If you are unsure whether a change alters meaning, do not make it.
Return the edited markdown and nothing else.
```

**Mode 4 — "Find the contradiction" (safe and genuinely useful).**
Compares a new note against the learner's existing notes and surfaces *conflicts and near-duplicates* — "your week-7 note says RoPE is applied to queries and keys; this one says queries only." Output is a pointer to two of the learner's own passages, never an adjudication of which is right. That adjudication is a Check.

**Mode 5 — "Socratic unstick" (rate-limited).**
Available only *after* 10 minutes of recorded stuck time on a Check. Constraints copied from the PS2 Pal design (Kestin et al. 2025): **one step at a time, never the full solution, a few sentences maximum, always end by asking the learner to try the next step.** Rate-limit to 3 uses per session and log every use against the Check — if a Check needed unsticking, it cannot reach `durable` without a clean, unassisted re-test.

### D4. UX rules

1. **AI is never the default surface.** No chat box on the home screen, no inline autocomplete in the notes editor, no "improve" button in the toolbar. Every AI mode is reached by an explicit menu.
2. **AI is disabled entirely during phase 2 and phase 6** (attempt and re-attempt). Enforce in the app, not by willpower — this is the single most important UX decision in the whole design, because it is the one the Anthropic RCT most directly supports.
3. **Every AI interaction is logged and visible**: mode, timestamp, the Check or note it touched, and tokens added. The weekly review shows an **AI-assistance ledger**: "this week, 61% of your AI calls were question-asking, 39% were unsticking, 0% were generation." The Anthropic RCT says this ratio is the variable that predicted mastery, so make it the one AI-related number the learner sees.
4. **Provenance is permanent.** Any AI-touched span keeps a subtle marker and is excluded from `human_share`. A Check response that contains AI-touched text cannot be marked `durable`.
5. **Local-first**: run these modes against a local model where possible, and keep every prompt/response pair on disk. The constraints above are what make a small local model adequate — asking good questions and copy-editing are far easier than generating correct content about flash-attention.

---

## E. Build order (practical)

1. **Weeks 1–2:** Modules, Checks, Attempts, the reveal gate, the error ledger. Nothing else. This alone captures most of the available effect.
2. **Week 3:** Session flow with warm-up and forced close (reflection + if-then plan).
3. **Week 4:** Delayed re-test scheduling and the `durable` state. *Now* the app is doing successive relearning.
4. **Week 5:** FSRS for atomic cards (use `py-fsrs` / `fsrs-rs`; https://github.com/open-spaced-repetition), time-boxed queue.
5. **Week 6:** Resource ladder + paper/video templates.
6. **Week 7:** Weekly review screen, calibration read-out, capstone artefact board.
7. **Week 8:** AI modes 1, 2 and 4. Modes 3 and 5 last, and only with the programmatic guards in place.

Everything in §B stays unbuilt, permanently.

---

## F. Source list (chronological)

- Zeigarnik 1927, *Psychologische Forschung* 9:1–85 — historical only; see Ghibellini & Meier 2025.
- Shneiderman 1976, memorisation/reconstruction as a programmer-expertise probe — https://doi.org/10.1007/BF00975629
- Slamecka & Graf 1978, generation effect, JEP:HLM 4(6):592–604 — https://notes.andymatuschak.org/zWvCEwYz4Uv1dMHXynq3H5w
- McKeithen, Reitman, Rueter & Hirtle 1981, knowledge organisation in programmers — https://doi.org/10.1016/0010-0285(81)90012-8
- Sweller & Cooper 1985, worked examples — https://www.tandfonline.com/doi/abs/10.1207/s1532690xci0201_3
- Chi et al. 1989, self-explanations — https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog1302_1
- Nelson & Dunlosky 1991, delayed-JOL effect — https://journals.sagepub.com/doi/10.1111/j.1467-9280.1991.tb00147.x
- Buehler, Griffin & Ross 1994, planning fallacy — https://www.semanticscholar.org/paper/f91964dad8c0e54cd58b1aa99e430b900fcf082b
- Chi et al. 1994, eliciting self-explanations — https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog1803_3
- Deci, Koestner & Ryan 1999, rewards meta-analysis — https://home.ubalt.edu/tmitch/642/articles%20syllabus/Deci%20Koestner%20Ryan%20meta%20IM%20psy%20bull%2099.pdf
- Butterfield & Metcalfe 2001, hypercorrection — https://pubmed.ncbi.nlm.nih.gov/11713883/
- Rozenblit & Keil 2002, illusion of explanatory depth — https://onlinelibrary.wiley.com/doi/10.1207/s15516709cog2605_1
- Atkinson, Renkl & Merrill 2003, fading + self-explanation prompts — https://psycnet.apa.org/record/2003-09547-012
- Kalyuga et al. 2003, expertise reversal — https://www.tandfonline.com/doi/abs/10.1207/S15326985EP3801_4
- Soman & Cheema 2004, goal violation — https://www-2.rotman.utoronto.ca/facbios/file/goals.pdf
- Seijts & Latham 2005, learning vs performance goals — https://www-2.rotman.utoronto.ca/facbios/file/22%20-%20Seijts%20&%20Latham%20AME%202005.pdf
- Cepeda et al. 2006, distributed practice meta-analysis — https://augmentingcognition.com/assets/Cepeda2006.pdf
- Roediger & Karpicke 2006, test-enhanced learning — https://colinallen.dnsalias.org/Readings/2006_Roediger_Karpicke_PsychSci.pdf
- Gollwitzer & Sheeran 2006, implementation intentions — https://kops.uni-konstanz.de/handle/123456789/10973
- Davis et al. 2006, physician self-assessment — https://jamanetwork.com/journals/jama/fullarticle/203258
- Kivetz, Urminsky & Zheng 2006, goal gradient — https://home.uchicago.edu/ourminsky/Goal-Gradient_Illusionary_Goal_Progress.pdf
- Nunes & Drèze 2006, endowed progress — https://academic.oup.com/jcr/article-abstract/32/4/504/1787425
- Bertsch et al. 2007, generation effect meta-analysis — https://mcdaniel97.github.io/Publications/Bertsch%20et%20al.%202007.pdf
- Kang, McDermott & Roediger 2007, test format + feedback — https://profiles.wustl.edu/en/publications/test-format-and-corrective-feedback-modify-the-effect-of-testing-/
- Butler, Karpicke & Roediger 2007, feedback timing — https://learninglab.psych.purdue.edu/downloads/2007/2007_Butler_Karpicke_Roediger_JEPA.pdf
- Keshav 2007, *How to Read a Paper*, ACM SIGCOMM CCR 37(3) — https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf
- Cepeda et al. 2008, temporal ridgeline of optimal retention — https://laplab.ucsd.edu/articles/Cepeda%20et%20al%202008_psychsci.pdf
- Forsyth & Burt 2008, task segmentation — https://link.springer.com/article/10.3758/MC.36.4.791
- Richland, Kornell & Kao 2009, pretesting — https://learninglab.uchicago.edu/Pre-Testing_files/RichlandKornellKao.pdf
- Ariga & Lleras 2011, vigilance decrement / deactivation — https://doi.org/10.1016/j.cognition.2010.12.007
- Karpicke & Blunt 2011, retrieval vs concept mapping — https://learninglab.psych.purdue.edu/downloads/2011/2011_Karpicke_Blunt_Science.pdf
- Masicampo & Baumeister 2011, plan making — https://users.wfu.edu/masicaej/MasicampoBaumeister2011JPSP.pdf
- Butler, Fazio & Marsh 2011, hypercorrection persistence — https://link.springer.com/article/10.3758/s13423-011-0173-y
- Amabile & Kramer 2011, *The Power of Small Wins*, HBR May 2011 — https://hbr.org/2011/05/the-power-of-small-wins
- Dunlosky et al. 2013, learning techniques review — https://gwern.net/doc/psychology/spaced-repetition/2013-dunlosky.pdf
- Szpunar, Khan & Schacter 2013, interpolated tests — https://www.pnas.org/doi/10.1073/pnas.1221764110
- Fiorella & Mayer 2013, learning by teaching — https://www.sciencedirect.com/science/article/abs/pii/S0361476X13000209
- Macnamara, Hambrick & Oswald 2014, deliberate practice — https://journals.sagepub.com/doi/abs/10.1177/0956797614535810
- Zell & Krizan 2014, insight into abilities — https://doi.org/10.1177/1745691613518075
- Mueller & Oppenheimer 2014, pen vs keyboard — https://journals.sagepub.com/doi/10.1177/0956797614524581
- Nestojko et al. 2014, expecting to teach — https://link.springer.com/article/10.3758/s13421-014-0416-z
- Cerasoli, Nicklin & Ford 2014, intrinsic + extrinsic 40-year meta-analysis — https://selfdeterminationtheory.org/wp-content/uploads/2017/06/2014_Cerasoli_Intrinsic.pdf
- Di Stefano, Gino, Pisano & Staats 2014/2016, learning by thinking — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2414478
- Soderstrom & Bjork 2015, learning vs performance — https://journals.sagepub.com/doi/abs/10.1177/1745691615569000
- Rohrer, Dedrick & Stershic 2015, interleaved maths — http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer_et_al_2015JEdPsych.pdf
- van Gog & Sweller 2015 and Karpicke & Aue 2015 (exchange) — https://link.springer.com/article/10.1007/s10648-015-9309-3
- Hanus & Fox 2015, gamification longitudinal — https://www.sciencedirect.com/science/article/abs/pii/S0360131514001997
- Dunlosky & Rawson 2015, practice tests / successive relearning — https://www.apa.org/pubs/journals/features/stl-0000024.pdf
- Metcalfe 2017, learning from errors — https://www.annualreviews.org/doi/10.1146/annurev-psych-010416-044022
- Adesope, Trevisan & Sundararajan 2017, practice testing meta-analysis — https://journals.sagepub.com/doi/abs/10.3102/0034654316689306
- Bisra, Liu, Nesbit, Salimi & Winne 2018, self-explanation meta-analysis (g = 0.55) — https://link.springer.com/article/10.1007/s10648-018-9434-x
- Rittle-Johnson, Loehr & Durkin 2017, self-explanation in mathematics — https://eric.ed.gov/?id=EJ1149060
- Ericson, Margulieux & Rick 2017, Parsons vs fixing/writing code — https://doi.org/10.1145/3141880.3141895
- Ericson, Foley & Rick 2018, adaptive Parsons problems — https://doi.org/10.1145/3230977.3231000
- Morehead, Dunlosky & Rawson 2019, note-taking replication — https://link.springer.com/article/10.1007/s10648-019-09468-2
- Rey et al. 2019, segmenting-effect meta-analysis — https://link.springer.com/article/10.1007/s10648-018-9456-4
- Kobayashi 2019, learning-by-teaching meta-analysis (g ≈ 0.35 / 0.56) — https://onlinelibrary.wiley.com/doi/10.1111/jpr.12221
- Lopez, Whalley, Robbins & Lister 2008, reading/tracing/explaining/writing hierarchy — https://dl.acm.org/doi/10.1145/1404520.1404531
- Sailer & Homner 2020, gamification meta-analysis — https://eric.ed.gov/?id=EJ1245270
- Bai, Hew & Huang 2020, gamification meta-analysis — https://www.sciencedirect.com/science/article/abs/pii/S1747938X19302908
- Matcha et al. 2020, learning-analytics dashboards review — https://ieeexplore.ieee.org/document/8935080
- Urry et al. 2021, multi-site note-taking replication (g = 0.04) — https://static1.squarespace.com/static/587ea259197aea1c1d66ec5b/t/601f2ac8268c6a7b9735c877/1612655305004/Urryetal_PSCI_2021.pdf
- Guerrero & Wiley 2021, expecting to teach — https://files.eric.ed.gov/fulltext/ED624662.pdf
- Donoghue & Hattie 2021, meta-analysis of ten learning techniques (contested) — https://www.frontiersin.org/articles/10.3389/feduc.2021.581216/full
- Reyes et al. 2021, the only named test of the Feynman technique (weak) — https://rmrj.usjr.edu.ph/rmrj/index.php/RMRJ/article/download/958/243/5090
- Fiorella 2021/2023, Learning by Teaching (boundary conditions) — https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-learning-by-teaching-fiorella.pdf
- Ericson, Margulieux et al. 2021, Parsons vs writing code (CHI) — https://doi.org/10.1145/3411764.3445292
- Du, Luxton-Reilly & Denny 2020, Parsons review (under-replicated) — https://doi.org/10.1145/3373165.3373187
- Sinha & Kapur 2021, productive failure meta-analysis — https://journals.sagepub.com/doi/10.3102/00346543211019105
- Barbieri et al. 2023, worked-examples meta-analysis (g = 0.48) — https://link.springer.com/article/10.1007/s10648-023-09745-1
- Albulescu et al. 2022, micro-breaks meta-analysis — https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0272460
- Rawson & Dunlosky 2022, successive relearning — https://journals.sagepub.com/doi/full/10.1177/09637214221100484
- Silverman & Barasch 2022/2023, broken streaks — https://academic.oup.com/jcr/article-abstract/49/6/1095/6623414
- Biwer et al. 2023, Pomodoro vs self-regulated breaks — https://pubmed.ncbi.nlm.nih.gov/36859717/
- Howard, Slemp & Wang 2024, need support meta-analysis — https://selfdeterminationtheory.org/wp-content/uploads/2024/02/2024_HowardSlempWang_Meta.pdf
- Sheeran, Listrom & Gollwitzer 2024, implementation intentions update — https://www.tandfonline.com/doi/abs/10.1080/10463283.2024.2334563
- Bastani et al. 2025, GenAI without guardrails, PNAS — https://www.pnas.org/doi/10.1073/pnas.2422633122
- Fan et al. 2025, metacognitive laziness, BJET — https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/bjet.13544
- Kestin et al. 2025, AI tutoring RCT, Scientific Reports — https://www.nature.com/articles/s41598-025-97652-6
- Ghibellini & Meier 2025, Zeigarnik/Ovsiankina meta-analysis — https://www.nature.com/articles/s41599-025-05000-w
- Anthropic 2026, AI assistance and coding skill formation — https://www.anthropic.com/research/AI-assistance-coding-skills
- Aulagnon, Cristia, Cueto & Malamud 2026, streaks RCT (preprint) — https://www.ipr.northwestern.edu/documents/working-papers/2026/wp-26-05.pdf
- FSRS benchmark, open-spaced-repetition (10,000 collections / 519M reviews) — https://github.com/open-spaced-repetition/srs-benchmark
