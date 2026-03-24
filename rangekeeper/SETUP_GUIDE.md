# RANGEKEEPER — COMPLETE SETUP GUIDE

**Welcome!** This guide will get RangeKeeper up and running in 20-30 minutes.

---

## PREREQUISITES

✅ **Chrome browser**  
✅ **Node.js 18+** ([download](https://nodejs.org/))  
✅ **Active Blackboard Learn account** at `ualearn.blackboard.com`  
✅ **(Optional) Discord account** — for notifications

---

## PART 1: BACKEND SETUP (15 minutes)

### Step 1: Install Dependencies

```bash
cd rangekeeper/backend
npm install
```

You should see something like:
```
added 250 packages in 12s
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

**For now, leave `.env` as-is** — we'll add Discord credentials later.

### Step 3: Test the Backend

```bash
npm run test
```

This seeds the database with sample assignments. You should see:
```
🌱 Seeding Test Data
  ✅ HIST 101: World History
  ✅ MATH 221: Calculus I
  ✅ ENG 102: Composition II
  ✅ Chapter 5 Quiz (URGENT <2h)
  ✅ Problem Set 7 (URGENT <6h)
  ...
✅ Test data seeded successfully!
```

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 RangeKeeper Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Environment: development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Database] Connected to backend/data/rangekeeper.db
[Init] ⚠️  DISCORD_BOT_TOKEN not set, skipping Discord integration
[Scheduler] ✅ Scheduler started
[ICS] ✅ ICS poller started (every 30 minutes)

[Server] 🚀 Listening on http://localhost:3000
```

### Step 5: Verify API Works

Open a new terminal and run:
```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "healthy",
  "uptime": 5.234,
  "timestamp": 1710854400000,
  "components": {
    "database": "ok",
    "discord": "disconnected"
  }
}
```

✅ **Backend is working!** Keep the terminal running.

---

## PART 2: CHROME EXTENSION SETUP (5 minutes)

### Step 1: Add Placeholder Icons

The extension needs icons but we don't have custom ones yet. Quick fix:

1. Go to https://favicon.io/emoji-favicons/bullseye/
2. Download the favicon zip
3. Extract and rename:
   - `favicon-16x16.png` → `rangekeeper/extension/icons/icon16.png`
   - `favicon-32x32.png` → `rangekeeper/extension/icons/icon48.png`
   - `android-chrome-192x192.png` → `rangekeeper/extension/icons/icon128.png`

### Step 2: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Toggle **Developer mode** (top-right corner)
3. Click **Load unpacked**
4. Select the `rangekeeper/extension/` folder
5. The extension should appear in your list
6. Click the **pin icon** to add it to your toolbar

### Step 3: Test Extension Storage

1. Click the RangeKeeper icon in your Chrome toolbar
2. You should see a popup dashboard (it will say "No assignments found" — that's expected)
3. Open Chrome DevTools (F12) → Application → IndexedDB
4. You should see **RangeKeeperDB** (currently empty)

✅ **Extension is loaded!**

---

## PART 3: CONNECT EXTENSION TO BACKEND (2 minutes)

The extension is currently set to sync with `http://localhost:3000` (which is correct if you're running the backend locally).

### Test Sync

1. Navigate to `https://ualearn.blackboard.com` and **log in**
2. Open Chrome DevTools (F12) → Console
3. Look for `[RangeKeeper]` logs:
   ```
   [RangeKeeper] Content script loaded
   [RangeKeeper] Initializing content script...
   [RangeKeeper] Detected page type: dashboard
   [RangeKeeper] Scraping courses...
   [RangeKeeper] Found 0 courses  ← Expected (selectors need tuning)
   ```

4. Check the **backend terminal** — you should see:
   ```
   [API] Received sync data:
     - 0 courses
     - 0 assignments
     - 0 grades
     - 0 announcements
   ```

✅ **Extension and backend are connected!** (Even if no data is scraped yet, the sync is working.)

---

## PART 4: FIX DOM SELECTORS (10 minutes — REQUIRES YOUR SON'S HELP)

**This is the critical step.** The extension uses placeholder selectors that won't match UA's Blackboard instance. We need to inspect the live DOM and update `content.js`.

### What Your Son Needs to Do:

1. **Log into Blackboard** at `https://ualearn.blackboard.com`
2. **Go to the Courses page** (or Dashboard)
3. **Right-click on a course card** → **Inspect**
4. **Find the parent element** that wraps all course cards
5. **Screenshot the HTML** (or copy the outerHTML)
6. **Send you the screenshot**

### What You'll Do:

1. Open `rangekeeper/extension/scripts/content.js`
2. Find the `SELECTORS` object (top of the file)
3. Update the selectors based on the screenshot:

**Example (before):**
```javascript
const SELECTORS = {
  courseCard: '[data-testid="base-card-list"] base-card',  // ← Placeholder
  courseName: 'h3.base-card-title',                        // ← Placeholder
  // ...
};
```

**Example (after, based on real DOM):**
```javascript
const SELECTORS = {
  courseCard: '.course-list-item',           // ← Real selector from screenshot
  courseName: '.course-title-text',          // ← Real selector
  // ...
};
```

### Test Again:

1. Reload Blackboard in Chrome
2. Check the console — you should now see:
   ```
   [RangeKeeper] Found 5 courses  ← Success!
   ```
3. Click the extension icon — the popup should show your courses

✅ **Extension is scraping real data!**

---

## PART 5: DISCORD NOTIFICATIONS (OPTIONAL, 10 minutes)

### Step 1: Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **New Application** → Name: "RangeKeeper"
3. Go to **Bot** tab → **Add Bot**
4. Under "Token", click **Reset Token** → **Copy** it (save for later)
5. Under "Privileged Gateway Intents", enable:
   - ✅ **Message Content Intent**
6. Go to **OAuth2** → **URL Generator**
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Embed Links`
7. Copy the generated URL and open in browser
8. Invite bot to your Discord server (or create a test server)

### Step 2: Get Your Discord User ID

1. In Discord: **Settings** → **Advanced** → **Enable Developer Mode**
2. Right-click your username → **Copy User ID**
3. Save it

### Step 3: Update `.env`

Edit `rangekeeper/backend/.env`:
```env
DISCORD_BOT_TOKEN=paste_your_token_here
DISCORD_USER_ID=paste_your_user_id_here
```

### Step 4: Restart Backend

Stop the backend (Ctrl+C) and restart:
```bash
npm start
```

You should now see:
```
[Discord] ✅ Bot logged in as RangeKeeper#1234
[Init] ✅ Discord bot initialized
```

### Step 5: Test Discord

The bot will:
- Send a **daily summary at 8 AM** (you can test this by changing the cron schedule in `scheduler.js`)
- Send **graduated reminders** based on assignment due dates (3 days, 1 day, 6 hours, 2 hours)
- Send **overdue alerts** for missed assignments

To test immediately with the sample data:
1. The test data includes an assignment due in 30 minutes
2. Wait 15 minutes (the scheduler checks every 15 min)
3. You should get a Discord DM: **🚨 URGENT: Assignment Due Soon!**

✅ **Discord notifications are working!**

---

## PART 6: PRODUCTION DEPLOYMENT (OPTIONAL, 15 minutes)

If you want the backend to run 24/7 (instead of just on your laptop), deploy to Railway (free tier).

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Connect your `rangekeeper` repo (or just the `backend/` folder)

### Step 2: Add Environment Variables

In Railway dashboard:
1. Go to **Variables** tab
2. Add:
   - `DISCORD_BOT_TOKEN` (your bot token)
   - `DISCORD_USER_ID` (your user ID)
   - `NODE_ENV=production`

### Step 3: Deploy

Railway auto-deploys. You should see:
```
✅ Deployment successful
🌐 Live at: https://rangekeeper-production.up.railway.app
```

### Step 4: Update Extension

Edit `rangekeeper/extension/scripts/background.js`:
```javascript
const CONFIG = {
  backendUrl: 'https://rangekeeper-production.up.railway.app',  // ← Update this
  // ...
};
```

Reload the extension in Chrome, and it will now sync with your live backend!

---

## TROUBLESHOOTING

### Extension doesn't load
- Check `chrome://extensions/` for errors
- Make sure all file paths in `manifest.json` are correct

### DOM scrapers find 0 items
- Selectors are wrong — re-inspect Blackboard's DOM
- Increase the `setTimeout` in `content.js` from 2s to 5s (Blackboard may be slow to render)

### Backend sync fails
- Check if backend is running (`http://localhost:3000/health`)
- Check browser console for CORS errors

### Discord bot doesn't connect
- Token might be wrong — regenerate in Discord Developer Portal
- Check that "Message Content Intent" is enabled

### No notifications appear
- Check Chrome Settings → Privacy → Notifications (must be allowed)
- Open background service worker inspector: `chrome://extensions/` → RangeKeeper → "Inspect views: background page"

---

## NEXT STEPS

Once everything is working:

1. **Have your son use it for 1-2 weeks** — See if it actually helps with assignment tracking
2. **Get feedback** — What's helpful? What's annoying? What's missing?
3. **Iterate** — Add AI task breakdown, better UI, parent dashboard, etc.
4. **Decide: Product or personal tool?** — If it works great, consider productizing it

---

## SUPPORT

If you hit a blocker:
1. Check the logs (backend terminal + Chrome DevTools console)
2. Review the `TROUBLESHOOTING` section above
3. Check `rangekeeper/ACTION_PLAN.md` for detailed debugging steps

---

**You're ready to build!** 🎯
