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

  // UA Blackboard Ultra course message list DOM (observed March 2026):
  // Each message card has:
  //   - Avatar circle image
  //   - Sender name (bold) + unread badge (purple circle ②)
  //   - "To: All course members"
  //   - Date: "4 hours ago, at 3:27 PM" OR "3/4/26, 8:09 AM"
  //   - Preview text (truncated with "...")
  //   - Trash icon (delete)
  // The messages list is under "Course Messages" heading

  // Find message cards — look for elements with "To: All course members" or "To: " pattern
  const allEls = [...document.querySelectorAll('main *')];
  const msgCards = allEls.filter(el => {
    const text = el.textContent || '';
    const rect = el.getBoundingClientRect();
    return /To:\s*(All course members|[A-Z])/i.test(text)
      && rect.height > 40 && rect.height < 400
      && rect.width > 200;
  });

  const rows = candidates.length > 0 ? [...candidates, ...msgCards] : msgCards;
  const deduped = deduplicateElements(rows);

  console.log(`[RangeKeeper] Found ${deduped.length} message cards`);

  deduped.forEach((row, idx) => {
    const text = (row.textContent || '').trim();
    if (text.length < 10) return;

    // Sender — first meaningful text, or strong/bold element
    let sender = 'Unknown';
    const nameEls = row.querySelectorAll('strong, b, h3, h4, [class*="name"], [class*="author"]');
    for (const el of nameEls) {
      const t = el.textContent.trim();
      if (t.length > 2 && t.length < 60 && !/^To:|^Hey|^Course/.test(t)) {
        sender = t; break;
      }
    }
    // Fallback: first line of text
    if (sender === 'Unknown') {
      const firstLine = text.split('\n')[0].trim();
      if (firstLine.length > 2 && firstLine.length < 60) sender = firstLine;
    }

    // Recipients
    const toMatch = text.match(/To:\s*(.+?)(?:\n|$)/);
    const recipients = toMatch ? toMatch[1].trim() : null;

    // Date — multiple formats:
    // "4 hours ago, at 3:27 PM" | "3/4/26, 8:09 AM" | "2/26/26, 2:24 PM"
    let date = null;
    const relMatch = text.match(/(\d+\s+(?:hour|minute|day)s?\s+ago[^,]*(?:,\s*at\s*[\d:]+\s*[AP]M)?)/i);
    const absMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}(?:,\s*[\d:]+\s*[AP]M)?)/);
    date = relMatch ? relMatch[1] : (absMatch ? absMatch[1] : null);

    // Unread — purple numbered circle badge (①②③) or unread class
    const isUnread = /[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭]/.test(text)
      || !!row.querySelector('[class*="unread"]');

    // Unread count from badge
    const badgeMatch = text.match(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭]/);
    const circleToNum = {'①':1,'②':2,'③':3,'④':4,'⑤':5,'⑥':6,'⑦':7,'⑧':8,'⑨':9,'⑩':10,'⑪':11,'⑫':12,'⑬':13,'⑭':14};
    const unreadCount = badgeMatch ? (circleToNum[badgeMatch[0]] || 1) : 0;

    // Preview — the truncated message text
    const lines = text.split('\n').map(l => l.trim()).filter(l =>
      l.length > 10
      && !/^To:/i.test(l)
      && l !== sender
      && !/^\d{1,2}\/\d/.test(l)
      && !/hour[s]? ago/i.test(l)
    );
    const preview = lines[0] ? lines[0].substring(0, 200) : '';

    messages.push({
      id: `msg_thread_${courseId}_${idx}_${Date.now()}`,
      type: 'message',
      courseId: courseId,
      sender: sender,
      recipients: recipients,
      preview: preview,
      date: date,
      isUnread: isUnread,
      unreadCount: unreadCount,
      source: 'course-messages',
      scrapedAt: Date.now()
    });

    console.log(`[RangeKeeper] Message: ${sender} | ${date} | unread:${isUnread} | "${preview.substring(0,50)}"`);
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
