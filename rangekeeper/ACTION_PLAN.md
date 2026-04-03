# RANGEKEEPER — DAY 1 ACTION PLAN

**Goal:** Working Chrome extension pulling real Blackboard data within 7-10 days  
**Budget:** $0  
**Prerequisites:** Chrome browser, Node.js 18+, active UA Blackboard account

---

## WEEK 1 — DAYS 1-3: DATA COLLECTION & SETUP

### ✅ Task 1: Get Three Critical Data Points from Your Son

These determine the optimal implementation path:

#### 1.1 Blackboard Version Number
**Why:** Confirms which REST API endpoints are available (Calendar API requires 3400.9+, 3LO requires 3200.7+)

**How:**
1. Have your son log into `https://ualearn.blackboard.com`
2. Scroll to the bottom footer
3. Look for text like "Blackboard Learn, Release 3xxx.x.x" or "© 1997-2026 Blackboard Inc."
4. Screenshot it and note the version number

**Expected result:** Something like "Release 3900.12.0" (newer is better)

---

#### 1.2 ICS Calendar Feed Availability
**Why:** If UA enables ICS export, you get free calendar data with zero scraping needed

**How:**
1. Your son logs into Blackboard
2. Goes to **Calendar** (usually in the left sidebar or top nav)
3. Looks for a **Settings** or **Subscribe** button
4. If he sees an option like "Get External Link" or "iCal Subscribe URL", click it
5. Copy the URL (should look like `https://ualearn.blackboard.com/webapps/calendar/calendarFeed/{userId}/{hash}/learn.ics`)
6. Send that URL to you (it's safe — it's student-specific, not institution-wide)

