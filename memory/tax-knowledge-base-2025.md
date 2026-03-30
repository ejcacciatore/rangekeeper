# Tax Knowledge Base 2025
**Created:** 2026-03-29
**Status:** Complete extraction and initial indexing
**Source:** GitHub repo tax-docs-2025 (13 zip archives, 276 files)

---

## EXECUTIVE SUMMARY

**Rico's 2025 Tax Situation:**
- **Filing Status:** Married Filing Jointly
- **Two Schedule C businesses:** Sapinover LLC (Rico) + KC Homes (Wife - real estate agent)
- **Gross Business Income:** $752,341.52 (combined, unallocated between entities)
- **Total Expenses (INCOMPLETE):** $318,994.42
- **Tentative Net Profit:** $435,347.10 (before missing deductions)
- **Critical Gap:** 850 uncategorized transactions totaling $811,666
- **Deadline:** April 15, 2026 (or Form 4868 extension)

**Key Issue:** Income is showing as combined but not properly allocated to Sapinover vs KC Homes. Expenses are dramatically understated due to broken Tiller connections and uncategorized transactions.

---

## REPOSITORY STRUCTURE

### Total Files: 276
- **13 MD files** (finance-system-docs package)
- **131 PDFs** (statements, 1099s, receipts, returns)
- **35 Excel/CSV files** (transaction data, categorizations)
- **97 other files** (images, HTML exports, misc)

### Archives Breakdown:
1. **2018_Taxes.zip** (635KB) — 4 files (W-2, CP2000 response, HSA)
2. **2019_Taxes.zip** (1.5MB) — 3 files (1040, Schedule C, CP2000 response)
3. **2020_Taxes.zip** (346KB) — 5 files (1099-MISC, au pair docs, payment confirmations)
4. **2021_Taxes.zip** (7.5MB) — W-2, 1099-NEC, transcripts
5. **2022_Taxes.zip** (5.8MB) — Kate's 1040/Schedule C, BMW payoff, Amex data
6. **2023_Taxes.zip** (5.8MB) — Full return, Kate's 1099/Schedule C, Amex/Fidelity data, CSV categorizations
7. **2024_Taxes.zip** (17MB) — Full return, 1099s, financials workbook, business Amex data
8. **2025_Taxes_Part1.zip** (13MB) — 1 scanned document
9. **2025_Taxes_Part2.zip** (13MB) — 12 PDFs (credit card statements Jan-Jul 2025, brokerage 1099 instructions)
10. **2025_Taxes_Part3.zip** (18MB) — 28 PDFs (credit card statements 2024-2025)
11. **2025_Taxes_Part4.zip** (9.8MB) — **CRITICAL** — 46 files including:
    - Venmo statements (Sep 2024 - Jul 2025)
    - AutoCat worksheets (multiple versions)
    - Full 2025 transaction data
    - Amex/Fidelity data exports
    - 1098 (mortgage), 1099-INT, UTMA 1099
    - Estimated tax payments
12. **General_Taxes.zip** (10MB) — Reference materials, Tiller templates, MCC codes, PPP docs, 1099-K
13. **finance-system-docs-2026-03-28.zip** (88KB) — **MASTER CONTEXT** — 13 MD files

---

## KEY DOCUMENTS (MARKDOWN FILES)

All located in: `finance-system-docs-2026-03-28/finance-system-docs/`

### 01_FINANCE_SYSTEM_MASTER.md
- **Purpose:** Overall project overview
- **Key Data:** Entity definitions, current tax numbers, 2025 filing sprint plan, long-term platform vision
- **Critical Numbers:**
  - Gross receipts: $752,341.52
  - Expenses (incomplete): $318,994.42
  - Tentative profit: $435,347.10
  - 850 uncategorized transactions / $811,666
- **Timeline:** 3-5 day sprint to file 2025 taxes

### 02_ACCOUNTS_REGISTRY.md
- **Purpose:** Complete inventory of all financial accounts
- **Entity Attribution:** ENRICO, SAPINOVER, KC_HOMES, JOINT
- **Broken Connections (HIGH PRIORITY):**
  - TD Bank (4 days stale) — primary spending account
  - E*TRADE (17 days stale) — RSUs/ESPP
  - PayPal (~1 year stale) — major business gap
  - Venmo x2 (~1 year stale) — major P2P/commission gap
- **Accounts by Provider:**
  - Amex: 13 cards (5 Sapinover Business Platinum, others personal/TBD)
  - Bank of America: 3 accounts (checking, savings, credit)
  - TD Bank: 2 checking accounts (NEEDS FIX)
  - USAA: 4 accounts (checking, savings, Visa, loan)
  - Fidelity: 6 accounts (brokerage, retirement, credit card)
  - E*TRADE: 1 stock plan account (NEEDS FIX)
  - PayPal: 1 account (NEEDS FIX)
  - Venmo: 2 accounts (both NEED FIX)

