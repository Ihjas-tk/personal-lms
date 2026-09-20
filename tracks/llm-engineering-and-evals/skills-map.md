# AI & Data Skills Map, 2026–2030

Research compiled 2026-09-18 from four independent evidence angles (job-posting data, analyst forecasts, practitioner voice, learning-path evidence). Full source reports with citations live in [`research/`](research/).

> **Personal track (added 2026-09-18):** with an MSc in Data Science (2022) and oil and gas domain experience, stages 0–3 below are skipped. The detailed LLM engineering + AI evals curriculum, the 40-week calendar, and the oil and gas project spine are in [README.md](README.md).

## The verdict in one line

The bottleneck in AI work has moved from **building things** to **proving they work**. Every angle converges on the same scarce, rising, well-paid skill: evaluation and reliability. Plan your improvement around "ship it, then prove it works."

## Five findings that should shape the plan

1. **Hiring moved from models to deployment.** The fastest-growing skills inside AI postings are infrastructure, not modelling: AWS +1,358%, workflow management +818%, scalability +733% vs the 2013–15 baseline (Stanford AI Index 2026 / Lightcast). Lightcast's summary: "AI hiring has moved away from experimentation and toward execution."
2. **Agentic AI is the growth story; generic GenAI is already commoditizing.** "Agentic AI" +10,854% YoY, LangGraph +2,113%, RAG +337%, context engineering from 9 to 703 postings. Meanwhile generic GenAI *share* of AI postings fell 5% and ChatGPT/chatbot share fell 35–68%. Plain "GenAI experience" no longer differentiates.
3. **Verification is the scarce skill.** Only 52% of orgs run offline evals (LangChain, n=1,340). Lightcast's "trustworthiness" skill went from a below-average $84.4k to an above-average $181.1k median. Hamel Husain tells teams to spend 60–80% of dev time on error analysis. Gartner expects >40% of agentic projects cancelled by end-2027 for "inadequate risk controls."
4. **Foundations are table stakes, not optional.** Python (258,674 US AI postings) and SQL carry no pay premium but you cannot get screened in without them. Statistics and causal reasoning are the one analytic task LLMs demonstrably cannot bootstrap. Classic ML still beats LLMs on tabular problems. Soft skills hold 7 of LinkedIn's top 10 rising skills.
5. **The door is narrow at the bottom, but AI-specific roles are the widest opening.** Software dev postings are 69% senior / 4.5% entry-level (Indeed). Workers aged 22–25 in AI-exposed jobs sit ~19% below trend (Stanford DEL). But AI Engineer is LinkedIn's #1 fastest-growing US role with a median of only 3.7 years' prior experience, and India's AI/ML hiring is +31% YoY.

## The skill map

Ratings are my synthesis across the four reports (1–5). "Now" = current posting demand and pay signal. "2027–30" = forecast confidence that the skill gains value.

### Tier 1: Learn now (high demand today and still rising)

| Skill | Now | 2027–30 | Why |
|---|---|---|---|
| LLM application engineering (RAG, agents, context engineering) | 5 | 4 | Fastest-growing posting cluster; LinkedIn's #1 role names LangChain/RAG/PyTorch as its top skills. Gartner's 2027 cull will punish framework-only skills, so pair with evals. |
| AI evals & reliability engineering | 3 | 5 | Few postings track it yet (no primary series exists), but practitioners rank it #1, the pay signal is the largest on record, and forecasts rank it the top rising skill. |
| Production & cloud engineering (AWS, MLOps, scalability, workflow orchestration) | 5 | 4 | The decade's biggest growth in AI postings. "Execution, not experimentation." |
| Data engineering for AI (lakehouse, pipelines, data contracts, Databricks/Snowflake) | 4 | 5 | Databricks +13% and Snowflake +12.5% UK median pay while Python/SQL fell. Gartner, McKinsey and MIT NANDA independently name data readiness as the rate limiter. |
| Python + SQL | 5 | 4 | Hygiene skills: no premium, but non-negotiable. |

### Tier 2: Keep sharp (foundations that make AI output trustworthy)

| Skill | Now | 2027–30 | Why |
|---|---|---|---|
| Statistics, experimentation, causal inference | 3 | 4 | Posting data does not track it; structurally defensible because identification requires human assumptions. |
| Classic ML for tabular problems (GBMs, regression) | 4 | 3 | Credit, churn, fraud, forecasting still run on it; EU AI Act high-risk explainability favours it. |
| Software engineering fundamentals & systems design | 4 | 5 | "Writing code is cheap now"; review, testing, architecture and debugging AI output are what get tested. |
| Writing & stakeholder communication | 4 | 5 | Lightcast's fastest-growing skills inside AI jobs are cross-functional collaboration and stakeholder management. |

