/**
 * RangeKeeper Content Script
 * Runs on ualearn.blackboard.com
 * Scrapes course data, assignments, grades, and calendar items
 */

console.log('[RangeKeeper] Content script loaded');

// ============================================================================
// CONFIGURATION - FIXED FOR UA BLACKBOARD ULTRA
// ============================================================================

const SELECTORS = {
  // Course list (Ultra dashboard) - Based on actual UA DOM structure
  coursesContainer: 'main#main-content',
  courseCard: 'li[class*="MultiListroot"]', // Each course is an <li> with MultiListroot class
  courseName: 'p[class*="Multypographybody"]', // Course name in <p> tag
  courseLink: 'a[href*="/ultra/course"]', // Link to course
  
  // Assignment list (from Activity stream or course content)
  activityItem: 'div[class*="base-navigation"]', // Activity stream items
  assignmentTitle: '[class*="base-navigation-button-content"]',
  
  // Calendar view
  calendarContainer: 'main#main-content',
  calendarEvent: 'div[role="button"]', // Calendar events are divs with role="button"
  
  // Grades
  gradeItem: 'div[class*="grade"]',
  gradeScore: 'span[class*="score"]',
};

const BACKEND_URL = 'http://localhost:3000'; // Will be Railway URL in production

// ============================================================================
// STATE
// ============================================================================

let scrapedData = {
  courses: [],
  assignments: [],
  grades: [],
  announcements: [],
  lastScraped: null
};

// Current page type detection
let currentPage = null;

// ============================================================================
// PAGE DETECTION
// ============================================================================

function detectPage() {
  const url = window.location.href;
  const pathname = window.location.pathname;
  
  if (url.includes('/ultra/course') && !url.includes('/outline')) {
    return 'courses-list';
  } else if (url.includes('/ultra/calendar')) {
    return 'calendar';
  } else if (url.includes('/webapps/streamViewer')) {
    return 'activity-stream';
  } else if (url.includes('/ultra/grades')) {
    return 'grades';
  } else if (url.includes('/ultra/course') && url.includes('/outline')) {
    return 'course-content';
  }
  
  return 'unknown';
}

// ============================================================================
// SCRAPERS - UA BLACKBOARD ULTRA SPECIFIC
// ============================================================================

/**
 * Scrape course list from Courses page
 * Based on actual UA DOM: <li class="MultiListroot..."> containing <p> for name
 */
function scrapeCourses() {
  console.log('[RangeKeeper] Scraping courses from UA Blackboard Ultra...');
  
  const courseItems = document.querySelectorAll('li[class*="MultiListroot"]');
  const courses = [];
  
  console.log(`[RangeKeeper] Found ${courseItems.length} potential course items`);
  
  courseItems.forEach((item, index) => {
    try {
      // Find the link to the course
      const link = item.querySelector('a[href*="/ultra/course"]');
      if (!link) {
        console.log(`[RangeKeeper] Course item ${index}: No course link found`);
        return;
      }
      
      // Extract course ID from URL
      const url = link.getAttribute('href');
      const courseIdMatch = url.match(/\/course\/([^\/\?]+)/);
      const courseId = courseIdMatch ? courseIdMatch[1] : null;
      
      if (!courseId) {
        console.log(`[RangeKeeper] Course item ${index}: Could not extract course ID from ${url}`);
        return;
      }
      
      // Find course name - look for <p> tags with Multypography class
      const nameElements = item.querySelectorAll('p[class*="Multypography"]');
      let courseName = null;
      
      // First <p> is usually the course code (e.g., "202610-EN-103-025")
      // Second <p> is usually the full name
      if (nameElements.length >= 2) {
        const courseCode = nameElements[0].textContent.trim();
        const courseLongName = nameElements[1].textContent.trim();
        courseName = `${courseCode} - ${courseLongName}`;
      } else if (nameElements.length === 1) {
        courseName = nameElements[0].textContent.trim();
      } else {
        // Fallback: try any text content
        courseName = item.textContent.trim().substring(0, 100);
      }
      
      console.log(`[RangeKeeper] Course ${index}: ${courseName} (${courseId})`);
      
      courses.push({
        id: courseId,
        name: courseName,
        url: url.startsWith('http') ? url : `https://ualearn.blackboard.com${url}`,
        scrapedAt: Date.now()
      });
    } catch (err) {
      console.error('[RangeKeeper] Error scraping course item:', err);
    }
  });
  
  console.log(`[RangeKeeper] Successfully scraped ${courses.length} courses`);
  return courses;
}

/**
 * Scrape assignments from Activity stream or course content
 */
function scrapeAssignments() {
  console.log('[RangeKeeper] Scraping assignments...');
  
  // Look for activity stream items
  const activityItems = document.querySelectorAll('div[class*="base-navigation"]');
  const assignments = [];
  
  console.log(`[RangeKeeper] Found ${activityItems.length} activity items`);
  
  activityItems.forEach((item, index) => {
    try {
      const content = item.querySelector('[class*="base-navigation-button-content"]');
      if (!content) return;
      
      const text = content.textContent.trim();
      
      // Look for assignment indicators
      if (text.toLowerCase().includes('due') || 
          text.toLowerCase().includes('assignment') || 
          text.toLowerCase().includes('submit')) {
        
        // Try to extract due date
        const dueDateMatch = text.match(/due:?\s*([^·]+)/i);
        const dueDate = dueDateMatch ? dueDateMatch[1].trim() : null;
        
        assignments.push({
          id: `activity-${index}`,
          title: text.split('·')[0].trim(), // First part before separator
          dueDate: dueDate,
          status: text.toLowerCase().includes('past due') ? 'overdue' : 'pending',
          scrapedAt: Date.now()
        });
      }
    } catch (err) {
      console.error('[RangeKeeper] Error scraping activity item:', err);
    }
  });
  
  console.log(`[RangeKeeper] Found ${assignments.length} assignments`);
  return assignments;
}

