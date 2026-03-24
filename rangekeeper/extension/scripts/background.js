/**
 * RangeKeeper Background Service Worker
 * Handles data storage, sync with backend, and notification logic
 */

console.log('[RangeKeeper] Background service worker loaded');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  backendUrl: 'http://localhost:3000', // TODO: Replace with production URL
  syncInterval: 30 * 60 * 1000, // 30 minutes
  notificationCheckInterval: 5 * 60 * 1000, // 5 minutes
};

// ============================================================================
// INDEXED DB SETUP
// ============================================================================

const DB_NAME = 'RangeKeeperDB';
const DB_VERSION = 1;

let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assignments')) {
        db.createObjectStore('assignments', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('grades')) {
        db.createObjectStore('grades', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('announcements')) {
        db.createObjectStore('announcements', { keyPath: 'id' });
      }
    };
  });
}

async function saveToStore(storeName, data) {
  if (!db) await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const items = Array.isArray(data) ? data : [data];
    
    items.forEach(item => {
      store.put(item);
    });
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function getAllFromStore(storeName) {
  if (!db) await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[RangeKeeper] Received message:', message.type);
  
  if (message.type === 'DATA_UPDATE') {
    handleDataUpdate(message.data)
      .then(() => sendResponse({ status: 'success' }))
      .catch(err => sendResponse({ status: 'error', error: err.message }));
    
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'GET_ASSIGNMENTS') {
    getAllFromStore('assignments')
      .then(assignments => sendResponse({ assignments }))
      .catch(err => sendResponse({ error: err.message }));
    
    return true;
  }
  
  if (message.type === 'GET_COURSES') {
    getAllFromStore('courses')
      .then(courses => sendResponse({ courses }))
      .catch(err => sendResponse({ error: err.message }));
    
    return true;
  }
});

// ============================================================================
// DATA HANDLING
// ============================================================================

async function handleDataUpdate(data) {
  console.log('[RangeKeeper] Handling data update...', data);
  
  try {
    // Save to IndexedDB
    if (data.courses?.length > 0) {
      await saveToStore('courses', data.courses);
      console.log(`[RangeKeeper] Saved ${data.courses.length} courses`);
    }
    
    if (data.assignments?.length > 0) {
      await saveToStore('assignments', data.assignments);
      console.log(`[RangeKeeper] Saved ${data.assignments.length} assignments`);
    }
    
    if (data.grades?.length > 0) {
      await saveToStore('grades', data.grades);
      console.log(`[RangeKeeper] Saved ${data.grades.length} grades`);
    }
    
    // Sync with backend
    await syncWithBackend(data);
    
    // Check if any notifications should be triggered
    await checkNotifications();
    
  } catch (err) {
    console.error('[RangeKeeper] Error handling data update:', err);
    throw err;
  }
}

async function syncWithBackend(data) {
  try {
    const response = await fetch(`${CONFIG.backendUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Backend sync failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('[RangeKeeper] Backend sync successful:', result);
    
  } catch (err) {
    console.error('[RangeKeeper] Backend sync error:', err);
    // Don't throw - extension should work offline
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

async function checkNotifications() {
  const assignments = await getAllFromStore('assignments');
  const now = Date.now();
  
  assignments.forEach(assignment => {
    if (!assignment.dueDate) return;
    
    const dueDate = new Date(assignment.dueDate).getTime();
    const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);
    
    // Notify if due within 24 hours and not yet notified
    if (hoursUntilDue > 0 && hoursUntilDue < 24 && !assignment.notified24h) {
      sendNotification({
        title: 'Assignment Due Soon',
        message: `${assignment.title} is due in ${Math.round(hoursUntilDue)} hours`,
        priority: hoursUntilDue < 2 ? 2 : 1
      });
      
      // Mark as notified (update in DB)
      assignment.notified24h = true;
      saveToStore('assignments', assignment);
    }
  });
}

function sendNotification({ title, message, priority = 0 }) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon128.png',
    title,
    message,
    priority
  });
}

// ============================================================================
// PERIODIC TASKS
// ============================================================================

// Set up periodic notification checks
chrome.alarms.create('checkNotifications', {
  periodInMinutes: CONFIG.notificationCheckInterval / (60 * 1000)
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'checkNotifications') {
    console.log('[RangeKeeper] Running periodic notification check...');
    checkNotifications();
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
  console.log('[RangeKeeper] Initializing background service worker...');
  
  try {
    await openDB();
    console.log('[RangeKeeper] Database opened');
    
    // Initial notification check
    await checkNotifications();
    
  } catch (err) {
    console.error('[RangeKeeper] Initialization error:', err);
  }
}

init();
