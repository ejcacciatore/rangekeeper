/**
 * RangeKeeper Enhanced Scraper
 * Extracts rich data from Blackboard for Class Detail View
 * 
 * Data extracted:
 * - Full assignment details (title, due date, status, grade, rubric)
 * - Grade breakdowns (overall, by category, by assignment)
 * - Message details (sender, preview, instructor badge, read status)
 * - Course metadata (instructor, semester)
 */

console.log('[RangeKeeper] Enhanced scraper loaded');

// ============================================================================
// ENHANCED GRADE SCRAPER — /ultra/grades (Overview Page)
// ============================================================================

function scrapeGradesOverviewEnhanced() {
  console.log('[RangeKeeper] Enhanced: Scraping grades overview page...');
  const data = {
    courses: []
  };

  const url = window.location.href;
  const isOverviewPage = /\/ultra\/grades\b/.test(url) && !/\/courses\//.test(url);

  if (!isOverviewPage) {
    console.log('[RangeKeeper] Not on overview page, skipping');
    return data;
  }

  // Find all course grade cards on /ultra/grades
  // Each card contains: overall grade + recent items + what's next section
  
  const allEls = [...document.querySelectorAll('main *')];
  
  // Cards have pattern: internal ID + course code + grade badge + "Recent Grades" section
  const cards = allEls.filter(el => {
    const text = el.textContent || '';
    const rect = el.getBoundingClientRect();
    return /\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4}/.test(text)
      && rect.height > 100
      && rect.width > 400;
  });

  const deduped = deduplicateElements(cards);
  console.log(`[RangeKeeper] Found ${deduped.length} course cards on overview`);

  const seenCourses = new Set();

  deduped.forEach((card, idx) => {
    const text = card.textContent || '';

    // Extract course code
    const codeMatch = text.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
    if (!codeMatch) return;

    const courseCode = codeMatch[1];
    if (seenCourses.has(courseCode)) return;
    seenCourses.add(courseCode);

    // Extract overall grade (letter + percentage)
    const letterMatch = text.match(/\b([A-F][+-]?)\b/);
    const letterGrade = letterMatch ? letterMatch[1] : null;

    // Extract total score (e.g., "505 / 542")
    const totalMatch = text.match(/Total[^0-9]*([\d,]+\.?\d*)\s*\/\s*([\d,]+)/i)
      || text.match(/^\s*([\d,]+\.?\d*)\s*\/\s*([\d,]+\.?\d*)(?=\s|$)/m);
    
    let overallScore = null;
    let overallMaxScore = null;
    
    if (totalMatch) {
      overallScore = parseFloat(totalMatch[1].replace(/,/g, ''));
      overallMaxScore = parseFloat(totalMatch[2].replace(/,/g, ''));
    }

    const overallPercentage = overallScore && overallMaxScore 
      ? Math.round((overallScore / overallMaxScore) * 100)
      : null;

    // Extract category breakdown (if available)
    // Pattern: "Category Name (XX% of course grade) = percentage or score/max"
    const categoryMatches = [...text.matchAll(/([^(]+?)\s*\((\d+)%\s+of\s+course\s+grade\)\s*=?\s*(\d+\.?\d*%|\d+\.?\d*\s*\/\s*\d+\.?\d*)/gi)];
    const categories = categoryMatches.map(m => {
      const name = m[1].trim();
      const weight = parseInt(m[2]);
      const scoreText = m[3];
      
      let percentage = null;
      let score = null;
      let maxScore = null;

      if (/%$/.test(scoreText)) {
        percentage = parseFloat(scoreText);
      } else {
        const parts = scoreText.split('/').map(p => parseFloat(p.trim()));
        if (parts.length === 2) {
          score = parts[0];
          maxScore = parts[1];
          percentage = Math.round((score / maxScore) * 100);
        }
      }

      return {
        name: name,
        weight: weight,
        percentage: percentage,
        score: score,
        maxScore: maxScore
      };
    });

    // Extract recent graded items
    // Pattern: "Item Name  Score/Max" or "Item Name  Percentage%"
    const recentMatches = [...text.matchAll(/([^\n]+?)\s+(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/g)];
    const recentItems = recentMatches
      .slice(0, 5) // Limit to 5 recent
      .filter(m => {
        const name = m[1].trim();
        // Skip headers and totals
        return name.length > 3 
          && !/^(Total|Item|Name|Grade|Score|Date|Status|Due|Recent)/i.test(name);
      })
      .map(m => {
        const name = m[1].trim().substring(0, 100);
        const score = parseFloat(m[2]);
        const maxScore = parseFloat(m[3]);
        return {
          name: name,
          score: score,
          maxScore: maxScore,
          percentage: Math.round((score / maxScore) * 100)
        };
      });

    // Extract "What's Next" section (upcoming assignments)
    const whatNextMatch = text.match(/What's Next[\s\S]*?(?=\n[A-Z]|$)/);
    const upcomingItems = [];
    if (whatNextMatch) {
      const nextText = whatNextMatch[0];
      const upcomingMatches = [...nextText.matchAll(/([^\n]+?)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/g)];
      upcomingMatches.slice(0, 3).forEach(m => {
        upcomingItems.push({
          name: m[1].trim().substring(0, 100),
          dueDate: m[2]
        });
      });
    }

    // Build course object
    const courseData = {
      id: courseCode,
      name: courseCode, // Will be enhanced with actual name later
      grades: {
        overall: {
          letterGrade: letterGrade,
          score: overallScore,
          maxScore: overallMaxScore,
          percentage: overallPercentage
        },
        byCategory: categories,
        recentItems: recentItems
      },
      upcomingItems: upcomingItems,
      source: 'grades-overview',
      scrapedAt: Date.now()
    };

    data.courses.push(courseData);
    console.log(`[RangeKeeper] Enhanced: ${courseCode} = ${letterGrade} (${overallPercentage}%) + ${categories.length} categories`);
  });

  return data;
}

// ============================================================================
// ENHANCED GRADEBOOK SCRAPER — /ultra/courses/_XXXX_1/grades
// ============================================================================

function scrapeGradebookEnhanced() {
  console.log('[RangeKeeper] Enhanced: Scraping gradebook page...');
  const url = window.location.href;
  const courseIdFromUrl = url.match(/\/courses\/_(\d+)_\d+/)?.[1];
  
  // Extract course code from page
  const courseCode = extractCourseCodeFromPage();
  const courseRef = courseCode || `_${courseIdFromUrl}_1` || 'unknown';

  console.log(`[RangeKeeper] Enhanced: Course ref = ${courseRef}`);

  const assignments = [];

  // Find overall grade from top badge
  const overallGradeEl = document.querySelector('[class*="current-grade"], [class*="grade-badge"], .current-grade')
    || [...document.querySelectorAll('*')].find(el => {
      const text = el.textContent.trim();
      return /^[A-F][+-]?$/.test(text) && el.getBoundingClientRect().width < 80;
    });
  
  const overallGrade = overallGradeEl ? overallGradeEl.textContent.trim() : null;

  // Find gradebook rows (table or divs with score pattern)
  const tableRows = [...document.querySelectorAll('table tbody tr, [role="row"]')];
  const rows = deduplicateElements(tableRows);
  
  console.log(`[RangeKeeper] Enhanced: Found ${rows.length} gradebook rows`);

  const seenItems = new Set();

  rows.forEach((row, idx) => {
    const text = (row.textContent || '').trim();
    if (text.length < 5) return;

    // Extract assignment name
    const linkEl = row.querySelector('a');
    let assignmentName = null;
    
    if (linkEl) {
      assignmentName = linkEl.textContent.trim().split('\n')[0].trim();
    }

    if (!assignmentName || assignmentName.length < 2) {
      // Fallback: first non-date, non-score text line
      const lines = text.split('\n').map(l => l.trim()).filter(l =>
        l.length > 3
        && !/^\d{1,2}\/\d{1,2}\/\d{2}/.test(l)
        && !/^\d+\s*\/\s*\d+/.test(l)
        && !/^(Graded|Late|Submitted|Total|View|Status|Due Date)$/i.test(l)
      );
      assignmentName = lines[0]?.substring(0, 100);
    }

    if (!assignmentName || assignmentName.length < 2) return;
    if (/^Total$/i.test(assignmentName)) return;
    if (seenItems.has(assignmentName)) return;
    seenItems.add(assignmentName);

    // Extract score (e.g., "45 / 50")
    const scoreMatch = text.match(/([\d.]+)\s*\/\s*([\d,]+)(?!\s*\/|\d{2})/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;
    const maxScore = scoreMatch ? parseFloat(scoreMatch[2].replace(/,/g, '')) : null;
    const percentage = score && maxScore ? Math.round((score / maxScore) * 100) : null;

    // Extract status
    let status = 'unknown';
    if (/graded/i.test(text)) status = 'graded';
    else if (/submitted/i.test(text)) status = 'submitted';
    else if (/late/i.test(text)) status = 'late';
    else if (/not submitted/i.test(text)) status = 'not_submitted';

    // Extract due date
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    const dueDate = dateMatch ? dateMatch[1] : null;

    // Extract attempts
    const attemptsMatch = text.match(/(\d+)\s+attempt/i);
    const attempts = attemptsMatch ? parseInt(attemptsMatch[1]) : 1;

    // Build assignment object
    const assignment = {
      id: `assign_${courseRef}_${assignmentName.replace(/\s+/g, '_').substring(0, 40)}_${idx}`,
      courseId: courseRef,
      title: assignmentName,
      dueDate: dueDate,
      status: status,
      currentGrade: {
        score: score,
        maxScore: maxScore,
        percentage: percentage
      },
      attempts: attempts,
      source: 'gradebook',
      scrapedAt: Date.now()
    };

    assignments.push(assignment);
    console.log(`[RangeKeeper] Enhanced: ${assignmentName} = ${score}/${maxScore} [${status}] (${attempts} attempt${attempts > 1 ? 's' : ''})`);
  });

  return {
    course: {
      id: courseRef,
      overallGrade: overallGrade
    },
    assignments: assignments
  };
}

// ============================================================================
// ENHANCED MESSAGE SCRAPER
// ============================================================================

function scrapeMessagesEnhanced() {
  console.log('[RangeKeeper] Enhanced: Scraping messages...');
  
  const url = window.location.href;
  const isMessageThread = url.includes('/viewCourseMessages') || url.includes('/ultra/messages');
  
  if (!isMessageThread) {
    return { messages: [] };
  }

  const messages = [];
  
  // Find message cards with sender, date, preview pattern
  const msgCards = [...document.querySelectorAll('li[class*="message"], [class*="messageRow"], [class*="message-item"]')];
  
  console.log(`[RangeKeeper] Enhanced: Found ${msgCards.length} message cards`);

  msgCards.forEach((card, idx) => {
    const text = (card.textContent || '').trim();
    if (text.length < 10) return;

    // Extract sender name
    const nameEl = card.querySelector('strong, b, h3, h4, [class*="name"]');
    const sender = nameEl ? nameEl.textContent.trim() : 'Unknown';

    // Extract recipient ("To: All course members" or "To: Name")
    const toMatch = text.match(/To:\s*(.+?)(?:\n|Date|Time|$)/);
    const recipient = toMatch ? toMatch[1].trim() : 'Unknown';

    // Extract date/time
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2}),?\s+(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/);
    const messageDate = dateMatch ? `${dateMatch[1]} ${dateMatch[2]}` : 'Unknown date';

    // Extract preview text (first 150 chars after metadata)
    const previewMatch = text.match(/(?:To:.*?\n)([\s\S]{0,150}?)(?:\n|$)/);
    const preview = previewMatch ? previewMatch[1].trim() : text.substring(0, 150);

    // Detect if sender is instructor (check for "Instructor" badge or role)
    const isInstructor = /instructor|professor|faculty/i.test(card.innerHTML);

    // Detect read status (unread badge = purple circle)
    const hasUnreadBadge = card.querySelector('[class*="unread"], [class*="new"], [aria-label*="unread"], [aria-label*="new"]') !== null;

    const message = {
      id: `msg_${idx}`,
      sender: sender,
      recipient: recipient,
      date: messageDate,
      preview: preview,
      isInstructor: isInstructor,
      isUnread: hasUnreadBadge,
      source: 'messages',
      scrapedAt: Date.now()
    };

    messages.push(message);
    console.log(`[RangeKeeper] Enhanced: Message from ${sender} ${isInstructor ? '(Instructor)' : ''} - "${preview.substring(0, 60)}..."`);
  });

  return { messages: messages };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function extractCourseCodeFromPage() {
  // Try breadcrumb first
  const breadcrumb = document.querySelector('[class*="breadcrumb"], nav, h1, h2');
  const breadcrumbText = breadcrumb?.textContent || '';
  const code = breadcrumbText.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/)?.[1];
  if (code) return code;

  // Try page title
  const title = document.title || '';
  const titleCode = title.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/)?.[1];
  if (titleCode) return titleCode;

  // Try full body text
  return (document.body?.textContent || '').match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/)?.[1];
}

function deduplicateElements(elements) {
  return elements.filter((el, i) => !elements.some((other, j) => j !== i && other.contains(el)));
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
  window.scrapeGradesOverviewEnhanced = scrapeGradesOverviewEnhanced;
  window.scrapeGradebookEnhanced = scrapeGradebookEnhanced;
  window.scrapeMessagesEnhanced = scrapeMessagesEnhanced;
  window.RangeKeeperEnhanced = {
    scrapeGradesOverview: scrapeGradesOverviewEnhanced,
    scrapeGradebook: scrapeGradebookEnhanced,
    scrapeMessages: scrapeMessagesEnhanced
  };
}
