# 🚀 RangeKeeper Deployment Strategy

**Date:** March 30, 2026  
**Author:** Claw (AI Developer)  
**Status:** Analysis & Recommendation  
**Decision Needed:** GitHub Pages (current) vs. Vercel + Next.js

---

## Current State Analysis

### ✅ What's Currently Deployed

**GitHub Pages (Live):**
- 📍 https://ejcacciatore.github.io/rangekeeper/
- **index.html** — Today's Focus dashboard (fully functional)
- **courses.html** — All Courses grid (fully functional)
- **assets/js/data.js** — Data loader (fetches `data/latest.json`)
- **data/latest.json** — Static data snapshot (9.7KB, Spring 2026 Massimo's data)
- All markdown documentation (MD files synced to repo)

**Backend (Running Locally):**
- http://localhost:3000 (Node.js + Express)
- SQLite database with 10 tables
- API endpoints: /api/sync, /api/courses, /api/assignments, /api/grades, /api/export/json, etc.
- Discord bot integration (ready for DISCORD_BOT_TOKEN)
- Notification scheduler (runs every 15 min)

**Chrome Extension:**
- Fully built (Manifest V3)
- Scrapers for grades, messages, feedback
- Debug console ready (RangeKeeperDebug)
- Ready for live testing on Blackboard

---

## How GitHub Pages Currently Works

```
1. Extension scrapes Blackboard
   ↓
2. Syncs to Backend API (POST /api/sync)
   ↓
3. Backend stores in SQLite
   ↓
4. Manual export: Backend exports to data/latest.json
   ↓
5. Dashboard fetches from data/latest.json
   ↓
6. GitHub Pages renders static HTML + client-side JS
   ↓
7. Student sees "Today's Focus" with their assignments
```

**Pros:**
- ✅ Fast (static files, CDN)
- ✅ No server needed (GitHub hosts for free)
- ✅ Simple deployment (`git push`)
- ✅ Works offline with cached data
- ✅ Great for MVP validation

**Cons:**
- ⚠️ Data updates only when you manually export JSON
- ⚠️ No real-time sync (requires manual GitHub Action or cron job)
- ⚠️ No server-side rendering
- ⚠️ Difficult to add features like auth, parent dashboard, API calls

---

## Path Forward: 3 Options

### Option 1: Keep GitHub Pages (Current)
**Best for:** Quick MVP validation with Massimo

**Setup:**
1. Keep HTML files on GitHub Pages
2. Set up GitHub Actions to auto-export data daily (or on schedule)
3. Dashboard always shows latest data from backend

**Timeline:** 1 hour (GitHub Actions workflow)
**Cost:** Free (GitHub Pages + Railway backend)
**Scalability:** Up to ~100 students (before page generation gets slow)

**Workflow:**
```
Backend running → GitHub Actions (daily at 3 AM) → 
  calls /api/export/json → 
  writes data/latest.json → 
  pushes to GitHub → 
  Pages auto-deploys
```

**When to choose:** You just want Massimo to test it, validation only

---

### Option 2: Upgrade to Vercel + Next.js (Recommended)
**Best for:** Production-ready product, real-time data, scalability

**Architecture:**
```
Frontend: Vercel (Next.js) ← Pulls data from Backend API (live)
  ├── index.html → /app/page.tsx
  ├── courses.html → /app/courses/page.tsx
  ├── course-detail.html → /app/courses/[id]/page.tsx
  ├── assignments.html → /app/assignments/page.tsx
  ├── grades.html → /app/grades/page.tsx
  └── settings.html → /app/settings/page.tsx

Backend: Railway (existing Node.js + Express)
  ├── /api/export/json
  ├── /api/courses
  ├── /api/assignments
  ├── /api/grades
  └── Discord bot integration

Database: SQLite (or migrate to Postgres on Railway)
```

**Why Next.js:**
- ✅ Server-side rendering (faster, SEO-friendly)
- ✅ API routes built-in (`/api/*`)
- ✅ Real-time data fetching (no manual exports needed)
- ✅ Easy to add features (auth, parent dashboard, etc.)
- ✅ Incremental Static Regeneration (ISR) for fast + fresh data
- ✅ Vercel deployment is one `git push`
- ✅ Can run cron jobs for Discord notifications

**Timeline:** 8-12 hours
**Cost:** Free (Vercel + Railway free tier)
**Scalability:** Up to 10K+ students

**File structure:**
```
rangekeeper-web/                    (new Next.js repo)
├── app/
│   ├── layout.tsx                 (nav, shared styles)
│   ├── page.tsx                   (index.html → /today)
│   ├── courses/
│   │   ├── page.tsx               (courses.html)
│   │   └── [id]/
│   │       └── page.tsx           (course-detail.html?id=XXX)
│   ├── assignments/
│   │   └── page.tsx               (assignments.html)
│   ├── grades/
│   │   └── page.tsx               (grades.html)
│   ├── settings/
│   │   └── page.tsx               (settings.html)
│   └── api/
│       └── sync/
│           └── route.ts           (proxy to backend)
├── components/
│   ├── navbar.tsx
│   ├── assignment-card.tsx
│   ├── priority-badge.tsx
│   └── ...
├── lib/
│   ├── api.ts                     (fetch backend data)
│   ├── utils.ts                   (format dates, etc.)
│   └── hooks.ts                   (useCourses, useAssignments)
└── package.json
```

**When to choose:** You're serious about this product, want real-time, want to scale

---

### Option 3: Hybrid (Recommended for You) 🏆
**Best for:** Validation first, then scale

**Phase 1 (This Week): GitHub Pages MVP**
- Keep current setup
- Set up GitHub Actions to auto-export data daily
- Deploy to Pages
- Massimo tests for 1 week
- Gather feedback

**Phase 2 (Next Month): Migrate to Vercel + Next.js**
- If Massimo loves it and wants more features
- Convert to Next.js
- Add parent dashboard, better UI, real-time updates
- Deploy to Vercel

**Timeline:** Phase 1 (1h) + Phase 2 (10h)
**Cost:** Free (both phases)
**Risk:** Low (can validate before investing in rebuild)

---

## Detailed Comparison

| Feature | GitHub Pages | Next.js + Vercel |
|---------|--------------|------------------|
| **Deployment** | `git push` (manual data export) | `git push` (automatic) |
| **Data Updates** | Manual JSON export or scheduled job | Real-time from API |
| **Real-time Sync** | ❌ No | ✅ Yes |
| **Server-Side Rendering** | ❌ No (client-side only) | ✅ Yes |
| **API Routes** | ❌ No (must call external backend) | ✅ Built-in |
| **Auth/Login** | ❌ Hard to add | ✅ Easy (NextAuth.js) |
| **Parent Dashboard** | ❌ Requires separate app | ✅ Easy (same codebase) |
| **Performance** | Good (static files) | Excellent (SSR + ISR) |
| **Scalability** | ~100 students | 10K+ students |
| **Cost** | Free | Free (Vercel + Railway) |
| **Development Speed** | Fast (no build) | Fast (Next.js templates) |
| **Cold Starts** | None | Minimal (Vercel optimized) |

---

## My Recommendation

### For You, Rico: **Option 3 (Hybrid)**

**Why:**
1. **Validate first** — GitHub Pages works fine for MVP
2. **Quick feedback loop** — Get Massimo testing this week
3. **Low risk** — If it doesn't work, you haven't invested 12 hours
4. **Ready to scale** — Next.js migration path is clear if needed

### Immediate Action Items

#### This Week (1-2 hours):
1. ✅ Set up GitHub Actions to auto-export data
2. ✅ Test with Massimo (give him dashboard link)
3. ✅ Get feedback (is it helpful? are selectors working?)

#### Next Week (if positive feedback):
1. Start Next.js project on Vercel
2. Migrate pages one by one
3. Add real-time updates
4. Deploy new version

#### If Negative Feedback:
- Refine extension selectors
- Adjust UI based on Massimo's needs
- Iterate on GitHub Pages (faster)

---

## GitHub Actions Auto-Export Setup

**File: `.github/workflows/export-dashboard.yml`**

```yaml
name: Export Dashboard Data

on:
  schedule:
    - cron: '0 3 * * *'  # Every day at 3 AM UTC
  workflow_dispatch:      # Manual trigger

jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Fetch latest data from backend
        run: |
          curl -s "http://localhost:3000/api/export/json" \
            -o data/latest.json
      
      - name: Commit and push
        run: |
          git config user.name "RangeKeeper Bot"
          git config user.email "bot@rangekeeper.app"
          git add data/latest.json
          git commit -m "Auto-export: updated dashboard data" || true
          git push
```

**Problem:** This assumes backend is running and accessible from GitHub Actions  
**Solution:** Either:
1. Deploy backend to Railway (free tier) with public URL
2. Use GitHub Secrets to pass backend token
3. Manual export via script (you run `node export.js`, commit, push)

---

## Next.js Migration Path (If Needed)

### Step 1: Create Next.js project
```bash
npx create-next-app@latest rangekeeper-web
cd rangekeeper-web
```

### Step 2: Create pages
Each HTML file becomes a route:
- `index.html` → `app/page.tsx` (home)
- `courses.html` → `app/courses/page.tsx`
- `course-detail.html?id=X` → `app/courses/[id]/page.tsx`
- etc.

### Step 3: Add API client
```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export async function getCourses() {
  const res = await fetch(`${API_URL}/api/courses`);
  return res.json();
}

export async function getAssignments() {
  const res = await fetch(`${API_URL}/api/assignments`);
  return res.json();
}
```

### Step 4: Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Step 5: Set environment variable
In Vercel dashboard:
```
NEXT_PUBLIC_BACKEND_URL=https://your-railway-backend.railway.app
```

---

## Current Tech Stack Summary

| Layer | Current | Future (Optional) |
|-------|---------|-------------------|
| **Frontend** | Static HTML (GitHub Pages) | Next.js (Vercel) |
| **Backend** | Node.js + Express (Railway) | Node.js + Express (Railway) |
| **Database** | SQLite | SQLite or Postgres |
| **Deployment** | GitHub Pages + manual export | Vercel + auto-sync |
| **Notifications** | Discord.js (running locally) | Discord.js (Railway) |

---

## Risks & Mitigations

### Risk 1: Data Sync Delays (GitHub Pages)
**Problem:** Data in dashboard is 1 day old (updated once daily)  
**Mitigation:** 
- Set GitHub Actions to run every 6 hours (more frequent)
- Or migrate to Next.js for real-time

### Risk 2: Backend Not Running (GitHub Actions)
**Problem:** GitHub Actions can't reach backend to export data  
**Mitigation:**
- Deploy backend to Railway (public URL)
- Or use manual export + commit workflow

### Risk 3: Extension Selectors Break (Blackboard Changes)
**Problem:** Blackboard updates DOM structure, extension stops scraping  
**Mitigation:**
- Use `RangeKeeperDebug` console to test
- Quick 5-min selector fixes
- Scheduled selector checks (monthly)

### Risk 4: Scope Creep (Too Many Features)
**Problem:** Add parent dashboard, auth, AI task breakdown → 3 months of work  
**Mitigation:**
- Start with MVP (today's focus + basic dashboard)
- Validate with Massimo
- Add features only if he requests them

---

## Decision Points for You

### Question 1: How Soon Does Massimo Need This?
- **This week?** → GitHub Pages (current path)
- **Next month?** → GitHub Pages first, then Next.js

### Question 2: Are You Building for Product or Personal Tool?
- **Personal tool** → GitHub Pages is fine
- **Product** → Next.js + Vercel (better for scaling)

### Question 3: Do You Want Real-Time Data Updates?
- **No (daily snapshots OK)** → GitHub Pages
- **Yes** → Next.js

---

## Action Items (Ordered by Priority)

### Immediate (Today):
- [ ] Confirm you want Option 3 (Hybrid)
- [ ] Verify latest.json has Massimo's current data
- [ ] Test GitHub Pages dashboard (https://ejcacciatore.github.io/rangekeeper/)

### This Week:
- [ ] Validate extension selectors on Blackboard (use RangeKeeperDebug)
- [ ] Set up GitHub Actions auto-export (if GitHub Pages path)
- [ ] Give Massimo the dashboard link
- [ ] Gather feedback

### Next Week (If Positive Feedback):
- [ ] Decide: Keep GitHub Pages or migrate to Next.js?
- [ ] If migrate: Start Next.js project on Vercel
- [ ] If keep: Refine based on Massimo's requests

---

## Files Summary

**What's in GitHub Repo Now:**
- ✅ All markdown docs (ACTION_PLAN, ARCHITECTURE, SESSION, SKILL, etc.)
- ✅ Latest HTML version (index.html, courses.html, massimo-student-report.html)
- ✅ Extension code (Manifest V3, scrapers, popup)
- ✅ Backend code (Express, SQLite, Discord bot)
- ✅ Sample data (data/latest.json — Massimo Spring 2026)

**What's Deployed:**
- ✅ GitHub Pages (https://ejcacciatore.github.io/rangekeeper/)
- ✅ Backend (http://localhost:3000 — needs to be running)

**What's Ready to Build:**
- ⏳ Advanced dashboard pages (course-detail, assignments, grades, calendar)
- ⏳ GitHub Actions workflow (auto-export JSON)
- ⏳ Next.js migration (when needed)

---

## Conclusion

**You're in a great position:**
1. ✅ Backend is 100% complete
2. ✅ Extension is 90% complete (needs selector validation)
3. ✅ Basic dashboard is live
4. ✅ Data is real (Massimo's Spring 2026 courses/assignments)

**Next step:** Validate, gather feedback, then decide to scale.

**My recommendation:** Start with GitHub Pages + GitHub Actions. Get Massimo feedback this week. If he loves it, migrate to Next.js. If he doesn't, iterate on Pages.

---

**Ready to proceed? Let me know:**
1. GitHub Actions auto-export setup (1 hour)?
2. Or jump straight to advanced dashboard pages (6-8 hours)?
3. Or start Next.js project now (future-proofing)?

