# LLM Engineering & Evals Track (Oil & Gas)

> **This is the flagship example track, not the product.** It exists to show what a
> serious `track.yaml` looks like when someone actually writes one for themselves —
> 40 weeks, a project spine, and a `done when you can…` line behind every Check.
> It was written for one learner's context: an MSc in Data Science (2022), working in
> oil and gas, with 10–15 hours a week. Read it as a worked example, not a syllabus you
> should follow. The curriculum the app runs is [`track.yaml`](track.yaml); this file is
> its prose, [`syllabus.html`](syllabus.html) is the same thing as a page, and
> [`skills-map.md`](skills-map.md) is the wider 2026–2030 map it was cut from.
> [`research/`](research/) is the provenance: eleven cited reports the whole track was
> derived from. To write your own instead, start at
> [`../starter/track.yaml`](../starter/track.yaml) and
> [`../../docs/curriculum-schema.md`](../../docs/curriculum-schema.md).

Compiled 2026-09-18 for: MSc Data Science (2022), working in oil and gas, 10–15 hrs/week. This replaces stages 0–4 of the general map in [skills-map.md](skills-map.md). Source reports with every citation: [`research/05–08`](research/).

## The shape of the plan

- **Skip the foundations.** A 2022 MSc is roughly 70% still valid and 0% sufficient. Nothing you learned is wrong; a discipline has been built on top of it. The gap is applied practice on models you did not train: retrieval, agents, evaluation, cost engineering.
- **Two tracks, interleaved, one project spine.** LLM engineering (about 300 hours) and AI evals (about 130 hours) are taught against one oil and gas system you build early, so evals always have real traces to read.
- **Honest total: about 430 hours, 9–10 months at 12 hrs/week.** A compressed 6-month lane is at the end. Anyone selling this as 12 weeks is lying.
- **Your two edges, and the plan leans on both.** Statistics: judge calibration (TPR/TNR, Rogan–Gladen correction, paired McNemar, clustered bootstrap) is where you overtake engineers who came from software. Domain: SLB's live AI Engineer posting says "a strong understanding of domain problems is highly valued" and asks for "benchmark datasets, evaluation metrics, and acceptance criteria."
- **Start where you said: Karpathy.** But with three corrections. Skip micrograd and makemore 1–2 (you know backprop). nanoGPT was deprecated in November 2025 in favour of nanochat, which covers tokenizer → pretrain → SFT → RL → eval → inference in one readable repo. LLM101n does not exist (repo archived August 2024); do not wait for it.

## Before you start: the 2022 → 2026 catch-up (~25 hrs, weeks 1–2)

| # | Read / watch | Hrs | Why |
|---|---|---|---|
| 1 | Karpathy, "Deep Dive into LLMs like ChatGPT" (Feb 2025, 3.5h) | 5 | The whole training stack in one sitting. Watch first. |
| 2 | Simon Willison, "2025: The year in LLMs" (Dec 2025) | 3 | Highest-density account of what shipped and why it mattered. |
| 3 | swyx, "The Rise of the AI Engineer" (Jun 2023) | 1 | The role you will be interviewed for, and why it is not ML research. |
| 4 | Anthropic, "Building Effective Agents" (Dec 2024) | 1.5 | Workflows vs agents; six patterns; "don't use a framework." |
| 5 | Anthropic, "Effective context engineering for AI agents" (Sep 2025) | 1 | Context rot: why 1M-token windows made curation more important, not less. |
| 6 | DeepSeek-R1 paper (Jan 2025, arXiv 2501.12948) | 3 | Reasoning from RL on verifiable rewards; GRPO; distillation. The most consequential paper of the period. |
| 7 | Sardana & Frankle, "Beyond Chinchilla-Optimal" (2024) | 1.5 | Why every shipped model is over-trained relative to Chinchilla. |
| 8 | MCP intro + the 2026-07-28 spec changelog | 3 | The integration standard, and a rewrite that made every pre-August-2026 tutorial partially wrong. |
| 9 | Hamel Husain & Shreya Shankar, "AI Evals FAQ" (updated 2026-09-17) | 6 | The single highest-value item for your background. Read twice. |
| 10 | Anthropic, "How AI assistance impacts the formation of coding skills" (Jan 2026 RCT) | 1 | Governs how you should do this whole plan: AI explains and reviews, you type. |

