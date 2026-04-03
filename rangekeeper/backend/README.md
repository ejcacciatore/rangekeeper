# RangeKeeper Backend

Node.js API and notification service for RangeKeeper.

**Features:**
- ✅ SQLite database with full schema
- ✅ Discord bot with graduated urgency notifications
- ✅ ICS feed polling (Blackboard calendar sync)
- ✅ Smart notification scheduler (ASD-optimized)
- ✅ REST API for Chrome extension sync
- ✅ Docker deployment ready

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

**For local testing without Discord:** No changes needed — server will run without Discord integration.

**To enable Discord notifications:**
1. Create a Discord bot (see "Discord Setup" section below)
2. Add `DISCORD_BOT_TOKEN` and `DISCORD_USER_ID` to `.env`

### 3. Seed Test Data (Optional)

To test the system without needing real Blackboard data:

```bash
npm run test
```

This creates:
- 3 sample courses (HIST 101, MATH 221, ENG 102)
- 9 assignments with various due dates (urgent, tomorrow, overdue, etc.)

### 4. Run the Server

**Development mode (auto-restart on file changes):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

### 5. Test the API

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "healthy",
  "uptime": 12.345,
  "timestamp": 1710854400000,
  "components": {
    "database": "ok",
    "discord": "connected"
  }
}
```

---

## Discord Setup

### Create a Discord Bot

1. Go to https://discord.com/developers/applications
2. Click **New Application** → Name it "RangeKeeper"
3. Go to **Bot** tab → **Add Bot** → Confirm
4. Under "Privileged Gateway Intents", enable:
   - ✅ Message Content Intent (required for DMs)
5. Click **Reset Token** → Copy the token (save for `.env`)
6. Go to **OAuth2** → **URL Generator**
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Embed Links`
7. Copy the generated URL and open it in browser
8. Invite bot to your Discord server (or create a test server)

### Get Your Discord User ID

1. In Discord: Settings → Advanced → **Enable Developer Mode**
2. Right-click your username → **Copy User ID**
3. Save this for `.env`

### Update `.env`

```env
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
DISCORD_USER_ID=YOUR_USER_ID_HERE
```

### Test Discord Integration

Restart the backend — you should see:

```
[Discord] ✅ Bot logged in as RangeKeeper#1234
[Init] ✅ Discord bot initialized
```

The bot will automatically send you a daily summary at 8 AM and graduated reminders based on assignment due dates.

---

## API Endpoints

### POST /api/sync
Receives data from Chrome extension.

**Request body:**
```json
{
  "courses": [...],
  "assignments": [...],
  "grades": [...],
  "announcements": [...]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Data synced successfully",
  "timestamp": 1710854400000
}
```

### GET /api/assignments
Returns assignments for a date range.

**Query params:**
- `start` (ISO date, optional)
- `end` (ISO date, optional)

**Response:**
```json
{
  "assignments": [...],
  "count": 5
}
```

### GET /api/calendar
Returns calendar events (Blackboard + ICS + M365).

**Response:**
```json
{
  "events": [...],
  "count": 10
}
```

### POST /api/ics/add
Student submits ICS feed URL.

**Request body:**
```json
{
  "icsUrl": "https://ualearn.blackboard.com/webapps/calendar/calendarFeed/..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "ICS feed added successfully"
}
```

### GET /health
Health check.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": 1710854400000
}
```

---

## Current Status (v0.1.0)

**What works:**
- ✅ Basic Express server
- ✅ CORS enabled for extension access
- ✅ `/api/sync` receives data from extension
- ✅ Health check endpoint

**Not yet implemented:**
- ❌ Database (SQLite) — currently just logs received data
- ❌ ICS feed polling
- ❌ Email parsing (M365 Graph API)
- ❌ Discord bot
- ❌ PWA push notifications
- ❌ Notification scheduler

These will be added in Week 2.

---

## Next Steps (Week 2)

### 1. Set Up SQLite Database

Create `src/db.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './data/rangekeeper.db';
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT,
    term TEXT,
    instructor_name TEXT,
    last_synced INTEGER
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    title TEXT,
    due_date INTEGER,
    points REAL,
    description TEXT,
    submitted INTEGER,
    grade REAL,
    last_synced INTEGER,
    FOREIGN KEY (course_id) REFERENCES courses(id)
  )`);
  
  // ... more tables
});

module.exports = db;
```

### 2. Implement Data Persistence

Update `/api/sync` to save data to SQLite instead of just logging.

### 3. Add ICS Feed Poller

Create `src/ics-poller.js`:

```javascript
const cron = require('node-cron');
const fetch = require('node-fetch');
const ICAL = require('ical.js');

// Poll every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('[ICS Poller] Fetching ICS feed...');
  
  // TODO: Get ICS URL from database
  const icsUrl = 'https://ualearn.blackboard.com/...';
  
  const response = await fetch(icsUrl);
  const icsData = await response.text();
  
  const jcalData = ICAL.parse(icsData);
  const comp = new ICAL.Component(jcalData);
  const events = comp.getAllSubcomponents('vevent');
  
  events.forEach(event => {
    const summary = event.getFirstPropertyValue('summary');
    const dtstart = event.getFirstPropertyValue('dtstart');
    const dtend = event.getFirstPropertyValue('dtend');
    
    console.log(`Event: ${summary}, Start: ${dtstart}, End: ${dtend}`);
    
    // TODO: Save to database
  });
});
```

### 4. Add Discord Bot

Create `src/discord-bot.js`:

```javascript
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages]
});

client.on('ready', () => {
  console.log(`[Discord] Bot logged in as ${client.user.tag}`);
});

async function sendDailySummary(userId, assignments) {
  const user = await client.users.fetch(userId);
  
  const embed = new EmbedBuilder()
    .setColor('#667eea')
    .setTitle('📅 Your Daily Assignment Summary')
    .setDescription(`You have ${assignments.length} assignments due this week`)
    .addFields(
      assignments.slice(0, 5).map(a => ({
        name: a.title,
        value: `Due: ${new Date(a.dueDate).toLocaleDateString()}`
      }))
    )
    .setTimestamp();
  
  await user.send({ embeds: [embed] });
}

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = { sendDailySummary };
```

### 5. Add Notification Scheduler

Create `src/scheduler.js`:

```javascript
const cron = require('node-cron');
const db = require('./db');
const { sendDailySummary } = require('./discord-bot');

// Daily summary at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('[Scheduler] Sending daily summary...');
  
  // Get assignments due in next 7 days
  const assignments = await getUpcomingAssignments(7);
  
  await sendDailySummary(process.env.DISCORD_USER_ID, assignments);
});

// Urgent alerts (check every 5 min)
cron.schedule('*/5 * * * *', async () => {
  const urgentAssignments = await getAssignmentsDueWithin(2); // 2 hours
  
  urgentAssignments.forEach(async (assignment) => {
    // TODO: Send urgent notification
  });
});
```

---

## Environment Variables

See `.env.example` for all available options. Most are optional for MVP.

**Required for basic functionality:**
- `PORT` (defaults to 3000)

**Optional Week 2 features:**
- `DISCORD_BOT_TOKEN` — For Discord notifications
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — For PWA push
- `AZURE_CLIENT_ID` / `AZURE_CLIENT_SECRET` — For M365 Graph API

---

## License

MIT
