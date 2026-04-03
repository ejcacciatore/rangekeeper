/**
 * RangeKeeper Popup Dashboard
 * Shows: Assignments, Grades, Messages, Courses in tabbed view
 */

console.log('[RangeKeeper] Popup loaded');

// ============================================================================
// TAB NAVIGATION
// ============================================================================

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active from all tabs and content
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Activate clicked tab
    tab.classList.add('active');
    const tabId = `tab-${tab.dataset.tab}`;
    document.getElementById(tabId).classList.add('active');
  });
});

// ============================================================================
// DATA LOADING
// ============================================================================

async function loadData() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_ALL_DATA' });

    const courses = response.courses || [];
    const assignments = response.assignments || [];
    const grades = response.grades || [];
    const messages = response.messages || [];
    const feedback = response.feedback || [];

    // Update stats
    document.getElementById('courses-count').textContent = courses.length;
    document.getElementById('assignments-count').textContent = assignments.length;
    const semCodesForCount = grades.map(g => g.courseId?.match(/^(\d{6})-/)?.[1]).filter(Boolean);
    const curSem = semCodesForCount.length > 0 ? [...new Set(semCodesForCount)].sort().reverse()[0] : null;
    const currentSemGrades = grades.filter(g => {
      if (!g.courseId || g.courseId.startsWith('_') || g.assignmentName === '__OVERALL__') return false;
      const s = g.courseId.match(/^(\d{6})-/)?.[1];
      return !curSem || !s || s === curSem;
    });
    document.getElementById('grades-count').textContent = currentSemGrades.length;

    // Message count — sum unread or count individual messages
    const totalUnread = messages.reduce((sum, m) => sum + (m.unreadCount || (m.isUnread ? 1 : 0)), 0);
    document.getElementById('messages-count').textContent = totalUnread || messages.length;

    // Render each section
    renderAssignments(assignments);
    renderGrades(grades, feedback);
    renderMessages(messages);
    renderCourses(courses);
    updateLastSyncTime([...assignments, ...grades, ...messages]);

  } catch (err) {
    console.error('[RangeKeeper] Error loading data:', err);
    showError('Could not load data. Make sure Blackboard is open.');
  }
}

// ============================================================================
// RENDER: ASSIGNMENTS
// ============================================================================

