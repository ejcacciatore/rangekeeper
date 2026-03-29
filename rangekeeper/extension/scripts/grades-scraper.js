/**
 * Grades Scraper for UA Blackboard Ultra
 * 
 * Scrapes from THREE contexts:
 * 1. Activity Stream — "Grade posted: X" items
 * 2. Course Grades page — Full grade table (course → Grades tab)
 * 3. Overall Grades page — All courses combined
 * 
 * Based on actual UA Blackboard Ultra DOM (March 2026)
 */

// ============================================================================
// ACTIVITY STREAM GRADES
// ============================================================================

function scrapeGradesFromActivity() {
  console.log('[RangeKeeper] Scraping grades from Activity stream...');
  const grades = [];

  // Activity stream items — Blackboard Ultra uses various containers
  // Try multiple selector strategies
  const containers = [
    ...document.querySelectorAll('[class*="activity-stream"] [class*="stream-item"]'),
    ...document.querySelectorAll('[class*="js-stream-item"]'),
    ...document.querySelectorAll('div[role="article"]'),
    ...document.querySelectorAll('[data-testid*="stream"]'),
    // Fallback: walk all elements looking for grade text
  ];

  // If specific selectors fail, try a broader approach
  let items = containers.length > 0 ? containers : findGradeItems();

  items.forEach((item, idx) => {
    try {
      const text = (item.textContent || '').trim();
      if (!text.includes('Grade posted') && !text.includes('grade posted')) return;

      // Extract course code (e.g., "202610-REL-100-919")
      const courseMatch = text.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
      const courseId = courseMatch ? courseMatch[1] : null;

      // Extract assignment name after "Grade posted:"
      const assignmentMatch = text.match(/Grade posted:\s*(.+?)(?:\s*View my grade|\s*Hide|\s*$)/i);
      const assignmentName = assignmentMatch ? assignmentMatch[1].trim() : 'Unknown Assignment';

      // Extract score if visible (e.g., "50 / 50")
      const scoreMatch = text.match(/(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/);
      const score = scoreMatch ? scoreMatch[1] : null;
      const possible = scoreMatch ? scoreMatch[2] : null;

      // Extract date (e.g., "Mar 27, 2026")
      const dateMatch = text.match(/([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})/);
      const postedDate = dateMatch ? dateMatch[1] : null;

      // Look for "View my grade" link
      const gradeLink = item.querySelector('a[href*="grade"], button[class*="grade"]');
      const gradeUrl = gradeLink ? (gradeLink.getAttribute('href') || '') : null;

      const gradeId = generateGradeId(courseId, assignmentName, idx);

      grades.push({
        id: gradeId,
        courseId: courseId,
        courseName: courseId,
        assignmentName: assignmentName,
        score: score,
        possible: possible,
        percentage: score && possible ? Math.round((parseFloat(score) / parseFloat(possible)) * 100) : null,
        postedDate: postedDate,
        gradeUrl: gradeUrl,
        feedback: null,
        source: 'activity-stream',
        scrapedAt: Date.now()
      });

      console.log(`[RangeKeeper] Activity grade: ${courseId} - ${assignmentName} ${score ? score + '/' + possible : '(hidden)'}`);
    } catch (err) {
      console.error('[RangeKeeper] Error scraping activity grade:', err);
    }
  });

  console.log(`[RangeKeeper] Found ${grades.length} grade postings from Activity stream`);
  return grades;
}

/**
 * Fallback: find grade items by walking the DOM looking for "Grade posted" text
 */
function findGradeItems() {
  const items = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    { acceptNode: (node) => node.textContent.includes('Grade posted') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }
  );

  while (walker.nextNode()) {
    // Walk up to find a reasonable container element
    let el = walker.currentNode.parentElement;
    let depth = 0;
    while (el && depth < 8) {
      // Look for a container that's roughly one "card" / "item"
      const rect = el.getBoundingClientRect();
      if (rect.height > 40 && rect.height < 400) {
        if (!items.includes(el)) items.push(el);
        break;
      }
      el = el.parentElement;
      depth++;
    }
  }
  return items;
}

// ============================================================================
// COURSE GRADES PAGE (Individual course → Grades tab)
// ============================================================================

