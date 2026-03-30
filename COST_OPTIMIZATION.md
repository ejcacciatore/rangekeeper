# 💰 Cost Optimization Guide

**Purpose:** Maximize value per dollar spent on AI models. Smart model selection = 70-95% cost savings.

---

## 🎯 Model Selection Decision Tree

### **Ask These Questions First:**

1. **Does it require deep reasoning?** (architecture design, complex debugging, strategic planning)
   → **Opus 4.6** or **Sonnet 4.6**

2. **Is it creative code generation?** (new features, algorithms, non-trivial logic)
   → **Sonnet 4.5** (current default)

3. **Is it simple file operations?** (read/write/edit files, basic queries, status checks)
   → **Haiku 4.5** (via subagent)

4. **Is it bulk data processing?** (categorization, extraction, summarization of large datasets)
   → **DeepSeek V3** or **Gemini Flash**

5. **Is it reading documentation?** (long context, searching, extracting info)
   → **Gemini Flash** or **Gemini Flash Lite**

6. **Is it experimental/testing?** (trying ideas, brainstorming, non-critical work)
   → **Llama 3.3 Free**

---

## 📊 Model Comparison Matrix

| Model | Input $/MTok | Output $/MTok | Best For | Speed | Quality |
|-------|--------------|---------------|----------|-------|---------|
| **Opus 4.6** | $15 | $75 | Hard reasoning, complex architecture | Slow | ⭐⭐⭐⭐⭐ |
| **Sonnet 4.6** | $3 | $15 | General development, code generation | Medium | ⭐⭐⭐⭐ |
| **Sonnet 4.5** | $3 | $15 | Same as 4.6 (current default) | Medium | ⭐⭐⭐⭐ |
| **Haiku 4.5** | $0.8 | $4 | File ops, simple tasks, sub-agents | Fast | ⭐⭐⭐ |
| **DeepSeek V3** | $0.2 | $0.2 | Bulk processing, data extraction | Fast | ⭐⭐⭐ |
| **Gemini Flash** | $0.1 | $0.4 | Large context reads (2M tokens) | Very Fast | ⭐⭐⭐ |
| **Gemini Flash Lite** | $0.075 | $0.3 | Cheapest option, basic tasks | Very Fast | ⭐⭐ |
| **Llama 3.3 (Free)** | $0 | $0 | Experimentation, testing | Medium | ⭐⭐ |

---

## 💡 Real-World Cost Examples

### **Scenario: Build Rangekeeper Dashboard**

| Task | Tokens | Sonnet Cost | Optimal Model | Optimal Cost | Savings |
|------|--------|-------------|---------------|--------------|---------|
| Architecture planning | 50K | $2.55 | Sonnet 4.5 | $2.55 | 0% |
| Read Blackboard docs | 200K | $10.20 | Gemini Flash | $0.28 | **97%** |
| Write HTML files | 80K | $4.08 | Haiku 4.5 | $1.09 | **73%** |
| Process course data | 150K | $7.65 | DeepSeek V3 | $0.51 | **93%** |
| Code generation | 100K | $5.10 | Sonnet 4.5 | $5.10 | 0% |
| **TOTAL** | **580K** | **$29.58** | **Mixed** | **$9.53** | **68%** |

### **Scenario: Daily Heartbeat Checks**

| Task | Current (Sonnet) | Optimized (Haiku) | Savings |
|------|------------------|-------------------|---------|
| Check email (4x/day) | $0.20 | $0.05 | 75% |
| Check calendar (2x/day) | $0.10 | $0.03 | 70% |
| Review notifications (4x/day) | $0.20 | $0.05 | 75% |
| **Daily Total** | **$0.50** | **$0.13** | **74%** |
| **Monthly** | **$15.00** | **$3.90** | **74%** |

---

## 🚀 Optimization Strategies

### **1. Subagent Pattern (Biggest Savings)**

**What:** Spawn isolated sessions for project-specific work

