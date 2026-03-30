/**
 * RangeKeeper Content Script
 * Runs on ualearn.blackboard.com
 * 
 * Scrapes: Courses, Assignments, Grades, Messages, Feedback
 * 
 * Page detection → appropriate scraper → IndexedDB → backend sync → notifications
 */

console.log('[RangeKeeper] Content script loaded on:', window.location.href);

// ============================================================================
// CONFIGURATION
// ============================================================================

const BACKEND_URL = 'http://localhost:3000'; // TODO: Replace with production URL

// ============================================================================
// STATE
// ============================================================================

let scrapedData = {
  courses: [],
  assignments: [],
  grades: [],
  messages: [],
  feedback: [],
  lastScraped: null
};

let currentPage = null;
let lastUrl = window.location.href;

// ============================================================================
// PAGE DETECTION — UA BLACKBOARD ULTRA
// ============================================================================

function detectPage() {
  const url = window.location.href;
  const path = window.location.pathname;
  const hash = window.location.hash;

  // Ultra-style routes (SPA with hash routing)
  if (url.includes('/ultra/stream') || url.includes('/webapps/streamViewer')) {
    return 'activity-stream';
  }
  
  // Course gradebook (inside a specific course)
  // URL: ualearn.blackboard.com/ultra/courses/_401764_1/grades
  if (url.includes('/ultra/courses/') && url.includes('/grades')) {
    return 'course-grades';
  }

  // Overall grades page
  // URL: ualearn.blackboard.com/ultra/grades
  if (/\/ultra\/grades\b/.test(url) && !url.includes('/courses/')) {
    return 'grades-overview';
  }

  // Messages landing page (list of courses with unread counts)
  if (url.includes('/ultra/messages') && !url.includes('course_id')) {
    return 'messages-landing';
  }

  // Course message list (messages within a specific course)
  if (url.includes('viewCourseMessages') || url.includes('courseMessages') ||
      (url.includes('/ultra/messages') && url.includes('course'))) {
    return 'course-messages';
  }

  // Message detail view
  if (url.includes('do/message') || url.includes('messageDetail') ||
      (url.includes('/message/') && url.includes('/ultra/'))) {
    return 'message-detail';
  }

  // Grade/attempt detail (feedback view)
  if (url.includes('/attempt/') || url.includes('attemptId') || 
      url.includes('/grades/') && url.includes('/columns/')) {
    return 'grade-detail';
  }

  // Course content/outline
  if (url.includes('/ultra/courses/') && url.includes('/outline')) {
    return 'course-content';
  }

  // Course list (Courses page)
  if (url.includes('/ultra/course') && !url.includes('/courses/')) {
    return 'courses-list';
  }

  // Deadline/calendar
  if (url.includes('/ultra/calendar') || url.includes('/ultra/deadline')) {
    return 'calendar';
  }

  // Any page inside a course
  if (url.includes('/ultra/courses/')) {
    return 'course-page';
  }

  return 'unknown';
}

// ============================================================================
// SCRAPERS — COURSES
// ============================================================================

function scrapeCourses() {
  console.log('[RangeKeeper] Scraping courses...');
  const courses = [];

  const courseItems = document.querySelectorAll('li[class*="MultiListroot"]');
  console.log(`[RangeKeeper] Found ${courseItems.length} course items via MultiListroot`);

  courseItems.forEach((item, index) => {
    try {
      const link = item.querySelector('a[href*="/ultra/course"]');
      if (!link) return;

      const url = link.getAttribute('href');
      const courseIdMatch = url.match(/\/course\/([^\/\?]+)/);
      const courseId = courseIdMatch ? courseIdMatch[1] : null;
      if (!courseId) return;

      const nameElements = item.querySelectorAll('p[class*="Multypography"]');
      let courseCode = null;
      let courseName = null;

      if (nameElements.length >= 2) {
        courseCode = nameElements[0].textContent.trim();
        courseName = nameElements[1].textContent.trim();
      } else if (nameElements.length === 1) {
        courseCode = nameElements[0].textContent.trim();
        courseName = courseCode;
      } else {
        courseName = item.textContent.trim().substring(0, 100);
      }

      courses.push({
        id: courseId,
        code: courseCode,
        name: courseName,
        fullName: courseCode ? `${courseCode} — ${courseName}` : courseName,
        url: url.startsWith('http') ? url : `https://ualearn.blackboard.com${url}`,
        scrapedAt: Date.now()
      });
    } catch (err) {
      console.error('[RangeKeeper] Error scraping course:', err);
    }
  });

  // Fallback: try other selectors
  if (courses.length === 0) {
    const links = document.querySelectorAll('a[href*="/ultra/course"]');
    links.forEach((link, idx) => {
      const url = link.getAttribute('href');
      const name = link.textContent.trim();
      if (name.length > 3) {
        courses.push({
          id: `course_${idx}`,
          name: name,
          fullName: name,
          url: url.startsWith('http') ? url : `https://ualearn.blackboard.com${url}`,
          scrapedAt: Date.now()
        });
      }
    });
  }

  console.log(`[RangeKeeper] Scraped ${courses.length} courses`);
  return courses;
}

