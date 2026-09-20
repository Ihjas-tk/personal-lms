# What AI and Data Science Skills Employers Are Actually Hiring and Paying For (2026)

**Compiled:** 2026-09-18. Evidence cut-off: sources published through September 2026.

**How to read this.** Two different things get conflated in most "top AI skills" lists:

- **Mention frequency** — how often a skill appears in job postings. Measured by Lightcast (used by the Stanford AI Index), Indeed Hiring Lab, and ITJobsWatch. This tells you what gets you screened *in*.
- **Pay premium** — whether postings carrying that skill advertise more money, controlling (or not) for role. Measured by PwC, Lightcast, Dice, and inferable from ITJobsWatch medians. Much thinner evidence, and the headline numbers disagree by a factor of ~3.5x (see §4).

Where I only have mention-frequency evidence, I say so. Where the only source is a content-marketing blog or a niche job board, I label it **[weak]** and do not build conclusions on it.

**The single most important structural fact for 2026:** hiring has shifted from *models* to *deployment*. The Stanford AI Index 2026's Lightcast analysis shows the fastest-growing skills inside AI postings are not modelling skills — they are scalability (+733%), workflow management (+818%), automation (+610%) and AWS (+1,358%) — while the chat-era vocabulary (ChatGPT, chatbot, conversational AI) is losing share to agentic vocabulary. ([AI Index 2026, Ch.4, pp.205–208](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf))

---

## 1. Top 15 skills ranked by demand

Ranking is by **posting frequency**, primarily from the Stanford AI Index 2026 Economy chapter (Lightcast data, US, calendar 2025, n = billions of postings since 2010). Counts are **number of US AI job postings citing the skill in 2025**; one posting can list many skills. Growth "% vs 2013–15" is against the AI Index's decade baseline; "% vs 2024" is year-over-year.

