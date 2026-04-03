# RangeKeeper — System Architecture

> AI-powered executive function assistant for ASD/ADHD college students.
> Designed around one core truth: **the student will not come to us — we go to them.**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Component Diagram](#component-diagram)
3. [Tech Stack Decisions](#tech-stack-decisions)
4. [Data Flow](#data-flow)
5. [Integration Architecture](#integration-architecture)
6. [AI Pipeline](#ai-pipeline)
7. [Notification System](#notification-system)
8. [Security & Privacy](#security--privacy)
9. [Scalability Considerations](#scalability-considerations)

---

## System Overview

RangeKeeper is a push-first, AI-driven executive function scaffold. It connects to students' existing academic systems (LMS, calendar, email), automatically ingests their obligations, and proactively delivers a sequenced daily plan with smart nudges — no manual entry required.

### Core Principles Encoded in the Architecture

| Principle | Architectural Decision |
|-----------|----------------------|
| Zero manual entry | LMS OAuth + bi-directional sync via REST APIs |
| Push-first | BullMQ scheduled jobs for daily plan delivery + escalating nudges |
| Reduced cognitive load | Server-side plan generation; client just renders, doesn't compute |
| Graceful degradation | Manual assignment entry as fallback when LMS sync fails |
| Predictable structure | Deterministic daily plan generation at the same time each night |

---

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  ┌──────────┐ │
│  │  Canvas LMS  │  │  Blackboard  │  │Google Classroom│  │  Gmail   │ │
│  │  REST API    │  │  REST API    │  │     API        │  │   API    │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘  └────┬─────┘ │
│         └─────────────────┴──────────────────┴────────────────┘        │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ OAuth 2.0 + REST
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         RANGEKEEPER BACKEND                             │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js 14 App (App Router)                   │   │
│  │                                                                  │   │
│  │   ┌─────────────────┐         ┌──────────────────────────────┐  │   │
│  │   │   Frontend PWA   │         │       API Routes             │  │   │
│  │   │                 │         │  /api/auth/*                 │  │   │
│  │   │  Dashboard       │         │  /api/student/*              │  │   │
│  │   │  Daily Plan View │◄───────►│  /api/courses/*              │  │   │
│  │   │  Assignment List │         │  /api/daily-plan/*           │  │   │
│  │   │  Settings        │         │  /api/micro-tasks/*          │  │   │
│  │   │  Parent View     │         │  /api/nudges/*               │  │   │
│  │   │                 │         │  /api/parent/*               │  │   │
│  │   └─────────────────┘         │  /api/webhooks/*             │  │   │
│  │                               └──────────────┬───────────────┘  │   │
│  └──────────────────────────────────────────────┼───────────────────┘  │
│                                                  │                      │
│  ┌───────────────────────────────────────────────┼───────────────────┐  │
│  │                    Service Layer              │                   │  │
│  │                                               ▼                   │  │
│  │  ┌─────────────────┐  ┌──────────────────────────────────────┐   │  │
│  │  │   Prisma ORM    │  │           Business Services          │   │  │
│  │  │   PostgreSQL    │  │                                      │   │  │
│  │  │                 │  │  LMSService      — sync assignments  │   │  │
│  │  │  Users          │  │  CalendarService — sync events       │   │  │
│  │  │  StudentProfile │  │  AIService       — decompose/plan    │   │  │
│  │  │  Courses        │  │  PlanService     — build daily plan  │   │  │
│  │  │  Assignments    │  │  NudgeService    — schedule nudges   │   │  │
│  │  │  MicroTasks     │  │  NotifyService   — SMS/push delivery │   │  │
│  │  │  DailyPlan      │  │                                      │   │  │
│  │  │  TimeBlocks     │  └──────────────────────────────────────┘   │  │
│  │  │  Nudges         │                                              │  │
│  │  │  CompletionLog  │  ┌──────────────────────────────────────┐   │  │
│  │  │  ParentLinks    │  │         BullMQ Job Queues            │   │  │
│  │  │  LMSConnection  │  │                                      │   │  │
│  │  │  CalConnection  │  │  lms-sync       (every 4h)           │   │  │
│  │  └─────────────────┘  │  plan-generator (nightly at 11pm)    │   │  │
│  │                        │  nudge-scheduler(after plan gen)    │   │  │
│  │                        │  nudge-sender   (real-time)         │   │  │
│  │                        │  win-processor  (on completion)     │   │  │
│  │                        └────────────────────┬─────────────────┘  │  │
│  └─────────────────────────────────────────────┼───────────────────┘  │
│                                                  │                      │
└──────────────────────────────────────────────────┼──────────────────────┘
                                                   │
         ┌─────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────┐
│              INFRASTRUCTURE LAYER                  │
│                                                    │
│  ┌─────────────────┐    ┌──────────────────────┐   │
│  │   Redis (BullMQ)│    │  OpenAI API (GPT-4o) │   │
│  │   - Job queues  │    │  - Task decomposition │   │
│  │   - Rate limit  │    │  - Daily planning     │   │
│  │   - Cache layer │    │  - Nudge generation   │   │
│  └─────────────────┘    │  - Urgency scoring   │   │
│                         └──────────────────────┘   │
│  ┌─────────────────┐    ┌──────────────────────┐   │
│  │  Twilio         │    │  Google Calendar API │   │
│  │  - SMS delivery │    │  - Read events       │   │
│  │  - Nudge msgs   │    │  - Block focus time  │   │
│  └─────────────────┘    └──────────────────────┘   │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│                  CLIENT SURFACES                   │
│                                                    │
│  ┌────────────────────┐  ┌──────────────────────┐  │
│  │  Web PWA (Next.js) │  │  SMS (Twilio)        │  │
│  │  - Daily plan view │  │  - Daily plan digest  │  │
│  │  - Mark complete   │  │  - Nudges & reminders │  │
│  │  - Settings        │  │  - Win confirmations  │  │
│  └────────────────────┘  └──────────────────────┘  │
│  ┌────────────────────┐  ┌──────────────────────┐  │
│  │  Parent Dashboard  │  │  Push Notifications   │  │
│  │  - Read-only view  │  │  - Web push (PWA)    │  │
│  │  - Progress alerts │  │  - Escalation nudges  │  │
│  └────────────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## Tech Stack Decisions

### Frontend: Next.js 14+ (App Router) + Tailwind CSS + shadcn/ui

**Why Next.js 14 App Router:**
- Server Components reduce client JS bundle (critical for cognitive load — fast loads, no spinners)
- Built-in API routes eliminate need for a separate Express server in early stages
- ISR and streaming for dashboard data without full-page refreshes
- PWA support via `next-pwa` — one codebase for web + installable mobile

**Why Tailwind + shadcn/ui:**
- Consistent, accessible component library (a11y matters deeply for ASD users)
- Design tokens for sensory-sensitive color palettes (muted colors, high contrast options)
- shadcn/ui components are unstyled by default — we own the visual identity
- Rapid iteration without custom CSS fights

**PWA over React Native (for v1):**
- Single codebase, no App Store review cycles
- Push notifications via Web Push API (works on modern iOS/Android)
- Students already have browsers; no install friction
- Can always add React Native Expo in v2 if native sensors needed

### Backend: Next.js API Routes → Fastify Microservice (future)

**v1: Next.js API Routes**
- Reduces infrastructure surface area
- Prisma works perfectly in serverless API routes
- Can extract to standalone Fastify service when scale demands it

**v2 target: Fastify**
- 3x throughput vs Express for high-volume nudge processing
- Schema-based validation with Zod
- Plugin system for LMS connectors

### Database: PostgreSQL + Prisma ORM

**Why PostgreSQL:**
- JSONB columns for LMS metadata without schema migrations for every new field
- Full-text search for assignment lookup
- Row-level security for multi-tenant parent/student relationships
- Reliable ACID transactions for completion logging

**Why Prisma:**
- Type-safe queries — no raw SQL errors in production
- Migration system for schema evolution
- Excellent Next.js integration
- Prisma Studio for debugging data during development

### AI: OpenAI GPT-4o

**Why GPT-4o over GPT-4 Turbo:**
- Lower latency for nudge generation (sub-2s)
- Multimodal: future feature — student photos syllabi, model extracts assignments
- Cost-effective for high-volume micro-task decomposition

**AI Tasks:**
1. `task-decomposer` — Convert assignment description → ordered micro-steps with time estimates
2. `daily-planner` — Optimize task sequence considering energy, transitions, ASD pacing
3. `nudge-generator` — Write specific, encouraging, non-generic push messages
4. `urgency-scorer` — Weighted urgency score (not just "due tomorrow = urgent")

### Queue: BullMQ + Redis

**Why BullMQ:**
- Delayed jobs (schedule nudge for 2pm Thursday)
- Cron-style recurring jobs (nightly plan generation)
- Job priorities (urgent nudge escalation beats routine sync)
- Dead letter queues for failed LMS syncs
- Bull Board UI for operational visibility

**Critical Job Queues:**
| Queue | Schedule | Description |
|-------|----------|-------------|
| `lms-sync` | Every 4 hours | Pull assignments from LMS APIs |
| `plan-generator` | 10:30 PM daily | Generate next day's plan for all active students |
| `nudge-scheduler` | After plan gen | Schedule individual nudge jobs for next day |
| `nudge-sender` | Real-time | Fire individual nudge jobs |
| `win-processor` | On-completion event | Calculate streaks, trigger celebration |
| `urgency-recalculator` | Every 6 hours | Re-score all open tasks as deadlines approach |

### Auth: Clerk

**Why Clerk over NextAuth.js:**
- Built-in OAuth for Google (needed for Calendar/Gmail), with token refresh handling
- User management UI out of the box (reduces custom code)
- Webhooks for user lifecycle events (student signs up → trigger LMS linking flow)
- Can still use NextAuth.js for LMS OAuth (Canvas, Blackboard) as secondary OAuth clients
- COPPA/FERPA compliance features for student data

**OAuth Flow — LMS:**
Canvas, Blackboard, and Google Classroom use separate OAuth 2.0 flows from the main auth. LMS tokens are stored encrypted in `LMSConnection` table and refreshed by the `lms-sync` job.

### Notifications: Twilio SMS + Web Push

**Why SMS as primary:**
- ASD students may have notification fatigue with app badges
- SMS is intrusive enough to cut through — and the student doesn't have to open the app
- Twilio Verify for phone number confirmation
- Two-way SMS: student replies "done" or "snooze 30" → webhook processes it

**Web Push as secondary:**
- Works on Android + iOS 16.4+ as PWA
- Lower friction for in-session nudges
- Falls back to SMS if push isn't granted

---

## Data Flow

### Assignment Ingestion Flow

```
[LMS API] ──4h poll──► [lms-sync job]
                              │
                              ▼
                    Fetch courses + assignments
                              │
                              ▼
                    Upsert to Assignments table
                    (detect new/modified)
                              │
                    New/modified assignment?
                              │ Yes
                              ▼
                    Queue: task-decomposer AI job
                              │
                              ▼
                    GPT-4o: assignment → MicroTasks[]
                              │
                              ▼
                    Store MicroTasks in DB
                              │
                              ▼
                    Update urgency scores (urgency-scorer)
                              │
                              ▼
                    Flag for next plan generation
```

### Daily Plan Generation Flow

```
[10:30 PM Cron] ──► [plan-generator job]
                              │
                              ▼
                    For each active student:
                    Fetch all pending MicroTasks
                    Fetch tomorrow's calendar events
                    Fetch student preferences (energy peaks, etc.)
                              │
                              ▼
                    GPT-4o: daily-planner prompt
                    → Ordered TimeBlocks with start times
                              │
                              ▼
                    Store DailyPlan + TimeBlocks in DB
                              │
                              ▼
                    Queue nudge jobs for the day
                    (morning wake-up, task start, transitions)
                              │
                              ▼
                    Send "Game Plan Ready" notification
                    (SMS + push at 7 AM next day)
```

### Nudge Escalation Flow

```
[Scheduled nudge job fires]
        │
        ▼
Task still incomplete?
        │ Yes
        ▼
Level 1: Gentle reminder ("Hey — your 20-min Canvas reading starts in 5 min")
        │ No response in 15 min
        ▼
Level 2: Specific start instruction ("Open Canvas → Week 4 Module → click Reading 2")
        │ No response in 20 min
        ▼
Level 3: Reframe + action ("This is just 3 pages. You've done harder. Just open it.")
        │ No response in 30 min
        ▼
Level 4 (if parent linked + opted in): Alert parent dashboard
```

---

## Integration Architecture

### Canvas LMS

```
Auth: OAuth 2.0 (Authorization Code flow)
Base URL: https://{school}.instructure.com/api/v1/

Endpoints used:
  GET /courses                     → Active enrolled courses
  GET /courses/:id/assignments     → All assignments + due dates + weights
  GET /courses/:id/modules         → Module structure (helps with decomposition)
  GET /courses/:id/discussion_topics → Discussion posts as assignments
  GET /calendar_events             → Canvas calendar items
  GET /users/self/todo             → Canvas to-do list

Webhook support: Canvas has no native webhooks for assignment changes.
  → Solution: Poll every 4 hours, diff against stored state, trigger on changes.
  → Future: Canvas Data 2 (streaming events) for enterprise school partnerships.
```

### Blackboard Learn

```
Auth: OAuth 2.0 (3-legged, requires institutional registration)
Base URL: https://{school}.blackboard.com/learn/api/public/v3/

Endpoints used:
  GET /courses                     → Enrolled courses
  GET /courses/:courseId/contents  → Course content tree (assignments within)
  GET /courses/:courseId/gradebook/columns → Gradeable items
  GET /courses/:courseId/gradebook/columns/:id → Assignment details + due date
  GET /calendar/items              → Calendar items

Limitation: Blackboard REST API availability depends on institutional license tier.
  → Fallback: LTI-based deep linking or manual entry mode.
```

### Google Classroom

```
Auth: Google OAuth 2.0 (same token flow as Calendar/Gmail)
Scopes: 
  - https://www.googleapis.com/auth/classroom.courses.readonly
  - https://www.googleapis.com/auth/classroom.coursework.me.readonly
  - https://www.googleapis.com/auth/classroom.student-submissions.me.readonly

Endpoints used:
  GET /v1/courses                                    → Active courses
  GET /v1/courses/:courseId/courseWork               → Assignments + due dates
  GET /v1/courses/:courseId/courseWork/:id/studentSubmissions → Submission status

Webhook support: Google Classroom supports Push Notifications via Cloud Pub/Sub.
  → Register a watch on courseWork changes.
  → RangeKeeper receives webhook → immediately processes new assignments.
  → This is the most real-time integration of the three.
```

### Google Calendar

```
Auth: Shares token with Google Classroom OAuth
Scopes:
  - https://www.googleapis.com/auth/calendar.readonly
  - https://www.googleapis.com/auth/calendar.events (for blocking focus time)

Usage:
  - Read existing events to avoid scheduling conflicts in daily plan
  - Optional: write "Focus Block" events to student's calendar
  - Read exam dates, class times for plan constraints
```

---

## AI Pipeline

All AI calls are wrapped in the `AIService` class with:
- Retry logic (3 attempts with exponential backoff)
- Token budgeting per student per day (prevent runaway costs)
- Response validation + graceful fallback (if AI fails, use rule-based fallback)
- Prompt versioning (track which prompt version generated each plan)

### Prompt Strategy

```
task-decomposer:
  Input:  Assignment title, description, due date, course context, student profile
  Output: JSON array of MicroTask objects with sequence, duration, type
  Model:  gpt-4o
  Temp:   0.3 (consistent decomposition)

daily-planner:
  Input:  All pending MicroTasks, calendar events, student prefs, date/time
  Output: Ordered TimeBlock sequence with start times and transition buffers
  Model:  gpt-4o
  Temp:   0.4 (some creativity in scheduling)

nudge-generator:
  Input:  MicroTask details, student name, time context, escalation level
  Output: Short personalized SMS/push message
  Model:  gpt-4o-mini (cost optimization for high volume)
  Temp:   0.7 (varied language to avoid repetition fatigue)

urgency-scorer:
  Input:  Assignment due date, estimated total effort, MicroTasks remaining, dependencies
  Output: Urgency score 0-100 + reasoning
  Model:  gpt-4o (with structured outputs / JSON mode)
  Temp:   0.1 (deterministic scoring)
```

---

## Notification System

### Delivery Priority

1. **SMS** (Twilio) — Primary for nudges. Interrupts. Gets through.
2. **Web Push** — For in-app notifications, low-urgency reminders
3. **Email** — Only for daily plan digest (parent) and account-level alerts

### Two-Way SMS

Student responses are handled via Twilio SMS webhooks:
- "done" → mark current task complete, trigger win celebration, advance plan
- "skip" → defer current task, advance to next
- "snooze 30" → reschedule nudge +30 minutes
- "help" → send today's full plan again
- "stop" → pause notifications (respect immediately — critical for ASD/anxiety)

### Notification Timing Logic

```typescript
// Plan delivery: 7:00 AM student timezone
// Task nudges: 5 min before scheduled start
// Transition nudges: 2 min before end of current block
// Urgency escalation: when task is 25%/50%/75%/100% overdue
// Celebration: immediate on completion
// Evening check-in: 8:00 PM — summary of day's wins
```

---

## Security & Privacy

### Student Data (FERPA Considerations)

- LMS OAuth tokens encrypted at rest (AES-256) in `LMSConnection.encryptedAccessToken`
- Google OAuth tokens similarly encrypted in `CalendarConnection`
- Student academic data never sold, shared with third parties
- Parent access requires explicit student opt-in (not parent opt-in)
- Data retention: raw LMS data purged after 90 days; plans and logs retained 1 year

### Parent Dashboard Access

- Parent links stored in `ParentLink` table with explicit permission levels
- Student can revoke parent access at any time
- Parent sees: today's plan (no grades), completion streaks, general progress
- Parent does NOT see: assignment grades, course content, chat history

### API Security

- All routes protected by Clerk auth middleware
- Rate limiting via Redis + `@upstash/ratelimit`
- Webhook endpoints verified by signature (Canvas HMAC, Twilio signature, Google token)
- HTTPS only; HSTS enforced

---

## Scalability Considerations

### v1 (0–1,000 students)
- Single Next.js deployment on Vercel or Railway
- Single PostgreSQL instance (Railway or Supabase)
- Redis via Upstash (serverless, no management)
- BullMQ workers co-located with Next.js on a single VPS (Railway)

### v2 (1,000–50,000 students)
- Extract BullMQ workers to separate Node.js service
- PostgreSQL read replicas for dashboard queries
- Redis Cluster for queue throughput
- CDN for static assets (Vercel edge network)
- Per-school LMS connection pooling

### v3 (50,000+ students)
- Event-driven microservices (NestJS or Fastify)
- CQRS pattern for plan read vs. write paths
- Message broker (Kafka) replacing BullMQ for inter-service communication
- Multi-region deployment for timezone distribution
