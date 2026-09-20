# LLM Engineering Curriculum — Ranked Resources + Topic-by-Topic Syllabus

**Prepared:** 2026-09-18
**Learner profile:** MSc Data Science (2022); strong stats, classic ML, DL basics; Python + SQL; "understands transformers roughly."
**Goal:** Build, adapt, deploy and reason about LLM applications and agents in production.
**Budget:** 10–15 hrs/week.
**Stated starting point:** Karpathy Zero-to-Hero (GPT-from-scratch + tokenizer videos).
**Scope note:** Evals are deliberately kept light here — a separate research track covers evals in depth. This report marks the seams where evals plug in.

All links checked 2026-09-18. Where a page did not expose a date or price, that is stated rather than guessed.

---

# PART A — Ranked resource list (2025–2026)

## Verdict table (read this first)

| # | Resource | Verdict | Cost | Hours | Last updated |
|---|---|---|---|---|---|
| 1 | Karpathy, *Neural Networks: Zero to Hero* | **MUST-DO** (core 3 videos) | Free | 25–40 | Series page maintained; 2026 refresh noted |
| 2 | karpathy/nanochat | **MUST-DO** (read + run) | Free code, ~$15–100 GPU | 25–40 | Active through 2026 |
| 3 | Raschka, *Build a LLM (From Scratch)* + repo | **MUST-DO** (book or Karpathy — pick one lane, skim other) | ~$50 | 40–60 | Book 2024; repo actively maintained 2026 |
| 4 | Anthropic Engineering blog (agent/context trilogy) | **MUST-DO** | Free | 8–12 | Dec 2024 → Apr 2026 |
| 5 | Hugging Face Agents Course | **MUST-DO** | Free | 20–30 | Living; 2026 maintenance |
| 6 | Chip Huyen, *AI Engineering* | **MUST-DO** (spine/reference) | ~$50 | 25–35 | Jan 2025, 1st ed |
| 7 | Stanford CS336 (videos + assignments) | **MUST-DO selectively** (A1, A3, A5) | Free (audit) / $7,875 (credit) | 40–120 | Spring 2026 |
| 8 | Hugging Face LLM Course | **MUST-DO** (ch. 10–12 esp.) | Free | 30–50 | Living; reasoning-model chapters added |
| 9 | Anthropic MCP spec + Claude Agent SDK docs | **MUST-DO** (reference) | Free | 6–10 | MCP spec 2026-07-28 |
| 10 | OpenAI *A Practical Guide to Building Agents* | **MUST-DO** (short) | Free | 2–3 | 2025, still accurate |
| 11 | DeepLearning.AI *Fast & Efficient LLM Inference with vLLM* | **MUST-DO** | Free to watch | 3–5 | Jun 2026 |
| 12 | Unsloth docs (fine-tuning + LoRA hyperparameter guides) | **MUST-DO** (practical) | Free | 8–12 | Rolling 2026 |
| 13 | Berkeley LLM Agents / Agentic AI MOOC | Optional depth (high value) | Free | 25–40 | Fall 2025 / 2026 iterations |
| 14 | Raschka, *Build a Reasoning Model (From Scratch)* | Optional depth (strong) | ~$50 | 25–35 | 2026 |
| 15 | DeepLearning.AI *Post-training of LLMs*, *RAG*, *MCP*, *Agentic AI* | Optional, targeted | Free video / $25-mo Pro | 3–6 each | 2025–2026 |
| 16 | Maven — Hamel & Shreya, *AI Evals* | Optional, expensive; evals track | $4,200 | ~25 | Oct 2026 cohort |
| 17 | Maven — Jason Liu, *Systematically Improving RAG* | Optional; good if RAG is the job | Not published on page | ~12 | 2026 cohorts |
| 18 | Stanford CS25 Transformers United V6 | Optional (seminar/awareness) | Free | 10–15 | Spring 2026 |
| 19 | HF smol-course | Optional (hands-on alignment) | Free | 12–20 | 2026 PRs (TRL 1.5) |
| 20 | HF MCP Course | Optional | Free | 10–15 | 2025–2026 |
| 21 | Google ADK docs | Optional (only if GCP shop) | Free | 6–10 | ADK 2.0 GA Jun 2026 |
| 22 | Stanford CS224N | Optional background | Free (2024 videos) | 30–40 | W2026 course; **public videos are 2024** |
| 23 | Maven — Becker & Husain, *Mastering LLMs* | **Mostly stale** | Paid archive | — | 2024 conference |
| 24 | Full Stack LLM Bootcamp | **STALE** — history only | Free | 2 (skim) | Spring 2023 |
| 25 | fast.ai Part 2 | **STALE for LLM eng** | Free | — | 2022/23, diffusion-focused |
| 26 | karpathy/nanoGPT | **Superseded** (still readable) | Free | — | Deprecated Nov 2025 |
| 27 | karpathy/LLM101n | **Does not exist** | — | — | Repo archived Aug 2024 |

---

## Tier 1 — Must-do core

### 1. Andrej Karpathy — *Neural Networks: Zero to Hero*
- **URL:** https://karpathy.ai/zero-to-hero.html · repo https://github.com/karpathy/nn-zero-to-hero
- **Version/date:** 8 lectures (micrograd → makemore 1-5 → "Let's build GPT" → "Let's build the GPT Tokenizer"). Series page still labelled ongoing; the GitHub repo shows maintenance activity into 2026.
- **Cost:** Free. **Hours:** 13h of video; **25–40h** with the exercises actually done.
- **Evidence of value:** The de-facto entry rite for LLM engineers. nn-zero-to-hero and the companion nano-repos sit in the ~100k+ star range collectively; Karpathy's nanoGPT alone is 63.2k stars and nanochat 58.1k. Karpathy is ex-OpenAI founding member, ex-Tesla AI director, and as of 2026 on Anthropic's pretraining team — endorsement is structural, not marketing.
- **What to actually watch given this learner:** skip/skim micrograd (you know backprop) and makemore 1–2. **Do** makemore 3 (activations/gradients/BatchNorm — this is the one that builds real training intuition), **"Let's build GPT"**, and **"Let's build the GPT Tokenizer."**
- **Caveat:** the series stops at GPT-2-era architecture. It has no RoPE, no GQA, no MoE, no RLHF. It is a foundation, not a curriculum.

### 2. karpathy/nanochat
- **URL:** https://github.com/karpathy/nanochat
- **Version/date:** Released Oct 2025; leaderboard and optimisation activity through 2026. **63.2k-star nanoGPT was formally deprecated in favour of it (Nov 2025).**
- **Cost:** Free code. A "speedrun" full run is ~$48 on an 8×H100 node (~2h wall clock), ~$15 on spot. **Hours:** 25–40 to read + run + modify.
- **Evidence of value:** 58.1k stars, 8.1k forks. It is the only single readable codebase that covers **tokenizer → pretrain → SFT → RL (GRPO) → eval → inference → web UI**. This is the single highest-leverage artefact in the whole list for this learner.
- **Note:** it is explicitly earmarked as the capstone of LLM101n, which does not exist yet (see below).

