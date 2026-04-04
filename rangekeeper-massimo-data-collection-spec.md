# RangeKeeper — Data Collection Spec: Massimo McRae
## Chrome Extension Engineering Reference
**Generated:** April 3, 2026
**Student:** Massimo McRae (mmcacciatore@crimson.ua.edu)
**Term:** Spring 2026 (term prefix: 202610)
**Blackboard Domain:** ualearn.blackboard.com
**Extension:** RangeKeeper v0.2.0 · ID: jomhhkompafdjiekgcddcaaldgmbfkjh

---

## 1. STUDENT PROFILE

| Field | Value |
|---|---|
| Full Name | Massimo McRae |
| Username | mmcacciatore |
| Email | mmcacciatore@crimson.ua.edu |
| Institution | University of Alabama, Tuscaloosa |
| Term | Spring 2026 (202610) |
| Accommodations | Yes — noted on all gradebooks |
| Active BB Session | Confirmed via console logs |

---

## 2. SPRING 2026 COURSE ROSTER

All 6 courses confirmed enrolled under term prefix 202610. MATH-125-107 is a recitation-only section linked to MATH-125-007.

| BB Course ID | Section Code | Course Name | Instructor | BB Internal ID |
|---|---|---|---|---|
| 19249.202610 | 202610-ENGR-101-006 | Engineering 101 | Andrew Monk | _397881_1 |
| 12966.202610 | 202610-MATH-125-007 | Calculus 1 (lecture) | Jedidiah Agyei | _389545_1 |
| 15697.202610 | 202610-MATH-125-107 | Calculus 1 (recitation) | Jedidiah Agyei | _392267_1 |
| 16102.202610 | 202610-EN-103-025 | English 103 | O'Rourke | _413210_1 |
| 18424.202610 | 202610-REL-100-919 | Religion 100 | Steve Heaton / Nathan Loewen | _401764_1 |
| 20272.202610 | 202610-UA-101-030 | University Academic 101 | (UA staff) | _398913_1 |

> **Filter rule:** Always filter by term prefix `202610`. Ignore 202540 (Fall 2025) and 202640 (Fall 2026) courses present in Massimo's account.

---

## 3. DATA SOURCES MAP

The extension must collect from TWO platforms. Blackboard covers 5 of 6 courses. MATH-125 grades and assignments live entirely in WebAssign.

| Platform | Access Method | Auth |
|---|---|---|
| Blackboard Ultra | `ualearn.blackboard.com/ultra/*` | Session cookie (already logged in) |
| WebAssign (Cengage) | LTI launch from BB course outline | SSO via Blackboard — no separate login needed |

---

## 4. DATA COLLECTION TARGETS

### 4A. COURSES

**URL:** `/ultra/course` or `/ultra/institution-page`
**What to collect:**
- Course ID (BB internal: `_XXXXXX_1` format)
- Section code (e.g., `202610-ENGR-101-006`)
- Term prefix (filter: keep only `202610`)
- Course display name
- Instructor name(s)
- Starred/favorited status

**Filter logic:** Term prefix must start with `202610`. Reject `202540`, `202640`, Math Placement (`NI-Math-Placement-*`).

---

### 4B. GRADES

#### Blackboard Gradebooks (5 courses)
**URL pattern:** `/ultra/courses/{BB_ID}/grades`

| Course | BB ID | Gradebook Status |
|---|---|---|
| ENGR-101 | _397881_1 | ✅ Active — 55/69 pts |
| REL-100 | _401764_1 | ✅ Active — 565/710 pts (C+) |
| UA-101 | _398913_1 | ✅ Active — Midterm 55.3/58.33 |
| EN-103 | _413210_1 | ✅ Active — 2 items (96/100 + 0/100) |
| MATH-125-007 | _389545_1 | ❌ Empty — all grades in WebAssign |
| MATH-125-107 | _392267_1 | ❌ Recitation section — no gradebook |

**What to collect per BB gradebook item:**
- Assignment name
- Points earned / points possible
- Percentage
- Status: Graded / Submitted / Not submitted / Exempt
- Due date (if shown)
- Override or accommodation flag

