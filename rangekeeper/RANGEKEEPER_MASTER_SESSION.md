# 🎯 RANGEKEEPER — UNIFIED MASTER SESSION

**Last Updated:** March 30, 2026 12:40 UTC  
**Project Status:** v0.2.1 — Grades + Messages + Feedback Scraping Complete  
**Session Type:** Consolidated persistent reference (merged from rangekeeper-bg + main)  
**Owner:** Rico Cacciatore  
**AI Developer:** Claw

---

## 📍 NAVIGATION

**This is your single source of truth for Rangekeeper.** When you want to work on the project:
1. Say "**Rangekeeper session**" or load **RANGEKEEPER_MASTER_SESSION.md**
2. I'll have complete context of everything built, in-progress, and next steps
3. We continue seamlessly from where we left off

---

## 🚀 CURRENT STATUS AT A GLANCE

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend API** | ✅ 100% Complete | Express, SQLite, 11+ endpoints, fully functional |
| **Extension (code)** | ✅ 90% Complete | Scrapes courses, assignments, grades, messages, feedback |
| **Extension (selectors)** | ⏳ Needs validation | Code is ready, need live Blackboard testing |
| **Extension UI (popup)** | ✅ 100% Complete | Tabbed dashboard (Tasks, Grades, Messages, Courses) |
| **GitHub Pages (basic)** | ✅ 100% Complete | index.html, courses.html, Massimo's report deployed |
| **GitHub Pages (advanced)** | ⏳ In queue | course-detail.html, assignments.html, grades.html, calendar.html, settings.html |
| **Discord notifications** | ✅ Built, needs token | Code ready, awaiting DISCORD_BOT_TOKEN + DISCORD_USER_ID in .env |
| **ICS calendar export** | ✅ Code ready | Template exists, needs UI button integration |

---

## 📦 WHAT'S BUILT (v0.2.1)

### Backend (Node.js + Express + SQLite)

**Infrastructure:**
- Express server running on `http://localhost:3000` (or Railway in production)
- SQLite database: `/home/ubuntu/.openclaw/workspace/rangekeeper/backend/data/rangekeeper.db`
- 10 tables: courses, assignments, grades, messages, notifications, settings, announcements, ics_feeds, feedback, daily_snapshots
- Full CORS enabled for GitHub Pages access
- Health check endpoint: `GET /health` → `{"status":"healthy","database":"ok"}`

**API Endpoints:**
- `POST /api/sync` — Accepts courses, assignments, grades, messages, feedback (extension syncs here)
- `GET /api/courses` — All courses
- `GET /api/assignments` — All assignments (sortable)
- `GET /api/grades` — All grades
- `GET /api/messages` — All unread messages
- `GET /api/feedback` — Instructor feedback
- `GET /api/summary` — Quick counts (total courses, pending assignments, etc.)
- `GET /api/export/json` — Full data export for GitHub Pages dashboard
- `GET /api/notifications/pending` — Notifications ready to send

**Notification Scheduler:**
- Runs every 15 minutes via node-cron
- Checks assignments for upcoming deadlines
- Sends notifications at graduated intervals: **7d → 3d → 1d → 6h → 2h → overdue**
- Supports multiple channels: Discord (primary), Chrome, SMS (Twilio, optional), email (Nodemailer, optional)

**Discord Bot Integration:**
- Sends ASD-optimized notifications (clear, structured, actionable)
- Format: Course name, assignment title, due date/time, time remaining, action steps, link to RangeKeeper
- Requires: `DISCORD_BOT_TOKEN` and `DISCORD_USER_ID` in `.env`

### Chrome Extension (Manifest V3)

**Core Functionality:**
- **Content script** (`content.js`) — Main scraper with MutationObserver for SPA updates
- **Background service worker** (`background.js`) — Handles notifications, sync scheduling
- **IndexedDB storage** — Local offline data persistence
- **Popup UI** — Dark-themed tabbed dashboard (Tasks | Grades | Messages | Courses)

**Page Detection (5 types):**
- `activity-stream` — Activity feed (grades posted, announcements)
- `grades` — Grades page (gradebook table, overview cards)
- `messages` — Messages landing page (course unread counts)
- `messages-thread` — Individual course message thread
- `course-detail` — Single course page

**Scrapers Built:**
1. **Grades Scraper** (`grades-scraper.js`)
   - Extracts from activity stream (grade postings)
   - Extracts from overview cards (course totals)
   - Extracts from gradebook table (individual assignments)
   - Returns: `[{assignment_name, score, percentage, posted_date, feedback}, ...]`