### Tier 3: Bets for 2027–2030 (small base today, strong forecast)

| Skill | Now | 2027–30 | Why |
|---|---|---|---|
| AI governance, assurance & compliance | 2 | 5 | Demand created by statute: EU AI Act Annex III high-risk obligations 2027-12-02, Annex I 2028-08-02, fines to €15M / 3% turnover. |
| Small / domain-specific model engineering (fine-tuning, distillation, routing, quantization) | 2 | 4 | Gartner: task-specific models used 3x more than general LLMs by 2027. Sub-1B models are 83% of Hugging Face downloads. |
| Tool interoperability (MCP) | 2 | 4 | 238.9M PyPI downloads/month, Linux Foundation governance. No labour-market series yet, and senior practitioners disagree on its value. |
| Security for AI systems (prompt injection, agent permissions) | 3 | 4 | BLS projects infosec +28.5% to 2034; agents with tool access expand the attack surface. |
| Domain × AI hybrid | 4 | 5 | PwC's AI wage premium ranges 16% (government) to 118% (consumer) by sector. Which industry you attach AI to matters more than which exam you pass. |

### Declining or commoditizing (do not build a plan around these)

- **"Prompt engineer" as a title.** The skill spread into every role; the title fell 30–40% from its 2023 peak.
- **Routine dashboards, EDA and ad-hoc BI.** Gartner: 75% of analytics content GenAI-assisted by 2027.
- **Hand-tuned hyperparameter work and boilerplate coding.** AutoML and code generation made these nearly free.
- **Generic "GenAI experience."** Share of postings already falling.
- **Single-framework loyalty and multi-agent architectures.** 59% of production agentic requests make a single service call (Datadog). Frameworks churn; reliability skills survive the cull.
- **Generic eval metrics** (BERTScore, ROUGE, Likert "helpfulness"). Hamel: "false confidence."
- **Certifications as differentiators.** A Databricks recruiter: the Data Engineer Associate cert "adds nothing to the band."
- **Kaggle medals as a portfolio.** Cleaned datasets do not exercise the problem-framing that dominates real work.

## Role landscape (US total comp, Levels.fyi, Sep 2026; skews senior and big-tech)

| Role | Demand | Median TC | Notes |
|---|---|---|---|
| AI Engineer (applied) | #1 fastest-growing US role (LinkedIn) | $153,750 | Median 3.7 yrs prior experience; the widest entry door. |
| ML Engineer | Growing; absorbing DS work | $280,000 | Big-tech / frontier-lab heavy; the pay gap vs AI Engineer is mostly employer mix. |
| Data Scientist | Title splitting; occupation growing (BLS +33.5% to 2034) | $180,000 | Pay roughly flat in real terms. |
| Data Engineer | Highest growth in AI-skill requirements (Lightcast) | ~$170,000 | Quietly the most reliably employable stack. |
| Forward Deployed Engineer | Postings reportedly +800–1,000% YoY | not tracked | Domain depth + deployment willingness; hard to fill. |
| AI Governance / Risk | Tiny base, fastest pay move | ~$169k (weak) | Regulation-driven from 2027. |

## The 2026 tool stack that is actually winning

| Layer | Use | Evidence |
|---|---|---|
| Deep learning | PyTorch | 37.7% of AI-engineer postings; 66M PyPI/mo |
| Serving open weights | vLLM | 92k stars, consensus production server |
| Agent orchestration | LangGraph (install base), OpenAI Agents SDK (riser), or raw provider SDKs (practitioner favourite) | LangGraph 48.7M PyPI/mo; Anthropic's own guidance: reduce abstraction in production |
| Tool protocol | MCP | 238.9M PyPI/mo; ~10k public servers |
| Evals / observability | Langfuse, Braintrust, LangSmith, Arize Phoenix | No single winner; build error analysis first |
| Vector storage | pgvector on Postgres first; Qdrant/Milvus on measured pressure | Community consensus |
| Analytics engines | pandas remains the floor; DuckDB + Polars rising | pandas 558.6M PyPI/mo vs ~55M each for DuckDB and Polars; "Polars replaced pandas" is narrative, not usage |
| Orchestration / transform | Airflow (47% install base), dbt | Dagster is the challenger |
| Platforms | Databricks, Snowflake | Rising UK medians |
| Open weights | Qwen family | 2.6x Meta's Hub footprint |

## Where the evidence disagrees (read before quoting any number)

