# Oil & Gas × LLM Application Engineering — Portfolio Project Research

**Prepared:** 2026-09-18
**For:** Data scientist (MSc 2022) working in oil & gas, upskilling into LLM application engineering (RAG, agents, fine-tuning) + AI evaluation.
**Constraint applied throughout:** every dataset must be legally and practically downloadable, with the access mode (open / free registration / paid) stated explicitly.

---

## Executive summary (read this first)

Three findings shape everything below.

1. **The single best text corpus for this portfolio is not Volve — it is the Norwegian Offshore Directorate's open PDF end-of-well reports.** `factpages.sodir.no/pbl/wellbore_documents/*_COMPLETION_REPORT.pdf` serves multi-hundred-page final well reports with **no login, no registration, no rate-limiting gate**, under the Norwegian Licence for Open Government Data. Verified 2026-09-18 by fetching well 6506/3-1's report (4 MB, ~1,500 pp., contains daily activity reports, wellsite geology, contractor end-of-well summaries, bit records, abandonment procedures). This is exactly the "PDF-heavy, citation-requiring, domain-jargon" material where RAG earns its keep.

2. **Volve's access route changed.** It is no longer a plain blob-storage download. As of the current Equinor user guide, Equinor Open Data (Volve, Northern Lights, Huldra, and others) is distributed through the **Databricks Marketplace** — pricing "Free", visibility "Public", but you must sign in or sign up for a Databricks account (Free Edition works) and click "Get instant access", after which the data appears in your Unity Catalog within ~1 hour. Delta Sharing is offered for use outside Databricks. Plan for this; don't promise a curl one-liner. Mirrors exist (Kaggle, academic re-hosts) but their licence chain is weaker than the primary source.

3. **The eval half of your portfolio is the differentiator, and employers say so in writing.** SLB's current *Artificial Intelligence Engineer* posting literally lists: *"Collaborate with domain teams to define benchmark datasets, evaluation metrics, and acceptance criteria; establish continuous evaluation frameworks"* and *"Proven experience building and deploying agentic AI systems (multi-agent, tool-use, reasoning pipelines) in production."* Halliburton's Landmark AI/ML roles list *"designing and deploying LLM-based solutions (RAG, prompt pipelines, vector search)"* alongside *"end-to-end ML pipelines with CI/CD."* A project that ships a golden set + judge + regression harness maps directly onto those bullets.

And one honest counterweight, straight from an operator: Equinor's own January 2026 statement is that **"we primarily use 'traditional' machine learning on our operational data"**, with LLMs showing up as copilots, chatbots and agents on top. Sections C flags where classic ML genuinely beats an LLM.

---

# A) Open oil & gas datasets catalogue

Access legend: **OPEN** = direct download, no account. **FREE-REG** = free account/registration required. **GATED** = approval, membership fee, or paywall.

## A1. The core recommendations (highest value for this portfolio)