// ============================================================================
// SCRAPERS — ASSIGNMENTS
// ============================================================================

function scrapeAssignments() {
  console.log('[RangeKeeper] Scraping assignments...');
  const assignments = [];
  const url = window.location.href;
  const isCalendar = url.includes('/ultra/deadline') || url.includes('/ultra/calendar');

  if (isCalendar) {
    // Calendar/Due Dates page
    // Each card: Title + "Due date: 4/3/26, 12:59 AM (EDT)" + course link "18424.202610: 202610-REL-100-919"
    const allEls = [...document.querySelectorAll('main *')];
    const cards = allEls.filter(el => {
      const text = el.textContent || '';
      const rect = el.getBoundingClientRect();
      return /Due date/i.test(text) && rect.height > 30 && rect.height < 300 && rect.width > 300;
    });

    // If no cards yet — content still loading
    if (cards.length === 0) {
      console.log('[RangeKeeper] Calendar: no cards yet, content may still be loading...');
      // Log what IS on the page to help debug
      const mainText = (document.querySelector('main')?.textContent || '').substring(0, 500);
      console.log('[RangeKeeper] Main content preview:', mainText);
    }

    const deduped = dedupEls(cards);
    console.log(`[RangeKeeper] Calendar cards: ${deduped.length}`);

    deduped.forEach((card, idx) => {
      const text = (card.textContent || '').trim();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);

      // Title = first line that isn't a date, course, or timezone
      const title = lines.find(l =>
        !/^Due date/i.test(l) && !/^\d{5,}/.test(l) &&
        !/^\d{6}-/.test(l) && !/\(EDT\)|\(CDT\)|\(CST\)|\(EST\)/.test(l)
      ) || lines[0];

      // Course code from link "18424.202610: 202610-REL-100-919"
      const link = card.querySelector('a');
      const linkText = link?.textContent || '';
      const courseMatch = linkText.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/) ||
        text.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
      const courseId = courseMatch?.[1] || null;

      // Skip old semester (anything before 202600)
      if (courseId && parseInt(courseId.split('-')[0]) < 202600) return;

      // Due date
      const dateMatch = text.match(/Due date\s*\d*\s*:\s*([^\n(]+(?:\([A-Z]{2,4}\))?)/i);
      const rawDate = dateMatch?.[1]?.trim() || null;
      const dueDate = rawDate ? (typeof parseDueDate === 'function' ? parseDueDate(rawDate) : rawDate) : null;

      if (!title || title.length < 2) return;

      assignments.push({
        id: `cal_${(courseId||'?').replace(/[-]/g,'_')}_${idx}`,
        courseId: courseId,
        title: title.substring(0, 120),
        dueDate: dueDate,
        rawDueDate: rawDate,
        status: 'pending',
        source: 'calendar',
        scrapedAt: Date.now()
      });

      console.log(`[RangeKeeper] 📅 "${title}" → ${rawDate} (${courseId})`);
    });

    console.log(`[RangeKeeper] Calendar: ${assignments.length} tasks`);
    return assignments;
  }

  // Activity stream fallback
  const items = document.querySelectorAll('div[class*="base-navigation"], [class*="stream-item"], div[role="article"]');
  items.forEach((item, idx) => {
    try {
      const text = (item.textContent || '').trim();
      if (!/due|assignment|submit|quiz|test/i.test(text)) return;
      const courseMatch = text.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
      const courseId = courseMatch?.[1] || null;
      if (courseId && parseInt(courseId.split('-')[0]) < 202600) return;
      const dateMatch = text.match(/due:?\s*([A-Z][a-z]{2}\s+\d{1,2}[^·\n]+)/i) ||
        text.match(/due:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
      const dueDate = dateMatch?.[1]?.trim() || null;
      const title = text.split('\n')[0].trim().substring(0, 100);
      let status = 'pending';
      if (/past due|overdue/i.test(text)) status = 'overdue';
      else if (/submitted/i.test(text)) status = 'submitted';
      assignments.push({
        id: `act_${courseId||''}_${idx}`,
        courseId, title, status,
        dueDate: dueDate ? (typeof parseDueDate === 'function' ? parseDueDate(dueDate) : dueDate) : null,
        source: 'activity-stream',
        scrapedAt: Date.now()
      });
    } catch(e) {}
  });

  console.log(`[RangeKeeper] Activity: ${assignments.length} tasks`);
  return assignments;
}

