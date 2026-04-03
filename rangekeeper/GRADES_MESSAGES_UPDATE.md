# 📊 Grades & Messages Scraping Update

**Date:** March 29, 2026  
**Status:** Extension Updated - Ready for Testing

---

## ✅ What Was Added

### 1. Grades Scraping
**New file:** `extension/scripts/grades-scraper.js`

**Two scraping methods:**

#### A) Activity Stream Grades (`scrapeGradesFromActivity`)
- Scrapes from the **Activity** page (https://ualearn.blackboard.com/ultra/stream)
- Captures grade postings as they appear in the activity feed
- **Data collected:**
  - Course ID (e.g., "202610-REL-100-919")
  - Assignment name (e.g., "Module 6 Quiz")
  - Posted date (e.g., "Mar 27, 2026")
  - Link to view grade
  
**Example from screenshots:**
```
Mar 27, 2026 | 202610-REL-100-919
Grade posted: Module 6 Quiz
[View my grade button]
```

#### B) Grades Page (`scrapeGradesFromGradesPage`)
- Scrapes from the dedicated **Grades** page
- Captures actual scores when available
- **Data collected:**
  - Course ID
  - Assignment name
  - Score (e.g., "85/100", "A", "92%")

---

### 2. Messages Scraping
**New file:** `extension/scripts/messages-scraper.js`

**Two scraping methods:**

#### A) Message Threads (`scrapeMessages`)
- Scrapes from the **Messages** page (https://ualearn.blackboard.com/ultra/messages)
- Captures course-based message threads
- **Data collected:**
  - Course ID (e.g., "202610-EN-103-025")
  - Unread message count (e.g., "13", "3", "4")
  - Thread URL
  
**Example from screenshots:**
```
202610-EN-103-025 [13 unread]
202610-ENGR-101-006 [3 unread]
202610-MATH-125-007 [4 unread]
```

#### B) Individual Messages (`scrapeMessageThread`)
- Scrapes individual messages when a thread is opened
- **Data collected:**
  - Sender
  - Subject
  - Message body (first 500 chars)
  - Timestamp

---

### 3. Updated Page Detection
**File:** `extension/scripts/content.js` → `detectPage()` function

**New page types recognized:**
- `activity-stream` - Activity page (shows grades)
- `messages` - Messages page
- `deadline` - Deadline view (another assignment view)

**URL patterns:**
```javascript
/ultra/stream → 'activity-stream' (grades + assignments)
/ultra/messages → 'messages'
/ultra/deadline → 'deadline' (assignments)
/ultra/grades → 'grades' (dedicated grades page)
```

---

### 4. Updated Database Schema
**File:** `extension/scripts/content.js` → `openDB()` function

**New IndexedDB store:**
- `messages` - Stores message threads and individual messages

**Database version:** Incremented from 1 → 2

---

### 5. Updated Manifest
**File:** `extension/manifest.json`

**Added new scripts:**
```json
"js": [
  "scripts/utils.js",
  "scripts/grades-scraper.js",      // NEW
  "scripts/messages-scraper.js",    // NEW
  "scripts/content.js"
]
```

---

## 🧪 How to Test

### Test Grades Scraping

1. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Find RangeKeeper
   - Click reload (🔄)

2. **Navigate to Activity page:**
   - Go to https://ualearn.blackboard.com/ultra/stream
   - Open DevTools (F12) → Console tab
   - Look for logs like:
     ```
     [RangeKeeper] Current page: activity-stream
     [RangeKeeper] Scraping grades from Activity stream...
     [RangeKeeper] Found grade: 202610-REL-100-919 - Module 6 Quiz
     [RangeKeeper] Found X grade postings
     ```

3. **Check IndexedDB:**
   - DevTools → Application tab
   - IndexedDB → RangeKeeperDB → **grades**
   - Should see grade entries with courseId, assignmentName, postedDate

### Test Messages Scraping

1. **Navigate to Messages page:**
   - Go to https://ualearn.blackboard.com/ultra/messages
   - Open DevTools → Console
   - Look for logs like:
     ```
     [RangeKeeper] Current page: messages
     [RangeKeeper] Scraping messages...
     [RangeKeeper] Found message thread: 202610-EN-103-025 (13 unread)
     [RangeKeeper] Found X message threads
     ```

2. **Check IndexedDB:**
   - Application tab → IndexedDB → RangeKeeperDB → **messages**
   - Should see message thread entries with courseId, unreadCount

---

## 📊 Data Structure

### Grades (from Activity stream)
```javascript
{
  id: "grade_202610-REL-100-919_Module_6_Quiz_1234567890",
  courseId: "202610-REL-100-919",
  courseName: "202610-REL-100-919",
  assignmentName: "Module 6 Quiz",
  postedDate: "Mar 27, 2026",
  gradeUrl: "/learn/api/...",
  score: null,  // Not visible until clicked
  scrapedAt: 1774753200000
}
```

### Messages
```javascript
{
  id: "msg_202610-EN-103-025_thread_1_1234567890",
  courseId: "202610-EN-103-025",
  courseName: "202610-EN-103-025",
  threadId: "thread_1",
  unreadCount: 13,
  threadUrl: "/learn/api/...",
  scrapedAt: 1774753200000
}
```

---

## 🔄 Backend Sync

**Note:** The extension will attempt to sync this data to the backend at `http://localhost:3000/api/sync`.

**Payload structure:**
```javascript
{
  courses: [...],
  assignments: [...],
  grades: [...],      // NEW
  messages: [...],    // NEW
  lastScraped: 1234567890
}
```

**Backend needs updating** to accept and store grades/messages data. Currently it only handles courses and assignments.

---

## 🚀 Next Steps

### For Extension (Complete ✅)
- ✅ Grades scraping logic
- ✅ Messages scraping logic
- ✅ Page detection
- ✅ IndexedDB schema update
- ✅ Manifest update

### For Backend (TODO)
- [ ] Add `messages` table to database schema
- [ ] Update `/api/sync` endpoint to accept grades/messages
- [ ] Update popup dashboard to display grades/messages
- [ ] Add notifications for new grades posted
- [ ] Add notifications for unread messages

### For Testing
- [ ] Test on Activity page (grades)
- [ ] Test on Messages page
- [ ] Verify IndexedDB stores data correctly
- [ ] Test sync to backend (once backend is updated)

---

## 🐛 Debugging

**If grades don't scrape:**
1. Check Console for `[RangeKeeper] Found X grade postings`
2. If 0, the DOM selectors may need adjustment
3. Inspect the Activity stream HTML and update selectors in `grades-scraper.js`

**If messages don't scrape:**
1. Check Console for `[RangeKeeper] Found X message threads`
2. If 0, inspect Messages page HTML and update selectors in `messages-scraper.js`

**Common issues:**
- Blackboard uses dynamic class names (e.g., `MultiListroot-xyz123`)
- Use `[class*="MultiList"]` for partial class matching
- Wait for page to fully load before scraping (2-5 second delay)

---

## 📝 Files Modified/Created

**Created:**
- `extension/scripts/grades-scraper.js` (new file, 4KB)
- `extension/scripts/messages-scraper.js` (new file, 4KB)
- `GRADES_MESSAGES_UPDATE.md` (this file)

**Modified:**
- `extension/manifest.json` (added new scripts)
- `extension/scripts/content.js` (updated detectPage, runScraper, openDB)

---

**Ready for testing!** 🎯
