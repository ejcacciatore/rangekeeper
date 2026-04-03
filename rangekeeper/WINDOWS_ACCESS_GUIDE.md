# 💻 RANGEKEEPER — Windows Access Guide for Rico

**Last Updated:** April 3, 2026  
**For:** Rico Cacciatore (Windows user)  
**OpenClaw Backend:** Ubuntu (you don't directly access this)

---

## 🎯 IMPORTANT: You Work from Windows, Not Linux

The paths you've been seeing (like `/home/ubuntu/.openclaw/workspace/`) are **OpenClaw's backend server**, not your local machine.

**You have 3 ways to access and work with RangeKeeper files:**

---

## 📍 METHOD 1: View Files via GitHub (Easiest)

### **Live Dashboard URL:**
```
https://ejcacciatore.github.io/rangekeeper/massimo-student-report.html
```
✅ **Works in any browser**  
⏳ **Can have 5-30 min cache delay after updates**

### **Raw GitHub (Always Current):**
```
https://raw.githubusercontent.com/ejcacciatore/rangekeeper/master/massimo-student-report.html
```
✅ **Always shows latest committed version**  
✅ **No cache delays**  
⚠️ **Shows HTML source (not rendered), but browser will render it if you save/open**

### **GitHub Web Interface:**
```
https://github.com/ejcacciatore/rangekeeper
```
✅ **Browse all files**  
✅ **View commit history**  
✅ **Edit files directly in browser (with web editor)**

---

## 📍 METHOD 2: Clone Repo to Your Windows PC

If you want to work with files **locally on your Windows machine**:

### **Step 1: Install Git for Windows**
Download from: https://git-scm.com/download/win

### **Step 2: Clone the Repository**

Open **Command Prompt** or **PowerShell**:

```powershell
# Navigate to where you want the project
cd C:\Users\YourName\Documents

# Clone the repo
git clone https://github.com/ejcacciatore/rangekeeper.git

# Enter the folder
cd rangekeeper
```

**Your local path will be:**
```
C:\Users\YourName\Documents\rangekeeper\massimo-student-report.html
```

### **Step 3: Open Files**

**Option A: Double-click to open in browser**
- Navigate to `C:\Users\YourName\Documents\rangekeeper\`
- Double-click `massimo-student-report.html`
- Opens in your default browser (Chrome, Edge, Firefox)

**Option B: Edit in VS Code / Notepad++**
- Right-click → Open with → VS Code
- Make changes, save

### **Step 4: Commit & Push Changes**

In **Command Prompt** or **PowerShell**:

```powershell
cd C:\Users\YourName\Documents\rangekeeper

# See what changed
git status

# Add your changes
git add massimo-student-report.html

# Commit with a message
git commit -m "Update report: [your description]"

# Push to GitHub
git push origin master
```

**GitHub Actions will automatically deploy** to GitHub Pages within 1-2 minutes.

---

## 📍 METHOD 3: Let OpenClaw Do It (What We've Been Doing)

**How it works:**
- You ask OpenClaw (me) to make changes
- I edit files in the backend workspace (`/home/ubuntu/.openclaw/workspace/`)
- I commit and push to GitHub
- GitHub Pages deploys automatically

**Commands you can use:**
- "Update the Massimo report to show [X]"
- "Add a new section for [Y]"
- "Generate a fresh report from the database"
- "Push the latest changes to GitHub"

✅ **You don't need to touch Git or Linux**  
✅ **I handle all the technical work**  
⚠️ **You can't preview files locally this way** (unless you clone the repo)

---

## 🖥️ RECOMMENDED WORKFLOW FOR RICO

### **For Quick Reviews:**
1. Ask me to generate/update a report
2. I commit and push to GitHub
3. You view at: https://ejcacciatore.github.io/rangekeeper/massimo-student-report.html
4. Or use raw URL if GitHub Pages is cached: https://raw.githubusercontent.com/ejcacciatore/rangekeeper/master/massimo-student-report.html

### **For Local Development:**
1. Clone the repo to your Windows PC (one-time setup)
2. Edit files in VS Code or any text editor
3. Use Git commands (see Method 2 above) to commit/push
4. GitHub Pages deploys automatically

### **For Database Work:**
Ask me to:
- Query the database
- Generate reports from DB data
- Export data as JSON/CSV
- Seed test data

(The backend database is on the Ubuntu server, you don't access it directly)

---

## 📂 WHERE FILES ACTUALLY LIVE

### **On GitHub (Source of Truth):**
```
https://github.com/ejcacciatore/rangekeeper
```

Key files:
- `massimo-student-report.html` — Main dashboard (root of repo)
- `massimo-dashboard.html` — Alternative version (root of repo)
- `backend/data/rangekeeper.db` — SQLite database
- `extension/` — Chrome extension code
- `RANGEKEEPER_REPORT_SYSTEM.md` — System documentation

### **On OpenClaw's Server (Backend):**
```
/home/ubuntu/.openclaw/workspace/
```
- This is where I (OpenClaw) work
- You don't access this directly
- Changes I make get pushed to GitHub

### **On Your Windows PC (If Cloned):**
```
C:\Users\YourName\Documents\rangekeeper\
```
- Only exists if you run `git clone`
- You can edit files here
- Push changes back to GitHub

---

## 🚀 QUICK COMMANDS (Windows PowerShell/CMD)

### **Clone Repo (First Time):**
```powershell
cd C:\Users\YourName\Documents
git clone https://github.com/ejcacciatore/rangekeeper.git
cd rangekeeper
```

### **Update Your Local Copy:**
```powershell
cd C:\Users\YourName\Documents\rangekeeper
git pull origin master
```

### **Make Changes & Push:**
```powershell
# Edit files in VS Code or any editor, save

# Check what changed
git status

# Add all changes
git add .

# Commit
git commit -m "Your message here"

# Push to GitHub
git push origin master
```

### **View Report Locally:**
```powershell
# Open in default browser
start massimo-student-report.html

# Or navigate to folder and double-click the file
```

---

## 🔧 TOOLS YOU MIGHT WANT (Windows)

### **Git for Windows:**
https://git-scm.com/download/win
- Required for cloning/pushing to GitHub

### **VS Code (Code Editor):**
https://code.visualstudio.com/
- Best editor for HTML/JavaScript/Markdown
- Built-in Git support
- Free

### **GitHub Desktop (GUI for Git):**
https://desktop.github.com/
- Visual interface (no command line needed)
- Easier for beginners

### **Chrome DevTools:**
- Built into Chrome/Edge
- Press F12 to inspect pages
- Test the extension on Blackboard

---

## ❓ COMMON QUESTIONS

### **Q: Do I need Linux/Ubuntu to work on this?**
**A:** No! You work from Windows. The Ubuntu paths are OpenClaw's backend server (you don't touch it).

### **Q: How do I view the report right now?**
**A:** Go to https://ejcacciatore.github.io/rangekeeper/massimo-student-report.html in your browser.

### **Q: Can I edit files without cloning the repo?**
**A:** Yes! Either:
1. Ask OpenClaw (me) to make changes
2. Edit directly on GitHub.com (click the file → pencil icon → edit → commit)

### **Q: Where is the database?**
**A:** On OpenClaw's Ubuntu server. You don't access it directly. Ask me to query it for you.

### **Q: How do I test the Chrome extension?**
**A:** 
1. Clone the repo to your Windows PC
2. Open Chrome → `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `rangekeeper/extension/` folder
6. Go to Blackboard and test

### **Q: The GitHub Pages URL shows old content - why?**
**A:** CDN caching. Can take 5-30 minutes. Use the raw GitHub URL for instant updates.

---

## 📧 BOTTOM LINE FOR RICO

**You don't need to know Linux paths or SSH into servers.**

**Just:**
1. **Ask me to make changes** → I handle the backend work
2. **View the results** → https://ejcacciatore.github.io/rangekeeper/massimo-student-report.html
3. **Optional:** Clone the repo to your Windows PC if you want to edit locally

**That's it!** 🎯

---

**Last Updated:** April 3, 2026 21:40 UTC  
**Questions?** Just ask!