2. **Messages Scraper** (`messages-scraper.js`)
   - Landing page: Gets unread count per course
   - Thread page: Gets individual messages with sender, subject, body, date
   - Returns: `[{course_id, sender, subject, body, unread, timestamp}, ...]`

3. **Feedback Scraper**
   - Extracts instructor comments from grades
   - Returns: `[{assignment_name, feedback_text, posted_date}, ...]`

**Debug Console:**
```javascript
// Type in Chrome DevTools console on any Blackboard page:
RangeKeeperDebug.help()        // Show all commands
RangeKeeperDebug.page()        // Detect current page type
RangeKeeperDebug.run()         // Run full scraper
RangeKeeperDebug.grades()      // Test grades scraper only
RangeKeeperDebug.activity()    // Test activity stream
RangeKeeperDebug.messages()    // Test messages landing
RangeKeeperDebug.thread()      // Test course message thread
RangeKeeperDebug.showDB()      // Dump all IndexedDB data
RangeKeeperDebug.testBackend() // Test backend connectivity
```

**Selector Test Page:**
- File: `SELECTOR_TEST.html`
- Mock Blackboard DOM with test data
- Buttons to test each scraper without hitting real Blackboard
- Open locally: `file:///path/to/SELECTOR_TEST.html`

### GitHub Pages Dashboard

**Live at:** https://ejcacciatore.github.io/rangekeeper/

**Current Pages:**
1. **index.html** — Today's Focus
   - "Good morning, Massimo! You have X assignments due today."
   - Today's to-do list (due in next 24 hours)
   - Upcoming this week (next 7 days)
   - Recent grades (last 5)
   - Quick stats (total courses, pending, average grade)
   - Priority badges (🟢 Normal, 🟠 High, 🔴 Urgent)

2. **courses.html** — All Courses Grid
   - Card-based layout (one per course)
   - Per-course: pending count, average grade, next due date
   - Click card → navigate to course-detail.html?id=XXX (when built)

3. **massimo-student-report.html** — Generated Report
   - Spring 2026 data (courses, assignments, grades)
   - Auto-generated from database

**Pending Pages (to be built):**
4. **course-detail.html** — Single Course Deep Dive
5. **assignments.html** — Master Assignment List
6. **grades.html** — Grade Book with Charts
7. **calendar.html** — Monthly Calendar View
8. **settings.html** — User Preferences

---

## ⚠️ WHAT'S BLOCKING / NEXT PRIORITIES

### Critical (Must Complete for MVP)

**1. Validate Extension Selectors on Real Blackboard** (2-4 hours)
- **Status:** Code is ready, needs live testing
- **What Rico needs to do:**
  1. Pull latest code from GitHub
  2. Reload extension in Chrome (`chrome://extensions/` → Remove → Load unpacked)
  3. Go to `https://ualearn.blackboard.com`
  4. Test each page using `RangeKeeperDebug` commands:
     - Activity stream page: `RangeKeeperDebug.activity()`
     - Grades page (per-course): `RangeKeeperDebug.grades()`
     - Messages landing: `RangeKeeperDebug.messages()`
     - Course message thread: `RangeKeeperDebug.thread()`
     - Popup dashboard: Click extension icon
  5. Share screenshots of console output (especially if any errors)
  
- **If selectors need fixing:**
  - Send me the DOM screenshot
  - I'll update selectors in 5 minutes
  - Re-test

**2. Build Advanced Dashboard Pages** (6-8 hours)
- **Status:** Architecture designed, code templates ready
- **What needs building:**
  - `course-detail.html?id=XXX` — Course header, 4 tabs (Assignments, Grades, Messages, Calendar)
  - `assignments.html` — Master list with filters (course, status, priority), sorting, search
  - `grades.html` — Summary stats, grade table, charts (line, bar)
  - `calendar.html` — Monthly grid, export to ICS
  - `settings.html` — Notification preferences, theme, data export
  - Responsive CSS for mobile/tablet/desktop
  - WCAG 2.1 AA accessibility

- **Priority:** Start with `course-detail.html` (most valuable)

### High Priority

**3. Backend Data Export Automation** (2-3 hours)
- `/api/export/json` endpoint already exists
- Need GitHub Actions workflow to regenerate `data/latest.json` daily at midnight
- Dashboard will fetch latest data automatically

**4. Discord Bot Setup** (30 minutes)
- Rico creates bot at https://discord.com/developers/applications
- Add `DISCORD_BOT_TOKEN` and `DISCORD_USER_ID` to `backend/.env`
- Start backend: enables "2 hours before" and "overdue" notifications

**5. ICS Calendar Export** (1-2 hours)
- Code template exists (in SKILL.md)
- Add export buttons to: index.html, course-detail.html, assignments.html, calendar.html
- Generate `.ics` file that opens in Apple Calendar, Google Calendar, Outlook

