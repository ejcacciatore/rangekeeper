# RangeKeeper — Scraping Spec for Grade Audit HTML
## What to Collect, Where to Get It, and How to Build rangekeeper-massimo-grade-audit.html
**Student:** Massimo McRae (mmcacciatore@crimson.ua.edu)
**Term:** Spring 2026 (prefix: 202610)
**Generated:** April 3, 2026

---

## OVERVIEW

The audit HTML page requires live data from two platforms scraped in a specific order. The page has 5 course sections. Each section contains: (1) a full grade table with every gradebook item, and (2) an advisor crosscheck panel comparing advisor notes against actual BB/WebAssign data.

**Platforms:**
- Blackboard Ultra: `https://ualearn.blackboard.com`
- WebAssign (Cengage): `https://www.webassign.net` — accessed via Blackboard LTI only

**Spring 2026 BB Course IDs (hardcoded):**
```
EN-103-025:    _413210_1   (19249.202610 → actually 16102.202610)
REL-100-919:   _401764_1   (18424.202610)
UA-101-030:    _398913_1   (20272.202610)
MATH-125-007:  _389545_1   (12966.202610)
MATH-125-107:  _392267_1   (15697.202610) — recitation only
ENGR-101-006:  _397881_1   (19249.202610)
```

---

## SCRAPE SEQUENCE

Run steps in this order. Steps 1–5 can parallelize per-course. Step 6 (WebAssign) must run after Blackboard session is confirmed active.

```
Step 1: Confirm login + get course list
Step 2: Scrape each BB gradebook (5 courses, parallel tabs)
Step 3: Paginate each gradebook if "Page X of Y" shown
Step 4: Scrape /ultra/deadline for upcoming assignments
Step 5: Scrape /ultra/calendar for institution events
Step 6: Launch WebAssign via LTI → scrape grades + assignments
Step 7: Combine all data → render HTML
```

---

## STEP 1: CONFIRM LOGIN & COURSE LIST

**URL:** `https://ualearn.blackboard.com/ultra/course`
**Wait for:** Page title contains "Courses"
**Extract:**
- All course cards with term prefix = `202610`
- For each: section code, display name, BB internal ID (from card link href)
- Reject any cards with term prefix `202540`, `202640`, `NI-Math-Placement`

**DOM selector pattern:**
```javascript
// Course cards render as links — extract BB ID from href
document.querySelectorAll('[href*="/ultra/courses/"]')
// href format: /ultra/courses/_397881_1/outline → ID = _397881_1
// Section code in card text: "202610-ENGR-101-006"
```

**Failure mode:** If redirect to login page → session expired. Stop, alert user to re-login.

---

## STEP 2: SCRAPE BB GRADEBOOKS (5 COURSES)

Open all 5 gradebook URLs simultaneously in separate tabs.

### URL Pattern
```
https://ualearn.blackboard.com/ultra/courses/{BB_ID}/grades
```

### Courses to Scrape
| Course | URL |
|---|---|
| EN-103 | /ultra/courses/_413210_1/grades |
| REL-100 | /ultra/courses/_401764_1/grades |
| UA-101 | /ultra/courses/_398913_1/grades |
| ENGR-101 | /ultra/courses/_397881_1/grades |
| MATH-125-007 | /ultra/courses/_389545_1/grades |

### Wait Condition
Wait until `<main>` contains text "Grades" AND at least one table row OR "hasn't assigned work" message.
Timeout: 8 seconds. If spinner still showing after 8s, reload once.

### Per-Item Data to Extract (for each row in the gradebook table)

```javascript
{
  name: String,           // Assignment name — strip "(Content isn't available)" suffix
  dueDate: String,        // Raw date string from BB, e.g. "2/7/26" or "4/11/26"
  status: String,         // One of: "Graded" | "Unopened" | "Past due" | "Not graded"
  earnedPts: Number|null, // Points earned (null if not graded)
  maxPts: Number|null,    // Points possible (null if not graded)
  pct: Number|null,       // Computed: earnedPts/maxPts*100 (null if not graded)
  isLate: Boolean,        // true if "(Late)" appears in row
  attempts: String|null,  // e.g. "1 attempt submitted", "Unlimited attempts possible"
  isTotalRow: Boolean     // true if row label contains "Total" or "Midterm Points" etc.
}
```