| # | Name | Publisher | Contents | Format / size | Licence | URL | Access | Verified | LLM-text vs numeric-ML |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Sodir FactPages wellbore documents** (final well reports / end-of-well reports, completion logs, biostratigraphy reports) | Norwegian Offshore Directorate (Sodir, ex-NPD) | Scanned + digital PDFs for released wellbores; e.g. 6506/3-1 report contains summary, geology/geophysics/petrophysics, operational procedures, 43+ daily activity reports, wellsite geological reports, contractor EOW summaries, core descriptions, wireline logging appendices | PDF, ~1–50 MB each, thousands of wellbores | Norwegian Licence for Open Government Data (NLOD), with stated limitations where third-party rights attach to reports/logs/core images | Pattern: `https://factpages.sodir.no/pbl/wellbore_documents/<id>_<well>_COMPLETION_REPORT.pdf` — e.g. [6506/3-1](https://factpages.sodir.no/pbl/wellbore_documents/4344_6506_3_1__COMPLETION_REPORT.pdf), [34/9-1 S](https://factpages.sodir.no/pbl/wellbore_documents/9555_34_9_1_S_COMPLETION_REPORT.pdf). Index via [wellbore tableview](https://factpages.sodir.no/en/wellbore/tableview/exploration/all) | **OPEN** | 2026-09-18 (fetched PDF successfully) | **Text — best in class.** Long-document RAG, citation grounding, extraction |
| 2 | **Sodir FactPages structured tables** | Sodir | ~9,800 wellbores, ~143 fields, ~1,810 production licences, ~650 discoveries, monthly field production, facilities, stratigraphy; DB synced daily | CSV (incl. WKT geometry), table views, API/data-service tables | NLOD | [factpages.sodir.no/en](https://factpages.sodir.no/en); open-data/API docs at [sodir.no open data](https://www.sodir.no/en/facts/data-and-analyses/open-data/) (403s to bots; reachable in a browser) | **OPEN** | 2026-09-18 | **Numeric/structured.** Ideal as the SQL side of a text-to-SQL agent, and as a join key to (1) |
| 3 | **Equinor Volve field dataset** | Equinor | ~40,000 files, 2008–2016: **1,759 daily drilling reports**, WITSML real-time objects, ~15,634 production records, well logs, seismic + interpretations, static/dynamic models, completion string design, formation tops, perforations | WITSML XML, LAS, SEG-Y, CSV, Petrel projects; full set is hundreds of GB; realtime-drilling CSV re-parse ≈ 2.7 GB compressed | Equinor Open Data Licence (explicitly permits academic/student/research use without further written permission) | Landing: [equinor.com/energy/volve-data-sharing](https://www.equinor.com/energy/volve-data-sharing) → [Databricks Marketplace, Equinor ASA](https://marketplace.databricks.com/provider/006d1a44-e5d8-4d20-8bd7-e9a311106007/Equinor-ASA); [user guide PDF](https://equinoropendata.blob.core.windows.net/userguides/Equinor%20open%20data%20-%20User%20Guide.pdf) | **FREE-REG** (Databricks account; listing priced "Free", public; Delta Sharing for external platforms) | 2026-09-18 (read user guide) | **Both.** The 1,759 DDRs are the single best *structured-ish* drilling-narrative corpus in the open world |
| 4 | **FORCE 2020 lithology competition data** | FORCE / Equinor / Xeek, archived on Zenodo | 118 NCS wells (98 train / 10 test / blind), logs CALI RDEP RHOB GR NPHI PEF DTC DTS SP etc., expert lithofacies labels, NPD lithostratigraphy groups & formations, casing depths, competition cost matrix | 5 files, **170.1 MB** total (169.8 MB LAS zip + 4 xlsx) | **CC BY 4.0** | [zenodo.org/records/4351156](https://zenodo.org/records/4351156) (DOI 10.5281/zenodo.4351156); code/results at [github.com/bolgebrygg/Force-2020-Machine-Learning-competition](https://github.com/bolgebrygg/Force-2020-Machine-Learning-competition) | **OPEN** | 2026-09-18 (Zenodo record read) | **Numeric ML.** Use as the honest "classic ML wins here" control arm |
| 5 | **PHMSA pipeline incident flagged files** | US DOT PHMSA | 20-year trend files for gas distribution, gas gathering, gas transmission, hazardous liquid, LNG; operator-submitted incident reports **plus PHMSA's harmonised cause/subcause coding**, alongside the original values — i.e. a ready-made human-labelled taxonomy | Zip/xlsx/CSV | US federal government work — public domain | [phmsa.dot.gov/data-and-statistics/pipeline/pipeline-incident-flagged-files](https://www.phmsa.dot.gov/data-and-statistics/pipeline/pipeline-incident-flagged-files); source data index at [/pipeline/source-data](https://www.phmsa.dot.gov/data-and-statistics/pipeline/source-data) | **OPEN** (403s to automated fetchers; fine in a browser) | 2026-09-18 (page 403 to bot; content confirmed via PHMSA description + Pipeline Safety Trust) | **Text + labels.** Narrative description fields + official cause labels = a free golden set for classification evals |
| 6 | **BSEE Data Center — incidents, investigations, wells, production** | US BSEE | Incident Investigations table (**2,018 records**, fields: date, time, lease, area/block, incident type, panel/district, status) plus 40+ raw-data files: APD applications, boreholes, pressure surveys, production by platform, pipelines, platform structures, scanned-document index | CSV / XLS / XLSX / RTF / PDF per table; raw data as delimited ASCII in `.zip`; mostly daily refresh | US public domain | [data.bsee.gov](https://www.data.bsee.gov/); [Incident Investigations](https://www.data.bsee.gov/Other/DataTables/IncidentInvestigations.aspx); [Raw Data index](https://www.data.bsee.gov/Main/RawData.aspx); narrative panel reports at [bsee.gov panel investigation reports](https://www.bsee.gov/what-we-do/incident-investigations/offshore-incident-investigations/panel-investigation-reports) | **OPEN** | 2026-09-18 (both pages fetched) | **Both.** Structured incident metadata + long-form investigation PDFs |

## A2. Regulators and national data repositories

| Name | Publisher | Contents | Format | Licence | URL | Access | Verified | Suitability |
|---|---|---|---|---|---|---|---|---|
| **UK National Data Repository (NDR)** | NSTA (North Sea Transition Authority) | UK offshore wells, seismic, marine hazard, remote monitoring; BGS National Hydrocarbons Data Archive files have been migrated in and are free to download | Mixed (LAS, SEG-Y, PDF reports) | UK NDR User Agreement (2023-07-01) + Terms of Sale; much data under OGL | [ndr.nstauthority.co.uk](https://ndr.nstauthority.co.uk/) | **FREE-REG** — registration free, company-based access management; download privileges granted by your organisation's Company Administrator; physical media costs money. This is a real friction point for an individual | 2026-09-18 | Text (well reports) + numeric |
| **NSTA open data / Energy Pathfinder themes** | NSTA | Wells, fields, production, energy-systems datasets and dashboards; 2016 UK seismic programme (19,000 km new 2D + 23,000 km reprocessed) published under **Open Government Licence** in 2017 | CSV, shapefile, SEG-Y | OGL / NDR terms | [nstauthority.co.uk/data-and-insights/data/](https://www.nstauthority.co.uk/data-and-insights/data/) | **OPEN** for the open-data themes | 2026-09-18 | Numeric + some text |
| **NLOG (Netherlands Oil & Gas Portal)** | Dutch Ministry of Economic Affairs / TNO | Boreholes (open-hole GR/sonic/caliper, MWD, cased-hole CBL and pressure logs), seismic, production & injection, fields, models, maps, core collection, scientific articles. Under the Mining Act, exploration data post-2003 becomes public after 5 years (pre-2003: 10 years) | LAS, SEG-Y, PDF, CSV | Dutch public-information rules (Wet Openbaarheid van Bestuur art. 10.1.c); production figures released 4 weeks after submission deadline | [nlog.nl/en](https://www.nlog.nl/en); datacenter + interactive map; [data supply page](https://www.nlog.nl/en/data-supply) | **OPEN** (download via datacenter/map; no login advertised) | 2026-09-18 | Both; a second national corpus to test cross-jurisdiction RAG generalisation |
| **NOPIMS / NEATS** | NOPTA + Geoscience Australia + WA DEMIRS | Open-file **well completion reports**, logs, VSPs, core photography; survey acquisition/processing/interpretation reports, navigation, velocity data, observer logs. One of the largest open-file offshore collections in the world | PDF, LAS, SEG-Y | Australian government open-file terms; **note: release rules changed 28 Nov 2025 — ministerial approval now required before NOPTA can decide to release survey data** | [ga.gov.au/nopims](https://www.ga.gov.au/nopims) → portal [public.neats.nopta.gov.au/nopims](https://public.neats.nopta.gov.au/nopims); [nopta.gov.au NOPIMS info](https://www.nopta.gov.au/maps-and-public-data/nopims-info.html) | **OPEN** for publicly available digital data (portal is JS-heavy; scripted scraping needs a headless browser) | 2026-09-18 | **Text — excellent second WCR corpus** |
| **Havtil (Norwegian Ocean Industry Authority) investigation reports + regulations** | Havtil (ex-PSA Norway) | Full incident investigation reports (Hammerfest LNG, Njord A, Sleipner B, Goliat, Ula hydrocarbon leak, Tjeldbergodden turbine fire…), plus the complete HSE regulatory framework in English | HTML + PDF | Norwegian public sector, free reuse | [havtil.no/en/supervision/investigation-reports/](https://www.havtil.no/en/supervision/investigation-reports/); [havtil.no/en/regulations/all-acts/](https://www.havtil.no/en/regulations/all-acts/) | **OPEN** | 2026-09-18 | **Text.** Root-cause narratives + the regulations they cite → perfect for cited regulatory Q&A |
| **eCFR Title 30 Part 250** (Oil & Gas and Sulphur Operations in the OCS) | US Office of the Federal Register / BSEE | The full BSEE offshore regulation set, subparts A–Q (well control, completions, production safety systems, decommissioning…) | HTML + **bulk XML**, daily updates | US public domain | [ecfr.gov/current/title-30/chapter-II/subchapter-B/part-250](https://www.ecfr.gov/current/title-30/chapter-II/subchapter-B/part-250); bulk XML via [GPO bulkdata ECFR](https://www.govinfo.gov/bulkdata/ECFR) | **OPEN, API/bulk** | 2026-09-18 | **Text.** The cleanest legally-reusable "standards-like" corpus available |
| **Texas Railroad Commission downloadable datasets** | RRC of Texas | ~45 datasets: drilling permit master, **imaged W-1 drilling permits (PDF, nightly)**, **imaged completion files (PDF, nightly)**, directional survey applications (PDF), full wellbore, production data query dump (CSV), UIC database, P-5 organisation, field rules, severance-tax incentives | ASCII, dBase, **EBCDIC** (yes, really), CSV, JSON, shapefile, PDF | Free of charge; conversion is the user's responsibility | [rrc.texas.gov/resource-center/research/data-sets-available-for-download/](https://www.rrc.texas.gov/resource-center/research/data-sets-available-for-download/) — each file has a direct `mft.rrc.texas.gov/link/<uuid>` URL | **OPEN, no login** | 2026-09-18 (full file list retrieved) | Both. The EBCDIC + fixed-width parsing makes a *genuinely impressive* data-engineering story |
| **North Dakota DMR oil & gas** | ND Industrial Commission, Dept. of Mineral Resources | Scout tickets (log tops, completion data, initial production tests); **well files scanned to PDF** — forms, letters, geological reports, drill-stem test reports; production & injection histories by well/unit/field-pool | PDF + tabular | US state public records; confidential wells withheld | [dmr.nd.gov/oilgas/](https://www.dmr.nd.gov/oilgas/); GIS at [gis.dmr.nd.gov](https://gis.dmr.nd.gov/) | **OPEN** (some subscription services exist for bulk convenience) | 2026-09-18 | Text (well files) + numeric |
| **Kansas Geological Survey** | KGS / University of Kansas | **~21,780 Kansas wells with digital wireline logs in LAS** (as of 2024-12-31), plus scanned well records, completion forms, scout cards, production data. A pre-built ZIP of all LAS-available wells is maintained (last updated 2026-09-11) | LAS, PDF scans, tabular | Public after a 2-year confidentiality period; scans/copies may be purchasable | [kgs.ku.edu/Magellan/Logs/](https://www.kgs.ku.edu/Magellan/Logs/); [scans of well records](https://www.kgs.ku.edu/Magellan/ACO/index.html); [GIS hub](https://kgs-gis-data-and-maps-ku.hub.arcgis.com/) | **OPEN** | 2026-09-18 | Numeric (LAS) + OCR-able scans |
| **Diskos (Norwegian NDR)** | Sodir + Halliburton (operator) | The real Norwegian NDR behind FactPages | — | Membership-based | [sodir.no diskos membership](https://www.sodir.no/en/diskos/About-us/membership/) | **GATED.** Oil companies ≈ NOK 850,000/yr; associated members ≈ NOK 190,000/yr; **universities and government non-profit research organisations join free with a free annual download allowance** | 2026-09-18 | Not viable for an individual — use FactPages instead |

## A3. US federal statistical and CO2 storage data

| Name | Publisher | Contents | Format / size | Licence | URL | Access | Verified | Suitability |
|---|---|---|---|---|---|---|---|---|
| **EIA Open Data API v2 + bulk files** | US EIA | Crude/condensate/gas reserves, production, drilling; Drilling Productivity Report (rig counts, productivity, legacy decline for 7 regions); Annual Energy Outlook; STEO; state energy data | Bulk `.zip` — Petroleum **54 MB**, Natural Gas 4.6 MB, Electricity 281 MB, US electric operating data 674 MB; JSON via API. Bulk refreshed twice daily (05:00 & 15:00 ET) | US public domain; API ToS acceptance for keys | API key: [eia.gov/opendata/register.php](https://www.eia.gov/opendata/register.php); **bulk needs no key**: [eia.gov/opendata/bulkfiles.php](https://www.eia.gov/opendata/bulkfiles.php) | **OPEN** (bulk) / **FREE-REG** (API key, free) | 2026-09-18 (bulk page fetched, sizes confirmed) | Numeric. Good for the SQL layer of an agent; poor for LLM-text work alone |
| **BOEM data center** | US BOEM | Leasing, wells, geological/geophysical, environmental studies | Mixed | US public domain | [data.boem.gov](https://www.data.boem.gov/Main/Well.aspx) | **OPEN** | 2026-09-18 | Numeric + reports |
| **CO2DataShare — Sleipner, Smeaheia, others** | SINTEF-hosted portal; data from Equinor et al. | Smeaheia: subsurface data, **reports**, geomodels for CO2 storage assessment, Hordaland Platform; Sleipner: the 1996-onward CO2 injection benchmark | SEG-Y, ECLIPSE decks, PDF reports, grids | Per-dataset CO2DataShare licences (generally permissive, attribution) | [co2datashare.org](https://co2datashare.org/); [Smeaheia dataset](https://co2datashare.org/dataset/smeaheia-dataset) | **FREE-REG** typically (portal was returning 503 at time of writing — retry) | 2026-09-18 (503 on dataset index; dataset pages indexed and described by SINTEF/IEAGHG) | Reports = text; models = numeric. CCS is where the hiring growth is |
| **Northern Lights well 31/5-7 "Eos"** | Equinor / Northern Lights JV | ~850 files, **>83 GB** from the CO2 confirmation well | Mixed subsurface | Equinor Open Data Licence | Via Equinor Open Data on Databricks Marketplace (see A1 #3); announced [2020-10-19](https://www.equinor.com/news/archive/20201019-sharing-data-northern-lights) | **FREE-REG** | 2026-09-18 | Both |

## A4. Seismic and well-log open data

| Name | Publisher | Contents | Format | Licence | URL | Access | Verified | Suitability |
|---|---|---|---|---|---|---|---|---|
| **SEG Wiki Open Data** | SEG | Curated index: Teapot Dome 3D, BP 2010 Tiber WATS, Tui-3D, Waihapa-3D, Waipuku-3D, Waka-3D, USGS marine seismic, US east coast line 32, and more | Links out; mostly SEG-Y | Per-dataset | [wiki.seg.org/wiki/Open_data](https://wiki.seg.org/wiki/Open_data) | **OPEN** index; individual sets vary | 2026-09-18 | Numeric/imaging |
| **Teapot Dome 3D (RMOTC)** | US DOE / RMOTC, Wyoming | Post-stack 3D land seismic, **well logs, production history**, GIS | SEG-Y, LAS, shapefile | US government data | [wiki.seg.org/wiki/Teapot_dome_3D_survey](https://wiki.seg.org/wiki/Teapot_dome_3D_survey) | **FREE-REG** — historically required requesting an FTP password; mirrors exist | 2026-09-18 | Numeric |
| **Poseidon 3D, Browse Basin Australia** | TGS / ConocoPhillips / Geoscience Australia, on AWS Open Data | Full 3D seismic survey | SEG-Y | **CC BY 3.0 AU** | [registry.opendata.aws/tgs-opendata-poseidon/](https://registry.opendata.aws/tgs-opendata-poseidon/) | **OPEN** (S3, requester-pays-free) | 2026-09-18 | Numeric |
| **Groningen field seismological dataset** | KNMI / EPOS-NL, data from NAM | **50 TB**; 2013–2018 downhole geophone arrays + flexible network of 400 surface stations on a 350 m grid across the field | SEG-Y, SEG-D, MIRF5 | **CC BY 4.0** | [dataplatform.knmi.nl](https://dataplatform.knmi.nl/group/seismology-and-acoustics); [EPOS-NL announcement](https://epos-nl.nl/large-dataset-groningen-gas-field-made-openly-available/) | **OPEN** | 2026-09-18 | Numeric (induced-seismicity ML) |
| **Groningen static model** | NAM, via NLOG | 371 wells, >6,000 digital well logs, >600 faults, pre-stack depth-migrated seismic cube | Petrel / industry formats | Dutch open data | via [nlog.nl](https://www.nlog.nl/en) | **OPEN** | 2026-09-18 | Numeric |
| **Geolink NCS well-log dataset** | GEOLINK | **223 Norwegian offshore wells with lithology labels, 36 classes** | LAS/CSV | **NOLD 2.0** (Norwegian Licence for Open Government Data) | [github.com/LukasMosser/geolink_dataset](https://github.com/LukasMosser/geolink_dataset); processed copies on [Zenodo 10987946](https://zenodo.org/records/10987946) | **OPEN** | 2026-09-18 | Numeric. Bigger/messier than FORCE 2020 — good for a cross-dataset generalisation eval |
| **OSDU Open Test Data** | The Open Group OSDU Forum | Reference/test data instances matching the OSDU schema; TNO (Dutch) dataset loaders; Volve used in milestone QA | JSON manifests + binaries | Open Group community terms | [community.opengroup.org/osdu/data/open-test-data](https://community.opengroup.org/osdu/data/open-test-data); loader [github.com/Azure/osdu-data-load-tno](https://github.com/Azure/osdu-data-load-tno) | **OPEN** (GitLab blocked my automated fetch; browser access works) | 2026-09-18 (GitLab returned Access Denied to the bot) | Schema/ontology work. **Knowing OSDU entity names is a resume signal on its own** — ADNOC's ENERGYai is built on OSDU frameworks |

## A5. LLM-era resources: models, benchmarks, corpora

| Name | What it is | Access / licence | URL | Verified | Notes |
|---|---|---|---|---|---|
| **PetroBench** | Petroleum-engineering LLM benchmark: **1,200 items** across production, reservoir and drilling engineering; four question types (MCQ, true/false, term definition, short answer); built by three-stage preprocessing → quality filtering → multi-model validation with expert review. Eight frontier models evaluated under a unified API; best scores 72–74% (Gemini-3-Pro, Kimi-K2.5, Claude-Opus-4.6-Thinking). Finding: models do well on subjective/generative items but **weakly on factual-knowledge discrimination** | arXiv preprint; **the abstract page does not advertise a public dataset or code repo** — treat as a design template, not a downloadable set | [arxiv.org/abs/2605.28032](https://arxiv.org/abs/2605.28032) (2026-05-27) | 2026-09-18 | The "weak on factual discrimination" result is a ready-made thesis for your own eval work |
| **TADI** | Agentic LLM over the Volve dataset: 12 specialised tools, DuckDB (12 tables / 65,447 rows) for structured queries + ChromaDB (36,709 embedded docs) for semantic search; parses **all 1,759 DDR XML files with zero errors**; reconciles three incompatible well-naming conventions; 95 automated tests; a **130-question stress-question taxonomy** across six operational categories; proposes an **Evidence Grounding Score** (measurements + attributed quotations + answer sections). Conclusion: domain-specialised tool design beat model scale | arXiv preprint, Volve data is public | [arxiv.org/abs/2605.00060](https://arxiv.org/abs/2605.00060) (2026-04-30) | 2026-09-18 | **Closest published prior art to the project you want to build.** Read it, then beat its eval — or replicate and extend to a second field |
| **K2 (7B)** + **GeoSignal** + **GeoBench** | Open geoscience LLM: LLaMA further-pretrained on geoscience open-access papers and Wikipedia, then instruction-tuned on GeoSignal. GeoBench = exam-style QA (NPEE + AP tests in geology, geography, environmental science) | Open source, code + datasets on GitHub | [github.com/davendw49/k2](https://github.com/davendw49/k2) | 2026-09-18 | Cheap fine-tuning baseline; GeoBench is a real, downloadable eval set |
| **GeoGalactica (30B)** | Largest geoscience-domain LLM; further-pretrained on ~65 B tokens of geoscience text (78 B tokens of literature + code collected), backed by the Deep-time Digital Earth programme | Weights on Hugging Face | [huggingface.co/geobrain-ai/geogalactica](https://huggingface.co/geobrain-ai/geogalactica); [github.com/geobrain-ai/geogalactica](https://github.com/geobrain-ai/geogalactica) | 2026-09-18 | Domain-embedding / continued-pretraining comparison point |
| **PetroQA** | SPE's own prototype: RAG over PetroWiki content to answer O&G questions with citations, explicitly designed to avoid hallucination | Prototype/paper, not a released dataset | described in SPE/OnePetro work on GPT in the petroleum industry | 2026-09-18 | **Important caveat below** |
| **⚠ PetroWiki** | SPE's petroleum encyclopedia — the obvious RAG corpus | **NOT open-licensed.** SPE explicitly states PetroWiki "is not licensed for reuse like Wikipedia." Limited personal non-commercial reuse without permission; republication/distribution/commercial use needs permission and possibly fees. Only the Help/PetroWiki namespaces are CC-derived | [petrowiki.spe.org/PetroWiki:Copyright](https://petrowiki.spe.org/PetroWiki:Copyright) | 2026-09-18 | **Do not ingest into a public portfolio repo.** Link to it; don't redistribute it |
| **GainEnergy/oilandgas-engineering-dataset** (HF) | 453 rows, text + 7-class label (reservoir, economics, production, facilities, well intervention, drilling, HSE) | Open download; **synthetic (generated with distilabel); no licence stated on the card** | [huggingface.co/datasets/GainEnergy/oilandgas-engineering-dataset](https://huggingface.co/datasets/GainEnergy/oilandgas-engineering-dataset) | 2026-09-18 | Too small and too synthetic to be your golden set. Useful only as a smoke test |
| **Drill Core Image Dataset (DCID)** on HF | Lithology classification from RGB core images; DCID-7 = 7 classes × 5,000 images | Open | [huggingface.co/datasets/168sir/drill-core-image-dataset](https://huggingface.co/datasets/168sir/drill-core-image-dataset) | 2026-09-18 | Vision, not LLM; useful if you want a multimodal arm |
| **Well-log imputation benchmark** | Benchmark + processed Geolink/NCS data for missing-log imputation | Zenodo, open | [zenodo.org/records/10987946](https://zenodo.org/records/10987946); [github.com/uai-ufmg/well-log-imputation](https://github.com/uai-ufmg/well-log-imputation) | 2026-09-18 | Classic ML |

## A6. Sources to know about but *not* build on

| Source | Why it's a trap |
|---|---|
| **API standards** (API 14C, 17D, RP 500, Spec 5CT…) | Paywalled, per-seat licensed, and redistribution-prohibited. You cannot legally build a public standards-Q&A demo on them. **Substitute:** eCFR 30 CFR 250 (US public domain, bulk XML) and Havtil's English regulations (free) |
| **NORSOK standards** | Also not free — only an overview PDF is free; the standards themselves are sold through the standard.no webshop / subscription. [standard.no NORSOK](https://standard.no/en/sectors/petroleum/norsok-standards/) |
| **OnePetro / SPE papers** | 1.4 M+ items but paywalled. SPE professional members get 10 free downloads/year; OnePetro rotates free curated collections quarterly ([JPT note](https://jpt.spe.org/onepetro-offers-free-curated-collections)); students get the Petroleum Engineering Handbook. **Substitutes:** arXiv (physics.geo-ph, cs.LG applications), EarthArXiv, open-access Netherlands Journal of Geosciences, Geophysical Journal International OA articles, USGS publications |
| **IOGP safety data** | The annual *Safety Performance Indicators* reports are free PDFs from the IOGP bookstore and cover the largest E&P safety database (since 1985), but what's published is **aggregated statistics, not incident narratives**. Good for framing/benchmarking a project; useless as training or eval text. [iogp.org safety performance indicators](https://www.iogp.org/bookstore/portfolio-item/safety-performance-indicators/) |
| **Kaggle Volve mirrors** | Convenient but the licence chain is second-hand. If you use one, cite the Equinor Open Data Licence and link the primary source |

---

# B) What oil & gas employers are actually hiring for in AI (2025–2026)

## B1. Deployed LLM/agent use cases, with sources

| Company | What they've deployed / announced | Source | Date |
|---|---|---|---|
| **SLB** | **Lumi** data & AI platform launched Sep 2024; **Tela** agentic-AI assistant; **SLB Digital Marketplace** launched to let energy companies "discover and deploy specialized AI agents" — products span Delfi and Lumi SaaS apps, plug-ins, workflow extensions, data connectors, and "Tela AI skills, agents and foundation models". Tela workflows are indexed "by discipline, technical task, and host application — from data discovery and subsurface interpretation to drilling, production, and sustainability" | [SLB press release](https://www.slb.com/newsroom/press-release/2026/slb-launches-digital-marketplace-to-scale-ai-and-digital-innovation-across-energy); [World Oil](https://worldoil.com/news/2026/6/15/slb-launches-digital-marketplace-for-ai-and-energy-applications/); [JPT](https://jpt.spe.org/slb-launches-digital-marketplace-to-scale-ai-and-digital-innovation) | Jun 2026 |
| **SLB + NVIDIA** | "Industrializing AI for the energy industry" — work spanning traditional ML, generative AI and emerging agentic AI, with NVIDIA software integrated into Delfi and Lumi | [SLB press release](https://www.slb.com/newsroom/press-release/2026/pr-2026-0325-slb-nvidia) | Mar 2026 |
| **SLB + Shell** | Strategic agreement to develop agentic AI, building "open data and AI infrastructure that unifies data and workflows across the subsurface, well construction, and production domains." Lumi is the platform; Petrel deploys across Shell's assets globally. Rakesh Jaggi (president, SLB digital): *"Working with industry leaders like Shell enables us to accelerate development of advanced digital and agentic AI solutions that are changing how our industry works."* | [JPT](https://jpt.spe.org/slb-shell-agree-to-collaborate-on-agentic-ai-efforts) | 18 Dec 2025 |
| **Shell + SparkCognition** | Generative AI for seismic imaging — deep learning generating subsurface images from as little as **1% of the usual seismic shots** in completed field trials, preserving image quality | [JPT](https://jpt.spe.org/sparkcognition-shell-team-up-to-push-generative-ai); [Shell AI page](https://www.shell.com/what-we-do/digitalisation/artificial-intelligence.html) | 2024–2025 |
| **ADNOC / AIQ / G42 / Microsoft — ENERGYai** | Launched at ADIPEC as "the world's first-of-its-kind custom-built agentic AI solution" for energy; combines LLMs with task-specific agents across ADNOC's value chain (seismic analysis, energy efficiency, real-time process monitoring); **built on OSDU frameworks and OpenAI models**. PoC completed Jan 2025 showing gains in seismic interpretation and reservoir performance/monitoring. **$340 M contract** announced Mar 2025 to deploy across ADNOC's upstream value chain; rollout from Q4 2025 | [ADNOC](https://www.adnoc.ae/en/news-and-media/press-releases/2024/adnoc-and-aiq-successfully-complete-trial-phase-of-agentic-ai-solution); [AIQ ENERGYai](https://aiq.ae/products/AgenticAI/energyai); [PR Newswire $340M](https://www.prnewswire.com/news-releases/aiq-announces-340-million-contract-for-large-scale-deployment-of-agentic-ai-across-adnoc-operations-302400274.html); [SLB + AIQ](https://www.slb.com/news-and-insights/newsroom/press-release/2025/aiq-slb-energyai-pr) | Nov 2024 → Mar 2025 |
| **Saudi Aramco — METABRAIN** | Proprietary 250 B-parameter industrial LLM launched Mar 2024 via SAIL, trained on ~7 T tokens of public + internal data spanning nine decades of company data; a trillion-parameter version was flagged for end-2025. Aramco reports **$1.8 bn of AI-driven "Technology Realized Value" in 2024**, **442 identified AI use cases, 200+ solutions deployed and 100+ in development** as of late 2025; named use cases include reservoir simulation from drilling plans + geological data, and AI-powered autonomous drilling. Commits to training **6,000+ AI developers** with Imperial College, Caltech, KAUST | [Aramco — Building the AI future](https://www.aramco.com/en/what-we-do/energy-innovation/digitalization/building-the-ai-future); [Middle East AI News](https://www.middleeastainews.com/p/aramco-launches-largest-industrial-llm) | Mar 2024 → late 2025 |
| **bp** | Renewed a five-year agreement with **Palantir** centred on AIP; Palantir's software "assists bp to safely and reliably harness large language models to improve and accelerate human decision-making with suggested courses of action based on automated analysis of the underlying data" | [World Oil](https://worldoil.com/news/2024/9/9/bp-to-deploy-palantir-technologies-ai-digital-twin-software-to-support-oil-and-gas-operations/) | Sep 2024 |
| **Equinor** | AI contributed **USD 130 M in 2025** (USD 330 M cumulative since 2020). Named uses: predictive maintenance on **700+ rotating machines with 24,000 sensors** (USD 120 M since 2020); AI generating thousands of well/field development alternatives — on **Johan Sverdrup phase 3 it "found a solution that no one had considered, saving the partnership USD 12 million"**; seismic interpretation at **10× capacity, 2 M km² analysed in 2025**. Crucially: *"we primarily use 'traditional' machine learning on our operational data. Our employees can use AI tools like copilots, chatbots and agentic AI to solve tasks."* Hege Skryseth: she believes *"AI agents will change the way we work"* | [Equinor newsroom](https://www.equinor.com/news/20260107-artificial-intelligence-saved-equinor-usd-130-million) | 7 Jan 2026 |
| **Baker Hughes** | **Leucipa** automated field production: generative-AI virtual assistant with Repsol (Jun 2025); **"Lucy," the Leucipa AI Production Assistant** — real-time analysis of production data through a generative-AI conversational interface — piloted by Expand Energy, with a Jan 2026 award to deploy Leucipa across thousands of US gas wells. **Cordant** industrial software enhanced with hybrid AI + physics analytics and agentic "reliability advisor" agents that each own one task and talk to each other | [Baker Hughes / Repsol](https://www.bakerhughes.com/company/news/baker-hughes-repsol-launching-new-aipowered-functionality-leucipatm); [Baker Hughes / Expand Energy](https://www.bakerhughes.com/company/news/baker-hughes-expand-energy-deploy-leucipatm-across-us-natural-gas-fields); [Cordant AI release](https://www.bakerhughes.com/company/news/baker-hughes-enhances-cordanttm-industrial-software-integrated-ai-enhanced-usability); [SiliconANGLE](https://siliconangle.com/2025/11/26/intelligent-agents-leucipa-baker-hughes-aws-cubeconversations/) | Jun 2025 → Jan 2026 |
| **Halliburton / Landmark** | **DS365.ai** cloud service delivering industry-specific AI/ML models as microservices or inside DS365.ai apps — named apps include **Assisted Lithology Interpretation, Seismic Engine, Real-Time Well Engineering**. LIFE 2025 positioned Unified Ensemble Modeling + Agile Asset Management as the "intelligent enterprise" layer. Halliburton also operates **Diskos 2.0**, Norway's NDR, on DecisionSpace 365 | [Halliburton DS365.ai](https://www.halliburton.com/en/software/decisionspace-365-enterprise/ds365-ai); [LIFE press release](https://www.halliburton.com/en/about-us/press-release/halliburton-delivers-on-digital-vision-at-landmark-innovation-forum-and-expo); [diskos.com](https://www.diskos.com/) | 2024–2026 |
| **TotalEnergies** | Partnership with **Mistral AI** (Jun 2025) creating a joint innovation lab for next-generation generative AI supporting 1,000 researchers; goal explicitly includes AI models that "generate multiple development scenarios for exploration opportunities" and optimise/extend life of existing projects. Also signed **Cognite** to deploy an AI platform across the upstream asset base, and Emerson (Jul 2025) for a large-scale industrial data platform | [Offshore Technology](https://www.offshore-technology.com/news/totalenergies-mistral-oil-gas-ai-partnership/); [Upstream](https://www.upstreamonline.com/exploration/totalenergies-to-invest-in-next-level-ai-models/2-1-2043551); [DCD on Cognite](https://www.datacenterdynamics.com/en/news/totalenergies-signs-deal-with-cognite-to-deploy-ai-platform-across-upstream-asset-base/) | Jun–Jul 2025 |
| **Cognite** | **Cognite Atlas AI** — low-code industrial-agent workbench over Cognite Data Fusion, pre-built agents + "virtual employees." Customers named include **Aker BP, ADNOC Offshore, Hess, HMH, Idemitsu, Celanese, Tokuyama**; partners include SLB. Cognite also publishes an **LLM & SLM Benchmark Report for Industrial Agents** — i.e. a vendor whose differentiator is *evaluation* | [Cognite Atlas AI release](https://www.cognite.com/en/company/newsroom/cognite-atlas-ai-drives-customer-momentum-with-new-major-release); [LLM/SLM benchmark report](https://www.cognite.com/en/company/newsroom/cognite-launches-the-cognite-atlas-ai-llm-slm-benchmark-report-for-industrial-agents); [Aker BP expansion](https://worldoil.com/news/2025/9/16/aker-bp-expands-ai-first-strategy-with-cognite-to-transform-e-p-efficiency/) | 2024–2026 |
| **Chevron / ExxonMobil** | Both are visible mostly on the **AI-power-supply** side (Chevron + GE Vernova + Engine No. 1 JV for up to 4 GW of gas generation for US data centres, flagship 2.5 GW West Texas plant announced Nov 2025; ExxonMobil + NextEra 1.2 GW). Internally Chevron is reported to run proprietary platforms (APOLO for drilling optimisation, ApEX generative AI for exploration) and ExxonMobil invested in CoLab Software's AI engineering tool for offshore rigs. **I could not verify a direct Chevron–OpenAI or ExxonMobil–OpenAI enterprise deal from a primary source** — treat any such claim with suspicion | [JPT on Chevron/GE Vernova](https://jpt.spe.org/chevron-partners-with-ge-vernova-and-engine-no-1-to-power-up-ai-data-centers) | 2025 |
| **Deloitte / Accenture** | Deloitte's *2026 Oil and Gas Industry Outlook*: generative AI, agentic AI and real-time analytics "could move from pilots to enterprise-wide deployment" in 2026. Deloitte's *State of AI in the Enterprise*: agentic usage rising sharply but **only ~1 in 5 companies has a mature governance model for autonomous agents**. Accenture's *Scaling AI in Upstream Energy*: **64% of energy respondents trust insights from human colleagues more than AI-generated ones** — adoption depends on human-led operating models | [Deloitte outlook](https://www.deloitte.com/us/en/insights/industry/oil-and-gas/oil-and-gas-industry-outlook.html); [Deloitte on agent guardrails](https://www.deloitte.com/us/en/insights/topics/emerging-technologies/ai-agents-scaling-faster.html); [Accenture](https://www.accenture.com/us-en/insights/energy/scaling-ai-upstream-energy) | 2026 |

## B2. Skills that recur in postings

Verbatim from **SLB, Artificial Intelligence Engineer / Domain AI Integration, Houston** ([careers.slb.com job EF16148](https://careers.slb.com/jobdescription.aspx?id=EF16148-en_US+1), live 2026-09-18):

- *"Integrate AI Foundation services (FM Hub, Model Ops, AI Workspace, Agent Workspace, GenAI Infrastructure) into SLB digital products such as Delfi and Lumi."*
- *"Design and build end-to-end agentic solutions — including multi-agent systems, reasoning pipelines, and tool-use orchestration"*
- *"Collaborate with domain teams to define benchmark datasets, evaluation metrics, and acceptance criteria; establish continuous evaluation frameworks"*
- Required: *"Proven experience building and deploying agentic AI systems (multi-agent, tool-use, reasoning pipelines) in production"*; advanced degree in geophysics/geoscience/petroleum engineering/CS/EE/applied maths; *"Familiarity with geoscience, subsurface, or energy workflows; a strong understanding of domain problems is highly valued."*
- Preferred: developing **benchmarking pipelines and evaluation frameworks** for AI models; hands-on with seismic interpretation and reservoir simulation.

From **Halliburton Landmark AI/ML roles** (Houston; both listings have since closed, requirements captured from live listings):
- *"Own production AI/ML systems including monitoring, performance, and reliability"*
- *"Build and manage end-to-end ML pipelines with CI/CD and model lifecycle"*
- *"Design and deploy LLM-based solutions (RAG, prompt pipelines, vector search)"*
- Cementing AI/ML Engineer: experience with *"Generative AI, Large Language Models (LLMs), AI agents, or retrieval-augmented generation (RAG)"*, plus MLOps, containers, Git, CI/CD, SQL.

**The recurring stack, distilled:**

| Cluster | What they ask for |
|---|---|
| Retrieval | RAG architecture, chunking, vector search, hybrid/BM25, citation grounding |
| Agents | Multi-agent orchestration, tool use, reasoning pipelines, text-to-SQL over industrial data |
| **Evaluation** | Benchmark datasets, evaluation metrics, **acceptance criteria**, continuous/regression eval frameworks, LLM-as-judge |
| Data engineering | End-to-end pipelines, CI/CD, model lifecycle, monitoring, cloud AI infra |
| Domain | Subsurface/well construction/production workflows; **OSDU** literacy; WITSML/LAS/SEG-Y/DDR formats |
| Governance | The Deloitte gap — agent guardrails, oversight, provenance. Very few candidates can speak to this |

**Read on positioning:** your MSc + in-sector experience already satisfies the "strong understanding of domain problems" line that most AI-engineer applicants fail. What you're missing on paper is (a) shipped agentic systems and (b) an eval framework you built. Build exactly those two things.

---

# C) Ranked project ideas

Each is scoped so a competent data scientist can ship a defensible v1 in 3–6 weekends, with a stated "level 2" extension.

---

## 1. **End-of-well report Q&A with enforced citations, and a grounding-failure eval harness** ⭐ top pick

**Problem.** A petroleum engineer planning a well needs to know what happened last time in this formation: mud losses, stuck pipe, casing points, formation tops, DST results. The answers live in 500–1,500-page end-of-well report PDFs. Nobody reads them. Answers without a page citation are worthless — and worse than worthless in a well-planning context.

**Datasets.** Sodir FactPages wellbore document PDFs (**OPEN, no login**, NLOD) — build the index from the [exploration wellbore table](https://factpages.sodir.no/en/wellbore/tableview/exploration/all), then fetch `*_COMPLETION_REPORT.pdf`. Cross-join to Sodir structured wellbore attributes (spud date, TD, operator, formation tops, discovery). Optional second jurisdiction: NOPIMS Australian WCRs, to test whether your pipeline generalises across reporting conventions.

**LLM component.** Hybrid retrieval (BM25 + dense) over layout-aware chunks; a re-ranker; generation constrained to answer only from retrieved spans, emitting `well → document → page → quoted span` for every claim. Handle the hard parts honestly: scanned pages needing OCR, tables split across pages, units (m vs ft, ppg vs sg), and the fact that a single "well" may have sidetracks with near-identical names.

**Eval harness.** This is the centrepiece.
- **Golden set (~150–250 Q/A pairs).** Bootstrap cheaply: pick facts that exist in *both* the PDF narrative and the Sodir structured tables (TD, spud/completion dates, operator, formation at TD, wellbore content, discovery well Y/N). Those give you **free, automatically-verifiable ground truth with zero hand-labelling**. Then hand-write 50–80 harder questions (why was the sidetrack drilled; what caused the lost circulation; what was the DST flow rate) with page-level answer spans.
- **Metrics.** Answer correctness (exact/numeric-tolerant match for the auto-derived subset; LLM-judge with rubric for the hand-written subset), **citation precision/recall at page level**, retrieval recall@k, groundedness (does every sentence trace to a retrieved span), and an explicit **abstention metric** — questions whose answer is genuinely not in the corpus, where the correct behaviour is "not stated in this report."
- **Regression discipline.** Pin the golden set in the repo, run it in CI on every prompt/chunker/model change, and publish a results table with deltas and confidence intervals. Track cost and p95 latency per config.
- Borrow TADI's *Evidence Grounding Score* framing (measurements + attributed quotations + answer sections) and say so — citing prior art and then improving on it reads as maturity.

**Data engineering.** Incremental crawler with a manifest and content hashes; PDF → layout-aware text + tables; OCR fallback; document/page/chunk lineage in DuckDB or Postgres; embedding store; idempotent re-index; a `make reindex` that actually works from scratch. Track corpus stats over time.

**Difficulty.** Medium-high. **Why a hiring manager cares:** this is precisely the Tela / ENERGYai / Leucipa-assistant shape, on public data, with the citation and abstention behaviour that makes it deployable in a safety-relevant setting. And it's the rare portfolio project where the *eval* is the interesting part.

---

## 2. **Daily drilling report → NPT ledger: extraction + classification, with a hybrid eval and an explicit "is the LLM actually better?" arm**

**Problem.** Volve's 1,759 DDRs are free-text 24-hour operational narratives with proprietary activity codes. Converting them into a clean NPT ledger (event, start, end, duration, category, root cause, depth, hole section) is the classic upstream text problem, and NPT reduction is a direct P&L line.

**Datasets.** Volve DDRs (**FREE-REG** via Databricks Marketplace, Equinor Open Data Licence) — 1,759 XML files, confirmed parseable end-to-end. Join to Volve WITSML real-time channels and daily production. Optional extension into Sodir EOW reports (which embed daily activity reports) for cross-operator generalisation.

**LLM component.** Structured extraction against a Pydantic/JSON schema with constrained decoding; a two-level NPT taxonomy (category → subcause) aligned where possible to PHMSA-style cause coding conventions so the taxonomy isn't invented from thin air; few-shot → then a small fine-tune (LoRA on a 7–8B model) once you have labels, to demonstrate you can do the fine-tuning arm too.

**Eval harness.**
- Golden set: hand-label 200–300 DDR-days. Measure **inter-annotator agreement with yourself** (label 50 twice, a week apart, report Cohen's κ) — almost nobody does this, and it instantly signals you understand label noise.
- Metrics: per-field extraction F1, span-level accuracy, **duration-weighted** NPT category accuracy (an hour of misclassified stuck pipe matters more than a minute), schema-validity rate, hallucinated-field rate.
- **The honest arm:** run TF-IDF + gradient boosting, and a fine-tuned DeBERTa/ModernBERT classifier, against the same golden set. Report cost per 1,000 documents and latency alongside accuracy. **If the encoder wins on the classification sub-task — which it very plausibly will — say so, and scope the LLM to the parts it genuinely wins: free-form root-cause narrative, novel/unseen event types, and zero-shot coverage of a new operator's report format.** This single act of intellectual honesty will separate you from 95% of LLM portfolios.

**Data engineering.** WITSML/XML → normalised relational model; well-name reconciliation (TADI documents **three** incompatible naming conventions inside Volve alone — that's a real, demonstrable data-quality war story); dbt-style transformations with tests; a reproducible bronze/silver/gold layout.

**Difficulty.** Medium. **Why they care:** NPT classification is a named, budgeted workflow, and the "classic ML vs LLM" comparison is the conversation every AI lead in the sector is actually having.

---

## 3. **HSE incident root-cause extraction and taxonomy alignment across three regulators**

**Problem.** Safety learning doesn't transfer because every regulator codes causes differently. Can an LLM read narratives from three jurisdictions and map them onto one taxonomy, reliably enough to trust the resulting trend chart?

**Datasets — all open, all with real narratives:**
- **PHMSA flagged files** (**OPEN**) — 20 years, five system types, with **PHMSA's own harmonised cause/subcause labels alongside the originals**. This is a pre-built golden set that someone else paid for.
- **BSEE** (**OPEN**) — 2,018 incident-investigation records + long-form panel investigation report PDFs.
- **Havtil** (**OPEN**) — full Norwegian investigation reports in English, with the regulatory provisions they cite.

**LLM component.** Extraction of {equipment, barrier failed, immediate cause, underlying cause, consequence, regulatory provision cited} + classification into a unified taxonomy; retrieval over the long PDFs to support each extracted field with a quote.

**Eval harness.** PHMSA's own cause/subcause coding is your labelled test set for the US arm — measure agreement against it directly, per system type, with a confusion matrix showing *which* categories the model conflates. For BSEE/Havtil, hand-label a 100-incident sample. Critically, evaluate **calibration**: does the model's stated confidence track its accuracy? Add an **adversarial slice**: incidents where the narrative describes multiple contributing causes, and incidents where the narrative is three sentences long. Report per-slice performance, not just the headline number.

**Data engineering.** Three heterogeneous sources → one schema; date/unit/operator normalisation; entity resolution across operator name variants; a taxonomy crosswalk table maintained as versioned data, not code.

**Difficulty.** Medium. **Why they care:** process safety is where every operator wants AI and where nobody will deploy it without measured reliability. A calibration-aware safety-text system is a genuinely rare artifact.

---

## 4. **Agentic text-to-SQL over production and well data, with an execution-correctness eval**

**Problem.** "Which NCS fields declined more than 15% year over year in the last three years, and which operators ran them?" is a two-minute question for an analyst and a ten-second question for an agent — if it gets the SQL right.

**Datasets.** Sodir structured tables (**OPEN**) — ~9,800 wellbores, ~143 fields, monthly field production, ~1,810 licences, ~650 discoveries. Add **EIA bulk** (**OPEN**, no API key; petroleum zip 54 MB) and **BSEE production raw data** (**OPEN**) for a second and third schema. Join to Volve production records for well-level depth.

**LLM component.** A tool-using agent over DuckDB: schema retrieval, column-value sampling, query drafting, execution, error-driven self-repair, and a final natural-language answer that always shows the SQL it ran. Add one cross-domain tool — a retriever over the EOW/report corpus from project 1 — so the agent can answer "what happened at this field" as well as "how much did it produce." That hybrid structured+unstructured tool set is exactly ENERGYai's and TADI's architecture.

**Eval harness.** The strongest eval story in this list because ground truth is *executable*:
- Golden set of 120–200 natural-language questions with reference SQL. Score by **execution match** (do result sets agree, order-insensitively) rather than string match, plus exact-match as a secondary metric.
- Difficulty tiers: single-table filter → aggregation → multi-table join → window function/time-series → ambiguous questions requiring clarification.
- **Safety metrics:** rate of silently-wrong answers (query runs, returns plausible numbers, wrong semantics) — the single most dangerous failure mode; rate of appropriate clarification requests on deliberately ambiguous questions; guardrail tests (no DDL, no cross-schema leakage, row limits).
- Ablations: with/without schema retrieval, with/without value sampling, with/without self-repair, 2–3 model sizes. Report cost per resolved query.

**Data engineering.** Ingest Sodir CSV + EIA zip + BSEE ASCII (and, if you want the war story, an RRC **EBCDIC fixed-width** file) into a documented star schema with column descriptions the agent can actually retrieve; scheduled refresh; data-quality tests.

**Difficulty.** Medium. **Why they care:** "conversational interface over production data" is literally Baker Hughes' Lucy. Execution-match eval is the standard the field uses, and most candidates have never built one.

---

## 5. **Cited regulatory Q&A across US and Norwegian offshore regimes**

**Problem.** "What are the requirements for a subsea BOP test interval?" has a different answer in 30 CFR 250 than under Havtil's framework. Compliance staff need the answer *with the citation*, and the failure mode — a confidently wrong regulatory citation — is exactly the one LLMs are worst at.

**Datasets.** **eCFR Title 30 Part 250** (**OPEN**, HTML + daily bulk XML from GPO) and **Havtil's English regulations** (**OPEN**). Both are legally reusable, which is the whole point.

**Note prominently in your README:** API standards (14C, 17D, RP 500…) and NORSOK are paywalled and non-redistributable; this project deliberately uses public-domain regulation instead, and you can say why. Employers who deal with standards licensing will notice.

**LLM component.** Section-aware chunking that preserves the regulation's hierarchy (part → subpart → section → paragraph → subparagraph), since citations must be precise to the subparagraph. Retrieval + generation with mandatory citation; plus a **comparative mode** that answers "how do the two regimes differ on X" by retrieving from both and structuring the contrast.

**Eval harness.** Golden set of ~150 questions with exact reference citations (build it from the regulations' own cross-reference structure — sections cite each other, giving you free link-prediction-style test items). Metrics: **citation exact-match at paragraph level** (the headline metric — a right answer with a wrong citation scores zero), answer faithfulness, and a **trap set** of questions about provisions that were amended or removed, plus questions about topics genuinely not covered, to measure hallucinated-citation rate. Version the eCFR snapshot and show the harness catching a real regression when the regulation text updates.

**Data engineering.** Bulk XML → hierarchy-preserving parse; snapshot versioning with diffs between eCFR dates; a change-detection job that re-indexes only affected sections and re-runs the affected golden-set items. That temporal-versioning story is unusual and memorable.

**Difficulty.** Medium-low technically, high on rigour. **Why they care:** compliance Q&A is one of the few LLM use cases with an obvious ROI *and* an obvious liability, so it lives or dies on evaluation.

---

## 6. **Production anomaly narratives: numeric detector + LLM explainer, evaluated separately**

**Problem.** An anomaly detector fires on a well's rate/pressure. A production engineer needs to know *why*, in a sentence, with the supporting evidence.

**Datasets.** Volve production records (~15,634) + WITSML/real-time channels (**FREE-REG**); BSEE production-by-platform and OGOR-A well production (**OPEN**); Sodir monthly field production (**OPEN**). Link narratives to the EOW/DDR corpora from projects 1–2 for context ("this coincides with the workover described in the DDR of 2013-05-14").

**Architecture and the honest framing.** **The detection must not be done by an LLM.** Use a proper time-series method (STL/Prophet residuals, matrix profile, or an isolation forest on engineered features) — this is a case where classic ML is unambiguously better, cheaper, and more reliable. The LLM's job is strictly the *narrative* layer: assemble the detected event plus retrieved contextual evidence into a short, cited explanation, and flag when it has no supporting evidence.

**Eval harness.** Two independent evals, which is the pedagogical point:
- **Detector:** precision/recall against labelled events (derive labels from known shut-ins, workovers and interventions recorded in the DDRs — that's free, real ground truth).
- **Narrative:** a rubric-based LLM-judge (factual accuracy, evidence citation, actionability, appropriate hedging) validated against ~80 human-rated examples, reporting **judge–human agreement** so the judge itself is evidenced rather than assumed. Add a **false-narrative test**: feed the explainer anomalies with no contextual evidence available, and measure how often it invents a cause. That number is the project's headline result.

**Difficulty.** Medium-high (two systems). **Why they care:** it demonstrates the judgement to *not* use an LLM where it doesn't belong, plus the rarer skill of validating an LLM judge.

---

## 7. **Petroleum-domain eval suite + small-model fine-tune: "can a 7B beat GPT-class on our narrow task, at 5% the cost?"**

**Problem.** Operators are cost-sensitive and increasingly data-sovereignty-sensitive. The live question at Cognite and elsewhere is which model is *enough*. Cognite literally publishes an LLM & SLM benchmark report for industrial agents — this project is your version of that.

**Datasets.** Your own golden sets from projects 1–3 (that's the point of building them); **GeoBench** from the K2 repo (**OPEN**); optionally re-implement PetroBench's structure from the paper (the benchmark itself does not appear to be publicly released, so build your own in its shape and say so). **Do not** scrape PetroWiki — it is not open-licensed. Fine-tuning corpus: Sodir EOW reports + eCFR 30 CFR 250 + Havtil reports, all legally reusable.

**LLM component.** LoRA/QLoRA fine-tune of a 7–8B open model on domain extraction/QA derived from the corpora; compare against K2, GeoGalactica, and 2–3 frontier APIs.

**Eval harness.** A reusable harness (a thin, well-tested one of your own, or a documented layer over an existing framework) that runs any model against any task with fixed seeds, reports mean ± CI over repeated runs, and produces a **cost-vs-quality Pareto plot**. Include PetroBench's most interesting reported finding as a hypothesis to test: *models score well on subjective/short-answer items but are weak at factual-knowledge discrimination.* Confirm or refute it on your own tasks — that's an actual research contribution, not a demo.

**Difficulty.** High. **Why they care:** it maps one-to-one onto SLB's "define benchmark datasets, evaluation metrics, and acceptance criteria; establish continuous evaluation frameworks."

---

## 8. **Geoscience literature RAG with a "who disagrees with whom" mode** (lower priority)

**Problem.** Reviewing published work on a play or a CCS site means reconciling papers that disagree.

**Datasets.** arXiv physics.geo-ph, EarthArXiv, open-access Netherlands Journal of Geosciences and GJI articles, USGS publications, CO2DataShare's report packages (**FREE-REG**). All redistributable or at minimum linkable.

**LLM component.** RAG with claim extraction and contradiction detection across documents.

**Eval harness.** Hand-curated contradiction pairs; metrics on contradiction detection F1 and citation accuracy.

**Difficulty.** Medium. **Why it ranks last:** it's the least oil-and-gas-specific idea here. Generic literature RAG is a crowded portfolio genre, and it doesn't showcase the domain knowledge that is your actual edge. Do it only if you want a lighter fifth project.

---

## Where the honest answer is "don't use an LLM"

| Task | Better approach | Why |
|---|---|---|
| **Lithology prediction from well logs** (FORCE 2020, Geolink) | Gradient boosting / 1D CNN on the log curves | Numeric, tabular, abundant labels. An LLM is slower, costlier and worse. Use FORCE 2020 as a *control arm* to prove you know the difference |
| **Production forecasting / decline curve analysis** | Arps, DCA, ARIMA, physics-informed models | Well-posed parametric problem with established engineering methods |
| **Anomaly detection in sensor streams** | Statistical/classical time-series and isolation forests | See project 6 — LLM belongs on the explanation, not the detection |
| **Seismic interpretation, fault and horizon picking** | CNNs/U-Nets and now geoscience foundation models | Vision problem |
| **Missing-log imputation** | The published benchmark's methods | Numeric |
| **Structured code assignment where a clean code list already exists** | A fine-tuned encoder classifier | Cheaper, faster, more stable than a generative model. Relevant to project 2's NPT sub-task |
| **Anything safety-critical with no human in the loop** | Don't. | Deloitte: only ~1 in 5 organisations has mature governance for autonomous agents. Accenture: 64% of energy respondents trust human colleagues over AI. Design for review, and say so |

Equinor's own framing is the one to quote when someone asks why your portfolio has a classical-ML control arm: they *primarily* use traditional ML on operational data, and reserve copilots/chatbots/agents for the tasks where language is the medium. Text-heavy workflows — reports, incidents, regulations, narratives — are exactly where LLMs earn their place, and every top-ranked project above sits there deliberately.

---

## Suggested sequencing

1. **Project 1** (EOW report Q&A + citation eval) — fully open data, no registration friction, biggest differentiation, best story.
2. **Project 4** (agentic text-to-SQL) — reuses the Sodir pipeline, adds the agent + execution-match eval, fastest second win.
3. **Project 2** (DDR → NPT, with the classic-ML control arm) — needs the Databricks registration; start that account early.
4. **Project 3 or 5** depending on whether you want safety or compliance as your second domain.
5. **Project 7** only once you have two golden sets worth benchmarking against.

Merge 1 and 4 into a single deployed assistant with both retrieval and SQL tools, and you have, on open data, a credible small-scale replica of what ADNOC paid $340 M for — with the evaluation evidence that the press releases never show.

---

## Verification log

All URLs below were checked on **2026-09-18**.

- **Fetched successfully and content confirmed:** Sodir wellbore document PDF (6506/3-1), Sodir FactPages EN + attributes, Zenodo FORCE 2020 record (files, sizes, CC BY 4.0), Equinor data-sharing page, Equinor Open Data user-guide PDF (Databricks route, "Free"/"Public", sign-in prompt), Equinor Jan 2026 AI-value release, EIA bulk-files page (formats and sizes), BSEE Incident Investigations table (2,018 records; PDF/XLS/XLSX/RTF/CSV), BSEE Raw Data index, Texas RRC dataset list (full URL set), KGS LAS page (~21,780 wells), UK NDR portal (registration model), NLOG data-supply page, NOPIMS landing page, arXiv PetroBench and TADI abstracts, Hugging Face GainEnergy card, SLB Digital Marketplace release, JPT SLB–Shell article (18 Dec 2025), SLB job description EF16148.
- **Blocked to automated fetch but confirmed via multiple secondary descriptions:** PHMSA flagged-files page (403 to bots), sodir.no open-data page (403), OSDU GitLab open-test-data (Access Denied), CO2DataShare dataset index (503), UiS Volve CSV mirror (403). All are reachable in a normal browser; re-verify interactively before relying on them.
- **Could not verify from a primary source (treat as unconfirmed):** any direct Chevron–OpenAI or ExxonMobil–OpenAI enterprise agreement; Chevron's internal "APOLO" and "ApEX" platform names appear only in secondary/aggregator coverage. Aramco METABRAIN's 250 B parameters and 7 T tokens come from trade press, not aramco.com — Aramco's own page states the $1.8 bn 2024 value, 442 use cases and 200+ deployed solutions but does not mention METABRAIN by name.
- **Explicitly not open:** PetroWiki (SPE copyright, not licensed for reuse), API standards, NORSOK standards, OnePetro/SPE papers, Diskos membership.
