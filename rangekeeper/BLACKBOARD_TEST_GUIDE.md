# 🧪 RangeKeeper Blackboard Testing Guide

**For:** Rico Cacciatore  
**Purpose:** Test extension selectors on real Blackboard before reporting issues  
**Time:** 15-20 minutes total  
**Tools:** Chrome DevTools, RangeKeeper extension

---

## Pre-Test Checklist

- [ ] RangeKeeper extension installed (chrome://extensions)
- [ ] Logged into ualearn.blackboard.com with Blackboard account
- [ ] Chrome DevTools ready (F12)
- [ ] Backend running locally (npm start in /backend)

---

## Test 1: Activity Stream Grades

### Step 1: Navigate to Activity Stream
```
https://ualearn.blackboard.com/ultra/stream
```

### Step 2: Open Chrome DevTools Console
- Press `F12`
- Click "Console" tab

### Step 3: Run Debug Command
```javascript
RangeKeeperDebug.activity()
```

### Step 4: What You Should See
✅ **Success:**
```
[RangeKeeper] Scraping grades from Activity stream...
[RangeKeeper] Grade item candidates: X
[RangeKeeper] Activity grade: 202610-EN-103-025 — Module 6 Quiz (50/50)
[RangeKeeper] Activity grade: 202610-REL-100-919 — Discussion Post (45/50)
[RangeKeeper] Activity grades found: 2
```

Array of grade objects:
```javascript
[
  {
    id: "act_grade_202610_EN_103_025_0",
    courseId: "202610-EN-103-025",
    assignmentName: "Module 6 Quiz",
    score: "50",
    possible: "50",
    percentage: 100,
    postedDate: "Mar 27, 2026",
    source: "activity-stream",
    scrapedAt: 1774869411139
  }
]
```

❌ **Problems:**

| Error | Cause | Fix |
|-------|-------|-----|
| `scrapeGradesFromActivity not loaded` | Script not injected | Reload extension in chrome://extensions |
| Empty array `[]` | No grades on stream | Scroll down, check if grades are visible |
| Wrong course code | Selector missed course | Screenshot course code location, send to Claw |

### Step 5: If Error — Take Screenshot
1. Right-click on a grade item
2. Click "Inspect"
3. Screenshot the HTML structure
4. Send to Claw with error message

---

## Test 2: Grades Page (Course-Specific)

### Step 1: Navigate to a Course's Grades Page
```
https://ualearn.blackboard.com/ultra/courses/_[COURSE_ID]/grades
```

Example: `_413210_1` (EN-103)

### Step 2: Open DevTools Console (F12)

### Step 3: Run Debug Command
```javascript
RangeKeeperDebug.grades()
```

### Step 4: What You Should See
✅ **Success:**
```
[RangeKeeper] Scraping grades from grades page...
[RangeKeeper] Grades found: 5
```

Array of grade objects with scores:
```javascript
[
  {
    id: "grade_table_row_0",
    courseId: "_413210_1",
    assignmentName: "Quiz 1",
    score: "45",
    possible: "50",
    percentage: 90,
    status: "Graded",
    source: "grades-page",
    scrapedAt: 1774869411139
  }
]
```

❌ **Problems:**

| Error | Cause | Fix |
|-------|-------|-----|
| Empty array | No grades in course | Choose a course with grades |
| `scrapeGradesFromGradesPage not loaded` | Extension reload needed | Reload in chrome://extensions |
| Wrong scores | Selector misaligned | Screenshot grade table, send to Claw |

### Step 5: If Error — Inspect & Screenshot
1. Right-click on a grade row in the table
2. Click "Inspect Element"
3. Screenshot the `<tr>` or `<td>` elements
4. Send screenshot + error message to Claw

---

## Test 3: Messages Landing Page

### Step 1: Navigate to Messages
```
https://ualearn.blackboard.com/ultra/messages
```

### Step 2: Open DevTools Console (F12)

### Step 3: Run Debug Command
```javascript
RangeKeeperDebug.messages()
```

### Step 4: What You Should See
✅ **Success:**
```
[RangeKeeper] Scraping messages landing page...
[RangeKeeper] Current semester: 202610
[RangeKeeper] Found X message rows
[RangeKeeper] 202610-EN-103-025: 14 unread
[RangeKeeper] 202610-REL-100-919: 3 unread
[RangeKeeper] Total message threads: X
```

Array of message threads:
```javascript
[
  {
    id: "msg_course_202610-EN-103-025",
    type: "course-thread",
    courseId: "202610-EN-103-025",
    courseNum: "413210.202610",
    courseName: "202610-EN-103-025",
    unreadCount: 14,
    messagesOff: false,
    source: "messages-landing",
    scrapedAt: 1774869411139
  }
]
```

❌ **Problems:**

| Error | Cause | Fix |
|-------|-------|-----|
| Empty array | No courses with messages | Make sure you have some unread messages |
| Wrong unread counts | Selector misplaced | Screenshot unread badge, send to Claw |
| `scrapeMessages not loaded` | Extension not reloaded | Reload extension |

### Step 5: If Error — Inspect & Screenshot
1. Right-click on a course message row
2. Click "Inspect Element"
3. Look for the unread badge (number like "14")
4. Screenshot the element structure
5. Send to Claw with the number

---

## Test 4: Course Message Thread

### Step 1: Click on a Course in Messages
From the messages landing page, click on any course (e.g., EN-103 with 14 unread)

### Step 2: Open DevTools Console (F12)

### Step 3: Run Debug Command
```javascript
RangeKeeperDebug.thread()
```

### Step 4: What You Should See
✅ **Success:**
```
[RangeKeeper] Scraping course message list...
[RangeKeeper] Messages in thread: X
```

Array of individual messages:
```javascript
[
  {
    id: "msg_thread_0",
    courseId: "_413210_1",
    sender: "Thom O'Rourke",
    subject: "Announcement",
    preview: "This is the message preview text...",
    body: "Full message body if available",
    date: "3/27/26 3:30 PM",
    isUnread: true,
    source: "message-thread",
    scrapedAt: 1774869411139
  }
]
```

❌ **Problems:**

| Error | Cause | Fix |
|-------|-------|-----|
| Empty array | No messages in thread | Go back, choose a course with unread |
| Wrong sender names | Selector missed profile | Screenshot message card, send to Claw |
| Missing dates | Date selector off | Inspect date element, screenshot HTML |

### Step 5: If Error — Inspect & Screenshot
1. Right-click on a message
2. Click "Inspect Element"
3. Look for sender name (should be visible)
4. Look for date (relative or absolute)
5. Screenshot the parent `<div>` or `<li>`
6. Send structure + error to Claw

---

## Test 5: Run All Scrapers at Once

### Step 1: Any Page
Open any Blackboard page

### Step 2: Open DevTools Console (F12)

### Step 3: Run Full Scraper
```javascript
RangeKeeperDebug.run()
```

### Step 4: View All Collected Data
```javascript
RangeKeeperDebug.showDB()
```

This shows:
- All courses scraped
- All assignments found
- All grades collected
- All messages indexed
- All feedback notes

### Step 5: Test Backend Sync
```javascript
RangeKeeperDebug.testBackend()
```

Expected output:
```
[RangeKeeper] ✅ Backend healthy: {
  status: "healthy",
  database: "ok",
  discord: "disconnected"
}
```

---

## Troubleshooting

### Issue: `RangeKeeperDebug is not defined`

**Cause:** Extension not loaded or not active on this page  
**Fix:**
1. Go to chrome://extensions
2. Find "RangeKeeper"
3. Click the refresh icon
4. Reload the Blackboard page
5. Try command again

---

### Issue: `scrapeXXX is not a function`

**Cause:** Script file not injected into page  
**Fix:**
1. Reload the extension (chrome://extensions → refresh)
2. Hard reload Blackboard page (Ctrl+Shift+R)
3. Try the test again

---

### Issue: Empty array returned, but I can see items on page

**Cause:** DOM selectors are wrong for this version of Blackboard  
**Fix:**
1. Take a screenshot of the section
2. Use DevTools Inspector to examine the HTML structure
3. Note the class names or element types
4. Send screenshot + error message to Claw

**Screenshot Instructions:**
1. Press F12 to open DevTools
2. Click the Inspect icon (top-left arrow in DevTools)
3. Click on the element you're testing (grade, message, etc.)
4. Take a screenshot of the Inspector panel showing the HTML
5. Send to Claw with the test that failed

---

### Issue: Backend says "address already in use"

**Cause:** Backend running on same port elsewhere  
**Fix:**
```bash
# Kill existing processes
pkill -f "node.*index.js"

# Wait 2 seconds
sleep 2

# Start fresh
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
npm start
```

---

### Issue: Unread message counts wrong

**Cause:** Badge selector not finding the number  
**Fix:**
1. Go to messages landing page
2. Right-click on the number badge (like "14")
3. Click "Inspect"
4. Note the exact element (usually small `<span>` or `<div>`)
5. Screenshot the HTML
6. Send to Claw with actual counts vs. what was found

---

## Expected Selector Performance

| Page | Expected Time | Expected Results |
|------|----------------|------------------|
| Activity Stream | <1 second | 0-10 grades |
| Grades Page | <1 second | 5-20 grades |
| Messages Landing | 1-2 seconds | 5-15 courses with unread |
| Message Thread | <1 second | 1-50 messages |
| Database Dump | <1 second | All above combined |

If any test takes >5 seconds or returns empty when visible items exist, it's a selector issue.

---

## When to Report Issues

**Report to Claw if:**
1. ❌ Any debug command returns empty `[]` when items are visible on page
2. ❌ Numbers don't match what you see (e.g., says 3 unread but you see 14)
3. ❌ Required field missing from results (sender name, score, etc.)
4. ❌ Backend can't connect (says "unreachable")
5. ❌ Same test fails 2+ times even after reload

**What to include:**
1. The test that failed (e.g., "Activity stream grades")
2. The exact error message from console
3. Screenshot of the HTML structure (use Inspector)
4. Actual count vs. expected count

---

## Quick Test Sequence

**For 15-minute validation:**

1. Go to Activity Stream → Run `RangeKeeperDebug.activity()` (1 min)
2. Go to Grades page → Run `RangeKeeperDebug.grades()` (1 min)
3. Go to Messages → Run `RangeKeeperDebug.messages()` (1 min)
4. Click a course → Run `RangeKeeperDebug.thread()` (1 min)
5. Any page → Run `RangeKeeperDebug.testBackend()` (30 sec)
6. Check DB → Run `RangeKeeperDebug.showDB()` (1 min)
7. Document results (rest of time)

**Total: ~12 minutes, leaves buffer for issues**

---

## Success = All Green ✅

When all tests pass:
1. ✅ Activity stream shows grades
2. ✅ Grades page shows scores
3. ✅ Messages shows unread counts
4. ✅ Thread shows individual messages
5. ✅ Backend is healthy
6. ✅ Database has data

Then → Ready to integrate with Massimo's dashboard! 🎉

---

**Questions?** Send screenshot + console output to Claw.

