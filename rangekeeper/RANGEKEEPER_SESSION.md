# 🎯 RANGEKEEPER — MASTER SESSION CONTEXT

**Last Updated:** March 29, 2026  
**Project Status:** v0.2.0 — Full Grades + Messages + Feedback Scraping  
**Session Type:** Persistent Reference Document

---

## QUICK ACCESS LINKS

**Key Files:**
- `/home/ubuntu/.openclaw/workspace/rangekeeper/STATUS.md` — Current build status
- `/home/ubuntu/.openclaw/workspace/rangekeeper/ACTION_PLAN.md` — Day-by-day implementation checklist
- `/home/ubuntu/.openclaw/workspace/rangekeeper/README.md` — Project overview
- `/home/ubuntu/.openclaw/workspace/rangekeeper/BUILD_SUMMARY.md` — What's built and what's blocking

**Code:**
- `/home/ubuntu/.openclaw/workspace/rangekeeper/backend/` — Node.js server (100% complete)
- `/home/ubuntu/.openclaw/workspace/rangekeeper/extension/` — Chrome extension (90% complete)

---

## PROJECT SUMMARY

**What:** Academic assignment tracker for neurodivergent college students  
**Who:** Your son (UA student with ASD) — primary user  
**Why:** Blackboard Learn doesn't provide proactive reminders or executive function support  
**How:** Chrome extension scrapes Blackboard + Node.js backend + Discord notifications

---

## CURRENT STATUS (March 28, 2026)

### ✅ What's Working

**Backend (100% Complete):**
- Express API with 7 routes
- SQLite database with 7 tables
- Discord bot with ASD-optimized notifications (4 types)
- Graduated urgency scheduler (7d→3d→1d→6h→2h→overdue)
- ICS calendar feed poller
- Test data generator (`npm run test`)
- Deployment configs (Docker, Railway)

**Extension (90% Complete):**
- Manifest V3 with proper permissions
- Content script with DOM scraper + MutationObserver
- Background service worker with IndexedDB
- Popup dashboard with stats and assignment list
- Chrome notifications for upcoming deadlines
- Backend sync via POST /api/sync

### ⚠️ What's Blocking

**Critical (Must Fix Before Testing):**
1. **DOM selectors** — Extension uses placeholders, need real UA Blackboard HTML structure
2. **Extension icons** — Need 16x16, 48x48, 128x128 PNG files

**Optional (For Full Experience):**
3. **Discord bot setup** — Need token + user ID in .env
4. **3 data points from your son:**
   - Blackboard version number (footer)
   - ICS calendar feed URL (if available)
   - Notification settings screenshot

---

## MISSION CONTEXT

### Target User
- University of Alabama student
- ASD (autism spectrum disorder)
- Struggles with assignment tracking and deadline management
- Benefits from executive function support

### Core Problem
Blackboard Learn doesn't:
- Send proactive reminders
- Provide executive function scaffolding
- Break down complex tasks
- Adapt to neurodivergent needs

Generic task managers don't:
- Integrate with LMS data
- Understand course context
- Track grades or instructor expectations

### RangeKeeper's Solution
1. **Automatic data collection** — Scrapes courses, assignments, grades from Blackboard
2. **Graduated reminders** — Gentle 7 days out → firm 1 day out → urgent 2 hours out
3. **Multi-channel delivery** — Discord + Chrome notifications + (optional) SMS
4. **ASD-specific design** — Clear, consistent, sensory-friendly UI
5. **Optional parent visibility** — FERPA-compliant dashboard (student-consented)

---

## TECHNICAL ARCHITECTURE

### Data Flow
```
Student browses Blackboard
    ↓
Chrome Extension (content.js) scrapes DOM
    ↓
IndexedDB stores data locally (offline access)
    ↓
Background script syncs to backend via POST /api/sync
    ↓
Backend (Node.js + SQLite) persists data
    ↓
Scheduler checks every 15 min for upcoming deadlines
    ↓
Discord bot sends notifications (or Chrome notifications)
    ↓
Student sees reminder in Discord
```

### Tech Stack
- **Extension:** Manifest V3, Vanilla JS, IndexedDB
- **Backend:** Node.js 18+, Express, SQLite, discord.js, node-cron
- **Deployment:** Docker + Railway (free tier)
- **Notifications:** Discord (free), Chrome API (free), Twilio SMS (optional, ~$5/mo)

---

## COMPETITIVE LANDSCAPE

**No competitor offers ALL of:**
1. True LMS integration (direct Blackboard data)
2. ASD-specific design
3. Grade-aware prioritization
4. Parent/supporter dashboard
5. Multi-channel smart notifications

**Closest Competitors:**
- **Tiimo** ($50/yr) — Great neurodivergent UX, no LMS integration, iOS-only
- **Goblin Tools** (free) — Task breakdown only, website currently down
- **Shovel** ($240/yr) — Claims LMS sync, unclear depth, no ASD features
- **MyStudyLife** — Manual entry, no AI, no neurodivergent support

---

## BUSINESS OPPORTUNITY (IF YOU GO PRODUCT)

### Market Size
- 70K-140K ASD college students in US
- 1-2M students with ADHD or executive function challenges
- No direct competitor doing LMS-aware + ASD-specific + proactive notifications

