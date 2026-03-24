/**
 * RangeKeeper Popup UI
 * Dashboard shown when extension icon is clicked
 */

console.log('[RangeKeeper] Popup loaded');

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const coursesCount = document.getElementById('courses-count');
const assignmentsCount = document.getElementById('assignments-count');
const dueSoonCount = document.getElementById('due-soon-count');
const assignmentsList = document.getElementById('assignments-list');
const coursesList = document.getElementById('courses-list');
const lastSyncTime = document.getElementById('last-sync-time');
const syncBtn = document.getElementById('sync-btn');

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadData() {
  try {
    // Get assignments from background script
    const assignmentsResponse = await chrome.runtime.sendMessage({ type: 'GET_ASSIGNMENTS' });
    const assignments = assignmentsResponse.assignments || [];
    
    // Get courses from background script
    const coursesResponse = await chrome.runtime.sendMessage({ type: 'GET_COURSES' });
    const courses = coursesResponse.courses || [];
    
    // Update UI
    updateStats(courses, assignments);
    renderAssignments(assignments);
    renderCourses(courses);
    updateLastSyncTime(assignments);
    
  } catch (err) {
    console.error('[RangeKeeper] Error loading data:', err);
    showError();
  }
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateStats(courses, assignments) {
  coursesCount.textContent = courses.length;
  assignmentsCount.textContent = assignments.length;
  
  const now = Date.now();
  const dueSoon = assignments.filter(a => {
    if (!a.dueDate) return false;
    const dueTime = new Date(a.dueDate).getTime();
    const hoursUntilDue = (dueTime - now) / (1000 * 60 * 60);
    return hoursUntilDue > 0 && hoursUntilDue < 48;
  });
  
  dueSoonCount.textContent = dueSoon.length;
}

function renderAssignments(assignments) {
  if (assignments.length === 0) {
    assignmentsList.innerHTML = '<p class="empty-state">No assignments found. Visit Blackboard to sync.</p>';
    return;
  }
  
  // Sort by due date (soonest first)
  const sorted = [...assignments].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  
  // Show next 10 assignments
  const upcoming = sorted.slice(0, 10);
  
  assignmentsList.innerHTML = upcoming.map(assignment => {
    const dueClass = getDueClass(assignment.dueDate);
    const dueText = formatDueDate(assignment.dueDate);
    
    return `
      <div class="assignment-item">
        <div class="assignment-title">${escapeHtml(assignment.title)}</div>
        <div class="assignment-due ${dueClass}">${dueText}</div>
      </div>
    `;
  }).join('');
}

function renderCourses(courses) {
  if (courses.length === 0) {
    coursesList.innerHTML = '<p class="empty-state">No courses found. Visit Blackboard to sync.</p>';
    return;
  }
  
  coursesList.innerHTML = courses.map(course => `
    <div class="course-item">
      <div class="course-name">${escapeHtml(course.name)}</div>
      <div class="course-meta">${course.id || ''}</div>
    </div>
  `).join('');
}

function updateLastSyncTime(assignments) {
  if (assignments.length === 0) {
    lastSyncTime.textContent = 'Never';
    return;
  }
  
  const lastScraped = Math.max(...assignments.map(a => a.scrapedAt || 0));
  if (lastScraped === 0) {
    lastSyncTime.textContent = 'Never';
  } else {
    lastSyncTime.textContent = formatRelativeTime(lastScraped);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getDueClass(dueDate) {
  if (!dueDate) return '';
  
  const now = Date.now();
  const dueTime = new Date(dueDate).getTime();
  const hoursUntilDue = (dueTime - now) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 0) return 'overdue';
  if (hoursUntilDue < 2) return 'due-urgent';
  if (hoursUntilDue < 24) return 'due-soon';
  return '';
}

function formatDueDate(dueDate) {
  if (!dueDate) return 'No due date';
  
  const now = Date.now();
  const dueTime = new Date(dueDate).getTime();
  const hoursUntilDue = (dueTime - now) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 0) {
    return `Overdue by ${Math.abs(Math.round(hoursUntilDue))}h`;
  }
  
  if (hoursUntilDue < 24) {
    return `Due in ${Math.round(hoursUntilDue)}h`;
  }
  
  if (hoursUntilDue < 48) {
    return 'Due tomorrow';
  }
  
  const daysUntilDue = Math.round(hoursUntilDue / 24);
  return `Due in ${daysUntilDue} days`;
}

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showError() {
  assignmentsList.innerHTML = '<p class="empty-state" style="color: #ff6b6b;">Error loading data. Try syncing again.</p>';
  coursesList.innerHTML = '<p class="empty-state" style="color: #ff6b6b;">Error loading data. Try syncing again.</p>';
}

// ============================================================================
// ACTIONS
// ============================================================================

syncBtn.addEventListener('click', async () => {
  syncBtn.textContent = '🔄 Syncing...';
  syncBtn.disabled = true;
  
  try {
    // Open Blackboard in new tab to trigger scraping
    await chrome.tabs.create({ url: 'https://ualearn.blackboard.com/ultra/course', active: false });
    
    // Wait a bit then reload data
    setTimeout(async () => {
      await loadData();
      syncBtn.textContent = '🔄 Sync Now';
      syncBtn.disabled = false;
    }, 3000);
    
  } catch (err) {
    console.error('[RangeKeeper] Sync error:', err);
    syncBtn.textContent = '🔄 Sync Failed';
    setTimeout(() => {
      syncBtn.textContent = '🔄 Sync Now';
      syncBtn.disabled = false;
    }, 2000);
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

loadData();