### Optional (Nice-to-Have)

**6. Parent/Supporter Dashboard** (TBD)
- Read-only view of student data
- Weekly email digest
- Can be built after MVP validates with Massimo

---

## 📊 RECENT WORK SUMMARY (March 29-30)

### What Was Completed in Background Session
- ✅ Backend API fully upgraded (all data types, 11+ endpoints)
- ✅ Grades scraper rebuilt (handles activity stream, overview cards, gradebook)
- ✅ Messages scraper built (landing page + individual threads)
- ✅ Feedback scraper added
- ✅ Debug console built (`RangeKeeperDebug` object)
- ✅ Selector test page created
- ✅ All code pushed to GitHub (master branch)

### What Happened in Main Session
- ✅ Loaded full architecture doc (RANGEKEEPER_ARCHITECTURE.md)
- ✅ Loaded skill file (SKILL.md)
- ✅ Assessed current state vs. what's needed
- ✅ Consolidated all context into this master session

---

## 🎯 YOUR NEXT DECISION POINT

**Rico: Which path do you want to take?**

### Option A: Validate Selectors First (1-2 hours)
✅ **Best if:** You want to verify extension works before investing in dashboard  
📋 **Steps:**
1. Pull latest code
2. Test on Blackboard using debug commands
3. Share screenshots
4. I fix any issues

🎯 **Outcome:** Production-ready scraper, confidence in data quality

---

### Option B: Build Advanced Dashboard (6-8 hours)
✅ **Best if:** You want full feature experience for Massimo to test  
📋 **Steps:**
1. I build course-detail.html with 4 tabs
2. I build assignments.html with filters/sorting
3. I build grades.html with charts
4. I build calendar.html with ICS export
5. Deploy to GitHub Pages

🎯 **Outcome:** Complete web interface, ready for 1-month trial with Massimo

---

### Option C: Both (Recommended) 🏆
**Timeline:**
- **Today/tomorrow:** Validate selectors (1-2h)
- **This week:** Build advanced dashboard (6-8h)
- **Next week:** Deploy, test with Massimo, gather feedback
- **Month 1:** Refine based on real-world use

**Outcome:** Fully validated, feature-complete MVP

---

## 💻 QUICK COMMANDS

### Backend
```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend

# Start server (localhost:3000)
npm start

# Test data seed
npm run test

# Check database
sqlite3 data/rangekeeper.db "SELECT COUNT(*) as courses FROM courses; SELECT COUNT(*) as assignments FROM assignments; SELECT COUNT(*) as grades FROM grades;"

# Query specific data
sqlite3 data/rangekeeper.db "SELECT title, due_date FROM assignments ORDER BY due_date LIMIT 5;"
```

### Extension
```bash
# Extension folder
/home/ubuntu/.openclaw/workspace/rangekeeper/extension/

# Reload in Chrome
chrome://extensions/ → find RangeKeeper → Reload button (or remove & re-add)

# Test page
file:///home/ubuntu/.openclaw/workspace/rangekeeper/SELECTOR_TEST.html
```

### GitHub Pages (Deploy)
```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper

# After editing .html files
git add *.html assets/ data/
git commit -m "Update dashboard: [describe changes]"
git push origin master

# Live in ~30 seconds at:
# https://ejcacciatore.github.io/rangekeeper/
```

---

## 📁 FILE STRUCTURE

```
rangekeeper/
├── RANGEKEEPER_MASTER_SESSION.md   ← YOU ARE HERE
├── RANGEKEEPER_ARCHITECTURE.md     (detailed tech spec)
├── SKILL.md                         (AI developer skill)
├── README.md
├── SELECTOR_TEST.html              (mock DOM for testing)
├── index.html                       (live — today's focus)
├── courses.html                     (live — all courses)
├── index-new.html                  (draft)
├── massimo-student-report.html      (live — generated report)
│
├── extension/
│   ├── manifest.json
│   ├── icons/
│   ├── scripts/
│   │   ├── background.js
│   │   ├── content.js
│   │   ├── grades-scraper.js
│   │   ├── messages-scraper.js
│   │   └── utils.js
│   └── popup/
│       ├── popup.html
│       ├── popup.js
│       └── popup.css
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── routes/ (sync, courses, assignments, grades, export, etc.)
│   │   ├── scheduler.js
│   │   └── discord-bot.js
│   ├── data/
│   │   └── rangekeeper.db (SQLite)
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
│
├── dashboard/
│   └── assets/ (CSS, JS, icons)
│
└── .github/
    └── workflows/ (GitHub Actions for auto-deploy)
```