### 3. Sebastian Raschka — *Build a Large Language Model (From Scratch)*
- **URL:** book https://www.manning.com/books/build-a-large-language-model-from-scratch · repo https://github.com/rasbt/LLMs-from-scratch
- **Version/date:** Manning, 2024. The **repo is the living part** — it carries 2025/2026 bonus material (Llama-3, Qwen3, Gemma, MoE, KV cache, LoRA notebooks) that the print book does not.
- **Cost:** ~$50 (Manning/Amazon). **Hours:** 40–60 for the book, less if used as a reference alongside Karpathy.
- **Evidence of value:** Consistently the most-recommended written companion to Karpathy's videos; repo is among the highest-starred LLM education repos. Raschka's *Ahead of AI* newsletter is a named-practitioner staple.
- **Recommendation:** do **not** do both this and CS336 A1 in full — that is duplicated work. Pick the book if you learn better from prose, pick CS336 A1 if you want the harder engineering.

### 4. Raschka — *Build a Reasoning Model (From Scratch)*
- **URL:** https://www.manning.com/books/build-a-reasoning-model-from-scratch
- **Version/date:** Manning, 2026 (ISBN 978-1633434677). **It does exist** — the parent brief's "if it exists" resolves to yes.
- **Cost:** ~$50. **Hours:** 25–35.
- **Content:** takes a small pretrained base on consumer hardware → inference-time reasoning (CoT, sampling strategies, verifiers) → RL improvement. This is the cleanest hands-on treatment of reasoning models available; it fills the exact gap Karpathy's series leaves.
- **Verdict:** optional depth, but it is the best thing in this segment for Module 2 and worth prioritising over most courses.

### 5. Stanford CS336 — *Language Modeling from Scratch*
- **URL:** https://cs336.stanford.edu/ · lecture playlist https://www.youtube.com/playlist?list=PLoROMvodv4rMqXOcazWaTUHhq-yembLCV · Stanford Online (for-credit) https://online.stanford.edu/courses/cs336-language-modeling-scratch
- **Version/date:** **Spring 2026** offering (Mar 30 – Jun 10, 2026), third iteration (2024, 2025, 2026). Lecture videos and assignment repos are public; graded credit is not.
- **Cost:** Free to audit. $7,875 via Stanford Online for credit. **Hours:** the real course is 10 weeks × 20–25 hrs/wk = 200–250h. Selective audit: 40–120h.
- **Structure:** 19 lectures — (1-4) tokenization, PyTorch perf, architectures, attention variants; (5-8) GPU/TPU, Triton kernels, distributed parallelism; (9-12) scaling laws, inference, evaluation; (13-16) data curation, dedup, SFT, RLHF; (17-19) multimodality + guests. Five assignments: Basics (transformer from scratch), Systems (FlashAttention2 + distributed), Scaling (scaling laws), Data (Common Crawl pipeline), Alignment (SFT + RL).
- **Evidence of value:** the most-cited "serious" LLM course of 2025–26; Percy Liang/Tatsunori Hashimoto lineage. Employers recognise CS336 assignment repos on GitHub.
- **Honest guidance for this learner:** **do not attempt all five assignments.** At 12 hrs/week that is a 20-week detour. Do **A1 (Basics)**, **A3 (Scaling)**, **A5 (Alignment)**, and watch lectures 9–11 (scaling/inference/eval) and 13–16 (data/post-training). Skip A2 (Triton/FlashAttention) and A4 (Common Crawl) unless targeting a pretraining-infra role — they are excellent but are model-*training* skills, not LLM-*application* skills.

### 6. Chip Huyen — *AI Engineering: Building Applications with Foundation Models*
- **URL:** https://www.oreilly.com/library/view/ai-engineering/9781098166298/ · companion repo https://github.com/chiphuyen/aie-book
- **Version/date:** O'Reilly, **7 Jan 2025, 1st edition** (no 2nd edition as of 2026-09-18).
- **Cost:** ~$50 print / O'Reilly subscription. **Hours:** 25–35.
- **Evidence of value:** Reported as the most-read book on the O'Reilly platform; Huyen is ex-NVIDIA/Snorkel/Stanford and author of *Designing Machine Learning Systems*.
- **Honest criticism (from reviews):** it is broad rather than deep — "too much into the weeds for beginners while lacking in-depth architectural analysis for seasoned folks." **Use it as the syllabus spine and vocabulary source, not as a hands-on text.** Read chapters just-in-time per module rather than cover-to-cover.
- **Recency flag:** early-2025 model-landscape examples are already dated; the *frameworks* (evaluation-driven development, adaptation ladder, inference optimisation taxonomy) hold up.

### 7. Anthropic Engineering blog — the agents/context canon
- **URL:** https://www.anthropic.com/engineering
- Key posts and dates (all verified on the index):
  - **Building effective agents** — 19 Dec 2024. Still the single most-cited agent design document; the workflow-vs-agent taxonomy is industry vocabulary.
  - **Introducing Contextual Retrieval** — 19 Sep 2024. The contextual-chunking technique (≈67% reduction in top-20 retrieval failures with reranking) is now standard RAG practice.
  - **How we built our multi-agent research system** — 13 Jun 2025.
  - **Writing effective tools for agents — with agents** — 11 Sep 2025.
  - **Effective context engineering for AI agents** — 29 Sep 2025. Framework-setting post for Module 5.
  - **Code execution with MCP: building more efficient agents** — 4 Nov 2025. Token-efficiency pattern for large tool sets.
  - **Advanced tool use on the Claude Developer Platform** — 24 Nov 2025.
  - **Effective harnesses for long-running agents** — 26 Nov 2025.
  - **Demystifying evals for AI agents** — 9 Jan 2026. *(evals track)*
  - **Scaling managed agents: decoupling the brain from the hands** — 8 Apr 2026.
- **Cost:** free. **Hours:** 8–12 to read all carefully with notes.
- **Verdict:** highest value-per-hour in the entire list. Read them in date order — they read as one evolving argument.

