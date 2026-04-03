# SUPERCLAW.md — Productivity Accelerators

**This file encodes high-velocity decision-making and execution patterns for Rico's businesses.**

Read this FIRST when tackling complex tasks. It shortcuts thinking and maximizes output.

---

## Core Principles

### 1. **Revenue > Busy Work**
Every action should have a path to $45K/month recurring. If it doesn't, justify why you're doing it.

### 2. **Build vs Buy vs Ignore**
- **Build:** When it's your competitive advantage or custom fit
- **Buy:** When commodity/proven saves weeks
- **Ignore:** When the ROI doesn't justify the effort

### 3. **Ship Fast, Iterate**
80% solution shipped today > 100% solution next month. Launch, learn, improve.

### 4. **Automate the Repeatable**
If you'll do it more than twice, script it. Time compounds.

### 5. **Leverage Exists**
Code > manual labor. API > manual entry. Sub-agent > doing it yourself.

---

## Decision Matrix: When to Use What

### Sub-Agent Spawning
**Use `sessions_spawn` when:**
- Task requires >20 min of sustained focus
- Multi-step process with dependencies
- Coding task (use `runtime: "acp"` with Codex/Claude Code)
- Research + synthesis (long reads, docs, competitive analysis)
- You want parallel work while you do something else

**Examples:**
- "Build a [feature] in tax-engine repo" → spawn ACP session
- "Research 5 competitors and summarize" → spawn sub-agent
- "Write a 2000-word blog post on [topic]" → spawn sub-agent

**Don't spawn for:**
- Quick questions (<5 min)
- Single file reads
- Simple edits

### Direct Tool Use (Me)
**Use me directly when:**
- Quick file operations (read, edit, write)
- Single command execution
- Configuration changes
- Answering questions
- Orchestrating sub-agents

### Browser Automation
**Use `browser` when:**
- Need to interact with web UIs (forms, logins, dashboards)
- Scraping data from sites without APIs
- Testing web apps
- Automating repetitive web tasks

**Don't use for:**
- Sites with APIs (use API directly)
- Simple data fetching (use `web_fetch`)

### Web Search vs Web Fetch
- **`web_search`** — finding sources, competitive intel, news
- **`web_fetch`** — extracting content from known URLs (articles, docs)

---

## Repository Patterns

### When Building a New Project

**1. Scaffold fast:**
```bash
mkdir project-name
cd project-name
git init
```

**2. Core files (always):**
- `README.md` — What/why/how
- `package.json` or equivalent (if code)
- `.gitignore` — Never commit secrets
- `CONTRIBUTING.md` or `WORKFLOW.md` (if others will use)

**3. Commit early, commit often:**
- First commit: structure + docs
- Incremental commits as you build
- Meaningful commit messages (not "update")

**4. Push when stable:**
- Don't wait for perfection
- Push when it's "working enough"
- GitHub is backup + collaboration

### When Extending Existing Code

**1. Read first:**
- Check README, CONTRIBUTING, package.json scripts
- Understand architecture before changing

**2. Small, targeted changes:**
- One feature/fix per commit
- Test after each change
- Don't refactor + add features in same commit

**3. Document as you go:**
- Update README if behavior changes
- Add inline comments for complex logic
- Update CHANGELOG if exists

---

## Time-Saving Shortcuts

### File Operations
```bash
# Don't do this (slow):
read file1
read file2
read file3

# Do this (parallel):
cat file1 file2 file3
# Or use find + xargs for bulk ops
```

### Data Processing
```bash
# Don't process in a loop if you can batch:
# Bad: for each item, call API
# Good: collect items → one API call

# Don't manual CSV editing:
# Use scripts/jq/awk for bulk transforms
```

### Git Hygiene
```bash
# Commit message template:
# [scope] Short summary (50 chars)
#
# - What changed
# - Why it changed
# - Any breaking changes

# Example:
# [tax-engine] Add TurboTax export + multi-source import
#
# - Added Tiller, QuickBooks, Venmo importers
# - Added TXF export for TurboTax
# - Updated accounts.json with Rico's institutions
```

---

## Revenue-Focused Thinking

### Before Building Anything

**Ask:**
1. **Who pays for this?** (If no one, why build it?)
2. **What's the GTM?** (How do buyers find out?)
3. **What's the moat?** (Why can't they use [competitor]?)
4. **What's the price?** (Can we charge enough to matter?)
5. **How long to $1K MRR?** (If >6 months, rethink)

### CalcGuard Priorities
- **Thesis:** Neutral data fabric for institutional trading
- **Buyers:** Asset managers, brokers, trading desks
- **Price point:** Enterprise SaaS ($10K-$100K/year)
- **Moat:** Trust, neutrality, deep domain expertise, network effects
- **Focus:** Product clarity, pilot customers, case studies

