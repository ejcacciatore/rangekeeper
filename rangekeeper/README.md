# 🎯 RangeKeeper

**Academic success companion for neurodivergent college students.**

RangeKeeper automatically tracks assignments, grades, and deadlines from Blackboard Learn and delivers proactive, graduated reminders via Discord, web push notifications, or SMS. Built specifically for students with autism spectrum disorder (ASD) who benefit from executive function support.

---

## 📋 Project Overview

**Target User:** University of Alabama student (ASD) struggling with assignment tracking and deadline management

**Core Problem:** Blackboard Learn doesn't provide proactive reminders or executive function scaffolding. Generic task managers don't integrate with LMS data. Existing neurodivergent tools (Tiimo, Goblin Tools) don't connect to course systems.

**RangeKeeper's Solution:** A browser extension that scrapes Blackboard data, combines it with M365 calendar/email, and delivers smart notifications through the student's preferred channels (Discord, PWA push, optional SMS). Designed with ASD-specific features: graduated urgency, task breakdown, sensory-friendly UI, and optional parent/supporter visibility.

---

## 🚀 Quick Start

### Prerequisites

- **Chrome browser** (for the extension)
- **Node.js 18+** (for the backend, optional for Week 1)
- **Active Blackboard Learn account** at `ualearn.blackboard.com`

### Installation (Week 1 MVP)

#### 1. Install the Chrome Extension

```bash
cd extension/
# Follow instructions in extension/README.md
# Load as unpacked extension in Chrome
```

#### 2. (Optional) Run the Backend

```bash
cd backend/
npm install
cp .env.example .env
npm start
```

Backend runs on `http://localhost:3000` by default.

#### 3. Use RangeKeeper

1. Log into Blackboard at `https://ualearn.blackboard.com`
2. Navigate to your courses, calendar, and gradebook
3. The extension automatically scrapes your data
4. Click the RangeKeeper icon to see your dashboard
5. Receive notifications when assignments are due soon

---

## 📂 Project Structure

```
rangekeeper/
├── README.md                    # This file
├── RESEARCH_REPORT.md           # Full technical deep-dive (API analysis, competitive landscape, FERPA)
├── ARCHITECTURE.md              # System design, data flow, tech stack
├── extension/                   # Chrome extension (client-side)
│   ├── manifest.json
│   ├── scripts/
│   │   ├── content.js           # DOM scraper (runs on Blackboard)
│   │   ├── background.js        # Service worker (data handling, notifications)
│   │   └── popup.js             # Dashboard UI
│   ├── styles/
│   │   └── popup.css
│   ├── popup.html
│   └── README.md                # Extension setup guide
├── backend/                     # Node.js API server
│   ├── src/
│   │   └── index.js             # Express app
│   ├── package.json
│   ├── .env.example
│   └── README.md                # Backend setup guide
└── docs/                        # [Future] Additional documentation
```

---

## 🔬 Research Summary

See `RESEARCH_REPORT.md` for the full 10K-word analysis. Key findings:

### ✅ What Works Today (No Permissions Needed)

- **Browser extension scraping** — Student's authenticated Blackboard session provides access to all data
- **ICS calendar feed** — If UA enables it, zero-setup calendar sync
- **M365 delegated permissions** — Student can self-consent to Outlook/Calendar/To-Do access (if UA allows)
- **PWA push notifications** — Free, works on desktop + Android Chrome
- **Discord bot** — Free, rich formatting, instant delivery

### 🔐 What Needs UA Cooperation

- **Blackboard REST API (3LO)** — Requires UA admin to install App ID on `ualearn.blackboard.com`
- **M365 admin consent** — If UA blocks user self-consent for third-party apps
- **LTI integration** — For deep course embedding (requires institutional approval)

### 🎯 Competitive Gap

No competitor offers:

1. **True LMS integration** — Direct Blackboard data ingestion (not just ICS)
2. **ASD-specific design** — Executive function scaffolding, sensory-friendly UI, graduated notifications
3. **Grade-aware prioritization** — Knows which assignments matter most
4. **Parent/supporter dashboard** — FERPA-compliant visibility layer
5. **Multi-channel smart notifications** — Discord + PWA + optional SMS with urgency levels

**Competitors:**
- **Tiimo** ($50/yr) — Great neurodivergent UX, but no LMS integration, iOS-only
- **Goblin Tools** (free) — Task breakdown only, no scheduling, website currently down
- **Shovel** ($240/yr) — Claims LMS sync, but unclear depth, no ASD features
- **MyStudyLife** — Manual entry, no AI, no neurodivergent support

---

## 🧠 Core Features (Roadmap)

### Phase 1 — MVP (Weeks 1-2) ✅ IN PROGRESS

