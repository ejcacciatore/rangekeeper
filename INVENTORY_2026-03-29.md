# Repository Inventory — March 29, 2026

**Generated:** 2026-03-29 05:46 UTC  
**Total Size:** ~326MB in workspace  
**Major Addition:** Tax documents archive (2018–2025) + Finance automation system specs

---

## 🗂️ NEW: Tax Documents Archive (`tax-docs-2025/`)

### Summary
**326MB total** — 14 zip files containing 8 years of tax records + finance system architecture docs

### Zip Files (13 archives)
```
2018_Taxes.zip           635 KB   → W-2s, HSA, CP2000 correspondence
2019_Taxes.zip           1.5 MB   → 1040, Schedule C, CP2000 response
2020_Taxes.zip           346 KB   → Au pair records, 1099-MISC
2021_Taxes.zip           7.5 MB   → W-2, 1099-NEC, transcripts
2022_Taxes.zip           5.8 MB   → Schedule C, BMW payoff, ES payments
2023_Taxes.zip           5.8 MB   → 1040, Schedule C, AMEX/Fidelity card data
2024_Taxes.zip            17 MB   → Tax return, financials, credit card data
2025_Taxes_Part1.zip      13 MB   → Current year docs (Part 1/4)
2025_Taxes_Part2.zip      13 MB   → Current year docs (Part 2/4)
2025_Taxes_Part3.zip      18 MB   → Current year docs (Part 3/4)
2025_Taxes_Part4.zip     9.8 MB   → Current year docs (Part 4/4)
General_Taxes.zip         10 MB   → Miscellaneous tax records
finance-system-docs.zip   88 KB   → NEW: Finance automation master specs
```

### Extracted Content
**175 files** extracted (PDFs, Excel, CSV, Word docs) across 13 folders:
- `2018_Taxes/` through `2024_Taxes/` — Historical tax returns & supporting docs
- `2025_Taxes_Part1/` through `Part4/` — Current filing year data
- `General_Taxes/` — Miscellaneous records
- `finance-system-docs/` — **NEW ARCHITECTURE DOCS** (see below)

### Key Document Types
- **Tax returns:** 1040s, Schedule Cs (2018–2024)
- **Income docs:** W-2s, 1099-NECs, 1099-SAs, HSA statements
- **Expense tracking:** Credit card statements (AMEX, Fidelity, Barclays), transaction spreadsheets
- **IRS correspondence:** CP2000 notices & responses (2018, 2019)
- **Special items:** Au pair records, BMW payoff, quarterly ES payments
- **Business records:** Kate (wife) real estate 1099s, Sapinover AMEX

---

## 📊 NEW: Finance System Architecture (`finance-system-docs/`)

**13 master specification documents** for automated tax/finance system:

### Core Architecture
1. **01_FINANCE_SYSTEM_MASTER.md** — Project overview, entities (Enrico/Sapinover LLC + Kate/KC Homes real estate), data sources (Tiller, Gmail, Plaid)
2. **02_ACCOUNTS_REGISTRY.md** — All bank accounts, credit cards, investment accounts with IDs & purposes
3. **03_TAX_CATEGORIES_MAP.md** — Transaction category → Schedule C line mapping
4. **04_SCHEDULE_C_WORKSHEET_2025.md** — Working spreadsheet template for 2025 filing
5. **05_DATA_PIPELINE_SPEC.md** — ETL architecture (Plaid → Tiller → Supabase → MCP servers)
6. **06_SUPABASE_SCHEMA.md** — Database design (transactions, accounts, tax_mappings, vendors, etc.)

### Automation & Tooling
7. **07_MCP_SERVER_SPEC.md** — Model Context Protocol servers for Claw to query/update financial data
8. **08_GMAIL_RULES.md** — Email filters & auto-labeling for receipts, invoices, statements
9. **10_VENDOR_CATEGORIZATION_RULES.md** — Business logic for auto-categorizing vendors → tax categories

### Tax Strategy
9. **09_DEDUCTIONS_CHECKLIST.md** — Comprehensive deduction opportunities (home office, mileage, depreciation, etc.)

### Product Vision
11. **11_PRODUCT_VISION.md** — Long-term SaaS productization strategy (target: real estate agents, dual self-employed households)
12. **12_SESSION_HANDOFF.md** — Operational handoff docs for Claw sessions
13. **13_SESSION_LOG_2026_03_28.md** — Work log from system build session

**Key Insight:** This is a complete blueprint for a personal → productized finance automation platform. Zero-touch data ingestion → real-time tax liability dashboard → TurboTax export.

