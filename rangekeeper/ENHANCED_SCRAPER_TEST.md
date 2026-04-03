# Enhanced Scraper Testing Guide

**Date:** March 30, 2026  
**What's New:** Rich data extraction for class detail view  
**Status:** Ready for testing

---

## What Was Added

### New File: `enhanced-scraper.js`
Contains three enhanced scrapers:
1. `scrapeGradesOverviewEnhanced()` — Extracts course grades + category breakdown from `/ultra/grades`
2. `scrapeGradebookEnhanced()` — Extracts detailed assignment info from `/ultra/courses/_XXXX_1/grades`
3. `scrapeMessagesEnhanced()` — Extracts message details (sender, read status, preview)

### Updated: `index.html`
New professional dashboard with:
- Stats cards (Due Today, This Week, Courses, Overdue)
- Priority colors (Red/Urgent, Yellow/Soon, Green/Later)
- "Open in Blackboard" deep links
- Responsive mobile design

---

## Testing Instructions

### **Test 1: Grades Overview Page**

1. **Reload extension:**
   - Go to `chrome://extensions/`
   - Find "RangeKeeper"
   - Click reload button

2. **Navigate to grades:**
   ```
   https://ualearn.blackboard.com/ultra/grades
   ```

3. **Open DevTools:** `F12` → Console tab

4. **Run the enhanced scraper:**
   ```javascript
   const result = RangeKeeperEnhanced.scrapeGradesOverview();
   console.log(result);
   ```

5. **Verify output has:**
   - ✅ Course IDs (e.g., "202610-EN-103-025")
   - ✅ Overall grades (letter + percentage)
   - ✅ Category breakdown (if available)
   - ✅ Recent items (sample of graded work)
   - ✅ Upcoming items (What's Next)

**Expected log output:**
```
[RangeKeeper] Enhanced: Found 3 course cards on overview
[RangeKeeper] Enhanced: 202610-EN-103-025 = B- (81%) + 0 categories
[RangeKeeper] Enhanced: 202610-UA-101-030 = ? (null%) + 3 categories
...
```

---

### **Test 2: Gradebook Page**

1. **Navigate to a course's gradebook:**
   ```
   https://ualearn.blackboard.com/ultra/courses/_413210_1/grades
   ```

2. **Open DevTools:** `F12` → Console tab

3. **Run the enhanced scraper:**
   ```javascript
   const result = RangeKeeperEnhanced.scrapeGradebook();
   console.log(result);
   ```

4. **Verify output has:**
   - ✅ Course ID extracted from page
   - ✅ Assignment list (title, score, status)
   - ✅ Due dates
   - ✅ Attempt count
   - ✅ Overall course grade (if visible)

**Expected log output:**
```
[RangeKeeper] Enhanced: Found 15 gradebook rows
[RangeKeeper] Enhanced: Taste of the Town Turn In = 2/26 [graded] (1 attempt)
[RangeKeeper] Enhanced: Discussion Post = 15/15 [graded] (2 attempts)
...
```

---

### **Test 3: Messages Page**

1. **Navigate to messages:**
   ```
   https://ualearn.blackboard.com/ultra/messages
   ```

2. **Open a course message thread**

3. **Open DevTools:** `F12` → Console tab

4. **Run the enhanced scraper:**
   ```javascript
   const result = RangeKeeperEnhanced.scrapeMessages();
   console.log(result);
   ```

5. **Verify output has:**
   - ✅ Sender names
   - ✅ Recipient ("To: All course members" or "To: Name")
   - ✅ Message dates
   - ✅ Preview text
   - ✅ Instructor detection (isInstructor: true/false)
   - ✅ Read status (isUnread: true/false)

**Expected log output:**
```
[RangeKeeper] Enhanced: Found 5 message cards
[RangeKeeper] Enhanced: Message from Pete Ludovice (Instructor) - "Here is the feedback on..."
[RangeKeeper] Enhanced: Message from Sarah Johnson - "Thanks for clarifying! I think we..."
...
```

---

### **Test 4: Dashboard UI**

1. **Go to GitHub Pages dashboard:**
   ```
   https://ejcacciatore.github.io/rangekeeper/
   ```

2. **Verify the new UI:**
   - ✅ Header with RangeKeeper title + nav links
   - ✅ Greeting (Good morning/afternoon/evening, Massimo)
   - ✅ Stats cards showing counts
   - ✅ "Due Today" section with priority colors
   - ✅ "This Week" section
   - ✅ "Open in Blackboard" links are clickable

3. **Test mobile view:**
   - Resize browser to mobile width (~400px)
   - Verify layout is responsive
   - Nav links hidden on mobile
   - Cards stack vertically

---

## What to Report

When you test, please note:

1. **Grades Overview Test:**
   - How many courses showed up?
   - Did category breakdown extract correctly?
   - Any courses missing?

2. **Gradebook Test:**
   - How many assignments were found?
   - Were scores extracted correctly?
   - Any assignments with wrong status?

3. **Messages Test:**
   - How many messages found?
   - Instructor detection working?
   - Read/unread status correct?

4. **Dashboard Test:**
   - Do stats match expected values?
   - Are links working?
   - Is mobile view responsive?

---

## If Something Breaks

**Check logs:**
```javascript
// Look for errors like:
[RangeKeeper] Enhanced: Found 0 gradebook rows  ← Selector may be wrong
[RangeKeeper] Enhanced: Course ref = unknown    ← Course code not found
```

**Verify selector still works:**
1. Open DevTools
2. Use the element inspector (Ctrl+Shift+C)
3. Look for the expected elements:
   - Gradebook rows: `table tbody tr` or `[role="row"]`
   - Grade cards: Elements with course code pattern
   - Message cards: `li[class*="message"]` or similar

**Reset data:**
```javascript
// Clear IndexedDB to start fresh
await RangeKeeperDebug.clearDB();
```

---

## Next Steps

Once testing confirms the scrapers work:

1. ✅ Validate data structure matches our spec
2. ✅ Create `GET /api/class/:courseId` endpoint
3. ✅ Build class detail page component
4. ✅ Connect dashboard to show class details

---

## Success Criteria

- ✅ Grades Overview scraper finds all courses
- ✅ Gradebook scraper finds all assignments  
- ✅ Messages scraper finds all messages
- ✅ Dashboard displays with new professional UI
- ✅ All "Open in Blackboard" links work
- ✅ Data structure matches Phase 2 technical spec