**Accommodation note:** "You have an accommodation for this course" banner appears on every gradebook. Do not treat this as an error — capture and store as a flag.

#### WebAssign Gradebook (MATH-125-007 only)
**Access path:** `/ultra/courses/_389545_1/outline` → click "Cengage WebAssign" LTI link → opens `webassign.net`
**WebAssign Grades URL:** `https://www.webassign.net/v4cgi/student.pl?action=grades/*`

**MATH-125-007 Live Grade Data (as of Apr 3, 2026):**

| Category | Raw Score | Weighted Score |
|---|---|---|
| Homework (21 assignments) | 94.50% | 13.50% |
| Tests (3 completed) | 92.88% | 59.71% |
| Recitation | 103.43% | 22.16% |
| **Total Grade** | | **95.37% — A** |

Grading scale: A+ ≥97 / A 93–96 / A- 90–92 / B+ 87–89 / B 83–86 / B- 80–82 / C+ 77–79 / C 73–76 / C- 70–72 / D+ 67–69 / D 63–66 / D- 60–62 / F 0–59

**Tests:**
| Assignment | Score |
|---|---|
| Test 01 | 89.80 / 100 (89.8%) |
| Test 02 | 104.15 / 100 (104.15%) — extra credit |
| Test 03 | 84.70 / 100 (84.7%) |
| Test 04 | LOCKED — requires ≥70% on UA Honor Code quiz |

**What to collect from WebAssign grades:**
- Total grade percentage and letter grade
- Per-category weighted scores (Homework, Test, Recitation)
- Per-assignment: name, raw score, max score, percentage, weighted score
- Grade last-updated timestamp
- Next auto-update timestamp
- "Extended" flag on assignments (instructor-granted extensions)
- Locked assignment status and unlock condition

---

### 4C. ASSIGNMENTS — CURRENT & UPCOMING

#### Blackboard Deadline View (all courses)
**URL:** `/ultra/deadline` — **USE THIS, not `/ultra/calendar`**
This is a flat chronological list. More reliable than calendar day-clicking.

**Upcoming assignments as of Apr 3, 2026:**

| Due Date | Assignment | Course |
|---|---|---|
| Apr 3 (tonight) | Suri Lip Discussion | REL-100 |
| Apr 3 (tonight) | Eating With Cannibals Discussion | REL-100 |
| Apr 3 (tonight) | Module 7 Quiz | REL-100 |
| Apr 4 | Individual Hypothesis Assignment | ENGR-101 |
| Apr 10 | Heaven's Gate Reaction Discussion | REL-100 |
| Apr 10 | Making Strange/Familiar Discussion | REL-100 |
| Apr 10 | Module 8 Quiz | REL-100 |
| Apr 11 | Professional Development 5 | ENGR-101 |
| Apr 11 | Professional Development 6 | ENGR-101 |
| Apr 11 | Take Thriving Survey C | UA-101 |
| Apr 11 | Alternative Writing Assignment (survey opt-out) | UA-101 |
| Apr 11 | Assignment: Financial Planning (Materials) | UA-101 |
| Apr 17 | Rituals Discussion | REL-100 |
| Apr 17 | Module 9 Quiz | REL-100 |
| Apr 18 | Student Success Analysis | ENGR-101 |
| Apr 24 | Religion and Civic Discourse Discussion | REL-100 |
| Apr 24 | Free Exercise of Religion Discussion | REL-100 |
| Apr 24 | Module 10 Quiz | REL-100 |

**What to collect per deadline item:**
- Assignment name
- Due date + time + timezone
- Course section code
- BB assignment ID (from link href if available)

#### WebAssign Current Assignments (MATH-125-007)
**URL:** `https://www.webassign.net/v4cgi/student.pl?action=home/index`

**Current open assignments as of Apr 3, 2026:**

