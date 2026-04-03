# RangeKeeper Chrome Extension

**Academic success companion for neurodivergent college students.**

Automatically tracks assignments, grades, and deadlines from Blackboard Learn and syncs with the RangeKeeper backend for smart notifications.

---

## Installation (Developer Mode)

### Step 1: Add Icons

The extension needs icons. Quick fix:

1. Go to https://favicon.io/emoji-favicons/bullseye/
2. Download the zip file
3. Extract and rename files:
   - `favicon-16x16.png` → `icons/icon16.png`
   - `favicon-32x32.png` → `icons/icon48.png`
   - `android-chrome-192x192.png` → `icons/icon128.png`

### Step 2: Load Extension

1. Open Chrome and go to `chrome://extensions/`
2. Toggle **Developer Mode** (top-right corner)
3. Click **Load unpacked**
4. Select this `extension/` folder
5. The extension should appear in your list
6. Click the **pin icon** to add it to your toolbar

### Step 3: Start Backend (Required for Full Functionality)

The extension syncs data with a local backend server. See `../backend/README.md` for setup.

Quick start:
```bash
cd ../backend
npm install
npm start
```

Backend should be running at `http://localhost:3000`

### Step 4: Test the Extension

1. Navigate to `https://ualearn.blackboard.com` and **log in**
2. Open Chrome DevTools (F12) → Console tab
3. Look for `[RangeKeeper]` logs:
   ```
   [RangeKeeper] Content script loaded
   [RangeKeeper] Initializing content script...
   [RangeKeeper] Detected page type: dashboard
   [RangeKeeper] Scraping courses...
   ```
4. Click the RangeKeeper icon in toolbar → Dashboard popup should appear

---

## Features

### ✅ Automatic Data Scraping

- **Courses:** Extracts course names, IDs, instructors
- **Assignments:** Captures titles, due dates, points, descriptions
- **Grades:** Tracks scores and grade postings
- **Announcements:** Monitors course and system-wide announcements
- **Calendar:** Scrapes calendar events and due dates

### ✅ Smart Storage

- **IndexedDB:** All data stored locally (works offline)
- **Backend Sync:** Automatically syncs with RangeKeeper backend when online
- **Persistent:** Data survives browser restarts

### ✅ Chrome Notifications

- **24-hour reminder:** When assignment is due within 24 hours
- **2-hour urgent alert:** High-priority notification for imminent deadlines
- **Smart deduplication:** Won't spam you with repeat notifications

### ✅ Dashboard Popup

- **At-a-glance stats:** Courses, assignments, due soon count
- **Upcoming assignments:** Next 10 sorted by due date
- **Course list:** All enrolled courses with last sync time
- **Manual sync button:** Force a refresh anytime

---

## How It Works

### Page Detection

The extension detects which Blackboard page you're on:

- **Dashboard** (`/ultra/course`) → Scrapes course list
- **Course Content** (`/ultra/course/.../outline`) → Scrapes assignments
- **Calendar** (`/ultra/calendar`) → Scrapes calendar events
- **Grades** (`/ultra/course/.../grades`) → Scrapes gradebook

### Dynamic Scraping

Blackboard Ultra is a React single-page app (SPA). The extension uses:

- **MutationObserver:** Watches for DOM changes as you navigate
- **Debounced scraping:** Waits 500ms after last change before extracting data
- **Automatic re-scraping:** When you navigate between pages

### Backend Sync

Every time data is scraped:

1. Extension stores in IndexedDB (local)
2. Sends to backend via POST `/api/sync`
3. Backend stores in SQLite database
4. Backend triggers notification checks

---

## Configuration

### Change Backend URL

If you deploy the backend to a production server (e.g., Railway), update the URL:

Edit `scripts/background.js`:
```javascript
const CONFIG = {
  backendUrl: 'https://your-backend-url.com',  // ← Change this
  // ...
};
```

Reload the extension for changes to take effect.

---

## Current Status (v0.1.0)

### ✅ What Works

- Extension loads without errors
- Content script runs on Blackboard pages
- IndexedDB storage works
- Backend sync works (when backend is running)
- Popup dashboard displays data
- Chrome notifications trigger on schedule

### ⚠️ Known Issues

**1. DOM Selectors Need Tuning**

The selectors in `content.js` are placeholders based on common Blackboard patterns. They may not match UA's specific instance.

**How to fix:**
1. Inspect Blackboard's DOM at `ualearn.blackboard.com`
2. Find the actual selectors for course cards, assignments, etc.
3. Update the `SELECTORS` object in `scripts/content.js`

**See:** `../SETUP_GUIDE.md` → Part 4 for detailed instructions

**2. Date Parsing May Fail**

Blackboard uses various date formats. The parser in `utils.js` handles common formats, but may miss edge cases.

**Current support:**
- "Due Mar 25 at 11:59 PM"
- "3/25/2026 11:59 PM"
- ISO format: "2026-03-25T23:59:00Z"

If dates aren't parsing correctly, add new patterns to `parseDueDate()` in `scripts/utils.js`.

---

## Debugging

### Enable Extension Logs

**Content script logs** (scraping):
1. Navigate to Blackboard
2. Open Chrome DevTools (F12) → Console
3. Filter by `[RangeKeeper]`

**Background script logs** (storage, sync):
1. Go to `chrome://extensions/`
2. Find RangeKeeper
3. Click **Inspect views: background page**
4. DevTools will open for the service worker