**Why:**
- Smaller context (only loads what's needed)
- Can use cheaper models (Haiku for file ops)
- Doesn't pollute main session with long file contents
- Parallel execution (multiple subagents = faster)

**When to Use:**
- File-heavy operations (reading docs, writing code)
- Repetitive tasks (daily checks, data processing)
- Project-specific work (Rangekeeper, KeyLedger, CalcGuard)

**Cost Impact:**
- Main session stays under 50K tokens/day
- Subagents handle bulk work at 70-95% cheaper
- **Typical savings: 60-80%**

**Example:**
```bash
# Instead of this (in main session, Sonnet 4.5):
"Read all Rangekeeper docs and generate status report"
# Cost: ~$5 (100K tokens × $0.05/1K)

# Do this (spawn Haiku subagent):
sessions_spawn(task="Read Rangekeeper docs, generate report", model="haiku-4-5")
# Cost: ~$1.30 (100K tokens × $0.013/1K)
# Savings: 74%
```

### **2. Model Switching Mid-Task**

**What:** Start with cheap model, escalate only if needed

**Example Workflow:**
1. **Haiku 4.5:** Try simple approach first ($0.8/MTok)
2. **Sonnet 4.5:** If Haiku fails, escalate ($3/MTok)
3. **Opus 4.6:** Only for truly hard problems ($15/MTok)

**Cost Impact:**
- 80% of tasks succeed with Haiku/Sonnet
- 15% need Sonnet escalation
- 5% need Opus
- **Typical savings: 50-70%**

### **3. Context Pruning**

**What:** Reduce what's loaded into every message

**Current Problem:**
- Every message loads: AGENTS.md, SOUL.md, USER.md, TOOLS.md, MEMORY.md, IDENTITY.md, HEARTBEAT.md
- Plus conversation history
- Plus any open files
- **Result:** 50-100K tokens just for context

**Solution:**
- Use subagents for isolated work
- Break long sessions (restart at 100K tokens)
- Store deliverables in files, not inline in chat
- Use `memory_search` instead of loading full MEMORY.md

**Cost Impact:**
- Reduce context from 100K → 20K per message
- **Typical savings: 40-60%**

### **4. Batch Operations**

**What:** Group multiple tasks into one request

**Instead of:**
```
Message 1: "Check email" (20K tokens)
Message 2: "Check calendar" (20K tokens)
Message 3: "Check notifications" (20K tokens)
Total: 60K tokens
```

**Do this:**
```
Message 1: "Check email, calendar, notifications" (25K tokens)
Total: 25K tokens (58% savings)
```

**Cost Impact:**
- Reduces context reload overhead
- **Typical savings: 40-70%**

---

## 📋 Task → Model Mapping

### **When to Use Each Model:**

#### **Opus 4.6 ($15/$75)** — Reserve for Hard Problems
- Complex architecture decisions (new system design)
- Strategic business planning (revenue models, GTM strategy)
- Debugging obscure issues (when Sonnet fails)
- Critical code review (security, performance)
- **Daily budget:** < 10K tokens ($0.75/day max)

#### **Sonnet 4.5/4.6 ($3/$15)** — Current Default, General Work
- Feature development (new functionality)
- Code generation (non-trivial logic)
- Writing documentation (architecture, guides)
- Answering complex questions
- **Daily budget:** 50-100K tokens ($2.55-$5.10/day)

#### **Haiku 4.5 ($0.8/$4)** — File Ops & Simple Tasks
- Read/write/edit files
- Database queries (simple SELECT/INSERT)
- Status checks (git log, system health)
- Data formatting (JSON → CSV)
- Simple Q&A (factual lookups)
- **Daily budget:** 200-300K tokens ($2.60-$3.90/day)

#### **DeepSeek V3 ($0.2/$0.2)** — Bulk Data Processing
- Categorizing large datasets
- Text extraction (scraping, parsing)
- Summarization (long documents → key points)
- Data transformation (clean, normalize, merge)
- **Daily budget:** 500K+ tokens ($1-2/day)

#### **Gemini Flash ($0.1/$0.4)** — Large Context Reads
- Reading long docs (>100K tokens)
- Searching codebases
- Documentation analysis
- Multi-file context (when you need to load many files)
- **Supports up to 2M tokens input**
- **Daily budget:** 1M+ tokens ($1-2/day)

#### **Gemini Flash Lite ($0.075/$0.3)** — Cheapest Option
- Basic file reads
- Simple data extraction
- Low-stakes tasks
- Experimentation
- **Daily budget:** 1M+ tokens ($0.75-$1.50/day)

#### **Llama 3.3 Free ($0/$0)** — Testing & Experimentation
- Try new ideas without cost
- Brainstorming sessions
- Learning new tools
- Non-critical work
- **Daily budget:** Unlimited!

---

## 🎯 Daily Budget Targets

| Intensity Level | Daily Cost | Monthly Cost | Model Mix |
|-----------------|------------|--------------|-----------|
| **Light** (basic queries, file ops) | $0.50-$2 | $15-$60 | 80% Haiku, 20% Sonnet |
| **Normal** (regular development) | $2-$5 | $60-$150 | 60% Haiku, 35% Sonnet, 5% Opus |
| **Heavy** (large features, research) | $5-$15 | $150-$450 | 40% Haiku, 50% Sonnet, 10% Opus |
| **Sprint** (launch mode, urgent) | $15-$30 | $450-$900 | 20% Haiku, 60% Sonnet, 20% Opus |

**Rico's Target:** < $150/month (Normal intensity)

---

## 🚨 Cost Alerts

### **Set Up Alerts:**

**Daily Threshold: $5**
- If you exceed $5/day, switch to cheaper models
- Review what's burning tokens (use `track-usage.js report`)
- Consider breaking session and starting fresh

**Weekly Threshold: $35**
- On track for $150/month
- Sustainable pace

**Monthly Threshold: $150**
- Time to audit model selection
- Identify high-cost tasks
- Refactor to use subagents + cheaper models

---

## 📈 Tracking & Measurement

### **Daily Check:**
```bash
cd ~/.openclaw/workspace/.openclaw
node track-usage.js report
```

**Look for:**
- Daily average trending up? (optimize)
- One model dominating cost? (switch for some tasks)
- Sessions over 100K tokens? (break into smaller chunks)

### **Weekly Review:**
- **Question 1:** Which tasks cost the most?
- **Question 2:** Could any use a cheaper model?
- **Question 3:** Are subagents being used effectively?
- **Question 4:** Is Opus being used sparingly?

### **Monthly Audit:**
- Total cost vs. budget ($150)
- Model efficiency (Haiku/DeepSeek % of total)
- Identify recurring high-cost tasks
- Plan optimizations for next month

---

## 🔧 Implementation Checklist

**Immediate Actions:**

- [x] Set up usage tracking (track-usage.js)
- [x] Create monitoring dashboard (monitor.html)
- [x] Define cost targets ($150/month)
- [ ] Configure daily alerts (email/Discord when >$5/day)
- [ ] Audit current sessions (identify optimization opportunities)
- [ ] Create subagent for Rangekeeper work
- [ ] Test cheaper models (DeepSeek, Gemini Flash) for bulk tasks

**Ongoing Habits:**

- [ ] Start each day with `track-usage.js report`
- [ ] Use subagents for file-heavy work
- [ ] Batch similar tasks together
- [ ] Break sessions at 100K tokens
- [ ] Review weekly costs every Monday
- [ ] Reserve Opus for truly hard problems only

---

## 💡 Pro Tips

**1. Think in $/task, not $/token:**
- Building a dashboard for $10 with Sonnet = good value
- Answering "what's the weather" for $0.50 with Sonnet = waste

**2. Start cheap, escalate only if needed:**
- Try Haiku first
- If it fails, try Sonnet
- If that fails, try Opus
- **95% of tasks succeed with Haiku or Sonnet**

**3. Use free models for learning:**
- Llama 3.3 Free = $0 to experiment
- Great for trying new tools, testing ideas
- Once proven, switch to paid model for production

**4. Subagents are your friend:**
- Spawn for every project-specific task
- Use Haiku by default
- Let them work in parallel
- **Can save 60-80% on file-heavy work**

**5. Context is expensive:**
- Every message re-loads context
- At 100K tokens/message, that's $5/message on Sonnet
- Break long sessions, start fresh
- Use files instead of inline code

---

## 📞 When to Ask for Help

If daily costs exceed $15 consistently:
1. Run `track-usage.js report`
2. Identify which tasks are costly
3. Ask: "How can I optimize [task] to use cheaper models?"
4. Consider switching to Haiku/DeepSeek for bulk work

**Remember:** Smart model selection = 10x cost efficiency

---

**Last Updated:** March 30, 2026  
**Current Status:** $2.29/day avg (on track for $68.70/month, 54% under budget)