- [x] Chrome extension scrapes Blackboard courses, assignments, grades
- [x] IndexedDB local storage
- [x] Extension popup dashboard
- [x] Chrome notifications for upcoming deadlines
- [ ] Backend API (data sync, health check)
- [ ] ICS feed polling (if UA provides it)
- [ ] Discord bot (daily summary)

### Phase 2 — Integration (Weeks 3-6)

- [ ] Blackboard 3LO OAuth (student self-consent)
- [ ] M365 Graph API (email parsing, calendar sync)
- [ ] PWA with service worker (offline access, push notifications)
- [ ] Email notification parsing (Blackboard → student inbox)
- [ ] Graduated notification logic (gentle → firm → urgent → overdue)

### Phase 3 — ASD-Specific Features (Months 2-3)

- [ ] AI task breakdown ("Write 5-page essay" → "Research sources (2h)" → "Outline (1h)" → ...)
- [ ] Sensory-friendly UI (low contrast mode, minimal animations, clear typography)
- [ ] Parent/supporter dashboard (FERPA-compliant, student-consented visibility)
- [ ] Time estimation ("You typically take 3h for essays, this is due in 2 days, start by 6 PM tonight")
- [ ] Transition support (meal planning, laundry reminders, social commitments)

### Phase 4 — Product/Scale (Months 3-6)

- [ ] Multi-tenant SaaS architecture
- [ ] Institutional deployment (UA Disability Services pilot)
- [ ] HECVAT assessment (security review for universities)
- [ ] Support other LMS platforms (Canvas, Moodle, D2L)
- [ ] Mobile app (React Native)

---

## 💰 Business Opportunity

**Market:** 70K-140K ASD college students in the US, plus ~1-2M with ADHD or executive function challenges

**Monetization Options:**

1. **B2C SaaS:** $5-15/month per student (Tiimo charges $50/yr, Shovel $240/yr — undercut and deliver more)
2. **B2B Institutional:** Sell to universities as accessibility/retention tool (disability services offices have budgets)
3. **Freemium:** Free for basic notifications, paid for AI task breakdown + parent dashboard

**Revenue Projection:**
- 1,000 paying students at $10/month = **$120K/year**
- UA campus-wide (500 active users) at $5/student/year = **$190K/year from one school**
- Scale to 10 universities = **$2M ARR**

**Funding:** Tiimo raised $1.5M+, Shovel is venture-backed. There's a real market here.

---

## 🔒 Privacy & Compliance

### FERPA
- **Student is 18+ → owns their data** — No institutional consent needed for student-initiated access
- **Parent visibility is opt-in** — Student explicitly grants read access via app settings
- **Data minimization** — Only collect what's needed (assignments, grades, calendar)

### Security
- **Encrypted storage** — IndexedDB (client) and SQLite/Postgres (server) encrypted at rest
- **HTTPS everywhere** — All API calls over TLS
- **OAuth 2.0 + PKCE** — Industry-standard auth for Blackboard and M365
- **No third-party sharing** — Student data never sold or shared

### Best Practices
- **SOC 2 / HECVAT** — Required for institutional adoption (Phase 4)
- **Minimal retention** — Default 90-day rolling window for old data
- **Student control** — One-click data export, one-click account deletion

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Extension | Manifest V3, Vanilla JS, IndexedDB |
| Backend | Node.js, Express, SQLite (MVP) → Postgres (production) |
| Discord Bot | discord.js |
| PWA | React (or vanilla), Service Worker, Web Push API |
| ICS Parsing | ical.js |
| M365 Integration | @microsoft/microsoft-graph-client |
| Notifications | web-push, discord.js, twilio (optional) |
| Hosting (MVP) | DigitalOcean Droplet ($6/month) or Railway/Render free tier |

---

## 📊 Current Status

**Version:** 0.1.0 (MVP in progress)

**What works:**
- ✅ Extension skeleton (manifest, content script, background script, popup)
- ✅ Basic Blackboard scraping logic (DOM selectors need tuning for UA's instance)
- ✅ IndexedDB storage
- ✅ Chrome notifications
- ✅ Backend API stub (health check, sync endpoint)

**What's next:**
- Fix DOM selectors for `ualearn.blackboard.com` (needs live testing)
- Add extension icons (16x16, 48x48, 128x128)
- Implement database persistence (SQLite)
- Build Discord bot
- Set up ICS feed polling

---

## 🙏 Acknowledgments

**Built for:** A University of Alabama student (ASD) who needs better assignment tracking

**Research foundation:**
- Anthology Blackboard REST API documentation
- Microsoft Graph API documentation
- Tiimo, Goblin Tools, Shovel competitive analysis
- FERPA regulations & EdTech best practices

**Inspired by:** The neurodivergent community's need for tools that understand executive function challenges

---

## 📬 Contact

**Rico Cacciatore**  
📧 [email]  
🔗 [LinkedIn](https://linkedin.com/in/enricojcacciatore)

---

## 📜 License

MIT (for now — update if/when commercialized)
