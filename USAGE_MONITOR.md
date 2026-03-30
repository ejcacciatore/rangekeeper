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

## Current Session Tracking

**Model:** Sonnet 4.5  
**Tokens Used:** 118,659 / 200,000  
**Estimated Cost:** $0.64  
**Task:** Rangekeeper advanced dashboard + architecture docs + usage monitor

---

## Model Pricing Reference

| Model | Input ($/1M) | Output ($/1M) | Best For |
|-------|-------------|---------------|----------|
| **Opus 4.6** | $15 | $75 | Hard reasoning, complex tasks |
| **Sonnet 4.6** | $3 | $15 | General work (current default) |
| **Haiku 4.5** | $0.8 | $4 | Sub-agents, file ops |
| **DeepSeek V3** | $0.2 | $0.2 | Bulk tasks, categorization |
| **Gemini Flash** | $0.1 | $0.4 | Large context, fast iteration |
| **Gemini Flash Lite** | $0.075 | $0.3 | Cheapest option |
| **Llama 3.3 (Free)** | $0 | $0 | Testing, experimentation |

---

## Cost Targets

- **Daily:** < $5 normal, < $15 heavy research
- **Monthly:** < $150 (allows for occasional Opus use)
- **Yearly:** < $1,800

**Current Projection:** $2.65/month (well under target ✅)

---

## Auto-Logging (Future)

To auto-log every session, add to OpenClaw session end hook:

```javascript
// In openclaw session cleanup
const { logSession, calculateCost } = require('./.openclaw/track-usage');
logSession({
  model: session.model,
  tokens_used: session.tokens_used,
  tokens_remaining: session.tokens_remaining,
  cost: calculateCost(session.model, session.tokens_used, pricing),
  task: session.task_description || 'General',
  duration_seconds: session.duration
});
```

---

## Files

- **usage-monitor.json** — Data storage (sessions, daily totals)
- **track-usage.js** — Logger + report generator
- **monitor.html** — Live dashboard (Matrix-style terminal theme)

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

## Alerts

**If daily average > $25:**
- Switch to cheaper models (DeepSeek, Gemini Flash) for bulk work
- Reserve Opus for truly complex reasoning only
- Break large tasks into smaller chunks
- Use Haiku for sub-agents

**If monthly projection > $150:**
- Review recent sessions (what's burning tokens?)
- Audit model selection strategy
- Consider context size optimization

---

**Last Updated:** March 30, 2026  
**Current Status:** Monitoring active, dashboard ready
