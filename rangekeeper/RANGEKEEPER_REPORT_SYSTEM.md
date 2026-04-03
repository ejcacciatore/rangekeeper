# 📊 RANGEKEEPER REPORT SYSTEM — Student Dashboard Documentation

**Last Updated:** April 3, 2026  
**Project:** RangeKeeper Academic Tracking System  
**Owner:** Rico Cacciatore  
**Primary User:** Massimo (UA student, Spring 2026)  
**Purpose:** Generate clean, organized academic reports from Blackboard data

---

## 🎯 WHAT THIS IS

A reporting system that takes student data from University of Alabama Blackboard and generates beautiful, easy-to-read HTML dashboards showing:

1. **Assignments by course** — Sequenced by due date
2. **Overdue items** — Highlighted in red at the top
3. **Upcoming deadlines** — Color-coded by urgency
4. **Grades** — When posted by instructors
5. **Messages from instructors** — Organized by course
6. **Overall course grades** — When available

---

## 📁 FILES & LOCATIONS

### **Live Report URL:**
```
https://ejcacciatore.github.io/rangekeeper/massimo-student-report.html
```
*Note: GitHub Pages CDN can cache for 5-30 minutes. For instant updates, use raw GitHub or local file.*

### **Raw GitHub URL (always current):**
```
https://raw.githubusercontent.com/ejcacciatore/rangekeeper/master/massimo-student-report.html
```

### **Local Development File:**
```
/home/ubuntu/.openclaw/workspace/massimo-student-report.html
```

### **Backend Database:**
```
/home/ubuntu/.openclaw/workspace/rangekeeper/backend/data/rangekeeper.db
```

### **Git Repository:**
```
https://github.com/ejcacciatore/rangekeeper
Branch: master
```

---

## 🏗️ SYSTEM ARCHITECTURE

### **Data Flow:**

```
Blackboard (UA) 
    ↓
Chrome Extension (scrapes courses, assignments, grades, messages)
    ↓
IndexedDB (browser local storage)
    ↓
Backend API (POST /api/sync)
    ↓
SQLite Database (rangekeeper.db)
    ↓
Report Generator (reads DB, outputs HTML)
    ↓
GitHub Pages (static hosting)
    ↓
Massimo's Browser (views dashboard)
```

---

## 📊 DATABASE SCHEMA

### **Tables:**

1. **courses**
   - id, name, term, instructor_name, instructor_email, url, last_synced

2. **assignments**
   - id, course_id, title, description, due_date, points, submitted, grade, status, priority, url

3. **grades**
   - id, course_id, assignment_id, score, max_score, percentage, grade_posted_date

4. **messages**
   - id, course_id, sender, subject, body, unread, timestamp, url

5. **notifications**
   - id, assignment_id, notification_type, scheduled_time, sent_time, channel

6. **feedback**
   - id, course_id, assignment_id, feedback_text, posted_date

---

## 🎨 REPORT STRUCTURE (Current Design)

### **Top Section:**
- **Summary Stats:** Total courses, overdue items, due this week, upcoming
- **Alert Box:** Urgent overdue assignments (red background)

### **Per-Course Sections:**
Each course has:
1. **Header:** Course name, instructor, overall grade (when available)
2. **Assignments:** All assignments sequenced by due date with status badges
3. **Grades:** Posted grades with scores/percentages
4. **Messages:** Instructor communications

### **Status Badges:**
- 🔴 **OVERDUE** — Past due date (red)
- 🟠 **DUE TODAY** — Due within 24 hours (orange)
- 🔵 **UPCOMING** — Due in 3+ days (blue)
- 🟢 **COMPLETED** — Submitted/graded (green, faded)

