/**
 * Messages Scraper for UA Blackboard Ultra
 * 
 * Scrapes from THREE contexts:
 * 1. Messages landing page — Course list with unread counts
 * 2. Course message list — Individual messages within a course
 * 3. Message detail — Full message body when opened
 * 
 * Based on actual UA Blackboard Ultra DOM (March 2026)
 * 
 * URL patterns observed:
 * - Messages landing: /ultra/messages
 * - Course messages: /webapps/blackboard/execute/viewCourseMessages?course_id=_XXXXX_1
 * - Message thread: /webapps/discussionboard/do/message?action=...
 */

// ============================================================================
// MESSAGES LANDING PAGE (Course list with unread counts)
// ============================================================================

function scrapeMessages() {
  console.log('[RangeKeeper] Scraping messages landing page...');
  const messages = [];

  // The messages page shows a list of courses with unread message counts
  // Each row has: colored indicator bar, course ID number, course code, unread count badge, "New Message" button

  // Strategy 1: Look for list items or rows with course identifiers
  const rows = findMessageCourseRows();

  rows.forEach((row, idx) => {
    try {
      const text = (row.textContent || '').trim();
      if (!text || text.length < 5) return;

      // Extract course code (e.g., "202610-EN-103-025")
      const courseMatch = text.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
      const courseId = courseMatch ? courseMatch[1] : null;

      // Extract course ID number (e.g., "16102.202610")
      const courseNumMatch = text.match(/(\d{4,6}\.\d{6})/);
      const courseNum = courseNumMatch ? courseNumMatch[1] : null;

      // Extract unread count from badge/circle
      // Look for a small element with just a number (the unread badge)
      const badges = row.querySelectorAll('span, div, em, strong');
      let unreadCount = 0;
      for (const badge of badges) {
        const badgeText = badge.textContent.trim();
        const rect = badge.getBoundingClientRect();
        // Badges are typically small elements with just a number
        if (/^\d{1,3}$/.test(badgeText) && rect.width < 50 && rect.height < 50) {
          unreadCount = parseInt(badgeText);
          break;
        }
      }

      // Also try aria-label or title attributes
      if (unreadCount === 0) {
        const ariaMatch = text.match(/(\d+)\s*(?:unread|new|message)/i);
        if (ariaMatch) unreadCount = parseInt(ariaMatch[1]);
      }

      // Extract link to course messages
      const link = row.querySelector('a[href*="message"], a[href*="Message"]');
      const messageUrl = link ? (link.getAttribute('href') || '') : null;

      if (!courseId && !courseNum) return; // Skip if no course identifier found

      const msgId = `msg_course_${courseId || courseNum}_${idx}`;

      messages.push({
        id: msgId,
        type: 'course-thread',
        courseId: courseId,
        courseNum: courseNum,
        courseName: courseId || courseNum,
        unreadCount: unreadCount,
        messageUrl: messageUrl,
        source: 'messages-landing',
        scrapedAt: Date.now()
      });

      console.log(`[RangeKeeper] Message thread: ${courseId || courseNum} (${unreadCount} unread)`);
    } catch (err) {
      console.error('[RangeKeeper] Error scraping message course row:', err);
    }
  });

  console.log(`[RangeKeeper] Found ${messages.length} course message threads`);
  return messages;
}

// ============================================================================
// COURSE MESSAGE LIST (Messages within a specific course)
// ============================================================================

