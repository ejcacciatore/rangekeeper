# SAPINOVER PLATFORM — QUICK INTEGRATION GUIDE

## Prerequisites

1. **Repository cloned** to `/home/ubuntu/.openclaw/workspace/sapinover-site`
2. **API keys obtained:**
   - Finnhub (free): https://finnhub.io/register
   - Resend (free): https://resend.com/signup
3. **Node.js dependencies:** Verify `npm install` works

## Step-by-Step Integration

### Phase 1: Research Blog (CRITICAL — 30 min)

```bash
cd /home/ubuntu/.openclaw/workspace/sapinover-site

# 1. Install dependencies
npm install next-mdx-remote gray-matter reading-time

# 2. Copy files
cp -r ../sapinover-scaffold/task-1-research-blog/app/research app/
cp -r ../sapinover-scaffold/task-1-research-blog/content .
cp ../sapinover-scaffold/task-1-research-blog/lib/research.ts lib/

# 3. Update next.config.js
# Add: pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx']

# 4. Test locally
npm run dev
# Visit: http://localhost:3000/research

# 5. Commit
git add .
git commit -m "[SAPINOVER] Task 1: Research blog infrastructure"
```

### Phase 2: Live Ticker (20 min)

```bash
# 1. Add environment variable to .env.local
echo "NEXT_PUBLIC_FINNHUB_API_KEY=your_key_here" >> .env.local

# 2. Copy files
cp ../sapinover-scaffold/task-2-live-ticker/components/LiveTicker.tsx components/
cp ../sapinover-scaffold/task-2-live-ticker/hooks/useFinnhub.ts hooks/

# 3. Replace ticker in app/page.tsx or layout
# Import: import LiveTicker from '@/components/LiveTicker'
# Use: <LiveTicker />

# 4. Test WebSocket connection
npm run dev

# 5. Commit
git commit -am "[SAPINOVER] Task 2: Live ticker with Finnhub WebSocket"
```

### Phase 3: Waitlist Widget (15 min)

```bash
# 1. Copy component
cp ../sapinover-scaffold/task-3-waitlist-widget/components/WaitlistProof.tsx components/

# 2. Add to homepage below hero CTA
# Import and use: <WaitlistProof />

# 3. Test animation
npm run dev

# 4. Commit
git commit -am "[SAPINOVER] Task 3: Waitlist social proof widget"
```

### Phase 4-10: Rapid Integration

Follow similar pattern for remaining tasks. Each task folder contains:
- `README.md` with specific instructions
- All necessary files
- Environment variable requirements

## Environment Variables Checklist

Create `.env.local` with:

```bash
# Task 2 - Live Ticker
NEXT_PUBLIC_FINNHUB_API_KEY=

# Task 3 & 7 - Database
DATABASE_URL=
SUPABASE_ANON_KEY=
# OR
VERCEL_KV_URL=
VERCEL_KV_REST_API_TOKEN=

# Task 7 - Email Alerts
RESEND_API_KEY=

# Task 10 - Geopolitical (optional)
GDELT_API_KEY=
```

## Testing Checklist

After integration:

- [ ] All pages load without errors
- [ ] TypeScript compiles: `npm run build`
- [ ] Lighthouse score >90 on desktop
- [ ] Mobile responsive (375px, 430px, 768px)
- [ ] WebSocket connects in ticker
- [ ] RSS feed accessible
- [ ] OG images generate

## Deployment

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
# OR manually:
vercel --prod
```

## Rollback Plan

Each task is a separate commit. To rollback:

```bash
git revert HEAD  # Reverts last commit
# Or revert specific task:
git revert <commit-hash>
```

## Support

All code is documented with inline comments. Each component includes:
- TypeScript types
- Error handling
- Loading states
- Mobile responsive CSS

For questions, check task-specific README files in scaffold folders.
