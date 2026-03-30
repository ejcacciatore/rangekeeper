# RangeKeeper Phase 3: Outlook Calendar Integration

**Status:** Spec locked — Phase 3 (after Phase 2.1 class detail page launches)  
**Date:** March 30, 2026  
**User:** Massimo (neurodivergent student)

---

## Overview

Integrate Microsoft Outlook calendar with RangeKeeper for **complete academic + personal timeline visibility**:
- See Outlook events + RangeKeeper assignments in one merged timeline
- Auto-sync assignments from RangeKeeper → Outlook (real-time)
- Pull all Outlook events → RangeKeeper dashboard
- OAuth authentication (secure, one-click setup)

---

## Part 1: Two-Way Sync

### Outlook → RangeKeeper (Pull All Events)

**What syncs:**
- All calendar events from all Outlook calendars
- Event details: Title, Start Time, End Time, Description, Location, Recurrence
- Update frequency: Real-time (on page load, every 5 minutes, or webhook)

**How it appears:**
- Merged into "Upcoming Assignments" timeline on main dashboard
- Visual distinction from assignments (lighter card style, calendar icon)
- Filterable by type (Assignment vs. Event)
- Shows on class detail page if event relates to that class

### RangeKeeper → Outlook (Push Assignments)

**What syncs to Outlook:**
- All assignments from RangeKeeper
- Fields: Title + Due Date + Grade + Class Name + Link to Blackboard + Description/Notes
- Create in dedicated "RangeKeeper" calendar (or configurable)
- Update frequency: Real-time (when assignment changes)

**Example Outlook entry:**
```
Title: Taste of the Town Turn In
Due: Monday, March 30, 2026 @ 11:59 PM
Calendar: RangeKeeper
Description:
  Class: 202610-EN-103-025
  Current Grade: 2/26 [graded]
  Status: Submitted
  Link: https://ualearn.blackboard.com/ultra/courses/_413210_1/assessments/_123456
```

**What triggers a sync:**
- Assignment created (new from Blackboard scraper)
- Grade updated
- Status changed (Not Started → In Progress → Submitted → Graded)
- Due date changed
- Deletion (remove from Outlook if removed from Blackboard)

---

## Part 2: Authentication (OAuth 2.0)

### Flow

1. **User clicks "Connect Outlook"** on dashboard settings
2. **Redirected to Microsoft login**
3. **User grants permission** (calendar read/write)
4. **Token stored** in browser (IndexedDB, encrypted)
5. **Sync begins automatically**

### Scopes Required

```
Calendars.ReadWrite
user.read
```

### Token Management

- **Store:** IndexedDB (encrypted with browser key)
- **Refresh:** Auto-refresh when expired (30-day token typically)
- **Revoke:** "Disconnect Outlook" button clears token + stops sync

### Security

- ✅ OAuth (no password stored)
- ✅ Encrypted token storage
- ✅ User can revoke at any time
- ✅ No personal data sent to external servers (sync is client-side)

---

## Part 3: Dashboard Integration

### Main Dashboard Changes

**New section: "Settings" / "Integrations"**
- [ ] Connect Outlook button (if not connected)
- [ ] "Connected to Outlook" status (if connected)
- [ ] "Disconnect Outlook" button
- [ ] Last sync time
- [ ] Manual "Sync Now" button

### Upcoming Assignments Section (Enhanced)

**New filter option:**
- **Type:** Assignment, Calendar Event, Both (default)

**Visual distinction:**
- **Assignments:** Color bars (red/yellow/green) + priority pulse
- **Calendar Events:** Calendar icon + muted colors (e.g., light blue)

**Combined timeline example:**
```
TODAY
  🔴 [URGENT] Taste of the Town Turn In - 11:59 PM (EN-103) ← Assignment
  📅 Study Group Meeting - 2:00 PM ← Calendar Event
  🔴 [URGENT] Math Problem Set - 11:59 PM (MATH-125) ← Assignment

THIS WEEK
  📅 Dentist Appointment - Wed 3 PM
  🟡 [SOON] Essay Draft Due - Fri 5 PM (EN-200)
  📅 Library Reservation - Thu 6 PM
```

### Class Detail Page Changes

**If calendar event relates to this class:**
- Show in "Upcoming" section alongside assignments
- Example: "Study Group Meeting" for English 103 appears on EN-103 detail page

---

## Part 4: Technical Implementation

### Backend (Node.js)

**New endpoints:**

```
POST /api/outlook/connect
  Body: { authCode }
  Response: { success, token }

POST /api/outlook/sync
  Body: { assignments }
  Response: { syncedCount, errors }

GET /api/outlook/events
  Response: { events: [...] }

POST /api/outlook/disconnect
  Response: { success }
```

**Microsoft Graph API calls:**
- `GET /me/calendar/events` (fetch Outlook events)
- `POST /me/calendars/{id}/events` (create assignment event)
- `PATCH /me/calendars/{id}/events/{eventId}` (update assignment)
- `DELETE /me/calendars/{id}/events/{eventId}` (delete assignment)

### Frontend (React)