### DOM Extraction Logic
```javascript
// Blackboard Ultra gradebook renders rows as table rows within <main>
// Get all text content from <main> and parse linearly
const mainText = document.querySelector('main').innerText;

// Each gradebook row follows this pattern in text:
// [Item Name] [(Late)] [attempts info] [due date] [status] [X/Y] [Final Grade: X points...]
// Use regex to extract score:
const scorePattern = /Final Grade: ([d.]+) points? out of ([d.]+) points? possible/g;

// Late flag:
const isLate = rowText.includes('(Late)') || rowText.includes('Past due');

// Status:
// "Graded" → row contains "Final Grade:"
// "Unopened" → row contains "Unopened" 
// "Past due" → row contains "Past due"
// "Not graded" → row contains "Not graded" and no score
```

### Special Cases to Handle

**MATH-125-007 gradebook:** Will show "hasn't assigned work yet" — this is expected. Do NOT treat as error. Flag course as `gradebookSource: 'webassign'` and proceed to Step 6.

**Overall grade badge:** Some courses show "Current Grade C+" as a badge before the table. Extract this:
```javascript
// Look for text matching "Current Grade [letter]" near top of <main>
const overallMatch = mainText.match(/Current Grade ([A-F][+-]?)/);
```

**Accommodation notice:** "Has accommodations" text appears on every gradebook — extract as a boolean flag, do not treat as a grade item.

**"Total Grade" rows:** BB injects a total row mid-table (e.g., "Total Grade 55/69"). Extract separately as `courseTotal`.

---

## STEP 3: PAGINATE GRADEBOOKS

After initial load, check for pagination:
```javascript
// Look for "Page 1 of 2" text in <main>
const paginationText = document.querySelector('main').innerText;
const pageMatch = paginationText.match(/Page (\d+) of (\d+)/);
const totalPages = pageMatch ? parseInt(pageMatch[2]) : 1;
```

If `totalPages > 1`, click next page button:
```javascript
// Find and click the next page arrow
// DO NOT click row items — they navigate to assessment detail pages
// The next page control is near bottom of page, looks like ">" arrow
// Use ARIA label approach:
const nextBtn = document.querySelector('[aria-label*="Next Page"], [aria-label*="next page"]');
// Wait 2s after click, then re-run extraction and merge results
```

**Known pagination behavior:**
- ENGR-101: 2 pages (all items visible in page 1 text, page 2 is an assessment detail — skip it)
- REL-100: 2 pages (page 2 has modules 9–10 items)
- EN-103, UA-101, MATH-125: 1 page each

---

## STEP 4: SCRAPE UPCOMING DEADLINES

**URL:** `https://ualearn.blackboard.com/ultra/deadline`
(NOT /ultra/calendar — deadline view gives a flat chronological list, more reliable)

**Wait for:** Page title = "Calendar" AND list items visible

**Extract each deadline item:**
```javascript
{
  name: String,       // Assignment name
  dueDate: String,    // Full date string, e.g. "4/3/26, 12:59 AM (EDT)"
  courseCode: String, // e.g. "202610-REL-100-919" (from "∙ 18424.202610: 202610-REL-100-919")
  dateLabel: String   // Day label: "Today", "Saturday - April 4, 2026", etc.
}
```

**Filter:** Keep only items where courseCode contains `202610`

**Timezone note:** All times display in EDT (UTC-4). Times showing "12:59 AM EDT" = "11:59 PM CDT previous day." This is Agyei's standard deadline pattern. When displaying to user, show both times:
```
Due: Thu Apr 9 at 11:59 PM (CDT) / Fri Apr 10 at 12:59 AM (EDT)
```

**Known upcoming items (as of Apr 3, 2026 — use as validation):**
| Due | Assignment | Course |
|---|---|---|
| Apr 3 (past) | Suri Lip Discussion | REL-100 |
| Apr 3 (past) | Eating With Cannibals Discussion | REL-100 |
| Apr 3 (past) | Module 7 Quiz | REL-100 |
| Apr 4 | Individual Hypothesis Assignment | ENGR-101 |
| Apr 10 | Heaven's Gate Reaction Discussion | REL-100 |
| Apr 10 | Making the Strange Familiar Discussion | REL-100 |
| Apr 10 | Module 8 Quiz | REL-100 |
| Apr 11 | Professional Development 5 | ENGR-101 |
| Apr 11 | Professional Development 6 | ENGR-101 |
| Apr 11 | Take Thriving Survey C | UA-101 |
| Apr 11 | Assignment: Financial Planning (Materials) | UA-101 |
| Apr 17 | Rituals Discussion | REL-100 |
| Apr 17 | Module 9 Quiz | REL-100 |
| Apr 18 | Student Success Analysis | ENGR-101 |
| Apr 24 | Religion and Civic Discourse Discussion | REL-100 |
| Apr 24 | Free Exercise of Religion Discussion | REL-100 |
| Apr 24 | Module 10 Quiz | REL-100 |

