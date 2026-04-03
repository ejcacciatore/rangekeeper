# RangeKeeper Phase 2.1: Technical Implementation Spec

**Status:** Ready for development  
**Date:** March 30, 2026  
**Priority:** Build data layer first, then UI

---

## Overview

This spec defines the **data structures, scrapers, and API changes** needed to support the class detail view.

**Deliverable:** 
- Enhanced scrapers with richer data
- New `/api/class/:courseId` endpoint
- Data stored in IndexedDB with better schema
- Frontend receives complete data for class detail page

---

## Part 1: Enhanced Data Model

### Current State
We're scraping:
- ✅ Assignments (activity stream)
- ✅ Messages (course threads + unread counts)
- ✅ Grades (overall only, limited detail)

### What We Need to Add
- 📍 Grade breakdown (by category, by assignment)
- 📍 Assignment metadata (rubric, submission details, attempts)
- 📍 Message preview text + sender name
- 📍 Feedback details (instructor comments)

---

## Part 2: Updated IndexedDB Schema

### Current Stores
```
- courses
- assignments
- grades
- messages
- feedback
```

### Enhanced Stores (Same keys, richer data)

#### `assignments` Store
```javascript
{
  id: "assign_202610-EN-103-025_taste_of_town_1",
  courseId: "202610-EN-103-025",
  courseName: "English 103",
  title: "Taste of the Town Turn In",
  description: "Short description from Blackboard",
  dueDate: "2026-03-30T23:59:00Z",
  dueTime: "11:59 PM",
  type: "assignment", // or "quiz", "discussion", "project"
  status: "submitted", // "not_started", "in_progress", "submitted", "graded", "late"
  
  // NEW: Grade details
  currentGrade: {
    score: 2,
    possible: 26,
    percentage: 7,
    letterGrade: null,
    feedback: "Incomplete submission"
  },
  
  // NEW: Rubric (if available)
  rubric: [
    {
      criterion: "Organization",
      maxPoints: 10,
      earnedPoints: 3,
      feedback: "Structure needs work"
    }
  ],
  
  // NEW: Submission details
  submissions: [
    {
      attemptNumber: 1,
      submittedAt: "2026-03-30T18:00:00Z",
      grade: 2,
      possible: 26,
      feedback: "Incomplete"
    }
  ],
  
  // NEW: Link to assignment in Blackboard
  blackboardUrl: "https://ualearn.blackboard.com/ultra/courses/_413210_1/assessments/_123456",
  
  // Existing
  priority: "urgent", // derived from due date + grade
  scrapedAt: Date.now()
}
```

#### `grades` Store
```javascript
{
  id: "grade_202610-EN-103-025_overall",
  courseId: "202610-EN-103-025",
  courseName: "English 103",
  type: "overall", // "overall", "category", "assignment"
  
  // Overall grade
  letterGrade: "B-",
  percentage: 81,
  score: 405,
  maxScore: 500,
  
  // NEW: Category breakdown (if available)
  categories: [
    {
      name: "Participation",
      percentage: 90,
      weight: "10%"
    },
    {
      name: "Assignments",
      percentage: 80,
      weight: "40%"
    },
    {
      name: "Exams",
      percentage: 75,
      weight: "50%"
    }
  ],
  
  // NEW: Trend
  trend: "stable", // "improving", "stable", "declining"
  
  scrapedAt: Date.now()
}
```

#### `messages` Store
```javascript
{
  id: "msg_202610-EN-103-025",
  courseId: "202610-EN-103-025",
  courseName: "English 103",
  type: "course-thread",
  
  // Existing
  unreadCount: 14,
  messagesOff: false,
  
  // NEW: Recent messages preview
  recentMessages: [
    {
      id: "msg_detail_1",
      sender: "Professor Smith",
      senderEmail: "smith@university.edu",
      subject: "Reminder: Essay Due Friday",
      preview: "Don't forget that your essay is due this Friday by 11:59 PM...",
      date: "2026-03-28T14:30:00Z",
      read: false,
      isInstructor: true
    },
    {
      id: "msg_detail_2",
      sender: "Sarah Johnson",
      senderEmail: "sjohnson@student.edu",
      subject: "RE: Group Project Question",
      preview: "Thanks for clarifying! I think we should...",
      date: "2026-03-27T10:15:00Z",
      read: true,
      isInstructor: false
    }
  ],
  
  // NEW: Link to message thread in Blackboard
  blackboardUrl: "https://ualearn.blackboard.com/ultra/courses/_413210_1/messages",
  
  scrapedAt: Date.now()
}
```

