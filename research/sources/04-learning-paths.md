# Learning Paths for AI & Data Science — Evidence Review (late 2026)

**Scope:** which resources, credentials and skill sequences give a self-directed learner the best return, and in what order.
**Date of research:** 2026-09-18. Prioritised 2025–2026 sources.

## Source-quality note (read first)

This topic is heavily polluted by SEO content farms and certification-marketing sites that invent salary figures with no methodology. I have tiered every source:

- **Tier A — primary data with stated methodology:** Stanford AI Index / Lightcast, Indeed Hiring Lab, PwC AI Jobs Barometer, Dice Tech Jobs Report, Coursera Job Skills Report, SignalFire, Levels.fyi, peer-reviewed RCTs (Anthropic, MIT Media Lab, *Scientific Reports*), official course pages.
- **Tier B — named practitioner with a track record, but n=1 opinion:** Hamel Husain, Jakub Lasak, Jeremy Howard, Andrej Karpathy.
- **Tier C — unsourced blog/SEO claims:** flagged inline as **[weak]**. I have *not* used these to support any recommendation, only to note what is being claimed.

Where a widely-repeated number turns out to be Tier C (e.g. "AWS certification = +26% salary"), I say so explicitly rather than laundering it.

---

## 1. Recommended sequencing with time budgets and rationale

**Assumed learner:** working adult, 10–15 hrs/week, some coding ability. Total ≈ 14–20 months to job-ready-in-a-new-specialisation; 6–9 months if you already have a CS/quant background.

