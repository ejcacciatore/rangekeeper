# Claude Browser Agent — RangeKeeper Full Scrape Instructions

**Date issued:** April 6, 2026  
**Student:** Massimo McRae  
**Institution:** University of Arizona (UALearn Blackboard Ultra)  
**Goal:** Pull ALL current grade and message data from Blackboard and WebAssign, update RangeKeeper IndexedDB, and write a full markdown summary.

---

## Your Mission

You have Chrome browser access. Go through every Blackboard course and WebAssign section for Massimo McRae. For each, pull:
- Every grade (score, max points, assignment name, due date if shown)
- Every unread message (sender, subject, body, date)
- Any announcements posted since March 24, 2026
- Course overall grade / weighted average if displayed

At the end, write a complete markdown summary file (`rangekeeper-scrape-YYYY-MM-DD.md`) with all findings.

---

## Login

1. Go to `https://ualearn.blackboard.com`
2. Log in as Massimo McRae (use saved credentials or prompt user)
3. Confirm you land on the Blackboard Ultra dashboard

---

## Blackboard — Step-by-Step

### Step 1 — Activity Stream

1. Navigate to `https://ualearn.blackboard.com/ultra/stream`
2. Scroll through the ENTIRE activity stream — keep scrolling until no more items load
3. Record every item: type (grade, announcement, message), course, title, score, date
4. Note: grades shown here are the most recently updated

### Step 2 — Messages Inbox

1. Navigate to `https://ualearn.blackboard.com/ultra/messages`
2. Record total unread count
3. Click into EACH unread message thread:
   - Record: course, sender name, sender role (instructor/TA), date sent, full message body
   - Pay special attention to EN-103 — Prof. O'Rourke has 14+ unread messages
4. Also check sent messages for any student replies

### Step 3 — EN-103 (English Composition) — PRIORITY

Course ID: `_413210_1`

1. Go to `https://ualearn.blackboard.com/ultra/courses/_413210_1/cl/outline`
2. Navigate to Gradebook: `https://ualearn.blackboard.com/ultra/courses/_413210_1/grades`
3. Record ALL assignments: name, score, max points, status (graded/submitted/missing)
4. Go to Messages: `https://ualearn.blackboard.com/ultra/courses/_413210_1/messages`
   - **NOTE:** The RangeKeeper scraper has a bug where this URL is misclassified. You do NOT have this bug — read every message here manually.
   - Record each message from Prof. O'Rourke: date, subject, full body
5. Check Announcements tab
6. Record current overall grade if shown

### Step 4 — REL-100 (Introduction to Religion)

1. Find REL-100 on the dashboard or courses list
2. Navigate to Gradebook
3. Record ALL assignments — especially:
   - Module 7 Quiz (last known: 0/50)
   - Eating With Cannibals Discussion (last known: 0/30)
   - Suri Lip Plate Discussion (last known: 0/30)
   - Any NEW assignments added since March 24
4. Check Messages and Announcements
5. Record current overall grade

### Step 5 — MATH-125 (Pre-Calculus)

1. Navigate to MATH-125 gradebook
2. Record EVERY assignment — this course had NO individual grades in the IndexedDB cache as of March 24. Pull everything.
3. Check Messages (4 unread known)
4. Record current overall grade (~79% last estimated)

### Step 6 — ENGR-101 (Introduction to Engineering)

1. Navigate to ENGR-101 gradebook
2. Record all assignments and attendance entries — last known absences: Feb 5, Feb 26, Mar 12, Mar 26
3. Check if any new attendance entries have been added
4. Read the 5 unread messages — record sender, date, full body
5. Record current overall grade

### Step 7 — UA-101 (University Achievement)

1. Navigate to UA-101 gradebook
2. Record all assignments — note Module 6 Quiz (8%), BMC Quiz (47%), Attendance (75%)
3. Check for any new assignments or grade changes
4. Record current overall grade (~94% last estimated)

### Step 8 — Any Other Courses

1. On the Blackboard dashboard, check if there are any courses NOT listed above
2. If found, record the course name, ID, and do a full grade + message pull for each

---

## WebAssign — Step-by-Step

WebAssign is likely used for MATH-125.

1. Go to `https://www.webassign.net` and log in (may SSO from Blackboard)
2. Identify all active sections for Massimo
3. For each section:
   - Record course name and section
   - Pull all assignment scores: name, score, max, due date, submission status
   - Note any assignments past due with 0 or missing scores
   - Check for any instructor feedback/comments
4. Cross-reference WebAssign scores with what Blackboard shows for MATH-125

---

## Output — Write This Markdown File

Create a file named `rangekeeper-scrape-YYYY-MM-DD.md` (use today's date) with the following structure:

```markdown
# RangeKeeper Full Scrape — [DATE] [TIME UTC]

**Student:** Massimo McRae  
**Scraped by:** Claude browser agent  
**Sources:** Blackboard Ultra (ualearn.blackboard.com), WebAssign  

## Summary
- Total courses checked: X
- Total grades pulled: X
- Total unread messages read: X
- New zeros found: X
- Grade changes since March 24: X

## EN-103 — English Composition [CRITICAL]
### Messages from Prof. O'Rourke
| # | Date | Subject | Body (full) |
|---|------|---------|-------------|
| 1 | ... | ... | ... |

### Grades
| Assignment | Score | Max | Status |
|-----------|-------|-----|--------|

### Overall Grade: X

## REL-100 — Introduction to Religion
### Grades
...

## MATH-125 — Pre-Calculus
### Grades (WebAssign + Blackboard)
...

## ENGR-101 — Introduction to Engineering
### Messages
...
### Grades
...

## UA-101 — University Achievement
### Grades
...

## Changes Since March 24, 2026
- List any grade that changed
- List any new assignments added
- List any new zeros

## Action Items Generated
- [ ] Item 1
- [ ] Item 2
```

---

## Known Issues to Watch For

| Issue | Detail |
|-------|--------|
| EN-103 messages URL misclassification | The RangeKeeper extension mis-tags `/ultra/courses/_413210_1/messages` as `course-page`. YOU must read these manually. |
| REL-100 gradebook DOM | The Blackboard gradebook table may not render. If the grades page shows blank, use the activity stream or click into individual assignments. |
| MATH-125 cache miss | No individual MATH-125 grades were in the local IndexedDB as of March 24. Pull everything fresh. |
| WebAssign SSO | WebAssign may require a separate login or redirect through Blackboard. Try the Blackboard course link for MATH-125 first. |

---

## After Scraping

1. Push the `rangekeeper-scrape-YYYY-MM-DD.md` file to `ejcacciatore/rangekeeper` on the `master` branch
2. Update `rangekeeper/rangekeeper-massimo-grade-audit-apr3.html` with any new grade data found
3. Flag any new zeros or critical messages prominently

---

*This prompt was generated April 6, 2026 by Claude Code for use by a Claude browser agent session.*
