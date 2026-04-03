# RangeKeeper Development Skill

## Overview

**Skill Name:** rangekeeper  
**Purpose:** Build and maintain RangeKeeper, an academic assignment tracker for neurodivergent college students  
**Target User:** Students with ASD/ADHD attending universities using Blackboard Learn  
**Primary Stakeholder:** Rico Cacciatore (father of target user, entrepreneur)

## When to Use This Skill

Activate this skill when the user:
- Mentions "Rangekeeper", "student dashboard", "Blackboard tracker", or "Massimo's assignments"
- Asks to work on the Chrome extension, backend, or dashboard
- Requests features related to assignment tracking, notifications, or grade monitoring
- Wants to update the GitHub Pages site or export data
- Discusses commercialization, institutional sales, or product roadmap

## Core Context

### What RangeKeeper Is
- **Chrome extension** that scrapes Blackboard Learn (activity stream, calendar, grades, messages)
- **Node.js backend** (Express + SQLite) that stores data and schedules notifications
- **GitHub Pages dashboard** (static HTML) for viewing courses, assignments, and grades
- **Discord bot** for sending ASD-optimized deadline reminders

### Current Status (as of March 30, 2026)
- ✅ Extension scrapes courses, assignments, grades (v0.2.0)
- ✅ Backend has 10 database tables, API endpoints, notification scheduler
- ✅ Basic HTML report deployed to GitHub Pages
- ⚠️ Dashboard needs major upgrade (multi-page, course detail views, priority sorting, "due today")

### Key Files
- **Architecture:** `/home/ubuntu/.openclaw/workspace/rangekeeper/RANGEKEEPER_ARCHITECTURE.md`
- **Extension:** `/home/ubuntu/.openclaw/workspace/rangekeeper/extension/`
- **Backend:** `/home/ubuntu/.openclaw/workspace/rangekeeper/backend/`
- **Dashboard:** `/home/ubuntu/.openclaw/workspace/rangekeeper/` (HTML files)
- **Database:** `/home/ubuntu/.openclaw/workspace/rangekeeper/backend/data/rangekeeper.db`
- **Session Context:** `/home/ubuntu/.openclaw/workspace/rangekeeper/RANGEKEEPER_SESSION.md`

### GitHub
- **Repo:** https://github.com/ejcacciatore/rangekeeper
- **Branch:** master
- **GitHub Pages:** https://ejcacciatore.github.io/rangekeeper/

## Technical Stack

| Component | Technology |
|-----------|-----------|
| Extension | Vanilla JS, IndexedDB, Manifest V3 |
| Backend | Node.js 18+, Express, SQLite (better-sqlite3) |
| Dashboard | Static HTML, CSS, Vanilla JS |
| Notifications | discord.js, node-cron |
| Deployment | GitHub Pages (frontend), Railway (backend) |

## Database Schema (SQLite)

10 tables:
1. **courses** — Course info (name, instructor, term)
2. **assignments** — Assignments with due dates, status, priority
3. **grades** — Grades with scores, percentages, feedback
4. **messages** — Course messages/announcements
5. **notifications** — Notification log (sent/pending)
6. **settings** — User preferences
7. **announcements** — Course announcements
8. **ics_feeds** — Calendar feed URLs
9. **feedback** — Instructor feedback on assignments
10. **daily_snapshots** — Daily data backups (JSON)

## Key Features to Build

### Dashboard Pages (Priority Order)

1. **index.html — Today's Focus**
   - "Good morning, Massimo!" greeting
   - Assignments due today (sorted by time)
   - Upcoming this week preview
   - Recent grades (last 5)
   - Quick stats (courses, pending assignments, average grade)

2. **courses.html — All Courses Grid**
   - Card-based layout
   - Per-course stats (pending assignments, average grade, next due date)
   - Click card → navigate to course-detail.html?id=XXX

3. **course-detail.html — Single Course**
   - Course header (name, instructor, overall grade)
   - Tabs: Assignments, Grades, Messages, Calendar
   - Assignment list filtered to this course
   - Grade breakdown chart
   - Export to ICS button

4. **assignments.html — Master Assignment List**
   - Filters: by course, status, priority
   - Sorting: due date, priority, course, points
   - Search: text search by name
   - Bulk actions: mark submitted, export to calendar

5. **grades.html — Grade Book**
   - Summary stats (overall GPA, per-course averages)
   - Grade table (assignment, course, score, percentage, date)
   - Charts: grades over time, per-course performance

6. **calendar.html — Calendar View**
   - Monthly grid with colored dots (course-specific)
   - Click day → see all assignments due that day
   - Export to ICS button

7. **settings.html — User Preferences**
   - Notification settings (Discord, Chrome, SMS, email)
   - Display preferences (theme, colors, sort order)
   - Privacy (enable parent dashboard)
   - Data export (download JSON, clear data)

### Priority System