function dedupEls(els) {
  return els.filter((el, i) => !els.some((other, j) => j !== i && other.contains(el)));
}

// ============================================================================
// STORAGE (IndexedDB)
// ============================================================================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RangeKeeperDB', 3);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const stores = ['courses', 'assignments', 'grades', 'messages', 'feedback', 'settings'];
      stores.forEach(name => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };
  });
}

async function saveToIndexedDB(storeName, data) {
  if (!data || data.length === 0) return;
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Merge with existing data (don't clear — accumulate across pages)
    data.forEach(item => store.put(item));

    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error(`[RangeKeeper] Error saving to ${storeName}:`, err);
  }
}

async function getAllFromDB(storeName) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error(`[RangeKeeper] Error reading from ${storeName}:`, err);
    return [];
  }
}

// ============================================================================
// BACKEND SYNC
// ============================================================================

async function syncToBackend(data) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(`Sync failed: ${response.status}`);
    const result = await response.json();
    console.log('[RangeKeeper] Backend sync OK:', result);
    return result;
  } catch (err) {
    // Offline mode is fine — data persists in IndexedDB
    console.log('[RangeKeeper] Backend unreachable (offline mode OK)');
    return null;
  }
}

// ============================================================================
// MAIN SCRAPE ORCHESTRATOR
// ============================================================================

