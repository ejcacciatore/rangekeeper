# RANGEKEEPER — COMPREHENSIVE RESEARCH REPORT
**Deep-Dive Technical & Strategic Evaluation**  
Date: March 19, 2026  
Target User: University of Alabama student (ASD), currently logged in as mmcacciatore  
UA Systems Confirmed: Blackboard Learn at ualearn.blackboard.com, M365/Outlook email, myBama student portal

---

## EXECUTIVE SUMMARY

**Fastest path to a working tool for your son:** A browser extension + PWA combo that scrapes Blackboard via authenticated session cookies, pulls calendar data from the Blackboard Calendar API (which supports student-level 3LO auth), parses UA email for assignment notifications, and delivers structured reminders via PWA push notifications or a Discord/Telegram bot. **This can be built today with zero UA cooperation.** The student simply logs into Blackboard normally, and the extension piggybacks on that session.

**What needs UA cooperation:** Formal REST API application registration (requires UA admin to install the App ID on ualearn.blackboard.com), LTI tool placement in courses, and institutional M365 admin consent for Graph API delegated permissions.

**What you can do right now without asking anyone:** ICS calendar feed export (if enabled), browser extension session scraping, Blackboard 3LO with student self-consent, M365 delegated permissions for Outlook/Calendar/To-Do that only need the student's own consent, email notification parsing, and PWA push notifications.

---

## MISSION 1: BLACKBOARD ULTRA REST API

### Authentication Architecture

Blackboard Learn (which UA uses) supports two OAuth 2.0 flows:

1. **Basic Authentication (2-Legged OAuth / Client Credentials):** The app gets registered on the Anthology Developer Portal, receives an Application ID/Key/Secret. The institution admin must then install that Application ID on their Learn server. The app POSTs to `/learn/api/public/v1/oauth2/token` with the key:secret as Basic auth header and `grant_type=client_credentials`. Returns a bearer token valid for 1 hour. This acts as a system-level user with broad access — overkill and requires UA admin involvement.

2. **Three-Legged OAuth (3LO) — THE KEY FINDING:** Available since Learn 3200.7. This lets a student authorize the app to act as themselves. The student sees their school's login page, authenticates, clicks "Allow," and the app gets a token scoped to that student's permissions. The flow supports `scope=read` (or read+write+offline). With `offline` scope, a refresh token is returned, meaning the app can keep fetching data without the student re-logging in. PKCE support was added in version 3700.4 for additional security with public clients (like a PWA or mobile app). **This is the proper path forward.**

### Available Endpoints (197 total, key student-relevant ones)

**Calendar** (available since 3400.9.0):
- `GET /learn/api/public/v1/calendars` — Lists all calendars viewable by the authenticated user
- `GET /learn/api/public/v1/calendars/items` — Returns all calendar items (assignments, due dates, events) for the user. Defaults to a 2-week window, max 16-week span. CalendarItems of type `GradebookColumn` represent assignments with due dates.
- `GET /learn/api/public/v1/calendars/items/{calendarItemType}/{calendarItemId}` — Individual calendar item detail

**Gradebook:**
- `GET /learn/api/public/v1/courses/{courseId}/gradebook/columns` — Lists all grade columns (assignments, tests, etc.)
- `GET /learn/api/public/v1/courses/{courseId}/gradebook/columns/{columnId}` — Individual column detail
- `GET /learn/api/public/v2/courses/{courseId}/gradebook/columns/{columnId}/users/{userId}` — Student's grade for a specific item
- `GET /learn/api/public/v2/courses/{courseId}/gradebook/users/{userId}` — All grades for a student in a course

**Course Content:**
- `GET /learn/api/public/v1/courses/{courseId}/contents` — List all content items
- `GET /learn/api/public/v1/courses/{courseId}/contents/{contentId}` — Individual content detail
- `GET /learn/api/public/v1/courses/{courseId}/contents/{contentId}/children` — Child items (nested modules)

**Enrollments/Memberships:**
- `GET /learn/api/public/v1/courses/{courseId}/users` — Course membership list
- `GET /learn/api/public/v1/users/{userId}/courses` — All courses a user is enrolled in