Also in weeks 1–2: migrate a repo to `uv` and `ruff` (2h); note pandas 3.0 copy-on-write changes (1h); create a **free Databricks account now** because the Volve dataset is only distributed through Databricks Marketplace and takes about an hour to appear; set up Modal or RunPod for GPU rental and a self-hosted Langfuse.

What has *not* changed, and is scarcer now because the field filled with software engineers: statistics and inference, experiment design, GBMs for tabular data, feature engineering, SQL, leakage, causal inference. Lean on all of it.

## Track A: LLM engineering, what you must cover

Hours are honest. "Done when" is the check that you actually own the module.

| Module | Must cover | Resources (free-first) | Hrs | Done when you can… |
|---|---|---|---|---|
| **A1. Transformers from scratch** | Causal self-attention, BPE tokenization, training dynamics (init, BatchNorm, dead neurons), RoPE / RMSNorm / SwiGLU / pre-norm deltas from GPT-2, scaling laws, GPT-2-class reproduction | Karpathy: makemore 3, "Let's build GPT", "GPT Tokenizer"; CS336 lectures 1–4; **either** Raschka *Build a LLM (From Scratch)* ch 2–5 **or** CS336 Assignment 1 (not both); CS336 lecture 9 + Assignment 3 (scaling); **nanochat** speedrun ($15–50 GPU) | 70–90 (lean lane 45) | Write multi-head causal attention from memory with correct mask; implement BPE and name three failures caused by tokenization; explain why RoPE extrapolates; argue a parameter/token split for a $50k budget; show your own trained GPT-2-class model and explain its loss curve. |
| **A2. Modern architecture & post-training** | MoE routing and load balancing, GQA/MQA, long context (YaRN, ring attention), pretraining data curation, SFT, DPO vs GRPO vs PPO, reasoning models and test-time compute, distillation | CS336 lectures 3–4, 13–16 + Assignment 5 (alignment); HF LLM Course ch 10–12; HF smol-course; nanochat's GRPO stage; Raschka *Build a Reasoning Model (From Scratch)* (2026, optional depth) | 45–60 | Draw the GPT-2 → 2026 open-model architecture diff and justify each change; say when you'd use DPO vs GRPO vs SFT and what data each needs; run nanochat's RL stage and describe what changed. |
| **A3. Fine-tuning in practice** | Prompt vs RAG vs fine-tune decision, LoRA/QLoRA, rank/alpha/target modules, data curation, dataset poisoning modes, adapter serving | Chip Huyen *AI Engineering* ch 5–7; Unsloth fine-tuning + LoRA hyperparameter guides; TRL docs; smol-course units 1–3 | 35–45 | Write a one-paragraph decision memo with cost and latency numbers; QLoRA a 7–8B model on your own dataset and show before/after on a held-out set you built *first*. |
| **A4. Inference & serving** | Prefill vs decode, KV cache sizing, continuous batching, quantization (FP8/AWQ/GGUF) with measured accuracy delta, vLLM, prompt caching, routing to small models, cost modelling | DeepLearning.AI *Fast & Efficient LLM Inference with vLLM* (Jun 2026, do all of it); vLLM docs; CS336 lecture 10; CS25 "Serving Transformers" (May 2026); Anthropic prompt-caching docs | 30–40 | Compute KV cache size on paper; quantize a model and state whether you'd ship it; chart throughput vs p99 latency vs concurrency; write a $/1k-request cost model naming the three biggest levers. |
| **A5. Prompting & context engineering** | Token budgeting, structured outputs (function calling vs constrained decoding), tool description design, memory and compaction for long sessions | Anthropic: context engineering, writing tools for agents, effective harnesses for long-running agents, the "think" tool; Instructor; Outlines; Anthropic prompt-engineering docs | 25–30 | Account for every token in a production prompt; hit 100% schema validity under adversarial input; explain what you changed in a tool description after watching it fail. |
| **A6. RAG** | Chunking (recursive, semantic, late, contextual), embedding selection by task, hybrid BM25 + dense with RRF, pgvector HNSW and filtering pitfalls, reranking (retrieve 20 → rerank to 5), query rewriting, the eight named RAG failure modes | Jason Liu, "Systematically Improving RAG Applications" (free essay); Anthropic "Contextual Retrieval"; MTEB leaderboard; pgvector docs | 35–45 | Report recall@k from a synthetic eval set *before* touching generation; show a 4-config table (naive / +hybrid / +contextual / +reranker) with cost and latency; diagnose a wrong answer as retrieval vs generation in five minutes. |
| **A7. Agents** | When an agent is the wrong answer, single vs multi-agent (parallelise reads, serialise writes), tool design, MCP at the 2026-07-28 spec, approval gates and least privilege, Claude Agent SDK | Anthropic "Building Effective Agents"; OpenAI "Practical Guide to Building Agents"; Anthropic multi-agent research system; Cognition "Don't Build Multi-Agents" + Walden Yan's April 2026 update; HF Agents Course (free cert); MCP changelog; Claude Agent SDK docs | 50–65 | Classify a business process as no-LLM / workflow / single agent / multi-agent and defend it; ship a 5+ tool agent with retries, a turn budget and a write-approval gate; write an MCP server against the current spec. |
| **A8. Production** | OpenTelemetry GenAI conventions, Langfuse/Phoenix tracing, OWASP LLM Top 10 **2026** (prompt injection #1, excessive agency now #3), containment over prevention, guardrail types, cost levers in order (caching → output discipline → routing → batch → self-host) | OTel GenAI blog; Langfuse docs; OWASP GenAI 2026; Simon Willison's prompt-injection archive; Chip Huyen ch 9–10 | 30–40 | Trace one request across retrieval, reranking, three tool calls and generation with cost per span; red-team your own agent, find a working injection, then re-architect so it cannot cause harm; cut unit cost 50% with no measured regression. |

**Stale or non-existent, do not plan around:** LLM101n (does not exist); nanoGPT (superseded, still worth reading); fast.ai Part 2 (2022, diffusion-focused); Full Stack LLM Bootcamp (spring 2023); Maven "Mastering LLMs" (2024 archive); any MCP tutorial written before August 2026 (teaches the old stateful session model); CS224N public videos (2024 edition, and its last third is better covered by CS336).

## Track B: AI evals, what you must cover

The bottleneck in evals is qualitative, not statistical: error analysis, open and axial coding of traces, and a failure taxonomy *before* any metric. Budget roughly 40% qualitative process, 35% engineering, 25% statistics.

| Module | Must cover | Resources (free-first) | Hrs | Done when you can… |
|---|---|---|---|---|
| **B0. Unlearning** | Map your ML-evaluation vocabulary onto LLM evals and mark what fails to transfer (BLEU/ROUGE mostly dead; "pick a metric, optimise it" is the habit to unlearn; precision/recall now apply to the *judge*, not the output) | Free 17-part email course (ai.hamel.dev/eval-course, start day one); Hamel, "Your AI Product Needs Evals" (L1 assertions / L2 human & model / L3 A/B) | 5 | Explain in two sentences why a 0.87 ROUGE-L tells a product team nothing, and name the three things you'd do instead. |
| **B1. Error analysis first** | Why generic metrics create false confidence; open coding of 100+ raw traces; axial coding into 5–9 failure modes with counts; binary pass/fail + written critique over Likert; sampling for a ~50:50 pass/fail split; criteria drift | Evals FAQ; Field Guide; `error-discovery` skill in `ai-evals-course/evals-skills`; Shankar et al., "Who Validates the Validators?" (UIST 2024); Eugene Yan, "An LLM-as-Judge Won't Save the Product" | 16 | Hand over a one-page failure taxonomy from ≥100 traces you read yourself, where the top three modes cover ≥60% of failures, and name one mode no off-the-shelf metric would have found. |
| **B2. Golden dataset** | Coverage-driven sampling, dimension-based synthetic generation grounded in real constraints, the Principal Domain Expert pattern, custom annotation UI (10x faster than generic tools), Cohen's κ / Krippendorff's α when multi-annotator (κ < 0.4 means the rubric is broken), a held-out judge test slice you never look at | Evals FAQ sections on sampling and annotation; `generate-synthetic-data` and `build-review-interface` skills; Jason Liu on synthetic RAG evals; Anthropic 8-step roadmap steps 3–4 | 14 | Ship a versioned golden set (≥100 examples) with sampling rationale, real/synthetic split, annotation guideline, an agreement figure if applicable, and an untouched held-out slice. |
| **B3. Judge design & calibration** | Code vs model vs human routing; Critique Shadowing; position, verbosity and self-preference bias with mitigations; **TPR and TNR on a held-out human set, never accuracy**; Rogan–Gladen correction θ̂ = (p_obs + TNR − 1)/(TPR + TNR − 1) with bootstrap CI over both calibration and test sets | Hamel, "Creating a LLM-as-a-Judge" (updated Sep 2026); Zheng et al. MT-Bench §3; `validate-evaluator` skill + `judgy` package; HF Evaluation Guidebook "evaluating your evaluator" (read the Space, the GitHub repo is unmaintained) | 20 | Ship a judge with documented prompt, held-out TPR/TNR, position-bias and verbosity-bias checks, and a corrected system pass rate with a 95% CI, and explain to a PM why it differs from the raw number. |
| **B4. RAG evaluation** | Retrieval metrics you already know (recall@k, MRR, nDCG) measured separately from generation (faithfulness, answer relevance); Ragas as baseline then replace its generic judges with your calibrated ones; component vs end-to-end; the RAG flywheel and query segmentation; leading vs lagging metrics | Jason Liu essays + free talk; Ragas docs; ARES paper; `evaluate-rag` skill | 16 | Produce a RAG eval report with recall@k and nDCG on a labelled retrieval set, a calibrated faithfulness judge with TPR/TNR, an end-to-end number, and a segment breakdown showing which query type drags the average down. |
| **B5. Agent evaluation** | Trajectory vs final answer; tool-call correctness (selection, arguments, order); grading terminal state not prose; **pass@k vs pass^k** (a 90% pass@1 agent at 60% pass^5 is not shippable); simulated users (τ-bench); graders that resist agent exploits; transcript review as non-optional; scaffolding as a confound | Anthropic "Demystifying evals for AI agents" (Jan 2026); DeepLearning.AI *Evaluating AI Agents* (free, 2.5h, lessons 7–12); τ-bench and τ²-bench; Ragas agent metrics; "Log analysis is necessary for credible evaluation of AI agents" (2026) | 18 | Evaluate a 3+ tool agent with a trajectory scorer, tool-call metric, terminal-state check, pass^k at k=5 with a CI, and a written review of the 10 worst runs naming the failure mechanism. |
| **B6. Offline, online, CI, A/B** | The four-way distinction (offline evals / online evals / guardrails / A/B tests) and the two traps (calling a guardrail an eval; calling an online eval an A/B); evals as PR gates; the same scorer offline and online; production sampling → review → dataset promotion; **model-swap requalification** (re-measure judge TPR/TNR on the new model's outputs); pre-registered guardrail metrics | Evals FAQ production section; Langfuse evaluation overview and automated-evals post; Braintrust docs for the CI pattern | 16 | Show a green CI run that gates a PR, a diff report between two model versions with per-failure-mode deltas, and a one-page model-swap runbook. |
| **B7. Safety & benchmark literacy** | Red-teaming basics, direct and *indirect* injection via retrieved documents, over- and under-refusal, PII extraction; OWASP GenAI Top 10 2026 and the Agentic Top 10; the five questions to ask of any leaderboard number (contamination, who ran it, what scaffold, saturation, distribution match) | OWASP GenAI 2026; NIST CAISI AgentDojo-Inspect; OpenAI, "Why we no longer evaluate SWE-bench Verified" (Feb 2026: 59% of audited failures were flawed tests); "The Leaderboard Illusion" | 14 | Deliver a red-team report with ≥20 adversarial cases across four categories with severity, and a paragraph explaining to a non-technical stakeholder why a vendor's benchmark number should not change a procurement decision. |
| **B8. Statistics for evals** | Wilson/Agresti–Coull CIs (not Wald, n is small and p near 0 or 1); paired comparison on shared question sets (McNemar for binary); clustered bootstrap (resample clusters, k trials of one task are one cluster); power analysis for eval size; multiple comparisons; CUPED for online tests | Evan Miller (Anthropic), "Adding Error Bars to Evals" (arXiv 2411.00640); `judgy`; τ-bench pass^k | 12 | From a raw judge pass rate on 500 traces and a 100-example calibration set, return a corrected estimate with a bootstrap 95% CI, and answer "how many more examples to halve that interval?" without looking anything up. |
| **B9. Tooling** | Build a ~200-line pytest-style harness first (dataset JSONL → async runner with caching and cost accounting → scorers → versioned results → diff report with CIs); then port to Inspect AI (UK AISI; the strongest CV signal); instrument Langfuse or Phoenix; own the golden set, judge prompts and taxonomy, buy tracing and diffing | Hamel, "Your AI Product Needs Evals" and "Selecting the Right AI Evals Tool"; Inspect AI docs + Hamel's primer; Langfuse docs; Arize free eval-fundamentals course | 12 | Show the same suite running three ways (own harness, Inspect AI, a platform) with a paragraph on what each layer earned. |

**Free shortlist that recovers ~75% of the $4,200 course (about 54 hours, $0):** the 17-email course; the Evals FAQ; Hamel's blog trilogy; Anthropic "Demystifying evals"; `evals-skills` + `judgy` hands-on; Miller's error-bars paper; DeepLearning.AI *Evaluating AI Agents*; Inspect AI port of your capstone.

**Paid upgrades if employer-funded:** Hamel & Shreya's Maven course, $4,200, Oct 10 – Nov 21 2026 cohort (stated as the last of 2026; 4.7/5 from 901 reviews; endorsed by Willison, Chase, Yan). Their O'Reilly book *Evals for AI Engineers* ships 2026-10-31 with early chapters live now.

**Stale, do not build on:** the OpenAI Evals platform (read-only from 2026-10-31, shut down 2026-11-30; read the concepts, use nothing else); HELM (maintenance mode since June 2026); the HF evaluation-guidebook GitHub repo (unmaintained since December 2025, use the Space); SWE-bench Verified as a metric to quote.

## The project spine: oil and gas, open data

**Top pick: end-of-well report Q&A with enforced page citations, and a grounding-failure eval harness.** The Norwegian Offshore Directorate (Sodir) serves thousands of end-of-well report PDFs with no login under the Norwegian open-government licence. Verified 2026-09-18 by fetching well 6506/3-1's report (4 MB, ~1,500 pages: daily activity reports, wellsite geology, contractor end-of-well summaries, bit records). This beats Volve as a text corpus, and the free automatically-verifiable ground truth is the trick: facts that appear in both the PDF narrative and Sodir's structured wellbore tables (total depth, spud and completion dates, operator, formation at TD, discovery flag) give you a golden set with zero hand-labelling, then you hand-write 50–80 harder questions with page-level answer spans.

**Then merge in the second project**: an agentic text-to-SQL tool over Sodir's structured tables in DuckDB (~9,800 wellbores, ~143 fields, monthly production), with an execution-match eval (do result sets agree) and a silently-wrong-answer rate. One assistant with a retrieval tool and a SQL tool is, on open data, a small-scale replica of what ADNOC paid $340M for, with the evaluation evidence the press releases never show. The closest published prior art is TADI (arXiv 2605.00060, April 2026), an agent over Volve with 12 tools and a 130-question stress taxonomy. Read it, cite it, then beat its eval.

**Third, once you reach fine-tuning:** Volve's 1,759 daily drilling reports → a non-productive-time ledger, with a classic-ML control arm (TF-IDF + gradient boosting, and a fine-tuned encoder) against the same golden set. If the encoder wins the classification sub-task, which it plausibly will, say so and scope the LLM to free-form root cause and zero-shot coverage of a new operator's format. Equinor's own January 2026 statement is that they "primarily use traditional machine learning on our operational data"; that honesty is the sector's actual conversation.

### Data you can actually download

| Dataset | What | Access | Use |
|---|---|---|---|
| Sodir FactPages wellbore documents | End-of-well report PDFs, thousands of wells | **Open, no login** (NLOD) | Project 1 corpus |
| Sodir FactPages tables | Wellbores, fields, licences, discoveries, monthly production (CSV/API) | **Open** | Free ground truth for project 1; SQL layer for project 2 |
| Equinor Volve | 1,759 daily drilling reports (XML), WITSML, ~15,600 production records, logs, seismic | **Free registration** (Databricks Marketplace, Free Edition works; ~1h to appear; Delta Sharing for use outside Databricks) | Project 3 |
| FORCE 2020 well logs | 118 wells, expert lithology labels, 170 MB | **Open** (Zenodo, CC BY 4.0) | Classic-ML control arm |
| BSEE data center | 2,018 incident investigations + panel report PDFs, production by platform | **Open** | Optional HSE project |
| PHMSA pipeline incident files | 20 years of narratives with PHMSA's own harmonised cause codes | **Open** (blocks bots, fine in a browser) | A pre-built labelled taxonomy for an HSE extraction project |
| Havtil investigation reports + regulations | Norwegian incident reports and the full HSE regulatory framework in English | **Open** | HSE or regulatory Q&A |
| eCFR Title 30 Part 250 | US offshore regulations, bulk XML, daily | **Open, public domain** | Regulatory Q&A (API and NORSOK standards are paywalled and non-redistributable; say so in the README) |
| EIA bulk files | Petroleum (54 MB), gas, drilling productivity | **Open, no key** | Second schema for the SQL agent |
| NOPIMS (Australia) | Open-file well completion reports | **Open** (JS-heavy portal) | Second-jurisdiction generalisation test |
| PetroWiki | SPE encyclopedia | **Not open-licensed.** Link to it, never ingest it into a public repo. | |

**Where the honest answer is "don't use an LLM":** lithology from logs (GBMs / 1D CNN), decline-curve forecasting (Arps, ARIMA), sensor anomaly detection (classical time series; the LLM writes the explanation, never the detection), seismic picking (vision models), anything safety-critical with no human in the loop.

**Employer signal, verbatim from SLB's live posting (Houston, AI Engineer):** "Collaborate with domain teams to define benchmark datasets, evaluation metrics, and acceptance criteria; establish continuous evaluation frameworks." Halliburton Landmark: "Design and deploy LLM-based solutions (RAG, prompt pipelines, vector search)" with "end-to-end ML pipelines with CI/CD." Deployed systems to name in interviews: SLB Lumi and Tela, ADNOC ENERGYai (OSDU-based), Baker Hughes Leucipa "Lucy," bp with Palantir AIP, TotalEnergies with Mistral, Cognite Atlas AI. Knowing OSDU entity names is a resume signal on its own.

## The 40-week calendar (12 hrs/week)

| Phase | Weeks | Hrs | What you do | Ship |
|---|---|---|---|---|
| **0. Orient & set up** | 1–2 | 25 | Catch-up list above; uv/ruff; Databricks account; GPU rental; Langfuse; start the free evals email course | Notes; environment |
| **1. Transformers from scratch** | 3–8 | 70 | Track A1: Karpathy (3 videos) → CS336 L1–4 → Raschka ch 2–5 or CS336 A1 → scaling → nanochat speedrun | Your own GPT-2-class model with an explained loss curve |
| **2. v0 app + evals foundation** | 9–14 | 65 | Build naive RAG over ~20 Sodir reports (A5 lite, A6 lite, pgvector). Then B0–B3 on its traces: read 100, taxonomy, golden set (auto-derived + hand-written), calibrated judge with Rogan–Gladen CI. Read Miller. | Failure taxonomy; golden set v1; judge calibration report |
| **3. RAG depth + RAG evals** | 15–18 | 45 | A6 full (contextual retrieval, hybrid, reranking, query rewriting); B4; first CI gate (B6 part) | 4-config retrieval table; segment breakdown; green CI |
| **4. Agents + agent evals** | 19–25 | 80 | A5 full, A7; add the DuckDB text-to-SQL tool over Sodir tables and merge with the retriever into one agent; MCP server at the 2026-07-28 spec; B5 | Single agent, 5+ tools, approval gate; execution-match eval; pass^k with CI |
| **5. Production, safety, stats** | 26–30 | 50 | A8; B6 full (model-swap requalification); B7 red-team (indirect injection via retrieved PDFs); B8; B9 (own harness → Inspect AI port) | Traces with cost per span; red-team report; model-swap memo; Inspect port |
| **6. Post-training & inference** | 31–36 | 60 | A2 (CS336 L13–16 + A5 or nanochat RL), A3 (Unsloth QLoRA), A4 (vLLM course); Volve DDR → NPT with fine-tuned 7–8B vs encoder vs frontier; cost-vs-quality Pareto | Fine-tune beat/lost report with the classic-ML control arm |
| **7. Write-up & publish** | 37–40 | 30 | 2,500-word write-up led by the taxonomy, not the architecture; README a stranger can reproduce; public post on one failure mode | The hiring artefact |

If the employer funds the Maven evals cohort (Oct 10 – Nov 21 2026), swap phases 1 and 2 so the cohort's homework lands on your own system; its lessons map almost exactly onto B1–B6.

**Compressed 6-month lane (~220 hrs):** phase 0; A1 lean lane (45h: Karpathy GPT + tokenizer → Raschka ch 2–5 → nanochat speedrun); phases 2–5 as written but with B7 trimmed to 10 cases; skip phase 6 except the vLLM course and one QLoRA run; write-up. You lose the ability to reason about pretraining and post-training decisions, which is precisely what separates your MSc from the bootcamp crowd, so only take this lane under real time pressure.

## Learning protocol (from the Anthropic RCT)

AI-assisted learners scored 50% vs 67% on concepts they had just used, with debugging worst hit; learners who used AI for conceptual questions did fine. So during phases 1–4: attempt first, ask for explanations not code, never paste-the-error, close the tab and re-derive, self-test without the tool. Flip to full delegation only in phases 5–7 when shipping.

## Capstone checklist (what the public repo must contain)

1. **Golden dataset**: 150–300 labelled examples, provenance documented, real/synthetic split, a held-out judge test slice, versioned with a data card.
2. **Failure taxonomy** from ≥100 hand-read traces, with the raw open codes shown, 5–9 categories with counts.
3. **Evaluators**: ≥3 code-based scorers; ≥1 LLM judge with prompt history; a **judge calibration report** (TPR/TNR with CIs, confusion matrix, position-bias and verbosity-bias checks, Rogan–Gladen corrected pass rate with bootstrap CI).
4. **Harness**: one command, deterministic case IDs, records model + prompt version + commit SHA, caches calls, cost and latency per case, diff report with per-failure-mode deltas, a green CI run plus a deliberately broken PR showing the gate fire, ported to Inspect AI.
5. **RAG and agent specifics**: recall@k and nDCG on a labelled retrieval set; calibrated faithfulness judge; trajectory scorer; tool-call correctness; terminal-state check; pass^k at k=5 with CI; abstention rate on unanswerable questions.
6. **Safety slice**: ≥20 adversarial cases mapped to OWASP GenAI 2026 categories with severity.
7. **Model-swap requalification**: paired comparison with CI (McNemar), judge re-calibrated on the new model's outputs, ship / don't-ship memo with guardrail thresholds.
8. **Write-up** (2,000–3,000 words): system and why it's hard to evaluate → what 100+ traces revealed → evaluator design → calibration → statistics and where they break → model-swap result → limitations and what the numbers cannot tell you → total cost of eval runs.

Anti-patterns that sink it: a Ragas wrapper with default metrics and no calibration; a raw judge pass rate reported as the system's; a Likert judge with no human comparison; benchmark scores as evidence; an eval set written from imagination; point estimates without intervals; a README that describes the app for three paragraphs before mentioning evaluation.

## Method and caveats

Four Opus research agents ran in parallel on 2026-09-18 (LLM curriculum, evals curriculum, oil and gas datasets and employers, 2022→2026 gap), each 44–90 tool calls, all claims URL-and-date stamped in `research/05–08`. Verified by direct fetch: Sodir PDFs and tables, Zenodo FORCE 2020, Equinor's Databricks user guide, BSEE, Texas RRC, EIA, Anthropic and OpenAI model pages, PyPI stats, the MCP changelog. Blocked to bots and re-check in a browser: PHMSA, OSDU GitLab, CO2DataShare. Unverified: any Chevron or ExxonMobil deal with OpenAI; specific 2026 benchmark scores; the exact enactment status of the EU AI Act omnibus deferral (direction corroborated, regulation number not).
