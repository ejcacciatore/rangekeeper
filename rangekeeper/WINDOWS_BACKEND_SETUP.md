# RangeKeeper Backend — Windows Setup Guide

## Quick Start

### 1. Navigate to backend folder
```bash
cd C:\Users\ejcac\repos\rangekeeper\backend
```

### 2. Create `.env` file
Create a file named `.env` (no extension) with:
```
PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/rangekeeper.db
```

### 3. Install dependencies
```bash
npm install
```

### 4. Start the server
```bash
npm start
```

**You should see:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 RangeKeeper Backend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Init] ✅ Discord bot initialized (or skipped)

[Server] 🚀 Listening on http://0.0.0.0:3001
[Server] Health check: http://localhost:3001/health
```

---

## Testing the API

### Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 45.123,
  "timestamp": 1711811400000,
  "components": {
    "database": "ok",
    "discord": "disconnected"
  }
}
```

### Class Data Endpoint
```bash
curl http://localhost:3001/api/class/202610-EN-103-025
```

Expected response:
```json
{
  "courseId": "202610-EN-103-025",
  "assignments": [...],
  "grades": {...},
  "messages": [...],
  "lastSyncedAt": 1711811400000
}
```

---

## Troubleshooting

### Port 3001 already in use?
Use a different port:
```bash
PORT=3002 npm start
```
or
```bash
PORT=4000 npm start
```

### npm ERR! code ENOENT
- Make sure you're in the `backend` folder
- Check that `package.json` exists: `dir`

### npm ERR! EACCES (permission denied)
Windows shouldn't have this, but try:
```bash
npm install -g npm@latest
```

### Database errors?
Delete the `data/` folder and restart:
```bash
rmdir /s data
npm start
```

---

## Integration with Extension

Once backend is running on port 3001, update the extension to hit:
```
http://localhost:3001/api/sync
http://localhost:3001/api/class/:courseId
```

File to update: `extension/scripts/content.js`
Search for: `http://localhost:3000`
Replace with: `http://localhost:3001`

---

## Keep Running

Leave this terminal open while testing. Backend must stay running for:
- Extension data sync
- API requests
- Class detail page

**Stop with:** `Ctrl+C`
**Restart with:** `npm start`

---

**Questions?** Check the main README.md in the backend folder.