**Announcements:**
- `GET /learn/api/public/v1/announcements` — System announcements
- `GET /learn/api/public/v1/courses/{courseId}/announcements` — Course-specific announcements

### UA-Specific Integration Requirements

**Critical blocker for REST API:** Even with 3LO, the application must first be registered on the Anthology Developer Portal AND the institution admin must install the Application ID on ualearn.blackboard.com. Anthology's documentation explicitly states that developers should never ask clients to create App IDs themselves — the developer creates one App ID for their production REST application and asks the institution to install it.

**LTI Advantage:** The alternative for deep integration. LTI 1.3 allows an external tool to appear inside courses, access grades, and create assignments. But it also requires institutional approval — UA's LMS admin must register the LTI tool.

**Bottom line:** Any official API integration requires UA IT cooperation. This is a medium-term path, not a Day 1 solution.

---

## MISSION 2: MICROSOFT GRAPH API (M365)

### Confirmed: UA Uses M365

The myBama portal shows "UA Email Access" pointing to outlook.com, confirming Microsoft 365 for student email and calendar.

### Permission Matrix for Student Self-Consent

Microsoft Graph uses **delegated permissions** (user consents on their own behalf) vs. **application permissions** (admin consents for the whole org). For a student tool, delegated permissions are the path:

**Outlook Mail:**
- `Mail.Read` (delegated) — Read user's mail. **Requires user consent only. No admin needed.**
- `Mail.ReadWrite` (delegated) — Read/write mail. User consent only.

**Calendar:**
- `Calendars.Read` (delegated) — Read user's calendars. **User consent only. No admin needed.**
- `Calendars.ReadWrite` (delegated) — Read/write calendars. User consent only.

**To Do:**
- `Tasks.Read` (delegated) — Read user's tasks. **User consent only. No admin needed.**
- `Tasks.ReadWrite` (delegated) — Read/write tasks. User consent only.

**OneDrive:**
- `Files.Read` (delegated) — Read user's files. User consent only.
- `Files.ReadWrite` (delegated) — Read/write files. User consent only.

### The Admin Consent Catch

**HOWEVER:** UA's M365 tenant may be configured to restrict user self-consent for third-party applications. Many universities set *"Users can consent to apps accessing company data on their behalf"* = **No** in their Azure AD tenant settings. If UA has this restriction, even delegated permissions need an admin to approve the app first.

**Workaround if admin consent is blocked:**
1. The app can register in Azure AD as a multi-tenant app
2. The student authenticates via standard OAuth 2.0 with PKCE
3. If self-consent is blocked, the student gets an error saying "Need admin approval"
4. At that point, we'd need to request UA IT add the app to their approved list

### Fallbacks (No Permission Needed)

- **IMAP Access:** If UA allows IMAP on their M365 tenant (check Settings → Mail → Sync email), the student can configure an app password and read email via IMAP. This is increasingly restricted by Microsoft though.
- **ICS Calendar Feeds:** Outlook allows exporting calendars as ICS URL subscriptions. The student can go to Outlook → Calendar → Settings → Shared calendars → Publish a calendar to get an ICS URL. This URL can be polled periodically. **Zero permissions needed, works today.**
- **Microsoft To Do API via personal account:** If the student uses To Do with a personal Microsoft account (separate from their UA account), the personal Graph API has more permissive consent.

---

## MISSION 3: SMS / PUSH NOTIFICATION DELIVERY

### Ranked by Speed-to-Implement and Student Engagement

#### 1. PWA Web Push Notifications — **RECOMMENDED FOR DAY 1**
- **Cost:** Free (uses Web Push API + VAPID keys)
- **Setup time:** 2-4 hours
- **How:** The RangeKeeper PWA requests notification permission. Uses a service worker to receive push events. Server sends push via `web-push` npm library.
- **Pros:** Zero cost, works on desktop and Android Chrome, no phone number needed, immediate delivery
- **Cons:** iOS Safari support for web push was added in iOS 16.4+ but requires adding to Home Screen. If your son uses iPhone, this may require that extra step.
- **Best for:** Rapid prototype, zero friction