---

## STEP 5: SCRAPE CALENDAR (INSTITUTION EVENTS ONLY)

**URL:** `https://ualearn.blackboard.com/ultra/calendar`
**Purpose:** Capture institution events (class cancellations, UA-wide events) that affect the student's schedule.

**Extract:**
- Event name
- Date
- Type: "Institution" | "Personal" | "Course"
- Keep only: Institution events + any events in the current week

**Known events (Apr 3 week):**
- Honors Week: Apr 1–7 (Institution)
- Honors Day — Classes Dismissed (UA offices open): Apr 4 (Institution)
- "New Event 2/1/26": Personal recurring event — Massimo-created, ignore in report

---

## STEP 6: WEBASSIGN SCRAPE (MATH-125 ONLY)

WebAssign cannot be accessed directly. Must launch via Blackboard LTI.

### Access Sequence
```
1. Navigate to: https://ualearn.blackboard.com/ultra/courses/_389545_1/outline
2. Wait for page title: "Content / 202610-MATH-125-007"
3. Find element with text "Cengage WebAssign" — it is an LTI link
4. Click it — a new tab opens at webassign.net
5. Wait for new tab title: "MATH 125, section 007, Spring 2026 - Home | WebAssign"
6. Confirm URL contains "webassign.net/v4cgi/student.pl"
```

### 6A: Scrape Home Page (Current Assignments)
```
URL: auto-assigned after LTI launch (action=home/index)
```
**Extract:**
```javascript
{
  overallGrade: Number,   // e.g. 95.3769867
  overallLetter: String,  // e.g. "A"
  currentAssignments: [
    {
      name: String,          // e.g. "HW-S4.5-Optimization Problems"
      type: String,          // "Homework" | "Test" | "Recitation" | "HonorCode_CellPhone"
      dueDate: String,       // e.g. "Tuesday, April 7, 2026 at 12:59 AM EDT"
      isExtended: Boolean,   // true if "Extended" badge visible
      isLocked: Boolean,     // true if "You must achieve X% to access" message shown
      lockCondition: String  // e.g. "70% on UA Honor Code and Cell Phone Policy: Test 4"
    }
  ]
}
```

### 6B: Scrape Grade Breakdown
**Navigate:** Click "Grades" in WebAssign top nav
**Wait for:** Page title "MATH 125, section 007, Spring 2026 - Grades | WebAssign"

**Extract overall:**
```javascript
{
  totalGrade: 95.37,
  totalLetter: "A",
  lastUpdated: "Apr 3, 2026 at 1:08 AM EDT",
  nextUpdate: "Apr 4, 2026 at 1:00 AM EDT",
  categories: [
    { name: "Homework", count: 21, scorePct: 94.50, weightedPct: 13.50 },
    { name: "Test",     count: 3,  scorePct: 92.88, weightedPct: 59.71 },
    { name: "Recitation", count: null, scorePct: 103.43, weightedPct: 22.16 }
  ]
}
```

**Expand per-assignment detail:** Click the chevron/expand button on each category row.
```javascript
// Click expand button for Homework
document.querySelector('[aria-label*="Expand Homework"]').click();
// Wait 1.5s
// Click expand button for Test
document.querySelector('[aria-label*="Expand Test"]').click();
// Wait 1.5s
// Then extract <main> text for all rows
```

**Per-assignment extraction pattern from expanded table:**
```
"HW-S1.0-Basic Algebra and Trigonometric  17.00 / 18.00 (94.44%)  4.49"
name = first segment | rawScore = "17.00" | maxScore = "18.00" | pct = 94.44 | weighted = 4.49
```

### 6C: Scrape Past Assignments
**Navigate:** Click "My Assignments" in top nav → click "Past Assignments" tab
**Wait for:** Tab switches, table header shows "PAST ASSIGNMENTS"