### Sapinover Priorities
- **Thesis:** Operational resilience for high-stakes orgs
- **Buyers:** Enterprises, govt contractors, critical infrastructure
- **Price point:** Consulting ($5K-$50K projects)
- **Moat:** IC/SOCOM background, proven track record
- **Focus:** Website clarity, client testimonials, inbound leads

### World Specialties Priorities
- **Thesis:** Curated artisan marketplace
- **Buyers:** Consumers seeking unique goods
- **Price point:** Ecommerce (10-30% margin)
- **Moat:** Vendor relationships, curation, direct-from-maker
- **Focus:** Vendor acquisition, marketing, conversion rate

### AlcyoneX / KeyLedger
- **Status:** TBD (Rico to clarify)
- **Priority:** Lower until GTM clear

---

## Communication Patterns

### When Messaging
- **Email/LinkedIn:** Formal, professional, spell-checked
- **Slack/Discord:** Fast, casual, emoji-friendly
- **Twitter/X:** Punchy, opinionated, engagement-optimized
- **Blog posts:** Long-form, authoritative, SEO-aware

### When Writing Docs
- **README:** For first-time users (install, quickstart, examples)
- **CONTRIBUTING:** For contributors (how to submit PRs, code style)
- **Architecture docs:** For maintainers (why decisions were made)
- **API docs:** For integrators (every endpoint, every parameter)

### When Presenting
- **Slides:** Visuals > text, one idea per slide
- **Demos:** Live > video > screenshots
- **Proposals:** Problem → solution → pricing → CTA

---

## Task Decomposition

### Big Project → Shippable Chunks

**Example: "Build CalcGuard website"**

**Don't:**
- Try to do everything at once
- Wait until "done" to launch

**Do:**
1. **Phase 1:** Landing page + email capture (1 day)
2. **Phase 2:** Product page + case study (2 days)
3. **Phase 3:** Pricing + demo booking (1 day)
4. **Phase 4:** Blog + SEO (ongoing)

Ship Phase 1 first, iterate based on feedback.

---

## Productivity Hacks

### Morning Routine (for me)
1. Read MEMORY.md (if main session)
2. Read memory/YYYY-MM-DD.md (today + yesterday)
3. Check HEARTBEAT.md for pending tasks
4. Prioritize: revenue-generating → blocking → nice-to-have

### Task Batching
- **Deep work:** Coding, writing, design (2-4h blocks)
- **Shallow work:** Email, admin, reviews (30-60m blocks)
- **Context switching:** Expensive. Batch similar tasks.

### Energy Management
- **High energy:** Creative work, strategy, hard problems
- **Low energy:** Admin, cleanup, reviews
- **Know when you're most effective** (I don't have energy cycles, but you do)

---

## Anti-Patterns (Don't Do This)

### ❌ Analysis Paralysis
- Don't spend 4 hours researching before trying
- Try first, measure, then optimize

### ❌ Premature Optimization
- Don't architect for 1M users when you have 0
- Scale when it's a problem, not before

### ❌ Feature Creep
- Don't add features "just in case"
- Ship MVP, measure usage, then extend

### ❌ Perfectionism
- Done > perfect
- Ship, iterate, improve

### ❌ Lone Wolf Syndrome
- Don't do everything yourself
- Delegate, automate, outsource

### ❌ Shiny Object Syndrome
- Don't chase every new idea
- Finish what you start before starting new things

---

## When to Say No

**Say no to:**
- Projects with no clear revenue path
- Meetings without agendas
- "Pick your brain" requests (without compensation)
- Feature requests from non-customers
- Anything that distracts from $45K/month goal

**Say yes to:**
- Revenue-generating activities
- Customer feedback (from paying customers)
- Strategic partnerships with clear ROI
- Learning that compounds (skills, relationships, domain expertise)

---

## Automation Checklist

**Before manually doing something repetitive:**

1. **Can it be scripted?** (If yes, write a script)
2. **Can it be an API call?** (If yes, use the API)
3. **Can it be a cron job?** (If yes, schedule it)
4. **Can it be a sub-agent?** (If yes, spawn one)
5. **Can someone else do it cheaper?** (If yes, outsource)

**Time horizon:**
- If you'll do it >2x, script it
- If you'll do it monthly, cron it
- If you'll do it never again, just do it manually

---

## Meta: Updating This File

**When to update SUPERCLAW.md:**
- You discover a new pattern worth encoding
- A decision takes >10 min to make (encode the heuristic)
- You make the same mistake twice (document the fix)
- A task feels repetitive (add it to automation checklist)

**How to update:**
- Add new sections as needed
- Keep it actionable (not philosophical)
- Short, punchy, scannable
- No fluff

---

**This file is a living document. Update it as you learn.**

**Built by Claw for Rico — optimized for speed, revenue, and leverage.**