**Calculation:**
- 🔴 **URGENT** (priority=2): Overdue or due in <6 hours
- 🟠 **HIGH** (priority=1): Due in <24 hours or worth >50 points
- 🟢 **NORMAL** (priority=0): Everything else

### Notification Scheduler

Runs every 15 minutes, sends:
- **7 days before** — Gentle heads-up
- **3 days before** — Reminder
- **1 day before** — Important
- **6 hours before** — Urgent
- **2 hours before** — Critical
- **Overdue** — If not submitted

### Discord Message Format (ASD-Optimized)

```markdown
🔔 **Assignment Due Soon**

**Course:** REL-100
**Assignment:** Module 6 Quiz
**Due:** Thursday, March 27 @ 12:00 AM (EDT)
**Time Remaining:** 2 days, 3 hours

**What to do:**
1. Review notes from Module 6
2. Practice quiz questions
3. Submit before midnight Thursday

[View in RangeKeeper](https://ejcacciatore.github.io/rangekeeper/)
```

## Development Workflow

### Working with Database

```bash
# Run manual import (if data exists in import-manual.js)
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
node import-manual.js

# Query database
node -e "
const sqlite = require('better-sqlite3');
const db = new sqlite('data/rangekeeper.db');
const courses = db.prepare('SELECT * FROM courses').all();
console.log(JSON.stringify(courses, null, 2));
db.close();
"

# Export to JSON for dashboard
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
console.log('Exported to data/latest.json');
"
```

### Deploying to GitHub Pages

```bash
# After creating/updating HTML files
cd /home/ubuntu/.openclaw/workspace/rangekeeper
git add *.html assets/ data/
git commit -m "Update dashboard: [describe changes]"
git push origin master

# GitHub Pages auto-deploys in ~30 seconds
# Live at: https://ejcacciatore.github.io/rangekeeper/
```

### Starting Backend Locally

```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
npm install
npm start  # Runs on http://localhost:3000
```

## Common Tasks

### Task 1: Generate HTML Dashboard from Database

```javascript
// scripts/generate-dashboard.js
const sqlite = require('better-sqlite3');
const fs = require('fs');

const db = new sqlite('backend/data/rangekeeper.db');

// Fetch data
const courses = db.prepare('SELECT * FROM courses').all();
const assignments = db.prepare('SELECT * FROM assignments ORDER BY due_date').all();
const grades = db.prepare('SELECT * FROM grades').all();

// Generate index.html (today's focus)
const dueToday = assignments.filter(a => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + (24 * 60 * 60 * 1000);
  return a.due_date >= startOfDay && a.due_date < endOfDay && !a.submitted;
});

const html = `<!DOCTYPE html>
<html>
<head><title>RangeKeeper — Today's Focus</title></head>
<body>
  <h1>Good morning, Massimo!</h1>
  <p>You have ${dueToday.length} assignments due today.</p>
  <ul>
    ${dueToday.map(a => `<li>${a.title} — Due ${new Date(a.due_date).toLocaleString()}</li>`).join('')}
  </ul>
</body>
</html>`;

fs.writeFileSync('index.html', html);
console.log('Generated index.html');

db.close();
```

### Task 2: Add New Assignment to Database

```javascript
const sqlite = require('better-sqlite3');
const db = new sqlite('backend/data/rangekeeper.db');

const assignment = {
  id: `manual_${Date.now()}`,
  course_id: '_401764_1',
  title: 'Final Exam',
  due_date: new Date('2026-05-01T12:00:00').getTime(),
  points: 100,
  submitted: 0,
  status: 'upcoming',
  priority: 0
};

db.prepare(`
  INSERT INTO assignments (id, course_id, title, due_date, points, submitted, status, priority, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  assignment.id,
  assignment.course_id,
  assignment.title,
  assignment.due_date,
  assignment.points,
  assignment.submitted,
  assignment.status,
  assignment.priority,
  Date.now(),
  Date.now()
);

