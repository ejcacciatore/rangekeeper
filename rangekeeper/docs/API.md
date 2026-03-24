# RangeKeeper API Specification

> RESTful API — All endpoints are under `/api/v1/`
> Authentication: Bearer token (Clerk JWT) on all routes unless noted.
> Content-Type: `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Student Profile](#2-student-profile)
3. [Courses & Assignment Sync](#3-courses--assignment-sync)
4. [Daily Plan](#4-daily-plan)
5. [Micro-Tasks](#5-micro-tasks)
6. [Nudges](#6-nudges)
7. [Parent / Coach](#7-parent--coach)
8. [Webhooks](#8-webhooks)
9. [Error Responses](#9-error-responses)

---

## 1. Authentication

### 1.1 Register

```
POST /api/v1/auth/register
Authorization: none
```

Creates a new user account. Clerk handles the actual auth; this endpoint creates the RangeKeeper user record and kicks off onboarding.

**Request:**
```json
{
  "clerkId": "user_abc123",
  "email": "student@umich.edu",
  "name": "Alex Chen",
  "role": "STUDENT"
}
```

**Response 201:**
```json
{
  "user": {
    "id": "clj1234abc",
    "email": "student@umich.edu",
    "name": "Alex Chen",
    "role": "STUDENT",
    "createdAt": "2026-03-18T10:00:00Z"
  },
  "onboardingUrl": "/onboarding/step-1"
}
```

---

### 1.2 LMS OAuth — Initiate

```
GET /api/v1/auth/lms/connect/:lmsType
Authorization: Bearer <token>
```

Initiates OAuth flow for LMS connection.

**Path params:**
- `lmsType`: `canvas` | `blackboard` | `google_classroom`

**Query params:**
- `schoolDomain`: `umich.instructure.com` (required for Canvas/Blackboard)

**Response 302:** Redirect to LMS OAuth authorization URL

---

### 1.3 LMS OAuth — Callback

```
GET /api/v1/auth/lms/callback/:lmsType
Authorization: none (OAuth state validated)
```

Handles OAuth callback. Stores encrypted tokens, triggers first sync.

**Query params:**
- `code`: OAuth authorization code
- `state`: CSRF state token

**Response 302:** Redirect to `/dashboard?lms=connected`

---

### 1.4 Google OAuth — Initiate

```
GET /api/v1/auth/google/connect
Authorization: Bearer <token>
```

Initiates Google OAuth for Calendar + (optionally) Classroom scope.

**Query params:**
- `scopes`: comma-separated `calendar,gmail,classroom`

**Response 302:** Redirect to Google OAuth

---

### 1.5 Google OAuth — Callback

```
GET /api/v1/auth/google/callback
Authorization: none
```

**Response 302:** Redirect to `/settings?google=connected`

---

### 1.6 Disconnect LMS

```
DELETE /api/v1/auth/lms/:connectionId
Authorization: Bearer <token>
```

Revokes tokens and deactivates LMS connection.

**Response 200:**
```json
{ "success": true, "message": "LMS connection removed." }
```

---

## 2. Student Profile

### 2.1 Get My Profile

```
GET /api/v1/student/profile
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "profile": {
    "id": "prof_abc",
    "school": "University of Michigan",
    "timezone": "America/Detroit",
    "wakeUpTime": "08:00",
    "sleepTime": "23:30",
    "planDeliveryTime": "07:00",
    "peakEnergyBlocks": ["09:00-11:00", "14:00-16:00"],
    "maxDeepWorkMinutes": 45,
    "preferredBreakMinutes": 10,
    "transitionBufferMin": 5,
    "taskInitiationSupport": true,
    "transitionWarnings": true,
    "celebrationStyle": "emoji",
    "onboardingCompleted": true
  }
}
```

---

### 2.2 Update Profile

```
PATCH /api/v1/student/profile
Authorization: Bearer <token>
```

**Request (partial update — all fields optional):**
```json
{
  "wakeUpTime": "07:30",
  "maxDeepWorkMinutes": 30,
  "peakEnergyBlocks": ["10:00-12:00", "15:00-17:00"],
  "transitionBufferMin": 10,
  "celebrationStyle": "verbose"
}
```

**Response 200:**
```json
{
  "profile": { "...updated fields..." },
  "planWillRegenerate": true
}
```

**Note:** If scheduling-relevant fields change, tomorrow's plan is flagged for regeneration.

---

### 2.3 Get Notification Preferences

```
GET /api/v1/student/notifications
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "prefs": {
    "smsEnabled": true,
    "pushEnabled": true,
    "nudgesEnabled": true,
    "maxNudgesPerDay": 8,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00",
    "morningPlanEnabled": true,
    "winCelebrations": true
  }
}
```

---

### 2.4 Update Notification Preferences

```
PATCH /api/v1/student/notifications
Authorization: Bearer <token>
```

**Request:**
```json
{
  "nudgesEnabled": true,
  "maxNudgesPerDay": 6,
  "quietHoursStart": "21:00"
}
```

**Response 200:** Updated prefs object

---

### 2.5 Get Progress Summary

```
GET /api/v1/student/progress
Authorization: Bearer <token>
```

**Query params:**
- `days`: integer, default 7

**Response 200:**
```json
{
  "summary": {
    "currentDayStreak": 5,
    "currentWeekStreak": 2,
    "tasksCompletedThisWeek": 23,
    "tasksCompletedToday": 3,
    "onTimeRate": 0.87,
    "mostProductiveTime": "10:00-11:00",
    "recentWins": [
      {
        "id": "log_abc",
        "title": "Finished Psych 201 reading",
        "completedAt": "2026-03-18T10:45:00Z",
        "courseName": "Intro to Psychology"
      }
    ]
  }
}
```

---

## 3. Courses & Assignment Sync

### 3.1 List Courses

```
GET /api/v1/courses
Authorization: Bearer <token>
```

**Query params:**
- `activeOnly`: boolean, default true

**Response 200:**
```json
{
  "courses": [
    {
      "id": "course_abc",
      "name": "Introduction to Psychology",
      "code": "PSYCH 201",
      "instructor": "Dr. Sarah Park",
      "term": "Spring 2026",
      "color": "#6366f1",
      "lmsType": "CANVAS",
      "assignmentCount": 8,
      "pendingCount": 5
    }
  ]
}
```

---

### 3.2 Trigger LMS Sync

```
POST /api/v1/courses/sync
Authorization: Bearer <token>
```

Manually triggers LMS sync (rate limited: once per 30 minutes).

**Request:**
```json
{
  "lmsConnectionId": "conn_abc"  // optional — syncs all if omitted
}
```

**Response 202:**
```json
{
  "jobId": "sync_job_xyz",
  "message": "Sync started. New assignments will appear within 2 minutes.",
  "nextAutoSync": "2026-03-18T16:00:00Z"
}
```

---

### 3.3 Get Sync Status

```
GET /api/v1/courses/sync/status
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "connections": [
    {
      "id": "conn_abc",
      "lmsType": "CANVAS",
      "schoolDomain": "umich.instructure.com",
      "syncStatus": "SUCCESS",
      "lastSyncAt": "2026-03-18T12:00:00Z",
      "coursesFound": 4,
      "assignmentsFound": 23,
      "newAssignmentsFound": 2
    }
  ]
}
```

---

### 3.4 Get Assignments

```
GET /api/v1/assignments
Authorization: Bearer <token>
```

**Query params:**
- `courseId`: filter by course
- `status`: `pending` | `submitted` | `all` (default: pending)
- `dueBefore`: ISO date string
- `includeDecomposed`: boolean, default true
- `sortBy`: `dueDate` | `urgency` (default: urgency)
- `limit`: integer, default 20
- `offset`: integer, default 0

**Response 200:**
```json
{
  "assignments": [
    {
      "id": "assign_abc",
      "courseId": "course_abc",
      "courseName": "Intro to Psychology",
      "title": "Midterm Essay: Cognitive Bias Analysis",
      "type": "ESSAY",
      "dueDate": "2026-03-25T23:59:00Z",
      "estimatedTotalMinutes": 240,
      "urgencyScore": 78.5,
      "isDecomposed": true,
      "microTaskCount": 6,
      "microTasksComplete": 1,
      "lmsUrl": "https://umich.instructure.com/courses/123/assignments/456"
    }
  ],
  "total": 8,
  "limit": 20,
  "offset": 0
}
```

---

### 3.5 Get Single Assignment

```
GET /api/v1/assignments/:assignmentId
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "assignment": {
    "id": "assign_abc",
    "title": "Midterm Essay: Cognitive Bias Analysis",
    "description": "Write a 1500-word essay analyzing three cognitive biases...",
    "type": "ESSAY",
    "dueDate": "2026-03-25T23:59:00Z",
    "pointsPossible": 100,
    "weight": 20,
    "estimatedTotalMinutes": 240,
    "urgencyScore": 78.5,
    "isDecomposed": true,
    "microTasks": [ "...see micro-tasks response..." ]
  }
}
```

---

### 3.6 Create Manual Assignment

```
POST /api/v1/assignments
Authorization: Bearer <token>
```

For when LMS sync misses something or student has non-LMS obligations.

**Request:**
```json
{
  "courseId": "course_abc",
  "title": "Study for Organic Chemistry lab practical",
  "type": "EXAM",
  "dueDate": "2026-03-22T14:00:00Z",
  "description": "Cover chapters 8-12, focus on lab safety and reaction mechanisms",
  "estimatedTotalMinutes": 180
}
```

**Response 201:** Created assignment + auto-queued for decomposition

---

## 4. Daily Plan

### 4.1 Get Today's Plan

```
GET /api/v1/daily-plan/today
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "plan": {
    "id": "plan_abc",
    "planDate": "2026-03-18",
    "morningMessage": "Hey Alex — you've got 3 things today. Nothing overwhelming. Here's the sequence:",
    "timeBlocks": [
      {
        "id": "block_001",
        "sequence": 1,
        "blockType": "DEEP_WORK",
        "title": "Psych 201 Reading — Chapter 4",
        "description": "Read pages 78-94 and take notes on the 3 cognitive bias types",
        "startInstruction": "Open Canvas → PSYCH 201 → Week 4 → Reading 2",
        "startTime": "09:00",
        "durationMinutes": 40,
        "isComplete": false,
        "courseColor": "#6366f1",
        "microTaskId": "mtask_xyz"
      },
      {
        "id": "block_002",
        "sequence": 2,
        "blockType": "BREAK",
        "title": "Break",
        "startTime": "09:40",
        "durationMinutes": 10,
        "isComplete": false
      },
      {
        "id": "block_003",
        "sequence": 3,
        "blockType": "TRANSITION",
        "title": "Transition — get set up for essay outline",
        "description": "Open Google Docs, create new doc titled 'Midterm Essay Draft'",
        "startTime": "09:50",
        "durationMinutes": 5,
        "isComplete": false
      }
    ],
    "stats": {
      "totalWorkMinutes": 105,
      "totalBreakMinutes": 20,
      "tasksScheduled": 4,
      "tasksCompleted": 0
    }
  }
}
```

---

### 4.2 Get Week View

```
GET /api/v1/daily-plan/week
Authorization: Bearer <token>
```

**Query params:**
- `startDate`: ISO date, defaults to current Monday

**Response 200:**
```json
{
  "week": [
    {
      "date": "2026-03-18",
      "planExists": true,
      "tasksScheduled": 4,
      "tasksCompleted": 2,
      "topItems": ["Psych reading", "Essay outline"]
    },
    {
      "date": "2026-03-19",
      "planExists": false,
      "upcomingDeadlines": ["Chem Lab Report (due Mar 21)"]
    }
  ]
}
```

---

### 4.3 Mark Time Block Complete

```
POST /api/v1/daily-plan/blocks/:blockId/complete
Authorization: Bearer <token>
```

**Request (optional):**
```json
{
  "actualMinutes": 35,
  "note": "Took less time than expected — understood the material well"
}
```

**Response 200:**
```json
{
  "block": { "id": "block_001", "isComplete": true, "completedAt": "2026-03-18T09:37:00Z" },
  "celebration": {
    "message": "✅ Done! You just knocked out the Psych reading. That's #2 today.",
    "streakDay": 4
  },
  "nextBlock": { "...next time block..." }
}
```

---

### 4.4 Skip / Defer Time Block

```
POST /api/v1/daily-plan/blocks/:blockId/skip
Authorization: Bearer <token>
```

**Request:**
```json
{
  "reason": "feeling overwhelmed",
  "deferTo": "2026-03-19"  // optional — if not provided, system reschedules automatically
}
```

**Response 200:**
```json
{
  "block": { "id": "block_001", "isSkipped": true },
  "rescheduled": {
    "date": "2026-03-19",
    "urgencyImpact": "low"  // or "medium" | "high" — warns if deferral is risky
  },
  "message": "Got it. Moving that to tomorrow. No stress."
}
```

---

### 4.5 Regenerate Today's Plan

```
POST /api/v1/daily-plan/regenerate
Authorization: Bearer <token>
```

Triggers immediate re-generation (rate limited: once per 2 hours).

**Request:**
```json
{
  "reason": "schedule changed",
  "avoidBlocks": ["13:00-15:00"]  // optional time ranges to exclude
}
```

**Response 202:**
```json
{
  "jobId": "regen_job_abc",
  "message": "New plan generating. Ready in about 30 seconds."
}
```

---

## 5. Micro-Tasks

### 5.1 Get Micro-Tasks for Assignment

```
GET /api/v1/micro-tasks
Authorization: Bearer <token>
```

**Query params:**
- `assignmentId`: required
- `status`: `pending` | `complete` | `all`

**Response 200:**
```json
{
  "microTasks": [
    {
      "id": "mtask_001",
      "sequence": 1,
      "title": "Gather sources (3 academic articles)",
      "description": "Use UMich library JSTOR access to find 3 articles on cognitive bias published after 2015",
      "startInstruction": "Go to lib.umich.edu → JSTOR → search 'cognitive bias confirmation 2015-2026'",
      "estimatedMinutes": 30,
      "taskType": "DEEP_WORK",
      "status": "COMPLETE",
      "completedAt": "2026-03-17T14:30:00Z"
    },
    {
      "id": "mtask_002",
      "sequence": 2,
      "title": "Write thesis statement",
      "description": "Draft a 2-3 sentence thesis that identifies your three cognitive biases and your central argument",
      "startInstruction": "Open the Google Doc you created → type 'THESIS:' at the top → write one sentence about bias #1",
      "estimatedMinutes": 20,
      "taskType": "DEEP_WORK",
      "status": "PENDING",
      "prerequisiteMicroTaskId": "mtask_001"
    }
  ]
}
```

---

### 5.2 Mark Micro-Task Complete

```
POST /api/v1/micro-tasks/:microTaskId/complete
Authorization: Bearer <token>
```

**Request (optional):**
```json
{
  "actualMinutes": 25
}
```

**Response 200:**
```json
{
  "microTask": { "id": "mtask_002", "status": "COMPLETE" },
  "assignmentProgress": {
    "totalTasks": 6,
    "completedTasks": 2,
    "percentComplete": 33,
    "estimatedRemainingMinutes": 180
  }
}
```

---

### 5.3 Reorder Micro-Tasks

```
PATCH /api/v1/micro-tasks/reorder
Authorization: Bearer <token>
```

**Request:**
```json
{
  "assignmentId": "assign_abc",
  "order": ["mtask_002", "mtask_001", "mtask_003"]  // new sequence
}
```

**Response 200:**
```json
{
  "microTasks": [ "...tasks in new order..." ]
}
```

---

### 5.4 Request Re-Decomposition

```
POST /api/v1/micro-tasks/redecompose/:assignmentId
Authorization: Bearer <token>
```

Re-runs AI decomposition (e.g., if student changed scope, or initial decomp was off).

**Request:**
```json
{
  "feedback": "The steps were too large. I need smaller, 15-minute chunks.",
  "maxMinutesPerTask": 15
}
```

**Response 202:**
```json
{
  "jobId": "decompose_job_abc",
  "message": "Re-breaking this into smaller steps. Ready in about 20 seconds."
}
```

---

### 5.5 Defer Micro-Task

```
POST /api/v1/micro-tasks/:microTaskId/defer
Authorization: Bearer <token>
```

**Request:**
```json
{
  "deferUntil": "2026-03-20",
  "reason": "waiting for library access"
}
```

**Response 200:** Updated micro-task with new scheduled date.

---

## 6. Nudges

### 6.1 Get Scheduled Nudges

```
GET /api/v1/nudges
Authorization: Bearer <token>
```

**Query params:**
- `date`: ISO date, defaults to today
- `status`: `scheduled` | `sent` | `all`

**Response 200:**
```json
{
  "nudges": [
    {
      "id": "nudge_abc",
      "channel": "SMS",
      "level": "LEVEL_1",
      "message": "Hey Alex — your Psych reading block starts in 5 min. Open Canvas when you're ready.",
      "scheduledFor": "2026-03-18T08:55:00Z",
      "status": "SCHEDULED"
    }
  ]
}
```

---

### 6.2 Acknowledge Nudge

```
POST /api/v1/nudges/:nudgeId/acknowledge
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "nudge": { "id": "nudge_abc", "status": "ACKNOWLEDGED" },
  "cancelledEscalation": true
}
```

---

### 6.3 Snooze Nudge

```
POST /api/v1/nudges/:nudgeId/snooze
Authorization: Bearer <token>
```

**Request:**
```json
{
  "snoozeMinutes": 30
}
```

**Response 200:**
```json
{
  "nudge": { "id": "nudge_abc", "status": "SNOOZED", "snoozedUntil": "2026-03-18T09:25:00Z" },
  "warning": null  // or "Snoozing past 10:00 AM will make this task tight."
}
```

---

### 6.4 Update Nudge Settings

```
PATCH /api/v1/nudges/settings
Authorization: Bearer <token>
```

**Request:**
```json
{
  "maxNudgesPerDay": 5,
  "nudgeMinGapMinutes": 30,
  "quietHoursStart": "21:00",
  "channels": ["SMS"]  // disable push
}
```

**Response 200:** Updated notification prefs

---

### 6.5 SMS Webhook — Inbound (Twilio)

```
POST /api/v1/nudges/sms/inbound
Authorization: Twilio signature verification
```

Processes student's SMS reply to a nudge.

**Request (Twilio POST body):**
```
From=+12035551234
Body=done
MessageSid=SMabc123
```

**Supported commands:**
- `done` / `yes` — Mark current active task complete
- `skip` — Skip current task, advance plan
- `snooze 30` — Snooze 30 minutes
- `help` — Resend today's plan summary
- `stop` — Pause all notifications immediately
- `plan` — Send full today's plan

**Response 200:** TwiML response with confirmation message

---

## 7. Parent / Coach

### 7.1 Send Parent Link Invite

```
POST /api/v1/parent/invite
Authorization: Bearer <token>  (student's token)
```

**Request:**
```json
{
  "parentEmail": "mom@example.com",
  "relationship": "parent",
  "permissions": ["VIEW_PLAN", "VIEW_PROGRESS", "VIEW_ALERTS"]
}
```

**Response 201:**
```json
{
  "link": {
    "id": "link_abc",
    "inviteCode": "RK-XYZ789",
    "inviteSentAt": "2026-03-18T10:00:00Z"
  },
  "message": "Invite sent to mom@example.com. They'll receive a link to connect."
}
```

---

### 7.2 Accept Parent Invite (Parent Account)

```
POST /api/v1/parent/accept
Authorization: Bearer <token>  (parent's token)
```

**Request:**
```json
{
  "inviteCode": "RK-XYZ789"
}
```

**Response 200:**
```json
{
  "link": { "id": "link_abc", "isActive": true, "studentName": "Alex Chen" },
  "permissions": ["VIEW_PLAN", "VIEW_PROGRESS", "VIEW_ALERTS"]
}
```

---

### 7.3 Get Parent Dashboard

```
GET /api/v1/parent/dashboard/:studentId
Authorization: Bearer <token>  (parent's token)
```

Returns limited, permission-gated view of student's data.

**Response 200:**
```json
{
  "student": {
    "name": "Alex Chen",
    "school": "University of Michigan"
  },
  "today": {
    "planExists": true,
    "tasksScheduled": 4,
    "tasksCompleted": 2,
    "lastActivityAt": "2026-03-18T10:45:00Z"
  },
  "progress": {
    "dayStreak": 5,
    "weekStreak": 2,
    "tasksThisWeek": 15
  },
  "upcomingDeadlines": [
    {
      "assignmentTitle": "Midterm Essay",
      "courseName": "PSYCH 201",
      "dueDate": "2026-03-25",
      "daysRemaining": 7,
      "completionPercent": 16
    }
  ]
}
```

**Note:** Parent cannot see grades, assignment content details, or chat. Only plan existence, completion counts, streaks, and deadlines.

---

### 7.4 List Linked Students (Parent)

```
GET /api/v1/parent/students
Authorization: Bearer <token>  (parent's token)
```

**Response 200:**
```json
{
  "links": [
    {
      "id": "link_abc",
      "studentId": "user_xyz",
      "studentName": "Alex Chen",
      "relationship": "parent",
      "permissions": ["VIEW_PLAN", "VIEW_PROGRESS", "VIEW_ALERTS"],
      "isActive": true
    }
  ]
}
```

---

### 7.5 Update Parent Link Permissions

```
PATCH /api/v1/parent/link/:linkId/permissions
Authorization: Bearer <token>  (student's token — only student can change permissions)
```

**Request:**
```json
{
  "permissions": ["VIEW_PLAN"]  // Reduced permissions
}
```

**Response 200:** Updated link object

---

### 7.6 Revoke Parent Link

```
DELETE /api/v1/parent/link/:linkId
Authorization: Bearer <token>  (student OR parent can revoke)
```

**Response 200:**
```json
{ "success": true, "message": "Link removed. Parent no longer has access." }
```

---

### 7.7 Get Parent Alerts

```
GET /api/v1/parent/alerts/:studentId
Authorization: Bearer <token>  (parent's token)
```

**Response 200:**
```json
{
  "alerts": [
    {
      "id": "alert_abc",
      "type": "MISSED_TASKS",
      "message": "Alex skipped 2 tasks today and hasn't started the Psych essay planning block.",
      "severity": "medium",
      "createdAt": "2026-03-18T15:00:00Z",
      "deadline": "2026-03-25",
      "daysRemaining": 7
    }
  ]
}
```

---

## 8. Webhooks

### 8.1 Google Classroom Push Notification

```
POST /api/v1/webhooks/google/classroom
Authorization: Google push notification token (header: X-Goog-Resource-State)
```

Receives push notifications when new courseWork is published.

**Request (Google Pub/Sub format):**
```json
{
  "message": {
    "data": "base64-encoded-json",
    "attributes": {
      "resourceId": "course_work_id",
      "resourceState": "exists"
    }
  }
}
```

**Response 200:** Acknowledge receipt; async sync job queued

---

### 8.2 Canvas Webhook (Future)

```
POST /api/v1/webhooks/canvas
Authorization: HMAC-SHA256 signature (header: X-Canvas-Signature)
```

Placeholder for Canvas Data 2 streaming events (enterprise/institutional partnerships).

**Response 200:** Acknowledge + queue sync job

---

### 8.3 Twilio SMS Inbound

```
POST /api/v1/webhooks/twilio/sms
Authorization: Twilio X-Twilio-Signature header validation
```

See Section 6.5 for full detail.

---

### 8.4 Clerk User Lifecycle

```
POST /api/v1/webhooks/clerk
Authorization: Clerk webhook signature (svix headers)
```

Handles Clerk events: `user.created`, `user.updated`, `user.deleted`.

**Request:**
```json
{
  "type": "user.created",
  "data": {
    "id": "user_abc",
    "email_addresses": [{ "email_address": "student@umich.edu" }],
    "first_name": "Alex",
    "last_name": "Chen"
  }
}
```

**Response 200:** User record created/updated/soft-deleted

---

## 9. Error Responses

All errors follow this structure:

```json
{
  "error": {
    "code": "ASSIGNMENT_NOT_FOUND",
    "message": "Assignment with ID assign_xyz does not exist or you don't have access.",
    "details": {},
    "requestId": "req_abc123"
  }
}
```

### Standard Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Request body failed validation |
| 401 | `UNAUTHORIZED` | Missing or invalid auth token |
| 403 | `FORBIDDEN` | Authenticated but insufficient permissions |
| 404 | `NOT_FOUND` | Resource doesn't exist |
| 409 | `CONFLICT` | Duplicate resource or state conflict |
| 422 | `UNPROCESSABLE` | Valid format but business logic failure |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error (with requestId for debugging) |
| 503 | `LMS_UNAVAILABLE` | LMS API is down or returning errors |

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| `POST /courses/sync` | 2/hour per user |
| `POST /daily-plan/regenerate` | 1/2 hours per user |
| `POST /micro-tasks/redecompose` | 3/hour per user |
| All other API routes | 120 requests/minute per user |
| Webhook endpoints | 1000/minute (Twilio, Google) |