#### `feedback` Store (existing, no changes needed)
```javascript
{
  id: "feedback_202610-EN-103-025_essay_draft",
  courseId: "202610-EN-103-025",
  assignmentId: "assign_...",
  assignmentName: "Essay Draft",
  score: 15,
  maxScore: 25,
  percentage: 60,
  instructorFeedback: "Good effort, but needs more research...",
  rubricScores: [
    { criterion: "Thesis Clarity", score: 3, maxScore: 5 },
    { criterion: "Evidence", score: 2, maxScore: 5 }
  ],
  blackboardUrl: "https://...",
  scrapedAt: Date.now()
}
```

---

## Part 3: Scraper Enhancements

### Current Scrapers Working Well
- ✅ `scrapeGradesFromActivity()` — finds grades on activity stream
- ✅ `scrapeGradesFromGradesPage()` — finds assignments + grades in gradebook
- ✅ `scrapeMessages()` — finds unread counts
- ✅ `scrapeMessageThread()` — finds messages in a course

### What Needs Enhancement

#### 1. **Enhance Assignment Scraper** (in content.js)
```javascript
function scrapeAssignments() {
  // EXISTING: Find assignments from activity stream
  
  // NEW: For each assignment, also capture:
  // - Full title (not truncated)
  // - Due date + time (not just date)
  // - Status (submitted, graded, late, etc.)
  // - Current grade (if graded)
  // - Link to assignment in Blackboard
  // - Assignment type (essay, quiz, discussion, etc.)
  
  // This requires:
  // 1. Click assignment link to get details
  // 2. Scrape the detail page
  // 3. Return to activity stream
  // OR
  // 1. Hover/inspect assignment cards on activity stream
  // 2. Extract all visible data
  
  // APPROACH: Extract visible data from activity stream cards first
  // (don't click, avoid performance hit)
  // Then enhance with data from /ultra/courses/{id}/gradebook when user
  // clicks on a specific class
}
```

#### 2. **Enhance Grades Scraper** (grades-scraper.js)
```javascript
function scrapeGradesFromGradesPage() {
  // EXISTING: Scrapes gradebook table for assignments + scores
  
  // NEW: For each assignment, also capture:
  // - Full assignment name (not truncated)
  // - Rubric details (if rubric-graded)
  // - Submission attempts (1st attempt, 2nd attempt, etc.)
  // - Due date (not just on some items)
  // - Assignment description/instructions link
  
  // This requires DOM parsing of:
  // - Gradebook table (existing)
  // - Grade detail modals (click to expand)
  // - Rubric popups (if visible)
}
```

#### 3. **Enhance Messages Scraper** (messages-scraper.js)
```javascript
function scrapeMessageThread() {
  // EXISTING: Finds sender, date, preview text
  
  // NEW: Also capture:
  // - Is message from instructor? (detect by role)
  // - Message read status (unread badge visible?)
  // - Full message subject
  // - Preview text (first 100-200 chars)
  
  // This requires:
  // - Parse sender role from class roster or instructor badge
  // - Check for unread indicator (purple dot, badge, etc.)
}
```

---

## Part 4: New API Endpoint

### `GET /api/class/:courseId`

**Purpose:** Get all data for a specific class (for class detail page)

**Response:**
```javascript
{
  course: {
    id: "202610-EN-103-025",
    name: "English 103 - Comp I",
    instructor: "Dr. Smith",
    semester: "Spring 2026"
  },
  
  // Sorted by urgency: overdue/failed first
  assignments: [
    {
      // Assignment object as defined above
    }
  ],
  
  grades: {
    overall: { /* overall grade */ },
    byCategory: [ /* category breakdown */ ]
  },
  
  messages: {
    // Recent messages for this class
    threads: [ /* message objects */ ]
  },
  
  lastSyncedAt: "2026-03-30T14:30:00Z"
}
```

### `GET /api/assignments?courseId={courseId}&status={status}`

**Purpose:** Get assignments filtered by course and status

**Query params:**
- `courseId` — required, e.g., "202610-EN-103-025"
- `status` — optional, one of: "not_started", "in_progress", "submitted", "graded", "overdue"
- `sortBy` — optional, one of: "dueDate", "priority", "grade"

**Response:**
```javascript
[
  { /* assignment object */ }
]
```

---

## Part 5: Frontend Data Flow

### Class List View (Existing)
```
Dashboard
  ├── Fetch /api/classes
  ├── Display class cards
  └── ON CLICK → Navigate to /class/:courseId
```

### Class Detail View (New)
```
ClassDetailPage
  ├── Route: /class/:courseId
  ├── Mount:
  │   ├── Fetch /api/class/:courseId
  │   ├── Render assignments (sorted by priority)
  │   ├── Render grades section
  │   ├── Render messages section
  │   └── Render study tips section
  │
  ├── User interaction:
  │   ├── Click assignment → Show details / Link to Blackboard
  │   ├── Click message → Show full message thread
  │   └── Click "Open in Blackboard" → Deep link to course
  │
  └── ON BACK → Navigate to /
```