---

## 💼 Business Projects

### 1. KeyLedger (`keyledger/`) — Bookkeeping Automation SaaS
**Status:** Pre-launch, MVP in design  
**Docs (6 files, 96KB):**
- `CONTEXT.md` — Product positioning
- `MILLION_DOLLAR_PLAN.md` — Revenue roadmap ($1M ARR target)
- `LANDING_PAGE_COPY.md` — Marketing website copy
- `AGENT_ONBOARDING_FLOW.md` — User signup/activation flow
- `SOFTLOCK_FEATURE_SPEC.md` — Core "Softlock" compliance feature
- `MVP_ROADMAP_90_DAYS.md` — 90-day launch plan

**Target:** Small businesses, accountants, bookkeepers  
**Differentiator:** AI-powered automated bookkeeping with compliance guardrails

---

### 2. Rangekeeper (`rangekeeper/`) — Canvas LMS Grade Automation
**Status:** Active development, MVP deployed to Massimo (first user)  
**Size:** 200KB docs + full codebase (Next.js + Discord bot + Chrome extension)

#### Documentation (13 files)
- `RANGEKEEPER_SESSION.md` — Active project session context
- `MASSIMO_GUIDE.md` & `MASSIMO_INSTALL_GUIDE.md` — User onboarding for first customer
- `GRADES_MESSAGES_UPDATE.md` — Latest feature: Grades messaging system
- `MANUAL_SYNC_TEST.md` — QA testing log
- `ARCHITECTURE.md`, `BUILD_SUMMARY.md`, `STATUS.md` — Technical specs
- `ACTION_PLAN.md`, `SETUP_GUIDE.md` — Deployment & ops
- `RESEARCH_REPORT.md` — Initial research on Canvas LMS integration
- `rangekeeper-extension.tar.gz` — Packaged Chrome extension

#### Codebase Structure
```
backend/        Discord bot + API server (Node.js)
extension/      Chrome extension (manifest v3)
src/            Next.js frontend
prisma/         Database schema
docs/           API & LMS integration specs
```

**What it does:** Syncs Canvas LMS assignment due dates → Discord → automated student reminders  
**First user:** Massimo (high school student), deployed March 2026  
**Revenue model:** Not yet defined (currently free for Massimo)

---

### 3. Sapinover Scaffold (`sapinover-scaffold/`) — Operational Resilience Website
**Status:** Design/development scaffold, not launched  
**Structure:** 10 task folders with modular components

#### Task Breakdown
1. **task-1-research-blog** — Blog/insights section
2. **task-2-live-ticker** — Real-time news/threat feed
3. **task-3-waitlist-widget** — Email capture widget
4. **task-4-brief-teaser** — Service teaser content
5. **task-5-score-delta** — Risk scoring visualization
6. **task-8-seo-metadata** — SEO optimization
7. **task-9-radiant-shaders** — Visual design (shader effects)
8. **task-10-geopolitical** — Geopolitical risk analysis content

#### Meta Docs
- `README.md` — Project overview
- `EXECUTION_CHECKLIST.md` — Build checklist
- `INTEGRATION_GUIDE.md` — Component integration instructions
- `DEPENDENCIES.md` — Technical dependencies