| Assignment | Due | Score | Status |
|---|---|---|---|
| HW-S4.5-Optimization Problems | Tue Apr 7, 12:59 AM EDT | 18.9 / 27 (70.0%) | In progress — **Extended** |
| HW-S5.1-Areas and Distances | Tue Apr 7, 12:59 AM EDT | - / 12 | Not started |
| HW-S5.2-The Definite Integral | Wed Apr 8, 12:59 AM EDT | - / 17.62 | Not started |
| HW-S4.7-Antiderivatives | Thu Apr 9, 12:59 AM EDT | 31.5 / 46 (68.5%) | In progress — **Extended** |
| HW-S5.3-Evaluating Definite Integrals | Sat Apr 11, 12:59 AM EDT | - / 20.62 | Not started |
| HW-S5.4-Fundamental Theorem of Calculus | Tue Apr 14, 12:59 AM EDT | - / 17 | Not started |

**What to collect per WebAssign assignment:**
- Assignment name and type (Homework / Test / Recitation / HonorCode)
- Due date + time + timezone
- Score earned / score possible / percentage
- "Extended" flag (instructor-granted extension)
- "Locked" status + unlock condition (e.g., must pass Honor Code quiz)
- Current vs. Past classification

---

### 4D. ASSIGNMENTS — COMPLETED / PAST

#### WebAssign Past Assignments (29 completed as of Apr 3, 2026)

| Assignment | Due Date | Score | % |
|---|---|---|---|
| HW-S1.0-Basic Algebra and Trig | Jan 13 | 17 / 18 | 94.4% |
| Recitation-01 | Jan 13 | 42 / 40 | 105.0% |
| Recitation-02 | Jan 20 | 30 / 30 | 100.0% |
| HW-S1.6-Limits Involving Infinity | Jan 24 | 25 / 25 | 100.0% |
| HW-S1.3-The Limit of a Function | Jan 25 | 31.5 / 31.5 | 100.0% |
| HW-S1.4-Calculating Limits | Jan 25 | 19 / 19 | 100.0% |
| HW-S1.5-Continuity | Jan 26 | 20 / 21 | 95.2% |
| HW-S2.1-Derivatives & Rates of Change | Jan 27 | 24 / 24 | 100.0% |
| Recitation-03 | Feb 3 | 33 / 30 | 110.0% |
| HW-S2.2-The Derivative as a Function | Feb 4 | 27.5 / 27.5 | 100.0% |
| HW-S2.3-Basic Differentiation Formulas | Feb 5 | 26.71 / 26.71 | 100.0% |
| HW-S2.4-Product and Quotient Rules | Feb 7 | 13.62 / 13.62 | 100.0% |
| Recitation-04 | Feb 10 | 19 / 20 | 95.0% |
| HW-S2.5-The Chain Rule | Feb 11 | 23 / 23 | 100.0% |
| HW-S2.6-Implicit Differentiation | Feb 14 | 11 / 11 | 100.0% |
| HW-S2.7-Related Rates | Feb 17 | 10 / 8 | 125.0% |
| UA Honor Code & Cell Phone: Test 2 | Feb 17 | 2 / 2 | 100.0% |
| HW-S2.8-Linear Approx & Differentials | Feb 24 | 12 / 12 | 100.0% |
| Recitation-05 | Feb 24 | 33 / 30 | 110.0% |
| HW-S3.3-Derivatives of Log & Exp | Feb 28 | 16 / 16 | 100.0% |
| HW-S3.5-Inverse Trig Functions | Mar 3 | 22 / 22 | 100.0% |
| Recitation-06 | Mar 3 | 44 / 40 | 110.0% |
| HW-S4.1-MaxMin Values | Mar 7 | 35 / 35 | 100.0% |
| HW-S4.2-The Mean Value Theorem | Mar 10 | 17 / 17 | 100.0% |
| UA Honor Code & Cell Phone: Test 3 | Mar 10 | 2 / 2 | 100.0% |
| Recitation-07 | Mar 24 | 35 / 40 | 87.5% |
| HW-S4.4-Curve Sketching | Mar 26 | 22 / 22 | 100.0% |
| HW-S4.3-Derivatives & Shapes of Graphs | Mar 31 | 18.9 / 60 | 31.5% ⚠️ Extended, still low |
| Recitation-08 | Mar 31 | 16.5 / 15 | 110.0% |

---

### 4E. MESSAGES

**URL:** `/ultra/messages` (landing) then `/ultra/courses/{BB_ID}/messages` per course
**Note:** MATH-125-107 has messaging **disabled** by instructor.

