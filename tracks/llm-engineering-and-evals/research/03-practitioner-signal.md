# Practitioner Signal: What AI/ML Work Actually Values in 2026

Research date: 2026-09-18. Sources weighted toward practitioner blogs, community surveys, Hacker News threads, and raw adoption telemetry (GitHub API, PyPI) over analyst reports.

**Sourcing caveat up front:** reddit.com blocks this agent's crawler, so r/MachineLearning, r/datascience, r/MLOps, r/LocalLLaMA and r/dataengineering could not be read directly. Reddit-adjacent claims below are secondhand via search summaries and are flagged as such. Hacker News, practitioner blogs, and community surveys (Practical Data, dbt Labs, LangChain) carry the community-voice load instead.

---

## 1. What practitioners say matters most (ranked)

### 1. Error analysis and evals — looking at your own data
The single most consistent message across independent practitioners.

Hamel Husain's evals FAQ (last modified 2026-09-17) is blunt: **"Start with error analysis, not infrastructure."** He tells teams to **"spend 60-80% of development time on error analysis and evaluation"** and to review 20-50 outputs after every significant change. He also argues against the thing most people buy first: **"Generic evaluations waste time and create false confidence."**
[hamel.dev/blog/posts/evals-faq](https://hamel.dev/blog/posts/evals-faq/)

His AI Product Engineering notes (2026-08-12) put it structurally: **"Nearly every improvement in these notes starts with good evals,"** with an explicit priority order — retrieval/context first (lowest hanging fruit), then systems, then post-training only when everything else is exhausted.
[hamel.dev/notes/llm/ai-product-engineering](https://hamel.dev/notes/llm/ai-product-engineering/)

Armin Ronacher, building agents in production, independently lands in the same place — testing and evals are **"the hardest problem here,"** and he found they require instrumenting actual runs rather than bolting on an external eval system (2025-11-21).
[lucumr.pocoo.org/2025/11/21/agents-are-hard](https://lucumr.pocoo.org/2025/11/21/agents-are-hard/)

The market data backs the scarcity: LangChain's State of Agent Engineering (n=1,340, fielded 2025-11-18 to 2025-12-02) found **89% of orgs have some observability but only 52.4% run offline evals** and 37.3% run online evals. Databricks' 2026 State of AI Agents reports companies using evaluation tools get **~6x more AI projects into production**, and those with governance **12x more**.
[langchain.com/state-of-agent-engineering](https://www.langchain.com/state-of-agent-engineering) · [databricks.com/resources/ebook/state-of-ai-agents](https://www.databricks.com/resources/ebook/state-of-ai-agents)

### 2. Systems/architecture judgment, not code production
The dominant HN sentiment in the 937-comment thread "AI is removing the middle class of software engineering?" (2026-08-12) is that the valued work moved up a layer. Commenter *Syntaf*: **"AI is only as good as abstractions and contracts you put in place."** *arcboii92*: the difficult parts are **"defining problems, picking technology, balancing price/performance."**
[news.ycombinator.com/item?id=49271994](https://news.ycombinator.com/item?id=49271994)

Charity Majors argues the same from the ops side (2026-06-15): **"Nondeterministic systems will require more engineering discipline, not less,"** and **"Code becomes precious when it is the only place knowledge lives."** She names observability, behavioral testing, architecture specification, and production validation as the skills AI *raises* the value of.
[charity.wtf/p/ai-demands-more-engineering-discipline](https://charity.wtf/p/ai-demands-more-engineering-discipline)

Simon Willison's framing (2026-02-27): **"Writing code is cheap now"** — so tests become mandatory rather than optional, and the durable skill is hoarding domain knowledge about what is technically possible so you can constrain the agent.
[simonw.substack.com/p/agentic-engineering-patterns](https://simonw.substack.com/p/agentic-engineering-patterns)

### 3. Context engineering (the term that stuck)
Karpathy's 2025 post pushing **"+1 for 'context engineering' over 'prompt engineering'"** — his point being that prompts connote short task descriptions while industrial LLM apps are about filling the context window correctly — became the field's default vocabulary by 2026.
[x.com/karpathy/status/1937902205765607626](https://x.com/karpathy/status/1937902205765607626)

Phil Schmid's "The new skill in AI is not prompting, it's context engineering" hit 915 points / 518 comments on HN (2025-06-30), which is the community ratifying it.
[philschmid.de/context-engineering](https://www.philschmid.de/context-engineering) · [news.ycombinator.com/item?id=44427757](https://news.ycombinator.com/item?id=44427757)

Latent Space's AI Engineer World's Fair 2026 debrief (2026-07-14) names this trend "Systems Over Agents" — the harness (memory, security, infra, loop design) is now the binding constraint, not model capability. Peter Steinberger's formulation: **"the agent runs the inner execution loop; I set the direction"** in the outer loop.
[latent.space/p/aiewf26trends](https://www.latent.space/p/aiewf26trends)

### 4. Writing and communication
Vicki Boykis (2026-08-12) makes the anti-slop argument for writing as an engineering skill: **"You didn't read the thing when you generated it, I won't read it when I'm reading it."** Her thesis is that humans must now work harder at clarity than models do at generation.
[vickiboykis.com/2026/08/12/write-for-people](https://vickiboykis.com/2026/08/12/write-for-people/)

Hamel makes the same case from a different angle: **"Good writing is good thinking. Automating prompts risks never understanding requirements."** ([evals FAQ](https://hamel.dev/blog/posts/evals-faq/))

Survey corroboration outside LLM-land: in 365 Data Science's posting analysis, communication rose from #3 to #2 in data-scientist requirements, above Python.
[365datascience.com/career-advice/data-scientist-job-market](https://365datascience.com/career-advice/data-scientist-job-market/)

### 5. Fundamentals under the abstraction
Karpathy's repeated warning is against skipping the model layer: the biggest mistake is rushing to make agents work without understanding the underlying models; he reframed "the year of agents" as **"the decade of agents."**
[dwarkesh.com/p/andrej-karpathy](https://www.dwarkesh.com/p/andrej-karpathy)

Sebastian Raschka (2026-04-13) advises going **deep in your own subfield first, then LLM/reasoning/agent fundamentals**, and treats fine-tuning vs. long prompts as an *economic* decision (volume, latency, cost), not an identity. His own stack is deliberately minimal: Mac mini, Codex, Ollama, a ~20-item QA checklist.
[hugobowne.substack.com/p/llm-architecture-in-2026-what-you](https://hugobowne.substack.com/p/llm-architecture-in-2026-what-you)

### 6. Cost, latency and reliability engineering
Datadog's production telemetry shows how much headroom is being left: **only 28% of LLM calls use prompt caching** despite model support, and average system prompts consume 69% of input tokens. That is a directly hireable skill gap.
[datadoghq.com/state-of-ai-engineering](https://www.datadoghq.com/state-of-ai-engineering/)

### 7. SQL, data modeling, and boring data work (for DS/DE)
Joe Reis's read on the 2026 data-engineering survey: **"Disciplined teams will use AI to move faster with quality. Undisciplined teams will use AI to create technical debt faster."** He also notes 38% of ad-hoc modelers are firefighting vs. far fewer among teams with an actual modeling approach, and that the top bottleneck is organizational ("leadership direction" + "poor requirements" = 40% of votes, vs. legacy systems at 25%).
[joereis.substack.com/p/where-data-engineering-is-heading](https://joereis.substack.com/p/where-data-engineering-is-heading)

---

## 2. Winning tools and frameworks — with adoption evidence

GitHub star counts fetched live from the GitHub API on 2026-09-18; PyPI figures are last-30-day downloads from pypistats.org on 2026-09-18.

| Area | Winning | Evidence | Losing / flat |
|---|---|---|---|
| DL framework | **PyTorch** | 103.1k stars; 66.3M PyPI/mo; PyTorch in **37.7%** of AI-engineer postings vs TensorFlow 32.9%; HF Transformers (166.3k stars) is PyTorch-first since it dropped native JAX/TF support | **JAX** 36.3k stars, 10.4M/mo — real but niche (TPU, research, Google ecosystem) |
| LLM serving | **vLLM** | 92.1k stars, 2.6M PyPI/mo; consensus production server for open weights | SGLang (36.1k) is the credible #2; llama.cpp/Ollama own laptops, not servers |
| Agent orchestration | **LangGraph** (default), **OpenAI Agents SDK** (fast riser), raw SDKs (practitioner favorite) | LangGraph 41.9k stars, 48.7M PyPI/mo; OpenAI Agents SDK 29.5k stars in 18 months, 18.4M/mo; Google ADK 21.6k; Pydantic AI 20.0k; Claude Agent SDK (Python) 8.1k. Datadog: orgs using an agent framework **9% → 18%** in one year | **AutoGen** — 61.0k stars but **last pushed 2026-04-15**, i.e. stale. **CrewAI** 58.7k stars but only 11.1M PyPI/mo — a star/usage mismatch |
| Tool/context protocol | **MCP** | `mcp` PyPI package at **238.9M downloads/month**, second only to `openai` among packages measured here; MCP servers repo 90.4k stars; official registry ~9,652 servers (2026-05-24); Anthropic cited >10,000 active public servers (Dec 2025); Stacklok 2026: 41% of orgs in limited/broad production | Dedicated "agent marketplace" plays |
| Evals / observability | **Langfuse** (OSS), **Braintrust** (eval-first CI), **LangSmith** (LangChain stacks), **Arize Phoenix** (OTel-native) | Langfuse 34.8k stars; Opik 22.1k; DeepEval 18.3k; Phoenix 11.5k; Braintrust 6.7M PyPI/mo; Inspect AI 2.8k but endorsed by Hamel. LangChain survey: 89% observability adoption | No single winner; Hamel: vendor **"features are very similar"** |
| Vector storage | **pgvector/Postgres** as the default; Qdrant/Milvus at scale | Qdrant 34.7k, Milvus 46.2k, Chroma 29.3k, Weaviate 16.8k. Community consensus in 2026: start on Postgres, migrate only on measured pressure (HNSW index pressure, selective metadata filters, write contention) | Standalone vector DBs as a first choice |
| Analytics engines | **DuckDB + Polars** rising; **pandas still the floor** | DuckDB 41.5k stars, **56.8M PyPI/mo**; Polars 39.8k stars, **54.7M PyPI/mo** (streaming engine stabilized in 2026) — both now out-download `torch`. But **pandas is 558.6M/mo**, ~10x either, so "Polars replaced pandas" is a community narrative, not a usage fact | **Spark** 44.0k stars — still the enterprise floor, no longer the default for <100GB |
| Orchestration | **Airflow** still wins on install base | Practical Data survey (n=1,101): Airflow variants **47.3%** combined; **Dagster 6.2%** (11% at <50-person companies); **20.5% use no formal orchestration** | Dagster is the challenger, not the incumbent |
| Table format | **Iceberg** as the standard, thinly deployed | Practical Data: only **9% in production**, 6% planning, 12% PoC, **68% no plans** | Hype well ahead of deployment |
| Transformation | **dbt** | Still the default transformation layer in every 2026 stack description; dbt Labs' own survey n=363 | dbt-fusion repo only 729 stars (2026-06-26 last push) — new engine, early |
| Open weights | **Qwen** | HF Summer 2026: Qwen derivatives **151,448 models** on the Hub (2.6x Meta's footprint), ~180-210 new repos/day; Qwen GGUF **39.6M downloads/mo** vs Gemma 20.8M, Llama 7.5M | Llama's local-inference lead is gone |
| Model providers | Multi-model is the norm | Datadog: OpenAI share **75% → 63%** YoY while absolute usage more than doubled; Gemini +20pp, Claude +23pp; **70%+ of orgs run 3+ models** | Single-vendor lock-in |
| Structured output | **Pydantic-shaped everything** | Pydantic AI 20.0k stars; Instructor 13.9k; DSPy 38.1k stars but only 0.53M PyPI/mo (stars ≫ production usage) | — |

**Two telemetry notes worth flagging:**
- Real model usage skews tiny: on Hugging Face, **models under 1B params are 83% of all-time downloads** and models above 70B are **only 3% of 2026 downloads**. 85.6% of models have fewer than 200 lifetime downloads; 1.5% of repos account for 99.2% of downloads. ([HF State of Open Models, Summer 2026](https://huggingface.co/blog/state-of-open-models-summer-2026))
- Agents are mostly not distributed: **59% of agentic requests make a single service call**; only 18% make three or more. The "multi-agent mesh" is not what's in production. ([Datadog](https://www.datadoghq.com/state-of-ai-engineering/))

---

## 3. What interviews actually test in 2026

**The loop has visibly changed.** interviewing.io's survey of 67 FAANG and startup interviewers found **58% have retooled their algorithmic questions** and roughly a third changed how they ask them. Karat's survey of 400 engineering leaders (2026-01-07) found **71% say AI is making technical skills harder to assess**; **38% of US orgs now allow AI use in interviews** (68% in China), 62% still prohibit it — while leaders estimate **over half of candidates use AI anyway**, which makes prohibition a bad signal generator.
[karat.com/engineering-interview-trends-2026](https://karat.com/engineering-interview-trends-2026/) · [insight.ieeeusa.org/articles/three-ways-ai-is-reshaping-traditional-technical-interviews-in-2026](https://insight.ieeeusa.org/articles/three-ways-ai-is-reshaping-traditional-technical-interviews-in-2026/)

**What is actually assessed, by role:**

*AI Engineer loops* — LLM system design is the center of gravity: end-to-end RAG (ingestion, indexing, retrieval, generation, evals, tracing, guardrails), multi-step agentic workflows, and scaling/cost/latency trade-offs (batching, caching, streaming, failure modes). A recurring interviewer trap: tell the candidate retrieval quality is fine but answers are still wrong a third of the time — strong candidates reach for error analysis and evals, weak ones reach for a bigger model. Evaluation is the most heavily weighted section; LLM-as-judge design, held-out sets, and judge calibration come up explicitly. Treat this as directional — the sources are interview-prep aggregators, not primary practitioner accounts.
[coprep.ai/blog/top-ai-engineer-interview-questions-in-2026](https://www.coprep.ai/blog/top-ai-engineer-interview-questions-in-2026-llms-rag-agents-and-langchain) · [systemdesignhandbook.com/guides/generative-ai-system-design-interview](https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/)

*ML Engineer / Data Scientist loops* — classic ML has not left. In 903 AI-engineer postings analyzed from Glassdoor (2026-04-23): PyTorch 37.7%, TensorFlow 32.9%, NLP 19.7%, fine-tuning 14.8%, RAG 13.6%, AI agents 10.6%, prompt engineering only 8.9%. In 1,121 data-scientist postings: Python 85%, ML 77%, SQL 59%, deep learning 20%, NLP 18%, statistics 18%.
[365datascience.com/.../ai-engineer-job-outlook-2025](https://365datascience.com/career-advice/career-guides/ai-engineer-job-outlook-2025/) · [365datascience.com/.../data-scientist-job-outlook-2025](https://365datascience.com/career-advice/career-guides/data-scientist-job-outlook-2025/)

*What senior interviewers say they test.* Eugene Yan's hiring framework (still the most cited practitioner writeup) weights: coding where **"what's more important is how the candidate solves it"**; data literacy — **"respecting the data, being proficient at data analysis, and having an intuition"**; comfort with ML opacity; and explicitly, the ability to build eval harnesses and respond when metrics break. Non-technical signal via AICE (Ambiguity, Influence, Complexity, Execution), plus hunger, judgment, empathy.
[eugeneyan.com/writing/how-to-interview](https://eugeneyan.com/writing/how-to-interview/)

*What HN commenters say good loops look like.* From the 2026-08 thread: *bdangubic* — **"Whiteboard with team discussing actual problems mirrors day-to-day work"**; *marcus_holmes* — **"Best interview: working real bugs together with candidate"**; *tombert* — the **"masturbatory leetcode problem is not correct"**; *nrr* — **"Assessing craft requires interviewers who understand craft themselves."**
[news.ycombinator.com/item?id=49271994](https://news.ycombinator.com/item?id=49271994)

*Emerging format:* reviewing and debugging AI-generated code — explaining why an output is wrong — is now a common screen, and take-homes are the signal degrading fastest.
[karat.com/engineering-interview-trends-2026](https://karat.com/engineering-interview-trends-2026/)

---

## 4. Overhyped / skip list

| Thing | Who says skip it | The argument |
|---|---|---|
| **Generic eval metrics** (BERTScore, ROUGE, "helpfulness" scores, similarity metrics) | Hamel Husain, [evals FAQ](https://hamel.dev/blog/posts/evals-faq/) | **"Generic evaluations waste time and create false confidence."** They miss domain-specific failures. Also: Likert scales — **"Binary decisions force clearer thinking."** |
| **Eval-driven development** (writing evals before looking at data) | Hamel Husain, same | Creates wasted effort on imagined failures. Error analysis comes first, evaluators second. |
| **Off-the-shelf annotation/eval platforms as a starting point** | Hamel Husain, same | Teams iterate ~10x faster on a custom annotation tool; vendor **"features are very similar."** |
| **Outsourcing error analysis** | Hamel Husain, same | **"Outsourcing error analysis breaks the feedback loop between failure and improvement."** |
| **Multi-agent architectures** | Jason Liu ("No Multi-Agents", 2025-09-11); Datadog telemetry | Single agents win on context coherence. 59% of real agentic requests are single-call. |
| **Embedding-based retrieval for code** | Jason Liu ("Grep Beats Embeddings", "Stopped Using RAG for Coding Agents") | Grep + an agentic loop beats vector search for codebases: fast, exact, zero indexing. The abstraction was the bottleneck, not retrieval. |
| **MCP as a default integration layer** | Armin Ronacher, [Skills vs MCP](https://lucumr.pocoo.org/2025/12/13/skills-vs-mcp/) (2025-12-13) | ~8k tokens of tool definitions before you do anything; **"MCP servers have no desire to maintain API stability"**; descriptions are simultaneously too long to eager-load and too short to be useful. He prefers skills + CLI tools. |
| **Heavy agent SDK abstractions** | Armin Ronacher, [Agent Design Is Still Hard](https://lucumr.pocoo.org/2025/11/21/agents-are-hard/) | SDK abstractions break under real tool use; model differences are too large for a unified layer. On Vercel AI SDK for agents: **"would not make that choice again."** He uses raw provider SDKs and a manual loop. |
| **Frameworks before provider APIs** | Anthropic engineering, [Building Effective AI Agents](https://www.anthropic.com/engineering/building-effective-agents) | Most successful implementations use simple composable patterns; reduce abstraction layers as you move to production. |
| **Dedicated vector DBs before you have a problem** | 2026 community consensus | pgvector handles most workloads; migrate on measured signals, not anticipation. Note the counter-take: "just use Postgres" is also lazy — pgvector fails in four specific mechanical ways. |
| **LLMs for tabular/structured prediction** | Multiple 2026 writeups | Gradient-boosted trees and specialized tabular models still beat LLMs on fraud, credit risk, and forecasting for precision, auditability, inference cost. |
| **Agent-washing / demo-ware** | HN thread on "73% of AI startups are just prompt engineering" (2025-11-23) | *eddythompson80*: on judge-LLM loops, **"I've tried closing that loop and all I got was LLMs flailing around."** *commandar*: **"If you're not one of the handful of big players, you're probably doing it wrong."** [news.ycombinator.com/item?id=46024644](https://news.ycombinator.com/item?id=46024644) |

---

## 5. What gets people hired

**1. Shipped systems with production scar tissue, not tutorials.** The thread on "73% of AI startups are just prompt engineering" surfaces what real work looks like — *kgeist*: **"I had to write evaluation pipelines, query rewriting, hybrid search, tune hyperparameters, parallelize pipelines, add moderation and rerankers"** (two weeks full-time for one RAG system). That list *is* the hiring signal.
[news.ycombinator.com/item?id=46024644](https://news.ycombinator.com/item?id=46024644)

**2. A shipped eval harness specifically.** Reported hiring-manager tactic: adding one line to a JD — must have shipped an eval harness measuring response quality on a 500+ question reference set — changed the candidate slate to people actually running AI in production. Secondhand (recruiting blog), but consistent with the 52% eval-adoption gap in the LangChain survey.
[trycrucible.io/blog/how-to-get-hired-as-ai-engineer-2026](https://trycrucible.io/blog/how-to-get-hired-as-ai-engineer-2026)

**3. Public writing and open source, weighted above credentials.** Anthropic's own application guidance tells candidates: if you have done independent research, written an insightful blog post, or contributed substantially to open source, **put that at the top of your resume**. Meanwhile 25% of AI-engineer postings specify no degree requirement at all (vs 27.7% asking for a PhD).
[365datascience.com/.../ai-engineer-job-outlook-2025](https://365datascience.com/career-advice/career-guides/ai-engineer-job-outlook-2025/)

**4. Reproducibility.** Containerized submissions that a reviewer can clone and rerun to identical results are described as a rare, strong signal.
[trycrucible.io/blog/how-to-get-hired-as-ai-engineer-2026](https://trycrucible.io/blog/how-to-get-hired-as-ai-engineer-2026)

**5. Domain depth + deployment willingness — the FDE path.** Latent Space names Forward Deployed Engineers as one of the five defining 2026 trends; FDE postings are reported up ~800-1,000% YoY, and it's described as among the hardest roles to fill. The role is "part software engineer, part solutions architect, part startup CTO" — it rewards people who can sit with a customer's data.
[latent.space/p/aiewf26trends](https://www.latent.space/p/aiewf26trends) · [getperspective.ai/blog/2026-fde-hiring-trends-what-1000-job-posts-reveal](https://getperspective.ai/blog/2026-fde-hiring-trends-what-1000-job-posts-reveal)

**6. Entry level is the wall.** Only **2.5% of AI-engineer postings target 0-2 years**; 4-6 years is the modal band. Remote is only 5.9% of postings. Whatever "AI engineer is the fastest-growing title" headlines say, the doors are narrow at the bottom.
[365datascience.com/.../ai-engineer-job-outlook-2025](https://365datascience.com/career-advice/career-guides/ai-engineer-job-outlook-2025/)

**7. Hunger / judgment / empathy, tested through STAR.** Eugene Yan's stated selection traits — bias toward action, intuition for dead ends, genuine interest in the customer — remain how senior ICs describe the difference between offers and rejections.
[eugeneyan.com/writing/how-to-interview](https://eugeneyan.com/writing/how-to-interview/)

---

## 6. Where practitioners disagree

**a) Is the "AI Engineer" a real role or a rebrand?**
Chip Huyen defends the distinction: AI engineering **"is less about model development, and more about adapting and evaluating models,"** with ML knowledge **"a nice-to-have and less of a must-have"** (2025-05-20, [Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/the-ai-engineering-stack)). Swyx's camp goes further — Romain Huet at AIEWF 2026: **"AI engineers are eating the world."**
Against: Susan Shu Chang argues the title isn't standardized and candidates should **"look at the job description"** rather than the title ([susanshu.substack.com](https://susanshu.substack.com/p/ml-career-q-and-a-ml-engineer-vs)). Harsher takes hold that the skill overlap between people tuning models and people building prompt scaffolding is near zero. Practically: ML Engineer pays more and hires broader; AI Engineer is the wider, faster-growing entry door.

**b) Do agents work, and is HN's skepticism informed or reflexive?**
The 353-comment thread "We might all be AI engineers now" (2026-03-06) is the cleanest split. *peteforde*: **"The gains are so obvious that not seeing them seems wrong."** *bryanrasmussen*: **"Studies show productivity gains don't materialize; how do you know yours do?"** *overgard*: **"AI code is locally okay but globally bad architecturally."** *archagon*: **"Agentic programming isn't engineering; it's weird management."** A separate 765-comment Ask HN ("Why is the HN crowd so anti-AI?", 2026-06-06) exists purely because the split is unresolved.
[news.ycombinator.com/item?id=47272734](https://news.ycombinator.com/item?id=47272734) · [news.ycombinator.com/item?id=48420827](https://news.ycombinator.com/item?id=48420827)

**c) Framework vs. no framework.**
LangGraph has the install base (41.9k stars, 48.7M PyPI/mo) and the enterprise case studies. But the most experienced agent builders publicly avoid frameworks: Ronacher uses raw provider SDKs; Anthropic's own guidance says to reduce abstraction layers in production. Both positions are defensible and the disagreement is not converging.

**d) MCP: infrastructure or overhead?**
Adoption is enormous (238.9M PyPI downloads/month; ~10,000 public servers; Linux Foundation governance; OpenAI/Google/Microsoft/AWS support). Yet Ronacher moved off it entirely, and the token-bloat critique is widely repeated (seven servers ≈ 67k tokens of definitions before the user types anything). Anthropic's progressive tool discovery (Jan 2026) is a partial answer. Security remains the loudest objection — one aggregator reports only **8.5% of MCP servers implement the mandated OAuth 2.1**, though that figure is secondhand and should be verified before citing.
[mcpmanager.ai/blog/mcp-adoption-statistics](https://mcpmanager.ai/blog/mcp-adoption-statistics/)

**e) Does AI raise or lower the value of engineering rigor?**
Charity Majors: **"Nondeterministic systems will require more engineering discipline, not less."** Against this sits the widely circulated "AI removes the need for process / the middle class of engineering" position she's explicitly arguing with (she names Adam Jacob's assessment as the one she disagrees with).
[charity.wtf/p/ai-demands-more-engineering-discipline](https://charity.wtf/p/ai-demands-more-engineering-discipline)

**f) Trust in the tools themselves.**
Stack Overflow's 2025 survey (n≈49,000) is the sharpest paradox in the data: **84% using or planning to use AI tools, but only 3.1% "highly trust" the output** and 45.7% distrust it — with experienced developers the most skeptical (2.6% highly trust, 20% highly distrust).
[survey.stackoverflow.co/2025/ai](https://survey.stackoverflow.co/2025/ai)

**g) Do agents need big models?**
The open-model telemetry says no — sub-1B models are 83% of all-time HF downloads, 70B+ only 3% of 2026 downloads. Frontier-first practitioners obviously disagree in practice. A 687-point HN Show HN (2026-05-19) demonstrated an 8B model going from 53% to 99.3% on agentic tasks purely via guardrails, which is the strongest community data point for the small-model camp.
[news.ycombinator.com/item?id=48192383](https://news.ycombinator.com/item?id=48192383)

---

## 7. Source list

**Practitioner blogs / newsletters**
- Hamel Husain, "AI Evals: Everything You Need to Know", last modified 2026-09-17 — https://hamel.dev/blog/posts/evals-faq/
- Hamel Husain, "AI Product Engineering Notes", 2026-08-12 — https://hamel.dev/notes/llm/ai-product-engineering/
- Armin Ronacher, "Skills vs Dynamic MCP Loadouts", 2025-12-13 — https://lucumr.pocoo.org/2025/12/13/skills-vs-mcp/
- Armin Ronacher, "Agent Design Is Still Hard", 2025-11-21 — https://lucumr.pocoo.org/2025/11/21/agents-are-hard/
- Simon Willison, "Agentic Engineering Patterns", 2026-02-27 — https://simonw.substack.com/p/agentic-engineering-patterns
- Charity Majors, "AI demands more engineering discipline. Not less", 2026-06-15 — https://charity.wtf/p/ai-demands-more-engineering-discipline
- Vicki Boykis, "Write for people", 2026-08-12 — https://vickiboykis.com/2026/08/12/write-for-people/ (index: https://vickiboykis.com/)
- Eugene Yan, "How to Interview and Hire ML/AI Engineers", 2024-07 — https://eugeneyan.com/writing/how-to-interview/ ; 2026 posts index — https://eugeneyan.com/writing/
- Jason Liu, Coding Agents series (incl. "Grep Beats Embeddings", "No Multi-Agents", "Stopped Using RAG for Coding Agents"), 2025-09-11 — https://jxnl.co/writing/2025/09/11/coding-series-index/ ; writing index — https://jxnl.co/writing/
- swyx / Latent Space, "5 Trends That Defined AI Engineering at World's Fair 2026", 2026-07-14 — https://www.latent.space/p/aiewf26trends
- swyx / Latent Space, "Scaling without Slop", 2026-01-23 — https://www.latent.space/p/2026
- Chip Huyen with Gergely Orosz, "The AI Engineering Stack", 2025-05-20 — https://newsletter.pragmaticengineer.com/p/the-ai-engineering-stack
- Sebastian Raschka on Hugo Bowne-Anderson's podcast, "LLM Architecture in 2026", 2026-04-13 — https://hugobowne.substack.com/p/llm-architecture-in-2026-what-you
- Andrej Karpathy, context engineering post, 2025-06 — https://x.com/karpathy/status/1937902205765607626 ; Dwarkesh interview — https://www.dwarkesh.com/p/andrej-karpathy
- Phil Schmid, "The new skill in AI is not prompting, it's context engineering", 2025-06-30 — https://www.philschmid.de/context-engineering
- Joe Reis, "Where Data Engineering Is Heading in 2026" — https://joereis.substack.com/p/where-data-engineering-is-heading
- Susan Shu Chang, "ML career Q&A: ML Engineer vs. AI Engineer" — https://susanshu.substack.com/p/ml-career-q-and-a-ml-engineer-vs
- Anthropic engineering, "Building Effective AI Agents" — https://www.anthropic.com/engineering/building-effective-agents

**Hacker News threads (community voice)**
- "AI is removing the middle class of software engineering?", 1014 pts / 937 comments, 2026-08-12 — https://news.ycombinator.com/item?id=49271994
- "We might all be AI engineers now", 224 pts / 353 comments, 2026-03-06 — https://news.ycombinator.com/item?id=47272734
- "Ask HN: Why is the HN crowd so anti-AI?", 463 pts / 765 comments, 2026-06-06 — https://news.ycombinator.com/item?id=48420827
- "73% of AI startups are just prompt engineering", 246 pts / 205 comments, 2025-11-23 — https://news.ycombinator.com/item?id=46024644
- "Show HN: Forge — Guardrails take an 8B model from 53% to 99% on agentic tasks", 687 pts / 252 comments, 2026-05-19 — https://news.ycombinator.com/item?id=48192383
- "The new skill in AI is not prompting, it's context engineering", 915 pts / 518 comments, 2025-06-30 — https://news.ycombinator.com/item?id=44427757
- "AI demands more engineering discipline. Not less", 429 pts / 213 comments, 2026-06-17 — https://news.ycombinator.com/item?id=48570948
- HN Algolia search API used for thread discovery — https://hn.algolia.com/api/v1/search

**Community / industry surveys**
- LangChain, "State of Agent Engineering" 2026, n=1,340, fielded 2025-11-18 → 2025-12-02 — https://www.langchain.com/state-of-agent-engineering
- Datadog, "State of AI Engineering" 2026 (production telemetry) — https://www.datadoghq.com/state-of-ai-engineering/
- Databricks, "2026 State of AI Agents" — https://www.databricks.com/resources/ebook/state-of-ai-agents
- Practical Data / Joe Reis, "2026 State of Data Engineering Survey", n=1,101, Dec 2025–Jan 2026 — https://joereis.github.io/practical_data_data_eng_survey/
- dbt Labs, "2026 State of Analytics Engineering", n=363, 2025-12-05 → 2026-02-01 — https://www.getdbt.com/resources/state-of-analytics-engineering-2026
- Stack Overflow Developer Survey 2025, n≈49,000 (2026 edition not yet published at time of research) — https://survey.stackoverflow.co/2025/ai
- Karat, "Engineering Interviews in 2026", n=400 engineering leaders, 2026-01-07 — https://karat.com/engineering-interview-trends-2026/
- IEEE-USA InSight on the interviewing.io interviewer survey (n=67) — https://insight.ieeeusa.org/articles/three-ways-ai-is-reshaping-traditional-technical-interviews-in-2026/
- Hugging Face, "State of Open Models: Summer 2026" — https://huggingface.co/blog/state-of-open-models-summer-2026
- 365 Data Science, AI Engineer job outlook, 903 Glassdoor postings, 2026-04-23 — https://365datascience.com/career-advice/career-guides/ai-engineer-job-outlook-2025/
- 365 Data Science, Data Scientist job outlook, 1,121 Glassdoor postings, 2026-04-23 — https://365datascience.com/career-advice/career-guides/data-scientist-job-outlook-2025/
- 365 Data Science, Data Scientist job market 2026 — https://365datascience.com/career-advice/data-scientist-job-market/

**Raw telemetry collected for this report (2026-09-18)**
- GitHub REST API `/repos/{owner}/{repo}` star counts and `pushed_at` — https://api.github.com
- PyPI last-30-day downloads via pypistats.org API — https://pypistats.org/api/
  - Collected: pandas 558.6M · openai 310.6M · mcp 238.9M · langchain 185.7M · torch 66.3M · duckdb 56.8M · polars 54.7M · langgraph 48.7M · dbt-core 34.8M · ray 20.8M · openai-agents 18.4M · crewai 11.1M · jax 10.4M · dagster 8.6M · braintrust 6.7M · vllm 2.6M · dspy-ai 0.53M. (llama-index blocked by rate limiting and is not reported.)

**Lower-confidence / aggregator sources (flagged where used)**
- MCP adoption statistics roundup — https://mcpmanager.ai/blog/mcp-adoption-statistics/
- AI-engineer hiring advice — https://trycrucible.io/blog/how-to-get-hired-as-ai-engineer-2026
- FDE hiring analysis of ~1,000 job posts — https://getperspective.ai/blog/2026-fde-hiring-trends-what-1000-job-posts-reveal
- AI engineer interview question compilations — https://www.coprep.ai/blog/top-ai-engineer-interview-questions-in-2026-llms-rag-agents-and-langchain · https://www.systemdesignhandbook.com/guides/generative-ai-system-design-interview/

**Could not access:** reddit.com (r/MachineLearning, r/datascience, r/MLOps, r/LocalLLaMA, r/dataengineering) — blocked to this crawler.
