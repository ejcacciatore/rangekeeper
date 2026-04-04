# RangeKeeper Debug Report — Massimo's Academic Dashboard
**Generated:** April 3, 2026  
**Source:** `RangeKeeperDebug.showDB()` equivalent via IndexedDB on `ualearn.blackboard.com`  
**Dashboard URL:** https://ejcacciatore.github.io/rangekeeper/massimo-student-report.html  
**Last Sync:** March 24, 2026 @ 9:19 PM UTC

---

## 1. Executive Summary

The RangeKeeper Chrome extension (v0.2.0, extension ID `aiamjjeggglngiggkmmbnpnpeejjejaf`) is actively scraping data from the University of Alabama Blackboard (`ualearn.blackboard.com`) for student Massimo Cacciatore's Spring 2026 semester. The extension stores data in an IndexedDB database named `RangeKeeperDB` (v3) on the Blackboard domain.

**Note on `RangeKeeperDebug.showDB()`:** This function is defined in the extension's content script (`content.js`) and is only injected on `ualearn.blackboard.com/*` pages — NOT on the GitHub Pages report. The static HTML report at `ejcacciatore.github.io` contains zero JavaScript; it is a pre-rendered snapshot. On the Blackboard domain, the debug object was not accessible from the page's main world during this session (likely due to content script isolation or a timing issue with SES sandbox injection). However, the IndexedDB data was directly readable.

---

## 2. IndexedDB Store Counts

| Store | Record Count |
|-------|-------------|
| courses | 7 |
| assignments | 231 |
| grades | 353 |
| messages | 27 |
| feedback | 0 |
| settings | 1 |

---

## 3. Courses (6 Active Spring 2026 + 1 Fallback)

| BB Internal ID | Course Code | Instructor | Last Scraped |
|---------------|-------------|------------|--------------|
| `_389545_1` | 202610-MATH-125-007 | Jedidiah Agyei | Mar 24, 2026 |
| `_392267_1` | 202610-MATH-125-107 | Jedidiah Agyei | Mar 24, 2026 |
| `_397881_1` | 202610-ENGR-101-006 | Bridgett Monk | Mar 24, 2026 |
| `_398913_1` | 202610-UA-101-030 | Pete Ludovice | Mar 24, 2026 |
| `_401764_1` | 202610-REL-100-919 | *(Multiple/blank)* | Mar 24, 2026 |
| `_413210_1` | 202610-EN-103-025 | Thom O'Rourke | Mar 24, 2026 |
| `course_0` | *(Fallback: "Courses" link)* | — | Mar 24, 2026 |

---

## 4. Assignments (Deduplicated, Sorted by Due Date)

### 4a. Overdue (as of April 3, 2026)

| Assignment | Course | Due Date | Status |
|-----------|--------|----------|--------|
| Module 6 Quiz | MATH-125-007 | Mar 24, 2026 | OVERDUE |
| Family Resemblance Characteristics Discussion | REL-100-919 | Mar 24, 2026 | OVERDUE |
| TED Talk — Noah Feldman Discussion | REL-100-919 | Mar 24, 2026 | OVERDUE |
| Module 7 Quiz | MATH-125-007 | Mar 31, 2026 | OVERDUE |

### 4b. Due Today / This Week

| Assignment | Course | Due Date |
|-----------|--------|----------|
| Eating With Cannibals Discussion | REL-100-919 | Apr 3 (today) |
| Suri Lip Discussion | REL-100-919 | Apr 3 (today) |
| Module 8 Quiz | MATH-125-007 | Apr 7 |
| Heaven's Gate Reaction Discussion | REL-100-919 | Apr 7 |
| Making the Strange Familiar Discussion | REL-100-919 | Apr 7 |

### 4c. Upcoming (Next 2–3 Weeks)

