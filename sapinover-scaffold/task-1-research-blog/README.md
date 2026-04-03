# TASK 1 — RESEARCH BLOG INFRASTRUCTURE

**Priority:** CRITICAL — Launches April 1, 2026

## Implementation Overview

This task creates a full MDX-powered research blog with:
- Article listing page at `/research`
- Individual article pages at `/research/[slug]`
- 3 seed articles on ATS volume, geopolitical risk, and 24-hour markets
- RSS feed at `/research/feed.xml`
- JSON-LD structured data for each article
- OG image generation using Next.js ImageResponse

## Files to Copy

```
app/research/
  ├── page.tsx                    # Research blog listing page
  ├── [slug]/
  │   └── page.tsx               # Individual article page
  ├── feed.xml/
  │   └── route.ts               # RSS feed generator
  └── og/
      └── route.tsx              # OG image generator

content/research/
  ├── understanding-ats-volume.mdx
  ├── geopolitical-risk-score.mdx
  └── 24-hour-market.mdx

lib/
  ├── mdx.ts                     # MDX utilities
  └── research.ts                # Research article utilities
```

## Dependencies to Install

```bash
npm install next-mdx-remote gray-matter reading-time
npm install -D @types/mdx
```

## Integration Steps

1. Copy all files to your project
2. Install dependencies
3. Add to `next.config.js`:
   ```js
   const nextConfig = {
     // ... existing config
     pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
   }
   ```
4. Test locally: visit `/research`
5. Commit: `[SAPINOVER] Task 1: Research blog infrastructure`

## SEO & Metadata

Each article includes:
- Title, description, author, publishedAt
- JSON-LD Article schema
- OG images generated dynamically
- Reading time estimate
- RSS feed entry

## Customization

Update the brand color in `app/research/og/route.tsx`:
```tsx
const BRAND_GREEN = '#00FF41'; // Already set
```