function scrapeGradesFromGradesPage() {
  console.log('[RangeKeeper] Scraping from Course Grades page...');
  const grades = [];

  // Extract course info from URL or page header
  const url = window.location.href;
  const courseIdFromUrl = extractCourseIdFromUrl(url);

  // Look for overall course grade (e.g., "A-" shown in corner)
  const overallGradeEl = document.querySelector(
    '[class*="overall-grade"], [class*="courseGrade"], [class*="current-grade"]'
  );
  const overallGrade = overallGradeEl ? overallGradeEl.textContent.trim() : null;

  // The grades page has a table/list of items with columns:
  // Name | Due Date | Status | Grade | Results
  // Try multiple selector strategies for the grade rows

  const rows = findGradeRows();

  rows.forEach((row, idx) => {
    try {
      const text = (row.textContent || '').trim();
      if (!text || text.length < 5) return;

      // Extract assignment name — usually the first prominent text or link
      const nameEl = row.querySelector(
        'a[href*="attempt"], [class*="item-title"], [class*="name"], h3, h4, [class*="cell-title"]'
      ) || row.querySelector('a, span[class*="title"]');
      const assignmentName = nameEl ? nameEl.textContent.trim() : extractFirstMeaningfulText(row);
      if (!assignmentName || assignmentName.length < 2) return;

      // Extract score (e.g., "45/50", "30/30", "50 / 50")
      const scoreMatch = text.match(/(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/);
      const score = scoreMatch ? scoreMatch[1] : null;
      const possible = scoreMatch ? scoreMatch[2] : null;

      // Extract letter grade if present
      const letterMatch = text.match(/\b([A-F][+-]?)\b/);
      const letterGrade = letterMatch ? letterMatch[1] : null;

      // Extract percentage
      const pctMatch = text.match(/(\d+\.?\d*)%/);
      const percentage = pctMatch ? parseFloat(pctMatch[1]) : (score && possible ? Math.round((parseFloat(score) / parseFloat(possible)) * 100) : null);

      // Extract due date
      const dateMatch = text.match(/([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})|(\d{1,2}\/\d{1,2}\/\d{2,4})/);
      const dueDate = dateMatch ? (dateMatch[1] || dateMatch[2]) : null;

      // Extract status (Graded, Submitted, Not Started, etc.)
      let status = 'unknown';
      if (/graded/i.test(text)) status = 'graded';
      else if (/submitted/i.test(text)) status = 'submitted';
      else if (/not started|not submitted/i.test(text)) status = 'not_started';
      else if (/in progress/i.test(text)) status = 'in_progress';
      else if (/past due|overdue/i.test(text)) status = 'overdue';

      // Check for "View" button (leads to feedback)
      const viewBtn = row.querySelector('a[href*="attempt"], button[class*="view"], a[class*="view"]');
      const viewUrl = viewBtn ? (viewBtn.getAttribute('href') || '') : null;

      const gradeId = generateGradeId(courseIdFromUrl, assignmentName, idx);

      grades.push({
        id: gradeId,
        courseId: courseIdFromUrl,
        courseName: courseIdFromUrl,
        assignmentName: assignmentName,
        score: score,
        possible: possible,
        percentage: percentage,
        letterGrade: letterGrade,
        dueDate: dueDate,
        status: status,
        overallGrade: overallGrade,
        feedback: null,
        feedbackUrl: viewUrl,
        source: 'grades-page',
        scrapedAt: Date.now()
      });

      console.log(`[RangeKeeper] Grade: ${assignmentName} = ${score || '?'}/${possible || '?'} (${status})`);
    } catch (err) {
      console.error('[RangeKeeper] Error scraping grade row:', err);
    }
  });

  // Store overall course grade
  if (overallGrade && courseIdFromUrl) {
    grades.push({
      id: `overall_${courseIdFromUrl}`,
      courseId: courseIdFromUrl,
      courseName: courseIdFromUrl,
      assignmentName: '__OVERALL__',
      score: null,
      possible: null,
      percentage: null,
      letterGrade: overallGrade,
      status: 'overall',
      overallGrade: overallGrade,
      feedback: null,
      source: 'grades-page',
      scrapedAt: Date.now()
    });
  }

  console.log(`[RangeKeeper] Found ${grades.length} grades on Grades page`);
  return grades;
}

/**
 * Find grade rows using multiple selector strategies
 */
function findGradeRows() {
  // Strategy 1: Table rows
  let rows = document.querySelectorAll('table[class*="grade"] tbody tr, table[class*="Grade"] tbody tr');
  if (rows.length > 0) return [...rows];

  // Strategy 2: List items in grade view
  rows = document.querySelectorAll('[class*="grade-item"], [class*="gradebook-row"], [class*="grade-row"]');
  if (rows.length > 0) return [...rows];

  // Strategy 3: Blackboard Ultra uses div-based layouts — look for repeated structures
  rows = document.querySelectorAll('[class*="attempt"], [class*="gradeItem"]');
  if (rows.length > 0) return [...rows];

  // Strategy 4: Look for any list that contains score patterns
  const allLists = document.querySelectorAll('ul > li, div[role="row"], div[role="listitem"]');
  const gradeRows = [...allLists].filter(el => /\d+\s*\/\s*\d+/.test(el.textContent));
  if (gradeRows.length > 0) return gradeRows;

  // Strategy 5: Broadest — find divs/sections containing scores
  const allDivs = document.querySelectorAll('main div, main section, main article');
  const scoreDivs = [...allDivs].filter(el => {
    const text = el.textContent || '';
    const hasScore = /\d+\s*\/\s*\d+/.test(text);
    const rect = el.getBoundingClientRect();
    const isReasonableSize = rect.height > 20 && rect.height < 150;
    return hasScore && isReasonableSize;
  });

  // Deduplicate — remove children of other matches
  return deduplicateElements(scoreDivs);
}

// ============================================================================
// FEEDBACK SCRAPER
// ============================================================================

/**
 * Scrape feedback from a grade detail/attempt view
 * Called when user clicks "View" on a grade item
 */
function scrapeFeedback() {
  console.log('[RangeKeeper] Scraping feedback from grade detail view...');

  const feedback = {
    assignmentName: null,
    courseId: extractCourseIdFromUrl(window.location.href),
    score: null,
    possible: null,
    letterGrade: null,
    instructorFeedback: null,
    rubricScores: [],
    submissionDate: null,
    gradedDate: null,
    source: 'feedback-detail',
    scrapedAt: Date.now()
  };

  // Try to find assignment name from page header
  const headerEl = document.querySelector('h1, h2, [class*="title"], [class*="header"]');
  if (headerEl) feedback.assignmentName = headerEl.textContent.trim();

  // Score
  const scoreText = document.body.textContent || '';
  const scoreMatch = scoreText.match(/(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/);
  if (scoreMatch) {
    feedback.score = scoreMatch[1];
    feedback.possible = scoreMatch[2];
  }

  // Instructor feedback / comments
  // Look for common feedback containers
  const feedbackSelectors = [
    '[class*="feedback"]',
    '[class*="comment"]',
    '[class*="instructor-note"]',
    '[class*="grader-note"]',
    '[class*="annotation"]',
    '[data-testid*="feedback"]',
    '[aria-label*="feedback"]',
    '[aria-label*="comment"]',
  ];

  for (const sel of feedbackSelectors) {
    const el = document.querySelector(sel);
    if (el) {
      const text = el.textContent.trim();
      if (text.length > 2 && text.length < 5000) {
        feedback.instructorFeedback = text;
        break;
      }
    }
  }

  // Rubric scores (if rubric is shown)
  const rubricRows = document.querySelectorAll(
    '[class*="rubric"] tr, [class*="rubric"] [class*="row"], [class*="criterion"]'
  );
  rubricRows.forEach(row => {
    const criterion = row.querySelector('[class*="title"], [class*="criterion-name"], td:first-child');
    const score = row.querySelector('[class*="score"], [class*="points"], td:last-child');
    if (criterion && score) {
      feedback.rubricScores.push({
        criterion: criterion.textContent.trim(),
        score: score.textContent.trim()
      });
    }
  });

  // Dates
  const dateMatches = scoreText.match(/(?:submitted|graded|posted)\s*:?\s*([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}(?:\s+\d{1,2}:\d{2}\s*(?:AM|PM))?)/gi);
  if (dateMatches) {
    dateMatches.forEach(match => {
      if (/submitted/i.test(match)) feedback.submissionDate = match.replace(/submitted\s*:?\s*/i, '');
      if (/graded|posted/i.test(match)) feedback.gradedDate = match.replace(/(?:graded|posted)\s*:?\s*/i, '');
    });
  }

  feedback.id = generateGradeId(feedback.courseId, feedback.assignmentName, 'feedback');

  console.log('[RangeKeeper] Feedback scraped:', feedback.assignmentName, feedback.instructorFeedback ? 'has feedback' : 'no feedback');
  return feedback;
}

// ============================================================================
// HELPERS
// ============================================================================

function extractCourseIdFromUrl(url) {
  // Match patterns like /ultra/courses/_12345_1/grades or courseId=_12345_1
  const bbIdMatch = url.match(/courses?\/_(\d+)_\d/);
  if (bbIdMatch) return `_${bbIdMatch[1]}_1`;

  // Try to find course code in page content
  const pageText = document.body ? document.body.textContent : '';
  const codeMatch = pageText.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
  return codeMatch ? codeMatch[1] : null;
}

function extractFirstMeaningfulText(el) {
  // Get the first non-trivial text node
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    if (text.length > 2 && !/^\d+$/.test(text) && !/^[\/\-\|]$/.test(text)) {
      return text.substring(0, 100);
    }
  }
  return null;
}

function generateGradeId(courseId, assignmentName, suffix) {
  const clean = (str) => (str || 'unknown').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60);
  return `grade_${clean(courseId)}_${clean(assignmentName)}_${suffix}`;
}

function deduplicateElements(elements) {
  return elements.filter((el, i) => {
    return !elements.some((other, j) => j !== i && other.contains(el));
  });
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.scrapeGradesFromActivity = scrapeGradesFromActivity;
  window.scrapeGradesFromGradesPage = scrapeGradesFromGradesPage;
  window.scrapeFeedback = scrapeFeedback;
}