### 8. Hugging Face courses
- **LLM Course** — https://huggingface.co/learn/llm-course — 12 chapters. Ch. 1–4 Transformers library; 5–8 datasets/tokenizers/classic NLP; 9 Gradio demos; **10–12 fine-tuning, dataset curation, reasoning models** (the 2025/26 additions). ~6–8 hrs/chapter as designed; **30–50h** total, but this learner should **skip ch. 1–9 largely** and do 10–12.
- **Agents Course** — https://huggingface.co/learn/agents-course — Units 0–4 + 3 bonus units (fine-tuning for function calling, **agent observability & evaluation**, agents in games). 3–4 hrs/week × ~6 weeks = **20–30h**. Free certification (Fundamentals + Completion). Reported 200k+ certifications issued by mid-2026 — the largest-enrolment agent course anywhere. Covers smolagents, LlamaIndex, LangGraph.
- **MCP Course** — https://huggingface.co/learn/mcp-course — 10–15h, certificates available. Useful but thinner; the spec + Anthropic docs cover more ground faster.
- **smol-course** — https://github.com/huggingface/smol-course and https://huggingface.co/learn/smol-course — instruction tuning, SFT, preference alignment (DPO), evaluation, VLMs, built on SmolLM3/SmolVLM2, runnable on modest GPUs. **Actively maintained in 2026** (PRs aligning to TRL 1.5). 12–20h. This is the best *free* hands-on alignment lab.
- **Verdict:** Agents Course = must-do. LLM Course ch. 10–12 = must-do. smol-course = strong optional. MCP Course = optional.

### 9. MCP specification + Claude Agent SDK
- **MCP spec:** https://modelcontextprotocol.io/specification/2026-07-28/changelog · blog https://blog.modelcontextprotocol.io/posts/2026-07-28/
- **Version/date:** **2026-07-28 is the current stable revision** — the largest revision since launch: stateless protocol core (session model removed via six SEPs), multi round-trip requests, header-based routing, cacheable list results, authorization hardening (issuer validation, issuer-bound client credentials, Client ID Metadata Documents), formal extensions framework, 12-month deprecation lifecycle.
- **⚠️ Staleness trap:** *any* MCP tutorial written before Aug 2026 teaches the stateful session model. Treat pre-2026-07-28 MCP content — including much of the HF MCP Course and most YouTube — as **partially stale**. Read the changelog first.
- **Claude Agent SDK:** https://docs.claude.com/en/docs/agent-sdk/ · MCP integration https://docs.claude.com/en/docs/agent-sdk/mcp · Python SDK https://github.com/anthropics/claude-agent-sdk-python. Includes Agent Skills, tool search for large tool sets, in-process/HTTP/SSE MCP transports.

