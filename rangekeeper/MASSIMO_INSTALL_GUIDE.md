# RangeKeeper Installation Guide for Massimo
## Get it running in 10 minutes

---

## STEP 1: Load the Extension in Chrome (5 minutes)

### 1a. Open Chrome Extensions Page
1. Open Chrome
2. Type in address bar: `chrome://extensions/`
3. Press Enter

### 1b. Enable Developer Mode
1. Look for **"Developer mode"** toggle in top-right corner
2. Click it to turn it **ON** (it should be blue/enabled)

### 1c. Load the Extension
1. Click **"Load unpacked"** button (top-left)
2. Navigate to: `/home/ubuntu/.openclaw/workspace/rangekeeper/extension/`
3. Click **"Select Folder"**

### 1d. Verify It Loaded
- You should see "RangeKeeper" in your extension list
- It will say "Errors" because icons are missing - that's okay for now!
- The extension still works without icons

---

## STEP 2: Test the Extension (2 minutes)

### 2a. Go to Blackboard
1. Open a new tab
2. Go to: `https://ualearn.blackboard.com`
3. Log in if needed
4. Go to **Courses** page

### 2b. Open DevTools Console
1. Press **F12** (or Right-click → Inspect)
2. Click **"Console"** tab
3. Look for green `[RangeKeeper]` messages

**You should see:**
```
[RangeKeeper] Content script loaded
[RangeKeeper] Initializing...
[RangeKeeper] Starting scraper...
[RangeKeeper] Current page: courses-list
[RangeKeeper] Scraping courses from UA Blackboard Ultra...
[RangeKeeper] Found X courses
```

### 2c. Check IndexedDB
1. In DevTools, click **"Application"** tab
2. Expand **"IndexedDB"** in left sidebar
3. Expand **"RangeKeeperDB"**
4. Click **"courses"**
5. You should see your courses listed!

---

## STEP 3: Start the Backend (3 minutes)

The backend runs on your computer and handles notifications.

### 3a. Open Terminal
```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
```

### 3b. Install Dependencies (first time only)
```bash
npm install
```

### 3c. Start the Server
```bash
npm start
```

**You should see:**
```
[RangeKeeper Backend] Starting...
[RangeKeeper Backend] Database initialized
[RangeKeeper Backend] Server running on http://localhost:3000
```

**Leave this terminal window open** - the backend needs to stay running.

---

## STEP 4: Verify End-to-End (2 minutes)

### 4a. Go Back to Blackboard in Chrome
- Navigate to Courses page again
- The extension will auto-scrape

### 4b. Check Backend Terminal
You should see:
```
[API] Received sync data
[API] Synced 6 courses, 0 assignments
```

### 4c. Test the API
Open a new terminal and run:
```bash
curl http://localhost:3000/health
```

You should get:
```json
{"status":"healthy","timestamp":...}
```

---

## STEP 5: Set Up Discord Notifications (Optional, 5 minutes)

If you want notifications in Discord:

### 5a. Create a Discord Server (if you don't have one)
1. Open Discord
2. Click **"+"** to add a server
3. Create a new server (call it "RangeKeeper" or whatever)

### 5b. Create a Bot
1. Go to: https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it "RangeKeeper"
4. Go to **"Bot"** tab
5. Click **"Reset Token"** → Copy the token
6. Enable **"Message Content Intent"** (scroll down, toggle it ON)
7. Click **"Save Changes"**

### 5c. Invite Bot to Your Server
1. Go to **"OAuth2"** → **"URL Generator"**
2. Check: **bot**
3. Check permissions: **Send Messages**, **Embed Links**
4. Copy the generated URL
5. Paste in browser, select your server, authorize

### 5d. Get Your User ID
1. In Discord: Settings → Advanced → Enable **"Developer Mode"**
2. Right-click your name → **"Copy User ID"**

### 5e. Configure Backend
```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
nano .env
```

Add these lines:
```
DISCORD_BOT_TOKEN=paste_your_bot_token_here
DISCORD_USER_ID=paste_your_user_id_here
```

Save (Ctrl+O, Enter, Ctrl+X)

### 5f. Restart Backend
- Stop the backend (Ctrl+C in the terminal where it's running)
- Start again: `npm start`

**You should now get Discord notifications!**

---

## TROUBLESHOOTING

### Extension Not Scraping?
**Check Console for errors:**
1. Press F12 on Blackboard
2. Look for red errors in Console
3. Screenshot and send to Rico/Claw

**Make sure you're on the right page:**
- Extension only works on: Courses, Activity, Calendar, Grades pages
- It won't do anything on the home dashboard

### Backend Can't Connect?
**Check if it's running:**
```bash
curl http://localhost:3000/health
```

**If you get "Connection refused":**
- Backend isn't running
- Go to terminal and run `npm start` again

### Discord Bot Not Sending Messages?
**Check bot token:**
- Make sure you copied the FULL token (it's long!)
- Make sure you enabled "Message Content Intent"
- Make sure bot is in your server
- Make sure your User ID is correct

**Check backend logs:**
- Look for `[Discord]` messages in terminal
- If it says "Discord bot connected", it's working

### No Notifications Yet?
**Notifications only trigger when:**
- You have assignments due within 7 days
- Backend checks every 15 minutes
- Or you can test manually (see below)

---

## MANUAL TESTING

### Force a Scrape
In Blackboard, open Console (F12) and run:
```javascript
chrome.runtime.sendMessage({type: 'SCRAPE_NOW'});
```

### Check Database Directly
```bash
cd /home/ubuntu/.openclaw/workspace/rangekeeper/backend
sqlite3 data/rangekeeper.db
```

Then:
```sql
SELECT * FROM courses;
SELECT * FROM assignments;
.quit
```

### Trigger Test Notification
In backend terminal, press Ctrl+C to stop, then:
```bash
npm run test
npm start
```

This adds fake assignments with due dates, so you'll get notifications.

---

## WHAT'S NEXT?

Once you confirm it's working:
1. **Use it for a week** - See if it actually helps you stay on top of assignments
2. **Give feedback** - What's useful? What's annoying? What's missing?
3. **Then we decide:** Keep it as your personal tool, or build it into a product for other students?

---

## QUESTIONS?

Text Rico or message in Discord. Don't struggle alone - we want this to work for you!

---

**Installation complete! 🎉**