| Assignment | Course | Due Date |
|-----------|--------|----------|
| Alternative Writing Assignment (Thriving Survey C) | UA-101-030 | Apr 10 |
| Assignment: Financial Planning (Materials) | UA-101-030 | Apr 10 |
| Professional Development 6 | ENGR-101-006 | Apr 10 |
| Student Success Analysis | UA-101-030 | Apr 17 |
| Module 9 Quiz | MATH-125-007 | Apr 17 |
| Rituals Discussion | REL-100-919 | Apr 17 |
| Module 10 Quiz | MATH-125-007 | Apr 24 |
| Free Exercise of Religion Discussion | REL-100-919 | Apr 24 |
| Religion and Civic Discourse Discussion | REL-100-919 | Apr 24 |

### 4d. Assignment Source Breakdown

| Source | Count |
|--------|-------|
| Due dates page (no source tag) | 202 |
| Calendar scraper | 29 |

---

## 5. Grades by Course

### 5a. ENGR-101-006 — Introduction to Engineering (22 graded items)

| Assignment | Score | Possible | % |
|-----------|-------|----------|---|
| Professional Communication Assignment | 10 | 10 | 100% |
| Career Fair Assignment | 10 | 10 | 100% |
| VMock Resume | 10 | 10 | 100% |
| Professional Development 1 | 5 | 5 | 100% |
| Professional Development 2 | 5 | 5 | 100% |
| Professional Development 3 | 5 | 5 | 100% |
| Professional Development 4 | 5 | 5 | 100% |
| Attendance, Feb 12 (Career Fair) | 1 | 1 | 100% |
| Attendance, Feb 19 | 1 | 1 | 100% |
| Attendance, March 5 | 1 | 1 | 100% |
| Attendance, Feb 5 | 0 | 1 | 0% |
| Attendance, Feb 26 | 0 | 1 | 0% |
| Attendance, March 12 | 0 | 1 | 0% |
| Attendance, March 26 | 0 | 1 | 0% |

**Observations:** Major assignments (PD, Career Fair, Resume) all 100%. Attendance is spotty — 4 absences out of ~8 recorded dates (50% attendance rate).

### 5b. REL-100-919 — Introduction to Religion (12 graded items)

| Assignment | Score | Possible | % |
|-----------|-------|----------|---|
| Module 3 Quiz | 50 | 50 | 100% |
| Module 4 Quiz | 50 | 50 | 100% |
| Module 5 Quiz | 50 | 50 | 100% |
| Module 7 Quiz | 0 | 50 | 0% |
| Jean-Paul Sartre Discussion | 30 | 30 | 100% |
| Function of Religion Video Debate Discussion | 30 | 30 | 100% |
| Functionalism or Essentialism Discussion | 30 | 30 | 100% |
| Poniewozik Article and Essentialism Discussion | 30 | 30 | 100% |
| Comparing Religious Definitions Discussion | 30 | 30 | 100% |
| Eating With Cannibals Discussion | 0 | 30 | 0% |
| Suri Lip Discussion | 0 | 30 | 0% |

**Observations:** Strong early performance (100% on Modules 3–5 and early discussions). Recent drop — Module 7 Quiz = 0/50, plus two recent discussions at 0/30. Suggests a gap starting around late March.

### 5c. UA-101-030 — First-Year Seminar (9 graded items)

| Assignment | Score | Possible | % |
|-----------|-------|----------|---|
| Career/Major Exploration & Portfolio | 40 | 40 | 100% |
| Campus Resources (Support Pillars) | 40 | 40 | 100% |
| Take Thriving Survey B | 10 | 10 | 100% |
| AI Survey | 10 | 10 | 100% |
| Empathy Based Customer Discovery Quiz | 5 | 5 | 100% |
| Time Management (Foundation) | 30.9 | 40 | 77% |
| Business Model Canvas Quiz | 2.33 | 5 | 47% |
| Module 6 Quiz | 2 | 26 | 8% |
| Attendance | 75 | 100 | 75% |

**Observations:** Major assignments are solid (100%). Quizzes are a weakness — Module 6 Quiz only 8%, Business Model Canvas only 47%. Attendance at 75%.

### 5d. EN-103-025 — English Composition (3 graded items)

| Assignment | Score | Possible | % |
|-----------|-------|----------|---|
| Annotated Bib | 0 | 100 | 0% |
| Unknown Assignment | 0 | 100 | 0% |
| Taste of the Town Turn In | 2 | 26 | 8% |