**Per-row extraction:**
```javascript
{
  name: String,
  type: String,             // from "(Homework)" "(Recitation)" etc in parens
  dueDate: String,
  score: Number|null,
  maxScore: Number|null,
  pct: Number|null,
  isExtended: Boolean,      // "Extended" badge
  canRequestExtension: Boolean  // "Request Extension" link visible
}
```

**Known past assignments (29 items — use as validation):**
| Name | Due | Score | Pct |
|---|---|---|---|
| HW-S1.0-Basic Algebra and Trig | Jan 13 | 17/18 | 94.4% |
| Recitation-01 | Jan 13 | 42/40 | 105% |
| Recitation-02 | Jan 20 | 30/30 | 100% |
| HW-S1.6-Limits Involving Infinity | Jan 24 | 25/25 | 100% |
| HW-S1.3-Limit of a Function | Jan 25 | 31.5/31.5 | 100% |
| HW-S1.4-Calculating Limits | Jan 25 | 19/19 | 100% |
| HW-S1.5-Continuity | Jan 26 | 20/21 | 95.2% |
| HW-S2.1-Derivatives and Rates of Change | Jan 27 | 24/24 | 100% |
| Recitation-03 | Feb 3 | 33/30 | 110% |
| HW-S2.2-The Derivative as a Function | Feb 4 | 27.5/27.5 | 100% |
| HW-S2.3-Basic Differentiation Formulas | Feb 5 | 26.71/26.71 | 100% |
| HW-S2.4-Product and Quotient Rules | Feb 7 | 13.62/13.62 | 100% |
| Recitation-04 | Feb 10 | 19/20 | 95% |
| HW-S2.5-The Chain Rule | Feb 11 | 23/23 | 100% |
| HW-S2.6-Implicit Differentiation | Feb 14 | 11/11 | 100% |
| HW-S2.7-Related Rates | Feb 17 | 10/8 | 125% |
| UA Honor Code: Test 2 | Feb 17 | 2/2 | 100% |
| HW-S2.8-Linear Approx and Differentials | Feb 24 | 12/12 | 100% |
| Recitation-05 | Feb 24 | 33/30 | 110% |
| HW-S3.3-Derivatives of Log and Exp | Feb 28 | 16/16 | 100% |
| HW-S3.5-Inverse Trig Functions | Mar 3 | 22/22 | 100% |
| Recitation-06 | Mar 3 | 44/40 | 110% |
| HW-S4.1-MaxMin Values | Mar 7 | 35/35 | 100% |
| HW-S4.2-Mean Value Theorem | Mar 10 | 17/17 | 100% |
| UA Honor Code: Test 3 | Mar 10 | 2/2 | 100% |
| Recitation-07 | Mar 24 | 35/40 | 87.5% |
| HW-S4.4-Curve Sketching | Mar 26 | 22/22 | 100% |
| HW-S4.3-Shapes of Graphs | Mar 31 | 18.9/60 | 31.5% ⚠ |
| Recitation-08 | Mar 31 | 16.5/15 | 110% |

### WebAssign Session Notes
- Session tokens rotate per navigation — never hardcode a WebAssign URL
- LTI token format in URL: `?l=`, `?d=`, `?u=` — all time-stamped, expire within the session
- Always launch from BB outline LTI click, never navigate directly to webassign.net

---

## STEP 7: DATA ASSEMBLY FOR HTML

After all scrapes complete, assemble one data object:

```javascript
const auditData = {
  student: {
    name: "Massimo McRae",
    email: "mmcacciatore@crimson.ua.edu",
    term: "Spring 2026",
    hasAccommodations: true
  },
  generatedAt: new Date().toISOString(),
  courses: {
    en103: {
      title: "EN 103 — English Composition",
      section: "202610-EN-103-025",
      instructor: "O'Rourke",
      bbId: "_413210_1",
      overallGrade: null,       // BB shows no computed overall
      overallLetter: null,
      gradeSource: "blackboard",
      gradebookItems: [ /* array of grade items */ ],
      advisorNote: {
        overallGrade: "not stated",
        pendingIssue: "Annotated Bibliography grade dispute — 0/100 currently in BB",
        currentWork: "Research Paper due 4/10",
        otherNotes: "Finish journal and bring to class"
      }
    },
    rel100: { /* ... */ },
    ua101:  { /* ... */ },
    math125: {
      title: "MATH 125 — Calculus I",
      section: "202610-MATH-125-007",
      instructor: "Jedidiah Agyei",
      bbId: "_389545_1",
      overallGrade: 95.37,
      overallLetter: "A",
      gradeSource: "webassign",          // KEY: not blackboard
      gradebookItems: [ /* webassign items */ ],
      webassignCategories: [ /* HW / Test / Recitation */ ]
    },
    engr101: { /* ... */ }
  }
};
```

