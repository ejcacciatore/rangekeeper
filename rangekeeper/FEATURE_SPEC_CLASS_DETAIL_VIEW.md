# RangeKeeper Phase 2: Class Detail View & Enhanced Dashboard

**Status:** Spec locked — Ready for development  
**Date:** March 30, 2026  
**Optimized for:** Neurodivergent (ASD) students

---

## Overview

Transform RangeKeeper from a simple dashboard into a **class-centric command center** where students can:
1. Click a class → see all assignments, grades, messages for that class
2. Understand urgency at a glance (priority colors + gentle pulse indicators)
3. Quickly jump to Blackboard for detailed work
4. Manage everything with sensory-friendly design

---

## Part 1: Class Detail Page (New)

### Layout & Navigation
- **Type:** Full page replacement (not modal/sidebar)
- **Navigation:** Back button → returns to class list (main dashboard)
- **URL structure:** `/class/:courseId` (hash-based routing)

### Content Sections (Top to Bottom)

#### 1. Header
- Class name (e.g., "202610-EN-103-025")
- "Back to Classes" button
- "Open in Blackboard" button (deep link to course)

#### 2. Assignments (Overdue/Today First)
**Sorting order:**
1. Overdue + Failed (red, pulsing)
2. Due Today (red, pulsing)
3. Due This Week (yellow)
4. Due Later (green)

**Per assignment show:**
- Title
- Due Date & Time
- Current Grade (if graded) or "Pending"
- Status (Not Started, In Progress, Submitted, Graded)
- Priority color bar on left edge
- **Optional:** Link to assignment in Blackboard

**Visual indicator for urgent:**
- **Red pulsing light** (fade in/out, 2-3 second cycle)
- Triggers on: Overdue OR Due Today OR Failed/Low Grade
- ASD-friendly: gentle pulse (not harsh blink)

#### 3. Grades Section
- Overall class grade (if available)
- Grade breakdown by category (if available)
- Recent graded assignments summary
- Trend indicator (improving, stable, declining)

#### 4. Messages Section
- Unread message count for this class
- Last 5 messages (preview text)
- Link to class message thread in Blackboard

#### 5. Study Tips & Important Information
**Sources (mixed):**
- **AI-generated:** Based on assignment type + performance
- **Teacher-provided:** From Blackboard announcements
- **Student-customizable:** User can add personal notes
- Display as cards with source label

---

## Part 2: Main Dashboard Enhancements

### Class List (No Changes)
- Keep existing layout
- Classes remain clickable to open detail view

### Upcoming Assignments Section (Enhanced)

#### Default View
- **All assignments from all classes** mixed chronologically
- Show class name for each assignment
- Apply same priority colors & pulse indicators

#### Filters (Toggleable)
Students can filter by any combination of:

1. **Due Date**
   - Overdue
   - Due Today
   - Due This Week
   - Due This Month
   - Due Later

2. **Status**
   - Not Started
   - In Progress
   - Submitted
   - Graded
   - Failed (grade < 60%)

3. **Priority** (derived from date + grade)
   - Red/Urgent (overdue, today, or failed)
   - Yellow/Soon (due within 3 days)
   - Green/Later (due >3 days away)

4. **Class**
   - Multi-select by course ID
   - "All Classes" toggle

#### Filter UI
- **Toggle buttons** (not dropdowns) for ASD accessibility
- Show active filter count
- "Clear All Filters" button
- Filtered results update in real-time
- Show "X of Y assignments" counter

---

## Part 3: Visual Design (ASD-Optimized)

### Color Palette
- **Red:** Urgent (overdue, today, failed)
- **Yellow:** Soon (due within 3 days)
- **Green:** Later (due >3 days)
- **Gray:** Completed/graded

### Priority Indicators
- **Color bar** on left edge of each assignment card
- **Pulse animation** for red/urgent only:
  - Fade in over 1.5 seconds
  - Hold for 0.5 seconds
  - Fade out over 1 second
  - Repeat (gentle, predictable rhythm)

### Sensory Considerations
- ✅ No constant blinking (triggers overstimulation)
- ✅ Consistent rhythm (predictable = calming)
- ✅ High contrast text (accessibility)
- ✅ Clear hierarchy (reduce cognitive load)
- ✅ Whitespace (avoid clutter)

---

## Part 4: Technical Implementation

### Data Structure
```javascript
// Class detail page needs:
{
  courseId: "202610-EN-103-025",
  courseName: "English 103",
  assignments: [
    {
      id: "...",
      title: "Taste of the Town Turn In",
      dueDate: "2026-03-30T23:59:00Z",
      currentGrade: "2/26",
      status: "graded",
      priority: "urgent", // derived from dueDate + grade
      blackboardUrl: "https://ualearn.blackboard.com/ultra/courses/_413210_1/assessments/_123456"
    }
  ],
  grades: {
    overallGrade: "B-",
    byCategory: [ ... ]
  },
  messages: [ ... ],
  studyTips: [ ... ],
  teacherAnnouncements: [ ... ]
}
```

### Navigation Flow
```
Main Dashboard
  ↓ (click class)
Class Detail Page
  ↓ (back button)
Main Dashboard
  
  OR
  
Class Detail Page
  ↓ (Blackboard link)
Blackboard Course (new tab)
```

### Filter Implementation
- Store filter state in component state (not URL)
- Filters apply to dashboard "Upcoming Assignments" only
- Persist filter preference in localStorage (optional)

---

## Part 5: Priority Logic

### How Priority is Determined

```
if (overdue) → priority = "urgent" (red, pulsing)
else if (dueDateToday) → priority = "urgent" (red, pulsing)
else if (failed || lowGrade) → priority = "urgent" (red, pulsing)
else if (dueSoon < 3 days) → priority = "soon" (yellow)
else if (dueLater) → priority = "later" (green)
else if (completed) → priority = "done" (gray)
```

### Blinking Light Rules
- **Only blink if priority = "urgent"**
- **Pulse animation** (gentle fade, not blink)
- **No sound** (accessibility)

---

## Part 6: Blackboard Deep Links

### Course Link
```
https://ualearn.blackboard.com/ultra/courses/{courseId}
```
Example: `https://ualearn.blackboard.com/ultra/courses/_413210_1`

### Assignment Link (if available)
```
https://ualearn.blackboard.com/ultra/courses/{courseId}/assessments/{assessmentId}
```

### Message Link
```
https://ualearn.blackboard.com/ultra/messages?courseId={courseId}
```

---

## Part 7: Phased Rollout

### Phase 2.1 (Current Sprint)
- [ ] Class detail page skeleton
- [ ] Assignments section with priority colors
- [ ] Grades section
- [ ] Blackboard deep links

### Phase 2.2
- [ ] Messages section
- [ ] Study tips integration
- [ ] Filter UI on main dashboard

### Phase 2.3
- [ ] AI-generated study tips
- [ ] Teacher announcements sync
- [ ] Student notes/customization

---

## Success Criteria

✅ Student can click a class and see all info for that class  
✅ Priority colors & pulse indicators work correctly  
✅ Blinking is gentle (pulse, not harsh)  
✅ Blackboard links open directly to relevant course  
✅ Dashboard filters work for all 4 dimensions (date, status, priority, class)  
✅ ASD-friendly: no sensory overload, consistent design  
✅ Mobile-responsive: works on phone, tablet, desktop  

---

## Notes

- **Estimated effort:** 40-60 hours (Phases 2.1-2.3)
- **Blocker:** Need to enhance scraper to capture more grade detail
- **Nice-to-have:** Notifications when urgent assignment appears