---

## 🎓 KEY CONTEXT SNIPPETS

### Database Schema (Quick Reference)

**courses table:**
```sql
id, name, title, term, instructor_name, instructor_email, url, color, last_synced, created_at, updated_at
```

**assignments table:**
```sql
id, course_id, title, description, due_date, points, submitted, grade, status, priority, url, last_synced, created_at, updated_at
```

**grades table:**
```sql
id, course_id, assignment_id, assignment_name, score, percentage, posted_date, grade_url, feedback, created_at, updated_at
```

**messages table:**
```sql
id, course_id, sender, subject, body, unread, timestamp, url, created_at
```

### Color System (for UI)
- **Primary:** Alabama Crimson (#9E1B32)
- **Status Green:** #10b981 (completed, >3 days away)
- **Status Blue:** #3b82f6 (upcoming, 1-3 days)
- **Status Orange:** #f59e0b (due soon, <1 day)
- **Status Red:** #dc2626 (overdue, urgent)

### Priority Logic
```javascript
function calculatePriority(assignment) {
  const hoursUntilDue = (assignment.due_date - Date.now()) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 6 || assignment.due_date < Date.now()) return 2; // URGENT 🔴
  if (hoursUntilDue < 24 || assignment.points > 50) return 1; // HIGH 🟠
  return 0; // NORMAL 🟢
}
```

---

## ✅ SUCCESS CRITERIA

### For MVP (Personal Tool)
- [ ] Extension scrapes all courses, assignments, grades from Blackboard
- [ ] Dashboard shows today's assignments with countdown
- [ ] Notifications arrive via Discord (24h + 2h before deadline)
- [ ] Massimo uses it for 1 month without missing an assignment
- [ ] UI is mobile-responsive and ASD-friendly

### For Product Launch (If Going That Route)
- [ ] 100 students using extension (organic growth)
- [ ] 80% retention after 30 days
- [ ] 50% reduction in missed assignments
- [ ] 1 university pilot signed (UA Disability Services)
- [ ] $1K MRR from paid tier

---

## 📝 HOW TO USE THIS SESSION

**When you want to work on Rangekeeper:**
1. Say: "**Rangekeeper session**" or "**Load Rangekeeper context**"
2. I'll read **RANGEKEEPER_MASTER_SESSION.md**
3. I'll have full context of everything
4. We continue from exactly where we left off

**When I need to update this file:**
- Major milestones (feature completed, decision made, direction changed)
- New blockers discovered
- Feedback from Massimo
- Architecture changes

**You should update this file when:**
- You make a decision on next priority
- You test selectors and get results
- You set up Discord bot
- You have Massimo feedback

---

## 🗂️ RELATED DOCUMENTS

| Document | Purpose |
|----------|---------|
| **RANGEKEEPER_ARCHITECTURE.md** | Complete technical spec (11K, all systems) |
| **SKILL.md** | AI developer skill (dev instructions) |
| **README.md** | Public project description |
| **ACTION_PLAN.md** | Day-by-day implementation checklist |
| **BUILD_SUMMARY.md** | What's built, what's blocking |
| **MASSIMO_GUIDE.md** | Installation guide for end user |
| **SETUP_GUIDE.md** | Backend/Discord setup instructions |

---

## 💬 CONTACT

**Owner:** Rico Cacciatore (ejcacciatore@gmail.com)  
**Primary User:** Massimo (UA student, ASD)  
**AI Developer:** Claw  
**Repository:** https://github.com/ejcacciatore/rangekeeper  
**Live Dashboard:** https://ejcacciatore.github.io/rangekeeper/  
**Backend Status:** http://localhost:3000/health (when running locally)

---

## 📌 SESSION CHANGELOG

| Date | What Happened | Status |
|------|---------------|--------|
| **Mar 30 12:40** | Merged rangekeeper-bg + main into unified RANGEKEEPER_MASTER_SESSION.md | ✅ Complete |
| **Mar 30 12:09** | Subagent context loaded, full architecture assessed | ✅ Complete |
| **Mar 29 16:52** | Background work: selectors tested, debug console built, code pushed | ✅ Complete |
| **Mar 28 20:43** | Massimo guide written, basic dashboard deployed | ✅ Complete |
| **Mar 19 14:25** | Backend 100% complete, extension 90% complete | ✅ Complete |

---

**This document is your Rangekeeper home base.** 
**All context, decisions, and next steps live here.**  
**Reference this file whenever you load the Rangekeeper session.** 🎯

**Last Updated:** March 30, 2026 12:40 UTC  
**Next Review:** April 5, 2026 (post-selector validation)