| # | Skill | Demand evidence | Premium evidence |
|---|---|---|---|
| 1 | **Python** | **258,674** US AI postings in 2025, the single most-cited specialized skill; +391% vs 2013–15, +~30% vs 2024 ([AI Index 2026 Ch.4 Fig 4.4.4](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). UK: 6,785 permanent ads, 5.89% of all UK IT jobs, 36.2% of all programming-language postings ([ITJobsWatch, 6mo to 18 Sep 2026](https://www.itjobswatch.co.uk/jobs/uk/python.do)). 93.4% of LangChain-ecosystem postings require it **[weak — niche job board]** ([agentic-engineering-jobs.com, 2026](https://agentic-engineering-jobs.com/langchain-job-market-2026)). | **Negative on its own.** UK median £70,000, *down 3.45% YoY*, rank fell 9 places. Python is table stakes, not a differentiator — it prices at the market, and the premium sits in what you build with it. |
| 2 | **Cloud/platform engineering (AWS first)** | **AWS: 142,037** US AI postings, **+1,358%** vs 2013–15 — the largest decade growth of any top-10 skill ([AI Index 2026 Fig 4.4.4](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). Kubernetes in 27.2% of LangChain-ecosystem postings **[weak]**. | Indirect. AI Index frames this as "AI's transition from experimental technology to business infrastructure." No clean per-skill premium figure found for AWS-in-AI-roles. |
| 3 | **Production systems / scalability** | **197,744** postings, **+733%** ([AI Index 2026 Fig 4.4.4](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). Third-most-cited specialized skill in AI postings, ahead of SQL and data science. | No direct per-skill premium data. Proxy: Levels.fyi ML Engineer median TC $280k vs AI Engineer $153,750 — the gap is largely production-systems depth and employer mix (§2). |
| 4 | **Workflow management & automation** | **Workflow management 186,325 (+818%)**, **automation 190,758 (+610%)** ([AI Index 2026 Fig 4.4.4](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). Together the fastest-rising non-cloud cluster. | None found directly. |
| 5 | **Machine learning fundamentals** | ML skill cluster appears in **0.99% of *all* US job postings** (2nd only to the broad "artificial intelligence" cluster at 1.70%) ([AI Index 2026 Fig 4.4.3](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). UK: 2,459 ads, 2.13% of all UK IT jobs ([ITJobsWatch](https://www.itjobswatch.co.uk/jobs/uk/machine-learning.do)). Lightcast reports Data Engineers and Data Scientists show the highest growth in AI-skill requirements across most of its 16 markets ([Global AI Skills Outlook](https://lightcast.io/resources/research/the-lightcast-global-ai-skills-outlook)). | UK median £77,500, **down 3.13% YoY**, rank down 29. Like Python: broad, commoditizing. |
| 6 | **SQL** | **151,191** US AI postings, +132% ([AI Index 2026 Fig 4.4.4](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). UK: 6,546 ads, 5.68% of UK IT jobs ([ITJobsWatch](https://www.itjobswatch.co.uk/jobs/uk/sql.do)). Co-occurs in 67.6% of dbt postings. | UK median £57,500, **flat YoY** — the lowest median of any skill in this table. Pure hygiene skill: you cannot get hired without it and you are not paid for it. |
| 7 | **Generative AI / LLM application work** | GenAI cluster = **0.41% of all US postings**. Within AI postings: "generative AI" **138,188 (+111% YoY)**; "large language modeling" **38,526 (+102%)** ([AI Index 2026 Figs 4.4.3, 4.4.5](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). UK: 982 ads, 0.85% of UK IT jobs ([ITJobsWatch](https://www.itjobswatch.co.uk/jobs/uk/generative-ai.do)). | **Cooling.** GenAI's *share* of AI postings fell 5% (66.08% → 62.62%) even as absolute counts doubled; LLM share fell 9%. UK GenAI median £82,500, **down 2.94% YoY**, rank down 84. Generic "GenAI" is past peak differentiation. |
| 8 | **Agentic AI / AI agents / multi-agent systems** | The standout growth story. AI-agent cluster went **0.06% → 0.23% of all US postings in one year (+280%, ~90,000 postings)** ([Lightcast on AI Index 2026](https://lightcast.io/resources/blog/stanford-ai-2026)). Within AI postings: "agentic AI" **16,541 (+10,854%)**, "AI agents" **15,217 (+1,062%)**, "multi-agent systems" **5,461 (+234%)**, "agentic systems" **2,850 (+1,384%)** ([AI Index 2026 Fig 4.4.7](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). Agentic AI is now the **#1 AI-agent skill by share (18.90% of AI postings)**, having displaced ChatGPT (16.43%, share −35%). | No isolated premium figure. Strong indirect signal: LinkedIn ranks AI Engineer — whose named top skills are LangChain/RAG/PyTorch — the **#1 fastest-growing US job of 2026** ([LinkedIn Jobs on the Rise 2026](https://www.linkedin.com/pulse/linkedin-jobs-rise-2026-25-fastest-growing-roles-us-linkedin-news-dlb1c)). |
| 9 | **Data analysis & data science method** | Data analysis **170,396 (+210%)**; data science **142,120 (+431%)** ([AI Index 2026 Fig 4.4.4](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). Indeed: **~45% of data & analytics postings now contain AI terms** — the highest of any occupational group, vs ~20% for software development, 14.9% marketing, 8.8% HR ([Indeed Hiring Lab, 22 Jan 2026](https://hiringlab.indeed.com/2026/01/22/january-labor-market-update-jobs-mentioning-ai-are-growing-amid-broader-hiring-weakness/)). | Levels.fyi US Data Scientist median TC **$180,000** (p25 $135k, p75 $252k) as of 18 Sep 2026 ([Levels.fyi](https://www.levels.fyi/t/data-scientist)). Levels.fyi 2025 report: DS pay **+2.92% YoY** — below the SWE average of +2.67%… roughly flat in real terms ([Levels.fyi 2025](https://levels.fyi/2025)). |
| 10 | **RAG (retrieval-augmented generation)** | **12,609** US AI postings, **+337% YoY**; share of AI postings rose 2.91% → **5.71% (+96%)** — one of only three GenAI skills gaining share ([AI Index 2026 Figs 4.4.5–4.4.6](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). Named by LinkedIn as a top-3 skill for the #1 fastest-growing US role ([LinkedIn Jobs on the Rise 2026](https://www.linkedin.com/pulse/linkedin-jobs-rise-2026-25-fastest-growing-roles-us-linkedin-news-dlb1c)) and as an accelerating skill in [Skills on the Rise 2026](https://news.linkedin.com/2026/Skills-on-the-rise-2026). | None isolated. |
| 11 | **Prompt / context engineering (as an embedded skill)** | Prompt engineering **22,227 postings (+261% YoY)**; share of AI postings 6.20% → **10.07% (+62%)**. Context engineering went from **9 postings to 703 (+7,711%)** — the largest proportional jump in the dataset, off a near-zero base ([AI Index 2026 Fig 4.4.5](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). LinkedIn lists prompt engineering under its #1 rising skill family ([Skills on the Rise 2026](https://news.linkedin.com/2026/Skills-on-the-rise-2026)). | **The title is dying while the skill spreads** — see §4. No premium data for the skill in isolation. |
| 12 | **Data platform tooling (Databricks / Snowflake / Spark)** | UK, 6mo to 18 Sep 2026: Databricks 1,015 ads (0.88% of UK IT jobs); Snowflake 527 (0.46%) ([ITJobsWatch: [Databricks](https://www.itjobswatch.co.uk/jobs/uk/databricks.do), [Snowflake](https://www.itjobswatch.co.uk/jobs/uk/snowflake.do)]). PySpark named an accelerating skill by [LinkedIn Skills on the Rise 2026](https://news.linkedin.com/2026/Skills-on-the-rise-2026). | **The clearest positive premium signal in the UK data.** Databricks median £85,000, **+13.33% YoY**; Snowflake £90,000, **+12.50% YoY** — both well above the Python (£70,000) and ML (£77,500) medians, and both *rising* while those fall. |
| 13 | **MLOps / model deployment** | UK: 401 ads (0.35% of UK IT jobs), up from 234 a year earlier ([ITJobsWatch](https://www.itjobswatch.co.uk/jobs/uk/mlops.do)). Named a top-3 skill for LinkedIn's #2 fastest-growing role, AI Consultant/Strategist ([Jobs on the Rise 2026](https://www.linkedin.com/pulse/linkedin-jobs-rise-2026-25-fastest-growing-roles-us-linkedin-news-dlb1c)). | Mixed. UK median £82,000 (above ML and Python) but **−8.89% YoY** in London; +24.02% *outside* London. Reads as the skill diffusing out of the premium metro market. |
| 14 | **Agent frameworks (LangGraph, LangChain)** | **LangGraph: 4,294 US AI postings (+2,113% YoY)**, share of AI postings 0.89% → **4.91% (+454%)** — explicitly called out in the AI Index text as displacing chat-tooling vocabulary ([AI Index 2026 Fig 4.4.7 and p.205](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). UK LangChain ads **tripled 78 → 251** ([ITJobsWatch](https://www.itjobswatch.co.uk/jobs/uk/langchain.do)). Also: Microsoft Copilot 6,395 (+352%) and Copilot Studio 3,366 (+513%) — the enterprise-agent track is real and underrated. | UK LangChain median **£82,000, +9.33% YoY** — above the ML median and rising. This is one of the few places where frequency *and* pay both point up. (A niche job board claims LangChain-tagged roles pay $80k *less* than framework-agnostic ones — **[weak]**, single unverified source, contradicts ITJobsWatch; see §4.) |
| 15 | **AI governance, trust, evaluation** | **Smallest base, strongest price signal.** AI ethics/governance cluster is only **0.05% of all US postings** ([AI Index 2026 Fig 4.4.3](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)) — but Lightcast's "trustworthiness" skill grew **>6,000% since Q1 2022**, and AI-governance skill demand reportedly grew 150% YoY on LinkedIn **[weak — secondary]** ([Axial Search, 2026](https://axialsearch.com/insights/ai-governance-jobs)). Corroborated by practitioner survey: 71% of data professionals cite hallucinated outputs reaching stakeholders as a top concern, yet only 24% prioritize AI-assisted pipeline validation ([dbt Labs, 2026 State of Analytics Engineering, Apr 2026](https://www.getdbt.com/resources/state-of-analytics-engineering-2026)). | **The largest single-skill premium move on record in this dataset:** median advertised salary for AI jobs requiring "trustworthiness" rose from a *below-average* **$84.4k (2022)** to an *above-average* **$181.1k (2025)** ([Lightcast, Emerging skills in AI jobs](https://lightcast.io/resources/blog/emerging-skills-in-ai-jobs)). |

**Just outside the top 15, with real evidence:** NLP (0.22% of all postings), neural networks (0.20%), computer vision (named top-3 skill for both AI Consultant and AI/ML Researcher by LinkedIn), autonomous driving (0.14%), robotics (0.08%), and — the genuine dark horse — **non-technical coordination skills**. Lightcast's analysis of emerging skills *inside AI jobs* through April 2026 finds the top absolute-growth skills are cross-functional collaboration, stakeholder management, operational efficiency/excellence and AI infrastructure, with cross-functional collaboration roughly doubling between Q2→Q3 2025 and again Q3→Q4 2025 ([Lightcast](https://lightcast.io/resources/blog/emerging-skills-in-ai-jobs)). PwC independently finds that skills required for the most AI-exposed jobs are changing **more than twice as fast** as for the least-exposed, with rising emphasis on judgement, creativity and leadership ([PwC 2026 Global AI Jobs Barometer, 15 Jun 2026](https://www.pwc.com/gx/en/news-room/press-releases/2026/pwc-2026-ai-jobs-barometer.html)).

**Explicitly thin or absent evidence:**
- **Vector databases (Pinecone, Weaviate, pgvector):** LinkedIn names "vector databases" as an accelerating skill ([Skills on the Rise 2026](https://news.linkedin.com/2026/Skills-on-the-rise-2026)), but I found **no primary posting-count or salary source**. The only frequency figures (Pinecone 18.8%, Weaviate 16.0% of LangChain-ecosystem jobs) come from a single niche job board **[weak]**.
- **MCP (Model Context Protocol):** no primary labour-market source has it as a tracked skill. It does not appear in the AI Index's Lightcast taxonomy breakouts. Everything found was job-board aggregation or vendor content. **Treat claims about MCP hiring demand as unevidenced as of Sept 2026.**
- **AI evals as a distinct discipline:** anecdotally concentrated at frontier labs; no posting-frequency series exists. The Lightcast "trustworthiness" series (row 15) is the closest usable proxy.
- **Rust for AI:** no evidence of AI-specific Rust demand. UK Rust ads *fell* from 401 to 273 and median pay fell 10% to £90,000 ([ITJobsWatch](https://www.itjobswatch.co.uk/jobs/uk/rust.do)). Rust remains well paid and niche; nothing connects it to the AI hiring wave.
- **Statistics / experimentation / A-B testing:** no 2025–26 posting-frequency or premium source found. I could not substantiate either growth or decline. Genuinely unknown.

---

## 2. Role landscape

Compensation is US total compensation from Levels.fyi as of 18 Sep 2026 (self-reported, skews senior and big-tech — treat as upper-bound). Demand trend blends Lightcast/AI Index, Indeed and LinkedIn.

| Role | Demand trend | Median US TC | Key skills (evidenced) |
|---|---|---|---|
| **AI Engineer (applied/product)** | **Strongest growth of any role.** LinkedIn's **#1 fastest-growing US job of 2026**; postings reportedly +143% YoY in 2025. Median 3.7 years prior experience — a mid-level, not senior, entry point. 26.2% remote / 27.1% hybrid. Top cities SF, NYC, **Dallas**. | **$153,750** (p25 $110k, p75 $215k, p90 $300k) — [Levels.fyi](https://www.levels.fyi/t/software-engineer/title/ai-engineer) | LangChain, RAG, PyTorch ([LinkedIn Jobs on the Rise 2026](https://www.linkedin.com/pulse/linkedin-jobs-rise-2026-25-fastest-growing-roles-us-linkedin-news-dlb1c)) |
| **ML Engineer** | Growing; absorbing work formerly labelled data science. Gartner reportedly names AI/ML engineer the most in-demand role for 2026 **[weak — secondary]**. Levels.fyi 2025 report: "AI/ML is now core engineering… one of the largest and highest-paid SWE tracks." | **$280,000** (p25 $200k, p75 $384k, p90 $498k) — [Levels.fyi](https://www.levels.fyi/t/software-engineer/title/machine-learning-engineer). Apple median $386k; Nvidia $261k. | Python, PyTorch, scalability, MLOps, cloud |
| **Data Scientist** | **The contested one.** Title volume is declining and the generalist role is splitting into analytics on one side and production ML/AI on the other. Counter-evidence: BLS projects 245,900 (2024) → 328,300 (2034), +33.5%; and Lightcast finds Data Scientists among the *highest* growth in AI-skill requirements. Reconciliation: the occupation is growing, the *title* is losing share to AI/ML Engineer. | **$180,000** (p25 $135k, p75 $252k) — [Levels.fyi](https://www.levels.fyi/t/data-scientist). **+2.92% YoY in 2025**, i.e. roughly flat real. | SQL, Python, data analysis, statistics, increasingly GenAI (~45% of data & analytics postings mention AI) |
| **Data Engineer** | Solid, quietly strong. Lightcast: Data Engineers show the **highest growth in AI-skill requirements** across most of its 16 markets ([Global AI Skills Outlook](https://lightcast.io/resources/research/the-lightcast-global-ai-skills-outlook)). Demand relative to supply reportedly the tightest in data **[weak]**. Junior/mid tier is where the contraction hit. | **~$170,000** (data-focused SWE) — [Levels.fyi](https://www.levels.fyi/t/software-engineer/focus/data) | SQL, Python, Spark/PySpark, Databricks, Snowflake, Airflow |
| **Analytics Engineer** | **Evidence genuinely thin.** No primary posting-count series found. Indirect and negative: UK dbt ads roughly flat (304→315) while dbt median pay fell 31.97% to £74,830 ([ITJobsWatch](https://www.itjobswatch.co.uk/jobs/uk/dbt.do)); Airflow ads fell to 232 with median pay −36.36%. dbt Labs' own 2026 survey shows warehouse/compute spend rising (57%) far faster than team budgets (36%). Reads as **tooling commoditizing, headcount not growing.** | No reliable figure | dbt, SQL (67.6% co-occurrence), Python (62.9%), analytics |
| **MLOps / AI Platform** | Growing in volume, flattening in price. UK ads 234→401 YoY, but London median −8.89% while non-London +24.02% — diffusion out of the premium market. | No isolated figure | Kubernetes, cloud, CI/CD, model serving, observability |
| **AI Consultant / Strategist** | **LinkedIn's #2 fastest-growing US role.** Median **8.2 years** prior experience — decisively senior. 30.3% remote. Matches Lightcast's finding that >50% of AI-skill postings sit outside IT/CS. | No isolated figure | LLMs, MLOps, computer vision |
| **AI/ML Research Scientist** | **#5 fastest-growing** on LinkedIn, but the *least* remote-friendly AI role at **16% remote** and concentrated in SF/NYC/Boston. Median 3.0 years prior experience. | Not separately tracked; overlaps ML Engineer band | PyTorch, deep learning, computer vision |
| **Data Annotator / AI Trainer** | **#4 fastest-growing on LinkedIn** — a genuine surprise, and the counter-narrative to "AI destroys entry-level work." Indeed identifies "AI training & content creation" as one of three clusters driving AI-title expansion into non-tech occupations. Listed top skills are *content*, not code: SEO copywriting, content marketing, content production. | Not tracked; broadly low | Domain expertise, content production |
| **AI Product Manager** | Steady. ~12,400 US postings since Jan 2026, median advertised **$194,000**, but **only 2% entry-level** — **[weak, single source]** ([Axial Search](https://axialsearch.com/insights/ai-product-jobs)). | ~$194k advertised **[weak]** | Product + LLM literacy |
| **AI Governance / Risk** | High growth on a tiny base (0.05% of all US postings). Median ~$169k reported **[weak]**. | ~$169k **[weak]** | Policy, risk, evaluation, "trustworthiness" (see §1 row 15) |
| **Datacenter Technician** | **#17 on LinkedIn's list, and 3.6% remote.** Indeed separately flags surging postings for data-centre build-out roles. The physical AI supply chain is hiring, and almost nobody's skills list mentions it. | Not tracked | Data center infra/ops, cabling |

### Entry-level vs senior — the sharpest finding in this whole report

The seniority skew is more extreme than the skills story and better evidenced:

- **Software development postings in Q1 2026 were 69.3% senior-level and 4.5% entry-level** ([Indeed Hiring Lab, 23 Jul 2026](https://hiringlab.indeed.com/2026/07/23/the-labor-market-is-tilting-toward-seniority/)). Across all US postings, senior +14.7% YoY vs entry-level −7.5% YoY (May 2026). In tech 2019→2025, senior share grew ~9pp while mid-level fell 7.7pp.
- **71% of the increase in software development postings May 2025 → May 2026 came from senior roles; 37% from roles with AI in the title** ([Indeed Hiring Lab, 8 Jul 2026](https://hiringlab.indeed.com/2026/07/08/ai-and-job-postings-from-destruction-to-creation/)).
- **Employment for software developers aged 22–25 fell ~20% from its 2022 peak by September 2025**; employment for 22–25-year-olds in the most AI-exposed occupations fell ~16% relative to the least-exposed, with the gap widening from mid-2024 ([AI Index 2026 Ch.4 pp.221–222](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf), citing Brynjolfsson et al. 2025).
- **PwC**, analysing 2.4m US entry-level roles: AI-exposed entry-level jobs are **7x more likely** to demand traditionally senior skills (leadership, strategic decision-making). Entry-level roles that got "seniorised" grew **+35% since 2019**; the rest **declined 10%** ([PwC, 15 Jun 2026](https://www.prnewswire.com/news-releases/ai-reshapes-global-labour-market-into-two-distinct-paths-rewarding-human-skills-pwc-2026-global-ai-jobs-barometer-302798987.html)).
- **Counter-signal:** LinkedIn's #1 and #5 fastest-growing roles (AI Engineer, AI/ML Researcher) have median prior experience of just **3.7 and 3.0 years**. AI-specific roles are more junior-accessible than general software roles in 2026. India corroborates: Naukri reports AI/ML demand at 0–3 years' experience growing 15% YoY.

### Geography

| Market | Evidence |
|---|---|
| **US** | AI skills in **2.5–2.6% of all postings** (2025), +55% YoY, +297% vs a decade ago ([AI Index 2026](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). Concentration: **CA 170,881 postings (17.2%), TX 80,547 (8.1%), NY 66,029 (6.6%)** — a third of the national total. But CA's share has fallen from >25% (2012) to 17.9%. By *density*: **Washington DC 6.2%, Delaware 4.4%**. Note Dallas as a top-3 AI Engineer city on LinkedIn. |
| **Global leaders** | Singapore **4.77%**, Hong Kong ~3.5%, Luxembourg 3.4%, Spain 3.3%, US 2.6% ([AI Index 2026 Fig 4.4.1–2](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)). |
| **EU** | Materially behind: Belgium 1.36%, Italy 1.33%, **Germany 1.13%, Netherlands 1.04%, France 0.99%**, Austria 0.84%, Croatia 0.38%. Switzerland 1.59%. By AI-touched job *titles*, Germany leads Europe (288) ahead of the UK (160), France (138), NL (84), Spain (81) ([Indeed Hiring Lab, 8 Jul 2026](https://hiringlab.indeed.com/2026/07/08/ai-is-no-longer-just-a-tech-occupation-story/)). |
| **India** | **The strongest growth market by a distance.** AI/ML hiring **+31% YoY in August 2026** against +14% for white-collar hiring overall; **Hyderabad +48%, Mumbai +36%, Bengaluru/Chennai/Pune +31% each**; GCC hiring +10% ([Naukri JobSpeak, via ANI, 8 Sep 2026](https://aninews.in/news/business/aiml-hiring-rises-31-pc-yoy-in-august-gcc-recruitment-grows-10-pc-naukri-jobspeak20260908113325/)). Earlier 2026 months ran +25% (Jun) and +33% (Jul). High-end demand is real: roles paying >₹30 LPA grew 27% YoY in May 2026. |
| **Remote** | AI roles are **not** notably remote-friendly. LinkedIn: AI Engineer 26.2% remote, AI Consultant 30.3%, **AI/ML Researcher just 16%**, Datacenter Technician 3.6% ([Jobs on the Rise 2026](https://www.linkedin.com/pulse/linkedin-jobs-rise-2026-25-fastest-growing-roles-us-linkedin-news-dlb1c)). |

---

## 3. Tools and frameworks: frequency and price

**US column** = number of 2025 US AI job postings citing the skill, from the Stanford AI Index 2026 / Lightcast (Figs 4.4.4, 4.4.5, 4.4.7). **UK columns** = ITJobsWatch, 6 months to 18 Sep 2026, permanent postings.

| Tool / concept | US AI postings 2025 | YoY / decade growth | UK ads | UK median | UK salary YoY |
|---|---|---|---|---|---|
| Python | 258,674 | +391% (vs 2013–15) | 6,785 | £70,000 | **−3.45%** |
| AWS | 142,037 | **+1,358%** | — | — | — |
| SQL | 151,191 | +132% | 6,546 | £57,500 | 0.00% |
| Machine learning (concept) | 0.99% of all postings | — | 2,459 | £77,500 | −3.13% |
| Generative AI (concept) | 138,188 | +111% YoY | 982 | £82,500 | −2.94% |
| Large language modeling | 38,526 | +102% YoY | — | — | — |
| Prompt engineering | 22,227 | +261% YoY | — | — | — |
| **Agentic AI** | **16,541** | **+10,854% YoY** | — | — | — |
| **AI agents** | 15,217 | +1,062% YoY | — | — | — |
| ChatGPT | 14,376 | +160% count, **share −35%** | — | — | — |
| RAG | 12,609 | **+337% YoY** | — | — | — |
| Conversational AI | 6,976 | +28% count, **share −68%** | — | — | — |
| Microsoft Copilot | 6,395 | +352% YoY | — | — | — |
| Multi-agent systems | 5,461 | +234% YoY | — | — | — |
| Chatbot | 4,596 | +98% count, **share −50%** | — | — | — |
| **LangGraph** | **4,294** | **+2,113% YoY** | — | — | — |
| Microsoft Copilot Studio | 3,366 | +513% YoY | — | — | — |
| Agentic systems | 2,850 | +1,384% YoY | — | — | — |
| Multimodal models | 1,459 | +137% YoY | — | — | — |
| Context engineering | 703 | **+7,711% YoY** (from 9) | — | — | — |
| Stable Diffusion | 699 | +11% YoY | — | — | — |
| Databricks | not broken out | — | 1,015 | **£85,000** | **+13.33%** |
| Snowflake | not broken out | — | 527 | **£90,000** | **+12.50%** |
| MLOps | not broken out | — | 401 | £82,000 | −8.89% (London) |
| dbt | not broken out | — | 315 | £74,830 | **−31.97%** |
| Rust | not broken out | — | 273 | £90,000 | −10.00% |
| LangChain | not broken out | — | 251 (from 78) | **£82,000** | **+9.33%** |
| Apache Airflow | not broken out | — | 232 | £70,000 | **−36.36%** |
| PyTorch | not broken out | — | 220 | **£85,000** | **+13.33%** |
| Vector DBs / MCP / evals | **no primary data** | — | — | — | — |

**Reading the UK column.** ITJobsWatch is a real posting census, but samples of 200–400 ads produce noisy medians — the dbt (−32%) and Airflow (−36%) swings are large enough to be partly sampling artefacts and should be read as "not rising," not as precise declines. The pattern that survives the noise: **platform skills (Databricks, Snowflake) and deep-learning/agent frameworks (PyTorch, LangChain) rising ~9–13%, while general-purpose languages and concepts (Python, SQL, ML, GenAI) are flat to slightly down.** That is consistent with the US picture: the generic AI skill is commoditizing; the specific production stack is not.

**Skill cluster shares of *all* US job postings, 2025** ([AI Index 2026 Fig 4.4.3](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)) — useful for calibrating how small most of this still is: artificial intelligence 1.70% · machine learning 0.99% · generative AI 0.41% · **AI agent 0.23%** · NLP 0.22% · neural networks 0.20% · autonomous driving 0.14% · visual image recognition 0.09% · robotics 0.08% · AI ethics/governance 0.05%.

**Sector concentration** ([AI Index 2026 Fig 4.4.9](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf)): Information **13.22%** of its postings mention AI skills (from 7.82%, +69%); professional/scientific/technical services 6.49%; finance & insurance 5.33% (+63%); manufacturing 4.66%; management of companies **3.28% (+102%)**; real estate 2.08% (+93%); wholesale trade 1.93% (+83%).

---

## 4. Surprises and contradictions

**1. The headline "AI share of postings" differs by 2.4x between the two best sources — and both are right.**
Lightcast/AI Index says **2.5–2.6%** of US postings (2025). Indeed says **4.2%** (Dec 2025) rising to **6.3%** (Aug 2026). The definitions differ fundamentally: Lightcast tags *skills* against a curated taxonomy; Indeed keyword-matches "machine learning / data science / artificial intelligence" **anywhere in the posting text**. Indeed's own analysis shows why this matters — **74% of its AI-mentioning postings say only "AI" with no specific skill, and ~25% have no discernible AI theme at all** ([Indeed Hiring Lab, 28 Oct 2025](https://hiringlab.indeed.com/2025/10/28/how-employers-are-talking-about-ai-in-job-postings/)). Use Lightcast for "what skills are demanded," Indeed for "how fast is AI language spreading." Do not quote them interchangeably.

**2. The wage-premium estimates disagree by ~3.5x.**

| Source | Premium | Base |
|---|---|---|
| [Dice 2025 Tech Salary Report](https://www.dice.com/hiring/recruitment/reports/dice-tech-salary-report/) | **17.7%** | Tech professionals working on AI vs tech peers who aren't |
| [Lightcast, Jul 2025](https://lightcast.io/resources/blog/beyond-the-buzz-press-release-2025-07-23) | **28%** (~$18k/yr) | Postings with AI skills vs without, 1.3bn postings |
| [PwC 2026, Jun 2026](https://www.prnewswire.com/news-releases/ai-reshapes-global-labour-market-into-two-distinct-paths-rewarding-human-skills-pwc-2026-global-ai-jobs-barometer-302798987.html) | **62%** (up from 57% in 2025) | Advertised wages, 1bn+ ads, 27 countries |

These are not reconcilable as stated — different bases, different controls, different geographies. The Dice number is the most conservative because it compares *within* tech (i.e., it nets out the composition effect of AI roles simply being senior, urban and in high-paying sectors). **The Dice 17.7% is the closest thing to a like-for-like premium; PwC's 62% is closer to an unconditional gap.** Anyone quoting "AI skills pay 56–62% more" without that caveat is overstating it. Note also that PwC's premium *rose* year over year (57%→62%) at the same time as UK medians for Python, SQL, ML and GenAI went flat-to-negative — the premium is concentrating in specific roles, not spreading.

**3. Levels.fyi says "AI Engineer" pays $126,000 LESS than "Machine Learning Engineer."**
AI Engineer median TC **$153,750**; ML Engineer **$280,000**; Data Scientist **$180,000** — all US, all as of 18 Sep 2026. This inverts the popular narrative that AI Engineer is the premium title. The most likely explanation is employer mix: "ML Engineer" submissions concentrate at big tech and frontier labs (Apple $386k, Nvidia $261k), while "AI Engineer" is a fast-spreading title now used broadly by non-tech employers building LLM features. **Self-reported data with different population mixes per title — treat as a composition warning, not proof that AI Engineer work pays badly.** But it does mean "become an AI Engineer" is not automatically the highest-paying move.

**4. Generative AI is losing share of AI postings even as its absolute count doubles.**
GenAI mentions rose +111% YoY to 138,188 — but its *share* of AI postings fell 5% (66.08% → 62.62%), and LLM share fell 9%. Meanwhile ChatGPT's share fell 35%, conversational AI 68%, chatbot 50%. The share gainers were prompt engineering (+62%), RAG (+96%), context engineering (+3,412%) and the whole agentic cluster. **Plain "GenAI experience" has already stopped being a differentiator; the market moved to orchestration in a single year.** ([AI Index 2026 Figs 4.4.5–4.4.8](https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf))

**5. Prompt engineering: the title is dying, the skill is metastasizing.**
Prompt engineering mentions rose +261% and the skill's share of AI postings rose 62% — while standalone "Prompt Engineer" job titles fell ~30–40% from their 2023 peak **[weak — secondary sources only]**. The work folded into AI Engineer, AI Trainer and AI Product roles. This is the clearest case in the data of **"mentioned in postings" ≠ "a job you can have."**

**6. The fastest-growing skills inside AI jobs are not technical.**
Lightcast's top absolute-growth emerging skills in AI postings through April 2026 are cross-functional collaboration, stakeholder management, operational efficiency/excellence and AI infrastructure — not modelling. And the biggest *pay* move belongs to "trustworthiness," where the median advertised salary went from $84.4k (2022, below average) to $181.1k (2025, above average) ([Lightcast](https://lightcast.io/resources/blog/emerging-skills-in-ai-jobs)). Corroborated independently by PwC's finding that AI-exposed roles increasingly demand judgement and leadership. **The uncomfortable implication: the marginal hire in an AI team in 2026 is being paid for organisational competence as much as technical.**

**7. Software engineering was destroyed then partly rebuilt — by AI, twice.**
Indeed's July 2026 analysis: from 2022–2026, more AI-exposed occupations saw steeper posting declines. Then the correlation **flipped**. US software development postings rose **+15% since late February 2025** while overall postings *fell 7%* — and Indeed explicitly notes the coincidence with agentic coding tool launches. But: 71% of that increase is senior roles, 37% is AI-titled roles, and software dev postings remain **~27.5% below February 2020** (Indeed's sector index sits at 74.4 in Aug 2026). **"Recovering" and "recovered" are very different claims here.**

**8. Practitioner adoption is racing ahead of practitioner trust, and hiring hasn't caught up.**
Stack Overflow 2025: 84% of developers use or plan to use AI tools, but **trust in AI output accuracy fell from 40% to 29%**, 46% actively distrust it, and only 3% "highly trust" AI-generated code ([survey.stackoverflow.co/2025/ai](https://survey.stackoverflow.co/2025/ai)). dbt Labs 2026: 72% of data teams prioritize AI-assisted *coding* but only **24% prioritize AI-assisted pipeline validation** — testing, observability, quality. That gap is the single clearest unarbitraged opportunity in the data: everyone is generating, almost nobody is being hired to verify.

**9. "AI jobs" are increasingly not tech jobs.**
63% of US AI-touched job titles in Q1 2026 are in non-tech occupations (Germany 59%, NL 58%, France/UK 54%; Spain is the exception at 64% still-tech). AI-touched US titles went 264 → 822 between Q1 2022 and Q1 2026, now 8.3% of all titles ([Indeed Hiring Lab, 8 Jul 2026](https://hiringlab.indeed.com/2026/07/08/ai-is-no-longer-just-a-tech-occupation-story/)). Lightcast put >50% of AI-skill postings outside IT/CS as far back as 2024.

**10. Two sources contradict on LangChain's pay.** ITJobsWatch UK shows LangChain median £82,000, **+9.33% YoY**, ads tripled. A niche job-board analysis claims LangChain-tagged roles pay ~$80k *less* than framework-agnostic AI roles. The latter is a single unverified source with no stated methodology; I weight ITJobsWatch and the AI Index's LangGraph surge (+2,113%) far more heavily. But there is a plausible mechanism behind the claim worth watching: framework-specific tagging may correlate with more junior, more integration-flavoured work.

**11. What I could not verify.** The **Stack Overflow 2026 Developer Survey results are not published** — the survey opened 23 June 2026 and `survey.stackoverflow.co/2026/` returns 404 as of 18 Sep 2026. Several secondary articles present 2025 survey figures as "2026 survey" findings; they are wrong. I have used the 2025 survey and labelled it as such.

---

## 5. Sources

**Tier 1 — primary, methodologically documented**

1. Stanford HAI, *AI Index Report 2026, Chapter 4: Economy* (Lightcast data). https://hai.stanford.edu/assets/files/ai_index_report_2026_chapter_4_economy.pdf — 2026. The single best source here; figures 4.4.1–4.4.10 are the backbone of §1 and §3.
2. Stanford HAI, *2026 AI Index Report — Economy* (web). https://hai.stanford.edu/ai-index/2026-ai-index-report/economy — 2026.
3. PwC, *2026 Global AI Jobs Barometer* press release. https://www.prnewswire.com/news-releases/ai-reshapes-global-labour-market-into-two-distinct-paths-rewarding-human-skills-pwc-2026-global-ai-jobs-barometer-302798987.html — 15 Jun 2026. 1bn+ ads, 27 countries. (PwC's own domain returned HTTP 403 to automated fetch; PR Newswire carries the full release.)
4. Indeed Hiring Lab, *January 2026 US Labor Market Update: Jobs Mentioning AI Are Growing Amid Broader Hiring Weakness*. https://hiringlab.indeed.com/2026/01/22/january-labor-market-update-jobs-mentioning-ai-are-growing-amid-broader-hiring-weakness/ — 22 Jan 2026.
5. Indeed Hiring Lab, *AI and Job Postings: From Destruction to Creation?* https://hiringlab.indeed.com/2026/07/08/ai-and-job-postings-from-destruction-to-creation/ — 8 Jul 2026.
6. Indeed Hiring Lab, *AI Is No Longer Just a Tech Occupation Story*. https://hiringlab.indeed.com/2026/07/08/ai-is-no-longer-just-a-tech-occupation-story/ — 8 Jul 2026.
7. Indeed Hiring Lab, *The Labor Market Is Tilting Toward Seniority*. https://hiringlab.indeed.com/2026/07/23/the-labor-market-is-tilting-toward-seniority/ — 23 Jul 2026.
8. Indeed Hiring Lab, *How Employers Are Talking About AI in Job Postings*. https://hiringlab.indeed.com/2025/10/28/how-employers-are-talking-about-ai-in-job-postings/ — 28 Oct 2025.
9. Indeed Hiring Lab, *US Labor Market Snapshot — August 2026*. https://hiringlab.indeed.com/2026/08/24/us-labor-market-snapshot-august-2026/ — 24 Aug 2026.
10. Indeed Hiring Lab, *AI Tracker* (open dataset, CC-BY-4.0). https://github.com/hiring-lab/ai-tracker — updated monthly.
11. Lightcast, *Beyond the Buzz: Developing the AI Skills Employers Actually Need*. https://lightcast.io/resources/blog/beyond-the-buzz-press-release-2025-07-23 — 23 Jul 2025. 1.3bn postings; source of the 28% figure.
12. Lightcast, *Emerging Skills in AI Jobs*. https://lightcast.io/resources/blog/emerging-skills-in-ai-jobs — data through Apr 2026. Source of the "trustworthiness" $84.4k→$181.1k figure.
13. Lightcast, *Global AI Skills Outlook* (16 markets). https://lightcast.io/resources/research/the-lightcast-global-ai-skills-outlook
14. Lightcast, *Four Takeaways from the 2026 Stanford AI Index*. https://lightcast.io/resources/blog/stanford-ai-2026 — 2026.
15. LinkedIn News, *Jobs on the Rise 2026: the 25 fastest-growing roles in the U.S.* https://www.linkedin.com/pulse/linkedin-jobs-rise-2026-25-fastest-growing-roles-us-linkedin-news-dlb1c — Jan 2026.
16. LinkedIn News, *Skills on the Rise 2026*. https://news.linkedin.com/2026/Skills-on-the-rise-2026 — Feb 2026. Methodology: 1 Dec 2024–30 Nov 2025 vs prior year.
17. ITJobsWatch (UK permanent postings, 6 months to 18 Sep 2026): [Python](https://www.itjobswatch.co.uk/jobs/uk/python.do) · [SQL](https://www.itjobswatch.co.uk/jobs/uk/sql.do) · [Machine Learning](https://www.itjobswatch.co.uk/jobs/uk/machine-learning.do) · [Generative AI](https://www.itjobswatch.co.uk/jobs/uk/generative-ai.do) · [Databricks](https://www.itjobswatch.co.uk/jobs/uk/databricks.do) · [Snowflake](https://www.itjobswatch.co.uk/jobs/uk/snowflake.do) · [MLOps](https://www.itjobswatch.co.uk/jobs/uk/mlops.do) · [dbt](https://www.itjobswatch.co.uk/jobs/uk/dbt.do) · [LangChain](https://www.itjobswatch.co.uk/jobs/uk/langchain.do) · [PyTorch](https://www.itjobswatch.co.uk/jobs/uk/pytorch.do) · [Apache Airflow](https://www.itjobswatch.co.uk/jobs/uk/apache-airflow.do) · [Rust](https://www.itjobswatch.co.uk/jobs/uk/rust.do)
18. Levels.fyi (US, retrieved 18 Sep 2026): [AI Engineer](https://www.levels.fyi/t/software-engineer/title/ai-engineer) · [ML Engineer](https://www.levels.fyi/t/software-engineer/title/machine-learning-engineer) · [Data Scientist](https://www.levels.fyi/t/data-scientist) · [Data SWE](https://www.levels.fyi/t/software-engineer/focus/data) · [2025 Annual Pay Report](https://levels.fyi/2025) (245k+ data points, 47k US submissions, 20k India).
19. Stack Overflow, *2025 Developer Survey — AI section*. https://survey.stackoverflow.co/2025/ai — 49,000+ responses, 177 countries. (2026 survey opened 23 Jun 2026; results not published as of 18 Sep 2026.)
20. dbt Labs, *2026 State of Analytics Engineering Report*. https://www.getdbt.com/resources/state-of-analytics-engineering-2026 — Apr 2026.
21. Naukri JobSpeak, August 2026 (via ANI). https://aninews.in/news/business/aiml-hiring-rises-31-pc-yoy-in-august-gcc-recruitment-grows-10-pc-naukri-jobspeak20260908113325/ — 8 Sep 2026. (Naukri's own blog returned HTTP 403 to automated fetch.)
22. Dice, *2025 Tech Salary Report*. https://www.dice.com/hiring/recruitment/reports/dice-tech-salary-report/ — source of the 17.7% within-tech AI premium.
23. Glassdoor, *Worklife Trends 2026*. https://www.glassdoor.com/blog/worklife-trends-2026/ — Nov 2025; midyear check-in https://www.glassdoor.com/blog/worklife-trends-2026-midyear-check-in/
24. Burning Glass Institute research index. https://www.burningglassinstitute.org/research — 2026 disruption estimates.

**Tier 2 — used only where labelled [weak]; single-source, undisclosed methodology, or commercial job boards**

25. Axial Search, *AI Governance Jobs 2026* and *AI Product Management Jobs 2026*. https://axialsearch.com/insights/ai-governance-jobs · https://axialsearch.com/insights/ai-product-jobs
26. agentic-engineering-jobs.com, *LangChain Job Market 2026*. https://agentic-engineering-jobs.com/langchain-job-market-2026
27. Interview Query, *January 2026 Data Science Job Market Report*. https://www.interviewquery.com/p/jan-data-science-job-market-report

**Sources I sought and could not obtain:** Hired *State of Software Engineers* (no 2025/26 edition located); Kaggle *State of Data Science* (discontinued — Anaconda's 8th annual report is the successor but its 2026 edition was not retrievable); Burning Glass Institute's 2026 report PDF (only press coverage accessible); PwC and Naukri primary pages (HTTP 403).
