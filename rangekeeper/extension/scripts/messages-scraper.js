/**
 * Messages Scraper for UA Blackboard Ultra
 * Updated based on observed DOM (March 2026):
 * - Messages landing: rows with "ID: XXXXX.202610" + course code + unread badge
 * - Course messages: sender, "To: All course members", date, preview, unread circles
 * - Message detail: full body, sender, subject
 */

// ============================================================================
// MESSAGES LANDING PAGE
// URL: ualearn.blackboard.com/ultra/messages
// ============================================================================

function scrapeMessages() {
  console.log('[RangeKeeper] Scraping messages landing page...');
  const messages = [];

  // DOM structure observed:
  // <div> containing:
  //   "ID: 16102.202610"
  //   "202610-EN-103-025"
  //   [colored left border]
  //   [badge with number like 14]
  //   "New Message" button

  // Find current semester (highest 6-digit code on page)
  const allSemCodes = [...(document.body.textContent || '').matchAll(/(\d{6})-[A-Z]{2,5}-\d{2,4}/g)].map(m => m[1]);
  const currentSem = allSemCodes.length > 0 ? [...new Set(allSemCodes)].sort().reverse()[0] : null;
  console.log('[RangeKeeper] Current semester:', currentSem);

  // Get all elements and find ones with the ID: pattern
  const allEls = [...document.querySelectorAll('main *')];
  const rowCandidates = allEls.filter(el => {
    const text = el.textContent || '';
    const rect = el.getBoundingClientRect();
    return /ID:\s*\d{4,6}\.\d{6}/.test(text)
      && /\d{6}-[A-Z]{2,5}-\d{2,4}/.test(text)
      && rect.height > 20 && rect.height < 200
      && rect.width > 200;
  });

  const deduped = deduplicateElements(rowCandidates);
  console.log(`[RangeKeeper] Found ${deduped.length} message rows`);

  deduped.forEach((row, idx) => {
    const text = row.textContent || '';

    // Course code
    const codeMatch = text.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
    if (!codeMatch) return;
    const courseCode = codeMatch[1];

    // Semester filter
    const semCode = courseCode.split('-')[0];
    if (currentSem && semCode !== currentSem) {
      console.log(`[RangeKeeper] Skip old semester: ${courseCode}`);
      return;
    }

    // Internal ID
    const idMatch = text.match(/ID:\s*(\d{4,6}\.\d{6})/);
    const courseNum = idMatch ? idMatch[1] : null;

    // Unread badge — small element with just digits
    let unreadCount = 0;
    for (const child of row.querySelectorAll('*')) {
      const ct = child.textContent.trim();
      const rect = child.getBoundingClientRect();
      if (/^\d{1,3}$/.test(ct) && rect.width > 0 && rect.width < 60 && rect.height < 60) {
        unreadCount = parseInt(ct);
        break;
      }
    }

    const messagesOff = /messages off/i.test(text);

    messages.push({
      id: `msg_course_${courseCode}`,
      type: 'course-thread',
      courseId: courseCode,
      courseNum: courseNum,
      courseName: courseCode,
      unreadCount: messagesOff ? 0 : unreadCount,
      messagesOff: messagesOff,
      source: 'messages-landing',
      scrapedAt: Date.now()
    });

    console.log(`[RangeKeeper] ${courseCode}: ${messagesOff ? 'messages off' : unreadCount + ' unread'}`);
  });

  console.log(`[RangeKeeper] Total message threads: ${messages.length}`);
  return messages;
}

// ============================================================================
// COURSE MESSAGE LIST
// URL: viewCourseMessages?course_id=_XXXXX_1
// ============================================================================

