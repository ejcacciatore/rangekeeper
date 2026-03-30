# 🎯 Rangekeeper Subagent — Persistent Context

**Purpose:** Dedicated AI assistant for all Rangekeeper development work

---

## Activation Command

When Rico says:
- "Rangekeeper"
- "Work on Rangekeeper"
- "Student dashboard"
- "Massimo's assignments"
- "Blackboard tracker"

→ Load this context and work in Rangekeeper mode

---

## What This Subagent Does

**Primary Mission:** Build and maintain Rangekeeper — an academic assignment tracker for neurodivergent college students

**Target User:** Massimo Cacciatore (Rico's son), University of Alabama student with ASD

**Core Responsibilities:**
1. Chrome extension development (Blackboard scraper)
2. Next.js web dashboard (Vercel-hosted)
3. Backend API (data sync, notifications)
4. Discord bot (ASD-optimized reminders)
5. GitHub Pages static site (current MVP)
6. Documentation (architecture, skills, guides)

---

## Key Files & Locations

### **Master Context**
- `/home/ubuntu/.openclaw/workspace/rangekeeper/RANGEKEEPER_SESSION.md` — Full session context
- `/home/ubuntu/.openclaw/workspace/rangekeeper/RANGEKEEPER_ARCHITECTURE.md` — Complete architecture
- `/home/ubuntu/.openclaw/workspace/rangekeeper/SKILL.md` — AgentSkill for AI development

### **Code Repositories**
- `/home/ubuntu/.openclaw/workspace/rangekeeper/` — Main project root
- `/home/ubuntu/.openclaw/workspace/rangekeeper/extension/` — Chrome extension
- `/home/ubuntu/.openclaw/workspace/rangekeeper/backend/` — Node.js backend (SQLite)
- `/home/ubuntu/.openclaw/workspace/rangekeeper-web/` — Next.js Vercel app

### **Live Sites**
- **GitHub Pages:** https://ejcacciatore.github.io/rangekeeper/
- **GitHub Repo:** https://github.com/ejcacciatore/rangekeeper
- **Vercel (future):** https://rangekeeper-web.vercel.app (after deployment)

### **Database**
- `/home/ubuntu/.openclaw/workspace/rangekeeper/backend/data/rangekeeper.db` — SQLite database
- **Schema:** 10 tables (courses, assignments, grades, messages, notifications, settings, announcements, ics_feeds, feedback, daily_snapshots)

---

## Current Status (as of 2026-03-30)

### ✅ **Completed**
- Chrome extension v0.2.0 (scrapes courses, assignments, grades, messages)
- Node.js backend with 10-table SQLite database
- GitHub Pages static dashboard (basic HTML)
- Advanced multi-page dashboard design (7 pages)
- Blackboard deep links (every assignment/course)
- Data export system (SQLite → JSON)
- Complete architecture documentation (26KB)
- AgentSkill MD for AI assistance (14KB)
- Next.js Vercel app scaffolded (ready to deploy)

### ⚠️ **In Progress**
- Next.js dashboard migration (GitHub Pages → Vercel)
- Usage monitor integration (token tracking)
- Discord webhook notifications
- Parent dashboard (read-only view)

### 🔜 **Next Up**
1. Deploy Next.js app to Vercel
2. Build usage monitor page (`/monitor`)
3. Migrate all 7 dashboard pages to React components
4. Add Discord webhook integration
5. Set up authentication (NextAuth.js)
6. Migrate SQLite → Vercel Postgres

---

## Tech Stack

| Component | Technology | Location |
|-----------|-----------|----------|
| **Extension** | Vanilla JS, IndexedDB, Manifest V3 | `/rangekeeper/extension/` |
| **Backend** | Node.js, Express, SQLite | `/rangekeeper/backend/` |
| **Dashboard (current)** | Static HTML/CSS/JS | `/rangekeeper/*.html` |
| **Dashboard (future)** | Next.js 15, Tailwind, TypeScript | `/rangekeeper-web/` |
| **Deployment** | GitHub Pages (current), Vercel (future) | — |
| **Database** | SQLite (current), Vercel Postgres (future) | `/rangekeeper/backend/data/` |
| **Notifications** | discord.js, node-cron | `/rangekeeper/backend/src/` |

---

## Common Tasks

### **1. Start Local Development**
```bash
# Backend
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
npm start  # http://localhost:3000

# Next.js (Vercel)
cd /home/ubuntu/.openclaw/workspace/rangekeeper-web
npm run dev  # http://localhost:3000
```

### **2. Query Database**
```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
node -e "
const sqlite = require('better-sqlite3');
const db = new sqlite('data/rangekeeper.db');
const courses = db.prepare('SELECT * FROM courses').all();
console.log(JSON.stringify(courses, null, 2));
db.close();
"
```

### **3. Export Data for Dashboard**
```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
node -e "
const sqlite = require('better-sqlite3');
const fs = require('fs');
const db = new sqlite('data/rangekeeper.db');
const data = {
  courses: db.prepare('SELECT * FROM courses').all(),
  assignments: db.prepare('SELECT * FROM assignments ORDER BY due_date').all(),
  grades: db.prepare('SELECT * FROM grades').all()
};
fs.writeFileSync('../data/latest.json', JSON.stringify(data, null, 2));
db.close();
"
```

### **4. Deploy to GitHub Pages**
```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper
git add *.html assets/ data/
git commit -m "Update dashboard"
git push origin master
# Auto-deploys to https://ejcacciatore.github.io/rangekeeper/
```

### **5. Log Session to Usage Monitor**
```bash
cd ~/.openclaw/workspace/.openclaw
node track-usage.js log "anthropic/claude-sonnet-4-5" <TOKENS> "Rangekeeper: <what you built>"
```

---

## Development Guidelines

### **Never Do:**
- ❌ Violate FERPA (student privacy)
- ❌ Store login credentials (only scrape after student logs in)
- ❌ Send notifications 11 PM - 8 AM (unless urgent)
- ❌ Break accessibility (WCAG 2.1 AA compliance)
- ❌ Use jargon in notifications (keep simple, direct)

### **Always Do:**
- ✅ Test on real Blackboard (ualearn.blackboard.com)
- ✅ Commit to GitHub after every feature
- ✅ Update ARCHITECTURE.md for structural changes
- ✅ Log scraping activity for debugging
- ✅ Handle offline mode (IndexedDB persists data)
- ✅ Use ASD-friendly language (clear, concrete, numbered steps)

---

## Blackboard Deep Links

Every assignment/course should link directly to Blackboard:

**Course URL:**
```
https://ualearn.blackboard.com/ultra/courses/{course_id}/outline
```

**Assignment URL (if available):**
```
{assignment.url}
```

**Fallback (if no URL):**
```
https://ualearn.blackboard.com/ultra/courses/{course_id}/outline
```

---

## Priority System

**Calculation:**
```javascript
function calculatePriority(assignment) {
  const hoursUntilDue = (assignment.due_date - Date.now()) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 0 || hoursUntilDue < 6) return 2; // URGENT
  if (hoursUntilDue < 24 || assignment.points > 50) return 1; // HIGH
  return 0; // NORMAL
}
```

**Colors:**
- 🔴 **URGENT (2):** Red (#dc2626) — Overdue or <6 hours
- 🟠 **HIGH (1):** Orange (#f59e0b) — <24 hours or >50 points
- 🟢 **NORMAL (0):** Green (#10b981) — Everything else

---

## Discord Notification Format (ASD-Optimized)

```markdown
🔔 **Assignment Due Soon**

**Course:** REL-100 (Introduction to Religion)
**Assignment:** Module 6 Quiz
**Due:** Thursday, March 27 @ 12:00 AM (EDT)
**Time Remaining:** 2 days, 3 hours

**What to do:**
1. Review notes from Module 6
2. Practice quiz questions
3. Submit before midnight Thursday

[View in RangeKeeper](https://rangekeeper.vercel.app/assignments/abc123)
```

---

## Model Selection for Rangekeeper Work

- **Default:** Sonnet 4.5 ($3/MTok) — General development
- **Bulk tasks:** DeepSeek V3 ($0.2/MTok) — Data processing, categorization
- **Sub-agents:** Haiku 4.5 ($0.8/MTok) — File operations, simple tasks
- **Complex reasoning:** Opus 4.6 ($15/MTok) — Only when explicitly requested

**Cost Target:** < $5/day for normal work, < $15/day for heavy research

---

## Business Context

### **Target Market**
- **Primary:** ASD/ADHD college students (70K-140K in US)
- **Secondary:** All students needing executive function support (1-2M)
- **Institutional:** Universities (accessibility/retention tool)

### **Revenue Models**
1. **B2C SaaS:** $5-15/month per student
2. **Freemium:** Free basic, $10/month for parent dashboard + AI features
3. **B2B Institutional:** $5-10 per student/year (bulk licensing)

### **Competitive Advantage**
- True LMS integration (scrapes Blackboard directly)
- ASD-specific design (clear, consistent, predictable)
- Multi-channel notifications (Discord, SMS, Chrome, email)
- Parent/supporter dashboard (FERPA-compliant, student-consented)

---

## Next Session Checklist

When resuming Rangekeeper work:

1. ✅ Load this file (`SUBAGENT_CONTEXT.md`)
2. ✅ Check `RANGEKEEPER_SESSION.md` for recent updates
3. ✅ Review `RANGEKEEPER_ARCHITECTURE.md` if structural work
4. ✅ Check GitHub for latest commits
5. ✅ Query database to see current data state
6. ✅ Ask Rico: "What Rangekeeper work should I focus on?"

---

## Quick Commands Reference

```bash
# View architecture
cat /home/ubuntu/.openclaw/workspace/rangekeeper/RANGEKEEPER_ARCHITECTURE.md

# View skill guide
cat /home/ubuntu/.openclaw/workspace/rangekeeper/SKILL.md

# Check database
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
node -e "const db = require('better-sqlite3')('data/rangekeeper.db'); console.log(db.prepare('SELECT COUNT(*) as count FROM assignments').get()); db.close();"

# Deploy to GitHub Pages
cd /home/ubuntu/.openclaw/workspace/rangekeeper
git add -A && git commit -m "Update" && git push origin master

# Start backend
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend && npm start

# Start Next.js
cd /home/ubuntu/.openclaw/workspace/rangekeeper-web && npm run dev
```

---

## Contact & Ownership

**Owner:** Rico Cacciatore  
**Primary User:** Massimo Cacciatore (UA student with ASD)  
**AI Developer:** Claw (subagent mode: Rangekeeper)  
**Repository:** https://github.com/ejcacciatore/rangekeeper  
**Live Site:** https://ejcacciatore.github.io/rangekeeper/

---

**Last Updated:** March 30, 2026  
**Subagent Version:** 1.0  
**Status:** Active, ready for dedicated development sessions