### 03_TAX_CATEGORIES_MAP.md
- **Purpose:** Tiller category → Schedule C line item mapping
- **Use:** For AI categorization rules and AutoCat setup

### 04_SCHEDULE_C_WORKSHEET_2025.md
- **Purpose:** Pre-filled TurboTax entry reference
- **Sapinover LLC (Schedule C #1):**
  - Gross receipts: $0 (WRONG — needs fixing)
  - Total expenses: $10,417.73 (VERY LOW — incomplete)
  - Line items: advertising $72, car $3,601, office $509, meals $5,100, travel $902
- **KC Homes (Schedule C #2):**
  - Gross receipts: NEEDS 1099-NEC from broker
  - Total expenses: incomplete
  - Advertising: $90,618 (VERIFY — seems very high)
  - Contract labor: $57,341 (MUST ISSUE 1099-NECs to contractors)
  - Car: $14,300 OR switch to mileage method (likely higher)
  - Insurance: $22,351 (E&O, business liability)

### 05_DATA_PIPELINE_SPEC.md
- **Purpose:** Automation architecture for future platform

### 06_SUPABASE_SCHEMA.md
- **Purpose:** Database schema for long-term finance platform

### 07_MCP_SERVER_SPEC.md
- **Purpose:** Claude MCP server spec for local AI automation

### 08_GMAIL_RULES.md
- **Purpose:** Email automation for receipt capture

### 09_DEDUCTIONS_CHECKLIST.md
- **Purpose:** COMPREHENSIVE deduction inventory
- **Sapinover Categories:**
  - Advertising/marketing (domains, hosting, ads, SEO tools)
  - Software subscriptions (Claude, Julius AI, VS Code tools, cloud storage)
  - Office expenses (likely very incomplete — need to add all SaaS)
  - Business insurance, legal/professional, travel, meals
  - Home office (if applicable)
- **KC Homes Categories:**
  - Advertising: Zillow, Realtor.com, photography, virtual tours, signs
  - Mileage: CRITICAL — standard rate $0.70/mile likely beats actual
  - Commissions/fees paid to other agents
  - Contract labor: transaction coordinators, assistants (MUST ISSUE 1099s)
  - E&O insurance, MLS fees, NAR dues, license fees
  - Meals with documented business purpose
- **Joint/Above-the-Line:**
  - Self-employed health insurance (100% deductible)
  - 50% of SE tax (auto-calculated)
  - SEP-IRA contributions (up to ~$85K at $435K profit — HUGE saver)

### 10_VENDOR_CATEGORIZATION_RULES.md
- **Purpose:** AI rules for merchant name → category mapping

### 11_PRODUCT_VISION.md
- **Purpose:** Long-term SaaS productization strategy
- **Target Market:** Real estate agents (1.5M NAR members)
- **Pricing:** $39-49/month household, $199/month CPA white-label
- **GTM:** Wife's brokerage → coaching programs → NAR affiliates

### 12_SESSION_HANDOFF.md
- **Purpose:** Context for AI session continuity

### 13_SESSION_LOG_2026_03_28.md
- **Purpose:** Working session notes from tax prep sprint

---

## 2025 TAX DATA (CRITICAL FILES)

Located in: `2025_Taxes_Part4/`

### Transaction Data (Multiple Versions)
- **2025_Transactions.xlsx** — Full export from Tiller
- **2025_AUTOCAT.xlsx** — AutoCat categorization attempt
- **2025_AUTOCAT_FINAL_v2.xlsx** — Latest categorization version
- **AUTO_CAT_20250407v1.xlsx** — Another categorization pass
- **autocat_2025_0703.csv** — CSV export
- **Income_Expense_2025.xlsx** — Aggregated summary

### Credit Card Data
- **Business_Amex_2025_07.xlsx** — Business Platinum through July 2025
- **Platnium_EC_2025_07.xlsx** — Rico's personal Platinum
- **Gold_Card_KC_2025_07.xlsx** — Kate's Gold Card
- **SkyMiles_Kate_2025_07.xlsx** — Kate's Delta card
- **Skymiles_EC_2025_07.xlsx** — Rico's Delta card
- **Barclaycard_2025.xlsx** — Upromise card
- **Fidelity - 1147_01-02-2025_07-08-2025.csv** — Fidelity credit card

### Venmo Statements (Sep 2024 - Jul 2025)
- VenmoStatement_SEP_2024 through VenmoStatement_JUL_2025
- **Critical:** Captures P2P transactions and commission splits not in Tiller

### 1099 Forms
- **1099-INT- Interest Income Summary.pdf** — Bank interest
- **2025-Uniform-Transfers-to-Minors-UTMA--1577-Consolidated-Form-1099.pdf** — Child account
- **December 2025 1099-INT.pdf** — Another interest form

### 1098 Mortgage Interest
- **December 2025 1098.pdf** — Deductible mortgage interest
- **mortgage _20250815_primary.pdf** — Primary mortgage statement

### Estimated Tax Payments
- **Payment Confirmation072025.pdf** — Q2 or Q3 payment
- **estimatedpayment_20250716.pdf** — July payment
- **federal estimated tax payment 2025.pdf** — Federal payment
- **2025ct estimated tax.pdf** — Connecticut payment

### Credit Card Statements (PDFs)
- Fidelity statements: View PDF Statement_2024-*.pdf through 2025-08-17
- Barclaycard statements: CreditCardStatement202501* through 202506*
- BarclayCards_summary.pdf — Annual summary

---

## HISTORICAL TAX RETURNS (2018-2024)

### 2018
- W-2 from employment
- CP2000 response (IRS notice for unreported income)
- HSA documentation

### 2019
- Full 1040 + Schedule C
- CP2000 response

### 2020
- 1099-MISC (Gail)
- Au pair documentation
- IRS payment confirmations

### 2021
- 1099-NEC (Gail)
- W-2 (Voya employment)
- Tax return transcript

### 2022
- Kate's full 1040 + Schedule C (first year of KC Homes business)
- BMW payoff documentation
- Estimated tax payments

### 2023
- Full tax return
- Kate's 1099 + Schedule C
- Amex data exports (both Enrico and Kate)
- Fidelity credit card data
- CSV categorizations

### 2024
- **2024_TAX_RETURN.pdf** — Full filed return (reference for 2025)
- **Kate's 1099_kate_2024.pdf** — Commission income from broker
- **1099_sa_2024.pdf** — HSA distributions
- **2024_Financials.xlsx** — Complete financial workbook
- **Business_Amex_2024.xlsx** — Full year business card data

---

## REFERENCE MATERIALS (General_Taxes)

### Tiller Templates
- **Tiller-Foundation-Template (2).xlsx** — Current Google Sheets template
- **Tiller_Categories.xlsx** — Category definitions
- **Tiller_Transaction_Descriptions.xlsx** — Transaction history
- **Updated_Tiller_Category___Group_List.csv** — Mapping rules
- **AutoCat_Tiller_mapping_v1.xlsx** — AutoCat configuration

### Tax Reference
- **Merchant-Category-Codes.pdf** — MCC code reference
- **mcc_codes.xlsx** — MCC lookup table
- **merchant_conversion.csv** — Merchant name standardization
- **IP PIN.pdf** — IRS Identity Protection PIN
- **cp21b.pdf** — IRS notice

### Business Documents
- **sapinover_1099_K.pdf** — 1099-K issued to Sapinover (payment processor reporting)
- **Kform_PPP.pdf** — PPP loan documentation
- **UBS-1099.pdf** — Investment income

### Misc Receipts
- Child care receipts
- Insurance proof
- Municipal tax payments (Fairfield CT, NYC)
- Various payment confirmations

---

## CRITICAL GAPS & ACTION ITEMS

### URGENT — Data Collection (Day 1)
1. **Fix Tiller Connections:**
   - TD Bank (4 days stale) — PRIMARY spending account
   - E*TRADE (17 days stale) — RSU/ESPP vesting/sales
   - PayPal (~1 year) — business transactions
   - Venmo x2 (~1 year) — P2P, commission splits
2. **Get Kate's 1099-NEC from broker** — authoritative gross income
3. **Run AutoCat on 850 uncategorized transactions** — $811K unallocated
4. **Download all 2025 tax documents from Gmail** — search: from:(*1099* OR *1098* OR *w2*) after:2025/01/01

### HIGH PRIORITY — Allocation & Review (Day 2)
1. **Allocate $752K gross income** between Sapinover and KC Homes
2. **Review AutoCat results** — fix miscategorizations
3. **Verify KC Homes advertising** — $90K seems very high, confirm legitimate
4. **Identify Amex card ownership** — which Business Platinum cards are Sapinover vs Kate
5. **Calculate Kate's mileage** — likely higher deduction than $14K actual expense

### MEDIUM PRIORITY — Deduction Hunting (Day 3)
1. **Software subscriptions** — Claude, Julius AI, Anthropic, Google One, etc.
2. **Home office calculation** — if applicable (300 sq ft × $5 = $1,500 simplified)
3. **Health insurance premiums** — if self-paid (100% deductible above-the-line)
4. **Quarterly estimated tax payments** — locate all 4 confirmations for 2025
5. **SEP-IRA contribution** — consider maximizing (~$85K available at $435K profit)

### COMPLIANCE — 1099-NEC Issuance
- **Kate paid $57K in contract labor** — identify every contractor >$600
- **Issue 1099-NECs by Jan 31** (may already be late — file ASAP or risk penalty)
- **Forms needed:** 1099-NEC + 1096 transmittal

### TAX PLANNING — Deduction Maximization
1. **SEP-IRA:** At $435K net profit estimate, can contribute ~$85K and save ~$30K+ in tax
2. **Mileage method:** Kate likely has 15,000+ business miles × $0.70 = $10,500+ vs $14,300 actual
3. **QBI deduction:** Both businesses qualify for 20% deduction (auto-calculated by TurboTax)
4. **Health insurance:** If self-paid, 100% deductible above-the-line (not Schedule A)

---

## AUTOMATION STRATEGY (LONG-TERM)

### Phase 1: Fix Current State (Weeks 1-2)
- Repair all Tiller connections
- Run AutoCat on backlog
- File 2025 taxes accurately

### Phase 2: Build Intelligence Layer (Months 1-2)
- Supabase schema deployment
- Tiller → Supabase sync (n8n)
- MCP server for Claude integration
- Basic dashboard

### Phase 3: Passive Capture (Months 2-4)
- Gmail API → receipt extraction (Mindee OCR)
- MileIQ integration for Kate
- iOS Shortcut for one-tap receipt capture
- Automated categorization (DeepSeek bulk + Claude review)

### Phase 4: Real-Time Tax Liability (Months 4-6)
- Quarterly tax calculator
- Anomaly detection
- Deduction recommendations
- Year-end tax projection

### Phase 5: Productization (Months 6+)
- Package as SaaS for real estate agents
- CPA white-label version
- GTM through Kate's brokerage → coaching programs → NAR

---

## KNOWN ISSUES & QUIRKS

1. **Venmo in Tiller:** Only captures balance transfers, not P2P detail — need CSV export
2. **PayPal 1099-K:** If >$600 in 2025, will receive 1099-K (already have one for Sapinover)
3. **USAA connection:** Only since Aug 2025 — Jan-Jul gap must be filled from statements
4. **Amex card confusion:** Multiple Business Platinum cards — need to map ownership
5. **2025 Sapinover income showing $0:** Wrong — must identify all consulting/website revenue
6. **Kate's commission structure:** Some paid through Venmo (not in Tiller) — critical gap
7. **Contract labor 1099s:** $57K paid out — must identify recipients and issue forms

---

## QUERY CAPABILITIES

This knowledge base supports queries like:
- "What were my Schedule C deductions in 2023?"
- "Show me all Venmo transactions in 2025"
- "How much did Kate pay in MLS fees?"
- "What's the status of TD Bank connection?"
- "Do I have Kate's 1099-NEC from her broker?"
- "How much did I contribute to SEP-IRA in 2024?"
- "What estimated tax payments did I make in Q1 2025?"
- "Which contractors need 1099-NECs?"

---

## FILE LOCATIONS (LOCAL WORKSPACE)

**Base Directory:** `/home/ubuntu/.openclaw/workspace/tax-docs-2025/extracted/`

**Key Paths:**
- Finance system docs: `./finance-system-docs-2026-03-28 (1)/finance-system-docs/*.md`
- 2025 transaction data: `./2025_Taxes_Part4/*.xlsx`
- 2025 Venmo: `./2025_Taxes_Part4/VenmoStatement_*.pdf`
- 2025 1099s: `./2025_Taxes_Part4/*.pdf`
- 2024 tax return: `./2024_Taxes/2024_TAX_RETURN.pdf`
- Historical returns: `./20{18-24}_Taxes/*.pdf`
- Tiller templates: `./General_Taxes/Tiller*.xlsx`

---

## NEXT STEPS

1. **Read 2025 transaction data** — parse AutoCat FINAL xlsx to understand current categorization state
2. **Extract Venmo data** — parse all 2025 Venmo PDFs to capture P2P transactions
3. **Parse 1099s** — extract all income figures from 1099-NEC, 1099-INT, 1099-B
4. **Build query interface** — enable natural language questions about tax data
5. **Generate TurboTax entry sheet** — complete Schedule C worksheets with all data
6. **Identify missing deductions** — cross-reference deductions checklist against actual data
7. **Calculate mileage vs actual** — determine optimal car deduction method for Kate
8. **SEP-IRA analysis** — calculate optimal contribution for tax minimization

---

**Status:** ✅ Repository cloned, all archives extracted, master documents read, file inventory complete.
**Next:** Deep data extraction from transaction files and 1099 forms.
