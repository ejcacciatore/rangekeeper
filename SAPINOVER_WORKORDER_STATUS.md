# SAPINOVER PLATFORM — AUTONOMOUS WORK ORDER STATUS
**Project:** sapinover-site.vercel.app (Next.js App Router, Vercel)  
**Mission:** "We Own the Night" — 24-hour market intelligence platform  
**Started:** 2026-03-20 17:10 UTC  
**Subagent:** agent:main:subagent:58853aba-ac90-40c9-9479-d0afe55a30a8

## 🚨 CRITICAL BLOCKER — REPOSITORY ACCESS REQUIRED

**Status:** Cannot proceed without repository access

**Live Site Confirmed:** https://sapinover-site.vercel.app is live and operational
- Title: "SAPINOVER - We Own the Night"
- Tech Stack: Next.js App Router (confirmed from site behavior)
- Design Language: Black background with neon-green (#00FF41) accents ✓
- Current Features: Live Market Pulse, Daily Briefs, Session Summary, Markets view

**What I Need to Proceed:**

1. **GitHub Repository URL or Access**
   - Expected format: `github.com/[username]/sapinover-site` or similar
   - Need either: SSH key, personal access token, or repo cloning instructions
   
2. **Environment Variables** (for later tasks)
   - `FINNHUB_API_KEY` - For Task 2 (Live Ticker)
   - `DATABASE_URL` or Supabase credentials - For Task 3 (Waitlist), Task 7 (Alerts)
   - `VERCEL_KV_*` variables if using Vercel KV
   - `RESEND_API_KEY` or email service credentials - For Task 7 (Email Alerts)
   - `GDELT_API_KEY` (if required) - For Task 10 (Geopolitical Layer)

3. **Vercel Project Access** (optional but helpful)
   - For deployment, cron jobs, environment variable management

## 📋 EXECUTION PLAN (Once Access Granted)

### Phase 1: Repository Setup & Audit (15 min)
- Clone repository to `/home/ubuntu/.openclaw/workspace/sapinover-site`
- Audit existing code structure
- Check `package.json` for installed dependencies
- Review current routing structure
- Identify existing components and utilities

### Phase 2: TASK 1 — Research Blog (CRITICAL - April 1 Launch) (2-3 hrs)
Priority order:
1. Set up MDX infrastructure (next-mdx-remote or contentlayer)
2. Create `/app/research/page.tsx` with article listing
3. Create `/app/research/[slug]/page.tsx` for individual articles
4. Write 3 seed articles in `/content/research/` directory
5. Implement RSS feed at `/app/research/feed.xml/route.ts`
6. Add JSON-LD structured data to article layout
7. Create OG image generation route using Next.js ImageResponse

### Phase 3: TASK 2 — Live Ticker Audit (1-2 hrs)
1. Locate existing ticker component
2. Audit data source (simulated vs real)
3. Wire to Finnhub WebSocket API
4. Add reconnection logic with exponential backoff
5. Add "DELAYED 15MIN" label
6. Sync with Live Market Pulse values

### Phase 4: TASK 3 — Waitlist Social Proof (1-2 hrs)
1. Create waitlist count component with count-up animation
2. Set up Supabase/Vercel KV connection
3. Position component below hero CTA
4. Create recent-join ticker with mock data (seeded for launch)

### Phase 5: TASK 4 — Public Brief Teaser (1-2 hrs)
1. Modify brief display to show first 2 sentences
2. Add blur overlay with CTA
3. Create `/app/daily-brief/[date]/[session]/page.tsx`
4. Add OpenGraph metadata to brief pages
5. Create brief-specific OG image generation

### Phase 6: TASK 5 — Composite Score Delta (1-2 hrs)
1. Modify Live Market Pulse cards to show delta
2. Add up/down arrow indicators with colors
3. Create mini sparkline component (80px wide)
4. Add tooltip with methodology explanation

### Phase 7: TASK 6 — Mobile Responsive Audit (2-3 hrs)
1. Test all pages at 375px, 430px, 768px
2. Fix ticker bar overflow
3. Make stats bar responsive (4-col → 2x2)
4. Make 6-card grid horizontally scrollable on mobile
5. Ensure Point-and-Figure charts are mobile-friendly

### Phase 8: TASK 7 — Alert System (2-3 hrs)
1. Create alert opt-in form component
2. Set up Supabase schema for alert preferences
3. Implement email sending with Resend
4. Create Vercel Cron job for alert checking
5. Design alert email template

### Phase 9: TASK 8 — SEO & Metadata (1-2 hrs)
1. Audit all pages for meta tags
2. Add canonical URLs
3. Create `/app/sitemap.ts`
4. Create `/app/robots.txt`
5. Add structured data (Organization, WebSite, SoftwareApplication)
6. Add Twitter Card and OG meta to all pages

### Phase 10: TASK 9 — Radiant Shaders (1-2 hrs)
1. Install `radiant-shaders` package
2. Create shader background component
3. Replace static particle mesh in hero
4. Add graceful degradation
5. Add `prefers-reduced-motion` support

### Phase 11: TASK 10 — Geopolitical Layer (2-3 hrs)
1. Create Global Intelligence Map component
2. Embed LiveUAmap iframe
3. Wire to GEO score component
4. Add GDELT event feed
5. Make section collapsible (default: collapsed)

### Phase 12: Testing & Deployment (1-2 hrs)
1. Full site audit
2. TypeScript strict mode validation
3. Error/loading state verification
4. Commit all changes with proper messages
5. Deploy to Vercel

## ⏱️ ESTIMATED TOTAL TIME: 18-26 hours

## 🎯 DELIVERABLES

### Code Deliverables
- Research blog with 3 articles
- Live ticker with real data
- Waitlist social proof widget
- Public brief teaser system
- Composite score deltas with sparklines
- Mobile-responsive improvements
- Alert/notification system
- Complete SEO implementation
- Radiant shader integration
- Geopolitical intelligence layer

### Documentation Deliverables
- Environment variable requirements
- API integration guides
- Manual follow-up checklist
- Deployment instructions

## ⚠️ KNOWN REQUIREMENTS FOR MANUAL FOLLOW-UP

1. **API Keys to Obtain:**
   - Finnhub API key (free or paid tier)
   - Resend API key for email alerts
   - GDELT API access (if required)
   
2. **Infrastructure Setup:**
   - Supabase project + credentials
   - OR Vercel KV setup
   - Vercel Cron job deployment
   
3. **Content:**
   - Final approval on 3 research blog articles
   - Brief teaser copy review
   - Alert email template review

## 🔄 NEXT STEPS

**IMMEDIATE:** Waiting for Rico to provide:
1. GitHub repository access (URL + credentials)
2. Any existing environment variables or API keys
3. Vercel project access (optional)

**Once access granted:** Execute phases 1-12 systematically, committing after each major task with format `[SAPINOVER] Task X.x: description`

---

**Status:** ⏸️ PAUSED - Awaiting repository access
