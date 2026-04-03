# SAPINOVER — EXECUTION CHECKLIST

## PRE-INTEGRATION (Rico's Tasks)

### ☐ Repository Access
- [ ] Provide GitHub repository URL
- [ ] Provide SSH key or personal access token
- [ ] Confirm read/write access

### ☐ API Keys (5-10 minutes total)
- [ ] Sign up for Finnhub: https://finnhub.io/register
  - Get API key from dashboard
  - Free tier: 60 calls/min (sufficient for ticker)
- [ ] Sign up for Resend: https://resend.com/signup
  - Get API key from dashboard
  - Free tier: 100 emails/day
- [ ] Optional: Sign up for Supabase: https://supabase.com
  - Create new project
  - Get `DATABASE_URL` and `SUPABASE_ANON_KEY`
  - Free tier: 500MB storage

### ☐ Environment Variables
Create `.env.local` in project root:
```bash
# Task 2 - Live Ticker (REQUIRED for April 1)
NEXT_PUBLIC_FINNHUB_API_KEY=pk_xxxxxxxxxxxxx

# Task 7 - Email Alerts (can add post-launch)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Task 3 & 7 - Database (can add post-launch)
DATABASE_URL=postgresql://xxxxx
SUPABASE_ANON_KEY=xxxxx
```

---

## INTEGRATION PHASE (Agent's Tasks)

### TASK 1 — Research Blog (30 min) [CRITICAL - April 1]
- [ ] Clone repository to workspace
- [ ] Install dependencies: `npm install next-mdx-remote gray-matter reading-time`
- [ ] Copy `/app/research/` directory
- [ ] Copy `/content/` directory
- [ ] Copy `/lib/research.ts`
- [ ] Update `next.config.js` to add `pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx']`
- [ ] Test locally: `npm run dev` → visit `/research`
- [ ] Verify all 3 articles load
- [ ] Test RSS feed: `/research/feed.xml`
- [ ] Test OG image generation: `/research/og?slug=understanding-ats-volume`
- [ ] Commit: `[SAPINOVER] Task 1: Research blog infrastructure`

### TASK 2 — Live Ticker (20 min) [HIGH PRIORITY]
- [ ] Add `NEXT_PUBLIC_FINNHUB_API_KEY` to `.env.local`
- [ ] Copy `/components/LiveTicker.tsx`
- [ ] Copy `/hooks/useFinnhub.ts`
- [ ] Replace existing ticker in layout or homepage
- [ ] Test WebSocket connection (check browser console)
- [ ] Verify prices update in real-time
- [ ] Verify "LIVE" indicator shows green when connected
- [ ] Commit: `[SAPINOVER] Task 2: Live ticker with Finnhub WebSocket`

### TASK 3 — Waitlist Widget (15 min) [HIGH PRIORITY]
- [ ] Copy `/components/WaitlistProof.tsx`
- [ ] Add component below hero CTA buttons
- [ ] Verify count-up animation works
- [ ] Verify recent-join ticker rotates every 8 seconds
- [ ] Commit: `[SAPINOVER] Task 3: Waitlist social proof widget`

### TASK 4 — Brief Teaser (45 min)
- [ ] Copy `/components/BriefTeaser.tsx`
- [ ] Integrate with existing brief system
- [ ] Create `/app/daily-brief/[date]/[session]/page.tsx` route
- [ ] Add OpenGraph metadata to brief pages
- [ ] Test blur overlay and join modal
- [ ] Commit: `[SAPINOVER] Task 4: Public brief teaser system`

### TASK 5 — Score Delta (30 min)
- [ ] Copy `/components/ScoreDelta.tsx`
- [ ] Integrate into each Live Market Pulse card
- [ ] Add delta calculation logic (current vs previous session)
- [ ] Add 24-hour sparkline data
- [ ] Test tooltip methodology display
- [ ] Commit: `[SAPINOVER] Task 5: Composite score delta indicators`

### TASK 6 — Mobile Responsive (2 hours)
- [ ] Test homepage at 375px width
- [ ] Test homepage at 430px width
- [ ] Test homepage at 768px width
- [ ] Fix ticker bar overflow on mobile
- [ ] Make stats bar (95 days / 75K obs...) stack 2x2 on mobile
- [ ] Make 6-card grid scroll horizontally on mobile
- [ ] Ensure Point-and-Figure charts readable on mobile
- [ ] Test all pages (research, daily-brief, session-summary, markets)
- [ ] Commit: `[SAPINOVER] Task 6: Mobile responsive improvements`

### TASK 7 — Alert System (90 min) [POST-LAUNCH OK]
- [ ] Set up Supabase project (or Vercel KV)
- [ ] Create alert preferences schema
- [ ] Copy `/components/AlertOptIn.tsx`
- [ ] Copy `/app/api/alerts/route.ts`
- [ ] Copy `/app/api/cron/check-alerts/route.ts`
- [ ] Create email template
- [ ] Configure Vercel Cron job (vercel.json)
- [ ] Test alert flow end-to-end
- [ ] Commit: `[SAPINOVER] Task 7: Email alert system`