function scrapeMessageThread() {
  console.log('[RangeKeeper] Scraping course message list...');
  const messages = [];

  // When viewing messages for a specific course, we see:
  // - Sender name (e.g., "Thom O'Rourke")
  // - Recipients (e.g., "To: All course members")  
  // - Date (e.g., "3/27/26")
  // - Subject/preview text
  // - Unread indicator (numbered circle like ①)
  // - Delete button (trash icon)

  // Extract course context from URL or page
  const url = window.location.href;
  const courseIdMatch = url.match(/course_id=(_\d+_\d)/);
  const courseId = courseIdMatch ? courseIdMatch[1] : extractCourseFromPage();

  // Find message rows
  const rows = findMessageRows();

  rows.forEach((row, idx) => {
    try {
      const text = (row.textContent || '').trim();
      if (!text || text.length < 10) return;

      // Extract sender name
      let sender = 'Unknown';
      const senderEl = row.querySelector(
        '[class*="author"], [class*="sender"], [class*="from"], [class*="name"]'
      );
      if (senderEl) {
        sender = senderEl.textContent.trim();
      } else {
        // Try to extract from text — sender is usually first line or bold text
        const boldEl = row.querySelector('strong, b, [style*="font-weight"]');
        if (boldEl) sender = boldEl.textContent.trim();
      }

      // Extract recipients
      const toMatch = text.match(/To:\s*(.+?)(?:\n|$)/);
      const recipients = toMatch ? toMatch[1].trim() : null;

      // Extract date — multiple formats
      let messageDate = null;
      const dateMatch = text.match(
        /(\d{1,2}\/\d{1,2}\/\d{2,4})|([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})/
      );
      if (dateMatch) messageDate = dateMatch[0];

      // Extract subject/preview
      let subject = null;
      let preview = null;
      const subjectEl = row.querySelector(
        '[class*="subject"], [class*="title"], h3, h4'
      );
      if (subjectEl) {
        subject = subjectEl.textContent.trim();
      }
      // Preview is usually the truncated body text
      const previewEl = row.querySelector('[class*="preview"], [class*="body"], [class*="snippet"]');
      if (previewEl) {
        preview = previewEl.textContent.trim().substring(0, 200);
      }

      // Check if unread (look for unread indicators)
      let isUnread = false;
      const unreadIndicators = row.querySelectorAll('[class*="unread"], [class*="new"], [class*="badge"]');
      if (unreadIndicators.length > 0) isUnread = true;
      // Also check for bold text (common unread indicator)
      const hasBoldSubject = row.querySelector('[class*="subject"] strong, [class*="subject"] b');
      if (hasBoldSubject) isUnread = true;
      // Check for numbered circle indicator
      if (/[①②③④⑤⑥⑦⑧⑨]/.test(text)) isUnread = true;

      // Extract message link
      const messageLink = row.querySelector('a[href*="message"], a[href*="Message"]');
      const messageUrl = messageLink ? (messageLink.getAttribute('href') || '') : null;

      const msgId = `msg_${courseId || 'unknown'}_${idx}_${Date.now()}`;

      messages.push({
        id: msgId,
        type: 'message',
        courseId: courseId,
        sender: sender,
        recipients: recipients,
        subject: subject || extractSubjectFromText(text, sender),
        preview: preview || text.substring(0, 200),
        date: messageDate,
        isUnread: isUnread,
        messageUrl: messageUrl,
        source: 'course-messages',
        scrapedAt: Date.now()
      });

      console.log(`[RangeKeeper] Message: ${sender} - ${subject || '(no subject)'} [${isUnread ? 'UNREAD' : 'read'}]`);
    } catch (err) {
      console.error('[RangeKeeper] Error scraping message row:', err);
    }
  });

  console.log(`[RangeKeeper] Found ${messages.length} messages in course thread`);
  return messages;
}

// ============================================================================
// MESSAGE DETAIL (Full message body)
// ============================================================================

function scrapeMessageDetail() {
  console.log('[RangeKeeper] Scraping message detail...');

  const detail = {
    id: `msg_detail_${Date.now()}`,
    type: 'message-detail',
    courseId: null,
    sender: null,
    recipients: null,
    subject: null,
    body: null,
    date: null,
    attachments: [],
    source: 'message-detail',
    scrapedAt: Date.now()
  };

  // Course ID from URL
  const url = window.location.href;
  const courseIdMatch = url.match(/course_id=(_\d+_\d)/);
  detail.courseId = courseIdMatch ? courseIdMatch[1] : null;

  // Sender
  const senderSelectors = [
    '[class*="message-author"]', '[class*="sender"]', '[class*="from"]',
    'div[class*="header"] [class*="name"]', '[data-testid*="author"]'
  ];
  for (const sel of senderSelectors) {
    const el = document.querySelector(sel);
    if (el) { detail.sender = el.textContent.trim(); break; }
  }

  // Subject
  const subjectSelectors = [
    '[class*="message-subject"]', '[class*="subject"]', 'h1', 'h2[class*="title"]'
  ];
  for (const sel of subjectSelectors) {
    const el = document.querySelector(sel);
    if (el) { 
      const text = el.textContent.trim();
      if (text.length > 2 && text.length < 300) {
        detail.subject = text;
        break;
      }
    }
  }

  // Message body
  const bodySelectors = [
    '[class*="message-body"]', '[class*="message-content"]', '[class*="messageBody"]',
    '[class*="vtbegenerated"]', // Blackboard rich text container
    'div[class*="body"]', 'article', '[data-testid*="body"]'
  ];
  for (const sel of bodySelectors) {
    const el = document.querySelector(sel);
    if (el) {
      detail.body = el.textContent.trim().substring(0, 5000);
      break;
    }
  }

  // Fallback for body — look for the largest text block in main content
  if (!detail.body) {
    const mainContent = document.querySelector('main, [role="main"], #content');
    if (mainContent) {
      const paragraphs = mainContent.querySelectorAll('p, div');
      let longestText = '';
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text.length > longestText.length && text.length < 5000) {
          longestText = text;
        }
      });
      if (longestText.length > 20) detail.body = longestText;
    }
  }

  // Date
  const dateText = document.body.textContent || '';
  const dateMatch = dateText.match(
    /(?:sent|posted|date)\s*:?\s*([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}(?:\s+\d{1,2}:\d{2}\s*(?:AM|PM))?)/i
  ) || dateText.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}\s*(?:AM|PM)?)/);
  if (dateMatch) detail.date = dateMatch[1] || dateMatch[0];

  // Attachments
  const attachmentLinks = document.querySelectorAll('a[href*="attachment"], a[href*="download"], a[class*="attachment"]');
  attachmentLinks.forEach(link => {
    detail.attachments.push({
      name: link.textContent.trim(),
      url: link.getAttribute('href')
    });
  });

  console.log('[RangeKeeper] Message detail:', detail.sender, detail.subject, detail.body ? `${detail.body.length} chars` : 'no body');
  return detail;
}