The 10–20 hrs/week part-time figure and the 6–12 month job-ready range are the consensus across course providers ([Careery, 2026](https://careery.pro/blog/data-science-careers/data-scientist-roadmap); [Dataquest ML roadmap](https://www.dataquest.io/blog/machine-learning-roadmap/)) — Tier C on the specifics, but the ordering below is anchored to Tier A demand data, not to those blogs.

### Stage 0 — Python + SQL fluency (6–10 weeks, ~100 hrs)

**Why first, with evidence:** Python is the single most-demanded specialised skill in AI job postings — 258,674 US postings in 2025, up 391% on the 2013–15 baseline and ~30% year-over-year ([Stanford AI Index 2026, via Lightcast, 13 Apr 2026](https://lightcast.io/resources/blog/stanford-ai-2026)). Coursera's 2026 report finds SQL and JSON "remain essential alongside new AI competencies" even as GenAI enrolments exploded ([Coursera Job Skills Report 2026, 21 Jan 2026](https://blog.coursera.org/introducing-courseras-job-skills-report-2026-the-most-critical-skills-the-worlds-learners-need-this-year/)).

Do not skip SQL to get to the exciting part. Data & analytics is the occupation where AI has penetrated furthest — 45% of postings mention AI ([Indeed Hiring Lab, 22 Jan 2026](https://hiringlab.indeed.com/2026/01/22/january-labor-market-update-jobs-mentioning-ai-are-growing-amid-broader-hiring-weakness/)) — which means AI work in that field sits *on top of* SQL, not instead of it.

### Stage 1 — Statistics, probability, and just-enough linear algebra (8–12 weeks, ~120 hrs)

**Why here and not later:** this is the stage most self-directed learners skip, and the one that is hardest to retrofit. The market signal is indirect but strong: Coursera reports critical-thinking enrolments up **+168% YoY among Data learners and +185% among GenAI learners**, which they attribute to "the need for human validation as workers increasingly delegate tasks to AI" ([Coursera, Jan 2026](https://blog.coursera.org/introducing-courseras-job-skills-report-2026-the-most-critical-skills-the-worlds-learners-need-this-year/)). Data Quality (+108%) and Data Cleansing (+103%) enrolments grew similarly. Judgement about whether a number is real is the part AI does not do for you.

Scope discipline: you need descriptive stats, distributions, hypothesis testing, experimental design, regression, and enough linear algebra to read a matrix multiplication. You do not need a maths degree before writing your first model.

### Stage 2 — Classic ML (8–10 weeks, ~100 hrs)

Supervised/unsupervised learning, cross-validation, regularisation, tree ensembles, honest evaluation, leakage. ML appears in roughly 69% of data-scientist postings, third behind Python and SQL **[weak — Tier C aggregation]**, but the Tier A signal is Dice's: AI/ML tech postings grew **101% YoY (Aug 2026 vs Aug 2025)**, more than five times the 18% growth of tech postings overall ([Dice 2026 Tech Jobs Report, Sept 2026](https://www.dice.com/hiring/recruitment/reports/dice-tech-job-report)).

### Stage 3 — Deep learning (6–10 weeks, ~90 hrs)

Enough to be dangerous: backprop, CNNs/transformers, transfer learning, fine-tuning. **This stage is now smaller than it was in 2022.** Most applied AI jobs consume models rather than train them. Go deeper here only if you're targeting research/ML-engineering roles rather than AI-engineering roles.

### Stage 4 — LLMs, RAG, agents, and **evals** (10–14 weeks, ~150 hrs)

**This is where the market has moved.** Agentic-AI skills went from 0.06% of postings in 2024 to 0.23% in 2025 — a ~280% jump, ~90,000 US postings ([Stanford AI Index 2026 / Lightcast](https://lightcast.io/resources/blog/stanford-ai-2026)). Dice lists "AI Agents and Agentic AI", "Responsible AI" and "AI Infrastructure" among skills growing **over 200% YoY** ([Dice, Sept 2026](https://www.dice.com/hiring/recruitment/reports/dice-tech-job-report)). Coursera ranks "Generative AI Agents" #3 among fastest-growing GenAI skills ([Coursera, Jan 2026](https://blog.coursera.org/introducing-courseras-job-skills-report-2026-the-most-critical-skills-the-worlds-learners-need-this-year/)).

Within this stage, **evals are the highest-leverage sub-skill and the most under-supplied.** Husain and Shankar — who have trained 2,000+ engineers and PMs including teams at OpenAI and Anthropic — argue evals function as "living product requirements documents" ([Lenny's Newsletter, 25 Sept 2025](https://www.lennysnewsletter.com/p/why-ai-evals-are-the-hottest-new-skill)). Their free written material ([hamel.dev evals FAQ](https://hamel.dev/blog/posts/evals-faq/)) is the most-cited practitioner reference on the topic. Treat "I can build a RAG demo" as table stakes and "I can prove whether it works" as the differentiator.

### Stage 5 — MLOps / deployment / data engineering (8–12 weeks, ~120 hrs)

**Evidence this belongs late but is non-optional:** the Stanford AI Index found the strongest *long-term* growth in "deployment-oriented capabilities such as Amazon Web Services, scalability, and workflow management", and Lightcast's summary is that "AI hiring has moved away from experimentation and toward execution" ([Lightcast, 13 Apr 2026](https://lightcast.io/resources/blog/stanford-ai-2026)). Dice's >200% YoY list includes "Artificial Intelligence Infrastructure" and "Enterprise Integration".

### Stage 6 — ongoing: domain + communication (continuous)

See §5. PwC's finding that AI-exposed entry-level roles are **seven times more likely** to require traditionally senior skills like judgement and leadership ([PwC 2026 Global AI Jobs Barometer](https://www.pwc.com/gx/en/news-room/press-releases/2026/pwc-2026-ai-jobs-barometer.html)) means the soft-skill layer is not a nice-to-have appendix.

### Sequencing caveat worth taking seriously

A strict linear march is not obligatory. fast.ai explicitly teaches top-down — you build a working model in lesson 1 and backfill theory later ([course.fast.ai](https://course.fast.ai/)) — and that approach has a real track record. The defensible claim is about *what you must not permanently skip* (SQL, statistics, evaluation discipline), not about a rigid order.

---

## 2. Best resources per stage

| Stage | Resource | Why it's here | Cost | Time |
|---|---|---|---|---|
| 0: Python/SQL | [Kaggle Learn](https://www.kaggle.com/learn) micro-courses | Fastest zero-to-competent on pandas/SQL; free; widely used as a warm-up rather than a credential | Free | 20–30 hrs |
| 0–1: Foundations | [MIT OCW 18.06 Linear Algebra (Strang)](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) | The default public reference for the linear algebra AI actually uses; not a credential, a comprehension tool | Free | 30–40 hrs (selective) |
| 2: Classic ML | [Machine Learning Specialization](https://www.coursera.org/specializations/machine-learning-introduction) (Ng, Stanford/DeepLearning.AI) | **839,576 enrolled, 4.9/5 from 39,348 reviews.** The single most broadly recognised starting credential in the field; recruiters know the name | $49/mo Coursera sub | ~2 months @ 10 hrs/wk |
| 2: Classic ML (depth) | [Stanford CS229](https://cs229.stanford.edu/) public notes/lectures | Where the maths behind the Coursera course actually lives; use as the rigour layer, not the first pass | Free | 60–80 hrs |
| 3: Deep learning | [fast.ai Practical Deep Learning for Coders](https://course.fast.ai/) (Jeremy Howard) | Top-down, project-first; free including the book. **Caveat: current recorded version is 2022** — principles hold, tooling has moved | Free | Part 1: 9 lessons × ~90 min + practice ≈ 60 hrs |
| 3: DL depth | [Karpathy, Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html) | Builds backprop → GPT live on screen. The most widely endorsed "actually understand transformers" resource; Tier B but near-universal endorsement | Free | ~25–35 hrs |
| 3–4: LLM internals | [karpathy/nanochat](https://github.com/karpathy/nanochat) | Covers tokenization → pretraining → SFT → RL → inference in readable code. Full run costs ~$100 of GPU (≈$48 for 2 hrs on 8×H100; ~$15 on spot) | Free code, ~$15–100 compute | 20–40 hrs |
| 3–4: LLM internals (deep) | [Stanford CS336, Language Modeling from Scratch](https://stanford-cs336.github.io/) (Liang, Hashimoto; Spring 2026, Mar 30–Jun 10 2026) | 17 lectures, 5 assignments (BPE → Triton kernels → scaling laws → evals → DPO/GRPO). Materials public. **Officially 20–25 hrs/wk for 10 weeks** — this is a serious commitment, not a skim | Free (materials) | 200–250 hrs |
| 3–4: NLP | [Stanford CS224N](https://web.stanford.edu/class/cs224n/) | Public lecture materials; the standard bridge from classic NLP to transformers | Free | 50–70 hrs |
| 4: Agents | [Hugging Face AI Agents Course](https://huggingface.co/learn/agents-course/unit0/introduction) | **Free including certification.** 4 chapters + 3 bonus units, ~3–4 hrs/week, covers smolagents/LangGraph/LlamaIndex + observability. Prereqs: basic Python + LLM basics | Free | 15–25 hrs |
| 4: LLM fundamentals | [Hugging Face LLM Course](https://huggingface.co/learn/llm-course) | 12 chapters, transformers → fine-tuning, runs in Colab | Free | 15–20 hrs |
| 4: Tool integration | [Hugging Face MCP Course](https://huggingface.co/learn/mcp-course) | MCP servers/clients/tools/resources — directly relevant to 2026 agent tooling | Free | 10–15 hrs |
| 4: Agent patterns | [DeepLearning.AI Agentic AI](https://www.deeplearning.ai/courses) (Ng, ~10 hrs) | Reflection, tool use, planning, multi-agent. **Videos free; labs/quizzes/certificates now require Pro at $25/mo billed annually** | Free to audit | ~10 hrs |
| 4: **Evals** | [hamel.dev evals FAQ](https://hamel.dev/blog/posts/evals-faq/) + [AI Evals for Engineers & PMs](https://maven.com/parlance-labs/evals) (Husain & Shankar) | The free writing is the reference practitioners cite; the paid cohort has trained 2,000+ people incl. OpenAI/Anthropic teams. Do the free version first | Free / paid cohort | 10 hrs free; cohort ~4 weeks |
| 5: MLOps | [Full Stack Deep Learning 2022](https://fullstackdeeplearning.com/course/2022/) | Still the best free *systems-thinking* curriculum for ML products. **Explicitly stale: no updated cohort since 2022**, predates the LLM tooling stack. Use for principles only | Free | 30–40 hrs (selective) |

**Widely endorsed vs single-blogger picks.** Broadly endorsed across independent sources: Ng's Coursera specializations, fast.ai, Karpathy Zero-to-Hero, Hugging Face courses, Stanford public course materials, MIT OCW. Strong but narrower (respected within practitioner circles, less name-recognition with generalist recruiters): Husain/Shankar evals, CS336, nanochat. Effectively deprecated: Full Stack Deep Learning as a current curriculum.

---

## 3. Certification ROI verdict

**Headline: the salary numbers circulating for certifications are not trustworthy.** Claims like "AWS certification increases salary by 26%" or "Databricks certification earns 15–25% more" trace back to certification-training vendors and SEO sites with no published methodology and no control for the fact that people who get certified are already working in that stack. These are **Tier C and I do not endorse any of them.** The one reputable adjacent survey, Skillsoft's IT Skills & Salary Report (n>5,100 IT professionals, May–Sept 2024), is published by a company that sells certification training — an unavoidable conflict of interest ([Skillsoft, Nov 2024](https://www.skillsoft.com/press-releases/skillsoft-new-it-skills-and-salary-report-highlights-trends-impacting-technology-careers-investments-and-talent-strategies-for-2025)).

What *is* well-evidenced is the wage premium for **AI skills**, not for AI certificates: PwC's 2026 Barometer, analysing over one billion job ads across 24 countries and comparing advertised wages *within the same occupation*, finds a **62% average wage premium** for roles listing AI skills (up from 57%), ranging from 118% in consumer markets to 16% in government ([PwC, 2026](https://www.pwc.com/gx/en/news-room/press-releases/2026/pwc-2026-ai-jobs-barometer.html)). That is a premium on demonstrated skill in the posting, not on a badge.

| Credential | Cost | Evidence it moves hiring/pay | Verdict |
|---|---|---|---|
| **AWS Certified Machine Learning – Specialty / AI Practitioner** | $100–$300 | Lightcast-derived posting counts show AWS certs are among the most-named in postings generally (AWS SAA ≈184,000 US postings H1 2026 **[Tier C citing Lightcast]**), but ML-Specialty specifically is rarely a stated requirement | **Marginal.** Useful only if you target AWS-shop employers or need to pass a keyword filter. Not a differentiator |
| **GCP Professional ML Engineer** | $200 exam; ~100–120 study hrs | Job-posting demand is thin — cert-marketing sites themselves report between 0 and 10 US postings requiring it **[Tier C, and note that even the vendors selling prep can't find demand]** | **Low ROI.** The study time buys more as a project |
| **Azure AI Engineer Associate** | ~$165 | Named among the more frequently requested AI credentials in enterprise/Microsoft-shop postings **[Tier C citing Lightcast]** | **Situational.** Worth it only if you're inside or targeting a Microsoft enterprise environment |
| **Databricks Certified Data Engineer / ML Associate** | ~$200 each | Direct practitioner counter-evidence: a Databricks hiring-manager guide reports a recruiting firm saying the Data Engineer Associate cert "adds nothing to the band, it appears on every other resume," and that they have "never had a hiring manager close on the strength of one" ([Jakub Lasak, 21 Jan 2026](https://dataengineerwiki.substack.com/p/the-databricks-hiring-managers-guide)) | **Negative-to-neutral as a differentiator.** Genuinely useful as a *study structure* if you must learn the platform |
| **Snowflake / dbt certifications** | ~$175 / free–$200 | No credible independent hiring or pay evidence found | **Unproven.** Learn the tools; skip the exam unless an employer pays |
| **NVIDIA certifications (DLI etc.)** | $135–$400 | No credible independent hiring or pay evidence found; strongest in GPU-infrastructure niches | **Unproven** outside specialist infra roles |
| **Coursera/DeepLearning.AI Specialization certificates** | $49/mo | Not a credential employers verify, but the *name recognition* of Ng's courses is real, and Coursera reports professional-certificate enrolments up 91% across career areas ([Coursera, Jan 2026](https://blog.coursera.org/introducing-courseras-job-skills-report-2026-the-most-critical-skills-the-worlds-learners-need-this-year/)) | **Buy the learning, not the certificate.** The curriculum is excellent; the PDF is close to worthless on its own |
| **Hugging Face course certificates** | Free | No hiring evidence either way | **Free, so ROI is trivially non-negative.** Do the course for the skill; the certificate costs you nothing extra |

**The honest bottom line.** Certifications function as (a) a keyword filter pass, (b) a forcing function for structured study, and (c) a weak signal for career-changers with nothing else to show. They do **not** function as evidence of competence to a technical hiring manager. The strongest single data point in this whole report on that question is SignalFire's: "the most reliable path to a career in tech is no longer getting hired and waiting to be trained — it is demonstrating proof of work before anyone gives you permission" ([SignalFire State of Talent Report 2026, 22 June 2026](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2026)).

If you have a fixed budget of 100 hours, spending it on a shipped, evaluated project beats spending it on any exam on this list.

---

## 4. Portfolio project archetypes that get hired

The context that makes this section urgent: entry-level tech hiring is down roughly **65% at the tech majors and ~76% at early-stage startups versus 2019**, while AI/ML engineering roles have grown 39% since 2022 and forward-deployed engineering 30% ([SignalFire, 22 June 2026](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2026)). You are not competing on credentials against an empty field; you are competing on evidence against experienced ICs.

SignalFire names the specific artefacts: "a verifiable portfolio of shipped applications, active open-source contributions, custom agent workflows, and documented customer discovery."

**Archetype 1 — A shipped agentic app with a real user (highest signal).**
Not a notebook. Deployed, with someone other than you using it. Maps directly to the fastest-growing posting category (agentic AI, +280% YoY, [Stanford AI Index 2026](https://lightcast.io/resources/blog/stanford-ai-2026)). The "documented customer discovery" half matters as much as the code — it's the judgement layer PwC says AI-exposed roles now demand ([PwC 2026](https://www.pwc.com/gx/en/news-room/press-releases/2026/pwc-2026-ai-jobs-barometer.html)).

**Archetype 2 — An eval harness for that app (highest signal-to-effort ratio).**
A golden dataset, error analysis, code-based checks plus an LLM-as-judge you validated against human labels, and a write-up of what you found and changed. This is rare in portfolios and directly matches what Husain and Shankar describe as the differentiating skill ([Lenny's Newsletter, Sept 2025](https://www.lennysnewsletter.com/p/why-ai-evals-are-the-hottest-new-skill); [hamel.dev](https://hamel.dev/blog/posts/evals-faq/)). It also demonstrates the statistics from Stage 1 in an applied setting.

**Archetype 3 — An end-to-end data pipeline with production characteristics.**
Ingestion → transformation → orchestration → monitoring, with a cost figure attached. The Databricks hiring guide names exactly three callback signals: **production, cost, architecture** ([Lasak, Jan 2026](https://dataengineerwiki.substack.com/p/the-databricks-hiring-managers-guide)). "I reduced the nightly job from $X to $Y" is the sentence that gets a callback.

**Archetype 4 — Open-source contributions to a real project.**
A merged PR means your code passed review by actual maintainers — a signal a solo repo cannot produce. **Important caution:** maintainers are now actively hostile to CV-driven low-quality PRs; one widely-read maintainer post is titled "Please stop flooding our projects with AI slop to furnish your CV" ([Neil Alexander, 30 June 2026](https://neilalexander.dev/2026/06/30/flooding-contributions)). Two substantive merged contributions beat twenty typo fixes, and drive-by AI-generated PRs actively damage your reputation.

**Archetype 5 — Writing.**
Public technical writing is now something recruiters' tooling reads directly: recruiter outreach referencing "a candidate's specific open-source contributions, published models, or technical blog posts converts at dramatically higher rates" **[Tier C — recruiting-vendor blog, directionally consistent with SignalFire's Tier A framing]**. A post explaining what broke in your eval harness is worth more than a tutorial rehash.

**Archetype 6 — Kaggle (lowest signal per hour).**
Honest assessment: datasets arrive cleaned, so it exercises modelling but not the data-munging and problem-framing that dominate real work; and only strong placements read as achievement rather than participation ([Data Science Weekly, "5 Reasons Kaggle Projects Won't Help Your Data Science Resume"](https://www.datascienceweekly.org/articles/5-reasons-kaggle-projects-won-t-help-your-data-science-resume)). Use Kaggle to *learn* modelling; don't expect a bronze medal to carry a portfolio.

**Rule of thumb across sources:** three deep, honestly-evaluated, deployed projects beat ten tutorial completions. Tutorial datasets signal tutorial completion.

---

## 5. Skill-stacking combos

**The T-shape case is supported, but be careful about the numbers.** The widely-circulated claim that domain experts earn "30–50% more than generalists" is **Tier C with no methodology** — I found it only on SEO career blogs. Do not plan around it.

What *is* Tier A: PwC's premium for AI skills varies enormously by sector — **118% in consumer markets down to 16% in government/public sector** ([PwC 2026](https://www.pwc.com/gx/en/news-room/press-releases/2026/pwc-2026-ai-jobs-barometer.html)). That is direct evidence that *which industry you attach your AI skills to* materially changes the return. And Indeed's occupational breakdown shows where AI is diffusing fastest outside tech: marketing went from 8.4% to 14.9% of postings mentioning AI in eleven months, HR doubled from 4.4% to 8.8% ([Indeed Hiring Lab, Jan 2026](https://hiringlab.indeed.com/2026/01/22/january-labor-market-update-jobs-mentioning-ai-are-growing-amid-broader-hiring-weakness/)).

| Stack | Evidence / rationale | Comment |
|---|---|---|
| **AI + your current industry** | PwC's 16%→118% sector spread; Indeed's diffusion data | Strongest and cheapest move for a working adult. You already have the domain half — the expensive half. Don't discard it to become a generalist |
| **AI + data/software engineering** | Deployment skills (AWS, scalability, workflow management) show the strongest long-term posting growth ([Stanford AI Index 2026](https://lightcast.io/resources/blog/stanford-ai-2026)); Dice's >200% list includes AI Infrastructure and Enterprise Integration | The most reliably employable technical stack. "Execution, not experimentation" |
| **AI + product/customer-facing** | Forward-deployed engineer roles +30% and sales engineer +11% since 2022 ([SignalFire 2026](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2026)); SignalFire names "documented customer discovery" as portfolio evidence | Fast-growing and under-supplied; suits career-changers with commercial background |
| **AI + judgement/communication** | PwC: AI-exposed entry-level roles are **7× more likely** to require traditionally senior skills (judgement, leadership); those roles grew 35% since 2019 while other entry-level roles fell 10% | Not a soft add-on. The Coursera critical-thinking surge (+185% among GenAI learners) is the same signal from the supply side |
| **AI + marketing / HR / finance ops** | Indeed: marketing 8.4%→14.9%, HR 4.4%→8.8%, accounting ~6% of postings mention AI | Lower AI density than tech, but far less competition. Good asymmetric bet if that's your existing field |

Front-end engineering is the one adjacency to avoid doubling down on: roles down ~25%, the steepest decline of any specialty ([SignalFire 2026](https://www.signalfire.com/blog/signalfire-state-of-talent-report-2026)).

---

## 6. Learning-with-AI guidance

This is the section with the best experimental evidence in the whole report, and it is more pointed than the usual advice.

**Finding 1 — Unstructured AI assistance measurably damages skill formation.**
Anthropic ran an RCT (n=52, mostly junior engineers with 1+ years of weekly Python) on learning a new library. The AI-assisted group scored **50% on a quiz about concepts they had used minutes earlier, versus 67% for the hand-coding group** — Cohen's d = 0.738, p = 0.01, described as "nearly two letter grades." The AI group finished about two minutes faster, which was **not statistically significant**. The largest gap was in **debugging** — recognising that code is wrong and working out why ([Anthropic, 29 Jan 2026](https://www.anthropic.com/research/AI-assistance-coding-skills)).

**Finding 2 — *How* you use it flips the result.** This is the actionable part. Anthropic classified behaviours:

- **High performers:** *generation-then-comprehension* (generate, then interrogate it), *hybrid code-explanation* (ask for explanation alongside code), *conceptual inquiry* (ask only concept questions, fix your own errors).
- **Low performers:** *AI delegation* (let it write everything), *progressive AI reliance* (start by asking, drift into delegating), *iterative AI debugging* (paste the error, take the fix, learn nothing).

The researchers' framing: the difference was "whether you were thinking alongside the tool or letting it think for you." They also warn the effect is likely **more** pronounced with agentic coding products than with the chat setup they tested.

**Finding 3 — The same pattern shows up neurologically.** MIT Media Lab's study (n=54, four sessions over four months, EEG) found LLM users showed the weakest brain connectivity versus search-engine and brain-only groups, performed worse "at all levels: neural, linguistic, scoring," reported the lowest sense of ownership of their own work, and struggled to quote essays they had just written ([*Your Brain on ChatGPT*, arXiv:2506.08872](https://arxiv.org/abs/2506.08872); [project page](https://www.media.mit.edu/projects/your-brain-on-chatgpt/overview/)).

**Finding 4 — But a *pedagogically designed* AI tutor beats the best classroom instruction.** A Harvard RCT (n=194 physics undergraduates, published *Scientific Reports*, 3 June 2025) found students using a purpose-built AI tutor ("PS2 Pal" — Socratic, timely feedback, growth-mindset framing, withholding answers) achieved **median learning gains more than double** those of students in an active-learning classroom, in less time, with higher engagement ([Kestin et al., *Scientific Reports*](https://www.nature.com/articles/s41598-025-97652-6)).

The reconciliation is clean: **AI configured to make you think outperforms a good teacher; AI configured to save you effort underperforms doing it yourself.**

**Practical protocol:**

1. **Attempt first, always.** Write the code or the derivation before you open the chat. Getting stuck is the mechanism, not the obstacle — Anthropic's own summary notes the most productive learning happens when the tool generates almost no code.
2. **Use explanatory/study modes.** Anthropic explicitly recommends Claude's Explanatory mode and ChatGPT's Study Mode for learning contexts.
3. **Ban paste-the-error debugging during learning.** This is the single behaviour most associated with poor outcomes, and debugging was the largest measured skill gap.
4. **Always ask "why," then close the tab and re-derive.** Generation-then-comprehension only works if the comprehension step actually happens.
5. **Self-test without the tool.** The Anthropic quiz effect exists precisely because learners *felt* they understood. Subjective fluency is not evidence.
6. **Separate build mode from learn mode explicitly.** Use full agentic assistance when shipping the portfolio project; use the protocol above when the goal is retention. Confusing the two is how people end up with an impressive repo and no ability to discuss it in an interview — a fatal combination when the portfolio is what gets you the interview.

---

## 7. Source list

**Tier A — labour market data**
- Stanford AI Index 2026, summarised by Lightcast, 13 Apr 2026 — https://lightcast.io/resources/blog/stanford-ai-2026 ; report home: https://hai.stanford.edu/ai-index/2026-ai-index-report
- Indeed Hiring Lab, "January 2026 US Labor Market Update: Jobs Mentioning AI Are Growing Amid Broader Hiring Weakness," 22 Jan 2026 — https://hiringlab.indeed.com/2026/01/22/january-labor-market-update-jobs-mentioning-ai-are-growing-amid-broader-hiring-weakness/
- PwC, 2026 Global AI Jobs Barometer (>1bn job ads, 24 countries), 2026 — https://www.pwc.com/gx/en/news-room/press-releases/2026/pwc-2026-ai-jobs-barometer.html (note: pwc.com returned 403 to direct fetch; figures taken from the press release text as reported by PwC and PR Newswire — https://www.prnewswire.com/news-releases/ai-reshapes-global-labour-market-into-two-distinct-paths-rewarding-human-skills-pwc-2026-global-ai-jobs-barometer-302798987.html)
- Dice, 2026 Tech Jobs Report, Sept 2026 (Aug 2026 data) — https://www.dice.com/hiring/recruitment/reports/dice-tech-job-report
- SignalFire, State of Tech Talent Report 2026, 22 June 2026 — https://www.signalfire.com/blog/signalfire-state-of-talent-report-2026
- Coursera, Job Skills Report 2026 (≈6m enterprise learners, 7,000+ customers), 21 Jan 2026 — https://blog.coursera.org/introducing-courseras-job-skills-report-2026-the-most-critical-skills-the-worlds-learners-need-this-year/
- Levels.fyi, ML/AI SWE and Machine Learning Engineer compensation — https://www.levels.fyi/t/software-engineer/focus/ml-ai
- Skillsoft, IT Skills & Salary Report 2024–25 (n>5,100; vendor conflict of interest noted), Nov 2024 — https://www.skillsoft.com/press-releases/skillsoft-new-it-skills-and-salary-report-highlights-trends-impacting-technology-careers-investments-and-talent-strategies-for-2025
- Stack Overflow Developer Survey 2025, 29 Dec 2025 — https://stackoverflow.blog/2025/12/29/developers-remain-willing-but-reluctant-to-use-ai-the-2025-developer-survey-results-are-here/

**Tier A — learning-science research**
- Anthropic, "How AI assistance impacts the formation of coding skills" (RCT, n=52), 29 Jan 2026 — https://www.anthropic.com/research/AI-assistance-coding-skills
- Kosmyna et al., "Your Brain on ChatGPT: Accumulation of Cognitive Debt…" (n=54, EEG), arXiv:2506.08872, June 2025 — https://arxiv.org/abs/2506.08872 ; https://www.media.mit.edu/projects/your-brain-on-chatgpt/overview/
- Kestin, Miller, Klales et al., "AI tutoring outperforms in-class active learning: an RCT…" (n=194), *Scientific Reports*, 3 June 2025 — https://www.nature.com/articles/s41598-025-97652-6

**Tier A — official course pages**
- Coursera / DeepLearning.AI, Machine Learning Specialization (839,576 enrolled; 4.9/5, 39,348 reviews) — https://www.coursera.org/specializations/machine-learning-introduction
- fast.ai, Practical Deep Learning for Coders (free; current recording 2022) — https://course.fast.ai/
- Hugging Face AI Agents Course (free incl. certification; 3–4 hrs/week) — https://huggingface.co/learn/agents-course/unit0/introduction
- Hugging Face LLM Course — https://huggingface.co/learn/llm-course ; MCP Course — https://huggingface.co/learn/mcp-course
- Stanford CS336, Language Modeling from Scratch, Spring 2026 (Liang, Hashimoto) — https://stanford-cs336.github.io/ ; https://online.stanford.edu/courses/cs336-language-modeling-scratch
- Stanford CS229 — https://cs229.stanford.edu/ ; CS224N — https://web.stanford.edu/class/cs224n/
- Karpathy, Neural Networks: Zero to Hero — https://karpathy.ai/zero-to-hero.html ; nanochat — https://github.com/karpathy/nanochat
- Full Stack Deep Learning 2022 (not updated since) — https://fullstackdeeplearning.com/course/2022/
- DeepLearning.AI course catalogue (videos free; Pro $25/mo annual for labs/certs) — https://www.deeplearning.ai/courses
- Google Cloud Professional ML Engineer certification ($200) — https://cloud.google.com/learn/certification/machine-learning-engineer

**Tier B — named practitioners**
- Hamel Husain, "AI Evals: Everything You Need to Know" — https://hamel.dev/blog/posts/evals-faq/
- Husain & Shankar on Lenny's Newsletter, 25 Sept 2025 — https://www.lennysnewsletter.com/p/why-ai-evals-are-the-hottest-new-skill ; course: https://maven.com/parlance-labs/evals
- Jakub Lasak, "The Databricks Hiring Manager's Guide," 21 Jan 2026 — https://dataengineerwiki.substack.com/p/the-databricks-hiring-managers-guide
- Neil Alexander, "Please stop flooding our projects with AI slop to furnish your CV," 30 June 2026 — https://neilalexander.dev/2026/06/30/flooding-contributions
- Data Science Weekly, "5 Reasons Kaggle Projects Won't Help Your Data Science Resume" — https://www.datascienceweekly.org/articles/5-reasons-kaggle-projects-won-t-help-your-data-science-resume

**Explicitly rejected as evidence (Tier C, cited only to flag)**
Certification-vendor and SEO salary claims — e.g. "AWS certification increases salary by 26%," "Databricks certified earn 15–25% more," "domain experts earn 30–50% more than generalists." None publish methodology, sample, or controls for selection effects. Sources include studytech.ai, certpayback.com, knowledgehut.com, lucentinnovation.com, and similar. Treat all such figures as marketing.