### TASK 8 — SEO & Metadata (45 min) [CRITICAL - April 1]
- [ ] Copy `/app/sitemap.ts`
- [ ] Copy `/public/robots.txt`
- [ ] Add Organization JSON-LD to homepage
- [ ] Add WebSite JSON-LD to homepage
- [ ] Add SoftwareApplication JSON-LD to homepage
- [ ] Audit all pages for missing meta tags
- [ ] Add canonical URLs to all pages
- [ ] Add Twitter Card meta to all pages
- [ ] Add OpenGraph meta to all pages
- [ ] Commit: `[SAPINOVER] Task 8: SEO and metadata complete pass`

### TASK 9 — Radiant Shader (30 min)
- [ ] Copy `/components/HeroShader.tsx`
- [ ] Replace existing hero background
- [ ] Test WebGL loads correctly
- [ ] Test fallback CSS gradient on unsupported devices
- [ ] Test `prefers-reduced-motion` fallback
- [ ] Verify performance on mobile (should be smooth)
- [ ] Commit: `[SAPINOVER] Task 9: Radiant shader hero background`

### TASK 10 — Geopolitical Layer (60 min)
- [ ] Copy `/components/GeopoliticalLayer.tsx`
- [ ] Add component below Live Market Pulse on homepage
- [ ] Wire to existing GEO score
- [ ] Test LiveUAmap iframe loads
- [ ] Test collapsible functionality
- [ ] Test "ELEVATED CONFLICT ACTIVITY" label shows when GEO > 7
- [ ] Commit: `[SAPINOVER] Task 10: Geopolitical intelligence layer`

---

## TESTING PHASE

### ☐ Local Testing
- [ ] Run `npm run build` (verify no TypeScript errors)
- [ ] Run `npm run dev` (verify dev server starts)
- [ ] Test all routes:
  - [ ] `/` (homepage)
  - [ ] `/research` (blog listing)
  - [ ] `/research/understanding-ats-volume` (article)
  - [ ] `/research/feed.xml` (RSS)
  - [ ] `/daily-brief` (if exists)
  - [ ] `/session-summary` (if exists)
  - [ ] `/markets` (if exists)

### ☐ Mobile Testing
- [ ] Chrome DevTools → 375px (iPhone SE)
- [ ] Chrome DevTools → 430px (iPhone 14 Pro)
- [ ] Chrome DevTools → 768px (iPad)
- [ ] All pages render correctly
- [ ] No horizontal scroll
- [ ] Ticker doesn't overflow
- [ ] Cards are readable

### ☐ Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] WebSocket connects in all browsers
- [ ] WebGL loads in all browsers (or falls back gracefully)

### ☐ Performance Testing
- [ ] Lighthouse score >90 (desktop)
- [ ] Lighthouse score >85 (mobile)
- [ ] WebSocket doesn't cause memory leaks
- [ ] No console errors

### ☐ SEO Testing
- [ ] `curl https://sapinover-site.vercel.app/sitemap.xml` (verify loads)
- [ ] `curl https://sapinover-site.vercel.app/robots.txt` (verify loads)
- [ ] View source → verify meta tags present
- [ ] Twitter Card Validator: https://cards-dev.twitter.com/validator
- [ ] LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

---

## DEPLOYMENT PHASE

### ☐ Pre-Deployment
- [ ] All tests passing
- [ ] All commits pushed to GitHub
- [ ] Environment variables added to Vercel dashboard
- [ ] Preview deployment reviewed

### ☐ Deploy to Production
- [ ] Push to `main` branch
- [ ] Verify Vercel auto-deploys
- [ ] Check deployment logs for errors
- [ ] Visit live site and spot-check

### ☐ Post-Deployment Verification
- [ ] Homepage loads correctly
- [ ] Research blog accessible
- [ ] Live ticker connects and updates
- [ ] RSS feed accessible
- [ ] Sitemap accessible
- [ ] No console errors in production
- [ ] Mobile responsive working

---

## POST-LAUNCH (April 1+)

### ☐ Content Distribution
- [ ] Share research articles on Rico's LinkedIn (3K followers)
- [ ] Submit articles to TabbFORUM
- [ ] Submit articles to Markets Media
- [ ] Email institutional contacts

### ☐ Monitoring
- [ ] Set up Vercel Analytics
- [ ] Monitor Finnhub API usage
- [ ] Monitor error logs
- [ ] Track waitlist signups

### ☐ Iteration
- [ ] Collect user feedback
- [ ] Add Task 7 (alerts) if not done yet
- [ ] Add Task 10 (geopolitical) if not done yet
- [ ] Write 1-2 new research articles per month

---

## ESTIMATED TIMELINE

- **Pre-integration (Rico):** 15 minutes
- **Integration (Agent):** 6-8 hours
- **Testing:** 1-2 hours
- **Deployment:** 30 minutes

**Total:** 8-11 hours from repository access to production deployment

---

## SUPPORT CONTACTS

- **Finnhub Support:** support@finnhub.io
- **Resend Support:** support@resend.com
- **Supabase Support:** support@supabase.io
- **Vercel Support:** support@vercel.com

---

## ROLLBACK PLAN

If something breaks:

```bash
# Revert last commit
git revert HEAD

# Push to trigger redeployment
git push origin main

# Or revert to specific commit
git revert <commit-hash>
```

Each task is a separate commit, so you can rollback individual features without affecting others.

---

**Status:** Ready to execute pending repository access.

**Next Step:** Rico provides GitHub repository URL + API keys → Agent executes checklist.