**New components:**
- `OutlookConnect.jsx` — OAuth login button
- `OutlookStatus.jsx` — Connection status + sync controls
- `MergedTimeline.jsx` — Combined assignments + calendar events
- `EventCard.jsx` — Calendar event display

**New hooks:**
- `useOutlookSync()` — Handle real-time sync
- `useOutlookEvents()` — Fetch Outlook events
- `useOutlookAuth()` — OAuth flow

**Data flow:**
```
Dashboard
  ├── OutlookStatus (shows connection)
  ├── MergedTimeline
  │   ├── Assignment cards (existing)
  │   ├── EventCard (new, Outlook events)
  │   └── Filter by Type
  └── Settings → OutlookConnect
```

### Data Structure

```javascript
// Outlook event (pulled into RangeKeeper)
{
  id: "outlook_...",
  title: "Study Group",
  startTime: "2026-03-30T14:00:00Z",
  endTime: "2026-03-30T15:30:00Z",
  description: "...",
  location: "Library",
  type: "event",
  source: "outlook"
}

// Assignment (pushed to Outlook)
{
  id: "assignment_...",
  title: "Essay Draft",
  dueDate: "2026-04-05T23:59:00Z",
  type: "assignment",
  source: "rangekeeper",
  outlookEventId: "outlook_..." // Reference to created Outlook event
}
```

---

## Part 5: Sync Strategy

### Real-Time Sync (Recommended)

**Triggers:**
- On page load (check for changes)
- Every 5 minutes (periodic sync in background)
- On assignment change in RangeKeeper (immediate push)
- On Outlook event change (pull on next page load)

**Conflict resolution:**
- Assignment in Outlook more recent? Update RangeKeeper
- RangeKeeper assignment more recent? Update Outlook
- User's manual Outlook edit wins (don't override)

### Manual Sync Option

- "Sync Now" button for explicit user control
- Shows sync status (syncing... done)
- Shows sync errors if any

---

## Part 6: User Experience

### Initial Setup
1. User clicks "Connect Outlook" in Settings
2. Redirected to Microsoft login (new window/tab)
3. User signs in + grants permission
4. Returns to RangeKeeper (connection confirmed)
5. Sync starts automatically

### Daily Use
- Outlook events appear automatically on dashboard
- Assignments appear in Outlook automatically
- Updates sync in real-time
- No manual action needed

### Disconnect
- User clicks "Disconnect Outlook"
- Confirmation: "Stop syncing? (RangeKeeper events will remain in Outlook)"
- Token revoked, sync stops

---

## Part 7: Error Handling

**Scenarios:**
- Token expired → Auto-refresh (silent)
- Network error → Queue sync, retry in 5 min
- Outlook API down → Show warning, keep local data
- Permission denied → Show setup instructions
- Calendar full (rare) → Show error, stop sync for that item

**User messaging:**
- ✅ "Outlook synced 5 minutes ago"
- ⚠️ "Outlook sync paused (reconnect required)"
- ❌ "Sync failed: Please try again"

---

## Part 8: Phased Rollout (Phase 3)

### Phase 3.1 (Week 1)
- [ ] OAuth setup (Microsoft Graph API credentials)
- [ ] Backend endpoints (`/outlook/connect`, `/outlook/sync`)
- [ ] Token storage (IndexedDB encryption)
- [ ] "Connect Outlook" UI

### Phase 3.2 (Week 2)
- [ ] Pull Outlook events (→ RangeKeeper)
- [ ] Merge into timeline
- [ ] Filter by type (Assignment vs. Event)

### Phase 3.3 (Week 3)
- [ ] Push assignments (→ Outlook)
- [ ] Real-time sync on assignment change
- [ ] Conflict resolution

### Phase 3.4 (Week 4)
- [ ] Testing + edge cases
- [ ] User documentation
- [ ] Launch to Massimo

---

## Success Criteria

✅ User can connect Outlook with one click (OAuth)  
✅ Outlook events appear on RangeKeeper dashboard  
✅ RangeKeeper assignments appear in Outlook (in "RangeKeeper" calendar)  
✅ Updates sync in real-time (assignment grade → Outlook)  
✅ Timeline merges assignments + events (chronological, filterable)  
✅ User can disconnect at any time  
✅ Sync failures handled gracefully (no data loss)  
✅ Mobile-responsive (works on phone)  

---

## Dependencies

- **Microsoft Graph SDK** (npm: `@microsoft/microsoft-graph-client`)
- **OAuth library** (npm: `@react-oauth/google` or similar for MSA)
- **Encryption** (npm: `tweetnacl.js` or `libsodium.js` for token storage)

---

## Estimated Effort

- Phase 3.1: 16 hours
- Phase 3.2: 12 hours
- Phase 3.3: 16 hours
- Phase 3.4: 8 hours
- **Total:** ~52 hours (6-7 week sprint)

---

## Notes

- **Dependency:** Phase 2.1 (class detail page) must be live first
- **Testing:** Use Massimo's actual Outlook account (sandbox testing)
- **Privacy:** No data leaves client (except to Microsoft/Blackboard APIs)
- **Backup plan:** If Outlook sync fails, RangeKeeper still works independently