### Revenue Models
1. **B2C SaaS:** $5-15/month per student
2. **B2B Institutional:** Sell to universities as accessibility/retention tool
3. **Freemium:** Free for basic notifications, paid for AI task breakdown + parent dashboard

### Rough Projections
- 1,000 users × $10/mo = **$120K/year**
- UA campus-wide (500 students) × $5/student/year = **$190K/year** from one school
- 10 universities = **$2M ARR**

### Validation Path
1. **Month 1:** Build for your son, validate it works
2. **Month 2:** His friends try it → word of mouth
3. **Month 3:** Approach UA Disability Services with pilot offer
4. **Month 6:** Scale to 2-3 other universities
5. **Year 1:** Raise seed funding (Tiimo raised $1.5M — market is proven)

---

## RECENT CONTEXT (March 28, 2026)

### What Happened Earlier Today
- You mentioned doing "Option A" and it "seems to work"
- You mentioned "Blackboard on grades as well"
- You clicked `/new` by accident, lost session context
- You want to consolidate Rangekeeper into a persistent session

### What "Option A" Likely Refers To
Based on tax-engine QUICKSTART.md, "Option A" = automated API-based data collection vs "Option B" = manual CSV exports.

For Rangekeeper, this could mean:
- **Option A:** Using Blackboard REST API (3LO OAuth) — requires UA admin approval
- **Option B:** Extension-based DOM scraping — works immediately, no permissions needed

You likely tested the extension and it scraped some data successfully.

### What "Blackboard on Grades" Likely Refers To
- Extension currently scrapes courses and assignments
- You want to add **grade scraping** as well
- STATUS.md mentions `detectPageType()` supports 'grades' but scraping logic may be incomplete

---

## IMMEDIATE NEXT STEPS

### To Resume Testing
1. **Tell me what worked in "Option A"** — Did the extension scrape courses? Assignments? Grades?
2. **Share DOM screenshots** — Course card, assignment item, grade row from `ualearn.blackboard.com`
3. **Add extension icons** — 5 min via https://favicon.io/emoji-favicons/bullseye/

### To Add Grade Scraping
1. **Inspect Blackboard grades page** — Right-click grade item → Inspect → screenshot HTML
2. **I'll add selectors** to `extension/scripts/content.js`
3. **Test** — Extension should show grades in popup dashboard

### To Get Full Notifications
1. **Set up Discord bot** — 10 min (see SETUP_GUIDE.md Part 5)
2. **Deploy backend to Railway** — 15 min (optional, can run locally for now)
3. **Your son tests for 1 week** — Gather feedback

---

## HOW TO USE THIS SESSION

### When You Want to Work on Rangekeeper
1. Open chat and say: **"Rangekeeper session"** or **"Load Rangekeeper context"**
2. I'll read this file and have full context
3. We continue from where we left off

### What This File Contains
- Project summary and current status
- Architecture and tech stack
- Competitive landscape and business case
- Recent conversation context
- Next steps and blockers

### What to Update
- When major progress happens (selectors fixed, extension tested, etc.)
- When decisions are made (product vs personal, deployment choices, etc.)
- When feedback comes in (your son's experience, what works, what doesn't)

---

## DECISION POINTS

### Now: Personal Tool or Product?
**Recommendation:** Build for your son first. Validate it actually helps. Product decision comes later.

### When to Deploy to Production
**Recommendation:** Once selectors are fixed and extension scrapes data successfully, deploy backend to Railway (free tier). Gives 24/7 uptime for notifications.

### When to Approach UA Disability Services
**Recommendation:** After your son uses it for 1-2 months and loves it. Then you have a real story to tell.

---

## FILES YOU MIGHT NEED

### Backend Setup
```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
npm install
npm run test      # Seeds sample data
npm start         # Runs server on :3000
```

### Extension Installation
1. Chrome → `chrome://extensions/`
2. Enable Developer Mode
3. Load unpacked → select `/home/ubuntu/.openclaw/workspace/rangekeeper/extension/`

### Discord Bot Setup
See: `/home/ubuntu/.openclaw/workspace/rangekeeper/SETUP_GUIDE.md` Part 5

---

## CONTACT & COLLABORATION

**Rico Cacciatore**
- Primary stakeholder
- Father of target user (UA student with ASD)
- Entrepreneur with 5+ businesses
- Goal: Validate product-market fit, potentially commercialize

**Target User (Your Son)**
- University of Alabama student
- ASD diagnosis
- Primary user for MVP validation
- Feedback drives feature prioritization

---

## CHANGELOG

**March 28, 2026:**
- Created this persistent session document
- Consolidated all Rangekeeper context
- Added recent conversation context (Option A, grades)
- Established workflow for resuming sessions

**March 19, 2026:**
- Completed backend (100%)
- Completed extension (90%)
- Wrote comprehensive documentation
- Identified blockers (selectors, icons)

---

## REFERENCE COMMANDS

### Load This Session
```
"Rangekeeper session"
"Load Rangekeeper context"
"Continue Rangekeeper work"
```

### Key Operations
```bash
# Backend
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend && npm start

# Test data
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend && npm run test

# Check health
curl http://localhost:3000/health

# View database
sqlite3 backend/data/rangekeeper.db "SELECT * FROM courses;"
```

---

**This is your Rangekeeper home base. Whenever you want to work on this project, reference this file and we'll pick up exactly where we left off.** 🎯