// ============================================================================
// HELPERS
// ============================================================================

function findMessageCourseRows() {
  // Strategy 1: List items
  let rows = document.querySelectorAll('li[class*="message"], li[class*="course"]');
  if (rows.length > 0) return [...rows];

  // Strategy 2: Divs with course identifiers
  rows = document.querySelectorAll('div[class*="conversation"], div[class*="thread"]');
  if (rows.length > 0) return [...rows];

  // Strategy 3: Table rows
  rows = document.querySelectorAll('table tbody tr');
  if (rows.length > 0) {
    // Filter to rows that contain course-like identifiers
    return [...rows].filter(r => /\d{6}-[A-Z]/.test(r.textContent));
  }

  // Strategy 4: Broadest — find repeating structures containing course codes
  const allElements = document.querySelectorAll('main div, main li, main section');
  const courseElements = [...allElements].filter(el => {
    const text = el.textContent || '';
    const hasCode = /\d{6}-[A-Z]{2,5}-\d{2,4}/.test(text) || /\d{4,6}\.\d{6}/.test(text);
    const rect = el.getBoundingClientRect();
    const isReasonableSize = rect.height > 20 && rect.height < 200;
    return hasCode && isReasonableSize;
  });

  return deduplicateElements(courseElements);
}

function findMessageRows() {
  // Individual message rows in a course message list
  
  // Strategy 1: Table rows (classic Blackboard)
  let rows = document.querySelectorAll('table[class*="message"] tbody tr, #messageList tr');
  if (rows.length > 0) return [...rows];

  // Strategy 2: List items
  rows = document.querySelectorAll('li[class*="message"], li[class*="clearfix"]');
  if (rows.length > 0) return [...rows];

  // Strategy 3: Divs
  rows = document.querySelectorAll('[class*="message-item"], [class*="messageRow"]');
  if (rows.length > 0) return [...rows];

  // Strategy 4: Look for repeating elements containing sender names + dates
  const allElements = document.querySelectorAll('main div, main li, main tr');
  const messageElements = [...allElements].filter(el => {
    const text = el.textContent || '';
    // Messages typically have: name + date + "To:" pattern
    const hasDate = /\d{1,2}\/\d{1,2}\/\d{2}/.test(text);
    const hasTo = /To:/.test(text);
    const rect = el.getBoundingClientRect();
    const isReasonableSize = rect.height > 30 && rect.height < 300;
    return hasDate && hasTo && isReasonableSize;
  });

  return deduplicateElements(messageElements);
}

function extractCourseFromPage() {
  const pageText = document.body ? document.body.textContent : '';
  const courseMatch = pageText.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
  if (courseMatch) return courseMatch[1];

  const urlMatch = window.location.href.match(/course_id=(_\d+_\d)/);
  return urlMatch ? urlMatch[1] : null;
}

function extractSubjectFromText(text, sender) {
  // Remove the sender name and date, take the next meaningful line
  let cleaned = text.replace(sender, '').replace(/To:.*$/m, '').replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/, '').trim();
  const lines = cleaned.split('\n').filter(l => l.trim().length > 5);
  return lines[0] ? lines[0].trim().substring(0, 100) : null;
}

function deduplicateElements(elements) {
  return elements.filter((el, i) => {
    return !elements.some((other, j) => j !== i && other.contains(el));
  });
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.scrapeMessages = scrapeMessages;
  window.scrapeMessageThread = scrapeMessageThread;
  window.scrapeMessageDetail = scrapeMessageDetail;
}