function scrapeMessageThread() {
  console.log('[RangeKeeper] Scraping course message list...');
  const messages = [];

  const url = window.location.href;
  const courseIdMatch = url.match(/course_id=(_\d+_\d)/);
  const courseId = courseIdMatch ? courseIdMatch[1] : extractCourseFromPage();

  // Find message rows — table rows or list items with sender + date pattern
  const candidates = [
    ...document.querySelectorAll('table tbody tr'),
    ...document.querySelectorAll('li[class*="message"], li[class*="clearfix"]'),
    ...document.querySelectorAll('[class*="message-item"], [class*="messageRow"]'),
  ];

  // Fallback: find rows with date pattern + "To:" pattern
  const rows = candidates.length > 0 ? candidates : [...document.querySelectorAll('main tr, main li, main div')].filter(el => {
    const text = el.textContent || '';
    const rect = el.getBoundingClientRect();
    return /\d{1,2}\/\d{1,2}\/\d{2}/.test(text)
      && rect.height > 30 && rect.height < 300
      && rect.width > 200;
  });

  deduplicateElements(rows).forEach((row, idx) => {
    const text = (row.textContent || '').trim();
    if (text.length < 10) return;

    // Sender (usually first bold text or strong element)
    let sender = 'Unknown';
    const boldEl = row.querySelector('strong, b, [class*="author"], [class*="sender"]');
    if (boldEl) sender = boldEl.textContent.trim();

    // Recipients
    const toMatch = text.match(/To:\s*(.+?)(?:\n|$)/);
    const recipients = toMatch ? toMatch[1].trim() : null;

    // Date
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    const date = dateMatch ? dateMatch[0] : null;

    // Unread indicators (numbered circles ①②③ or unread class)
    const isUnread = /[①②③④⑤⑥⑦⑧⑨]/.test(text)
      || !!row.querySelector('[class*="unread"], [class*="new"]');

    // Preview text
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 5 && !/^To:|^\d{1,2}\/\d/.test(l));
    const preview = lines.slice(1).join(' ').substring(0, 150);

    messages.push({
      id: `msg_thread_${courseId}_${idx}`,
      type: 'message',
      courseId: courseId,
      sender: sender,
      recipients: recipients,
      preview: preview,
      date: date,
      isUnread: isUnread,
      source: 'course-messages',
      scrapedAt: Date.now()
    });
  });

  console.log(`[RangeKeeper] Found ${messages.length} messages in thread`);
  return messages;
}

// ============================================================================
// MESSAGE DETAIL
// ============================================================================

function scrapeMessageDetail() {
  console.log('[RangeKeeper] Scraping message detail...');

  const detail = {
    id: `msg_detail_${Date.now()}`,
    type: 'message-detail',
    courseId: extractCourseFromPage(),
    sender: null,
    subject: null,
    body: null,
    date: null,
    attachments: [],
    source: 'message-detail',
    scrapedAt: Date.now()
  };

  // Sender
  for (const sel of ['[class*="author"]','[class*="sender"]','[class*="from"]']) {
    const el = document.querySelector(sel);
    if (el) { detail.sender = el.textContent.trim(); break; }
  }

  // Subject
  for (const sel of ['[class*="subject"]','h1','h2']) {
    const el = document.querySelector(sel);
    if (el) { const t = el.textContent.trim(); if (t.length > 2 && t.length < 300) { detail.subject = t; break; } }
  }

  // Body
  for (const sel of ['[class*="message-body"]','[class*="vtbegenerated"]','article','[class*="content"]']) {
    const el = document.querySelector(sel);
    if (el) { detail.body = el.textContent.trim().substring(0, 5000); break; }
  }

  // Date
  const dateMatch = (document.body.textContent || '').match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  if (dateMatch) detail.date = dateMatch[1];

  // Attachments
  document.querySelectorAll('a[href*="attachment"], a[href*="download"]').forEach(a => {
    detail.attachments.push({ name: a.textContent.trim(), url: a.getAttribute('href') });
  });

  return detail;
}

// ============================================================================
// HELPERS
// ============================================================================

function extractCourseFromPage() {
  const pageText = document.body ? document.body.textContent : '';
  const codeMatch = pageText.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
  if (codeMatch) return codeMatch[1];
  const urlMatch = window.location.href.match(/course_id=(_\d+_\d)/);
  return urlMatch ? urlMatch[1] : null;
}

function deduplicateElements(elements) {
  return elements.filter((el, i) => {
    return !elements.some((other, j) => j !== i && other.contains(el));
  });
}

// Export
if (typeof window !== 'undefined') {
  window.scrapeMessages = scrapeMessages;
  window.scrapeMessageThread = scrapeMessageThread;
  window.scrapeMessageDetail = scrapeMessageDetail;
}
