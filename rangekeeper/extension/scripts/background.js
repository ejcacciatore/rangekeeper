/**
 * RangeKeeper Background Service Worker
 * Handles: data storage, sync, notifications for grades/messages/assignments
 */

console.log('[RangeKeeper] Background service worker loaded');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  backendUrl: 'http://localhost:3000',
  syncInterval: 30 * 60 * 1000,
  notificationCheckInterval: 5 * 60 * 1000,
};

// Track what we've already notified about (prevent duplicates)
let notifiedItems = new Set();

// ============================================================================
// INDEXED DB
// ============================================================================

const DB_NAME = 'RangeKeeperDB';
const DB_VERSION = 3;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
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

async function saveToStore(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite');
    const store = tx.objectStore(storeName);
    const items = Array.isArray(data) ? data : [data];
    items.forEach(item => store.put(item));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllFromStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function getCount(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[RangeKeeper] Message received:', message.type);

  switch (message.type) {
    case 'DATA_UPDATE':
      handleDataUpdate(message.data, message.page)
        .then(() => sendResponse({ status: 'success' }))
        .catch(err => sendResponse({ status: 'error', error: err.message }));
      return true;

    case 'GET_ASSIGNMENTS':
      getAllFromStore('assignments')
        .then(assignments => sendResponse({ assignments }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_COURSES':
      getAllFromStore('courses')
        .then(courses => sendResponse({ courses }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_GRADES':
      getAllFromStore('grades')
        .then(grades => sendResponse({ grades }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_MESSAGES':
      getAllFromStore('messages')
        .then(messages => sendResponse({ messages }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_FEEDBACK':
      getAllFromStore('feedback')
        .then(feedback => sendResponse({ feedback }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_ALL_DATA':
      Promise.all([
        getAllFromStore('courses'),
        getAllFromStore('assignments'),
        getAllFromStore('grades'),
        getAllFromStore('messages'),
        getAllFromStore('feedback'),
      ]).then(([courses, assignments, grades, messages, feedback]) => {
        sendResponse({ courses, assignments, grades, messages, feedback });
      }).catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_STATS':
      Promise.all([
        getCount('courses'),
        getCount('assignments'),
        getCount('grades'),
        getCount('messages'),
        getCount('feedback'),
      ]).then(([courses, assignments, grades, messages, feedback]) => {
        sendResponse({ courses, assignments, grades, messages, feedback });
      }).catch(err => sendResponse({ error: err.message }));
      return true;
  }
});

// ============================================================================
// DATA HANDLING
// ============================================================================

async function handleDataUpdate(data, page) {
  try {
    // Save each data type
    if (data.courses?.length > 0) await saveToStore('courses', data.courses);
    if (data.assignments?.length > 0) await saveToStore('assignments', data.assignments);
    if (data.grades?.length > 0) await saveToStore('grades', data.grades);
    if (data.messages?.length > 0) await saveToStore('messages', data.messages);
    if (data.feedback?.length > 0) await saveToStore('feedback', data.feedback);

    // Check for new items that need notifications
    await checkForNewGrades(data.grades || []);
    await checkForNewMessages(data.messages || []);
    await checkAssignmentDeadlines();

    // Sync with backend
    await syncWithBackend(data);

    // Update badge
    await updateBadge();

  } catch (err) {
    console.error('[RangeKeeper] Error handling data update:', err);
  }
}

async function syncWithBackend(data) {
  try {
    const response = await fetch(`${CONFIG.backendUrl}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Sync failed: ${response.status}`);
    console.log('[RangeKeeper] Backend sync OK');
  } catch (err) {
    // Offline is fine
    console.log('[RangeKeeper] Backend unreachable');
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

async function checkForNewGrades(grades) {
  for (const grade of grades) {
    if (!grade.id || notifiedItems.has(`grade_${grade.id}`)) continue;

    // Only notify for grades with actual scores
    if (grade.score || grade.letterGrade) {
      const scoreText = grade.score && grade.possible
        ? `${grade.score}/${grade.possible}`
        : grade.letterGrade || 'New grade';

      sendNotification({
        id: `grade_${grade.id}`,
        title: '📊 New Grade Posted',
        message: `${grade.assignmentName || 'Assignment'}: ${scoreText}${grade.courseId ? ` (${grade.courseId})` : ''}`,
        priority: 1
      });

      notifiedItems.add(`grade_${grade.id}`);
    }
  }
}

async function checkForNewMessages(messages) {
  for (const msg of messages) {
    if (!msg.id || notifiedItems.has(`msg_${msg.id}`)) continue;

    // Notify for unread messages or new message details
    if (msg.isUnread || msg.type === 'message-detail') {
      const sender = msg.sender || 'Unknown';
      const subject = msg.subject || msg.preview || 'New message';

      sendNotification({
        id: `msg_${msg.id}`,
        title: `💬 ${sender}`,
        message: subject.substring(0, 100),
        priority: 0
      });

      notifiedItems.add(`msg_${msg.id}`);
    }

    // Notify about unread counts on messages landing
    if (msg.type === 'course-thread' && msg.unreadCount > 0) {
      const key = `unread_${msg.courseId}_${msg.unreadCount}`;
      if (!notifiedItems.has(key)) {
        sendNotification({
          id: key,
          title: '📨 Unread Messages',
          message: `${msg.unreadCount} unread in ${msg.courseId || 'course'}`,
          priority: 0
        });
        notifiedItems.add(key);
      }
    }
  }
}

async function checkAssignmentDeadlines() {
  const assignments = await getAllFromStore('assignments');
  const now = Date.now();

  for (const assignment of assignments) {
    if (!assignment.dueDate) continue;

    const dueDate = new Date(assignment.dueDate).getTime();
    if (isNaN(dueDate)) continue;

    const hoursUntilDue = (dueDate - now) / (1000 * 60 * 60);

    // 24-hour warning
    if (hoursUntilDue > 0 && hoursUntilDue < 24) {
      const key = `due24_${assignment.id}`;
      if (!notifiedItems.has(key)) {
        sendNotification({
          id: key,
          title: '⏰ Assignment Due Soon',
          message: `${assignment.title || 'Assignment'} due in ${Math.round(hoursUntilDue)} hours`,
          priority: 2
        });
        notifiedItems.add(key);
      }
    }

    // 2-hour warning
    if (hoursUntilDue > 0 && hoursUntilDue < 2) {
      const key = `due2_${assignment.id}`;
      if (!notifiedItems.has(key)) {
        sendNotification({
          id: key,
          title: '🚨 URGENT: Assignment Due',
          message: `${assignment.title || 'Assignment'} due in ${Math.round(hoursUntilDue * 60)} minutes!`,
          priority: 2
        });
        notifiedItems.add(key);
      }
    }
  }
}

function sendNotification({ id, title, message, priority = 0 }) {
  try {
    chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title,
      message,
      priority,
      requireInteraction: priority >= 2
    });
    console.log(`[RangeKeeper] 🔔 Notification: ${title} — ${message}`);
  } catch (err) {
    console.error('[RangeKeeper] Notification error:', err);
  }
}

// ============================================================================
// BADGE
// ============================================================================

async function updateBadge() {
  try {
    const [assignments, messages] = await Promise.all([
      getAllFromStore('assignments'),
      getAllFromStore('messages'),
    ]);

    // Count urgent items
    const now = Date.now();
    const urgentAssignments = assignments.filter(a => {
      if (!a.dueDate) return false;
      const due = new Date(a.dueDate).getTime();
      return !isNaN(due) && due > now && (due - now) < 48 * 60 * 60 * 1000;
    }).length;

    const unreadMessages = messages.filter(m =>
      m.isUnread || (m.type === 'course-thread' && m.unreadCount > 0)
    ).reduce((sum, m) => sum + (m.unreadCount || 1), 0);

    const total = urgentAssignments + unreadMessages;

    if (total > 0) {
      chrome.action.setBadgeText({ text: String(total) });
      chrome.action.setBadgeBackgroundColor({ color: urgentAssignments > 0 ? '#ff4444' : '#667eea' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (err) {
    console.error('[RangeKeeper] Badge update error:', err);
  }
}

// ============================================================================
// NOTIFICATION CLICK HANDLER
// ============================================================================

chrome.notifications.onClicked.addListener((notificationId) => {
  // Open Blackboard when notification is clicked
  chrome.tabs.create({ url: 'https://ualearn.blackboard.com/ultra/stream' });
});

// ============================================================================
// PERIODIC TASKS
// ============================================================================

chrome.alarms.create('checkNotifications', { periodInMinutes: 5 });
chrome.alarms.create('updateBadge', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'checkNotifications') {
    checkAssignmentDeadlines();
  }
  if (alarm.name === 'updateBadge') {
    updateBadge();
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
  console.log('[RangeKeeper] 🎯 Background service worker initializing...');
  try {
    await openDB();
    await checkAssignmentDeadlines();
    await updateBadge();

    // Load previously notified items from storage
    const stored = await chrome.storage.local.get('notifiedItems');
    if (stored.notifiedItems) {
      notifiedItems = new Set(stored.notifiedItems);
    }

    console.log('[RangeKeeper] ✅ Background initialized');
  } catch (err) {
    console.error('[RangeKeeper] Init error:', err);
  }
}

// Persist notified items periodically
setInterval(async () => {
  try {
    await chrome.storage.local.set({ notifiedItems: [...notifiedItems].slice(-500) });
  } catch (err) { /* ignore */ }
}, 60000);

init();