**Expected result:** Either a URL (best case) or "No such option found" (we'll scrape instead)

---

#### 1.3 Notification Settings Screenshot
**Why:** Tells us what Blackboard emails to parse for real-time updates

**How:**
1. Your son logs into Blackboard
2. Goes to **Settings** → **Notifications** (or Account → Edit Notification Settings)
3. Screenshot the entire page showing all available notification types
4. Make sure these are enabled:
   - New assignment posted
   - Grade posted
   - Due date reminders
   - Announcements

**Expected result:** Screenshot showing 10-20 notification options with checkboxes

---

### ✅ Task 2: Install the Chrome Extension

#### 2.1 Add Placeholder Icons
Since the extension needs icons but we haven't created them yet, use these quick placeholders:

1. Go to https://png-pixel.com or use any image editor
2. Create three simple PNG files:
   - `icon16.png` — 16x16px, solid color (e.g., blue square)
   - `icon48.png` — 48x48px, solid color
   - `icon128.png` — 128x128px, solid color
3. Save them to `rangekeeper/extension/icons/`

Or use emoji as icons:
- Take a screenshot of 🎯 (target emoji)
- Resize to 16x16, 48x48, 128x128
- Save as PNGs

**Pro tip:** Use https://favicon.io/emoji-favicons/bullseye/ to auto-generate from emoji

#### 2.2 Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Toggle **Developer mode** (top-right)
4. Click **Load unpacked**
5. Select the `rangekeeper/extension/` folder
6. The extension should appear in your list
7. Click the **pin icon** to add it to your toolbar

#### 2.3 Test Basic Functionality

1. Open Chrome DevTools (F12) → Console tab
2. Navigate to `https://ualearn.blackboard.com` and log in
3. Look for `[RangeKeeper]` logs in the console
4. You should see:
   ```
   [RangeKeeper] Content script loaded
   [RangeKeeper] Initializing content script...
   [RangeKeeper] Detected page type: dashboard
   [RangeKeeper] Scraping courses...
   [RangeKeeper] Found 0 courses  ← This is expected (selectors need tuning)
   ```

If you see those logs, the extension is running. If not, check for JavaScript errors.

---

### ✅ Task 3: Fix DOM Selectors (CRITICAL)

The extension currently uses placeholder selectors that won't work on UA's Blackboard. You need to inspect the live DOM and update `content.js`.

#### 3.1 Inspect Course Cards

1. Log into Blackboard at `https://ualearn.blackboard.com`
2. Go to the **Courses** or **Dashboard** page
3. Right-click on a course card → **Inspect**
4. Look for the parent element wrapping all course cards
5. Note any `data-` attributes, class names, or IDs

**Example (hypothetical):**
```html
<div class="course-list">
  <a href="/ultra/course/_12345_1" class="course-card">
    <h3 class="course-title">HIST 101: World History</h3>
  </a>
  <a href="/ultra/course/_67890_1" class="course-card">
    <h3 class="course-title">MATH 221: Calculus I</h3>
  </a>
</div>
```

**Update `content.js`:**
```javascript
const SELECTORS = {
  courseCard: '.course-card',           // ← Replace with actual selector
  courseName: '.course-title',          // ← Replace with actual selector
  courseId: 'a.course-card',            // ← Replace with actual selector
  // ...
};
```

#### 3.2 Inspect Assignment List

1. Go to a course → **Content** or **Assignments** page
2. Right-click on an assignment item → Inspect
3. Find the wrapper element, title, and due date

**Update selectors in `content.js`:**
```javascript
assignmentItem: '.assignment-item',     // ← Replace
assignmentTitle: '.assignment-title',   // ← Replace
assignmentDueDate: '.due-date',        // ← Replace
```

#### 3.3 Test Scraping

1. Open Chrome DevTools → Console
2. Reload the Blackboard page
3. Look for `[RangeKeeper] Found X courses` (X should be > 0 now)
4. If still 0, the selectors are still wrong — keep inspecting

**Pro tip:** Blackboard Ultra uses React, so look for attributes like `data-testid`, `data-course-id`, etc.

---

### ✅ Task 4: Verify Data Storage

1. Open Chrome DevTools → **Application** tab → **IndexedDB** → **RangeKeeperDB**
2. Expand the database
3. Click on **courses** store
4. You should see entries with `id`, `name`, `url`, etc.
5. If empty, go back to fixing selectors

---

## WEEK 1 — DAYS 4-7: BACKEND & NOTIFICATIONS

### ✅ Task 5: Set Up Backend (Optional for Week 1)

#### 5.1 Install Dependencies

```bash
cd rangekeeper/backend
npm install
```

#### 5.2 Create `.env` File

```bash
cp .env.example .env
```

No changes needed for local testing.

#### 5.3 Run the Server

```bash
npm start
```

You should see:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 RangeKeeper Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Server running on http://localhost:3000
  Environment: development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 5.4 Test Backend Sync

1. Open a new terminal
2. Navigate to Blackboard in Chrome (extension should scrape data)
3. Check the backend terminal — you should see:
   ```
   [RangeKeeper] Received sync data:
     - 5 courses
     - 12 assignments
     - 0 grades
     - 0 announcements
   ```

If you see this, the extension → backend sync is working!

---

### ✅ Task 6: Test Chrome Notifications

#### 6.1 Manually Add Test Assignment

1. Open Chrome DevTools → Application → IndexedDB → RangeKeeperDB → assignments
2. Click **+ Add record**
3. Add this JSON (replace `DUE_DATE_HERE` with 1 hour from now in ISO format):
   ```json
   {
     "id": "test_assignment_1",
     "title": "Test Assignment - Due Soon!",
     "dueDate": "2026-03-19T14:00:00Z",
     "scrapedAt": 1710854400000
   }
   ```
4. Click **Save**

#### 6.2 Wait for Notification

The background script checks every 5 minutes. You should see a Chrome notification:

**"Assignment Due Soon"**  
*"Test Assignment - Due Soon! is due in 1 hours"*

If it doesn't appear:
1. Check Chrome notification permissions (Settings → Privacy → Site Settings → Notifications)
2. Open `chrome://extensions/` → RangeKeeper → "Inspect views: background page"
3. Look for `[RangeKeeper] Running periodic notification check...` logs

---

### ✅ Task 7: Build Extension Popup Dashboard

#### 7.1 Test Popup UI

1. Click the RangeKeeper extension icon in Chrome toolbar
2. You should see a popup with:
   - Summary stats (courses count, assignments count, due soon count)
   - List of upcoming assignments
   - List of courses
   - Last sync time

#### 7.2 Verify Data Display

If the popup shows "No assignments found":
1. Open Chrome DevTools on the popup itself (right-click popup → Inspect)
2. Check console for errors
3. Verify that IndexedDB has data (see Task 4)

If IndexedDB has data but popup doesn't show it:
- The popup → background script messaging might be failing
- Check for `chrome.runtime.lastError` in the popup console

---

## WEEK 2 — DAYS 8-10: POLISH & DISCORD

### ✅ Task 8: Set Up Discord Bot (Optional)

#### 8.1 Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **New Application** → Name it "RangeKeeper"
3. Go to **Bot** tab → **Add Bot**
4. Copy the **Token** (you'll need this for `.env`)
5. Go to **OAuth2** tab → **URL Generator**
6. Select scopes: `bot`, permissions: `Send Messages`, `Embed Links`
7. Copy the generated URL and open it in your browser
8. Invite the bot to your Discord server (or create a new server for testing)

#### 8.2 Get Your Discord User ID

1. In Discord, go to Settings → Advanced → Enable Developer Mode
2. Right-click your name → Copy User ID
3. Save this for `.env`

#### 8.3 Configure Backend

Edit `rangekeeper/backend/.env`:
```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_USER_ID=your_user_id_here
```

#### 8.4 Implement Discord Bot

Add to `backend/src/index.js`:

```javascript
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages]
});

client.on('ready', () => {
  console.log(`[Discord] Bot logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Test: send a message when server starts
client.on('ready', async () => {
  const user = await client.users.fetch(process.env.DISCORD_USER_ID);
  await user.send('🎯 RangeKeeper backend is online!');
});
```

Restart the backend — you should get a DM from the bot!

---

### ✅ Task 9: Daily Summary (Cron Job)

Add to `backend/src/index.js`:

```javascript
const cron = require('node-cron');

// Daily summary at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('[Scheduler] Sending daily summary...');
  
  // TODO: Query database for assignments due in next 7 days
  // For now, send a test message
  
  const user = await client.users.fetch(process.env.DISCORD_USER_ID);
  
  const embed = new EmbedBuilder()
    .setColor('#667eea')
    .setTitle('📅 Your Daily Assignment Summary')
    .setDescription('You have X assignments due this week')
    .setTimestamp();
  
  await user.send({ embeds: [embed] });
});
```

**Test immediately (don't wait until 8 AM):**

Change the cron schedule to run every minute for testing:
```javascript
cron.schedule('* * * * *', async () => { ... });
```

---

### ✅ Task 10: End-to-End Test

#### 10.1 Full Flow Test

1. Your son logs into Blackboard
2. Extension scrapes courses, assignments, grades
3. Data syncs to backend
4. Backend stores in database (when implemented)
5. Discord bot sends daily summary at 8 AM
6. Chrome notifications alert for assignments due <24h

#### 10.2 Verify Each Step

- [ ] Extension logs show `Found X courses, Y assignments`
- [ ] IndexedDB contains course/assignment data
- [ ] Backend receives sync data (check logs)
- [ ] Extension popup displays correct stats
- [ ] Chrome notification appears for test assignment
- [ ] Discord bot sends test message

If ALL checkboxes are ✅, you have a working MVP!

---

## BLOCKERS & TROUBLESHOOTING

### ❌ Extension doesn't load
- Check `chrome://extensions/` for errors
- Verify `manifest.json` is valid JSON (no trailing commas)
- Make sure all file paths are correct