### **Color Palette:**
- **Primary:** Alabama Crimson (#9E1B32)
- **Backgrounds:** Purple gradient (#667eea → #764ba2)
- **Cards:** White/light gray (#f8f9fa)
- **Status Red:** #dc2626
- **Status Orange:** #f59e0b
- **Status Blue:** #3b82f6
- **Status Green:** #10b981

---

## 🔄 DEPLOYMENT PROCESS

### **How Reports Get Updated:**

1. **Local Development:**
   ```bash
   cd /home/ubuntu/.openclaw/workspace
   # Edit massimo-student-report.html or generate from DB
   ```

2. **Commit to Git:**
   ```bash
   git add massimo-student-report.html
   git commit -m "Update report: [description]"
   git push origin master
   ```

3. **GitHub Actions Workflow:**
   - Automatically triggered on push to master
   - Workflow: `pages-build-deployment`
   - Builds and deploys to GitHub Pages
   - Typical deploy time: 30-90 seconds

4. **GitHub Pages Serving:**
   - URL: https://ejcacciatore.github.io/rangekeeper/
   - CDN cache: 5-30 minutes (can cause delays)
   - To bypass cache: Add `?v=timestamp` to URL

### **Manual Deploy Commands:**
```bash
cd /home/ubuntu/.openclaw/workspace
git add massimo-student-report.html
git commit -m "Manual update: [reason]"
git push origin master
```

### **Force GitHub Pages Rebuild:**
```bash
# Add trivial change to trigger rebuild
echo "<!-- Rebuild: $(date) -->" >> massimo-student-report.html
git add massimo-student-report.html
git commit -m "Trigger rebuild"
git push origin master
```

---

## 🐛 COMMON ISSUES & FIXES

### **Issue 1: GitHub Pages shows old version**
- **Cause:** CDN caching (can take 5-30 minutes)
- **Fix 1:** Wait 10-15 minutes
- **Fix 2:** Check raw.githubusercontent.com (always current)
- **Fix 3:** Use local file for immediate review
- **Fix 4:** Add `?v=20260403` to URL to bypass cache

### **Issue 2: GitHub Actions build fails**
- **Cause:** Broken submodules, invalid YAML, permission issues
- **Check:** https://github.com/ejcacciatore/rangekeeper/actions
- **Fix:** Look for errors in workflow logs, fix issue, recommit

### **Issue 3: File exists but returns 404**
- **Cause:** GitHub Pages hasn't picked up the new file yet
- **Fix:** Wait for next build cycle, or update an existing file instead

### **Issue 4: Data not showing in report**
- **Cause:** Database empty or not synced
- **Check:** Query rangekeeper.db directly
- **Fix:** Run extension scraper or seed test data

---

## 📋 CURRENT DATA (as of April 3, 2026)

### **Courses (6):**
1. MATH-125-007 — Calculus I (Jedidiah Agyei)
2. MATH-125-107 — Calculus I Lab (Jedidiah Agyei)
3. ENGR-101-006 — Introduction to Engineering (Bridgett Monk)
4. UA-101-030 — First-Year Seminar (Pete Ludovice)
5. REL-100-919 — Introduction to Religion (Multiple Instructors)
6. EN-103-025 — English Composition (Thom O'Rourke)

### **Assignments (19 total):**
- **Overdue (4):** Module 6 Quiz, Module 7 Quiz, 2 Religion discussions
- **Due This Week (2):** Eating With Cannibals, Suri Lip discussions
- **Upcoming (13):** Various quizzes, discussions, assignments through Apr 24

### **Grades:**
- Currently: None posted yet
- Structure ready to display when instructors post grades

### **Messages:**
- Currently: None
- System ready to pull from Blackboard when available

---

## 🚀 NEXT STEPS & ROADMAP

### **Phase 1 (Current — MVP Report):**
- ✅ Basic HTML report with all data
- ✅ Organized by course
- ✅ Assignments sequenced by due date
- ✅ Status badges (overdue, upcoming, etc.)
- ✅ Responsive mobile layout
- ⏳ Deploy to GitHub Pages (waiting for CDN)

### **Phase 2 (Advanced Features):**
- [ ] Auto-refresh every 10 seconds from IndexedDB
- [ ] Interactive filters (by course, status, date range)
- [ ] Search functionality
- [ ] Printable/PDF export
- [ ] Email digest option
- [ ] Calendar view (monthly grid)
- [ ] Grade charts/trends

### **Phase 3 (Real-Time Sync):**
- [ ] Extension syncs automatically every hour
- [ ] Backend exports JSON for dashboard
- [ ] GitHub Actions cron job (daily at 3 AM UTC)
- [ ] Discord notifications for urgent items

### **Phase 4 (Advanced Analytics):**
- [ ] GPA calculator
- [ ] Workload balance view
- [ ] Study time estimates
- [ ] Performance trends
- [ ] Parent/supporter dashboard

---

## 📝 DESIGN DECISIONS & RATIONALE

### **Why HTML instead of React/Next.js?**
- **Speed:** Zero build time, instant edits
- **Simplicity:** Massimo can open locally without Node/npm
- **Hosting:** GitHub Pages serves static HTML perfectly
- **Accessibility:** Works offline, no JavaScript required for core content

### **Why organize by course?**
- **Mental model:** Students think in courses, not global assignment lists
- **Context:** Grades/messages/assignments grouped together
- **Clarity:** Each course is a self-contained section

### **Why GitHub Pages?**
- **Free:** No hosting costs
- **Reliable:** 99.9% uptime
- **Fast:** CDN-backed globally
- **Simple:** Push to master = auto-deploy

### **Why SQLite?**
- **Zero config:** No server setup
- **Portable:** Single file, easy backups
- **Fast:** Perfect for < 10K records
- **Standard SQL:** Easy queries, joins, reports

---

## 🔧 DEVELOPER COMMANDS

### **Query Database:**
```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/rangekeeper.db');
db.all('SELECT * FROM courses', (err, rows) => {
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});
"
```

### **Generate Report from DB:**
```bash
# Run backend export endpoint
curl http://localhost:3000/api/export/json > data/latest.json

# Or query directly and pipe to jq
# (custom script needed for HTML generation)
```

### **Test Extension Scraper:**
```javascript
// In Chrome DevTools on Blackboard page:
RangeKeeperDebug.help()        // Show all commands
RangeKeeperDebug.run()         // Run full scraper
RangeKeeperDebug.grades()      // Test grades only
RangeKeeperDebug.showDB()      // Dump IndexedDB
```

### **Verify GitHub Status:**
```bash
# Check if local is in sync with remote
git fetch origin
git log HEAD..origin/master --oneline

# Should be empty if synced

# Check what's on GitHub
curl -s https://raw.githubusercontent.com/ejcacciatore/rangekeeper/master/massimo-student-report.html | head -10
```

---

## 📞 CONTACTS & RESOURCES

**Project Owner:** Rico Cacciatore (ejcacciatore@gmail.com)  
**Primary User:** Massimo (UA student)  
**AI Developer:** Claw (OpenClaw assistant)

**GitHub Repo:** https://github.com/ejcacciatore/rangekeeper  
**Live Dashboard:** https://ejcacciatore.github.io/rangekeeper/  
**Backend API:** http://localhost:3000 (when running locally)

**Related Docs:**
- `RANGEKEEPER_MASTER_SESSION.md` — Full project context
- `RANGEKEEPER_ARCHITECTURE.md` — Technical deep dive
- `SKILL.md` — AI developer instructions
- `README.md` — Public project description
- `SETUP_GUIDE.md` — Backend/Discord setup

---

## 🎯 SUCCESS CRITERIA

### **For Massimo (MVP):**
- ✅ See all courses in one place
- ✅ Know what's due today/this week
- ✅ Identify overdue items immediately
- ✅ View grades when posted
- ✅ Read instructor messages
- ⏳ Access from any device (mobile, tablet, laptop)

### **For Product (If Scaling):**
- [ ] 100 students using system
- [ ] 80% retention after 30 days
- [ ] 50% reduction in missed assignments
- [ ] 1 university pilot program
- [ ] $1K MRR from paid tier

---

## 📊 METRICS TO TRACK

- **User engagement:** Page views, session duration
- **Data quality:** % of assignments scraped successfully
- **Notification delivery:** Discord success rate
- **Performance:** Page load time, DB query speed
- **User feedback:** Survey responses, feature requests

---

## 🔐 SECURITY & PRIVACY

- **Data storage:** Local SQLite (not cloud)
- **Authentication:** None required (static HTML)
- **Personal data:** Student name not shown (report is generic)
- **Sharing:** URL is public but not indexed/discoverable
- **Backup:** Git history = version control

---

## 📅 CHANGELOG

### **April 3, 2026 (21:00 UTC)**
- ✅ Created comprehensive report system
- ✅ Redesigned to organize by course
- ✅ Added status badges (overdue, upcoming)
- ✅ Fixed broken submodule issue blocking GitHub Pages
- ✅ Multiple deploy attempts (CDN cache delays)
- ✅ Created this documentation file

### **April 1, 2026**
- ✅ Added IndexedDB live sync (10-second auto-refresh)
- ✅ Dashboard reads directly from extension storage
- ✅ No manual refresh needed

### **March 30, 2026**
- ✅ Backend 100% complete (11+ endpoints)
- ✅ Extension 90% complete (scraper code ready)
- ✅ Basic GitHub Pages MVP deployed
- ✅ GitHub Actions auto-export workflow

---

## ❓ QUESTIONS TO ANSWER

1. **Grade display format:**
   - Option A: Score only (85/100)
   - Option B: Score + percentage (85/100 — 85%)
   - Option C: Score + letter grade (85/100 — B)
   - **Decision:** TBD (waiting for Rico feedback)

2. **Messages display:**
   - Full body or preview?
   - **Decision:** TBD

3. **Overall grade calculation:**
   - Show raw from Blackboard, calculate weighted avg, or both?
   - **Decision:** TBD

4. **Contact info:**
   - Show instructor email on course cards?
   - **Decision:** TBD

---

**This document is the single source of truth for how the RangeKeeper report system works.**  
**Update it whenever architecture, design, or deployment process changes.**  

**Last Verified:** April 3, 2026 21:38 UTC ✅