---

## STEP 8: ADVISOR CROSSCHECK RULES

For each course, run these checks programmatically and output results into the crosscheck panel:

### EN 103
```javascript
checks: [
  {
    claim: "Grade pending — waiting on Annotated Bib update",
    bbValue: annotatedBibItem.earnedPts + "/" + annotatedBibItem.maxPts,
    match: false,  // BB shows 0/100 — still not updated
    flag: "DIFF",
    note: "BB shows 0/100 (Late). Grade not yet updated by instructor."
  },
  {
    claim: "Research Paper due 4/10",
    bbValue: "Item exists in gradebook, status Upcoming",
    match: true,
    flag: "MATCH"
  }
]
```

### REL 100
```javascript
// Check: Overall C+
const relTotal = rel100.gradebookItems.find(i => i.isTotalRow);
const relPct = relTotal.earnedPts / relTotal.maxPts * 100;  // 79.6
const match_grade = relPct >= 77 && relPct < 80;  // C+ range

// Check: Module 7 is late
const mod7Items = rel100.gradebookItems.filter(i =>
  i.name.includes("Suri Lip") || i.name.includes("Eating With") || i.name.includes("Module 7 Quiz")
);
const mod7AllLate = mod7Items.every(i => i.isLate && i.earnedPts === 0);

// Check: Module 6 = 100%
const mod6Quiz = rel100.gradebookItems.find(i => i.name === "Module 6 Quiz");
const mod6Match = mod6Quiz.earnedPts === mod6Quiz.maxPts;
```

### UA 101
```javascript
// Check: ~94% overall
const ua101Midterm = ua101.gradebookItems.find(i => i.name.includes("Midterm Points"));
const ua101Pct = ua101Midterm.earnedPts / ua101Midterm.maxPts * 100;  // 94.8
const match_94 = Math.round(ua101Pct) === 94 || Math.round(ua101Pct) === 95;

// Check: Thriving Survey C upcoming
const surveyC = ua101.gradebookItems.find(i => i.name.includes("Thriving Survey C"));
const match_surveyC = surveyC && surveyC.dueDate.includes("4/11");
```

### MATH 125
```javascript
// Check: ~95% overall
const match_math = Math.round(math125.overallGrade) === 95;  // 95.37 → 95 ✓

// Check: extended assignments exist
const extendedItems = math125.gradebookItems.filter(i => i.isExtended);
const match_extended = extendedItems.length > 0;

// Due date offset check (CST vs EDT = 1 day)
// Advisor says "HW 5.1 due Mon 4/6" → WebAssign shows "Tue Apr 7 12:59 AM EDT"
// These are the same deadline. Flag as INFO not DIFF.
const timezoneOffset = true;  // always true for this instructor
```

### ENGR 101
```javascript
// Check: B+ claim vs BB
const engrTotal = engr101.gradebookItems.find(i => i.isTotalRow);
const engrPct = engrTotal.earnedPts / engrTotal.maxPts * 100;  // 79.7%
// 79.7% = B– not B+. Flag as DIFF.
const match_grade = engrPct >= 87;  // false — B+ threshold

// Check: Raw Data Assignment
const rawData = engr101.gradebookItems.find(i =>
  i.name.toLowerCase().includes("raw data")
);
const match_rawData = rawData !== undefined;  // false — item not found in BB

// Check: Absences
const absences = engr101.gradebookItems.filter(i =>
  i.name.startsWith("Attendance") && i.earnedPts === 0
);
// Expected: Feb 5, Feb 26, Mar 12, Mar 26 (4 absences)
```

---

## STEP 9: HTML RENDERING RULES