**Observations:** Very concerning — all graded items are near zero. The scraper may be misreading data (the "Unknown Assignment" and low scores could be scraping artifacts from the gradebook carousel), or these represent genuine missed/failed assignments.

### 5e. MATH-125-007 — Calculus I & MATH-125-107 — Calculus I Lab

No individual assignment grades scraped for these courses. The scraper recorded an `__OVERALL__` entry of 45/57 (79%) that appears to be a cross-course artifact from the grades overview carousel rather than a real Calculus grade.

---

## 6. Messages (Spring 2026 Courses)

| Course | Unread Count | Messages Off? |
|--------|-------------|---------------|
| EN-103-025 | **14** | No |
| ENGR-101-006 | **5** | No |
| MATH-125-007 | **4** | No |
| MATH-125-107 | 0 | **Yes** |
| REL-100-919 | 0 | No |
| UA-101-030 | 0 | No |

**Total unread:** 23 messages across 3 courses. EN-103-025 has 14 unread messages, which is notable.

---

## 7. Data Quality Observations

### What the extension is capturing well:
- Course enrollment (all 6 courses detected with correct Blackboard IDs and instructors)
- Assignment due dates from the calendar/due-dates page
- Grade postings from the activity stream (score, possible, percentage, posted date)
- Message thread unread counts per course

### Known issues in the scraped data:
- **courseId missing on many assignments:** 202 of 231 assignment records lack a `courseId` field (these came from the due-dates page scraper which doesn't always associate assignments with courses)
- **Grades overview carousel bleed:** Some grade records (`__OVERALL__`, `202540-AEM-121-001`, `Submitted:`) are artifacts from the grades overview carousel scraping old/cross-semester data
- **Calendar scraper title noise:** Some calendar entries scraped as day names ("Thursday", "Monday", "Saturday") instead of assignment titles
- **No MATH-125 individual grades:** The scraper hasn't captured individual quiz/assignment grades for Calculus, only the carousel overview
- **EN-103 grades may be inaccurate:** The 0/100 scores could be placeholders or scraping artifacts from the Blackboard gradebook view
- **No feedback data:** The feedback store is empty (0 records) — the grade-detail scraper hasn't been triggered

### Last sync timestamp:
`2026-03-24T21:19:50.049Z` — Data is ~10 days old as of April 3. The extension appears to sync when the student navigates within Blackboard, not on a background timer. The student may not have visited Blackboard recently, or the periodic re-scrape (60s interval) hasn't run in recent sessions.

---

## 8. Static Report vs. Live Data Comparison

The static HTML report at `massimo-student-report.html` shows "Updated: April 3, 2026" and displays assignments with accurate relative dates (3 days, 13 days, etc.), but the IndexedDB `lastSync` is March 24. This means the static report was likely generated from a backend export or manual data compilation on April 3, not directly from the IndexedDB at that moment.

The report shows "No grades posted yet" for all courses and "No messages" — this contradicts the IndexedDB which has 353 grade records and 23 unread messages. The static report generation pipeline does not appear to be pulling grades or messages from the scraped data.

---

## 9. Technical Architecture Notes

- **Extension ID:** `aiamjjeggglngiggkmmbnpnpeejjejaf`
- **Manifest Version:** 3
- **Content scripts:** `utils.js`, `grades-scraper.js`, `messages-scraper.js`, `enhanced-scraper.js`, `content.js`
- **Runs on:** `ualearn.blackboard.com/*`
- **Backend target:** `http://localhost:3000` (offline mode OK — data persists locally)
- **SPA detection:** MutationObserver + popstate + hashchange listeners for Blackboard Ultra's client-side routing
- **Debug console:** `window.RangeKeeperDebug` injected via script element into page world, communicates with content script via `postMessage`
- **Repo:** https://github.com/ejcacciatore/rangekeeper (public, 210 commits, 7 deployments to GitHub Pages)

---

*Report compiled by Claude from live IndexedDB data on `ualearn.blackboard.com` and static report analysis on `ejcacciatore.github.io`.*
