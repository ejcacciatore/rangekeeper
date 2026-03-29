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
  
  // Course grades page (inside a specific course)
  if (url.includes('/ultra/courses/') && (url.includes('/grades') || hash.includes('grades'))) {
    return 'course-grades';
  }
  
  // Overall grades page
  if (url.includes('/ultra/grades') && !url.includes('/courses/')) {
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

  // Activity stream items
  const activityItems = document.querySelectorAll(
    'div[class*="base-navigation"], [class*="stream-item"], div[role="article"]'
  );

  activityItems.forEach((item, index) => {
    try {
      const text = (item.textContent || '').trim();

      // Look for assignment/due date patterns
      if (text.toLowerCase().includes('due') ||
          text.toLowerCase().includes('assignment') ||
          text.toLowerCase().includes('submit') ||
          text.toLowerCase().includes('quiz') ||
          text.toLowerCase().includes('test')) {

        const courseMatch = text.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
        const courseId = courseMatch ? courseMatch[1] : null;

        // Extract due date
        const dueDateMatch = text.match(
          /due:?\s*([A-Z][a-z]{2}\s+\d{1,2}(?:,\s*\d{4})?\s+(?:at\s+)?\d{1,2}:\d{2}\s*(?:AM|PM)?)/i
        ) || text.match(/due:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
        const dueDate = dueDateMatch ? dueDateMatch[1].trim() : null;

        const title = text.split('·')[0].split('\n')[0].trim().substring(0, 100);

        let status = 'pending';
        if (/past due|overdue/i.test(text)) status = 'overdue';
        else if (/submitted/i.test(text)) status = 'submitted';
        else if (/graded/i.test(text)) status = 'graded';

        assignments.push({
          id: `assignment_${courseId || ''}_${index}`,
          courseId: courseId,
          title: title,
          dueDate: dueDate ? (typeof parseDueDate === 'function' ? parseDueDate(dueDate) : dueDate) : null,
          status: status,
          source: 'activity-stream',
          scrapedAt: Date.now()
        });
      }
    } catch (err) {
      console.error('[RangeKeeper] Error scraping assignment:', err);
    }
  });

  console.log(`[RangeKeeper] Scraped ${assignments.length} assignments`);
  return assignments;
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
      // Overall grades across all courses
      if (typeof scrapeGradesFromGradesPage === 'function') {
        newData.grades = scrapeGradesFromGradesPage();
        await saveToIndexedDB('grades', newData.grades);
      }
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
});

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  console.log('[RangeKeeper] 🎯 Initializing on UA Blackboard Ultra...');

  // Initial scrape after page loads
  setTimeout(runScraper, 2000);

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
// DEBUG CONSOLE OBJECT
// Type RangeKeeperDebug.help() in Chrome DevTools console to get started
// ============================================================================

window.RangeKeeperDebug = {
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
