# AI Evaluation & Reliability Engineering — Curriculum

**Compiled:** 2026-09-18
**Learner profile:** MSc Data Science (2022); strong classical statistics and ML evaluation (CV, metrics, hypothesis testing); new to LLM-specific evaluation. Target role: the person on a team who can *prove* whether an LLM / RAG / agent system works.
**Budget:** 10–15 hrs/week. Total syllabus below ≈ **120–150 hours** (~10–12 weeks at 12 hrs/week).

> **Standing bias of this curriculum:** your existing stats background is an asset that most people entering evals do *not* have, but it is not the bottleneck. The bottleneck in 2026 evals practice is **qualitative**: error analysis, open/axial coding of traces, and building a taxonomy of failures before you write a single metric. Budget your time accordingly — roughly 40% qualitative process, 35% engineering, 25% statistics.

---

## Why this field, right now (employer signal)

- "AI Evals Engineer" / "LLM Evaluation Engineer" / "Agent Quality Engineer" have become standalone job titles rather than a bullet inside a Senior MLE JD — see [jobsbyculture career guide, 2026](https://jobsbyculture.com/blog/ai-evals-engineer-career-guide-2026) and [herohunt recruiting guide, 2026](https://www.herohunt.ai/blog/how-to-recruit-ai-evals-engineers-2026/). *(Secondary/SEO sources — treat the trend as directional, not the numbers.)*
- Primary-source corroboration: Anthropic staffs a dedicated **Research Engineer, Model Evaluations** role, and its engineering org published a full agent-evals playbook in Jan 2026 ([Anthropic Engineering, 2026-01-09](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)).
- The AI Engineer World's Fair ran a dedicated **Evals track** on Day 3 of its 2026 edition (June 29 – July 2, 2026, Moscone West) — [ai.engineer/worldsfair/2026](https://ai.engineer/worldsfair/2026), [printable schedule PDF](https://www.ai.engineer/worldsfair/schedule.pdf). Recorded talks land free on the AI Engineer YouTube channel.
- The canonical practitioner course is the **top-grossing course on Maven** and has trained 4,000+ students as of 2026 (see §A1).

---

# A) Ranked list — courses, books, and references (2025–2026)

Ranked by *value per hour to this specific learner*. Each entry carries evidence, cost, hours, recency, and a verdict.

Verdicts: **MUST-DO** / **STRONG** / **OPTIONAL** / **REFERENCE** / **STALE — avoid or historical only**

---

## TIER 1 — MUST-DO (the spine of the curriculum)

### A1. Hamel Husain & Shreya Shankar — *AI Evals for Engineers & PMs* (Maven)
- **URL:** https://maven.com/parlance-labs/evals
- **Cost:** $4,200 USD. **Hours:** 3–5 hrs/week × 4 weeks; 15 live sessions across ~6 weeks.
- **Next cohort:** Oct 10 – Nov 21, 2026 — page states *"The Oct 10 cohort is the last one of 2026"*; the September 2026 cohort sold out, and the material was fully refreshed for it.
- **Evidence of value:** Maven's top-grossing course. Testimonials on the landing page from **Simon Willison**, **Harrison Chase** (LangChain CEO), **Eugene Yan** (Amazon). Featured in Lenny's List. Students drawn from OpenAI, Google, Meta, Amazon, Microsoft. 4,000+ students taught as of 2026 ([Hamel, 2026-03-02](https://hamel.dev/blog/posts/evals-skills/)). Includes lifetime access to recordings and all future cohorts, plus a 1,000+ member private Discord.
- **Syllabus (11 lessons / 15 sessions):** agent foundations → designing for evaluability → error analysis and failure-mode identification → LLM-as-judge and code-based evaluator design → CI/CD regression testing → red-teaming and safety → cost/latency/accuracy optimisation.
- **Verdict: MUST-DO if your employer will pay.** If not, §A2 + §A3 + §A4 recover an estimated 70% of the content for free. The irreplaceable parts are the graded homework, office hours, and the Discord/job network.

### A2. Hamel Husain & Shreya Shankar — *The AI Evals FAQ* (free)
- **URL:** https://hamel.dev/blog/posts/evals-faq/ · PDF: https://hamel.dev/blog/posts/evals-faq/evals-faq.pdf
- **Published 2025-05-28; last modified 2026-09-17** — the single most actively-maintained free eval reference in existence.
- **Cost:** free. **Hours:** 8–12 to read properly and take notes.
- **Coverage:** 7 sections — Getting Started; Error Analysis & Data Collection; Evaluation Design & Methodology; Human Annotation & Process; Tools & Infrastructure; Production & Deployment; Domain-Specific (RAG, multi-turn, agentic, chunk size, human handoff). Distilled from questions asked by 700+ course participants.
- **Verdict: MUST-DO. This is the highest value-per-hour artefact in the entire field.** Read it twice: once now, once after Module 3.

### A3. Hamel Husain & Shreya Shankar — free 17-part email course + 2 e-books
- **URL:** https://ai.hamel.dev/eval-course
- **Cost:** free. **Hours:** ~6–8. Content drawn from material taught to 2,000+ engineers/PMs.
- **Covers:** the *Analyze–Measure–Improve* lifecycle — error analysis, data generation, custom evaluators, human-in-the-loop, complex pipelines (RAG + multi-turn). Ships two free e-books: *Consolidated LLM Evals FAQ* and *Advanced RAG Optimization & Evals*.
- **Verdict: MUST-DO.** Do this first — it is the cheapest possible orientation.

### A4. Shreya Shankar & Hamel Husain — *Evals for AI Engineers* (O'Reilly)
- **URL:** https://www.oreilly.com/library/view/evals-for-ai/9798341660717/ · Amazon: https://www.amazon.com/Evals-Engineers-Systematically-Measuring-Applications/dp/B0GTYQTYDP (ISBN 9798341660724)
- **Release date: 2026-10-31** (six weeks from today). Early-release chapters are readable **now** on O'Reilly Learning (Ch.1 Introduction, Ch.2 LLMs and Evaluation Basics are live).
- **Cost:** ~$50 print, or included in an O'Reilly subscription (~$49/mo). **Hours:** 20–25.
- **Evidence:** written by the two practitioners who define the field's vocabulary; draws on consulting across 35+ AI products. Covers error analysis, synthetic data generation, automated LLM-as-judge, production monitoring, cost optimisation.
- **Verdict: MUST-DO — this is the 2026 book on evals.** Read early-release chapters now; buy on release. Note the naming collision: the *book* is "Evals for AI Engineers"; the *course* is "AI Evals for Engineers & PMs."

### A5. Anthropic — *Demystifying evals for AI agents*
- **URL:** https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents — **published 2026-01-09**
- **Cost:** free. **Hours:** 2 (read + take notes).
- **Why it matters:** the best single primary-source document on **agent** evaluation. Defines the working vocabulary (task, trial, grader, transcript, outcome, eval harness vs agent harness); the three grader types (code-based / model-based / human) with honest trade-offs; per-domain technique guidance (coding agents → unit tests + static analysis; conversational → LLM-judge rubrics + state checks; research agents → groundedness/coverage/source quality; computer-use → environment-state inspection + screenshot verification); an **8-step roadmap** (start with 20–50 tasks from real failures; convert manual test cases; unambiguous specs with reference solutions; balanced positive/negative sets; isolated clean environments; graders that resist agent exploits; regular transcript review; monitor for eval saturation); and the **pass@k vs pass^k** distinction. Frames evals as one layer of a "Swiss Cheese Model" alongside production monitoring, A/B tests, user feedback and human studies. Named customer example: Descript moving from manual grading to LLM graders with periodic human calibration.
- **Verdict: MUST-DO.**

### A6. Hamel Husain — the core blog trilogy
| Post | Date | Hours | Why |
|---|---|---|---|
| [Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/) | 2024-03-29 | 1.5 | The three-level model: L1 unit tests/assertions (pytest-style), L2 human & model eval (traces, custom viewers, judge alignment), L3 A/B testing. Older but **not stale** — it is the field's founding text and the level model is still how everyone talks. |
| [A Field Guide to Rapidly Improving AI Products](https://hamel.dev/blog/posts/field-guide/) | 2025-03-24 | 2 | Error analysis first; **build custom data viewers** (claims 10× faster iteration than generic labelling platforms); empower domain experts; ground synthetic data in real constraints; binary pass/fail + written critique over Likert; experiment-based roadmaps. |
| [Creating a LLM-as-a-Judge That Drives Business Results](https://hamel.dev/blog/posts/llm-judge/) | 2024-10-29, **mod. 2026-09-01** | 2 | The **Critique Shadowing** 7-step method: find the Principal Domain Expert → diverse dataset → binary judgments *with written critiques* → fix obvious errors → iterate the judge prompt → error analysis → specialised judges. Explicit: measure **TPR and TNR separately, not accuracy**, because agreement misleads on imbalanced data. |
- **Also worth reading:** [Selecting the Right AI Evals Tool](https://hamel.dev/blog/posts/eval-tools/) (2025-10-01), ["It's Hard to Eval" Is a Product Smell](https://hamel.dev/blog/posts/eval-smell/), [How to Sample Production Traces for Review](https://hamel.dev/blog/posts/evals-faq/how-can-i-efficiently-sample-production-traces-for-review.html). Index: https://hamel.dev/notes/llm/evals/
- **Verdict: MUST-DO (all three core posts).**

### A7. `ai-evals-course/evals-skills` — Claude/coding-agent skills for evals
- **URLs:** https://hamel.dev/blog/posts/evals-skills/ (**published 2026-03-02, mod. 2026-08-31**) · repo https://github.com/ai-evals-course/evals-skills · install `npx skills add https://github.com/ai-evals-course/evals-skills`
- **Cost:** free. **Hours:** 3 to work through; then ongoing use.
- **Eight skills:** `evals-start` (router) · `eval-audit` (audit a pipeline, severity-ranked) · `error-discovery` (build a review app, sample diversely, organise notes into failure modes) · `generate-synthetic-data` (dimension-based tuple generation) · `write-judge-prompt` · `validate-evaluator` (**calibrate judges against human labels using data splits, TPR/TNR, and bias correction**) · `evaluate-rag` · `build-review-interface`.
- **Verdict: MUST-DO.** This is the course's methodology in executable form — the single best free proxy for the paid curriculum, and the *most 2026-current* artefact in the list.

### A8. `judgy` — bias-corrected success-rate estimation with CIs
- **URL:** https://github.com/ai-evals-course/judgy (97 stars)
- **Method:** **Rogan–Gladen correction** — θ̂ = (p_obs + TNR − 1) / (TPR + TNR − 1) — followed by bootstrap resampling for a 95% CI. API: `estimate_success_rate(human_labels, judge_preds_on_labelled, judge_preds_on_unlabelled)` → point estimate + CI bounds. Requires the judge to beat chance. Python 3.8+, NumPy ≥1.20.
- **Verdict: MUST-DO.** This is *your* edge as a statistician. It is epidemiology's sensitivity/specificity prevalence correction, reapplied to LLM judges; you already understand the maths, and almost nobody entering this field does.

---

## TIER 2 — STRONG (do most of these)

### A9. Evan Miller (Anthropic) — *Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations*
- **URL:** https://arxiv.org/abs/2411.00640 — submitted **2024-11-01**; Anthropic write-up "A statistical approach to model evaluations" announced 2024-11-20 ([announcement](https://x.com/AnthropicAI/status/1858976458330505639)).
- **Hours:** 4. **Cost:** free.
- **Core move:** treat eval questions as drawn from an unseen super-population, which licenses standard experimental-design machinery. Five recommendations covering: CLT-based error bars; clustered standard errors for multi-question items; variance reduction; **paired differences when comparing two models on the same questions** (the single biggest practical win); and power analysis for deciding how many questions you need.
- **Verdict: STRONG — and for you, do this early.** It is the one paper where your MSc directly transfers on day one. *Caveat:* this is **model/benchmark-level** statistics, not product-level; it does not cover judge miscalibration (that's §A8).
- Reference implementation (third-party, unofficial): https://github.com/The-Swarm-Corporation/StatisticalModelEvaluator

### A10. Eugene Yan — evals writing
| Post | Date | Note |
|---|---|---|
| [Product Evals in Three Simple Steps](https://eugeneyan.com/writing/eval-process/) *(see also the eval-process URL)* | 2025-11-23 | "Label some data, align LLM-evaluators, and run the eval harness with each change." The tightest statement of the loop. |
| [An LLM-as-Judge Won't Save The Product—Fixing Your Process Will](https://eugeneyan.com/writing/eval-process/) | 2025-04-20 | Six-step scientific loop: observation → annotation → hypothesis → experimentation → measurement → iteration. Concrete annotation guidance: aim for **a 50:50 pass/fail split spanning the input distribution**. |
| [Evaluating the Effectiveness of LLM-Evaluators (aka LLM-as-Judge)](https://eugeneyan.com/writing/llm-evaluators/) | 2024-08-18 | Survey of ~24 papers: use cases, prompting techniques, alignment workflows, fine-tuned evaluator models, critiques. Still the best single literature review on judges. |
| [Patterns for Building Cybersecurity Evals](https://eugeneyan.com/writing/) | 2026-06-21 | "A sandboxed target, inputs that influence task difficulty, tools, and a grader." Template for any *capability* eval, not just security. |
| [Evaluating Long-Context Question & Answer Systems](https://eugeneyan.com/writing/) | 2025-06-22 | Metrics, dataset construction, methodology, benchmark reviews. |
| [AlignEval: Building an App to Make Evals Easy, Fun, and Automated](https://eugeneyan.com/writing/) | 2024-10-27 | Working demo of label → align → optimise. Good build-your-own-tool reference. |
- Index: https://eugeneyan.com/tag/eval/
- **Verdict: STRONG.** Read the top three; skim the rest.

### A11. Hugging Face — *Evaluation Guidebook*
- **Canonical (maintained) URL:** https://huggingface.co/spaces/OpenEvals/evaluation-guidebook
- **GitHub mirror (⚠️ NO LONGER MAINTAINED as of Dec 2025):** https://github.com/huggingface/evaluation-guidebook
- **Author context:** written by Clémentine Fourrier et al. from running the Open LLM Leaderboard and building `lighteval`.
- **Hours:** 6–8. **Cost:** free.
- **Best sections for you:** `contents/model-as-a-judge/basics.md` and especially **`contents/model-as-a-judge/evaluating-your-evaluator.md`**; the troubleshooting and "designing your own evaluation" chapters; the discussion of benchmark contamination and leaderboard pitfalls.
- **Verdict: STRONG for benchmark/model-level literacy — but read the Space, not the GitHub repo.** Its centre of gravity is model benchmarking, not product evals, so it complements rather than replaces Tier 1.

### A12. UK AI Security Institute — **Inspect AI**
- **Docs:** https://inspect.aisi.org.uk/ · **Repo:** https://github.com/UKGovernmentBEIS/inspect_ai · **Eval library (200+ pre-built evals):** https://inspect.aisi.org.uk/evals/ and https://ukgovernmentbeis.github.io/inspect_evals/
- Built by UK AISI + Meridian Labs; open-sourced May 2024; announced via [AISI blog](https://www.aisi.gov.uk/blog/inspect-evals). Used for nearly all of UK AISI's automated evals; adopted by Anthropic, Google DeepMind and others. Hamel has his own primer: https://hamel.dev/notes/llm/evals/inspect.html
- **Core abstractions:** `Dataset` (samples = input + target) → `Solver` (one-shot, CoT, tool-use agent) → `Scorer` (exact match, model-graded, custom) → metrics. Docs sections: Basics · Components · Models · Scoring · **Agents (ReAct, Deep Agent, checkpointing, multi-agent)** · Tools (built-in, custom, MCP, sandboxing) · Running (parallelism, error handling, limits, early stopping) · **Analysis (log files, dataframes, scanners, visualisation)**.
- **Hours:** 10–12 to become productive. **Cost:** free/OSS.
- **Verdict: STRONG.** This is the framework that signals seriousness on a CV — it is the government-grade, sandboxed, reproducible option, and it's the only one in this list with a first-class log-analysis story. Learn it *after* you've hand-rolled a harness (Module 9).

### A13. DeepLearning.AI — *Evaluating AI Agents* (with Arize AI)
- **URL:** https://www.deeplearning.ai/courses/evaluating-ai-agents · lessons at https://learn.deeplearning.ai/courses/evaluating-ai-agents
- **Instructors:** John Gilhuly (Head of DevRel, Arize) and Aman Khan (Director of Product, Arize). Announced by Andrew Ng, Feb 2025 ([announcement](https://x.com/AndrewYNg/status/1892258190546653392)).
- **Length: 2 h 36 m across 15 video lessons + 6 code examples. Level: beginner. Cost: free** during the DeepLearning.AI platform beta.
- **Lessons:** Evaluation in the time of LLMs → Decomposing agents → Lab: building your agent → Tracing agents → Lab: tracing → **Router and skill evaluations** → Lab → **Trajectory evaluations** → Lab → Structuring evaluations → Lab → **Improving your LLM-as-a-judge** → Monitoring agents.
- **Verdict: STRONG** — the fastest hands-on path to *trajectory* and *component-wise* agent evals. Vendor-flavoured (Phoenix), but the concepts transfer. **This is the DeepLearning.AI course to do.**

### A14. Chip Huyen — *AI Engineering* (O'Reilly, 2025), Chapters 3–4
- **Ch. 3 "Evaluation Methodology":** https://www.oreilly.com/library/view/ai-engineering/9798341660717/ → actual chapter: https://www.oreilly.com/library/view/ai-engineering/9781098166298/ch03.html
- **Ch. 4 "Evaluate AI Systems":** builds the end-to-end evaluation *pipeline* and model-selection process.
- **Companion repo:** https://github.com/chiphuyen/aie-book
- **Hours:** 6–8 for both chapters. **Cost:** book (~$55) or O'Reilly subscription.
- **What it gives you that the practitioner sources don't:** a clean taxonomy — exact match vs lexical similarity vs semantic similarity vs AI-as-judge vs comparative/preference evaluation — plus honest treatment of perplexity/entropy, and the four buckets of application criteria (starting with domain-specific capability). Good for filling conceptual gaps.
- **Verdict: STRONG as a structured reference, OPTIONAL as a read-cover-to-cover.** Slightly dated on agent evals (pre-dates the 2026 agent-eval consensus) — supplement with §A5.

### A15. Jason Liu — *Systematically Improving RAG Applications* (Maven) + free writing
- **Course:** https://maven.com/applied-llms/rag-playbook — ~2 hrs/week (1 h office hours + 1 h guest speaker), 6 prerecorded lectures, 12 hands-on notebooks; 87 reviews at 4.8; 400+ engineers cited as applying the framework; lifetime access + free future re-enrolment. Latest visible cohort schedule was Nov 2025 — **confirm a 2026 cohort before paying.** Testimonials from Sam Flamini (Solutions Engineer, Anthropic) and Nico Neven (CTO, Vantager) — the latter credits it with moving past "the vibe check plateau."
- **Free primary writing (do these first):**
  - [Systematically Improving Your RAG](https://jxnl.co/writing/2024/05/22/systematically-improving-your-rag/) — 2024-05-22
  - [Systematically Improving RAG Applications](https://jxnl.co/writing/2025/01/24/systematically-improving-rag-applications/) — 2025-01-24
  - [Parlance Labs talk page](https://parlance-labs.com/education/rag/jason.html) (free recorded conference talk); notes by Christian Mills: https://christianjmills.com/posts/mastering-llms-course-notes/conference-talk-010/
- **The framework you actually need:** the **RAG flywheel** — synthetic evals to pinpoint failures → **leading vs lagging metrics** → segment the input space of questions by topic/capability → build specialised sub-systems → route queries with classifiers → fine-tune embeddings.
- **Verdict: free writing = STRONG (must-read for Module 4). Paid course = OPTIONAL** unless RAG is your day job.

### A16. OWASP GenAI Security Project — Top 10 for LLM Applications **2026** + Agentic Top 10
- **Resource:** https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/ · initiative page https://genai.owasp.org/initiative/owasp-top-10-for-llm-and-genai/
- **Announcement: 2026-09-01** (community topped 30,000 members); the list itself published **2026-08-04**; 10,000+ downloads in 48 hours. [Press release](https://www.prnewswire.com/news-releases/owasp-genai-security-project-releases-2026-top-10-for-llm-applications-debuts-agent-control-standard-and-new-resources-for-securing-generative-and-agentic-ai-302867085.html)
- **What changed for 2026:** Prompt Injection stays LLM01; Sensitive Information Disclosure stays LLM02; **Excessive Agency jumped from LLM06 → LLM03** as production incidents cluster around agentic systems; Misinformation climbed after incidents where confident-but-wrong output triggered automated workflows/API calls. A separate **Agentic Top 10 (2026)** and a new **Agent Control Standard** debuted alongside. Analysis: [CSA research note](https://labs.cloudsecurityalliance.org/research/csa-research-note-owasp-genai-top10-2026-agent-control-stand/), [Check Point](https://blog.checkpoint.com/ai-security/reading-the-signals-in-the-owasp-llm-top-10-2026/amp/).
- **Rule of thumb:** single-prompt LLM app → LLM Top 10; tool-using agent → **Agentic Top 10 (2026)**.
- **Also:** OWASP **Gen AI Red Teaming Guide**; NIST CAISI launched a three-pillar programme on **2026-02-17** and open-sourced **AgentDojo-Inspect** for agent-hijacking evaluation.
- **Verdict: STRONG (skim the whole thing, deep-read LLM01/LLM02/LLM03).** This is the 2026 edition — do not cite the 2025 list.

---

## TIER 3 — TOOLING DOCS (read the ones you'll use; don't read all four)

| Tool | Licence / model | Docs | Verdict |
|---|---|---|---|
| **Inspect AI** (UK AISI) | OSS, MIT | https://inspect.aisi.org.uk/ | **Learn this one.** See §A12. Best CV signal; sandboxing + log analysis are unmatched. |
| **Langfuse** | OSS **MIT**, self-hostable; acquired by **ClickHouse, Jan 2026** | https://langfuse.com/docs/evaluation/overview · https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge · repo https://github.com/langfuse/langfuse | **STRONG — learn this as your "buy" option.** LLM-as-judge went fully MIT in **June 2025** (self-host ≥ v3.65.0). **Code Evaluators** (Python/TS `evaluate` functions written in the UI, no judge-model cost) shipped **May 2026**. Most mature OSS platform. |
| **Arize Phoenix** | OSS (Elastic License), self-hostable; OpenInference | https://arize.com/phoenix/ · repo https://github.com/Arize-ai/phoenix · courses https://courses.arize.com/ | **STRONG for agent work.** Deepest agent-trace surface of the four — purpose-built tool-call-graph views. Free 1-hour LLM Evaluation Fundamentals course (Laurie Voss) with a certification quiz, plus a longer agents course building a financial-analysis agent through tracing → evals → calibration → experiments → monitoring. |
| **Braintrust** | Commercial, CI/CD-first | https://www.braintrust.dev/docs · https://www.braintrust.dev/pricing · eval library https://www.braintrust.dev/evals | **OPTIONAL.** Core unit = the *experiment* (dataset + task fn + scorers → scores, diffs, regressions). Best-in-class CI regression story. Free tier renamed **Starter** in March 2026: 1 GB processed data + 10,000 scores/month, 14-day retention, unlimited seats, 1 human-review scorer/project. |
| **LangSmith** | Commercial (LangChain) | https://docs.smith.langchain.com/ · agent evals https://www.langchain.com/resources/agent-evals | **OPTIONAL.** Strong dataset management + human-review queues; eval runs structured as experiments with significance maths built in. Useful read: their **run / trace / thread level** decomposition of agent evals. |

**Build-vs-buy guidance from the field**, per [Hamel, *Selecting the Right AI Evals Tool*, 2025-10-01](https://hamel.dev/blog/posts/eval-tools/): four criteria — (1) workflow/DX friction between *seeing* a failure and *fixing* it; (2) human-in-the-loop support — "The best tools don't try to automate away the human; they empower them"; (3) transparency over "magic" (be suspicious of agents that both write the rubric *and* score against it); (4) ecosystem fit and **mandatory data export in standard formats**. His own practice: use a platform as **backend data storage**, build **custom annotation interfaces**, and do most work in **Jupyter notebooks**.

---

## TIER 4 — ACADEMIC ANCHORS (read the abstract + method; skim results)

| Paper | Date | Why it matters | Verdict |
|---|---|---|---|
| **Zheng et al., *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*** — https://arxiv.org/abs/2306.05685 | NeurIPS 2023 (Jun 2023) | The origin text for judge bias. Names and measures **position bias, verbosity bias, self-enhancement bias**, plus limited reasoning on maths/logic; proposes mitigations (swap positions, reference-guided grading, CoT). Reports GPT-4-class judges at >80% agreement with humans (English). Code: https://github.com/lm-sys/FastChat/blob/main/fastchat/llm_judge/README.md | **MUST-READ.** Models are stale; the biases and mitigations are not. |
| **Shankar et al., *Who Validates the Validators?*** — https://arxiv.org/abs/2404.12272 · [Berkeley PDF](https://people.eecs.berkeley.edu/~bjoern/papers/shankar-validators-uist2024.pdf) | UIST 2024 | **EvalGen**: generates candidate evaluators (Python fns + judge prompts), asks the human to grade a subset, then selects implementations matching human grades. Establishes **criteria drift** — people refine what they mean *by grading*. This is the academic backbone of "Critique Shadowing." | **MUST-READ.** Written by your course instructor; directly explains why binary + critique works. |
| **Shankar et al., *SPADE: Synthesizing Data Quality Assertions for LLM Pipelines*** — https://arxiv.org/pdf/2401.03038 | Jan 2024 | Mines developers' **prompt-edit histories** to synthesise assertions: repeated attempts to prevent a mistake reveal a requirement worth enforcing explicitly. | **STRONG** — clever, underused idea for your capstone. |
| **Es et al., *RAGAS: Automated Evaluation of RAG*** — https://arxiv.org/abs/2309.15217 | Sep 2023 | Reference-free RAG metrics: faithfulness, answer relevance, context precision/recall. Docs (current): https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/ | **STRONG (docs), OPTIONAL (paper).** Now also ships agent metrics: topic adherence, **tool-call accuracy, tool-call F1, agent goal accuracy**. |
| **Saad-Falcon et al., *ARES*** — https://arxiv.org/abs/2311.09476 | Nov 2023 | Fine-tunes *lightweight* LM judges on synthetic data for context relevance / answer faithfulness / answer relevance, with PPI-style confidence intervals from a small human-labelled set. | **OPTIONAL but interesting for you** — the PPI/CI machinery rhymes with §A8. |
| **Yao et al., *τ-bench*** — https://arxiv.org/abs/2406.12045 · Sierra: https://sierra.ai/resources/research/tau-bench · repo https://github.com/sierra-research/tau-bench | Jun 2024 | Simulated user + tool-calling agent + database, retail & airline domains, with **policy compliance** as the pass criterion. Introduced **pass^k** — the fraction of tasks the agent succeeds at on *every* one of k tries. Reliability, not luck. | **MUST-READ (skim).** pass^k is the single most transferable idea in agent evals. |
| **Barres et al., *τ²-bench: Dual-Control*** — https://arxiv.org/abs/2506.07982 · repo https://github.com/sierra-research/tau2-bench | Jun 2025 | Extends τ-bench so **both** user and agent can call tools (telecom domain). The realistic setting for 2026 agents. Leaderboard: taubench.com | **STRONG.** |
| **Jimenez et al., *SWE-bench*** (+ Verified, + Pro) — https://www.swebench.com/ | 2023–2026 | See the staleness note below. | **REFERENCE / benchmark-literacy case study.** |
| **Liang et al., *HELM*** — https://arxiv.org/abs/2211.09110 · repo https://github.com/stanford-crfm/helm | Nov 2022 | Multi-metric holistic evaluation (accuracy, calibration, robustness, fairness, bias, toxicity, efficiency) across scenarios. Each submission carries a **contamination report**. | **REFERENCE — see staleness note.** |
| **EleutherAI `lm-evaluation-harness`** — https://github.com/EleutherAI/lm-evaluation-harness | ongoing | The de facto standard for academic benchmark reproduction; 60+ benchmarks, hundreds of subtasks; backend for the HF Open LLM Leaderboard. | **REFERENCE.** Know it exists; you will rarely need it for product evals. |
| **Kapoor/Stroebl et al., *Log analysis is necessary for credible evaluation of AI agents*** — https://arxiv.org/pdf/2605.08545 | 2026 | Argues agent scores are uninterpretable without transcript/log inspection. | **STRONG** — direct ammunition for the "transcript review" module. |
| **Holistic Agent Leaderboard (HAL)** — https://arxiv.org/pdf/2510.11977 | Oct 2025 | "The missing infrastructure for AI agent evaluation" — standardised, cost-aware agent benchmarking. | **OPTIONAL.** |
| **Singh et al., *The Leaderboard Illusion*** — https://arxiv.org/pdf/2504.20879 | Apr 2025 | Systematic distortions in Chatbot Arena (private variant testing, selective disclosure, unequal sampling, deprecation). | **STRONG** — the sharpest benchmark-literacy read. |

---

## STALE / DEPRECATED — flagged explicitly

| Item | Status | Date | What to do |
|---|---|---|---|
| **OpenAI Evals platform** (dashboard/API) | **BEING SHUT DOWN.** Read-only for existing users **2026-10-31**; full shutdown **2026-11-30**. OpenAI now points users to **Datasets** instead. https://developers.openai.com/api/docs/guides/evals | 2026 | **Do NOT build on it.** Read the *concepts* in [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices) and the [Evals cookbook](https://developers.openai.com/cookbook/topic/evals) — the graders/datasets/iteration framing is sound — but treat the platform as dead. |
| **`openai/evals` GitHub repo** | Effectively dormant; superseded by the platform which is itself being retired. | — | Historical only. |
| **HELM** (Stanford CRFM) | **Entered maintenance mode 2026-06-01** (stated in repo README). https://github.com/stanford-crfm/helm | 2026-06-01 | Read as a *conceptual* reference for multi-metric evaluation and contamination reporting. Don't plan to run it. |
| **HF evaluation-guidebook GitHub repo** | **No longer maintained as of Dec 2025.** | Dec 2025 | Use the maintained Space: https://huggingface.co/spaces/OpenEvals/evaluation-guidebook |
| **SWE-bench Verified as a headline metric** | **OpenAI publicly stopped reporting it (Feb 2026)**, citing contamination. https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/ | 2026-02 | Excellent *teaching* material (see Module 7). Not a metric to quote. Evidence: OpenAI's manual audit of 138 o3 failures found **59.4% caused by test flaws, not model limitations**; independent work found ~32.7% of successful patches involved solution leakage from issue text/comments; models recall in-repo file paths up to ~76% vs ~53% for external files. Also: scaffolding changes alone can move scores 10–15 points, so it measures harness engineering as much as model capability. Successor: **SWE-bench Pro**. |
| **HF `evaluate` library / BLEU-ROUGE-BERTScore-first workflows** | Conceptually superseded for product evals. | — | Understand *why* they fail (Module 1); don't centre a workflow on them. |
| **Generic "RAG triad" dashboards without error analysis** | Anti-pattern per §A6 / §A10. | — | Metrics come *after* the failure taxonomy, never before. |

---

## Ranked shortlist (if you only do 8 things)

1. Free 17-email course + 2 e-books (§A3) — 8 h, free
2. The AI Evals FAQ (§A2) — 10 h, free
3. Hamel's blog trilogy (§A6) — 6 h, free
4. Anthropic *Demystifying evals for AI agents* (§A5) — 2 h, free
5. `evals-skills` + `judgy` hands-on (§A7, §A8) — 8 h, free
6. Miller, *Adding Error Bars to Evals* (§A9) — 4 h, free
7. DeepLearning.AI *Evaluating AI Agents* (§A13) — 4 h, free
8. Inspect AI, ported capstone (§A12) — 12 h, free

**≈54 hours, $0**, and it covers ~75% of what the $4,200 course delivers. The paid course (§A1) and the O'Reilly book (§A4) are the upgrades.

---

# B) Topic-by-topic syllabus

**Format:** each module lists objectives → best resource per topic → hours → a *done when you can…* check.
**Total: ~132 hours.** At 12 hrs/week that is ~11 weeks. Modules 1–3 are the foundation and should not be rushed or reordered.

---

## MODULE 0 — Orientation & unlearning (5 h) · Week 1

**Objectives**
- Map your existing ML-evaluation vocabulary onto LLM evaluation, and identify where it *fails to transfer*.
- Internalise the Analyze → Measure → Improve lifecycle.
- Set up a working environment: Python, Jupyter, an LLM API key, a tracing backend (Langfuse self-hosted or Phoenix local).

**Best resources**
- [Free 17-part email course](https://ai.hamel.dev/eval-course) — start it today; it drips over ~3 weeks and will run alongside Modules 1–3.
- [Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/) (2024-03-29) — the L1/L2/L3 model.
- [Anthropic, Define your success criteria](https://docs.anthropic.com/en/docs/build-with-claude/define-success-criteria) and [Create strong empirical evaluations](https://docs.anthropic.com/en/docs/build-with-claude/develop-tests) — short, concrete, vendor-neutral enough.

**What transfers vs what doesn't (write this table yourself, it's the exercise)**

| Your MSc toolkit | Transfers? | Note |
|---|---|---|
| Train/val/test discipline | ✅ Directly | But "test set" = a curated *golden set* you build, not a random split. |
| Precision/recall/F1 | ✅ For **judges**, not for outputs | You'll compute TPR/TNR *on the judge*, treating human labels as ground truth. |
| Cross-validation | ⚠️ Partially | Rarely used on golden sets (too small, too expensive); bootstrap replaces it. |
| Hypothesis testing | ✅ Directly | Paired tests on the same question set; see Module 8. |
| Class imbalance intuition | ✅ Critically | Failure rates are often 5–15%; accuracy is meaningless. |
| AUC/ROC | ⚠️ Rarely | Most product judgments are binary and thresholded by design. |
| BLEU / ROUGE / embedding similarity | ❌ Mostly dead-end | See Module 1. |
| "Pick a metric, optimise it" | ❌ **The habit to unlearn** | Metrics are the *output* of error analysis, not the input. |

**Done when you can…** state, in two sentences and without notes, why a 0.87 ROUGE-L score on a summarisation feature tells a product team essentially nothing — and name the three things you'd do instead.

---

## MODULE 1 — Why generic metrics fail; error analysis first (16 h) · Weeks 1–2

> **This is the most important module in the syllabus.** Practitioners are near-unanimous that it is where newcomers underinvest. Do not shortcut it.

**Objectives**
1. Explain why off-the-shelf metrics (BLEU/ROUGE/BERTScore, generic "helpfulness" judges, vendor RAG-triad dashboards) fail to predict product outcomes.
2. Run **open coding**: read raw traces and write free-form failure notes *without* a predefined schema.
3. Run **axial coding**: cluster open codes into a structured, mutually-comprehensible **failure taxonomy** with counts.
4. Defend **binary pass/fail + written critique** over Likert scales, and know the exceptions.
5. Know how many traces to read, and how to sample them.

**Topics & best resource per topic**

| Topic | Best resource | Date |
|---|---|---|
| Why generic metrics fail | [Evals FAQ § Evaluation Design — "generic metrics pitfalls", "similarity metrics utility"](https://hamel.dev/blog/posts/evals-faq/) | mod. 2026-09-17 |
| The "look at your data" discipline | [Field Guide § Error Analysis](https://hamel.dev/blog/posts/field-guide/) | 2025-03-24 |
| Open coding / axial coding mechanics | `error-discovery` skill in [evals-skills](https://github.com/ai-evals-course/evals-skills) — "build a review app, select diverse samples, and organize your notes into failure modes" | 2026-03-02 |
| Binary vs Likert | [Creating an LLM Judge § binary judgments](https://hamel.dev/blog/posts/llm-judge/) — *"a binary decision forces everyone to consider what truly matters"* | mod. 2026-09-01 |
| Criteria drift (why the rubric changes as you grade) | [*Who Validates the Validators?*](https://arxiv.org/abs/2404.12272) | UIST 2024 |
| The scientific loop around error analysis | [Eugene Yan, *An LLM-as-Judge Won't Save The Product*](https://eugeneyan.com/writing/eval-process/) | 2025-04-20 |
| Sampling production traces | [Hamel, *How to Sample Production Traces for Review*](https://hamel.dev/blog/posts/evals-faq/how-can-i-efficiently-sample-production-traces-for-review.html) | — |
| Free video walkthrough | Hamel, *Intro to Error Analysis With Just Spreadsheets* (YouTube, linked from [hamel.dev/notes/llm/evals](https://hamel.dev/notes/llm/evals/)) | — |

**Practical guidance to hold onto**
- Start with **20–50 tasks drawn from real failures**, not invented ones ([Anthropic, 2026-01-09](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)).
- Aim for roughly a **50:50 pass/fail split spanning the input distribution** in your annotation set ([Eugene Yan, 2025-04-20](https://eugeneyan.com/writing/eval-process/)) — pure random sampling at a 7% failure rate wastes most of your reading time.
- Open-code ~100 traces before you let yourself name a single metric. Expect the taxonomy to stabilise (new traces stop producing new codes) somewhere between 50 and 150 traces.
- Binary + critique beats 1–5 Likert because the critique text is what you later mine for judge prompts; a "3" carries no information you can act on.

**Exercise.** Pick or build a small LLM application (a recipe bot and a customer-support bot are the canonical course examples — see [Arize's writeup of the Maven Recipe Bot homework](https://arize.com/blog/ai-evals-maven-course-homework-the-recipe-bot-workflow/)). Generate 100 traces. Open-code all of them in a spreadsheet. Axial-code into 5–9 failure modes. Produce a frequency table.

**Done when you can…** hand someone a one-page failure taxonomy with counts, derived from ≥100 traces you personally read, in which the top 3 failure modes account for ≥60% of failures — **and** name at least one failure mode that no off-the-shelf metric would have surfaced.

---

## MODULE 2 — Building a golden / reference dataset (14 h) · Weeks 2–3

**Objectives**
1. Design a dataset that spans your input distribution rather than your imagination.
2. Generate synthetic inputs using **dimension-based tuple generation** (features × scenarios × personas), grounded in real system constraints.
3. Run a labelling workflow with a **Principal Domain Expert** and, where relevant, multiple annotators.
4. Build a **custom annotation interface** and know why generic labelling tools cost you 10× iteration speed.
5. Measure and interpret **inter-annotator agreement** — and decide what to do when it's low.

**Topics & best resource per topic**

| Topic | Best resource | Date |
|---|---|---|
| Sampling & coverage strategy | [Evals FAQ § Error Analysis — "diverse query evaluation", "efficient trace sampling", "sample size requirements across eval stages"](https://hamel.dev/blog/posts/evals-faq/) | mod. 2026-09-17 |
| Synthetic data generation | `generate-synthetic-data` skill, [evals-skills](https://github.com/ai-evals-course/evals-skills); + [Field Guide § Synthetic Data](https://hamel.dev/blog/posts/field-guide/) | 2026 / 2025 |
| Synthetic evals for RAG specifically | [Jason Liu, *Systematically Improving Your RAG*](https://jxnl.co/writing/2024/05/22/systematically-improving-your-rag/) | 2024-05-22 |
| Labelling workflow & the Principal Domain Expert | [Creating an LLM Judge, steps 1–4](https://hamel.dev/blog/posts/llm-judge/) | mod. 2026-09-01 |
| Custom annotation tools | `build-review-interface` skill; [Field Guide § Custom Data Viewers](https://hamel.dev/blog/posts/field-guide/); [Eugene Yan, *AlignEval*](https://eugeneyan.com/writing/aligneval/) | 2024-10-27 → 2026 |
| Annotator count, non-experts, outsourcing | [Evals FAQ § Human Annotation](https://hamel.dev/blog/posts/evals-faq/) | mod. 2026-09-17 |
| Reference solutions / unambiguous specs | [Anthropic, steps 3–4 of the 8-step roadmap](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 2026-01-09 |
| Stale-dataset management | [Evals FAQ § Error Analysis — "stale dataset management", "re-running error analysis cadence"](https://hamel.dev/blog/posts/evals-faq/) | mod. 2026-09-17 |

**Inter-annotator agreement — the honest state of play.** The practitioner literature is thin here; this is a genuine gap you can fill with your MSc background. Position:
- The dominant practitioner pattern is **one Principal Domain Expert** as the ground-truth oracle, precisely to *sidestep* the agreement problem ([Hamel, mod. 2026-09-01](https://hamel.dev/blog/posts/llm-judge/)). This is a deliberate trade: consistency over coverage.
- When you *do* have multiple annotators, use **Cohen's κ** (2 raters) or **Krippendorff's α** (n raters, missing data) — standard from your stats training. Rough interpretation: κ < 0.4 means your *rubric* is broken, not your annotators. Fix the rubric and re-label; do not average disagreement away.
- Low agreement is diagnostic, not noise: it usually means the criterion is under-specified, which is exactly the "criteria drift" phenomenon ([Shankar et al., UIST 2024](https://arxiv.org/abs/2404.12272)).
- **Reserve a held-out slice of human labels** that you never look at while iterating the judge — it becomes your judge test set in Module 3.

**Sizing heuristics (synthesised across sources — state your assumptions when you use them)**
- Error-analysis read: **100–150 traces** (stop when new traces stop adding codes).
- Judge calibration/dev set: **~100 labelled examples**, roughly balanced.
- Judge **held-out test set**: **~100 labelled examples** you touch exactly once per judge version.
- Agent golden set: start at **20–50 tasks from real failures** ([Anthropic, 2026-01-09](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)), grow to 100–300.
- Regression suite for CI: whatever runs in < 10 minutes; usually 50–200 cases.

**Done when you can…** produce a versioned golden dataset (≥100 examples) with: a documented sampling rationale, a stated synthetic-vs-real split, a written annotation guideline, a κ or α figure if multiple annotators were used, and a held-out test slice you have **not** looked at.

---

## MODULE 3 — Code-based evals vs LLM-as-judge; judge design and calibration (20 h) · Weeks 3–5

> **The technical heart of the syllabus, and where your statistics background pays off most visibly.**

**Objectives**
1. Correctly route each criterion to code / model / human grading.
2. Write a judge prompt using the **Critique Shadowing** method.
3. Identify and mitigate **position, verbosity, and self-preference (self-enhancement)** bias.
4. Measure judge quality as **TPR and TNR on a held-out human-labelled set** — never as accuracy.
5. **Correct** a judge-reported pass rate into an estimate of the true pass rate, with a confidence interval.

**Topics & best resource per topic**

| Topic | Best resource | Date |
|---|---|---|
| Three grader types & their trade-offs | [Anthropic, *Demystifying evals*](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 2026-01-09 |
| When code-based wins | [Langfuse Code Evaluators](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge) (JSON schema, regex, tool-arg verification — no token cost) | shipped May 2026 |
| Judge design end-to-end | [Creating an LLM Judge (Critique Shadowing)](https://hamel.dev/blog/posts/llm-judge/) | mod. 2026-09-01 |
| Judge biases, named & measured | [Zheng et al., MT-Bench §3](https://arxiv.org/abs/2306.05685) — position, verbosity, self-enhancement; mitigations: position swapping, reference-guided grading, CoT | NeurIPS 2023 |
| Judge-alignment workflow survey | [Eugene Yan, *Evaluating the Effectiveness of LLM-Evaluators*](https://eugeneyan.com/writing/llm-evaluators/) | 2024-08-18 |
| Evaluating your evaluator | [HF Evaluation Guidebook — `model-as-a-judge/evaluating-your-evaluator.md`](https://huggingface.co/spaces/OpenEvals/evaluation-guidebook) | Space is current; repo unmaintained since Dec 2025 |
| Human-aligned evaluator generation | [EvalGen / *Who Validates the Validators?*](https://arxiv.org/abs/2404.12272) | UIST 2024 |
| Assertion mining from prompt history | [SPADE](https://arxiv.org/pdf/2401.03038) | Jan 2024 |
| Same-model-as-judge concern | [Evals FAQ: *Can I use the same model for both the main task and evaluation?*](https://hamel.dev/blog/posts/evals-faq/can-i-use-the-same-model-for-both-the-main-task-and-evaluation.html) | — |
| **TPR/TNR + bias correction, hands-on** | `validate-evaluator` skill + [`judgy`](https://github.com/ai-evals-course/judgy) | 2026 |

**The correction you must be able to derive and defend**

Given a judge with true-positive rate (sensitivity) `TPR` and true-negative rate (specificity) `TNR`, both estimated on a held-out human-labelled set, and an observed pass rate `p_obs` on a large unlabelled sample, the **Rogan–Gladen** corrected estimate of the true pass rate is:

```
θ̂ = (p_obs + TNR − 1) / (TPR + TNR − 1)
```

Valid only when `TPR + TNR > 1` (the judge beats chance). Get the confidence interval by **bootstrapping over both the calibration set and the test set** — the interval must carry *both* sources of error, which is the part people get wrong. `judgy` implements exactly this ([repo](https://github.com/ai-evals-course/judgy)).

*Why this matters concretely:* a judge reporting a 95% pass rate but with a 10% chance of mislabelling a failure as a pass is not describing a 95% system. If you are the person on the team who can produce the corrected number **with an interval**, you are the person whose numbers get believed.

**Decision rule for code vs judge vs human** (write this as a one-pager for your portfolio):
- **Code** when the criterion is objectively checkable: schema validity, regex/format, required citation present, tool-arg types, numeric tolerance, latency, cost. Fast, free, deterministic — but brittle to valid variation.
- **Judge** when the criterion is semantic and you have ≥100 human labels to calibrate against: groundedness, tone, instruction adherence, relevance. Flexible and scalable — non-deterministic and expensive.
- **Human** for the golden set, judge calibration, periodic re-calibration, and anything genuinely novel. Gold standard — slow and expensive.
- **Never** deploy a judge you have not measured TPR/TNR for. **Never** report a raw judge pass rate as the system's pass rate.

**Done when you can…** ship a judge with a documented prompt, a held-out TPR and TNR, a position-bias check (does swapping A/B order change verdicts?), a verbosity-bias check (does length correlate with pass?), and a **corrected system pass rate with a 95% CI** — and explain to a PM in plain English why the corrected number differs from the raw one.

---

## MODULE 4 — RAG evaluation (16 h) · Weeks 5–6

**Objectives**
1. Evaluate retrieval independently of generation, using IR metrics you already know.
2. Evaluate generation given retrieval: faithfulness / groundedness, answer relevance, citation correctness.
3. Decide when component-level metrics are enough and when only end-to-end will do.
4. Apply the **RAG flywheel**: segment queries → find the failing segment → fix that segment.
5. Distinguish **leading** from **lagging** metrics.

**Topics & best resource per topic**

| Topic | Best resource | Date |
|---|---|---|
| The flywheel & query segmentation | [Jason Liu, *Systematically Improving RAG Applications*](https://jxnl.co/writing/2025/01/24/systematically-improving-rag-applications/) + [free talk](https://parlance-labs.com/education/rag/jason.html) | 2025-01-24 |
| Retrieval metrics (recall@k, MRR, nDCG) | Your MSc IR knowledge + [Ragas metrics reference](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/) | current |
| Faithfulness / groundedness / context precision & recall | [Ragas docs](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/); paper [arXiv:2309.15217](https://arxiv.org/abs/2309.15217) | Sep 2023 → current |
| Fine-tuned lightweight judges + CIs | [ARES, arXiv:2311.09476](https://arxiv.org/abs/2311.09476) | Nov 2023 |
| RAG debugging, chunk size, multi-turn | [Evals FAQ § Domain-Specific](https://hamel.dev/blog/posts/evals-faq/) | mod. 2026-09-17 |
| Hands-on RAG eval | `evaluate-rag` skill, [evals-skills](https://github.com/ai-evals-course/evals-skills) | 2026 |
| Long-context Q&A specifically | [Eugene Yan, *Evaluating Long-Context Q&A Systems*](https://eugeneyan.com/writing/) | 2025-06-22 |
| Free e-book | *Advanced RAG Optimization & Evals* — via [ai.hamel.dev/eval-course](https://ai.hamel.dev/eval-course) | current |

**Framing that will save you weeks.** Retrieval is a solved measurement problem — you already know **recall@k** (did the needed chunk make it into the top k?), **MRR** (how high did the first relevant chunk rank?), and **nDCG** (graded relevance, position-discounted). The genuinely hard part is that you need *labels* for what "relevant" means, which sends you straight back to Module 2. **Recall@k is usually the metric that matters most** — generation cannot recover information the retriever never surfaced, so a retrieval ceiling is a hard ceiling.

Ragas's three core metrics decompose cleanly: **context precision** (are retrieved chunks useful?), **context recall** (did we get *all* the needed chunks?), **faithfulness** (is the answer grounded in what we retrieved?) — every other Ragas metric is a derivative or special case. Treat Ragas as a fast baseline, then replace its generic judges with judges you calibrated in Module 3; its out-of-the-box prompts are not tuned to your domain and will not track your failure taxonomy.

**Component vs end-to-end.** Run both. Component metrics tell you *where* to fix; end-to-end tells you *whether the user is better off*. A common trap: retrieval metrics improve, end-to-end quality doesn't, because the generator was never the bottleneck.

**Done when you can…** produce a RAG eval report that reports recall@k and nDCG on a labelled retrieval set, a calibrated faithfulness judge with TPR/TNR, an end-to-end answer-quality number, **and** a segment-level breakdown identifying which query segment is dragging the average down.

---

## MODULE 5 — Agent and multi-step evaluation (18 h) · Weeks 6–8

**Objectives**
1. Evaluate a **trajectory**, not just a final answer.
2. Score **tool-call correctness** (selection, arguments, ordering) and **task completion** via terminal state.
3. Apply **pass@k vs pass^k** and explain to a stakeholder why the second one is the number they care about.
4. Build τ-bench-style evaluation with a **simulated user** and a policy/state checker.
5. Run disciplined **transcript review** and know why scores without log analysis are not credible.

**Topics & best resource per topic**

| Topic | Best resource | Date |
|---|---|---|
| The agent-eval playbook (start here) | [Anthropic, *Demystifying evals for AI agents*](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 2026-01-09 |
| Hands-on trajectory + router + skill evals | [DeepLearning.AI *Evaluating AI Agents*](https://www.deeplearning.ai/courses/evaluating-ai-agents), lessons 7–12 | free, 2h36m |
| Run / trace / thread decomposition | [LangChain, *Evaluating AI Agents at the Run, Trace, and Thread Level*](https://www.langchain.com/resources/agent-evals) | current |
| pass@k vs pass^k; simulated users; policy compliance | [τ-bench, arXiv:2406.12045](https://arxiv.org/abs/2406.12045) + [Sierra writeup](https://sierra.ai/resources/research/tau-bench) | Jun 2024 |
| Dual-control (user *and* agent call tools) | [τ²-bench, arXiv:2506.07982](https://arxiv.org/abs/2506.07982) · [repo](https://github.com/sierra-research/tau2-bench) | Jun 2025 |
| Tool-call metrics off the shelf | [Ragas agent metrics](https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/): tool-call accuracy, tool-call F1, agent goal accuracy, topic adherence | current |
| Why transcript review is non-optional | [*Log analysis is necessary for credible evaluation of AI agents*](https://arxiv.org/pdf/2605.08545) | 2026 |
| Agent eval infrastructure at scale | [Holistic Agent Leaderboard, arXiv:2510.11977](https://arxiv.org/pdf/2510.11977) | Oct 2025 |
| Multi-step / agentic workflow FAQs | [Evals FAQ § Domain-Specific](https://hamel.dev/blog/posts/evals-faq/) | mod. 2026-09-17 |
| Designing agents to *be* evaluable | Maven course L2 "Designing for Evaluability" ([syllabus](https://maven.com/parlance-labs/evals)); free proxy: [Anthropic, *Effective harnesses for long-running agents*](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) | 2026 |

**The concepts that matter most**

- **pass@k** = probability of success within k attempts (optimistic; measures capability). **pass^k** = probability that *all* k trials succeed (measures **reliability**). For a product, pass^k is the honest number. A 90% pass@1 agent that only achieves 60% pass^5 is not a shippable agent. This is the single most transferable idea from τ-bench.
- **Separate the eval harness from the agent harness.** Anthropic makes this distinction explicitly; conflating them means you can't swap models or scaffolds without rewriting your evals.
- **Grade the terminal state, not the prose.** For a booking agent, "did the DB row change correctly?" beats any judge on the final message. Anthropic's per-domain table: coding → unit tests + static analysis; conversational → judge rubrics for tone + state checks for completion; research → groundedness + coverage + source quality; computer-use → environment-state inspection + screenshot verification.
- **Design graders that resist agent exploits** (roadmap step 6). Agents will find the grader's loopholes — deleting the failing test, writing to the check file. Isolate environments.
- **Watch for eval saturation** (roadmap step 8). When everything passes, the eval has stopped informing you.
- **Scaffolding is a confound.** Better retries/exploration loops move SWE-bench scores 10–15 points with no model change — so always report the harness alongside the score.

**Done when you can…** evaluate a 3+ tool agent with: a trajectory-level scorer, a tool-call correctness metric, a terminal-state task-completion check, **pass^k at k=5 with a CI**, and a written transcript review of the 10 worst runs naming the mechanism of failure in each.

---

## MODULE 6 — Offline vs online; CI integration; A/B testing; production monitoring (16 h) · Weeks 8–9

**Objectives**
1. Draw the boundary between offline evals, online evals, guardrails, and A/B tests — and explain why they are four different things.
2. Wire evals into CI as regression tests that run on every PR.
3. Run a **model-swap requalification**: the day a new model ships, what do you run and what do you report?
4. Design an A/B test with a primary metric and **guardrail metrics**, connecting to your existing experimental-design training.
5. Build a production sampling → review → dataset-promotion loop.

**Topics & best resource per topic**

| Topic | Best resource | Date |
|---|---|---|
| CI/CD vs monitoring; guardrails vs evaluators | [Evals FAQ § Production & Deployment](https://hamel.dev/blog/posts/evals-faq/) | mod. 2026-09-17 |
| Evals as the thing that lets you adopt new models fast | [Anthropic, *Demystifying evals* § Why build evaluations](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 2026-01-09 |
| CI-first eval tooling in practice | [Braintrust docs](https://www.braintrust.dev/docs) — experiment = dataset + task fn + scorers; diffs and regressions in CI | 2026 |
| Production sampling for review | [Hamel, *How to Sample Production Traces for Review*](https://hamel.dev/blog/posts/evals-faq/how-can-i-efficiently-sample-production-traces-for-review.html) | — |
| Trace → dataset → experiment → judge loop | [Langfuse evaluation overview](https://langfuse.com/docs/evaluation/overview) | current |
| A/B testing as L3 | [Hamel, *Your AI Product Needs Evals* § Level 3](https://hamel.dev/blog/posts/evals/) | 2024-03-29 |
| The Swiss Cheese model (evals as one layer) | [Anthropic, *Demystifying evals* § Complementary methods](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 2026-01-09 |
| Practical online/offline patterns | [Langfuse, *Automated Evaluations of LLM Applications*](https://langfuse.com/blog/2025-09-05-automated-evaluations) | 2025-09-05 |

**The four-way distinction, stated cleanly** (this is a common interview question):

| | Runs when | Question it answers | Latency budget |
|---|---|---|---|
| **Offline evals** | Every PR / model change | "Did this change break a known behaviour?" | Minutes (CI) |
| **Online evals** | Continuously on sampled prod traffic | "Are novel failures appearing that my suite doesn't cover?" | Async, sampled |
| **Guardrails** | Synchronously, in the request path | "Should this specific output be blocked / transformed / escalated?" | Milliseconds |
| **A/B test** | On a deliberate traffic split | "Does variant B move the *business* metric?" | Days–weeks |

The trap: calling a guardrail an eval. A guardrail must return before the user sees output, so it must be cheap and can never be a slow multi-step judge. The complementary trap: calling an online eval an A/B test. Online evals score *quality*; A/B tests measure *business outcomes on split traffic*.

**Practical patterns worth adopting**
- Write the rubric **once** and run the same scorer offline (against the golden set) and online (against sampled traffic). That shared scorer is what makes offline↔online divergence interpretable as a regression signal.
- Cost control: sample ~10% of production traces for judge scoring; trigger expensive LLM checks only when cheap deterministic checks degrade.
- Log the **same deterministic checks** in prod that run in CI (JSON validity, citation compliance, format constraints) so the two surfaces are directly comparable.
- **Model-swap requalification** is the highest-visibility thing an evals person does. Have a written runbook: run the full offline suite on both models → paired comparison with CIs (Module 8) → re-measure judge TPR/TNR *on the new model's outputs* (a judge calibrated on model A is not automatically calibrated for model B) → shadow/canary → A/B with guardrails.
- **Guardrail metrics in an A/B test** are your existing training: latency p95, cost per request, refusal rate, escalation rate, safety violations. Pre-register them and their thresholds.

**Done when you can…** show a green CI run where an eval suite gates a PR, produce a diff report between two model versions with per-failure-mode deltas, and hand over a one-page model-swap requalification runbook.

---

## MODULE 7 — Safety, robustness, and benchmark literacy (14 h) · Weeks 9–10

**Objectives**
1. Run basic **red-teaming**: adversarial input generation, jailbreak attempts, refusal probing.
2. Build a **prompt-injection** test suite, including *indirect* injection through retrieved documents and tool outputs.
3. Evaluate **refusal behaviour** on both axes — over-refusal (false positives) and under-refusal.
4. Test for **PII** leakage and sensitive-information disclosure.
5. Read any benchmark claim critically: contamination, scaffolding confounds, self-reported results, saturation.

**Topics & best resource per topic**

| Topic | Best resource | Date |
|---|---|---|
| Current risk taxonomy | [OWASP GenAI LLM Top 10 **2026**](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/) — LLM01 Prompt Injection, LLM02 Sensitive Information Disclosure, **LLM03 Excessive Agency** (↑ from LLM06) | published 2026-08-04; announced 2026-09-01 |
| Agent-specific risk | **OWASP Agentic Top 10 (2026)** + **Agent Control Standard** — [initiative page](https://genai.owasp.org/initiative/owasp-top-10-for-llm-and-genai/) | 2026 |
| Practical red-teaming method | OWASP **Gen AI Red Teaming Guide** (via genai.owasp.org) | current |
| Agent-hijacking evaluation, runnable | **AgentDojo-Inspect**, open-sourced by NIST CAISI | 2026-02-17 |
| Capability-eval template | [Eugene Yan, *Patterns for Building Cybersecurity Evals*](https://eugeneyan.com/writing/) — sandboxed target + difficulty-tunable inputs + tools + grader | 2026-06-21 |
| Red-teaming inside the paid course | Maven syllabus, red-teaming & safety module ([syllabus](https://maven.com/parlance-labs/evals)) | Oct 2026 cohort |
| Safety benchmark reference | [CyberSecEval 3, arXiv:2408.01605](https://arxiv.org/pdf/2408.01605) | Aug 2024 |
| **Contamination — the case study** | [OpenAI, *Why we no longer evaluate SWE-bench Verified*](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/) | 2026-02 |
| Leaderboard distortion | [*The Leaderboard Illusion*, arXiv:2504.20879](https://arxiv.org/pdf/2504.20879) | 2025-04 |
| Multi-metric holistic evaluation (concept) | [HELM, arXiv:2211.09110](https://arxiv.org/pdf/2211.09110) — ⚠️ project in maintenance mode since **2026-06-01** | 2022 / 2026 |
| Benchmark mechanics | [`lm-evaluation-harness`](https://github.com/EleutherAI/lm-evaluation-harness); [HF Evaluation Guidebook](https://huggingface.co/spaces/OpenEvals/evaluation-guidebook) | current |

**Benchmark literacy — the five questions to ask of any leaderboard number**
1. **Contamination.** Could the test data be in training? OpenAI's audit of 138 o3 failures on SWE-bench Verified found **59.4% were caused by flawed tests**, not model limitations; separate work found ~32.7% of successful patches had solution leakage from issue text, and models recall in-repo file paths up to ~76% vs ~53% for external files.
2. **Who ran it?** On one June 2026 snapshot of a public SWE-bench Verified leaderboard, only 1 of 100 listed results was independently verified; the other 99 were vendor-submitted.
3. **What was the scaffold?** Retries, file exploration, and test-driven loops move scores 10–15 points with the *same* model. Report harness + model, always.
4. **Is it saturated?** A benchmark everything passes has stopped carrying information.
5. **Does it resemble your distribution?** Almost never. Public benchmarks measure *capability*; your golden set measures *your product*. Use them to shortlist models, never to claim your system works.

**Done when you can…** deliver a red-team report on a system you built containing ≥20 adversarial cases spanning direct injection, **indirect injection via retrieved content**, PII extraction, and refusal probes — each with a pass/fail and a severity — **and** write a paragraph explaining to a non-technical stakeholder why a vendor's headline benchmark number should not change their procurement decision.

---

## MODULE 8 — Statistics for evals (12 h) · Week 10

> **Your home turf. This is the module where you overtake peers who came in through software engineering.**

**Objectives**
1. Put a defensible confidence interval on any pass rate.
2. Compare two systems with a **paired** test on a shared question set, and know why paired beats unpaired here.
3. Do power analysis: how many eval questions for a detectable effect of size δ?
4. Bootstrap correctly when observations are **clustered** (multiple questions per document; multiple trials per task).
5. Combine judge-error correction (Module 3) with interval estimation into one number you'd defend in a review.

**Topics & best resource per topic**

| Topic | Best resource | Date |
|---|---|---|
| The whole statistical framing | [Miller, *Adding Error Bars to Evals*, arXiv:2411.00640](https://arxiv.org/abs/2411.00640) | 2024-11-01 |
| Anthropic's plain-language write-up | ["A statistical approach to model evaluations"](https://x.com/AnthropicAI/status/1858976458330505639) | 2024-11-20 |
| Reference implementation (3rd-party) | https://github.com/The-Swarm-Corporation/StatisticalModelEvaluator | — |
| **Judge-corrected estimates + bootstrap CIs** | [`judgy`](https://github.com/ai-evals-course/judgy) + `validate-evaluator` skill | 2026 |
| Reliability statistics for agents | pass^k in [τ-bench](https://arxiv.org/abs/2406.12045) | Jun 2024 |
| Sample sizes across eval stages | [Evals FAQ § Error Analysis](https://hamel.dev/blog/posts/evals-faq/) | mod. 2026-09-17 |
| Statistical significance in a commercial tool | [LangSmith](https://docs.smith.langchain.com/) experiment comparisons | current |

**Mapping your existing knowledge onto this field**

| You already know | Applies as |
|---|---|
| Binomial proportion CIs | CI on a pass rate. **Use Wilson or Agresti–Coull, not Wald** — n is small (100–300) and p is near 0 or 1, exactly where Wald fails. |
| Paired t-test / McNemar's test | Comparing model A vs B on the *same* question set. Miller's central practical recommendation: paired analysis strips out per-question difficulty variance and dramatically tightens the interval. **McNemar** is the right test for paired binary pass/fail. |
| Clustered standard errors | Multiple questions per source document, or k trials per task, violate independence. Cluster at the document/task level or your intervals are fictitiously narrow. |
| Bootstrap | The workhorse. Resample **clusters**, not rows. For judge-corrected estimates, bootstrap over *both* the calibration set and the test set. |
| Power analysis | "How many eval questions do I need to detect a 3-point difference?" — you can answer this and most of the field cannot. |
| Sensitivity / specificity / prevalence correction | **Exactly** the Rogan–Gladen judge correction. You already know this from diagnostic testing; it is the same estimator. |
| Multiple comparisons | Evaluating 8 failure modes across 4 model variants is 32 tests. Correct, or at minimum say you didn't. |
| Variance reduction (CUPED etc.) | Directly applicable to online A/B tests on LLM features. |

**Two traps specific to this field**
- **Don't report a raw judge pass rate as a system pass rate.** Correct it (Module 3) and widen the interval to include calibration error.
- **Don't treat k trials of the same task as k independent observations.** They're one cluster. This is how people accidentally report a 90% agent with a ±2% interval that is nonsense.

**Done when you can…** take a judge's raw pass rate on 500 unlabelled prod traces plus a 100-example human-labelled calibration set, and return a corrected point estimate with a bootstrap 95% CI — then answer "how many more examples do we need to halve that interval?" without looking anything up.

---

## MODULE 9 — Tooling: build a minimal harness, then adopt a framework (12 h) · Weeks 10–11

**Objectives**
1. Build an eval harness from scratch — pytest-style, ~200 lines, no framework.
2. Port it to **Inspect AI** and articulate what the framework bought you.
3. Instrument a "buy" platform (Langfuse or Phoenix) for tracing + human review.
4. State a defensible **own-vs-buy** position.

**Topics & best resource per topic**

| Topic | Best resource | Date |
|---|---|---|
| L1 assertions "like you would write in pytest" | [Hamel, *Your AI Product Needs Evals*](https://hamel.dev/blog/posts/evals/) | 2024-03-29 |
| Harness anatomy (task / trial / grader / transcript / outcome) | [Anthropic, *Demystifying evals*](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | 2026-01-09 |
| Inspect AI tutorial → agents → scoring → analysis | [inspect.aisi.org.uk](https://inspect.aisi.org.uk/) · [Hamel's primer](https://hamel.dev/notes/llm/evals/inspect.html) | current |
| 200+ reference eval implementations to read | [Inspect Evals](https://ukgovernmentbeis.github.io/inspect_evals/) | current |
| Tracing + datasets + experiments (OSS) | [Langfuse docs](https://langfuse.com/docs) (MIT, self-hostable; ClickHouse-owned since Jan 2026) | current |
| Agent trace views | [Phoenix](https://github.com/Arize-ai/phoenix) + free [Arize University](https://courses.arize.com/) 1-hour eval fundamentals course | current |
| Tool selection criteria & build-vs-buy | [Hamel, *Selecting the Right AI Evals Tool*](https://hamel.dev/blog/posts/eval-tools/) | 2025-10-01 |
| DIY annotation UI | `build-review-interface` skill; [AlignEval](https://eugeneyan.com/writing/aligneval/) | 2024-10-27 → 2026 |

**Build it yourself first.** A minimal harness is genuinely small and you will understand every framework better for having written one:

```
dataset (JSONL: id, input, target, metadata)
  → runner (async, concurrency-limited, retries, caching, cost accounting)
  → task fn (your system under test)
  → scorers: List[Callable[(output, target, trace) -> Score]]
  → results store (one row per (case × scorer × run), versioned)
  → report (per-scorer aggregates, per-failure-mode breakdown, diff vs baseline run, CIs)
```

Non-negotiables even in the minimal version: deterministic case IDs; record the model + prompt version + harness commit SHA on every run; cache model calls; store raw traces, not just scores; and export to a standard format.

**Own vs buy — the position to defend**
- **Own:** the golden dataset (your most valuable asset — never let it be locked in), the judge prompts and their calibration data, the failure taxonomy, the scoring logic, and the annotation interface for your specific domain.
- **Buy/adopt:** tracing infrastructure, a results store and UI, experiment diffing, and CI plumbing.
- Hamel's own practice: platform as **backend storage**, custom annotation UI, Jupyter for analysis ([2025-10-01](https://hamel.dev/blog/posts/eval-tools/)). Treat data export in a standard format as a hard requirement.
- For an agent/safety-flavoured CV, **Inspect AI** is the strongest signal: sandboxing, log analysis, and government/frontier-lab adoption.

**Done when you can…** show the same eval suite running three ways — your own harness, Inspect AI, and a platform — with a written paragraph on what each layer earned its keep for.

---

# C) Portfolio-grade capstone spec

**Goal:** an artefact that makes a 2026 hiring manager think *"this person can prove whether our system works."* Not a demo of an LLM app — **a demonstration of measurement discipline**.

**Time:** 30–40 hours (can overlap Modules 5–9). **Public repo + written report.**

## Pick a system with real failure modes

Build something small and *genuinely hard to evaluate* — the hardness is the point. Good choices: a document-grounded Q&A assistant over a real corpus (statutes, clinical guidelines, a software product's docs); a multi-tool agent (search + calculator + database write) in a booking/support domain; a structured-extraction pipeline over messy real documents. Deliberately include **at least one subjective criterion** that code cannot check — otherwise you never exercise the judge machinery, which is the part employers care about.

## Required artefacts

**1. The golden dataset (the centrepiece)**
- **150–300 labelled examples minimum.** Below ~100 your CIs are too wide to argue with; above ~300 you're spending time you should spend on the write-up. For an agent, **50–150 tasks** is the right range (Anthropic's roadmap starts at 20–50 and grows).
- Documented provenance: real vs synthetic split, sampling rationale, and the dimensions used for synthetic generation.
- A **held-out judge test slice** (~100 examples) with a stated policy that you looked at it only at judge-version boundaries.
- Versioned (git or DVC), with a schema and a data card.
- If multi-annotator: a κ or α figure, plus a note on what you changed when agreement was low.

**2. The failure taxonomy**
- Derived from open coding **≥100 real traces** (show the raw open codes, not just the final taxonomy — the messy intermediate artefact is what proves you did the work).
- 5–9 axial categories with frequency counts and one worked example each.
- A short note on which failure modes no off-the-shelf metric would have caught.

**3. The evaluators**
- ≥3 **code-based** scorers (schema/format/citation-presence/tool-arg validity).
- ≥1 **LLM judge** with: the full prompt in the repo, few-shot examples drawn from expert critiques, and a version history showing how it changed.
- **A judge calibration report** — this is the single artefact that most separates a strong portfolio from a weak one:
  - TPR and TNR on the held-out human set, with CIs
  - A confusion matrix
  - **A position-bias check** (swap A/B ordering, report verdict-flip rate)
  - **A verbosity-bias check** (correlation between output length and pass)
  - A note on self-preference if judge and system share a model family
  - The **Rogan–Gladen corrected** system pass rate with a bootstrap 95% CI

**4. The harness**
- Runs from one command. Deterministic case IDs. Records model + prompt version + commit SHA. Caches calls. Reports cost and latency per case.
- Produces a diff report against a stored baseline with **per-failure-mode deltas**, not just an aggregate.
- **A green CI run** (GitHub Actions) where the suite gates a PR — include a deliberately-broken PR showing the gate firing.
- Bonus, strong signal: the same suite ported to **Inspect AI**.

**5. Agent/RAG specifics** (whichever applies)
- RAG: recall@k + nDCG on a labelled retrieval set; calibrated faithfulness judge; segment-level breakdown.
- Agent: trajectory scorer, tool-call correctness, terminal-state completion check, and **pass^k at k=5 with a CI**.

**6. Safety slice**
- ≥20 adversarial cases: direct injection, **indirect injection via retrieved content or tool output**, PII extraction attempts, over-refusal probes.
- Mapped to [OWASP GenAI LLM Top 10 2026](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/) categories (and the Agentic Top 10 if you built an agent). Each with a severity.

**7. A model-swap requalification** — the highest-signal exercise in the whole capstone
- Run the full suite on two models. Report a **paired comparison with a CI** (McNemar for binary outcomes).
- **Re-measure judge TPR/TNR on the new model's outputs** and explain why that re-measurement is mandatory.
- A decision memo: ship / don't ship, with the guardrail metrics you'd watch and their thresholds.

**8. The write-up (2,000–3,000 words) — weight this as heavily as the code**

Structure it as: the system and why it's hard to evaluate → **what I found by reading 100+ traces** (lead with the taxonomy, not the architecture) → evaluator design and the code-vs-judge routing decisions → the judge calibration report → statistical methodology (estimators, intervals, assumptions, and where they break) → the model-swap result → **what I would do differently and what my numbers cannot tell you** → costs (total $ spent on eval runs, cost per eval run).

## What separates a top-decile portfolio in 2026

- **You read the data, and you show it.** Raw open codes and the messy intermediate spreadsheet beat a polished dashboard. Everyone has a dashboard.
- **Error bars everywhere.** Every rate carries an interval and a stated estimator. Almost nobody does this; you can, and it is the clearest signal of your MSc.
- **You measured your measuring instrument.** TPR/TNR on a held-out set with bias correction. This is the field's own stated best practice, and most portfolios skip it.
- **A stated limitations section.** "My golden set under-represents X, so this number is optimistic by roughly Y" reads as seniority.
- **Cost and latency treated as first-class metrics**, not afterthoughts.
- **You designed the system to be evaluable** — structured intermediate outputs, logged tool calls, stable IDs — and you say so.

## Anti-patterns that will sink it

- A wrapper around Ragas/DeepEval with default metrics and no calibration.
- Reporting a raw LLM-judge pass rate as the system's pass rate.
- A Likert-scale judge with no human-label comparison.
- Benchmark numbers (MMLU, SWE-bench) presented as evidence your system works.
- An evaluation set you wrote from imagination with no real traces behind it.
- Point estimates with no intervals.
- A README that describes the app for three paragraphs before mentioning evaluation.

---

# Suggested 11-week plan (12 hrs/week ≈ 132 h)

| Week | Modules | Hours | Milestone |
|---|---|---|---|
| 1 | M0 + start M1; begin free email course | 12 | Environment up; 50 traces read |
| 2 | M1 complete | 12 | **Failure taxonomy from 100+ traces** |
| 3 | M2 | 12 | Golden dataset v1 (150 examples) + annotation UI |
| 4 | M2 finish + M3 start | 12 | Judge v1 + first TPR/TNR |
| 5 | M3 complete | 12 | **Calibrated judge + Rogan–Gladen corrected rate with CI** |
| 6 | M4 | 12 | RAG component + end-to-end report (or skip to M5 if agent-focused) |
| 7 | M5 start | 12 | Trajectory + tool-call scorers |
| 8 | M5 finish + M6 start | 12 | **pass^k with CI**; CI gate green |
| 9 | M6 finish + M7 start | 12 | Model-swap requalification memo |
| 10 | M7 finish + M8 | 12 | Red-team report; all rates carry intervals |
| 11 | M9 + capstone write-up | 12 | **Repo + 2,500-word write-up published** |

Run the paid Maven cohort (Oct 10 – Nov 21, 2026) concurrently with weeks 4–10 if budget allows — its homework maps almost exactly onto Modules 1–6, and the Discord is where the job leads are.

---

# Source index (all URLs, with dates)

**Practitioner courses & core material**
- AI Evals for Engineers & PMs (Maven) — https://maven.com/parlance-labs/evals — Oct 10–Nov 21, 2026 cohort, $4,200
- Free 17-part email course + 2 e-books — https://ai.hamel.dev/eval-course — current
- AI Evals FAQ — https://hamel.dev/blog/posts/evals-faq/ — pub. 2025-05-28, mod. 2026-09-17 · PDF https://hamel.dev/blog/posts/evals-faq/evals-faq.pdf
- Evals index — https://hamel.dev/notes/llm/evals/
- Your AI Product Needs Evals — https://hamel.dev/blog/posts/evals/ — 2024-03-29
- A Field Guide to Rapidly Improving AI Products — https://hamel.dev/blog/posts/field-guide/ — 2025-03-24
- Creating an LLM-as-a-Judge — https://hamel.dev/blog/posts/llm-judge/ — 2024-10-29, mod. 2026-09-01
- Selecting the Right AI Evals Tool — https://hamel.dev/blog/posts/eval-tools/ — 2025-10-01
- "It's Hard to Eval" Is a Product Smell — https://hamel.dev/blog/posts/eval-smell/
- Sampling production traces — https://hamel.dev/blog/posts/evals-faq/how-can-i-efficiently-sample-production-traces-for-review.html
- Same model for task and eval? — https://hamel.dev/blog/posts/evals-faq/can-i-use-the-same-model-for-both-the-main-task-and-evaluation.html
- Evals Skills for Coding Agents — https://hamel.dev/blog/posts/evals-skills/ — 2026-03-02, mod. 2026-08-31
- evals-skills repo — https://github.com/ai-evals-course/evals-skills
- judgy — https://github.com/ai-evals-course/judgy
- Inspect AI primer — https://hamel.dev/notes/llm/evals/inspect.html

**Books**
- Shankar & Husain, *Evals for AI Engineers* (O'Reilly) — https://www.oreilly.com/library/view/evals-for-ai/9798341660717/ — release 2026-10-31, ISBN 9798341660724
- Huyen, *AI Engineering* Ch.3 Evaluation Methodology — https://www.oreilly.com/library/view/ai-engineering/9781098166298/ch03.html — 2025 · repo https://github.com/chiphuyen/aie-book
- Nassery, *AI Model Evaluation* (Manning) — https://www.manning.com/books/ai-model-evaluation — MEAP
- Robsky, Lavitas & Wang, *Reliable Evaluations for LLMs and AI Agents* (Springer) — https://link.springer.com/book/10.1007/978-3-032-26749-8 — Sep 2026

**Primary vendor/lab docs**
- Anthropic, Demystifying evals for AI agents — https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents — 2026-01-09
- Anthropic, Define your success criteria — https://docs.anthropic.com/en/docs/build-with-claude/define-success-criteria
- Anthropic, Create strong empirical evaluations — https://docs.anthropic.com/en/docs/build-with-claude/develop-tests
- Anthropic, Effective harnesses for long-running agents — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents — 2026
- OpenAI, Working with evals (⚠️ deprecation notice) — https://developers.openai.com/api/docs/guides/evals
- OpenAI, Evaluation best practices — https://developers.openai.com/api/docs/guides/evaluation-best-practices
- OpenAI, Evals cookbook — https://developers.openai.com/cookbook/topic/evals
- OpenAI, Why we no longer evaluate SWE-bench Verified — https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/ — 2026-02

**Frameworks & tools**
- Inspect AI docs — https://inspect.aisi.org.uk/ · repo https://github.com/UKGovernmentBEIS/inspect_ai · evals https://ukgovernmentbeis.github.io/inspect_evals/ · AISI announcement https://www.aisi.gov.uk/blog/inspect-evals
- Langfuse — https://langfuse.com/docs · eval overview https://langfuse.com/docs/evaluation/overview · LLM-as-judge https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge · repo https://github.com/langfuse/langfuse
- Arize Phoenix — https://arize.com/phoenix/ · repo https://github.com/Arize-ai/phoenix · courses https://courses.arize.com/
- Braintrust — https://www.braintrust.dev/docs · pricing https://www.braintrust.dev/pricing · eval library https://www.braintrust.dev/evals
- LangSmith — https://docs.smith.langchain.com/ · agent evals https://www.langchain.com/resources/agent-evals
- Ragas metrics — https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/
- lm-evaluation-harness — https://github.com/EleutherAI/lm-evaluation-harness
- HELM (⚠️ maintenance mode 2026-06-01) — https://github.com/stanford-crfm/helm

**Courses (short)**
- DeepLearning.AI, Evaluating AI Agents (Arize) — https://www.deeplearning.ai/courses/evaluating-ai-agents — free, 2h36m, 15 lessons
- DeepLearning.AI, Building and Evaluating Data Agents — https://www.deeplearning.ai/short-courses/building-and-evaluating-data-agents/
- DeepLearning.AI, Automated Testing for LLMOps — https://www.deeplearning.ai/courses/automated-testing-llmops (older; CI-focused)
- Arize University — https://courses.arize.com/l/products

**Writing**
- Eugene Yan, eval tag index — https://eugeneyan.com/tag/eval/
- Eugene Yan, An LLM-as-Judge Won't Save The Product — https://eugeneyan.com/writing/eval-process/ — 2025-04-20
- Eugene Yan, Evaluating the Effectiveness of LLM-Evaluators — https://eugeneyan.com/writing/llm-evaluators/ — 2024-08-18
- Eugene Yan, AlignEval — https://eugeneyan.com/writing/aligneval/ — 2024-10-27
- Jason Liu, Systematically Improving Your RAG — https://jxnl.co/writing/2024/05/22/systematically-improving-your-rag/ — 2024-05-22
- Jason Liu, Systematically Improving RAG Applications — https://jxnl.co/writing/2025/01/24/systematically-improving-rag-applications/ — 2025-01-24 · course https://maven.com/applied-llms/rag-playbook · free talk https://parlance-labs.com/education/rag/jason.html
- HF Evaluation Guidebook (maintained) — https://huggingface.co/spaces/OpenEvals/evaluation-guidebook · (unmaintained repo) https://github.com/huggingface/evaluation-guidebook

**Papers**
- Zheng et al., Judging LLM-as-a-Judge (MT-Bench) — https://arxiv.org/abs/2306.05685 — NeurIPS 2023
- Shankar et al., Who Validates the Validators? (EvalGen) — https://arxiv.org/abs/2404.12272 — UIST 2024
- Shankar et al., SPADE — https://arxiv.org/pdf/2401.03038 — Jan 2024
- Es et al., RAGAS — https://arxiv.org/abs/2309.15217 — Sep 2023
- Saad-Falcon et al., ARES — https://arxiv.org/abs/2311.09476 — Nov 2023
- Yao et al., τ-bench — https://arxiv.org/abs/2406.12045 — Jun 2024 · https://sierra.ai/resources/research/tau-bench
- Barres et al., τ²-bench — https://arxiv.org/abs/2506.07982 — Jun 2025 · https://github.com/sierra-research/tau2-bench
- Miller, Adding Error Bars to Evals — https://arxiv.org/abs/2411.00640 — 2024-11-01
- Liang et al., HELM — https://arxiv.org/pdf/2211.09110 — Nov 2022
- Singh et al., The Leaderboard Illusion — https://arxiv.org/pdf/2504.20879 — Apr 2025
- Log analysis is necessary for credible evaluation of AI agents — https://arxiv.org/pdf/2605.08545 — 2026
- Holistic Agent Leaderboard — https://arxiv.org/pdf/2510.11977 — Oct 2025
- CyberSecEval 3 — https://arxiv.org/pdf/2408.01605 — Aug 2024

**Safety & standards**
- OWASP GenAI LLM Top 10 2026 — https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/ — pub. 2026-08-04
- OWASP announcement (Top 10 2026 + Agent Control Standard) — https://genai.owasp.org/2026/09/01/owasp-genai-security-project-unveils-2026-top-10-for-llm-applications-new-agent-control-standard-and-sponsors-as-community-tops-30000-members/ — 2026-09-01
- OWASP Top 10 for LLM & GenAI initiative — https://genai.owasp.org/initiative/owasp-top-10-for-llm-and-genai/
- CSA research note on OWASP 2026 — https://labs.cloudsecurityalliance.org/research/csa-research-note-owasp-genai-top10-2026-agent-control-stand/

**Events / market**
- AI Engineer World's Fair 2026 (Evals track, Day 3) — https://ai.engineer/worldsfair/2026 · schedule https://www.ai.engineer/worldsfair/schedule.pdf — Jun 29–Jul 2, 2026
- Arize writeup of the Maven Recipe Bot homework — https://arize.com/blog/ai-evals-maven-course-homework-the-recipe-bot-workflow/

---

## Caveats on sourcing

- Job-market figures (§ "Why this field, right now") come from recruiting-blog and aggregator sources, which are SEO-adjacent. The *trend* (standalone eval-engineer titles) is corroborated by primary evidence — Anthropic's dedicated Model Evaluations role and the AI Engineer World's Fair Evals track. Treat specific salary and headcount numbers as unverified.
- Tool-comparison articles dated 2026 (dev.to, marktechpost, qaskills.sh, benchmarkingagents.com) were used only to locate primary docs and to date specific feature launches (Langfuse MIT licensing of LLM-as-judge, Code Evaluators, the ClickHouse acquisition, Braintrust's Starter-tier rename). Verify any feature or pricing claim against the vendor's own docs before relying on it.
- The Jason Liu Maven course page showed **November 2025** cohort dates when checked on 2026-09-18. Confirm a live 2026 cohort before paying; the free writing is unaffected.
- Inter-annotator agreement guidance in Module 2 is largely **synthesised** — the practitioner literature is genuinely thin here, favouring the single-expert pattern instead. The κ/α recommendations come from standard measurement theory, not from an eval-specific primary source. Flagged as such deliberately; it is also an opportunity for original contribution.