function renderAssignments(assignments) {
  const container = document.getElementById('assignments-list');

  if (assignments.length === 0) {
    container.innerHTML = '<p class="empty-state">No assignments found. Visit Blackboard to sync.</p>';
    return;
  }

  const sorted = [...assignments].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  container.innerHTML = sorted.slice(0, 15).map(a => {
    const dueClass = getDueClass(a.dueDate);
    const dueText = formatDue(a.dueDate);
    const statusBadge = a.status ? `<span class="badge badge-${a.status}">${a.status}</span>` : '';

    return `
      <div class="item">
        <div class="item-main">
          <div class="item-title">${esc(a.title || 'Untitled')}</div>
          <div class="item-meta">
            ${a.courseId ? `<span class="course-tag">${esc(a.courseId)}</span>` : ''}
            ${statusBadge}
          </div>
        </div>
        <div class="item-right ${dueClass}">${dueText}</div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// RENDER: GRADES
// ============================================================================

function renderGrades(grades, feedback) {
  const container = document.getElementById('grades-list');

  // Detect current semester (highest 6-digit code)
  const semCodes = grades.map(g => g.courseId?.match(/^(\d{6})-/)?.[1]).filter(Boolean);
  const currentSem = semCodes.length > 0 ? [...new Set(semCodes)].sort().reverse()[0] : null;

  // Filter: current semester only, skip internal IDs like _401764_1
  const filteredGrades = grades.filter(g => {
    if (!g.courseId) return false;
    if (g.courseId.startsWith('_')) return false;
    const sem = g.courseId.match(/^(\d{6})-/)?.[1];
    return !currentSem || !sem || sem === currentSem;
  });

  const itemGrades = filteredGrades.filter(g => g.assignmentName !== '__OVERALL__');
  const overallGrades = filteredGrades.filter(g => g.assignmentName === '__OVERALL__');

  if (itemGrades.length === 0 && overallGrades.length === 0) {
    container.innerHTML = '<p class="empty-state">No grades found. Visit your Blackboard grades page to sync.</p>';
    return;
  }

  let html = '';

  // Show overall course grades first
  if (overallGrades.length > 0) {
    html += '<div class="section-header">Course Grades</div>';
    html += overallGrades.map(g => `
      <div class="item overall-grade">
        <div class="item-main">
          <div class="item-title">${esc(g.courseId || 'Course')}</div>
        </div>
        <div class="item-right grade-letter">${esc(g.letterGrade || g.overallGrade || '—')}</div>
      </div>
    `).join('');
    html += '<div class="section-header">Individual Grades</div>';
  }

  // Sort by most recent
  const sorted = [...itemGrades].sort((a, b) => (b.scrapedAt || 0) - (a.scrapedAt || 0));

  html += sorted.slice(0, 20).map(g => {
    const scoreText = formatScore(g);
    const pctClass = getGradeClass(g.percentage);

    // Check if there's feedback for this grade
    const hasFeedback = feedback.some(f =>
      f.assignmentName === g.assignmentName && f.instructorFeedback
    );
    const feedbackIcon = hasFeedback ? ' 💬' : '';

    return `
      <div class="item">
        <div class="item-main">
          <div class="item-title">${esc(g.assignmentName || 'Assignment')}${feedbackIcon}</div>
          <div class="item-meta">
            ${g.courseId ? `<span class="course-tag">${esc(g.courseId)}</span>` : ''}
            ${g.status ? `<span class="badge badge-${g.status}">${g.status}</span>` : ''}
          </div>
        </div>
        <div class="item-right ${pctClass}">${scoreText}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// ============================================================================
// RENDER: MESSAGES
// ============================================================================

function renderMessages(messages) {
  const container = document.getElementById('messages-list');

  if (messages.length === 0) {
    container.innerHTML = '<p class="empty-state">No messages found. Visit Blackboard messages to sync.</p>';
    return;
  }

  // Separate course threads from individual messages
  const threads = messages.filter(m => m.type === 'course-thread');
  const individual = messages.filter(m => m.type === 'message' || m.type === 'message-detail');

  let html = '';

  // Course threads with unread counts
  if (threads.length > 0) {
    html += '<div class="section-header">Course Messages</div>';
    html += threads.sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0)).map(t => `
      <div class="item ${t.unreadCount > 0 ? 'unread' : ''}">
        <div class="item-main">
          <div class="item-title">${esc(t.courseId || t.courseNum || 'Course')}</div>
        </div>
        <div class="item-right">
          ${t.unreadCount > 0 ? `<span class="unread-badge">${t.unreadCount}</span>` : '<span class="read-check">✓</span>'}
        </div>
      </div>
    `).join('');
  }

  // Individual messages
  if (individual.length > 0) {
    html += '<div class="section-header">Recent Messages</div>';
    html += individual.sort((a, b) => (b.scrapedAt || 0) - (a.scrapedAt || 0)).slice(0, 15).map(m => `
      <div class="item ${m.isUnread ? 'unread' : ''}">
        <div class="item-main">
          <div class="item-title">${esc(m.sender || 'Unknown')}</div>
          <div class="item-meta">${esc((m.subject || m.preview || '').substring(0, 60))}</div>
          ${m.date ? `<div class="item-date">${esc(m.date)}</div>` : ''}
        </div>
        <div class="item-right">
          ${m.isUnread ? '<span class="unread-dot">●</span>' : ''}
        </div>
      </div>
    `).join('');
  }

  container.innerHTML = html || '<p class="empty-state">No messages found.</p>';
}

// ============================================================================
// RENDER: COURSES
// ============================================================================

function renderCourses(courses) {
  const container = document.getElementById('courses-list');

  if (courses.length === 0) {
    container.innerHTML = '<p class="empty-state">No courses found. Visit Blackboard to sync.</p>';
    return;
  }

  container.innerHTML = courses.map(c => `
    <div class="item clickable" data-url="${esc(c.url || '')}">
      <div class="item-main">
        <div class="item-title">${esc(c.code || c.name || 'Course')}</div>
        <div class="item-meta">${esc(c.name || '')}</div>
      </div>
    </div>
  `).join('');

  // Click to open course
  container.querySelectorAll('.clickable').forEach(el => {
    el.addEventListener('click', () => {
      const url = el.dataset.url;
      if (url) chrome.tabs.create({ url });
    });
  });
}

// ============================================================================
// HELPERS
// ============================================================================

function formatScore(grade) {
  if (grade.score && grade.possible) {
    const pct = Math.round((parseFloat(grade.score) / parseFloat(grade.possible)) * 100);
    return `${grade.score}/${grade.possible} (${pct}%)`;
  }
  if (grade.letterGrade) return grade.letterGrade;
  if (grade.percentage) return `${grade.percentage}%`;
  return '—';
}

function getGradeClass(percentage) {
  if (!percentage) return '';
  if (percentage >= 90) return 'grade-a';
  if (percentage >= 80) return 'grade-b';
  if (percentage >= 70) return 'grade-c';
  if (percentage >= 60) return 'grade-d';
  return 'grade-f';
}

function getDueClass(dueDate) {
  if (!dueDate) return '';
  const now = Date.now();
  const due = new Date(dueDate).getTime();
  if (isNaN(due)) return '';
  const hours = (due - now) / (1000 * 60 * 60);
  if (hours < 0) return 'overdue';
  if (hours < 2) return 'due-urgent';
  if (hours < 24) return 'due-soon';
  if (hours < 48) return 'due-tomorrow';
  return '';
}

function formatDue(dueDate) {
  if (!dueDate) return 'No due date';
  const now = Date.now();
  const due = new Date(dueDate).getTime();
  if (isNaN(due)) return dueDate;
  const hours = (due - now) / (1000 * 60 * 60);
  if (hours < 0) return `Overdue ${Math.abs(Math.round(hours))}h`;
  if (hours < 2) return `${Math.round(hours * 60)}min`;
  if (hours < 24) return `${Math.round(hours)}h`;
  if (hours < 48) return 'Tomorrow';
  return `${Math.round(hours / 24)}d`;
}

function updateLastSyncTime(items) {
  const el = document.getElementById('last-sync-time');
  if (items.length === 0) { el.textContent = 'Never'; return; }
  const latest = Math.max(...items.map(i => i.scrapedAt || 0));
  if (latest === 0) { el.textContent = 'Never'; return; }
  const mins = Math.floor((Date.now() - latest) / 60000);
  if (mins < 1) el.textContent = 'Just now';
  else if (mins < 60) el.textContent = `${mins}m ago`;
  else el.textContent = `${Math.floor(mins / 60)}h ago`;
}

function esc(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function showError(msg) {
  document.getElementById('assignments-list').innerHTML = `<p class="empty-state error">${msg}</p>`;
}

// ============================================================================
// SYNC BUTTON
// ============================================================================

document.getElementById('sync-btn').addEventListener('click', async () => {
  const btn = document.getElementById('sync-btn');
  btn.textContent = '🔄 Syncing...';
  btn.disabled = true;

  try {
    // Try to trigger scrape on active Blackboard tab
    const [tab] = await chrome.tabs.query({ url: 'https://ualearn.blackboard.com/*', active: true });
    if (tab) {
      await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_NOW' });
      setTimeout(loadData, 2000);
    } else {
      // Open Blackboard activity stream
      await chrome.tabs.create({ url: 'https://ualearn.blackboard.com/ultra/stream', active: false });
      setTimeout(loadData, 4000);
    }
  } catch (err) {
    console.error('[RangeKeeper] Sync error:', err);
  }

  setTimeout(() => {
    btn.textContent = '🔄 Sync Now';
    btn.disabled = false;
  }, 3000);
});

// ============================================================================
// DEBUG BUTTONS — trigger scrapers on active Blackboard tab, log to console
// ============================================================================

document.querySelectorAll('.btn-debug').forEach(btn => {
  btn.addEventListener('click', async () => {
    const cmd = btn.dataset.cmd;
    btn.textContent = '⏳';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.url?.includes('blackboard.com')) {
        alert('Please navigate to a Blackboard page first, then click this button.');
        btn.textContent = btn.dataset.cmd.replace('DEBUG_', '');
        return;
      }

      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { type: cmd });
      } catch(e) {
        // Silently ignore — content script may not be ready yet
        response = null;
      }
      const result = response?.result;
      const count = Array.isArray(result) ? result.length : '✓';
      btn.textContent = `✅ ${count}`;
      // Only log if we actually got data
      if (Array.isArray(result) && result.length > 0) {
        console.log(`[RangeKeeper] ${cmd} (${result.length} items):`, result);
      }

      // Reload data to show new results
      setTimeout(loadData, 500);
    } catch (err) {
      btn.textContent = '❌';
      console.error('[RangeKeeper] Debug error:', err);
    }

    setTimeout(() => {
      btn.textContent = btn.dataset.cmd.replace('DEBUG_', '').toLowerCase();
      btn.style.textTransform = 'capitalize';
    }, 3000);
  });
});

// ============================================================================
// INIT
// ============================================================================

loadData();
