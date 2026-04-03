# SAPINOVER — GIT COMMIT PLAN

Once repository access is granted, I will make the following commits in sequence:

## Commit 1: [SAPINOVER] Task 1.a: Research blog page and routing
```bash
git add app/research/page.tsx app/research/[slug]/page.tsx
git commit -m "[SAPINOVER] Task 1.a: Research blog page and routing"
```

## Commit 2: [SAPINOVER] Task 1.b: MDX content infrastructure
```bash
git add lib/research.ts content/
git commit -m "[SAPINOVER] Task 1.b: MDX content infrastructure and utilities"
```

## Commit 3: [SAPINOVER] Task 1.c: Seed research articles
```bash
git add content/understanding-ats-volume.mdx content/geopolitical-risk-score.mdx content/24-hour-market.mdx
git commit -m "[SAPINOVER] Task 1.c: 3 seed research articles (ATS, GEO, 24h market)"
```

## Commit 4: [SAPINOVER] Task 1.d: RSS feed
```bash
git add app/research/feed.xml/route.ts
git commit -m "[SAPINOVER] Task 1.d: Auto-generated RSS feed"
```

## Commit 5: [SAPINOVER] Task 1.e-f: OG images and structured data
```bash
git add app/research/og/route.tsx
git commit -m "[SAPINOVER] Task 1.e-f: Dynamic OG images and JSON-LD structured data"
```

## Commit 6: [SAPINOVER] Task 2: Live ticker with Finnhub WebSocket
```bash
git add components/LiveTicker.tsx hooks/useFinnhub.ts
git commit -m "[SAPINOVER] Task 2: Live ticker with Finnhub WebSocket and exponential backoff"
```

## Commit 7: [SAPINOVER] Task 3: Waitlist social proof widget
```bash
git add components/WaitlistProof.tsx
git commit -m "[SAPINOVER] Task 3: Waitlist social proof with animated count and recent joins"
```

## Commit 8: [SAPINOVER] Task 4: Public brief teaser system
```bash
git add components/BriefTeaser.tsx app/daily-brief/[date]/[session]/
git commit -m "[SAPINOVER] Task 4: Public brief teaser with blur overlay and share URLs"
```

## Commit 9: [SAPINOVER] Task 5: Composite score delta indicators
```bash
git add components/ScoreDelta.tsx
git commit -m "[SAPINOVER] Task 5: Composite score deltas with sparklines and tooltips"
```

## Commit 10: [SAPINOVER] Task 6: Mobile responsive improvements
```bash
git add [modified components with responsive CSS]
git commit -m "[SAPINOVER] Task 6: Mobile responsive audit and fixes (375px, 430px, 768px)"
```

## Commit 11: [SAPINOVER] Task 7: Email alert system
```bash
git add components/AlertOptIn.tsx app/api/alerts/ app/api/cron/
git commit -m "[SAPINOVER] Task 7: Email alert system with Resend and Vercel Cron"
```

## Commit 12: [SAPINOVER] Task 8: SEO and metadata complete pass
```bash
git add app/sitemap.ts public/robots.txt [metadata updates]
git commit -m "[SAPINOVER] Task 8: SEO metadata, sitemap, robots.txt, structured data"
```

## Commit 13: [SAPINOVER] Task 9: Radiant shader hero background
```bash
git add components/HeroShader.tsx
git commit -m "[SAPINOVER] Task 9: WebGL shader hero background with graceful fallback"
```

## Commit 14: [SAPINOVER] Task 10: Geopolitical intelligence layer
```bash
git add components/GeopoliticalLayer.tsx
git commit -m "[SAPINOVER] Task 10: Geopolitical layer with LiveUAmap and GDELT feed"
```

## Final Commit: [SAPINOVER] Documentation and dependencies
```bash
git add package.json package-lock.json README.md
git commit -m "[SAPINOVER] Documentation and dependency updates for 10-task work order"
```

---

## Branch Strategy

**Option A — Feature Branch (Recommended):**
```bash
git checkout -b feature/10-task-workorder
[make all commits above]
git push origin feature/10-task-workorder
# Create PR for Rico to review
# Merge to main after approval
```

**Option B — Direct to Main (if Rico trusts implicitly):**
```bash
git checkout main
[make all commits above]
git push origin main
# Vercel auto-deploys
```

---

## Rollback Plan

Each task is a separate commit. To rollback a specific task:

```bash
# Revert Task 5 (for example)
git revert <commit-hash-of-task-5>
git push origin main
```

To rollback everything:
```bash
git revert HEAD~14..HEAD
git push origin main
```

---

## Total Commits: 15

All commits follow format: `[SAPINOVER] Task X.x: description`

This makes it easy to:
- Track progress
- Review changes
- Rollback individual features
- Generate changelog