**Unread counts as of Apr 3, 2026:**

| Course | Unread | Notes |
|---|---|---|
| EN-103 | 14 | O'Rourke uses messages exclusively (no announcements) |
| ENGR-101 | 5 | Mix of Monk + Group 8 student messages |
| MATH-125-007 | 4 | Agyei test reminders + classroom change notice |
| UA-101 | 0 | — |
| REL-100 | 0 | — |
| MATH-125-107 | N/A | **Messaging disabled for this section** |
| **Total** | **23** | Matches BB nav badge count |

**What to collect per message thread:**
- Thread ID
- Course section
- Sender name + role (Instructor / Student / TA)
- Subject / thread title
- Date sent
- Read / unread status
- Message body (first 500 chars minimum)
- Number of replies in thread

---

### 4F. ANNOUNCEMENTS

**URL pattern:** `/ultra/courses/{BB_ID}/announcements`

**Status by course:**

| Course | Count | Notes |
|---|---|---|
| ENGR-101 | 10 | Active: Cube lab tour, midterm grade release, Final Project details, group assignments |
| UA-101 | 11 | Active: BMC presentations, Customer Discovery, quiz corrections, Thriving resources |
| REL-100 | 0 | Instructors not using Announcements |
| EN-103 | 0 | O'Rourke uses Messages instead |
| MATH-125 | 0 | Agyei uses Messages instead |

**What to collect per announcement:**
- Title
- Course
- Posted date
- Body (full text)
- Instructor name

---

### 4G. CALENDAR / DUE DATES

**Primary URL:** `/ultra/deadline` — flat list view, most reliable
**Secondary URL:** `/ultra/calendar` — day/month view with institution events

**What to collect:**
- Assignment name
- Due date + time + timezone offset
- Course section code
- Assignment type (Due date vs. Due date 2 — BB distinguishes original vs. extended)
- Institution events (e.g., Honors Day — classes dismissed Apr 4)
- Personal calendar events (Massimo has a recurring "New Event 2/1/26" personal reminder)

**Note on timezone:** All BB deadlines display in EDT (UTC-4). WebAssign also uses EDT. Times at "12:59 AM EDT" are actually 11:59 PM CDT the night before — Agyei sets them as Central, Blackboard displays as Eastern.

---

### 4H. COURSE CONTENT OUTLINES

**URL pattern:** `/ultra/courses/{BB_ID}/outline`

**ENGR-101 (_397881_1):**
- Final Project folder (due date TBD — not in system)
- Lecture Assignments folder
- Professional Development folder (PD 1–6)
- Individual Hypothesis Assignment

**MATH-125-007 (_389545_1):**
- Welcome / Syllabus / Course Resources
- Cengage WebAssign (LTI link → SSO to webassign.net)
- Access Granted Course Materials
- Test 1 Class Notes: 4/5 started
- Test 2 Class Notes: 3/6 started ⚠️
- Test 3 Class Notes: 3/5 started ⚠️
- Test 4 Class Notes: 4/7 started
- Completed Notes: 1/23 started ⚠️

**MATH-125-107 (_392267_1):**
- Recitation-only section. Content: "go to the lecture section Blackboard page." No assignments here.

**EN-103 (_413210_1):**
- 5 content items
- "Researched Text Analysis" — NO due date set in system
- 2 gradebook items: Paper 1 (96/100) + one 0/100 outstanding

**UA-101 (_398913_1):**
- Thriving Skills Module 1–4
- Module 4: only 1/5 items started ⚠️
- BMC + Customer Discovery assignments (ungraded in system)

**REL-100 (_401764_1):**
- 10 modules (Modules 1–10, use "Load more" button — only 6 load by default)
- Module 7: 1/7 items started ⚠️ (discussions + quiz due Apr 3)

---

### 4I. ATTENDANCE

**Access:** In-course → Details & Actions panel → "View your attendance"
**Direct URL pattern does NOT work:** `/ultra/courses/{BB_ID}/attendance` → 404