#### 2. Discord Bot
- **Cost:** Free
- **Setup time:** 3-5 hours
- **How:** Create a Discord server, invite your son, build a bot with `discord.js` that sends DMs with assignment reminders, due dates, daily schedules
- **Pros:** Free, your son may already use Discord, supports rich embeds (color-coded by urgency), can have interactive buttons
- **Cons:** Requires Discord account, notifications depend on Discord app settings
- **Best for:** If your son already uses Discord daily

#### 3. Telegram Bot
- **Cost:** Free
- **Setup time:** 2-3 hours
- **How:** Create bot via @BotFather, user starts a chat with the bot, bot sends messages via HTTP API
- **Pros:** Free, simple API, reliable delivery, supports formatted messages
- **Cons:** Requires Telegram account
- **Best for:** Simple, reliable, no-frills notifications

#### 4. Twilio SMS
- **Cost:** ~$0.0083/msg outbound + carrier fees (~$0.003-0.005/msg) + $1.15/month for a long code number. Total ~$0.012 per message. At 10 reminders/day = ~$3.60/month.
- **Setup time:** 1-2 hours
- **How:** Sign up for Twilio, provision a number, send SMS via API
- **Pros:** Universal delivery (works on any phone), no app needed, highest open rates
- **Cons:** Ongoing cost, A2P 10DLC registration required for US messaging, carrier fees add up
- **Best for:** Critical "can't-miss" alerts only — supplement with free channels for routine stuff

#### 5. WhatsApp Business API (via Twilio)
- **Cost:** Similar to SMS + WhatsApp conversation fees
- **Setup time:** More complex setup, business verification needed
- **Cons:** Overkill for single-user, complex onboarding
- **Skip for now**

#### 6. M365 Notifications (Graph API)
- Can send emails to the student's UA inbox as reminders
- **Cost:** Free if Graph API access is obtained
- Nice supplement but email isn't the best channel for urgent reminders

### Recommendation
Start with **PWA push + Discord bot** (both free). Add Twilio SMS only for critical deadline alerts if push notifications aren't getting through. **Budget: $0-5/month.**

---

## MISSION 4: COMPETITIVE LANDSCAPE

### Competitor Map

| Tool | Pricing | LMS Integration | ASD-Specific | Key Features | Gap |
|------|---------|----------------|--------------|--------------|-----|
| **Tiimo** | Free tier + Pro subscription (yearly). iOS + Web only. No Android as of Sept 2025 | Calendar import only (Apple/Google/Outlook ICS). No LMS integration | Built by/for neurodivergent. ADHD & Autism focused. Executive functioning research-based | Visual planner, focus timer, to-do lists, gentle reminders, AI task breakdown (Pro), custom widgets | No Blackboard integration, no grade tracking, no syllabus parsing, no smart deadline prioritization based on actual course data |
| **Goblin Tools** | Free web tools | None | Neurodivergent-focused. Task breakdown, tone analysis | Magic To-Do (breaks tasks into subtasks), Formalizer, Judge, Estimator, Compiler | No scheduling, no calendar, no LMS integration, no notifications. Just standalone utilities. Website appears to be down currently. |
| **Shovel** | $19.99/mo or $35/yr (with trial) | "Sync your school platform" + PDF syllabus upload | Not specifically | "Cushion" feature predicts time crunches, turns due dates into do dates, time estimation | Claims LMS sync but unclear depth. No ASD-specific accommodations. Expensive monthly. No sensory/executive function support. |
| **MyStudyLife** | Free tier + premium | Manual entry or ICS import | Not specifically | Task management, schedule planning, exam tracking, cross-platform | No auto-sync with Blackboard, no AI features, no neurodivergent-specific design, no parent visibility |
| **Notion/Todoist** | Freemium | Manual or Zapier | None | Flexible task management | Requires manual setup, no LMS awareness, no ASD accommodations |

### Where RangeKeeper Wins — Gap Analysis

No competitor does **ALL** of these:

1. **Direct Blackboard data ingestion** — Pulling assignments, grades, due dates, and course content automatically from Blackboard Learn, not just calendar ICS
2. **ASD-specific executive function scaffolding** — Breaking down multi-step assignments into concrete, timed subtasks with sensory-friendly UI
3. **Proactive deadline management** — "You have 3 assignments due within 48 hours, here's a suggested work plan" with time estimation
4. **Multi-channel smart notifications** — Not just a reminder that something is due, but graduated urgency (gentle nudge → firm reminder → urgent alert) across the student's preferred channels
5. **Grade-aware prioritization** — Knowing which assignments are worth more and how the student is performing in each class to prioritize effort
6. **Parent/support visibility layer** — Optional dashboard so a parent or academic coach can see if the student is falling behind without accessing the student's actual LMS account (FERPA-compliant because the student consents)
7. **Transition support** — Helping manage the executive function demands of college that go beyond just "assignments" — meal planning, laundry schedules, social commitments, medication reminders

**RangeKeeper's unique position:** It's the only tool that combines **LMS-aware intelligence** with **neurodivergent-specific design** AND **proactive notification management**. Every competitor is either a generic planner (Shovel, MyStudyLife) or a neurodivergent tool without LMS awareness (Tiimo, Goblin Tools).

---

## MISSION 5: BLACKBOARD SCRAPING / AUTOMATION FALLBACK — THE DAY 1 PLAN

This is the **"works today, no permissions needed"** approach.

### Tier 1: Browser Extension (Highest Value, Lowest Friction)

**How it works:** A Chrome/Firefox extension runs on `ualearn.blackboard.com` when the student is logged in. It reads the DOM, extracts course data, assignments, due dates, and grades. The student's existing authenticated session cookies provide access — **no API registration needed**.

**What to scrape:**
- Course list from the dashboard
- Calendar items from the Blackboard calendar view
- Assignment details from each course's content area
- Grades from the gradebook
- Announcements from course and system feeds

**Technical approach:**
- Content script injected on `ualearn.blackboard.com/*`
- `MutationObserver` to handle Blackboard Ultra's dynamic rendering
- Data extracted and sent to the extension's background script
- Background script syncs to a local database (IndexedDB) or a lightweight backend
- Extension popup shows a RangeKeeper dashboard overlay

**Risks:** Blackboard UI changes can break selectors. Mitigate with robust selectors and a quick-update deployment pipeline.

### Tier 2: ICS Calendar Feed (Zero Setup)

**How it works:** Blackboard Learn allows students to subscribe to their calendar as an ICS feed. The URL looks like `https://ualearn.blackboard.com/webapps/calendar/calendarFeed/{userId}/{hash}/learn.ics` (Classic) or similar in Ultra.

**What the student does:** Goes to Blackboard Calendar → Settings → Get External Link (or "Subscribe to Calendar"). This gives them a URL that can be polled by any calendar app or by RangeKeeper's backend.

**What you get:** All calendar events including assignment due dates, test dates, and instructor-created events. This is the single easiest data source.

**Limitation:** Only includes items instructors put on the calendar. No grades, no course content details, no announcements.

### Tier 3: Email Parsing

**How it works:** Blackboard sends email notifications for new assignments, grade updates, announcements, and due date reminders. The student enables all notification types in Blackboard settings, and RangeKeeper monitors their UA email inbox.

**Implementation:**
- If M365 delegated permissions work: Use Graph API `Mail.Read` to watch the inbox
- If blocked: Forward Blackboard emails to a dedicated RangeKeeper inbox using an Outlook rule
- Parse email subjects/bodies with regex or a simple NLP model to extract: assignment name, course, due date, grade posted, announcement text

**What you get:** Real-time-ish updates whenever something changes in Blackboard.

### Tier 4: Mobile App API Interception (Advanced)

**How it works:** The Blackboard mobile app communicates with the server via REST API calls. Using a proxy like `mitmproxy` or Charles, you can capture the exact API endpoints and authentication tokens the mobile app uses. These are often the same REST API endpoints documented officially but authenticated with the student's session.

**Caution:** This may violate Blackboard's ToS. Use only for understanding the API surface, then implement via official 3LO if possible.

### THE DAY 1 ARCHITECTURE

```
Student logs into Blackboard normally in Chrome
 ↓
Browser Extension scrapes course data, assignments, grades
 ↓
ICS feed polled every 30 min for calendar updates
 ↓
Email inbox monitored for Blackboard notifications
 ↓
All data → RangeKeeper local database (IndexedDB)
 ↓
PWA dashboard shows unified view
 ↓
Service worker sends push notifications for upcoming deadlines
 ↓
Discord bot sends daily summary + urgent alerts
```