/**
 * Scrape calendar events
 */
function scrapeCalendar() {
  console.log('[RangeKeeper] Scraping calendar...');
  
  // Calendar events are typically divs with role="button"
  const calendarItems = document.querySelectorAll('div[role="button"][class*="calendar"]');
  const events = [];
  
  console.log(`[RangeKeeper] Found ${calendarItems.length} calendar items`);
  
  calendarItems.forEach((item, index) => {
    try {
      const text = item.textContent.trim();
      if (!text) return;
      
      events.push({
        id: `calendar-${index}`,
        title: text,
        scrapedAt: Date.now()
      });
    } catch (err) {
      console.error('[RangeKeeper] Error scraping calendar item:', err);
    }
  });
  
  console.log(`[RangeKeeper] Found ${events.length} calendar events`);
  return events;
}

/**
 * Scrape grades
 */
function scrapeGrades() {
  console.log('[RangeKeeper] Scraping grades...');
  
  const gradeItems = document.querySelectorAll(SELECTORS.gradeItem);
  const grades = [];
  
  gradeItems.forEach(item => {
    try {
      const scoreEl = item.querySelector(SELECTORS.gradeScore);
      if (!scoreEl) return;
      
      grades.push({
        id: `grade-${Date.now()}-${Math.random()}`,
        score: scoreEl.textContent.trim(),
        scrapedAt: Date.now()
      });
    } catch (err) {
      console.error('[RangeKeeper] Error scraping grade item:', err);
    }
  });
  
  console.log(`[RangeKeeper] Found ${grades.length} grades`);
  return grades;
}

// ============================================================================
// STORAGE (IndexedDB)
// ============================================================================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RangeKeeperDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assignments')) {
        db.createObjectStore('assignments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('grades')) {
        db.createObjectStore('grades', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

async function saveToIndexedDB(storeName, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    // Clear existing data
    store.clear();
    
    // Add new data
    data.forEach(item => store.put(item));
    
    await tx.complete;
    console.log(`[RangeKeeper] Saved ${data.length} items to ${storeName}`);
  } catch (err) {
    console.error(`[RangeKeeper] Error saving to IndexedDB:`, err);
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
    
    if (!response.ok) {
      throw new Error(`Backend sync failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('[RangeKeeper] Synced to backend:', result);
    return result;
  } catch (err) {
    console.error('[RangeKeeper] Backend sync error:', err);
    // Don't throw - offline mode is okay
    return null;
  }
}

// ============================================================================
// MAIN SCRAPE LOGIC
// ============================================================================

async function runScraper() {
  console.log('[RangeKeeper] Starting scraper...');
  
  // Detect current page
  currentPage = detectPage();
  console.log(`[RangeKeeper] Current page: ${currentPage}`);
  
  // Scrape based on page type
  if (currentPage === 'courses-list') {
    scrapedData.courses = scrapeCourses();
    await saveToIndexedDB('courses', scrapedData.courses);
  } else if (currentPage === 'activity-stream') {
    scrapedData.assignments = scrapeAssignments();
    await saveToIndexedDB('assignments', scrapedData.assignments);
  } else if (currentPage === 'calendar') {
    const events = scrapeCalendar();
    // Store calendar events as assignments
    scrapedData.assignments = [...scrapedData.assignments, ...events];
    await saveToIndexedDB('assignments', scrapedData.assignments);
  } else if (currentPage === 'grades') {
    scrapedData.grades = scrapeGrades();
    await saveToIndexedDB('grades', scrapedData.grades);
  }
  
  // Update last scraped timestamp
  scrapedData.lastScraped = Date.now();
  
  // Sync to backend
  await syncToBackend(scrapedData);
  
  // Send to background script for notification processing
  chrome.runtime.sendMessage({
    type: 'DATA_UPDATE',
    data: scrapedData
  });
  
  console.log('[RangeKeeper] Scraper complete');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Wait for page to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('[RangeKeeper] Initializing...');
  
  // Run scraper on page load
  setTimeout(runScraper, 2000); // Wait 2s for dynamic content
  
  // Set up MutationObserver for SPA navigation
  const observer = new MutationObserver((mutations) => {
    // Check if URL changed (SPA navigation)
    const newPage = detectPage();
    if (newPage !== currentPage) {
      console.log(`[RangeKeeper] Page changed: ${currentPage} → ${newPage}`);
      currentPage = newPage;
      setTimeout(runScraper, 1000);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('[RangeKeeper] Initialized and watching for changes');
}

// ============================================================================
// MESSAGE LISTENER
// ============================================================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SCRAPE_NOW') {
    runScraper().then(() => {
      sendResponse({ success: true });
    });
    return true; // Async response
  }
});