---

## Part 6: Implementation Roadmap

### Phase 2.1a: Data Layer (Week 1)
- [ ] Update IndexedDB schema
- [ ] Enhance scrapers (assignments, grades, messages)
- [ ] Add new API endpoint: `GET /api/class/:courseId`
- [ ] Test with real Blackboard data

### Phase 2.1b: Frontend Components (Week 2)
- [ ] Create `ClassDetailPage` component
- [ ] Create `AssignmentCard` component (with priority colors + pulse)
- [ ] Create `GradesSection` component
- [ ] Create `MessagesSection` component
- [ ] Add routing: `/class/:courseId`

### Phase 2.1c: Testing & Polish (Week 3)
- [ ] Test on real Blackboard data
- [ ] Verify all scrapers extract correct data
- [ ] Test priority calculation (due date + grade)
- [ ] Test pulse animation (ASD-friendly)
- [ ] Mobile responsiveness

---

## Part 7: Key Questions to Resolve

### Q1: How do we handle assignment details?
**Options:**
- **Option A:** Scrape everything from activity stream (visible data only)
- **Option B:** Click each assignment to get details (slower, more data)
- **Option C:** Use gradebook as source of truth (more reliable, less activity stream data)

**Recommendation:** **Option C** — Use `/ultra/courses/{id}/grades` gradebook as primary source. It has:
- ✅ All assignments for the course
- ✅ Scores + grades
- ✅ Status (submitted, graded, late, etc.)
- ✅ Due dates
- ⚠️ Limited assignment descriptions (but links available)

### Q2: When to sync class data?
**Options:**
- **A:** On-demand (only when user clicks class detail page)
- **B:** Batch sync every 5 minutes (background, all classes)
- **C:** Both (background + on-demand refresh)

**Recommendation:** **Option C** — Sync all classes every 5 minutes in background, but allow user to force refresh on class detail page.

### Q3: How to detect instructor messages?
**Options:**
- **A:** Check sender email domain (instructors use @university.edu)
- **B:** Check for "Instructor" badge/role in message
- **C:** Maintain instructor list from class roster

**Recommendation:** **Option B** — Look for instructor badge/label in DOM. Fallback to email domain matching.

---

## Part 8: Success Criteria

✅ Scrapers extract all necessary data (grades, assignments, messages, feedback)  
✅ IndexedDB stores enhanced data with proper schema  
✅ New `/api/class/:courseId` endpoint returns complete class data  
✅ Frontend can render class detail page with assignments sorted by priority  
✅ Priority colors calculated correctly (red for urgent, yellow for soon, green for later)  
✅ Pulse animation works smoothly (gentle fade, not harsh blink)  
✅ Links to Blackboard are accurate and clickable  
✅ Mobile responsive (works on phone, tablet, desktop)  
✅ All data validated against real Blackboard (not mock data)

---

## Part 9: Dependencies & Tools

### Libraries Needed
- None (use existing: Fetch API, IndexedDB)

### Browser APIs
- IndexedDB (storage)
- LocalStorage (settings)
- Fetch API (HTTP requests)

### Blackboard API
- None (DOM scraping only, no official API)

---

## Part 10: Risk Mitigation

### Risk: Selectors break if Blackboard DOM changes
**Mitigation:** 
- Document all selectors with comments
- Add fallback selectors
- Log errors when selectors fail

### Risk: Scraper performance (clicking each assignment is slow)
**Mitigation:**
- Stick to gradebook as primary source
- Avoid clicking individual assignments
- Cache results aggressively

### Risk: Rate limiting (sync too frequently)
**Mitigation:**
- Sync every 5 minutes (not 1 minute)
- Allow background sync + on-demand refresh
- Queue syncs if Blackboard is slow

### Risk: Data inconsistency (grades changed but not synced yet)
**Mitigation:**
- Show "Last synced X minutes ago"
- Allow manual refresh
- Auto-refresh every 5 min + on page load

---

## Next Steps

**Immediate (Today):**
1. ✅ Spec data model (THIS DOCUMENT)
2. ✅ Spec API changes
3. Run scrapers on real Blackboard data
4. Validate selectors still work
5. Identify any new DOM patterns

**Tomorrow:**
1. Implement enhanced scrapers
2. Update IndexedDB schema
3. Create new API endpoint
4. Test with real Blackboard data

**This Week:**
1. Build UI components
2. Connect to new API
3. Test on real data
4. Polish & deploy