**Cost:** $0. **Time to MVP:** 1-2 weeks.

---

## MISSION 6: FERPA & DATA PRIVACY

### FERPA Self-Consent for Students 18+

Under FERPA, once a student turns 18 OR attends a postsecondary institution (whichever comes first), they become an **"eligible student"** and all FERPA rights transfer from parents to the student. This means:

- The student can consent to share their own education records with anyone, including a third-party app like RangeKeeper
- A parent has NO automatic right to access their child's education records at the college level under FERPA
- **However:** The student CAN voluntarily authorize the parent's access. Many schools have a FERPA release form for this.

### What This Means for RangeKeeper

- **Student self-consent is sufficient.** If the student (your son) authorizes RangeKeeper to access his Blackboard data, calendar, and grades, that's legally permissible under FERPA.
- **The student is the data controller** in this context. He's choosing to use a tool that accesses his own data.
- **No institutional consent needed for student-initiated access.** The student accessing his own data via a browser extension or 3LO OAuth flow is legally identical to him logging in and looking at his own grades.

### UA's Acceptable Use Policy

UA's "Terms of Use of University Technology Resources" governs use of their IT systems. Key considerations:

- **Automated access/scraping:** Most university AUPs prohibit automated access that impacts system performance. A well-behaved extension making normal page loads is indistinguishable from a student browsing. Polling an ICS feed every 30 minutes is negligible load.
- **Third-party app registration:** If going through the official REST API, UA will want to vet the application. This is standard procedure, not a blocker — it just takes time and may require going through UA's IT Security review.
- **Data storage:** Any student data stored off-device should follow reasonable security practices (encryption at rest, minimal data retention, no sharing with third parties).

### EdTech Compliance Best Practices

- **COPPA:** Not applicable (student is 18+)
- **State privacy laws:** Alabama doesn't have a comprehensive student data privacy law beyond FERPA
- **SOC 2 / HECVAT:** If you ever want UA to officially adopt RangeKeeper, they'll likely require a HECVAT assessment (Higher Education Community Vendor Assessment Toolkit). This is the standard questionnaire universities use for edtech vendor evaluation. Not needed for Day 1 personal use.
- **Data minimization:** Only collect what's needed. Don't store full course content if you only need due dates and grades.

### The Parent Visibility Question

Your son can voluntarily share his RangeKeeper dashboard with you. Since he's the one consenting, this is FERPA-compliant. The app could have a **"share with supporter"** feature where the student explicitly grants read access to a parent, tutor, or academic coach. This is legally clean.

---

## STRATEGIC RECOMMENDATIONS

### Phase 1 — Day 1 to Week 2 (No Permissions Needed)
- Build Chrome extension for Blackboard scraping
- Set up ICS calendar feed polling
- Create PWA with push notifications
- Set up Discord bot for daily summaries
- Forward Blackboard email notifications to parsing pipeline
- **Estimated cost:** $0

### Phase 2 — Weeks 3-6 (Student Self-Consent Only)
- Register app on Anthology Developer Portal
- Implement 3LO OAuth with student consent
- Register Azure AD multi-tenant app for M365 Graph API
- Try delegated permissions (`Mail.Read`, `Calendars.Read`, `Tasks.ReadWrite`)
- If UA blocks self-consent, prepare admin consent request
- **Estimated cost:** $0-5/month for hosting

### Phase 3 — Months 2-3 (Requires UA Cooperation)
- Request UA IT install the Blackboard App ID
- Request Azure AD admin consent for Graph API
- Explore LTI integration for deeper course awareness
- Consider UA's Disability Services office as an ally — frame this as an accessibility tool
- **Estimated cost:** $20-50/month for infrastructure

### Phase 4 — Months 3-6 (Product)
- Build the ASD-specific executive function features
- Task breakdown engine, sensory-friendly UI, graduated notifications
- Parent/coach dashboard
- HECVAT assessment if pursuing institutional adoption
- Consider pilot with UA's disability services

---

**The bottom line:** You can have a working prototype pulling real data from your son's Blackboard within 1-2 weeks, costing nothing, requiring zero institutional permission. The browser extension + ICS feed + email parsing approach is the fastest path. Everything else is an upgrade from there.
