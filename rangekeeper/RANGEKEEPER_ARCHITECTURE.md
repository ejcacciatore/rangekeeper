# 🎯 RangeKeeper — Complete Architecture Document

**Version:** 2.0 (Advanced Student Dashboard)  
**Date:** March 30, 2026  
**Status:** Production Enhancement Plan

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Data Model](#data-model)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Chrome Extension](#chrome-extension)
7. [GitHub Pages Dashboard](#github-pages-dashboard)
8. [Feature Specifications](#feature-specifications)
9. [Deployment Strategy](#deployment-strategy)
10. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**RangeKeeper** is an academic assignment tracker for neurodivergent college students. It scrapes Blackboard Learn data, provides proactive reminders, and delivers an intuitive dashboard for managing coursework.

**Core Value Proposition:**
- **Executive function support** for ASD/ADHD students
- **Proactive notifications** (Discord, SMS, Chrome, email)
- **Parent/supporter dashboard** (FERPA-compliant, student-consented)
- **AI-powered task breakdown** (future)

**Current State:**
- ✅ Chrome extension scraping Blackboard (courses, assignments, grades)
- ✅ SQLite backend with 10 tables
- ✅ Basic HTML report deployed to GitHub Pages
- ⚠️ Dashboard needs major upgrade (course-by-course view, priority sorting, today's focus)

**Next Phase Goals:**
1. Advanced multi-page dashboard (course detail views, priority system, daily agenda)
2. Live data updates (refresh from backend or IndexedDB)
3. Responsive mobile design
4. Export to calendar (ICS)
5. Parent/supporter view (optional)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Student (Chrome)  │  Parent (Web)  │  Notifications (Discord)  │
└──────────┬──────────┴────────┬───────┴──────────┬───────────────┘
           │                   │                  │
           ▼                   ▼                  ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Chrome Extension│  │ GitHub Pages Web │  │ Discord Bot      │
│ (Data Scraper)  │  │ Dashboard (HTML) │  │ (Notifications)  │
└────────┬────────┘  └─────────┬────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Backend API       │
                    │   (Node.js/Express) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   SQLite Database   │
                    │   (10 Tables)       │
                    └─────────────────────┘
```

### Components

| Component | Technology | Purpose | Status |
|-----------|-----------|---------|--------|
| **Chrome Extension** | Vanilla JS, IndexedDB | Scrapes Blackboard, stores locally | ✅ Built |
| **Backend API** | Node.js, Express, SQLite | Syncs data, schedules notifications | ✅ Built |
| **GitHub Pages Dashboard** | Static HTML/CSS/JS | Student-facing web UI | ⚠️ Needs upgrade |
| **Discord Bot** | discord.js | Sends reminders, alerts | ✅ Built |
| **Notification Scheduler** | node-cron | Checks deadlines every 15 min | ✅ Built |
| **Parent Dashboard** | React (future) | Read-only view for supporters | 🔜 Planned |

---

## Data Model

### Database Schema (SQLite)

#### 1. **courses**
```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,              -- Blackboard course ID (e.g., "_401764_1")
  name TEXT NOT NULL,               -- Course code (e.g., "202610-REL-100-919")
  title TEXT,                       -- Full course name (e.g., "Introduction to Religion")
  term TEXT,                        -- Semester (e.g., "Spring 2026")
  instructor_name TEXT,             -- Professor name
  instructor_email TEXT,
  url TEXT,                         -- Blackboard course URL
  color TEXT,                       -- UI theme color
  last_synced INTEGER,              -- Timestamp
  created_at INTEGER,
  updated_at INTEGER
);
```

#### 2. **assignments**
```sql
CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  course_id TEXT,                   -- Foreign key to courses.id
  title TEXT NOT NULL,
  description TEXT,
  due_date INTEGER,                 -- Unix timestamp
  points REAL,                      -- Max points possible
  submitted INTEGER DEFAULT 0,      -- Boolean (0 or 1)
  grade TEXT,                       -- Earned points or letter grade
  status TEXT,                      -- "upcoming", "due_soon", "overdue", "completed"
  priority INTEGER DEFAULT 0,       -- 0=normal, 1=high, 2=urgent
  url TEXT,
  last_synced INTEGER,
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

#### 3. **grades**
```sql
CREATE TABLE grades (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  assignment_id TEXT,               -- Links to assignments.id
  assignment_name TEXT,
  score TEXT,                       -- "45/50", "92%", "A-"
  percentage REAL,                  -- Calculated percentage
  posted_date INTEGER,              -- When grade was posted
  grade_url TEXT,
  feedback TEXT,                    -- Instructor comments
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);
```

#### 4. **messages**
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  sender TEXT,
  subject TEXT,
  body TEXT,
  unread INTEGER DEFAULT 1,
  timestamp INTEGER,
  url TEXT,
  created_at INTEGER,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

#### 5. **notifications**
```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id TEXT,
  type TEXT,                        -- "7d", "3d", "1d", "6h", "2h", "overdue"
  sent_at INTEGER,
  channel TEXT,                     -- "discord", "chrome", "sms", "email"
  status TEXT,                      -- "sent", "failed", "pending"
  FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);
```

#### 6. **settings**
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  discord_user_id TEXT,
  notification_preferences TEXT,    -- JSON object
  timezone TEXT DEFAULT 'America/New_York',
  theme TEXT DEFAULT 'dark',
  parent_access_enabled INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);
```

#### 7. **announcements**
```sql
CREATE TABLE announcements (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  title TEXT,
  content TEXT,
  posted_date INTEGER,
  url TEXT,
  read INTEGER DEFAULT 0,
  created_at INTEGER,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

#### 8. **ics_feeds**
```sql
CREATE TABLE ics_feeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  last_polled INTEGER,
  created_at INTEGER
);
```

#### 9. **feedback**
```sql
CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  assignment_id TEXT,
  instructor_name TEXT,
  feedback_text TEXT,
  posted_date INTEGER,
  url TEXT,
  created_at INTEGER,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);
```

#### 10. **daily_snapshots** (new)
```sql
CREATE TABLE daily_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT UNIQUE,                 -- YYYY-MM-DD
  total_assignments INTEGER,
  due_today INTEGER,
  due_this_week INTEGER,
  overdue INTEGER,
  grade_average REAL,
  snapshot_json TEXT,               -- Full JSON backup
  created_at INTEGER
);
```

---

## Frontend Architecture

### GitHub Pages Dashboard (Advanced Multi-Page Design)

#### Page Structure

```
/rangekeeper/
├── index.html                    # Home / Today's Focus
├── courses.html                  # All Courses Grid
├── course-detail.html?id=XXX     # Single Course View
├── assignments.html              # All Assignments (sortable)
├── grades.html                   # Grade Book
├── calendar.html                 # Calendar View
├── settings.html                 # User Preferences
├── assets/
│   ├── css/
│   │   ├── main.css              # Global styles
│   │   ├── dashboard.css         # Dashboard-specific
│   │   └── mobile.css            # Responsive breakpoints
│   ├── js/
│   │   ├── data.js               # Data fetching/IndexedDB
│   │   ├── render.js             # UI rendering
│   │   ├── filters.js            # Sorting/filtering logic
│   │   └── calendar.js           # Calendar widget
│   └── icons/
│       └── course-colors/        # Course color swatches
└── data/
    └── latest.json               # Auto-generated data export
```

#### Key Features

**1. index.html — Today's Focus Dashboard**
- **Hero Section:** "Good morning, Massimo! You have 3 assignments due today."
- **Today's To-Do List:** Assignments due in next 24 hours (sorted by time remaining)
- **Upcoming This Week:** Next 7 days preview
- **Recent Grades:** Last 5 grades posted
- **Quick Stats:** Total courses, assignments pending, average grade
- **Priority Alerts:** Red/orange/yellow badges for urgency

**2. courses.html — All Courses Grid**
- **Card-based layout:** One card per course
- **Per-Course Stats:**
  - Pending assignments count
  - Average grade
  - Next due date
  - Unread messages count
- **Click → navigate to course-detail.html?id=XXX**

**3. course-detail.html — Single Course Deep Dive**
- **Header:** Course name, instructor, overall grade
- **Tabs:**
  - **Assignments:** List all assignments (upcoming, submitted, graded)
  - **Grades:** Grade breakdown with chart (pie/bar showing grade distribution)
  - **Messages:** Instructor/TA announcements
  - **Calendar:** Course-specific calendar view
- **Actions:** Export to ICS, email instructor (mailto link)

**4. assignments.html — Master Assignment List**
- **Filters:**
  - By course (dropdown)
  - By status (upcoming, submitted, graded, overdue)
  - By priority (all, high, urgent)
- **Sorting:**
  - Due date (ascending/descending)
  - Priority
  - Course
  - Points value
- **Search:** Text search by assignment name
- **Bulk Actions:** Mark multiple as submitted, export selected to calendar

**5. grades.html — Grade Book**
- **Summary Stats:**
  - Overall GPA
  - Per-course averages
  - Best/worst performing courses
- **Grade Table:**
  - Assignment name, course, score, percentage, date posted
  - Click to see feedback (if available)
- **Charts:**
  - Line chart: grades over time
  - Bar chart: per-course performance

**6. calendar.html — Calendar View**
- **Monthly calendar grid** (like Google Calendar)
- **Assignments displayed as colored dots** (course-specific colors)
- **Click day → see all assignments due that day**
- **Export to ICS button** (downloads .ics file for Apple Calendar, Google Calendar, Outlook)

**7. settings.html — User Preferences**
- **Notification Settings:**
  - Enable/disable Discord, Chrome, SMS, email
  - Customize reminder timing (7d, 3d, 1d, 6h, 2h)
- **Display Preferences:**
  - Theme (light/dark)
  - Course colors
  - Default sort order
- **Privacy:**
  - Enable parent dashboard (yes/no)
  - Parent email for access
- **Data Export:**
  - Download all data as JSON
  - Clear all data (reset)

---

### UI/UX Design Guidelines

**Color System:**
- **Primary:** Alabama Crimson (#9E1B32)
- **Secondary:** White (#FFFFFF)
- **Accent:** Gray (#A8A8A8)
- **Status Colors:**
  - 🟢 Green (#10b981): Completed, >3 days away
  - 🔵 Blue (#3b82f6): Upcoming (1-3 days)
  - 🟠 Orange (#f59e0b): Due soon (<1 day)
  - 🔴 Red (#dc2626): Overdue, urgent

**Typography:**
- **Headings:** Inter or SF Pro Display (system font)
- **Body:** -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Monospace (for dates/times):** 'Courier New', monospace

**Responsive Breakpoints:**
- **Mobile:** < 640px (single column)
- **Tablet:** 640px - 1024px (2 columns)
- **Desktop:** > 1024px (3-4 columns)

**Accessibility:**
- WCAG 2.1 AA compliant
- High contrast mode support
- Keyboard navigation (tab through all interactive elements)
- Screen reader friendly (aria labels)

---

## Backend Architecture

### API Endpoints

#### **Data Sync**
```
POST /api/sync
Body: { courses: [], assignments: [], grades: [], messages: [] }
Response: { status: "success", synced_at: 1234567890 }
```

#### **Get Data**
```
GET /api/courses
GET /api/courses/:id
GET /api/assignments
GET /api/assignments/:id
GET /api/grades
GET /api/grades/course/:courseId
```

#### **Dashboard Data Export** (for GitHub Pages)
```
GET /api/export/json
Response: Full dataset as JSON (for static site generation)
```

#### **Notifications**
```
GET /api/notifications/pending
POST /api/notifications/send
```

#### **Settings**
```
GET /api/settings
PUT /api/settings
```

### Notification Scheduler Logic

```javascript
// Runs every 15 minutes via node-cron
async function checkDeadlines() {
  const now = Date.now();
  const assignments = await db.getUpcomingAssignments();
  
  for (const assignment of assignments) {
    const hoursUntilDue = (assignment.due_date - now) / (1000 * 60 * 60);
    
    // 7 days before
    if (hoursUntilDue <= 168 && !notificationSent(assignment.id, '7d')) {
      await sendNotification(assignment, '7d', 'gentle');
    }
    
    // 3 days before
    if (hoursUntilDue <= 72 && !notificationSent(assignment.id, '3d')) {
      await sendNotification(assignment, '3d', 'reminder');
    }
    
    // 1 day before
    if (hoursUntilDue <= 24 && !notificationSent(assignment.id, '1d')) {
      await sendNotification(assignment, '1d', 'important');
    }
    
    // 6 hours before
    if (hoursUntilDue <= 6 && !notificationSent(assignment.id, '6h')) {
      await sendNotification(assignment, '6h', 'urgent');
    }
    
    // 2 hours before
    if (hoursUntilDue <= 2 && !notificationSent(assignment.id, '2h')) {
      await sendNotification(assignment, '2h', 'critical');
    }
    
    // Overdue
    if (hoursUntilDue < 0 && !assignment.submitted) {
      await sendNotification(assignment, 'overdue', 'overdue');
    }
  }
}
```

### Discord Notification Format (ASD-Optimized)

```markdown
🔔 **Assignment Due Soon**

**Course:** REL-100 (Introduction to Religion)
**Assignment:** Module 6 Quiz
**Due:** Thursday, March 27 @ 12:00 AM (EDT)
**Time Remaining:** 2 days, 3 hours

**What to do:**
1. Review notes from Module 6
2. Practice quiz questions (if available)
3. Submit quiz before midnight Thursday

**Need help?** Reply with "help" or DM your instructor.

[View in RangeKeeper](https://ejcacciatore.github.io/rangekeeper/course-detail.html?id=_401764_1)
```

---

## Chrome Extension

### Architecture

```
extension/
├── manifest.json
├── scripts/
│   ├── background.js         # Service worker (notifications, sync)
│   ├── content.js            # Main scraper + page detection
│   ├── utils.js              # Shared utilities
│   ├── grades-scraper.js     # Grades-specific scraping
│   └── messages-scraper.js   # Messages-specific scraping
├── popup/
│   ├── popup.html            # Extension popup UI
│   ├── popup.js
│   └── popup.css
└── icons/
    └── *.png
```

### Scraping Strategy

**Page Types Detected:**
- `activity-stream` — Activity feed (grades + assignments)
- `calendar` — Calendar view
- `deadline` — Deadline list
- `grades` — Grades page
- `messages` — Messages page
- `course-detail` — Individual course page

**Scraping Flow:**
1. **MutationObserver** watches for DOM changes (Blackboard is SPA)
2. **Detect page type** via URL + DOM selectors
3. **Extract data** using CSS selectors (course cards, assignment items, grade rows)
4. **Store in IndexedDB** (local browser storage)
5. **Sync to backend** via POST /api/sync (every 5 minutes or on navigation)

**Offline Mode:**
- IndexedDB persists data even when backend is unreachable
- Extension still shows data in popup
- Sync resumes when backend is back online

---

## GitHub Pages Dashboard

### Data Flow for Static Site

**Problem:** GitHub Pages serves static HTML — no server-side rendering

**Solution Options:**

#### **Option 1: Client-Side Data Fetching (Best for MVP)**
```javascript
// In assets/js/data.js
async function fetchData() {
  const response = await fetch('data/latest.json');
  const data = await response.json();
  return data;
}

// Regenerate latest.json via GitHub Actions or manual script
```

**Option 2: Backend API CORS-enabled**
```javascript
async function fetchData() {
  const response = await fetch('https://rangekeeper-backend.railway.app/api/export/json');
  const data = await response.json();
  return data;
}
```

**Option 3: IndexedDB Direct Access (Extension Only)**
```javascript
// Works only if user has extension installed
async function getLocalData() {
  const db = await openIndexedDB();
  const courses = await db.getAll('courses');
  const assignments = await db.getAll('assignments');
  return { courses, assignments };
}
```

### Auto-Update Strategy

**GitHub Actions Workflow** (runs daily at midnight):

```yaml
name: Update Dashboard Data

on:
  schedule:
    - cron: '0 0 * * *'  # Every day at midnight UTC
  workflow_dispatch:      # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Fetch latest data from backend
        run: |
          curl https://rangekeeper-backend.railway.app/api/export/json \
            -o data/latest.json
      
      - name: Regenerate HTML
        run: node scripts/generate-dashboard.js
      
      - name: Commit and push
        run: |
          git config user.name "RangeKeeper Bot"
          git config user.email "bot@rangekeeper.app"
          git add .
          git commit -m "Auto-update dashboard data"
          git push
```

---

## Feature Specifications

### Priority System

**How Priority is Calculated:**

```javascript
function calculatePriority(assignment) {
  const now = Date.now();
  const hoursUntilDue = (assignment.due_date - now) / (1000 * 60 * 60);
  
  // Overdue or <6 hours
  if (hoursUntilDue < 6 || assignment.due_date < now) {
    return 2; // URGENT
  }
  
  // <24 hours or high point value
  if (hoursUntilDue < 24 || assignment.points > 50) {
    return 1; // HIGH
  }
  
  // Normal
  return 0;
}
```

**Priority Badges:**
- 🔴 **URGENT** — Overdue or due in <6 hours
- 🟠 **HIGH** — Due in <24 hours or worth >50 points
- 🟢 **NORMAL** — Everything else

### "Due Today" Logic

```javascript
function getDueToday() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + (24 * 60 * 60 * 1000);
  
  return assignments.filter(a => 
    a.due_date >= startOfDay && 
    a.due_date < endOfDay &&
    !a.submitted
  );
}
```

### Course-by-Course Breakdown

**Example: course-detail.html?id=_401764_1**

```html
<!-- Header -->
<div class="course-header">
  <h1>REL-100-919 — Introduction to Religion</h1>
  <p>Instructor: Multiple Instructors</p>
  <p>Overall Grade: A- (92.3%)</p>
</div>

<!-- Stats Cards -->
<div class="stats-grid">
  <div class="stat-card">
    <h3>12</h3>
    <p>Total Assignments</p>
  </div>
  <div class="stat-card">
    <h3>3</h3>
    <p>Pending</p>
  </div>
  <div class="stat-card">
    <h3>9</h3>
    <p>Completed</p>
  </div>
  <div class="stat-card">
    <h3>Mar 27</h3>
    <p>Next Due</p>
  </div>
</div>

<!-- Tabs -->
<div class="tabs">
  <button class="active">Assignments</button>
  <button>Grades</button>
  <button>Messages</button>
</div>

<!-- Assignment List (filtered to this course) -->
<div class="assignment-list">
  <!-- ... -->
</div>
```

---

## Deployment Strategy

### Phase 1: Enhanced GitHub Pages Dashboard (This Week)

**Deliverables:**
1. Multi-page HTML dashboard (7 pages)
2. Client-side JS data fetching
3. Mobile-responsive CSS
4. Export to ICS button
5. Priority sorting + filters

**Timeline:** 2-3 days
**Effort:** 8-12 hours development

### Phase 2: Backend Data Export API (Next Week)

**Deliverables:**
1. `/api/export/json` endpoint
2. CORS headers for GitHub Pages access
3. GitHub Actions workflow for auto-updates
4. Daily snapshot generation

**Timeline:** 1-2 days
**Effort:** 4-6 hours

### Phase 3: Parent Dashboard (Month 2)

**Deliverables:**
1. React app (separate repo or /parent subdomain)
2. Read-only view of student data
3. Email digest (weekly summary)
4. Privacy controls (student can enable/disable)

**Timeline:** 1 week
**Effort:** 20-30 hours

### Phase 4: Mobile App (Month 3-4)

**Deliverables:**
1. React Native app (iOS + Android)
2. Push notifications
3. Offline mode (full feature parity with web)

**Timeline:** 2-3 weeks
**Effort:** 40-60 hours

---

## Future Roadmap

### Immediate (Next 30 Days)
- ✅ Advanced dashboard (course detail, priority, today's focus)
- ✅ Export to ICS calendar
- 🔜 Backend API JSON export
- 🔜 GitHub Actions auto-update

### Short-Term (60-90 Days)
- AI task breakdown (break large assignments into smaller steps)
- Parent dashboard (read-only view)
- Email digest (weekly summary)
- SMS notifications (Twilio integration)
- Multi-LMS support (Canvas, Moodle)

### Mid-Term (6 Months)
- Mobile app (iOS + Android)
- Study time estimation (ML-based)
- Grade prediction (based on past performance)
- Institutional sales (university licensing)

### Long-Term (1 Year)
- AI study assistant (ChatGPT integration for assignment help)
- Peer study groups (match students in same courses)
- Marketplace (tutors, study materials, note-sharing)
- API for third-party integrations

---

## Success Metrics

### Product Metrics
- **Activation:** % of users who scrape data within 24h of install
- **Engagement:** Daily active users (DAU) / Monthly active users (MAU)
- **Retention:** % of users still active after 30/60/90 days
- **Notification Effectiveness:** % of assignments submitted before deadline (with vs without RangeKeeper)

### Business Metrics
- **User Acquisition Cost (UAC):** Cost to acquire one paying user
- **Lifetime Value (LTV):** Revenue per user over lifetime
- **Conversion Rate:** Free → Paid tier
- **Institutional Pipeline:** # of universities in pilot/negotiation

### Impact Metrics (For Institutional Sales)
- **Assignment completion rate:** Before vs after RangeKeeper
- **Grade improvement:** Average GPA increase
- **Retention rate:** Student dropout reduction
- **Time to degree:** Reduction in credits failed/retaken

---

## Technology Stack Summary

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Extension** | Vanilla JS, IndexedDB | No build step, fast, native browser APIs |
| **Backend** | Node.js, Express, SQLite | Simple, fast, no complex setup, can scale to Postgres later |
| **Dashboard** | Static HTML/CSS/JS | GitHub Pages free hosting, fast CDN, no server costs |
| **Notifications** | Discord.js, Twilio (SMS), Nodemailer (email) | Multi-channel, reliable, ASD-friendly formatting |
| **Deployment** | Railway (backend), GitHub Pages (frontend) | Free tiers, auto-deploy on push, HTTPS |
| **Future Mobile** | React Native | Cross-platform (iOS + Android from one codebase) |

---

## File Structure (Complete)

```
rangekeeper/
├── RANGEKEEPER_ARCHITECTURE.md     # This document
├── SKILL.md                         # AgentSkill for AI assistant
├── README.md
├── STATUS.md
├── LICENSE
│
├── extension/                       # Chrome Extension
│   ├── manifest.json
│   ├── icons/
│   ├── scripts/
│   │   ├── background.js
│   │   ├── content.js
│   │   ├── utils.js
│   │   ├── grades-scraper.js
│   │   └── messages-scraper.js
│   └── popup/
│       ├── popup.html
│       ├── popup.js
│       └── popup.css
│
├── backend/                         # Node.js Backend
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   ├── routes/
│   │   │   ├── sync.js
│   │   │   ├── assignments.js
│   │   │   ├── courses.js
│   │   │   └── export.js
│   │   ├── scheduler.js
│   │   └── discord-bot.js
│   ├── data/
│   │   └── rangekeeper.db
│   ├── package.json
│   └── Dockerfile
│
├── dashboard/                       # GitHub Pages Dashboard
│   ├── index.html                   # Today's Focus
│   ├── courses.html                 # All Courses
│   ├── course-detail.html           # Single Course
│   ├── assignments.html             # All Assignments
│   ├── grades.html                  # Grade Book
│   ├── calendar.html                # Calendar View
│   ├── settings.html                # User Settings
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css
│   │   │   ├── dashboard.css
│   │   │   └── mobile.css
│   │   ├── js/
│   │   │   ├── data.js
│   │   │   ├── render.js
│   │   │   ├── filters.js
│   │   │   └── calendar.js
│   │   └── icons/
│   └── data/
│       └── latest.json              # Auto-generated
│
├── scripts/                         # Automation Scripts
│   ├── generate-dashboard.js       # Generate static HTML from DB
│   ├── export-to-json.js           # Export DB to JSON
│   └── import-manual.js            # Manual data import
│
└── .github/
    └── workflows/
        └── update-dashboard.yml     # GitHub Actions auto-update
```

---

## Questions & Decisions

### Open Questions
1. **Calendar Export Format:** ICS vs Google Calendar API vs both?
2. **Parent Access:** Email link vs separate login vs magic link?
3. **Pricing:** Free tier limits? Pro tier price point ($5, $10, $15)?
4. **Institutional Sales:** Per-student licensing or site license?

### Technical Decisions Made
- ✅ SQLite for MVP (can migrate to Postgres later)
- ✅ GitHub Pages for dashboard (free, fast, simple)
- ✅ Extension-first approach (easiest for students to install)
- ✅ Discord as primary notification channel (students already use it)

### Pending Decisions
- ⚠️ How to handle multi-LMS (Canvas, Moodle, D2L) in future?
- ⚠️ AI task breakdown: GPT-4 API or Anthropic Claude?
- ⚠️ Mobile app: Native (Swift/Kotlin) or React Native?
- ⚠️ Parent dashboard: Same codebase or separate React app?

---

**Last Updated:** March 30, 2026  
**Next Review:** April 15, 2026  
**Owner:** Rico Cacciatore  
**Contributors:** Claw (AI Developer)