**Popup logs**:
1. Right-click the extension icon → Inspect popup
2. DevTools opens for popup.html

### Check IndexedDB

1. Navigate to Blackboard
2. Chrome DevTools → **Application** tab → **IndexedDB** → **RangeKeeperDB**
3. Expand to see `courses`, `assignments`, `grades`, `announcements`
4. Click a store to view records

### Verify Backend Connection

1. Open popup, click **Sync Now**
2. Check backend terminal for:
   ```
   [API] Received sync data:
     - X courses
     - Y assignments
   ```

If no log appears, backend isn't receiving requests (check `backendUrl` in `background.js`).

---

## Development

### File Structure

```
extension/
├── manifest.json          # Extension config
├── popup.html             # Dashboard UI
├── scripts/
│   ├── utils.js           # Shared utilities (date parsing, validation)
│   ├── content.js         # Scraper (runs on Blackboard)
│   ├── background.js      # Service worker (storage, sync, notifications)
│   └── popup.js           # Popup logic
├── styles/
│   └── popup.css          # Dashboard styling
└── icons/
    ├── icon16.png         # 16x16 icon
    ├── icon48.png         # 48x48 icon
    └── icon128.png        # 128x128 icon
```

### Making Changes

1. Edit files in `extension/`
2. Go to `chrome://extensions/`
3. Click **Reload** button under RangeKeeper
4. Test changes on Blackboard

**Hot tip:** For content script changes, you need to reload both the extension AND the Blackboard page.

---

## Next Steps (Week 1)

### 1. Fix DOM Selectors

Open `https://ualearn.blackboard.com` in Chrome:

1. Right-click on a course card → **Inspect**
2. Find the parent element that wraps all course cards
3. Update `SELECTORS.courseCard` in `content.js` with the correct selector
4. Repeat for assignments, calendar events, and grades

**Pro tip:** Blackboard Ultra uses React, so look for `data-` attributes or class names like `course-card`, `assignment-item`, etc.

### 2. Test the Scrapers

1. Open Chrome DevTools → Console
2. Navigate to Blackboard
3. Look for `[RangeKeeper]` logs showing scraped data
4. If you see "Found 0 courses", the selectors need adjustment

### 3. Add Icons

Create three PNG icons:

- `icons/icon16.png` — 16x16px
- `icons/icon48.png` — 48x48px
- `icons/icon128.png` — 128x128px

Use a simple icon (e.g., a target emoji 🎯 or a checkmark ✅) or design a custom logo.

### 4. Test Notifications

1. Manually add a test assignment with a due date 1 hour from now:
   - Open Chrome DevTools → Application → IndexedDB → RangeKeeperDB → assignments
   - Add a new entry: `{ id: "test1", title: "Test Assignment", dueDate: "<1 hour from now in ISO format>" }`
2. Wait 5 minutes (the background script checks every 5 min)
3. You should see a Chrome notification

### 5. Set Up Backend (Optional for Week 1)

If you want to test backend sync:

1. Navigate to the `rangekeeper/backend/` folder (we'll create this next)
2. Run `npm install && npm start`
3. The backend will run on `http://localhost:3000`
4. The extension will now sync data to the server

---

## Debugging Tips

### Enable Extension Logs

1. Go to `chrome://extensions/`
2. Find RangeKeeper
3. Click "Inspect views: background page"
4. This opens DevTools for the background service worker
5. You'll see all `[RangeKeeper]` logs from `background.js`

### Check Content Script Logs

1. Navigate to `https://ualearn.blackboard.com`
2. Open Chrome DevTools (F12)
3. Go to the Console tab
4. You'll see `[RangeKeeper]` logs from `content.js`

### Inspect IndexedDB

1. Chrome DevTools → Application tab → IndexedDB → RangeKeeperDB
2. Expand the database to see `courses`, `assignments`, `grades`, `announcements` stores
3. Click on a store to view stored data

---

## File Structure

```
extension/
├── manifest.json          # Extension configuration
├── scripts/
│   ├── content.js         # DOM scraper (runs on Blackboard pages)
│   ├── background.js      # Service worker (data handling, notifications)
│   └── popup.js           # Dashboard UI logic
├── styles/
│   └── popup.css          # Dashboard styling
├── icons/
│   ├── icon16.png         # [TODO] 16x16 icon
│   ├── icon48.png         # [TODO] 48x48 icon
│   └── icon128.png        # [TODO] 128x128 icon
└── popup.html             # Dashboard HTML
```

---

## Known Issues

- **Blackboard session expires:** If the student logs out of Blackboard, the extension can't scrape data. It relies on an active authenticated session.
- **SPA navigation:** Blackboard Ultra is a single-page app (React). The extension uses a MutationObserver to detect DOM changes, but it may miss some route transitions. If data isn't updating, manually refresh the Blackboard page.
- **No offline mode yet:** If the backend is down, data won't sync (but it will still be stored locally in IndexedDB).

---

## Future Enhancements (Phase 2)

- **Blackboard 3LO OAuth** — Proper API access instead of DOM scraping
- **M365 Graph API** — Sync with Outlook calendar and To Do
- **PWA** — Standalone web app with service worker
- **Discord bot** — Daily summaries and urgent alerts
- **AI task breakdown** — Automatically break multi-step assignments into subtasks
- **Grade-aware prioritization** — Focus effort on assignments worth the most points

---

## License

MIT (for now — update if you commercialize)

---

## Questions?

Check the main `RESEARCH_REPORT.md` and `ARCHITECTURE.md` for full context.