### 10. OpenAI — *A Practical Guide to Building Agents*
- **URL:** https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf (landing: https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- **Version/date:** 2025, 34 pages. Still accurate.
- **Cost:** free. **Hours:** 2–3.
- **Content:** when an agent is warranted at all; agent = model + tools + instructions; single-agent vs manager vs decentralised orchestration; **seven guardrail types**. Pair with the OpenAI Cookbook (https://cookbook.openai.com/) and Agents SDK docs (https://openai.github.io/openai-agents-python/).
- **Value:** it is vendor-flavoured but the taxonomy is model-agnostic and complements Anthropic's post well — read both, note where they disagree.

### 11. DeepLearning.AI — which short courses actually matter
- **Catalog:** https://www.deeplearning.ai/courses/ (124 short courses as of 2026). **Videos are free; labs/quizzes/certificates now require Pro at $25/month billed annually.**
- Worth your time (each 2–6h):
  - **Fast & Efficient LLM Inference with vLLM** (Red Hat, Cedric Clyburn) — https://www.deeplearning.ai/courses/fast-and-efficient-llm-inference-with-vllm — **released 3 Jun 2026**. Quantize with LLM Compressor → measure perplexity delta → serve with vLLM OpenAI-compatible API → observe continuous batching and prefix caching in metrics → benchmark with GuideLLM. **The best single artefact for Module 4 anywhere.**
  - **Post-training of LLMs** (UW/NexusFlow) — SFT, DPO, online RL. Good Module 2 complement.
  - **MCP: Build Rich-Context AI Apps with Anthropic** (Elie Schoppik) — https://www.deeplearning.ai/courses/mcp-build-rich-context-ai-apps-with-anthropic — check date against the 2026-07-28 spec before trusting details.
  - **Agentic AI** (Andrew Ng) — https://www.deeplearning.ai/courses/agentic-ai — 5 modules, ~10h. Reflection / tool use / planning / multi-agent built from first principles. Reviews are candid: "very much an introductory course… you'll need other sources to build production-grade agentic systems." **Skippable for this learner** — you'll get the same content faster from the Anthropic + OpenAI guides.
  - **Retrieval Augmented Generation (RAG)** (DeepLearning.AI, full course not short) — production-ready implementation + evaluation.
- **Skip:** the long tail of vendor-partner short courses (crewAI, Box MCP, LangGraph memory, etc.) unless you have a specific tool decision to make. They are marketing-adjacent and age in months.

### 12. Unsloth / TRL / Axolotl documentation (the fine-tuning triad)
- **Unsloth:** https://unsloth.ai/docs/get-started/fine-tuning-llms-guide and the **LoRA hyperparameters guide** https://unsloth.ai/docs/get-started/fine-tuning-llms-guide/lora-hyperparameters-guide — rolling updates through 2026. Unsloth's own guidance: start with QLoRA; full fine-tuning is usually unnecessary; done right LoRA matches FFT. 2026 community defaults: r=16, α=16, all-linear target modules, DoRA on.
- **TRL:** https://huggingface.co/docs/trl — v1.5 line in 2026. SFTTrainer, DPOTrainer, GRPOTrainer, reward modelling.
- **Axolotl:** https://docs.axolotl.ai/ — YAML-driven multi-GPU pipelines.
- **Division of labour (2026 consensus):** Unsloth for single-GPU speed, Axolotl for multi-GPU production, TRL when you need raw control over the objective.

---

## Tier 2 — Optional depth, genuinely good

### 13. Berkeley CS294/194 — LLM Agents / Agentic AI MOOC
- **URLs:** Fall 2024 https://rdi.berkeley.edu/llm-agents/f24 · Spring 2025 https://llmagents-learning.org/sp25 · Fall 2025 "Agentic AI" https://agenticai-learning.org/f25
- **Instructor:** Prof. Dawn Song (+ rotating guest lecturers from OpenAI, Anthropic, DeepMind, Meta).
- **Evidence of value:** 23,000+ registered MOOC learners across the series; free certificates at multiple tiers.
- **Cost:** free. **Hours:** 25–40 per iteration.
- **Verdict:** the best *research-level* survey of agents — reasoning techniques, tool use, SWE agents, agent infrastructure, agentic workflows, safety and security. It is lecture-heavy and light on production engineering. Take it **after** you've shipped an agent, as the "why does this work" layer.

### 14. Stanford CS25 — Transformers United V6
- **URL:** https://web.stanford.edu/class/cs25/ · playlist https://www.youtube.com/playlist?list=PLoROMvodv4rNiJRchCzutFw5ItR_Z27CM
- **Version/date:** **V6 ran Spring 2026** — lectures posted Apr–May 2026 include "Overview of Transformers" (2 Apr), "From Representation Learning to World Modeling" (9 Apr), "Tradeoffs of State Space Models and Transformers" (16 Apr), "From Next-Token Prediction to Next-Generation Intelligence" (30 Apr), "From Language Models to Native Multimodal Intelligence" (21 May), **"Serving Transformers: Lessons from the Trenches" (28 May)**.
- **Cost:** free; anyone can join the Zoom livestream. **Hours:** 10–15 to cherry-pick.
- **Verdict:** a seminar series, not a course — no assignments, no scaffolding. Watch 3–4 talks for awareness. "Serving Transformers" is directly relevant to Module 4; the SSM talk is the best short treatment of attention alternatives.

### 15. Maven cohort courses
- **Hamel Husain & Shreya Shankar — AI Evals For Engineers & PMs** — https://maven.com/parlance-labs/evals — **$4,200**, 6 weeks (Oct 10–Nov 21, 2026 cohort), 3–5 hrs/week, **4.7/5 from 901 reviews**, 15 live sessions, 200+ page reader, lifetime access to future cohorts. Reported earlier 2026 pricing at $5,000 with sold-out cohorts — price has moved, so check before committing. **This is the highest-reputation paid course in the segment.** It belongs to the separate evals track; flagged here so the tracks don't double-buy.
- **Jason Liu — Systematically Improving RAG Applications** — https://maven.com/applied-llms/rag-playbook — **4.8/5 from 87 reviews**, 4 weeks at 2–3 hrs/week, 6 prerecorded lectures + 12 Python notebooks + office hours, $2k+ in cloud credits, free re-enrolment. **Price is not published on the page** — request it. Prerequisite: you already have a deployed RAG system. Free companion essay (very good, read it regardless): https://jxnl.co/writing/2025/01/24/systematically-improving-rag-applications/
- **Verdict:** both are optional. The free writing from both instructors carries a large fraction of the value. Pay only if you want the cohort/community and have employer budget.

### 16. Google Agent Development Kit (ADK)
- **URL:** https://github.com/google/adk-python · docs https://github.com/google/adk-docs · Cloud docs https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/adk · codelab https://codelabs.developers.google.com/onramp/instructions
- **Version/date:** **ADK 2.0 reached GA in June 2026.** Python, TypeScript, Go, Java.
- **Verdict:** learn only if your employer is on GCP/Gemini. Conceptually it is a third rendering of the same agent ideas. 6–10h if needed.

### 17. Stanford CS224N — NLP with Deep Learning
- **URL:** https://web.stanford.edu/class/cs224n/ · public videos (2024) https://www.youtube.com/playlist?list=PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ
- **Version/date:** **Winter 2026** offering taught by Diyi Yang and Yejin Choi — covers pretraining, post-training, efficient adaptation, agents, reasoning, multilinguality, multimodality, interpretability. **But 2026 lecture videos are Canvas-only; the publicly available playlist is the 2024 edition.** W2026 slides are public (e.g. https://web.stanford.edu/class/cs224n/slides_w26/).
- **Verdict:** **optional and largely skippable for this learner.** Its first third (word vectors, RNNs, dependency parsing) is history you don't need; its last third is now better covered by CS336. Use the W2026 *slides* as a reading list, not the 2024 videos as a course.

---

## Tier 3 — Stale, superseded, or nonexistent. Do not build a plan around these.

### 18. Full Stack LLM Bootcamp — **STALE**
- **URL:** https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/
- **Date: Spring 2023 (April 2023, SF).** The organisers' own disclaimer on the page: "Tools and model capabilities have evolved since these lectures were recorded."
- It was excellent in its moment and is the origin of much current LLMOps vocabulary. In 2026 the specific tooling, model capabilities, context lengths, and cost curves are all wrong. **Skim "What's Next?" and the LLMOps lecture for historical framing only (≤2h). Do not do the labs.**

### 19. fast.ai Part 2 — *From Deep Learning Foundations to Stable Diffusion* — **STALE for this purpose**
- **URL:** https://www.fast.ai/posts/2023-04-04-part2-2023.html · course.fast.ai/Lessons/part2.html
- **Date: recorded Oct 2022, released April 2023.** No 2026 successor found.
- 30+ hours, and the destination is **Stable Diffusion, not LLMs.** The "build a framework from scratch" lessons (9–13) are pedagogically superb but overlap heavily with Karpathy and CS336 A1 while pointing at diffusion.
- **Verdict: skip.** The brief asks for it to be covered; it is covered, and the answer is no. Zero LLM-specific 2026 relevance.

### 20. Maven — Becker & Husain, *Mastering LLMs For Developers & Data Scientists* — **MOSTLY STALE**
- **URL:** https://maven.com/parlance-labs/fine-tuning
- **Date: 2024** (one-time conference; compute credits expired for enrolments after 2024-05-29). Recorded talks remain available to enrolled students.
- Axolotl-era fine-tuning content. Several talks (Hamel's on evals, the "is fine-tuning dead?" thread) are still worth hearing, and many are on YouTube free. Christian Mills' public notes: https://christianjmills.com/series/notes/mastering-llms-course-notes.html
- **Verdict:** don't pay. Watch selected free recordings. The live successor is the Evals course above.

### 21. karpathy/nanoGPT — **SUPERSEDED**
- **URL:** https://github.com/karpathy/nanoGPT
- 63.2k stars, but carries an explicit **November 2025 deprecation notice**: "nanoGPT (this repo) is now very old and deprecated but I will leave it up for posterity… you meant to use nanochat."
- **Verdict:** still the cleanest ~300-line GPT training loop ever written, and worth *reading* for exactly that. Do not build on it. Use nanochat.

### 22. karpathy/LLM101n — **DOES NOT EXIST**
- **URL:** https://github.com/karpathy/LLM101n
- **Repo archived 2024-08-01**, 3 commits, with the note: "this course does not yet exist. It is currently being developed by Eureka Labs."
- Status as of 2026-09-18: still unreleased. nanochat is designated as its capstone. Karpathy joined Anthropic's pretraining team in 2026 and stated he intends to resume education work "in time." **Do not wait for it.** The syllabus it published (17 chapters, bigram → attention → tokenization → precision/distributed → SFT/RL → deployment → multimodal) is a fine checklist, and this report's syllabus already covers the same ground with resources that exist.

---

## What employers actually recognise (2026)

Hiring signal, synthesised from 2026 hiring guidance:
- **Certificates alone are near-worthless.** Hiring managers report seeing hundreds of "completed the LLM course" portfolios weekly.
- **Green flags:** a non-trivial LLM project you built *and maintained*; production deployment with a monitoring stack; **evaluation results with specific metrics** (faithfulness, relevance, latency SLOs); documented cost-optimisation work; handling of named LLM failure modes; OSS contributions to real LLM tooling; a public technical post going deep on one failure mode.
- **RAG remains the single most in-demand named skill** in 2026 job posts.
- **Practical consequence for this plan:** every module below ends in an artefact. Treat the artefacts as the deliverable and the courses as the means. A public repo + a written post beats three certificates.

---

# PART B — Topic-by-topic syllabus

**Total: ~370–480 hours.** At 12 hrs/week that is **31–40 weeks (7–10 months)**, assuming no weeks off. Do not believe anyone who sells this as a 12-week path — the from-scratch module alone is 70–90 hours if done honestly. If you need to compress to ~6 months, cut Module 1 to the "lean lane" (see below) and drop Modules 2's CS336 assignments; you will reach "can build and deploy LLM applications" without reaching "can reason about pretraining decisions."

**Ordering note:** Modules 1–2 are depth-first (understanding); Modules 3–8 are breadth-first (shipping). It is entirely legitimate to interleave — do Module 1, then jump to 5→7 to get something shipped, then return to 2. The ordering below is the "understand-then-build" default.

---

## Module 0 — Orientation and setup *(4–6 h)*

**Objectives:** get a working GPU workflow; set the map before the territory.

**Resources:**
- Karpathy, **"Deep Dive into LLMs like ChatGPT"** (3h31m, Feb 2025) — https://www.youtube.com/watch?v=7xTGNNLPyMI — the whole training stack (pretraining → SFT → RLHF → hallucination/tool use mental models) in one sitting, no code. **Watch this first.** Best single orientation artefact in existence for this exact learner.
- Chip Huyen, *AI Engineering* — read Ch. 1 only, for the vocabulary and the "adaptation ladder."
- Set up: a Modal / RunPod / Lambda / Vast account with H100 access, `uv`, and a W&B or Langfuse account.

**Done when you can:** explain to a colleague, without notes, the difference between pretraining, SFT, RLHF and inference-time scaling, and estimate what each costs.

---

## Module 1 — Transformer internals and training from scratch *(70–90 h)*

**Objectives:** implement a decoder-only transformer end to end from an empty file; implement BPE; explain and implement RoPE; run a real training loop and read its loss curves; use scaling laws to make a compute allocation decision; reproduce GPT-2-class results.

**Core path (do all):**
1. **Karpathy, "Let's build GPT: from scratch, in code, spelled out"** (1h56m) — https://karpathy.ai/zero-to-hero.html — type along, do not copy-paste. *(8–12 h)*
2. **Karpathy, makemore Part 3: Activations & Gradients, BatchNorm** (1h55m) — the training-dynamics intuition (init scaling, dead neurons, gradient/activation histograms) that nothing else teaches this well. *(6–8 h)*
3. **Karpathy, "Let's build the GPT Tokenizer"** (2h13m) — implement BPE; understand why tokenization causes the weird failures (arithmetic, spelling, non-English cost, trailing whitespace). *(6–8 h)*
4. **CS336 Lectures 1–4** (tokenization; PyTorch + resource accounting; architectures; attention alternatives) — https://cs336.stanford.edu/ — this is where you get **RoPE, RMSNorm, SwiGLU, pre-norm** and the modern-vs-GPT-2 architectural deltas. *(10–14 h)*
5. **CS336 Assignment 1 (Basics)** — build the transformer, BPE tokenizer, AdamW, cross-entropy, and training loop from primitives, with public tests. *(25–35 h)* — **OR** Raschka *Build a LLM (From Scratch)* Ch. 2–5 if you prefer guided prose *(similar hours)*. Do not do both.
6. **CS336 Lecture 9 (Scaling laws) + Assignment 3 (Scaling)** — Chinchilla, compute-optimal allocation, fitting scaling laws and projecting to a target budget. *(10–15 h)*
7. **GPT-2 reproduction:** run **nanochat**'s pretraining stage end-to-end on a rented 8×H100 for ~$48 (or the cheaper mid-tier configs). Read `nanochat`'s tokenizer/pretrain code alongside your own. *(10–15 h + GPU cost)*
   - Karpathy's **"Let's reproduce GPT-2 (124M)"** (4h01m) — https://www.youtube.com/watch?v=l8pRSuU81PU (Jun 2024) — is the narrated version of this. Still accurate; watch at 1.5× as a companion, not a substitute for running nanochat.

**Lean lane (if compressing):** Karpathy GPT + tokenizer videos → Raschka Ch. 2–5 → nanochat speedrun → CS336 L1–4 for architecture deltas. **≈45 h.** You lose the scaling-laws fluency.

**Evals plug-in point:** CS336 L11 (evaluation) introduces benchmark methodology — note it, hand the depth to the evals track.

**Done when you can:**
- Write a working multi-head causal self-attention block on a blank page from memory, with correct mask and shapes.
- Implement BPE training and encoding, and explain three model failures that trace back to tokenization.
- State the difference between absolute/learned positional embeddings and RoPE, and explain *why* RoPE extrapolates and how position interpolation / NTK-aware scaling extend it.
- Given a $50k compute budget and a target eval, argue for a parameter count and token count, citing Chinchilla and its known caveats (inference cost changes the optimum).
- Point at your own repo with a GPT-2-class model you trained, and a loss curve you can explain the shape of.

---

## Module 2 — Modern architecture and post-training *(45–60 h)*

**Objectives:** explain and implement the deltas between GPT-2 and a 2026 frontier-class open model; explain the full post-training pipeline; know when each RL method applies; understand reasoning models and distillation.

**Topics & resources:**

| Topic | Resource | Hours |
|---|---|---|
| MoE (routing, load balancing, expert parallelism, capacity factor) | CS336 Lecture 3 (Architectures) + Raschka repo MoE notebooks (https://github.com/rasbt/LLMs-from-scratch) | 6–8 |
| GQA / MQA, KV-cache implications | Raschka repo KV-cache + GQA notebooks; CS336 L4 | 4–5 |
| Attention alternatives / SSMs | CS25 V6 "On the Tradeoffs of State Space Models and Transformers" (16 Apr 2026) — https://www.youtube.com/watch?v=OyimE74UMF8 | 2 |
| Long context (RoPE scaling, YaRN, ring/flash attention, context-length training curricula) | CS336 L4 + L10; Anthropic *Effective context engineering* (29 Sep 2025) | 5–7 |
| Data curation for pretraining | CS336 L13–14 (data, filtering, dedup). **Watch, skip A4.** | 4–6 |
| SFT | HF LLM Course Ch. 11; HF smol-course Unit 1; TRL `SFTTrainer` docs | 6–8 |
| RLHF / DPO / GRPO | CS336 L15–16 + **Assignment 5 (Alignment)**; DeepLearning.AI *Post-training of LLMs* (UW/NexusFlow); smol-course Unit 2 (DPO, aligned to TRL 1.5); **nanochat's GRPO stage** | 12–18 |
| Reasoning models & inference-time scaling | **Raschka, *Build a Reasoning Model (From Scratch)* (Manning, 2026)** — https://www.manning.com/books/build-a-reasoning-model-from-scratch | 12–18 (can run parallel to later modules) |
| Distillation | Raschka *Reasoning Model* + HF LLM Course Ch. 12 | 3–4 |

**Done when you can:**
- Draw the architecture diff between GPT-2 and a modern open model (RoPE, RMSNorm, SwiGLU, GQA, MoE layers, no bias terms) and justify each change in one sentence.
- Explain what a router collapse looks like and what auxiliary loss prevents it.
- Explain, without hedging, when you'd reach for DPO vs GRPO vs plain SFT, and what data each requires.
- Run nanochat's RL stage and describe what changed in the model's behaviour and why.
- Explain what a reasoning model is doing at inference time that a base instruct model isn't, and what it costs in tokens.

---

## Module 3 — Fine-tuning in practice *(35–45 h)*

**Objectives:** make the prompt-vs-RAG-vs-fine-tune decision defensibly; run LoRA/QLoRA end-to-end; curate a dataset; serve an adapter.

**Resources:**
- **Decision framework:** Chip Huyen, *AI Engineering* Ch. 5–7 (the adaptation ladder: prompt → RAG → fine-tune, cheapest first). Plus Hamel Husain's free writing at https://hamel.dev/ on "is fine-tuning worth it." *(4 h)*
- **Hands-on:** **Unsloth fine-tuning guide** (https://unsloth.ai/docs/get-started/fine-tuning-llms-guide) and the **LoRA hyperparameters guide** — rank, alpha, epochs, batch size + grad accumulation, QLoRA vs LoRA, target modules. *(10–14 h)*
- **TRL docs** (https://huggingface.co/docs/trl) for `SFTTrainer` / `DPOTrainer` internals; **Axolotl docs** (https://docs.axolotl.ai/) for YAML-driven multi-GPU. *(6–8 h)*
- **HF smol-course** Units 1–3 as the graded lab. *(8–12 h)*
- **Data curation:** HF LLM Course Ch. 11 (curating high-quality datasets) + the synthetic-data generation patterns in smol-course. *(5–7 h)*

**Key 2026 defaults to internalise (and then question):** start with QLoRA; r=16, α=16, all-linear target modules, DoRA on; LoRA ≈ full fine-tuning when done right; **500 clean examples beat 5,000 noisy ones.**

**Evals plug-in point:** you cannot honestly claim a fine-tune worked without a held-out eval built *before* training. Build the eval first — the evals track owns the method.

**Done when you can:**
- Take a real task, write the one-paragraph decision memo choosing prompt vs RAG vs fine-tune, with cost and latency numbers.
- QLoRA a 7–8B model on your own curated dataset on one GPU, serve the adapter, and show a before/after metric on a held-out set you built first.
- Explain what LoRA rank actually controls and what happens at r=4 vs r=128 for your task.
- Name three ways a fine-tuning dataset silently poisons a model (format leakage, refusal collapse, distribution narrowing) and how you'd detect each.

---

## Module 4 — Inference and serving *(30–40 h)*

**Objectives:** reason quantitatively about latency, throughput and cost; quantize with a measured accuracy tradeoff; serve with vLLM; design a routing strategy.

**Resources:**
- **DeepLearning.AI, *Fast & Efficient LLM Inference with vLLM*** (Red Hat, 3 Jun 2026) — https://www.deeplearning.ai/courses/fast-and-efficient-llm-inference-with-vllm — quantize with LLM Compressor, measure perplexity delta, deploy on the OpenAI-compatible API, watch continuous batching and prefix caching in the metrics, load-test with GuideLLM. **Do this whole course.** *(4–6 h)*
- **vLLM docs** — https://docs.vllm.ai/ — PagedAttention, continuous batching, prefix caching, speculative decoding, structured output backends. *(8–10 h)*
- **CS336 Lecture 10 (Inference)** — the theory: prefill vs decode, arithmetic intensity, why decode is memory-bandwidth-bound. *(3–4 h)*
- **CS25 V6, "Serving Transformers: Lessons from the Trenches"** (28 May 2026) — https://www.youtube.com/watch?v=ZUdIsRZhWXI *(1–2 h)*
- **Quantization formats:** GGUF/llama.cpp (https://github.com/ggml-org/llama.cpp) for local/CPU; **AWQ / GPTQ / FP8** via LLM Compressor (https://github.com/vllm-project/llm-compressor) for server. Raschka repo's KV-cache notebook for the mechanism. *(6–8 h)*
- **Prompt caching:** Anthropic (https://docs.claude.com/en/docs/build-with-claude/prompt-caching) and OpenAI cookbook equivalents — this is the single largest cost lever in most agent apps. *(2–3 h)*
- **Routing & small models:** Chip Huyen *AI Engineering* Ch. 9 (inference optimisation) + the model-router pattern. *(3–4 h)*

**Done when you can:**
- Explain why the first token is compute-bound and the rest are memory-bandwidth-bound, and what that implies for batching.
- Compute, on paper, the KV cache size in GB for a given model/context/batch, and say what breaks first when you double context.
- Quantize a model, report the perplexity and latency delta, and state whether you'd ship it.
- Stand up vLLM, load-test it, and produce a chart of throughput vs p99 latency vs concurrency.
- Write a cost model for your app in $/1k requests, and name the three biggest levers (caching, model size, output length).

---

## Module 5 — Prompting and context engineering *(25–30 h)*

**Objectives:** treat the context window as an engineered, budgeted resource; get reliable structured output; design tool interfaces; manage memory across long sessions.

**Resources:**
- **Anthropic, *Effective context engineering for AI agents*** (29 Sep 2025) — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — the framing document: curating the limited window from an evolving universe of candidate information. *(3 h with notes)*
- **Anthropic, *Writing effective tools for agents — with agents*** (11 Sep 2025) — https://www.anthropic.com/engineering/writing-tools-for-agents *(2 h)*
- **Anthropic, *Effective harnesses for long-running agents*** (26 Nov 2025) — compaction, sub-agent context isolation, note-taking to external memory. *(2 h)*
- **Anthropic, *The "think" tool*** (20 Mar 2025) — https://www.anthropic.com/engineering/claude-think-tool *(1 h)*
- **Structured outputs:** provider docs (OpenAI structured outputs / Anthropic tool use) + **Instructor** (https://python.useinstructor.com/, Jason Liu) + **Outlines** (https://dottxt-ai.github.io/outlines/) for constrained decoding; vLLM's guided-decoding backends. *(8–10 h)*
- **Anthropic prompt engineering docs** — https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview *(3 h)*
- **Memory:** Anthropic's memory/context-editing tooling + DeepLearning.AI *Long-Term Agentic Memory with LangGraph* if you want a worked example. *(4–5 h)*

**Done when you can:**
- Account for every token in your production prompt and say what it buys.
- Get a 100% valid-schema rate on structured output under adversarial inputs, and explain the difference between prompting-for-JSON, function calling, and constrained decoding at the sampler.
- Write a tool description that a model uses correctly on the first try, and explain what you changed after watching it fail.
- Describe a compaction strategy for a 200-turn session and what information you accept losing.

---

## Module 6 — RAG *(35–45 h)*

**Objectives:** build a retrieval system whose quality you can measure and improve systematically, not by vibes.

**Resources:**
- **Jason Liu, *Systematically Improving RAG Applications*** (free essay, Jan 2025, still the best framework) — https://jxnl.co/writing/2025/01/24/systematically-improving-rag-applications/ — synthetic eval data → measure retrieval separately from generation → segment failures → fix the biggest segment. *(4 h)*
- **Anthropic, *Introducing Contextual Retrieval*** (19 Sep 2024) — https://www.anthropic.com/news/contextual-retrieval — contextual chunk prefixing; reported ~67% reduction in top-20 retrieval failures when combined with reranking. Still the highest-ROI single RAG technique. *(2 h)*
- **Chunking:** fixed / recursive / semantic (split on cosine-similarity drop between adjacent sentences) / **late chunking** (Jina, gains grow with doc length) / contextual. *(5–6 h)*
- **Embeddings:** MTEB leaderboard — https://huggingface.co/spaces/mteb/leaderboard — pick by task and by your language, not by the top of the chart. Embedding fine-tuning via sentence-transformers. *(5–6 h)*
- **Hybrid search:** BM25 + dense with Reciprocal Rank Fusion. Reported 2026 benchmark: hybrid ≈66.4% MRR vs ≈56.7% semantic-only. In Postgres, BM25 via full-text search alongside `pgvector`. *(6–8 h)*
- **pgvector:** https://github.com/pgvector/pgvector — HNSW vs IVFFlat, index parameters, filtering-with-vector-search pitfalls, `halfvec`/quantization. Start here rather than a dedicated vector DB. *(6–8 h)*
- **Reranking:** cross-encoder rerankers (Cohere Rerank, bge-reranker, Jina). Working default: **retrieve 20 → rerank to 5 → send 3–5 to the model.** *(4 h)*
- **Query rewriting / routing:** HyDE, multi-query expansion, query classification into retrievers. Covered in Jason Liu's material. *(4–5 h)*
- **Failure modes to memorise:** retrieval miss (answer not in top-k); reranker inversion; chunk boundary severing the answer; lost-in-the-middle; stale index; metadata filter excluding the right doc; the model ignoring retrieved context in favour of parametric memory; unanswerable questions answered anyway.

**Evals plug-in point:** RAG is the module where evals stop being optional. You need **retrieval metrics (recall@k, MRR, nDCG) measured separately from generation metrics (faithfulness, answer relevance)** — the two failure classes need different fixes. The evals track owns the methodology; know that the split exists.

**Done when you can:**
- Build a synthetic eval set from your own corpus and report recall@k before you touch any generation code.
- Show a table of retrieval quality across ≥4 configurations (naive / +hybrid / +contextual chunks / +reranker) with the cost and latency of each.
- Diagnose a wrong answer as a *retrieval* failure or a *generation* failure in under five minutes, with evidence.
- Explain when long-context beats RAG and when it doesn't, in cost terms.

---

## Module 7 — Agents *(50–65 h)*

**Objectives:** know when an agent is the wrong answer; build a reliable single agent; design tools; speak MCP at the current spec; place humans in the loop correctly; resist multi-agent cargo-culting.

**Resources — read in this order:**
1. **Anthropic, *Building effective agents*** (19 Dec 2024) — https://www.anthropic.com/engineering/building-effective-agents — workflows (prompt chaining, routing, parallelisation, orchestrator-workers, evaluator-optimiser) vs true agents; "find the simplest solution possible, and only increase complexity when needed." *(3 h)*
2. **OpenAI, *A Practical Guide to Building Agents*** (2025, 34pp) — https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf — the when-to-build test, single vs manager vs decentralised, seven guardrail types. *(3 h)*
3. **Anthropic, *How we built our multi-agent research system*** (13 Jun 2025) — https://www.anthropic.com/engineering/built-multi-agent-research-system *(2 h)*
4. **Cognition (Walden Yan), *Don't Build Multi-Agents*** (Jun 2025) — https://cognition.com/blog/dont-build-multi-agents — the counter-case: dispersed decision-making, context not shared thoroughly, conflicting implicit decisions. *(1 h)*
5. **Walden Yan, *Multi-Agents: What's Actually Working*** (Apr 2026) — https://x.com/walden_yan/status/2047054401341370639 — the 2026 reconciliation: multiple agents may contribute intelligence, but **writes stay single-threaded.** *(1 h)*
   - **Read 3–5 as one argument.** The synthesis both sides reach: *context engineering is the whole game*; parallelise reading, serialise writing. This is the most important judgement call in Module 7 and the thing that separates people who ship agents from people who demo them.
6. **Hugging Face Agents Course** — https://huggingface.co/learn/agents-course — Units 1–4 + bonus unit 2 (observability & evaluation). Hands-on across smolagents, LlamaIndex, LangGraph; free certification; 200k+ certifications issued by mid-2026. *(20–30 h)*
7. **MCP:** read the **2026-07-28 changelog first** — https://modelcontextprotocol.io/specification/2026-07-28/changelog — then build one server and one client. The stateless core, header-based routing, cacheable list results, and CIMD-based client registration are all new; **anything written before Aug 2026 teaches the old session model.** *(8–10 h)*
8. **Anthropic, *Code execution with MCP*** (4 Nov 2025) — https://www.anthropic.com/engineering/code-execution-with-mcp — the pattern for when tool definitions stop fitting in context. *(2 h)*
9. **Claude Agent SDK** — https://docs.claude.com/en/docs/agent-sdk/ + https://github.com/anthropics/claude-agent-sdk-python — Agent Skills, tool search, subagents, permission modes. Build one real agent with it. *(8–10 h)*
10. **Optional:** Berkeley Agentic AI MOOC (https://agenticai-learning.org/f25) for the research view; Google ADK (https://github.com/google/adk-python, v2.0 GA Jun 2026) only if GCP-bound.

**Human-in-the-loop:** design for it explicitly — approval gates on irreversible actions, least-privilege tool scopes, and a "what did the agent actually do" audit trail. OWASP 2026 elevated **excessive agency from #6 to #3**; this is the mitigation.

**Done when you can:**
- Argue both sides of the multi-agent question and state your own position with a concrete decision rule.
- Take a business process and correctly classify it as: no LLM / a workflow / a single agent / multi-agent — and defend it.
- Ship a single agent with 5+ tools that completes a multi-step task reliably, with retries, a turn budget, and an approval gate on writes.
- Write an MCP server against the 2026-07-28 spec and explain what changed from the stateful model.
- Explain why your tool descriptions look the way they do, citing specific failures you observed.

---

## Module 8 — Production concerns *(30–40 h)*

**Objectives:** see what your system is doing; keep it safe; keep it cheap.

### 8a. Observability and tracing *(10–12 h)*
- **OpenTelemetry GenAI semantic conventions** — https://opentelemetry.io/blog/2026/genai-observability/ — the emerging standard covering LLM spans, agent orchestration, MCP tool calls, content capture. **Status caveat: most GenAI conventions were still experimental as of March 2026**, though adopted by Google Cloud, AWS, Azure, Datadog and others. Build on OTel to avoid lock-in.
- **Langfuse** (https://langfuse.com/docs/observability/overview) — open-source, framework-agnostic, strong on operational telemetry, cost analytics and prompt management. Good default.
- **Arize Phoenix** (https://docs.arize.com/phoenix) — OTel-native, strong on RAG evaluation.
- **LangSmith** — best if you're already LangChain/LangGraph-native.
- **Know the lock-in trap:** several vendors use proprietary trace formats. Prefer OTel-exporting tools.
- **Done when you can:** trace a single user request through retrieval, reranking, 3 tool calls and generation, and attribute latency and cost to each span.

### 8b. Security and prompt injection *(10–14 h)*
- **OWASP Top 10 for LLM Applications, 2026 edition** — https://genai.owasp.org/ — **prompt injection remains #1**; **excessive agency moved #6 → #3**; **unbounded consumption #10 → #6**; *system prompt leakage* broadened and renamed **hidden context exposure**. The 2026 framing: **the job shifts from prevention to containment.**
- Core defence posture: defense-in-depth; **least-privilege tooling**; input/output filtering; **human approval for high-risk actions**; guardrails enforced *outside* the model so critical controls hold regardless of what the prompt says; regular adversarial testing.
- The structural fact to internalise: LLMs process instructions and untrusted content in the same context. There is no prompt that fixes this. Architecture fixes it.
- Practical reading: Simon Willison's prompt-injection archive — https://simonwillison.net/tags/prompt-injection/ — the longest-running practitioner record of real attacks, including the "lethal trifecta" framing (private data + untrusted content + external communication).
- **Done when you can:** red-team your own agent and find at least one working injection; then re-architect so that the injection succeeds but cannot cause harm.

### 8c. Guardrails *(4–6 h)*
- OpenAI's seven guardrail types (in the agents guide): relevance, safety, PII filter, moderation, tool risk rating, rules-based protections, output validation.
- Implementations: NeMo Guardrails (https://github.com/NVIDIA/NeMo-Guardrails), Guardrails AI (https://www.guardrailsai.com/docs), Llama Guard, provider-side moderation endpoints.

### 8d. Cost control *(6–8 h)*
- Levers in rough order of impact: **prompt caching** → **output-token discipline** (short outputs, structured schemas) → **model routing** (small model first, escalate) → **batch API** for async work → **caching semantically similar requests** → **quantized self-hosting** at sustained volume.
- Chip Huyen, *AI Engineering* Ch. 9–10.
- **Done when you can:** produce a per-feature cost dashboard and cut unit cost by ≥50% without a measurable quality regression *(the "without regression" clause is what makes evals non-optional)*.

**Evals plug-in point across Module 8:** observability without evals is a very expensive log viewer. Traces become useful when you sample from them into an eval set. That handoff — trace → labelled dataset → offline eval → CI gate → online monitoring — is the seam between this track and the evals track. Anthropic's *Demystifying evals for AI agents* (9 Jan 2026, https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) is the right one-page bridge to read here.

---

## Capstone *(40–60 h) — do this, it is the hiring artefact*

Build **one** system that exercises Modules 3–8 together, and write it up publicly.

Suggested shape: a domain-specific agent over a real corpus you care about —
- retrieval with hybrid search + contextual chunking + reranking, on pgvector;
- a fine-tuned small model for one narrow sub-task (classification/routing/extraction), served on vLLM, where you show the fine-tune beat prompting on a held-out set;
- an agent loop with 5+ tools, at least one exposed over MCP (2026-07-28 spec), with an approval gate;
- full OTel tracing into Langfuse, a cost dashboard, and a CI eval gate;
- a written post covering one failure mode in depth, with numbers.

**Done when:** a stranger can read your repo README, understand the architecture, see the eval numbers, and reproduce the demo. That artefact is worth more than every certificate on this list combined.

---

# Honest accounting

| Module | Hours |
|---|---|
| 0. Orientation | 4–6 |
| 1. Transformers from scratch | 70–90 *(45 in the lean lane)* |
| 2. Modern architecture & post-training | 45–60 |
| 3. Fine-tuning in practice | 35–45 |
| 4. Inference & serving | 30–40 |
| 5. Prompting & context engineering | 25–30 |
| 6. RAG | 35–45 |
| 7. Agents | 50–65 |
| 8. Production concerns | 30–40 |
| Capstone | 40–60 |
| **Total** | **364–481 h** |

**At 10 hrs/week: 36–48 weeks. At 15 hrs/week: 24–32 weeks.** Realistically, with life happening: **9–12 months** to genuinely reach "can build, adapt, deploy and reason about LLM applications and agents in production."

**Money:** the whole path can be walked for **$0 in tuition** plus roughly **$150–400 in GPU rental** (nanochat runs, fine-tuning experiments, vLLM load tests) and **~$150 in books** (Raschka ×2, Huyen). The $4,200 Maven evals course and the $7,875 CS336 credit option are both genuinely good and both genuinely optional.

**The compression that actually works if 9 months is too long:** run the lean lane of Module 1 (45h), skip CS336 A3/A5, skip the reasoning-model book, and go Modules 5 → 7 → 6 → 8 → 4 → 3. That is ~200 hours (~4–5 months at 12 hrs/wk) and gets you to "competent LLM application engineer." What you'd be trading away is the ability to reason about pretraining and post-training decisions — which is precisely the thing that separates this learner's MSc background from the bootcamp crowd, and precisely why Karpathy-first was the right instinct.