async function runScraper() {
  currentPage = detectPage();
  console.log(`[RangeKeeper] ▶ Scraping page: ${currentPage} (${window.location.href})`);

  let newData = {};

  switch (currentPage) {
    case 'courses-list':
      newData.courses = scrapeCourses();
      await saveToIndexedDB('courses', newData.courses);
      break;

    case 'activity-stream':
      // Activity stream has BOTH assignment info and grade postings
      newData.assignments = scrapeAssignments();
      await saveToIndexedDB('assignments', newData.assignments);

      if (typeof scrapeGradesFromActivity === 'function') {
        newData.grades = scrapeGradesFromActivity();
        await saveToIndexedDB('grades', newData.grades);
      }
      break;

    case 'course-grades':
      // Individual course grade book
      if (typeof scrapeGradesFromGradesPage === 'function') {
        newData.grades = scrapeGradesFromGradesPage();
        await saveToIndexedDB('grades', newData.grades);
      }
      break;

    case 'grades-overview':
      // Grades overview has a carousel — skip it, rely on individual gradebook pages
      console.log('[RangeKeeper] Grades overview carousel — skipping, visit individual course gradebooks instead');
      break;

    case 'grade-detail':
      // Detailed grade view with feedback
      if (typeof scrapeFeedback === 'function') {
        const feedback = scrapeFeedback();
        if (feedback) {
          newData.feedback = [feedback];
          await saveToIndexedDB('feedback', [feedback]);
          // Also update the grade record with feedback
          if (feedback.score || feedback.instructorFeedback) {
            await saveToIndexedDB('grades', [{
              id: feedback.id,
              courseId: feedback.courseId,
              assignmentName: feedback.assignmentName,
              score: feedback.score,
              possible: feedback.possible,
              letterGrade: feedback.letterGrade,
              feedback: feedback.instructorFeedback,
              rubricScores: feedback.rubricScores,
              source: 'feedback-detail',
              scrapedAt: Date.now()
            }]);
          }
        }
      }
      break;

    case 'messages-landing':
      // Messages overview (courses with unread counts)
      if (typeof scrapeMessages === 'function') {
        newData.messages = scrapeMessages();
        await saveToIndexedDB('messages', newData.messages);
      }
      break;

    case 'course-messages':
      // Messages within a specific course
      if (typeof scrapeMessageThread === 'function') {
        newData.messages = scrapeMessageThread();
        await saveToIndexedDB('messages', newData.messages);
      }
      break;

    case 'message-detail':
      // Full message body
      if (typeof scrapeMessageDetail === 'function') {
        const detail = scrapeMessageDetail();
        if (detail) {
          newData.messages = [detail];
          await saveToIndexedDB('messages', [detail]);
        }
      }
      break;

    case 'calendar':
      // Calendar events as assignments
      newData.assignments = scrapeAssignments();
      await saveToIndexedDB('assignments', newData.assignments);
      break;

    case 'course-content':
    case 'course-page':
      // Try to scrape assignments from course content
      newData.assignments = scrapeAssignments();
      await saveToIndexedDB('assignments', newData.assignments);
      break;

    default:
      console.log('[RangeKeeper] Unknown page type, running generic scrape...');
      // Try everything
      newData.assignments = scrapeAssignments();
      if (newData.assignments.length > 0) await saveToIndexedDB('assignments', newData.assignments);
      break;
  }

  // Update timestamp
  scrapedData = { ...scrapedData, ...newData, lastScraped: Date.now() };

  // Collect all data for sync
  const allData = {
    courses: await getAllFromDB('courses'),
    assignments: await getAllFromDB('assignments'),
    grades: await getAllFromDB('grades'),
    messages: await getAllFromDB('messages'),
    feedback: await getAllFromDB('feedback'),
    lastScraped: Date.now(),
    currentPage: currentPage
  };

  // Sync to backend
  await syncToBackend(allData);

  // Notify background script
  try {
    chrome.runtime.sendMessage({
      type: 'DATA_UPDATE',
      data: allData,
      page: currentPage
    });
  } catch (err) {
    // Extension context may be invalidated
    console.log('[RangeKeeper] Could not reach background script');
  }

  // Log summary
  const summary = [
    newData.courses ? `${newData.courses.length} courses` : null,
    newData.assignments ? `${newData.assignments.length} assignments` : null,
    newData.grades ? `${newData.grades.length} grades` : null,
    newData.messages ? `${newData.messages.length} messages` : null,
    newData.feedback ? `${newData.feedback.length} feedback` : null,
  ].filter(Boolean).join(', ');

  console.log(`[RangeKeeper] ✅ Scrape complete: ${summary || 'no new data'}`);
}

// ============================================================================
// SPA NAVIGATION DETECTION
// ============================================================================