### Color / Status Logic
```javascript
function pctClass(pct) {
  if (pct === null) return 'pct-pending';
  if (pct >= 90) return 'pct-A';
  if (pct >= 80) return 'pct-B';
  if (pct >= 70) return 'pct-C';
  if (pct >= 60) return 'pct-D';
  if (pct === 0)  return 'pct-zero';
  return 'pct-F';
}

function statusClass(status) {
  if (status === 'Graded') return 'status-graded';
  if (status === 'Past due') return 'status-pastdue';
  if (status === 'Unopened') return 'status-unopened';
  if (status === 'Extended') return 'status-extended';
  return 'status-notgraded';
}

function advisorFlag(flag) {
  // MATCH = ✓ green, DIFF = ✗ red, INFO = ℹ blue, WARN = ⚠ yellow
}
```

### Grade Summary Cards (top of page)
One card per course. Show: course code, current grade (letter + number), data source (BB or WebAssign), and one-line advisor match status.

### Per-Course Grade Table
- Columns: Assignment Name | Due Date | Status | Score (X/Y) | Percentage
- Group rows by module/category using a blue header row
- Late flag: red badge on assignment name
- Extended flag: purple badge on assignment name
- Locked flag: gray badge on assignment name
- Total row: bold, gray background

### Advisor Crosscheck Panel
Rendered below each course table. Shows each claim with icon + explanation:
- ✓ (green) = verified match
- ✗ (red) = discrepancy found
- ℹ (blue) = informational note, no discrepancy
- ⚠ (yellow) = warning — needs human attention

---

## KNOWN SCRAPING FAILURES & FALLBACKS

| Failure | Detection | Fallback |
|---|---|---|
| BB session expired | Redirect to login page | Alert user, halt |
| Gradebook spinner never clears | Title still contains "ualearn.blackboard.com" after 8s | Reload once, retry |
| MATH-125 BB gradebook empty | Text contains "hasn't assigned work" | Use WebAssign data, set gradeSource='webassign' |
| WebAssign LTI session expired | webassign.net shows login page | Re-click BB LTI link |
| REL page 2 stuck on page 1 | Page text still shows "Page 1 of 2" after click | Use JS to change page param in URL or wait+retry |
| ENGR "next page" clicks assessment detail | URL changes to /assessment/ path | Navigate back, data already captured from page 1 |
| Discussions 404 | /ultra/courses/{id}/discussions → 404 | Skip, note as blind spot |
| Attendance direct URL 404 | /ultra/courses/{id}/attendance → 404 | Use in-course panel click only |
| WebAssign token expired mid-session | URL changes to login or empty response | Re-launch via BB LTI |
| "Raw Data Assignment" not in BB | Search returns nothing | Mark as "advisor-noted / not in BB — unverifiable" |

---

## OUTPUT FILE SPEC

**Filename:** `rangekeeper-massimo-grade-audit-[YYYY-MM-DD].html`
**Type:** Single self-contained HTML file, no external dependencies
**Size target:** 45–60KB
**Must include:** All CSS inline in `<style>` tag, all data baked into HTML (no JS data fetching at render time)
**Download trigger:**
```javascript
const blob = new Blob([htmlString], {type: 'text/html'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `rangekeeper-massimo-grade-audit-${new Date().toISOString().slice(0,10)}.html`;
a.click();
URL.revokeObjectURL(url);
```

**Save location:** Browser default Downloads folder (user-configured in Chrome settings)

---

## VALIDATION CHECKLIST

Before downloading the HTML, verify:
- [ ] All 5 courses have a section header
- [ ] MATH-125 grade source = WebAssign (not empty BB)
- [ ] REL-100 shows Module 7 as Past Due with 0 pts on all 3 items
- [ ] ENGR-101 shows 4 absences (Feb 5, Feb 26, Mar 12, Mar 26) as 0/1
- [ ] EN-103 Annotated Bibliography shows 0/100 (Late) — NOT updated yet
- [ ] UA-101 midterm shows 55.3/58.33
- [ ] Advisor crosscheck panel present for all 5 courses
- [ ] ENGR grade discrepancy (79.7% vs claimed B+) flagged as DIFF
- [ ] "Raw Data Assignment" flagged as unverifiable
- [ ] Total item count: EN103=3, REL=24, UA101=17, MATH=36, ENGR=24

---

*Spec generated: April 3, 2026*
*Extension: RangeKeeper v0.2.0*
*All data verified live against ualearn.blackboard.com and webassign.net*
