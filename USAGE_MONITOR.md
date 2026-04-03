# 💰 OpenClaw Usage Monitor

**Purpose:** Track token usage, costs, and model trends across all sessions.

---

## Quick Commands

### Log Current Session
```bash
cd ~/.openclaw/workspace/.openclaw
node track-usage.js log "anthropic/claude-sonnet-4-5" <TOKENS> "<TASK_DESCRIPTION>"
```

### View Report (Terminal)
```bash
cd ~/.openclaw/workspace/.openclaw
node track-usage.js report
```

### Check Cost Alerts
```bash
cd ~/.openclaw/workspace/.openclaw
node alert-system.js
```

### Import Historical Data
```bash
cd ~/.openclaw/workspace/.openclaw
node import-history.js
```

### View Dashboard (Browser)
```bash
# Open in browser:
file:///home/ubuntu/.openclaw/workspace/.openclaw/monitor.html

# Or start simple HTTP server:
cd ~/.openclaw/workspace/.openclaw
python3 -m http.server 8080
# Then visit: http://localhost:8080/monitor.html
```

---

## Current Status (March 30, 2026)

**Today's Usage:**
- **3 sessions:** 424K tokens total
- **Cost:** $2.29
- **Efficiency:** ⭐ Excellent (46% under $5/day target)

**Projections:**
- **Monthly:** $9.81 (93% under $150 budget)
- **Yearly:** $119.19

---

## Model Pricing Reference

| Model | Input ($/1M) | Output ($/1M) | Best For | Savings vs Sonnet |
|-------|-------------|---------------|----------|-------------------|
| **Opus 4.6** | $15 | $75 | Hard reasoning, complex tasks | -400% (5x more) |
| **Sonnet 4.6** | $3 | $15 | General work (current default) | 0% (baseline) |
| **Haiku 4.5** | $0.8 | $4 | Sub-agents, file ops | **73%** |
| **DeepSeek V3** | $0.2 | $0.2 | Bulk tasks, categorization | **93%** |
| **Gemini Flash** | $0.1 | $0.4 | Large context, fast iteration | **97%** |
| **Gemini Flash Lite** | $0.075 | $0.3 | Cheapest option | **98%** |
| **Llama 3.3 (Free)** | $0 | $0 | Testing, experimentation | **100%** |

---

## Cost Targets

| Level | Daily | Monthly | Model Mix |
|-------|-------|---------|-----------|
| **Light** | < $2 | < $60 | 80% Haiku, 20% Sonnet |
| **Normal** | < $5 | < $150 | 60% Haiku, 35% Sonnet, 5% Opus |
| **Heavy** | < $15 | < $450 | 40% Haiku, 50% Sonnet, 10% Opus |

**Rico's Target:** < $150/month (Normal intensity) ✅

**Current Pace:** $9.81/month (on track!) 🎯

---

## Optimization Strategies

### **1. Subagent Pattern** (60-80% savings)
- Spawn isolated sessions for project work
- Use Haiku 4.5 by default
- Smaller context = fewer tokens

**Example:**
```bash
# Instead of main session (Sonnet, $5):
"Read Rangekeeper docs and generate report"

# Do this (Haiku subagent, $1.30):
sessions_spawn(task="Read docs, generate report", model="haiku-4-5")
# Savings: 74%
```

### **2. Batch Operations** (40-70% savings)
- Group similar tasks together
- Reduces context reload overhead

**Example:**
```bash
# Instead of 3 messages (60K tokens):
"Check email" + "Check calendar" + "Check notifications"

# Do this (25K tokens):
"Check email, calendar, notifications"
# Savings: 58%
```

### **3. Use Cheaper Models for Bulk Work** (90-98% savings)
- DeepSeek V3: Data processing, extraction
- Gemini Flash: Reading long docs (2M tokens)
- Haiku 4.5: File operations, simple tasks

### **4. Break Long Sessions** (40-60% savings)
- End session at 100K tokens
- Start fresh (avoids context bloat)

---

## Alert System

**Thresholds:**
- **Daily:** $5 (yellow alert)
- **Weekly:** $35 (review usage)
- **Monthly:** $150 (optimize models)

**Check alerts:**
```bash
cd ~/.openclaw/workspace/.openclaw
node alert-system.js
```

**Output:**
- ✅ Green = Under limits
- ⚠️ Yellow = Approaching threshold
- 🚨 Red = Exceeded threshold + recommendations

---

## Files

- **usage-monitor.json** — Data storage (sessions, daily totals)
- **track-usage.js** — Logger + report generator
- **alert-system.js** — Cost threshold checker
- **import-history.js** — Backfill historical data
- **monitor.html** — Live dashboard (Matrix-style)

---

## Dashboard Features

- **Real-time stats** (today, week, month projection)
- **7-day trend chart** (visual cost tracking)
- **Recent sessions table** (last 20)
- **Model breakdown** (cost per model)
- **Efficiency rating** (Excellent / Good / Review)
- **Auto-refresh** every 30 seconds

---

## Integration with AI Sessions

**At session start:**
1. Note starting token count
2. Track model being used

**At session end:**
```bash
node ~/.openclaw/workspace/.openclaw/track-usage.js log \
  "anthropic/claude-sonnet-4-5" \
  <FINAL_TOKEN_COUNT> \
  "Short description of work done"
```

**Before making decisions:**
```bash
# Check current spend
node ~/.openclaw/workspace/.openclaw/track-usage.js report
```

---

## Daily Routine

**Morning (once per day):**
```bash
cd ~/.openclaw/workspace/.openclaw
node alert-system.js  # Check if under budget
node track-usage.js report  # Review yesterday's usage
```

**During work:**
- Use subagents for file-heavy tasks
- Batch similar operations
- Choose cheapest model that works

**End of day:**
```bash
# Log final session
node track-usage.js log "anthropic/claude-sonnet-4-5" <TOKENS> "Today's work summary"
```

---

## When to Escalate Models

**Start with Haiku 4.5:**
- Try simple approach first ($0.8/MTok)
- 80% of tasks succeed

**Escalate to Sonnet 4.5:**
- Haiku fails or needs more reasoning ($3/MTok)
- 15% of tasks need this

**Only use Opus 4.6:**
- Truly complex problems ($15/MTok)
- 5% of tasks need this
- Reserve < 10K tokens/day

---

## Recommendations from Alert System

When alerts fire, you'll get:
- Current spend vs. threshold
- Model usage breakdown
- Optimization suggestions
- Commands to investigate

**Example:**
```
⚠️ DAILY ALERT: $6.50 spent today (threshold: $5)

📋 RECOMMENDATIONS:
💡 Consider using Haiku 4.5 for file operations (70% cheaper).
💡 3 sessions used >100K tokens. Break into smaller chunks.
💡 Try DeepSeek V3 for bulk data processing (95% cheaper).
```

---

## Cost Optimization Guide

**Full guide:** `/home/ubuntu/.openclaw/workspace/COST_OPTIMIZATION.md`

**Quick Reference:**
- **File ops?** → Haiku 4.5
- **Data processing?** → DeepSeek V3
- **Reading docs?** → Gemini Flash
- **Code generation?** → Sonnet 4.5
- **Complex reasoning?** → Opus 4.6 (sparingly)

---

**Last Updated:** March 30, 2026  
**Current Status:** Monitoring active, 3 sessions logged, $2.29 spent today  
**Efficiency:** ⭐ Excellent (93% under budget)