### ❌ DOM scrapers find 0 items
- Selectors are wrong — re-inspect the live DOM
- Blackboard may use dynamic rendering (React) — increase the `setTimeout` in `content.js` from 2s to 5s

### ❌ Backend sync fails (network error)
- Check if backend is running (`http://localhost:3000/health` should work)
- CORS might be blocking — backend already has `app.use(cors())`, but check browser console for errors

### ❌ Chrome notifications don't appear
- Check Chrome Settings → Privacy → Notifications (must be enabled)
- Open background service worker inspector (`chrome://extensions/` → RangeKeeper → Inspect views)
- Verify `chrome.notifications.create()` is being called

### ❌ Discord bot doesn't send messages
- Token might be wrong — regenerate in Discord Developer Portal
- Bot needs permission to send DMs — check privacy settings
- User ID might be wrong — re-copy from Discord

---

## NEXT STEPS (WEEK 3+)

Once the MVP works:

1. **Deploy backend to production** — DigitalOcean Droplet ($6/mo) or Railway free tier
2. **Implement SQLite database** — Persistent storage instead of just logging
3. **Add ICS feed polling** — If your son found a calendar URL in Task 1.2
4. **Parse Blackboard emails** — M365 Graph API or email forwarding
5. **Build PWA** — Standalone web app with offline access
6. **Improve notification logic** — Graduated urgency (gentle → firm → urgent)
7. **Add AI task breakdown** — "Write essay" → "Research (2h)" + "Outline (1h)" + "Draft (3h)"
8. **Parent dashboard** — FERPA-compliant visibility layer

---

## DECISION POINT: PRODUCT VS. PERSONAL TOOL

**If it works great for your son:**

You have two paths:

### Path A: Keep it personal
- Don't worry about polish, just keep it working
- No SaaS infrastructure, no billing, no support
- Cost: $0-10/month (hosting, optional Twilio SMS)
- Time: 1-2 hours/month maintenance

### Path B: Build a product
- Clean up the code, add user accounts, multi-tenant DB
- Build landing page, set up Stripe billing
- Post on Reddit (r/AutismTranslated, r/ADHD, r/college)
- Approach UA Disability Services with a pilot offer
- Raise seed funding (if you want) — Tiimo raised $1.5M, market is proven
- Revenue potential: $120K/yr at 1,000 users × $10/mo

**My recommendation:** Do Path A for 1-2 months. If your son loves it and tells his friends, you'll know there's product-market fit. THEN do Path B.

---

## FINAL CHECKLIST

By end of Week 2, you should have:

- [x] Extension installed and scraping Blackboard
- [x] IndexedDB storing course/assignment data
- [x] Extension popup showing dashboard
- [x] Backend receiving sync data
- [x] Chrome notifications for due dates
- [x] Discord bot sending daily summary
- [ ] Your son using it daily and finding it helpful ← MOST IMPORTANT

If the last checkbox is ✅, everything else is details.

---

**Good luck! You're building something genuinely useful.** 🎯
