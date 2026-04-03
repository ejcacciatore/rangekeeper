# RANGEKEEPER ARCHITECTURE
**Browser Extension + PWA + Notification System**  
Day 1 Implementation Plan

---

## SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                         STUDENT'S BROWSER                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         ualearn.blackboard.com (student logged in)         │ │
│  └───────────────────┬────────────────────────────────────────┘ │
│                      │                                           │
│  ┌───────────────────▼────────────────────────────────────────┐ │
│  │           RANGEKEEPER CHROME EXTENSION                     │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │ │
│  │  │Content Script│  │Background    │  │Extension Popup   │ │ │
│  │  │(DOM scraper) │─▶│Service Worker│─▶│Dashboard UI      │ │ │
│  │  └──────────────┘  └──────┬───────┘  └──────────────────┘ │ │
│  └────────────────────────────┼────────────────────────────────┘ │
│                               │                                  │
│  ┌────────────────────────────▼────────────────────────────────┐ │
│  │              IndexedDB (Local Storage)                      │ │
│  │  - Courses, Assignments, Due Dates, Grades, Announcements  │ │
│  └────────────────────────────┬────────────────────────────────┘ │
└────────────────────────────────┼──────────────────────────────────┘
                                 │
                 ┌───────────────▼────────────────┐
                 │   RANGEKEEPER BACKEND (Node.js) │
                 │  ┌──────────────────────────────┤
                 │  │ ICS Feed Poller (30min)      │
                 │  │ Email Parser (Graph API)     │
                 │  │ Notification Scheduler        │
                 │  │ PWA Push Service (VAPID)     │
                 │  │ Discord Bot                  │
                 │  └──────────────────────────────┤
                 │         SQLite Database          │
                 └───────────────┬──────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    ┌─────▼─────┐          ┌────▼─────┐         ┌─────▼──────┐
    │PWA Service│          │Discord   │         │Email Inbox │
    │Worker     │          │Server    │         │(M365 Graph)│
    │(Web Push) │          │(via Bot) │         │            │
    └───────────┘          └──────────┘         └────────────┘
```

---

## COMPONENT BREAKDOWN

### 1. CHROME EXTENSION (Client-Side)

#### **Content Script** (`content.js`)
- **Runs on:** `ualearn.blackboard.com/*`
- **Purpose:** Scrape DOM for course data when student browses Blackboard
- **What it extracts:**
  - Course list from dashboard (`/ultra/course`)
  - Assignment details from course content pages
  - Due dates from calendar view (`/ultra/calendar`)
  - Grades from gradebook (`/ultra/grades`)
  - Announcements from feed
- **Tech:** Vanilla JS, MutationObserver for dynamic content
- **Data flow:** Extract → Validate → Send to background script via `chrome.runtime.sendMessage()`

#### **Background Service Worker** (`background.js`)
- **Purpose:** Centralized data handler, API bridge, notification logic
- **Responsibilities:**
  - Receive data from content script
  - Store in IndexedDB
  - Sync with backend API (POST /api/sync)
  - Trigger notifications based on due date proximity
  - Handle extension popup requests
- **Tech:** Chrome Extension Service Worker API, IndexedDB

#### **Extension Popup** (`popup.html` + `popup.js`)
- **Purpose:** Quick dashboard overlay when student clicks extension icon
- **Features:**
  - Today's schedule
  - Upcoming assignments (next 7 days)
  - Grade summary by course
  - Quick links to Blackboard pages
- **Tech:** HTML/CSS/JS, reads from IndexedDB

#### **IndexedDB Schema**
```javascript
// Stores
courses: {
  id: string,           // Blackboard course ID
  name: string,
  term: string,
  instructorName: string,
  lastSynced: timestamp
}

assignments: {
  id: string,           // Blackboard assignment ID
  courseId: string,
  title: string,
  dueDate: timestamp,
  points: number,
  description: string,
  submitted: boolean,
  grade: number | null,
  lastSynced: timestamp
}

grades: {
  courseId: string,
  assignmentId: string,
  score: number,
  maxScore: number,
  percentage: number,
  gradePostedDate: timestamp
}

announcements: {
  id: string,
  courseId: string,
  title: string,
  body: string,
  postedDate: timestamp
}
```

---

### 2. BACKEND (Node.js + Express)

#### **API Routes**

**POST /api/sync**
- Accepts data from extension
- Merges with existing DB records
- Returns updated assignments + notifications to send

**GET /api/assignments**
- Returns assignments for a date range
- Used by PWA and Discord bot

**GET /api/calendar**
- Returns calendar view (combines Blackboard + ICS + M365)

**POST /api/ics/add**
- Student submits ICS feed URL (if available from Blackboard)
- Backend polls every 30 minutes

**POST /api/notifications/send**
- Trigger push notification
- Called by scheduled jobs

#### **Background Jobs (cron)**

**ICS Feed Poller** (every 30 min)
```javascript
// Fetch ICS URL, parse with ical.js, update DB
cron.schedule('*/30 * * * *', async () => {
  const icsUrl = await getStudentICSUrl();
  const events = await parseICS(icsUrl);
  await syncICSEvents(events);
});
```

**Email Parser** (every 15 min)
```javascript
// If M365 Graph API access exists, check inbox for Blackboard emails
cron.schedule('*/15 * * * *', async () => {
  const messages = await fetchM365Inbox({ filter: "from:noreply@blackboard.com" });
  const updates = parseBlackboardEmails(messages);
  await syncEmailUpdates(updates);
});
```

**Notification Scheduler** (every 5 min)
```javascript
// Check for assignments due soon, send graduated reminders
cron.schedule('*/5 * * * *', async () => {
  const upcoming = await getUpcomingAssignments();
  const notifications = generateNotifications(upcoming);
  await sendNotifications(notifications); // PWA push + Discord
});
```

#### **Database (SQLite for MVP)**
- Same schema as IndexedDB
- Backend is the source of truth
- Extension syncs local IndexedDB with backend

---

### 3. NOTIFICATION SYSTEM

#### **PWA Web Push** (Free, immediate)
- Service worker registered in PWA
- VAPID keys generated server-side
- `web-push` npm library sends notifications
- **Delivery:** Desktop (all browsers), Android Chrome, iOS Safari 16.4+ (requires add to home screen)

#### **Discord Bot** (Free, rich formatting)
```javascript
// discord.js client
client.on('ready', () => console.log('RangeKeeper bot online'));