| Course | Status |
|---|---|
| EN-103 | 0 Present / 0 Late / 0 Absent / 0 Excused — O'Rourke not using BB attendance tracker |
| UA-101 | BB attendance link present — not yet investigated per-class |
| ENGR-101 | BB attendance link present — not yet investigated per-class |
| MATH-125-007 | BB attendance link present |
| REL-100 | Online async course — no attendance applicable |
| MATH-125-107 | BB attendance link present (recitation) |

---

## 5. WEBASSIGN INTEGRATION — TECHNICAL NOTES

WebAssign is accessed via LTI (Learning Tools Interoperability) from Blackboard. The extension **cannot** call WebAssign directly without the LTI handshake.

**Access sequence:**
1. Navigate to `/ultra/courses/_389545_1/outline`
2. Find and click the "Cengage WebAssign" LTI link
3. BB performs SSO handshake → WebAssign opens in new tab with session token in URL
4. Session URL format: `https://www.webassign.net/v4cgi/student.pl?action=home/index&course=XXXXX&UserPass=XXXXXXXX`
5. Navigate to `?action=grades/*` for grades
6. Navigate to `?u=TIMESTAMP+username` format for My Assignments

**Key WebAssign pages to scrape:**

| Page | URL pattern | Data |
|---|---|---|
| Home / Current Assignments | `?action=home/index` | 6 current HW items, upcoming test info |
| My Assignments | `?u=...` nav click | Current + Past tabs, all 35 assignments |
| Grades | `?d=...` nav click | Total grade, category breakdown, per-assignment scores |

**Session token behavior:**
- Tokens in the `?l=`, `?d=`, `?u=` parameters are time-stamped and rotate per navigation
- The LTI link from BB must be clicked fresh each session — tokens expire
- Do NOT hardcode WebAssign URLs — always launch from BB LTI link

---

## 6. KNOWN GAPS & BLIND SPOTS

The extension cannot currently collect the following. Each entry notes why and the workaround if any.

| # | Data Type | Gap Reason | Workaround |
|---|---|---|---|
| 1 | MATH-125 BB gradebook | Agyei uses WebAssign exclusively; BB gradebook empty | Collect from WebAssign via LTI (see §5) |
| 2 | Discussion board content | No standalone URL — embedded in content modules only; `/discussions` → 404 | None — cannot scrape |
| 3 | EN-103 "Researched Text Analysis" due date | Instructor never set a due date in system | Flag as "no due date — check with instructor" |
| 4 | ENGR Final Project due date | Not entered in BB system yet | Flag as "TBD" |
| 5 | Attendance per-class breakdown | Direct attendance URL 404s; EN-103 instructor not tracking | Use in-course panel click only |
| 6 | REL-100 attendance | Online async — no attendance feature active | N/A |
| 7 | MATH-125 class notes completion % | Not grade-impacting; completion displayed in outline only | Read from outline content items |
| 8 | UA-101 Thriving Skills Module 4 | Only 1/5 items started — not yet graded | Visible in outline; no grade until submitted |
| 9 | BMC + Customer Discovery grades | Ungraded in system as of Apr 3 | Flag as "submitted — pending grade" |
| 10 | WebAssign Test 04 | Locked — requires ≥70% on UA Honor Code quiz to unlock | Poll until unlocked |
| 11 | MATH-125-107 messages | Instructor disabled messaging for recitation section | No workaround |
| 12 | REL Module 7 engagement | Only 1/7 items started — discussions + quiz all due Apr 3 | Flag as urgent in report |
| 13 | WebAssign session tokens | Rotate per session — cannot hardcode URLs | Always launch via BB LTI click |

---

## 7. DATA COLLECTION SEQUENCE (RECOMMENDED ORDER)

Run in this order to avoid session timeouts and maximize data freshness:

```
1. Load /ultra/course
   → Capture 202610 course list + BB IDs
   → Filter: keep only term prefix 202610

2. Load /ultra/deadline
   → Capture all upcoming due dates (flat list, most reliable)

3. For each 202610 course in parallel:
   a. /ultra/courses/{ID}/grades       → BB gradebook items
   b. /ultra/courses/{ID}/messages     → unread count + thread list
   c. /ultra/courses/{ID}/announcements → announcements list
   d. /ultra/courses/{ID}/outline      → content structure + completion %

4. WebAssign (MATH-125 only):
   a. Navigate to /ultra/courses/_389545_1/outline
   b. Click "Cengage WebAssign" LTI link
   c. On webassign.net: scrape Home (current assignments)
   d. Navigate to My Assignments → Past Assignments tab
   e. Navigate to Grades → expand Homework + Test categories

5. Load /ultra/calendar (secondary)
   → Capture institution events (Honors Day, etc.)
   → Capture personal calendar events

6. IndexedDB read (on ualearn.blackboard.com domain):
   → Open RangeKeeperDB v3
   → Read: courses, assignments, grades, messages, feedback, settings
   → Compare lastSync timestamp — flag if > 24 hours stale
```

---

## 8. INDEXEDDB SCHEMA (RangeKeeperDB v3)

Confirmed schema from direct read on Apr 3, 2026:

| Store Name | Record Count | Key Field |
|---|---|---|
| courses | 7 | courseId |
| assignments | 231 | assignmentId |
| grades | 353 | gradeId |
| messages | 27 | messageId |
| feedback | 0 | — |
| settings | 1 | — |

**Last sync timestamp:** `2026-03-24T21:19:50.049Z` (10 days stale at time of last read)
**Settings record:** Sync interval, extension version, user preferences

**Critical issue:** The courses store contained 7 records including Fall 2025 courses — term filtering must be applied at read time, not at write time. The scraper is writing cross-term data indiscriminately.

---

## 9. TERM FILTERING RULES

The extension must apply this filter everywhere:

```javascript
// Keep only Spring 2026 courses
const CURRENT_TERM = '202610';
const isCurrentTerm = (course) => course.sectionCode.includes(CURRENT_TERM);

// BB course IDs for Spring 2026 (hardcode as fallback)
const SPRING_2026_IDS = {
  'ENGR-101': '_397881_1',
  'MATH-125-007': '_389545_1',
  'MATH-125-107': '_392267_1',
  'EN-103': '_413210_1',
  'REL-100': '_401764_1',
  'UA-101': '_398913_1'
};

// Reject these term prefixes
const EXCLUDE_TERMS = ['202540', '202640', 'NI-Math-Placement'];
```

---

## 10. GRADE SUMMARY (CURRENT STATE — APR 3, 2026)

| Course | Grade | Source | Status |
|---|---|---|---|
| MATH-125-007 | **95.37% — A** | WebAssign | 3 tests done; 6 HW open; Test 4 locked |
| ENGR-101 | **55 / 69 pts** | Blackboard | Final Project not yet graded |
| REL-100 | **565 / 710 — C+** | Blackboard | Module 7 work due tonight |
| UA-101 | **~55.3 / 58.33 (Midterm)** | Blackboard | Module 4 incomplete |
| EN-103 | **96 / 100 (Paper 1)** | Blackboard | 1 outstanding item (0/100) |
| MATH-125-107 | N/A | N/A | Recitation section — grades in MATH-007 |

---

## 11. URGENT ITEMS (AS OF APR 3, 2026)

The following require immediate attention:

1. **REL Module 7 — DUE TONIGHT** (Apr 3, 12:59 AM EDT — already past midnight)
   - Suri Lip Discussion
   - Eating With Cannibals Discussion
   - Module 7 Quiz
   - Only 1/7 content items started

2. **MATH HW-S4.5 (Optimization)** — due Apr 7 — currently 70.0% (Extended)
3. **MATH HW-S4.7 (Antiderivatives)** — due Apr 9 — currently 68.5% (Extended)
4. **MATH HW-S4.3 (Shapes of Graphs)** — closed — scored 31.5% (lowest HW grade)
5. **ENGR Individual Hypothesis** — due Apr 4 (tomorrow)
6. **EN-103 outstanding item** — 0/100 (no due date set)
7. **WebAssign Test 04** — locked pending Honor Code quiz

---

*Report generated by Claude browser automation — Apr 3, 2026*
*Live data from: ualearn.blackboard.com + webassign.net*
*Extension: RangeKeeper v0.2.0 (jomhhkompafdjiekgcddcaaldgmbfkjh)*