function watchForNavigation() {
  // Watch for URL changes (Blackboard Ultra is a SPA)
  const observer = new MutationObserver(() => {
    const newUrl = window.location.href;
    if (newUrl !== lastUrl) {
      console.log(`[RangeKeeper] 🔄 Navigation: ${lastUrl} → ${newUrl}`);
      lastUrl = newUrl;
      // Wait for new content to render
      setTimeout(runScraper, 1500);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also listen for popstate (back/forward navigation)
  window.addEventListener('popstate', () => {
    setTimeout(runScraper, 1500);
  });

  // And hashchange (some Blackboard views use hash routing)
  window.addEventListener('hashchange', () => {
    setTimeout(runScraper, 1500);
  });
}

// ============================================================================
// MESSAGE LISTENER (from popup or background)
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCRAPE_NOW') {
    runScraper().then(() => {
      sendResponse({ success: true, page: currentPage });
    });
    return true;
  }

  if (request.type === 'GET_PAGE_INFO') {
    sendResponse({
      page: detectPage(),
      url: window.location.href,
      title: document.title
    });
    return false;
  }

  // Debug commands — trigger from popup or background
  if (request.type === 'DEBUG_GRADES') {
    const r = typeof scrapeGradesFromGradesPage === 'function' ? scrapeGradesFromGradesPage() : [];
    console.log('[RangeKeeper] 📊 GRADES (' + r.length + '):', r);
    sendResponse({ result: r });
    return true;
  }

  if (request.type === 'DEBUG_ACTIVITY') {
    const r = typeof scrapeGradesFromActivity === 'function' ? scrapeGradesFromActivity() : [];
    console.log('[RangeKeeper] 🎯 ACTIVITY GRADES (' + r.length + '):', r);
    sendResponse({ result: r });
    return true;
  }

  if (request.type === 'DEBUG_MESSAGES') {
    const r = typeof scrapeMessages === 'function' ? scrapeMessages() : [];
    console.log('[RangeKeeper] 💬 MESSAGES (' + r.length + '):', r);
    sendResponse({ result: r });
    return true;
  }

  if (request.type === 'DEBUG_THREAD') {
    const r = typeof scrapeMessageThread === 'function' ? scrapeMessageThread() : [];
    console.log('[RangeKeeper] 📨 THREAD (' + r.length + '):', r);
    sendResponse({ result: r });
    return true;
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  console.log('[RangeKeeper] 🎯 Initializing on UA Blackboard Ultra...');

  // Initial scrape — wait longer for deadline/calendar page (content loads slowly)
  const page = detectPage();
  const waitMs = (page === 'calendar') ? 5000 : 2000;
  setTimeout(runScraper, waitMs);

  // Second pass 10 seconds later to catch lazy-loaded content
  setTimeout(runScraper, 12000);

  // Watch for SPA navigation
  watchForNavigation();

  // Periodic re-scrape (catch dynamically loaded content)
  setInterval(() => {
    const page = detectPage();
    if (page !== 'unknown') {
      console.log('[RangeKeeper] ⏰ Periodic re-scrape...');
      runScraper();
    }
  }, 60000); // Every 60 seconds

  console.log('[RangeKeeper] ✅ Initialized and watching for changes');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ============================================================================
// DEVTOOLS BRIDGE — triggered via chrome.runtime messages from popup/background
// Also auto-logs on scrape so you can see results in DevTools console
// ============================================================================

// ============================================================================
// DEBUG CONSOLE OBJECT (content script world — for internal use)
// Works around Blackboard's SES sandbox by injecting into page world
// ============================================================================

const DebugObject = {
  help: () => {
    console.log(`
🎯 RangeKeeper Debug Console
─────────────────────────────────────────
RangeKeeperDebug.page()           → What page am I on?
RangeKeeperDebug.run()            → Run the scraper for this page
RangeKeeperDebug.grades()         → Scrape grades (grades page)
RangeKeeperDebug.activity()       → Scrape grade postings (activity stream)
RangeKeeperDebug.messages()       → Scrape message threads (messages landing)
RangeKeeperDebug.thread()         → Scrape messages in current course
RangeKeeperDebug.feedback()       → Scrape feedback (grade detail page)
RangeKeeperDebug.showDB()         → Show all data in IndexedDB
RangeKeeperDebug.clearDB()        → Clear all local data
RangeKeeperDebug.testBackend()    → Test backend connection
─────────────────────────────────────────`);
  },

  page: () => {
    const p = detectPage();
    console.log(`[RangeKeeper] Current page: ${p} | URL: ${window.location.href}`);
    return p;
  },

  run: async () => {
    console.log('[RangeKeeper] Manual scrape triggered...');
    await runScraper();
    console.log('[RangeKeeper] Done. Run RangeKeeperDebug.showDB() to see results.');
  },

  grades: () => {
    if (typeof scrapeGradesFromGradesPage !== 'function') return console.error('scrapeGradesFromGradesPage not loaded');
    const r = scrapeGradesFromGradesPage();
    console.log('[RangeKeeper] Grades found:', r.length, r);
    return r;
  },

  activity: () => {
    if (typeof scrapeGradesFromActivity !== 'function') return console.error('scrapeGradesFromActivity not loaded');
    const r = scrapeGradesFromActivity();
    console.log('[RangeKeeper] Activity grades found:', r.length, r);
    return r;
  },

  messages: () => {
    if (typeof scrapeMessages !== 'function') return console.error('scrapeMessages not loaded');
    const r = scrapeMessages();
    console.log('[RangeKeeper] Message threads found:', r.length, r);
    return r;
  },

  thread: () => {
    if (typeof scrapeMessageThread !== 'function') return console.error('scrapeMessageThread not loaded');
    const r = scrapeMessageThread();
    console.log('[RangeKeeper] Messages in thread:', r.length, r);
    return r;
  },

  feedback: () => {
    if (typeof scrapeFeedback !== 'function') return console.error('scrapeFeedback not loaded');
    const r = scrapeFeedback();
    console.log('[RangeKeeper] Feedback:', r);
    return r;
  },

  showDB: async () => {
    const stores = ['courses', 'assignments', 'grades', 'messages', 'feedback'];
    const result = {};
    for (const store of stores) {
      result[store] = await getAllFromDB(store);
    }
    console.table(result.courses.map(c => ({ id: c.id, name: c.name })));
    console.log('[courses]', result.courses);
    console.log('[assignments]', result.assignments);
    console.log('[grades]', result.grades);
    console.log('[messages]', result.messages);
    console.log('[feedback]', result.feedback);
    return result;
  },

  clearDB: async () => {
    const db = await openDB();
    const stores = ['courses', 'assignments', 'grades', 'messages', 'feedback'];
    for (const store of stores) {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).clear();
    }
    console.log('[RangeKeeper] IndexedDB cleared.');
  },

  testBackend: async () => {
    try {
      const r = await fetch('http://localhost:3000/health');
      const data = await r.json();
      console.log('[RangeKeeper] ✅ Backend healthy:', data);
      return data;
    } catch (e) {
      console.error('[RangeKeeper] ❌ Backend unreachable. Is it running on localhost:3000?', e.message);
    }
  }
};

// Expose to window for console access (content script world)
window.RangeKeeperDebug = DebugObject;

// Inject into page world to bypass SES sandbox using eval-safe method
try {
  // Create a script that runs in page context (not content script context)
  // This bypasses SES restrictions because it's in the main page world
  const injectScript = document.createElement('script');
  injectScript.type = 'text/javascript';
  injectScript.id = 'rangekeeper-debug-injector';
  
  // Define the debug object and all methods inline
  injectScript.textContent = `
(function() {
  // Create a simple debug interface that communicates with content script
  window.RangeKeeperDebug = {
    help: function() {
      console.log(\`
🎯 RangeKeeper Debug Console
─────────────────────────────────────────
RangeKeeperDebug.page()           → What page am I on?
RangeKeeperDebug.run()            → Run the scraper for this page
RangeKeeperDebug.grades()         → Scrape grades (grades page)
RangeKeeperDebug.activity()       → Scrape grade postings (activity stream)
RangeKeeperDebug.messages()       → Scrape message threads (messages landing)
RangeKeeperDebug.thread()         → Scrape messages in current course
RangeKeeperDebug.feedback()       → Scrape feedback (grade detail page)
RangeKeeperDebug.showDB()         → Show all data in IndexedDB
RangeKeeperDebug.clearDB()        → Clear all local data
RangeKeeperDebug.testBackend()    → Test backend connection
─────────────────────────────────────────\`);
    },
    page: function() {
      console.log('[RangeKeeper] Sending page detection request...');
      window.postMessage({ type: 'RK_PAGE' }, '*');
    },
    run: function() {
      console.log('[RangeKeeper] Triggering scraper...');
      window.postMessage({ type: 'RK_RUN' }, '*');
    },
    grades: function() {
      console.log('[RangeKeeper] Testing grades scraper...');
      window.postMessage({ type: 'RK_GRADES' }, '*');
    },
    activity: function() {
      console.log('[RangeKeeper] Testing activity stream scraper...');
      window.postMessage({ type: 'RK_ACTIVITY' }, '*');
    },
    messages: function() {
      console.log('[RangeKeeper] Testing messages scraper...');
      window.postMessage({ type: 'RK_MESSAGES' }, '*');
    },
    thread: function() {
      console.log('[RangeKeeper] Testing message thread scraper...');
      window.postMessage({ type: 'RK_THREAD' }, '*');
    },
    feedback: function() {
      console.log('[RangeKeeper] Testing feedback scraper...');
      window.postMessage({ type: 'RK_FEEDBACK' }, '*');
    },
    showDB: function() {
      console.log('[RangeKeeper] Fetching IndexedDB data...');
      window.postMessage({ type: 'RK_SHOWDB' }, '*');
    },
    clearDB: function() {
      console.log('[RangeKeeper] Clearing IndexedDB...');
      window.postMessage({ type: 'RK_CLEARDB' }, '*');
    },
    testBackend: function() {
      console.log('[RangeKeeper] Testing backend connection...');
      window.postMessage({ type: 'RK_BACKEND' }, '*');
    }
  };
  console.log('[RangeKeeper] 🎯 Debug console loaded! Type: RangeKeeperDebug.help()');
})();
  `;
  
  // Inject into document head before any other scripts run
  if (document.head) {
    document.head.insertBefore(injectScript, document.head.firstChild);
  } else {
    document.documentElement.insertBefore(injectScript, document.documentElement.firstChild);
  }
  
  console.log('[RangeKeeper] ✅ Injected debug console into page world');
} catch (err) {
  console.error('[RangeKeeper] Error injecting debug console:', err.message);
}

// Listen for messages from page world debug console
window.addEventListener('message', async (event) => {
  // Only accept messages from our own window
  if (event.source !== window) return;
  
  const { type } = event.data;
  
  if (type === 'RK_PAGE') {
    const p = detectPage();
    console.log(`[RangeKeeper] Current page: ${p}`);
  } else if (type === 'RK_RUN') {
    await runScraper();
    console.log('[RangeKeeper] Scraper finished');
  } else if (type === 'RK_GRADES') {
    if (typeof scrapeGradesFromGradesPage === 'function') {
      const result = scrapeGradesFromGradesPage();
      console.log('[RangeKeeper] Grades found:', result.length, result);
    } else {
      console.error('[RangeKeeper] Grades scraper not loaded');
    }
  } else if (type === 'RK_ACTIVITY') {
    if (typeof scrapeGradesFromActivity === 'function') {
      const result = scrapeGradesFromActivity();
      console.log('[RangeKeeper] Activity grades found:', result.length, result);
    } else {
      console.error('[RangeKeeper] Activity scraper not loaded');
    }
  } else if (type === 'RK_MESSAGES') {
    if (typeof scrapeMessages === 'function') {
      const result = scrapeMessages();
      console.log('[RangeKeeper] Message threads found:', result.length, result);
    } else {
      console.error('[RangeKeeper] Messages scraper not loaded');
    }
  } else if (type === 'RK_THREAD') {
    if (typeof scrapeMessageThread === 'function') {
      const result = scrapeMessageThread();
      console.log('[RangeKeeper] Messages in thread:', result.length, result);
    } else {
      console.error('[RangeKeeper] Thread scraper not loaded');
    }
  } else if (type === 'RK_FEEDBACK') {
    if (typeof scrapeFeedback === 'function') {
      const result = scrapeFeedback();
      console.log('[RangeKeeper] Feedback:', result);
    } else {
      console.error('[RangeKeeper] Feedback scraper not loaded');
    }
  } else if (type === 'RK_SHOWDB') {
    const stores = ['courses', 'assignments', 'grades', 'messages', 'feedback'];
    const result = {};
    for (const store of stores) {
      result[store] = await getAllFromDB(store);
    }
    console.table(result.courses.map(c => ({ id: c.id, name: c.name })));
    console.log('[RangeKeeper] Database contents:', result);
  } else if (type === 'RK_CLEARDB') {
    const db = await openDB();
    const stores = ['courses', 'assignments', 'grades', 'messages', 'feedback'];
    for (const store of stores) {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).clear();
    }
    console.log('[RangeKeeper] IndexedDB cleared');
  } else if (type === 'RK_BACKEND') {
    try {
      const r = await fetch('http://localhost:3000/health');
      const data = await r.json();
      console.log('[RangeKeeper] ✅ Backend healthy:', data);
    } catch (e) {
      console.error('[RangeKeeper] ❌ Backend unreachable:', e.message);
    }
  }
}, false);