// Daily summary at 8 AM
cron.schedule('0 8 * * *', async () => {
  const assignments = await getTodayAssignments();
  const embed = buildDailySummaryEmbed(assignments);
  await userDM.send({ embeds: [embed] });
});

// Urgent alerts (< 2 hours to deadline)
async function sendUrgentAlert(assignment) {
  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('🚨 URGENT: Assignment Due Soon!')
    .setDescription(`${assignment.title} is due in ${assignment.timeRemaining}`)
    .addFields({ name: 'Course', value: assignment.courseName });
  await userDM.send({ embeds: [embed] });
}
```

#### **Graduated Notification Logic**
```javascript
// Assignment due in 7 days → Gentle reminder (Discord embed, low priority)
// Assignment due in 3 days → Moderate reminder (PWA push + Discord)
// Assignment due in 1 day → Firm reminder (PWA push + Discord, higher priority)
// Assignment due in 2 hours → URGENT (PWA push + Discord + optional SMS)
// Assignment overdue → Daily nag until submitted
```

---

### 4. PWA (OPTIONAL WEEK 2)

#### **Purpose**
- Student can check RangeKeeper dashboard from any device
- Works offline (service worker caches data)
- Can receive push notifications

#### **Tech Stack**
- **Frontend:** React or vanilla JS (keep it lightweight)
- **Service Worker:** Cache-first strategy for offline access
- **Manifest:** Icons, name, theme color
- **Push API:** Subscribe to notifications via VAPID

#### **Features**
- Calendar view (week/month)
- Assignment list (sortable by due date, course, priority)
- Grade tracker
- Settings (notification preferences, Discord webhook, ICS URL input)

---

## DATA FLOW EXAMPLE: "Student Opens Blackboard"

1. Student navigates to `ualearn.blackboard.com/ultra/course`
2. Content script detects page load, waits for DOM to stabilize (MutationObserver)
3. Extracts course list: `[{ id: "_12345_1", name: "HIST 101", ... }, ...]`
4. Sends to background script: `chrome.runtime.sendMessage({ type: 'COURSES_UPDATE', data: courses })`
5. Background script:
   - Stores in IndexedDB
   - POSTs to backend `/api/sync` with new data
   - Backend merges, returns any new assignments or notifications
6. Background script receives response, updates IndexedDB with new assignments
7. If any assignment is due within 24 hours, background script triggers notification logic
8. Backend sends Discord message: "You have 2 assignments due tomorrow"
9. PWA service worker sends push notification to student's phone

---

## SECURITY & PRIVACY

### **Data Storage**
- **Client (IndexedDB):** Encrypted at rest by Chrome (user's profile is protected by OS login)
- **Server (SQLite):** Database file encrypted with SQLite Encryption Extension (SEE) or `sqlcipher`
- **In-transit:** All API calls over HTTPS, extension only talks to backend via TLS

### **Authentication**
- **Extension ↔ Backend:** Student authenticates once via a unique token (generated on first install)
- **Backend ↔ M365/Blackboard:** OAuth 2.0 tokens stored server-side, encrypted, auto-refreshed

### **FERPA Compliance**
- Student is the data controller
- No data shared with third parties
- Parent/supporter access requires explicit student consent (feature toggle in settings)
- Data retention: configurable (default 90 days rolling window)

---

## TECH STACK SUMMARY

| Component | Technology |
|-----------|-----------|
| Extension | Manifest V3, Vanilla JS, IndexedDB |
| Backend | Node.js, Express, SQLite (or Postgres later) |
| Discord Bot | discord.js |
| PWA | React (or vanilla), Service Worker, Web Push API |
| ICS Parsing | ical.js |
| M365 Integration | @microsoft/microsoft-graph-client |
| Notifications | web-push, discord.js, twilio (optional) |
| Hosting (MVP) | DigitalOcean Droplet ($6/month) or Railway/Render free tier |

---

## MVP SCOPE (WEEK 1-2)

**Must-have:**
- ✅ Chrome extension scrapes Blackboard courses, assignments, due dates
- ✅ Background script stores in IndexedDB
- ✅ Extension popup shows today's assignments
- ✅ Backend API receives sync data
- ✅ Discord bot sends daily summary

**Nice-to-have (Week 2):**
- ICS feed polling (if UA provides it)
- PWA with push notifications
- Email parsing for real-time updates

**Deferred to Phase 2:**
- M365 Graph API integration
- Blackboard 3LO OAuth
- Grade-aware prioritization
- AI task breakdown
- Parent dashboard

---

**Next step:** Build the Chrome extension skeleton (manifest, content script, background script, popup). Want me to scaffold that now?