**Business Context:** Sapinover LLC (Rico's consulting company) — intelligence/special ops expertise → operational resilience consulting  
**Current Status:** Live site is bare (home + about only). This scaffold = full redesign, not deployed.

---

### 4. SuperClaw (`superclaw/`) — Meta-Framework for AI Business Operations
**Status:** Conceptual framework + templates  
**Size:** 44KB docs

#### Core Docs
- `README.md` — Framework overview
- `SUPERCLAW.md` — Philosophy & architecture
- `BUSINESS-MODELS.md` — Revenue model templates (SaaS, marketplace, services)
- `GTM-PLAYBOOKS.md` — Go-to-market strategies
- `SETUP.md` — Implementation guide

#### Supporting Folders
- `business-ops/` — Operational playbooks
- `examples/` — Reference implementations
- `openclaw/` — OpenClaw integration patterns
- `scripts/` — Automation scripts
- `templates/` — Reusable business document templates

**What it is:** Meta-system for using AI (Claw) to run businesses — repeatable patterns for ops, sales, product, finance.  
**Use case:** Accelerate all of Rico's ventures using structured AI augmentation.

---

### 5. Tax Engine (`tax-engine/`) — MCP-Based Tax Automation
**Status:** Active development (companion to finance-system-docs)  
**Size:** 120KB docs + Node.js codebase

#### Docs
- `README.md` — Quick overview
- `PROJECT-SUMMARY.md` — Full project scope
- `QUICKSTART.md` — Setup instructions
- `WORKFLOW-RICO.md` — User workflow for Rico
- `IMPLEMENTATION-STATUS.md` — Build status tracker
- `NEXT-STEPS.md` — Roadmap

#### Codebase
```
config/         System configuration
data/           Transaction data (local cache)
mcps/           MCP server implementations
scripts/        Data processing & automation scripts
node_modules/   Dependencies (installed)
```

**Purpose:** Executable implementation of the finance system specs — connects Tiller → Supabase → MCP servers → Claw  
**Goal:** Automated 2025 tax filing + real-time tax liability dashboard

---

## 📝 Memory & Context Files

### Core Agent Files (Root)
- `AGENTS.md` — Agent operating instructions (memory, behavior, boundaries)
- `SOUL.md` — Claw's personality & values
- `TOOLS.md` — Local tool configuration notes
- `IDENTITY.md` — Who Claw is (name, vibe, creature = "AI operator")
- `USER.md` — Rico's profile (background, businesses, goals)
- `HEARTBEAT.md` — Proactive task checklist (email, calendar, social)
- `MEMORY.md` — Long-term curated memory (not in shared contexts)

### Memory Logs (`memory/`)
- `2026-03-15.md` — Daily log (March 15)
- `2026-03-18.md` — Daily log (March 18)
- `2026-03-24.md` — Daily log (March 24)
- `2026-03-29.md` — Daily log (today)
- `tax-knowledge-base-2025.md` — Tax-specific reference notes

**Pattern:** Daily markdown logs (YYYY-MM-DD.md) + topic-specific knowledge bases

---

## 🎯 KEY INSIGHTS

### What Just Arrived (New in Last 24 Hours)
1. **Tax archive:** Complete 8-year history (2018–2025) — 175 PDFs/spreadsheets
2. **Finance system specs:** 13-doc master architecture for automated tax/finance platform
3. **Tax engine codebase:** Working MCP server implementation

### Active Projects (By Priority)
1. **Tax filing 2025** — Immediate deadline (April 15 or extension)
2. **Rangekeeper** — Live with first user (Massimo), active feature development
3. **KeyLedger** — Pre-launch, MVP design complete
4. **Finance automation** — Building toward long-term SaaS product

### Dormant/Scaffolded Projects
- **Sapinover website redesign** — Scaffold exists, not deployed
- **SuperClaw framework** — Documentation/templates, no active build
- **AlcyoneX** — Empty (no files found)
- **World Specialties** — No files in workspace (live site exists)

### Revenue-Generating Status
**Current:** None of these projects are generating the target $45K/month yet.  
**Nearest revenue opportunities:**
1. KeyLedger (MVP → beta → paid customers)
2. Finance system → SaaS productization
3. Sapinover (consulting sales, needs active website)

---

## 📊 File Count Summary

```
Tax documents:     175 files (PDFs, XLSX, DOCX, CSV)
Finance specs:      13 markdown files
KeyLedger docs:      6 markdown files
Rangekeeper docs:   13 markdown files + full codebase
Sapinover scaffold: 10 task folders + 4 meta docs
SuperClaw:           5 core docs + templates
Tax engine:          6 docs + Node.js project
Memory/context:     10 markdown files
```

**Total meaningful project docs:** ~70+ markdown files outside of node_modules

---

## 🚀 NEXT ACTIONS (Recommendations)

### Immediate (Tax Deadline Driven)
1. **Process 2025 tax data** — Use finance-system-docs + tax-engine to generate Schedule C for Rico & Kate
2. **Extract key 2025 deductions** — Review 2025_Taxes_Part1-4 for overlooked deductions
3. **File or extend** — April 15 deadline = 17 days away

### High-Impact Revenue Moves
1. **KeyLedger beta launch** — MVP is spec'd, time to build & get first 10 customers
2. **Sapinover live site** — Deploy task scaffold → turn bare site into credible consulting presence
3. **Rangekeeper monetization** — Define pricing, add 5 more users (students or teachers)

### Infrastructure
1. **Supabase setup** — Deploy database schema from 06_SUPABASE_SCHEMA.md
2. **MCP servers** — Finish tax-engine implementation
3. **Gmail automation** — Implement rules from 08_GMAIL_RULES.md for passive receipt capture

---

**End of Inventory**