console.log('Added assignment:', assignment.title);
db.close();
```

### Task 3: Export to ICS Calendar

```javascript
function generateICS(assignments) {
  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RangeKeeper//EN
CALNAME:RangeKeeper Assignments
X-WR-CALNAME:RangeKeeper Assignments
`;

  assignments.forEach(a => {
    const dueDate = new Date(a.due_date);
    const dtstart = dueDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    ics += `BEGIN:VEVENT
UID:${a.id}@rangekeeper.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${dtstart}
SUMMARY:${a.title}
DESCRIPTION:Course: ${a.course_id}\\nPoints: ${a.points || 'N/A'}
STATUS:CONFIRMED
END:VEVENT
`;
  });

  ics += 'END:VCALENDAR';
  return ics;
}

// Usage
const icsContent = generateICS(assignments);
fs.writeFileSync('rangekeeper-calendar.ics', icsContent);
```

## Design Guidelines

### Color System
- **Primary:** Alabama Crimson (#9E1B32)
- **Secondary:** White (#FFFFFF)
- **Status Colors:**
  - 🟢 Green (#10b981): Completed, >3 days away
  - 🔵 Blue (#3b82f6): Upcoming (1-3 days)
  - 🟠 Orange (#f59e0b): Due soon (<1 day)
  - 🔴 Red (#dc2626): Overdue, urgent

### Responsive Breakpoints
- **Mobile:** < 640px (single column)
- **Tablet:** 640px - 1024px (2 columns)
- **Desktop:** > 1024px (3-4 columns)

### Accessibility
- WCAG 2.1 AA compliant
- High contrast mode
- Keyboard navigation
- Screen reader friendly (aria labels)

## Business Context

### Target Market
- **Primary:** ASD/ADHD college students (70K-140K in US)
- **Secondary:** All students needing executive function support (1-2M)
- **Institutional:** Universities (accessibility/retention tool)

### Revenue Models
1. **B2C SaaS:** $5-15/month per student
2. **Freemium:** Free basic, $10/month for parent dashboard + AI features
3. **B2B Institutional:** $5-10 per student/year (bulk licensing)

### Competitive Advantage
- **True LMS integration** (scrapes Blackboard directly)
- **ASD-specific design** (clear, consistent, predictable)
- **Multi-channel notifications** (Discord, SMS, Chrome, email)
- **Parent/supporter dashboard** (FERPA-compliant, student-consented)

### Go-to-Market Strategy
1. **Month 1:** Build for Massimo (validate it works)
2. **Month 2:** Word of mouth (his friends try it)
3. **Month 3:** Approach UA Disability Services with pilot (50-100 students)
4. **Month 6:** Scale to 2-3 other universities
5. **Year 1:** Raise seed funding or bootstrap to $100K ARR

## Constraints & Guidelines

### Never Do
- ❌ Violate FERPA (student privacy law)
- ❌ Scrape login credentials (only scrape after student logs in)
- ❌ Store sensitive data unencrypted
- ❌ Send notifications between 11 PM - 8 AM (unless urgent)
- ❌ Make UI changes that break accessibility
- ❌ Use jargon in notifications (keep language simple, direct)

### Always Do
- ✅ Test on real Blackboard instance (UA's ualearn.blackboard.com)
- ✅ Commit to GitHub after every feature
- ✅ Update ARCHITECTURE.md when making structural changes
- ✅ Log scraping activity for debugging (`console.log('[RangeKeeper] ...')`)
- ✅ Handle offline mode gracefully (IndexedDB persists data)
- ✅ Use ASD-friendly language (clear, concrete, numbered steps)

## Troubleshooting

### Extension Not Scraping
1. Check console for `[RangeKeeper]` logs
2. Verify page type detection (`detectPageType()` in content.js)
3. Inspect DOM selectors (Blackboard changes class names frequently)
4. Reload extension (`chrome://extensions/` → reload button)

### Backend Not Syncing
1. Check if backend is running (`curl http://localhost:3000/health`)
2. Verify CORS headers (extension can POST to backend)
3. Check network tab for failed requests
4. Inspect backend logs (`npm start` shows requests)

### GitHub Pages Not Updating
1. Verify files are at repo root (not inside subdirectory)
2. Check GitHub Actions tab for deployment status
3. Wait 1-2 minutes after push (auto-deploy takes time)
4. Hard refresh browser (Ctrl+Shift+R) to clear cache

## Success Criteria

### For Massimo (Personal Use)
- ✅ Extension scrapes all his courses, assignments, grades
- ✅ Dashboard shows today's due items
- ✅ Notifications arrive 24h and 2h before deadlines
- ✅ He can check status on his phone (mobile-responsive)
- ✅ No assignments missed after using RangeKeeper for 1 month

### For Product Launch
- 📊 100 students using extension (organic growth)
- 📊 80% of users still active after 30 days (retention)
- 📊 50% reduction in missed assignments (vs. before RangeKeeper)
- 📊 1 university pilot signed (UA Disability Services or similar)
- 💰 $1K MRR from paid tier (parent dashboards)

## Related Documentation

- **RANGEKEEPER_ARCHITECTURE.md** — Full technical architecture
- **RANGEKEEPER_SESSION.md** — Session-specific context (conversation history)
- **STATUS.md** — Project status, blockers, next steps
- **README.md** — Public-facing project description
- **MASSIMO_GUIDE.md** — Student installation guide

## Contact & Ownership

**Owner:** Rico Cacciatore (ejcacciatore@gmail.com)  
**Primary User:** Massimo (Rico's son, UA student)  
**AI Developer:** Claw  
**Repository:** https://github.com/ejcacciatore/rangekeeper  
**Live Site:** https://ejcacciatore.github.io/rangekeeper/

---

**Last Updated:** March 30, 2026  
**Skill Version:** 1.0  
**Next Review:** April 15, 2026
