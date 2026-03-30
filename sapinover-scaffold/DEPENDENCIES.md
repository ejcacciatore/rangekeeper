# Dependencies Required

## Install All at Once

```bash
npm install next-mdx-remote gray-matter reading-time
```

## Individual Package Details

### Task 1 — Research Blog
- **next-mdx-remote** (^4.4.1) - MDX rendering without webpack configuration
- **gray-matter** (^4.0.3) - Parse frontmatter from MDX files
- **reading-time** (^1.5.0) - Calculate reading time estimates

### Task 2 — Live Ticker
No additional dependencies (uses native WebSocket API)

### Task 3 — Waitlist Widget
No additional dependencies (React only)

### Task 4 — Brief Teaser
No additional dependencies (React only)

### Task 5 — Score Delta
No additional dependencies (uses Canvas API)

### Task 6 — Mobile Responsive
No additional dependencies (CSS only)

### Task 7 — Alert System
**Optional (based on chosen stack):**
- **@supabase/supabase-js** (^2.38.0) - If using Supabase
- **@vercel/kv** (^1.0.0) - If using Vercel KV
- **resend** (^3.0.0) - Email delivery (recommended)

### Task 8 — SEO & Metadata
No additional dependencies (Next.js built-in)

### Task 9 — Radiant Shaders
No additional dependencies (custom WebGL implementation, no radiant-shaders package needed)

### Task 10 — Geopolitical Layer
No additional dependencies (iframe embed + fetch API)

## Full package.json Addition

Add to your existing `package.json`:

```json
{
  "dependencies": {
    "next-mdx-remote": "^4.4.1",
    "gray-matter": "^4.0.3",
    "reading-time": "^1.5.0"
  }
}
```

**Optional (if implementing Task 7 with Supabase + Resend):**

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "resend": "^3.0.0"
  }
}
```

## DevDependencies

Ensure you have TypeScript types:

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

## Install Command

```bash
# Core dependencies (required)
npm install next-mdx-remote gray-matter reading-time

# Optional (Task 7 - Alerts)
npm install @supabase/supabase-js resend

# Or if using Vercel KV instead:
npm install @vercel/kv resend
```

## Notes

- All code is written for **Next.js 14+ App Router**
- TypeScript strict mode compatible
- No CSS framework dependencies (uses Tailwind which should already be installed)
- WebGL shader (Task 9) has zero dependencies, implemented in pure WebGL