- **AI wage premium: 17.7% (Dice, within-tech) vs 28% (Lightcast) vs 62% (PwC).** Dice is the closest like-for-like; PwC is an unconditional gap.
- **AI share of postings: 2.5% (Lightcast, skill-tagged) vs 6.3% (Indeed, keyword).** 74% of Indeed's hits say only "AI."
- **AI Engineer pays $126k less than ML Engineer on Levels.fyi.** Composition effect, not proof the work pays badly.
- **Framework vs no framework, and MCP: infrastructure or overhead?** LangGraph and MCP have the adoption; Armin Ronacher and Anthropic's engineering guidance argue for raw SDKs and fewer abstractions. Not converging.
- **Bubble risk.** Goldman and Fortune draw 1999 parallels; a capex correction would compress comp before 2030 even if skill demand persists.
- **Trust paradox.** 84% of developers use AI tools; 3% highly trust the output (Stack Overflow 2025).

## An 18-month plan (assumes 10–15 hrs/week and some coding ability)

Strict linear order is not obligatory (fast.ai teaches top-down), but SQL, statistics and evaluation discipline must never be permanently skipped.

| Stage | Months | Hours | What | Best free-first resources |
|---|---|---|---|---|
| 0. Python + SQL | 1–2 | ~100 | pandas, SQL joins/windows, JSON | Kaggle Learn |
| 1. Statistics & linear algebra | 3–5 | ~120 | distributions, hypothesis tests, experimental design, regression, matrices | MIT OCW 18.06 (selective) |
| 2. Classic ML | 5–7 | ~100 | supervised/unsupervised, CV, regularisation, tree ensembles, leakage | Ng's ML Specialization (839k enrolled); CS229 notes for rigour |
| 3. Deep learning (smaller than in 2022) | 7–9 | ~90 | backprop, transformers, transfer learning, fine-tuning | Karpathy Zero to Hero; fast.ai |
| 4. LLMs, RAG, agents, **evals** | 9–12 | ~150 | context engineering, retrieval, agent loops, error analysis, LLM-as-judge calibration | Hugging Face LLM/Agents/MCP courses; hamel.dev evals FAQ; Anthropic "Building Effective Agents" |
| 5. MLOps & data engineering | 12–15 | ~120 | AWS, containers, orchestration, monitoring, cost | Full Stack Deep Learning (principles only); Databricks/dbt docs |
| 6. Domain + communication | ongoing | | attach AI to your current industry; write publicly | |

Time-boxed deeper options if targeting ML/research roles: Stanford CS336 (200–250 hrs), nanochat (~$15–100 compute).

## What to ship (portfolio beats credentials)

New-grad tech hiring is down ~65–76% vs 2019 (SignalFire); you compete on evidence against experienced people. Three deep projects beat ten tutorials.

1. **A deployed agentic app with at least one real user** and documented customer discovery.
2. **An eval harness for that app**: golden dataset, error analysis, code checks plus a validated LLM-as-judge, and a write-up of what you found and changed. Rare in portfolios; directly matches the scarcest skill.
3. **An end-to-end data pipeline with a cost figure** ("nightly job from $X to $Y"). Databricks hiring managers name production, cost and architecture as callback signals.
4. **Two substantive merged open-source PRs.** Not twenty typo fixes; maintainers are hostile to AI-generated CV padding.
5. **Public writing** about what broke and what you learned.

## Certifications: the honest verdict

Every "cert = +26% salary" figure traces to training vendors with no methodology. The premium is for AI *skills* in the posting, not badges. Certs pass keyword filters and structure study; they do not convince technical hiring managers. If you have 100 hours, a shipped and evaluated project beats any exam. Hugging Face certificates are free, so take them.

## Learning with AI without hollowing out fundamentals

Anthropic's RCT (Jan 2026): AI-assisted learners scored 50% vs 67% on concepts they had just used, with debugging worst hit. But learners who used AI for conceptual questioning did fine, and a Socratic AI tutor doubled learning gains in a Harvard RCT.

1. Attempt first, always.
2. Use explanatory/study modes.
3. Ban paste-the-error debugging while learning.
4. Ask "why," then close the tab and re-derive.
5. Self-test without the tool.
6. Separate build mode (full agentic assistance for shipping) from learn mode.

## Method

Four Opus research agents ran in parallel, each ~50–110 tool calls, on 2026-09-18: employer demand (Stanford AI Index/Lightcast, Indeed, LinkedIn, Levels.fyi, ITJobsWatch), 2027–30 forecast (WEF, BLS, Gartner, McKinsey, PwC, Stanford DEL, EU AI Act), practitioner signal (HN, practitioner blogs, LangChain/Datadog/Databricks surveys, live GitHub and PyPI telemetry), and learning paths (course data, RCTs on learning with AI, hiring-manager guides). Known gaps: Reddit was uncrawlable; WEF/Gartner/PwC/McKinsey figures came via press releases; no primary series exists for vector DBs, MCP or evals as tracked skills; Stack Overflow 2026 survey not yet published.
