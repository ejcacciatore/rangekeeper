/**
 * Grades Scraper — UA Blackboard Ultra
 * Updated with exact DOM structure observed March 2026
 *
 * THREE pages scraped:
 * 1. /ultra/grades — Overview cards (course + overall grade + recent grades)
 * 2. /ultra/courses/_XXXX_1/grades — Individual gradebook (table rows)
 * 3. /ultra/stream — Activity stream (assignments + "Grade posted" items in Recent)
 */

// ============================================================================
// ACTIVITY STREAM GRADES
// URL: ualearn.blackboard.com/ultra/stream
// DOM: Timeline with sections "Important", "Upcoming", "Today", "Recent"
// Grade postings appear in "Recent" section with "Grade posted: X" text
// ============================================================================

function scrapeGradesFromActivity() {
  console.log('[RangeKeeper] Scraping grades from Activity stream...');
  const grades = [];

  // Find all text nodes containing "Grade posted"
  const found = findGradeItems();
  console.log(`[RangeKeeper] Grade item candidates: ${found.length}`);

  found.forEach((item, idx) => {
    try {
      const text = (item.textContent || '').trim();

      // Course code
      const codeMatch = text.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/);
      const courseId = codeMatch ? codeMatch[1] : null;

      // Assignment name after "Grade posted:"
      const assignMatch = text.match(/Grade posted:\s*(.+?)(?:\n|View my grade|Hide|$)/i);
      const assignmentName = assignMatch ? assignMatch[1].trim() : 'Unknown Assignment';

      // Score if visible (e.g., "50 / 50")
      const scoreMatch = text.match(/([\d.]+)\s*\/\s*([\d.]+)/);
      const score = scoreMatch ? scoreMatch[1] : null;
      const possible = scoreMatch ? scoreMatch[2] : null;

      // Date (e.g., "Mar 27, 2026")
      const dateMatch = text.match(/([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})/);
      const postedDate = dateMatch ? dateMatch[1] : null;

      grades.push({
        id: `act_grade_${(courseId || 'unknown').replace(/[-]/g,'_')}_${idx}`,
        courseId: courseId,
        assignmentName: assignmentName,
        score: score,
        possible: possible,
        percentage: score && possible ? Math.round((parseFloat(score)/parseFloat(possible))*100) : null,
        postedDate: postedDate,
        source: 'activity-stream',
        scrapedAt: Date.now()
      });

      console.log(`[RangeKeeper] Activity grade: ${courseId} — ${assignmentName} ${score ? score+'/'+possible : '(score hidden)'}`);
    } catch(e) {
      console.error('[RangeKeeper] Error parsing activity grade:', e);
    }
  });

  console.log(`[RangeKeeper] Activity grades found: ${grades.length}`);
  return grades;
}

function findGradeItems() {
  const found = [];
  const seen = new Set();

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!/Grade posted/i.test(node.textContent)) continue;

    let el = node.parentElement;
    let best = null;
    let depth = 0;
    while (el && depth < 12) {
      const tag = el.tagName?.toLowerCase();
      const rect = el.getBoundingClientRect();
      if (tag === 'li' || tag === 'article') { best = el; break; }
      if ((tag === 'div' || tag === 'section') && rect.height > 50 && rect.height < 500 && rect.width > 200) {
        best = el;
      }
      el = el.parentElement;
      depth++;
    }
    if (best && !seen.has(best)) { seen.add(best); found.push(best); }
  }
  return found;
}

// ============================================================================
// GRADES OVERVIEW PAGE
// URL: ualearn.blackboard.com/ultra/grades
// DOM: Course cards with:
//   - "18424.202610" (internal ID)
//   - "202610-REL-100-919" (course code)  
//   - "A-" letter grade badge (green pill)
//   - "Recent Grades" section with individual items
//   - "505 / 540" total score
//   - Individual items: "Module 6 Quiz" + "50 / 50" badge
//   - "View all work (28)" link
// ============================================================================

function detectCurrentSemester() {
  const codes = [...(document.body?.textContent || '').matchAll(/(\d{6})-[A-Z]{2,5}/g)].map(m => m[1]);
  return codes.length > 0 ? [...new Set(codes)].sort().reverse()[0] : null;
}

function scrapeGradesFromGradesPage() {
  console.log('[RangeKeeper] Scraping grades page...');
  const grades = [];
  const url = window.location.href;
  const currentSem = detectCurrentSemester();
  console.log('[RangeKeeper] Semester:', currentSem, '| URL:', url);

  // ── GRADES OVERVIEW (/ultra/grades) ──────────────────────────────────────
  const isOverview = /\/ultra\/grades\b/.test(url) && !/\/courses\//.test(url);

  if (isOverview) {
    // Find course cards — each has internal ID + course code + grade badge
    // Structure: div containing "XXXXX.202610\n202610-COURSE-CODE" + colored grade pill

    const allEls = [...document.querySelectorAll('main *')];

    // Find containers that have both internal ID pattern and course code pattern
    const cards = allEls.filter(el => {
      const text = el.textContent || '';
      const rect = el.getBoundingClientRect();
      return /\d{4,6}\.\d{6}/.test(text)
        && /\d{6}-[A-Z]{2,5}-\d{2,4}/.test(text)
        && rect.height > 80
        && rect.width > 400;
    });

    const deduped = deduplicateElements(cards);
    console.log(`[RangeKeeper] Found ${deduped.length} course grade cards`);

    const seenCourses = new Set();

    deduped.forEach((card, idx) => {
      const text = card.textContent || '';

      // Course code
      const codeMatch = text.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/g);
      if (!codeMatch) return;

      // Process each course code found (card may contain multiple)
      codeMatch.forEach(courseCode => {
        if (seenCourses.has(courseCode)) return;

        // Semester filter
        const semCode = courseCode.split('-')[0];
        if (currentSem && semCode !== currentSem) {
          console.log(`[RangeKeeper] Skip old semester: ${courseCode}`);
          return;
        }
        seenCourses.add(courseCode);

        // Letter grade (e.g., "A-", "B+", "C")
        const letterMatch = text.match(/\b([A-F][+-]?)\b/);
        const letterGrade = letterMatch ? letterMatch[1] : null;

        // Total score (e.g., "505 / 540")
        const totalMatch = text.match(/Total[^0-9]*([\d,]+\.?\d*)\s*\/\s*([\d,]+)/i)
          || text.match(/([\d,]+\.?\d*)\s*\/\s*([\d,]+\.?\d*)\s*(?=\n|View all)/);
        const totalScore = totalMatch ? totalMatch[1].replace(/,/g,'') : null;
        const totalPossible = totalMatch ? totalMatch[2].replace(/,/g,'') : null;

        // Individual recent grades from card
        const itemMatches = [...text.matchAll(/([^\n]+?)\s+([\d.]+)\s*\/\s*([\d.]+)/g)];

        // Push overall grade
        grades.push({
          id: `overview_${courseCode}`,
          courseId: courseCode,
          assignmentName: '__OVERALL__',
          score: totalScore,
          possible: totalPossible,
          percentage: totalScore && totalPossible ? Math.round((parseFloat(totalScore)/parseFloat(totalPossible))*100) : null,
          letterGrade: letterGrade,
          status: 'overall',
          source: 'grades-overview',
          scrapedAt: Date.now()
        });

        console.log(`[RangeKeeper] ${courseCode}: ${letterGrade || '?'} (${totalScore}/${totalPossible})`);

        // Push individual recent grade items
        itemMatches.slice(0, 5).forEach((m, i) => {
          const name = m[1].trim().replace(/^[^a-zA-Z0-9]+/, '');
          if (name.length < 3 || /^Total$/i.test(name)) return;
          grades.push({
            id: `overview_item_${courseCode}_${i}`,
            courseId: courseCode,
            assignmentName: name,
            score: m[2],
            possible: m[3],
            percentage: Math.round((parseFloat(m[2])/parseFloat(m[3]))*100),
            letterGrade: null,
            status: 'graded',
            source: 'grades-overview',
            scrapedAt: Date.now()
          });
        });
      });
    });

    console.log(`[RangeKeeper] Overview grades: ${grades.length} items`);
    return grades;
  }

  // ── COURSE GRADEBOOK (/ultra/courses/_XXXX_1/grades) ─────────────────────
  // Table with columns: Item Name | Due Date | Status | Grade (pill) | View button
  // URL example: ualearn.blackboard.com/ultra/courses/_401764_1/grades

  const courseIdFromUrl = url.match(/\/courses\/_(\d+)_\d+/)?.[1];
  const courseCodeFromPage = (document.body?.textContent || '').match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/)?.[1];
  const courseRef = courseCodeFromPage || (courseIdFromUrl ? `_${courseIdFromUrl}_1` : 'unknown');

  // Overall grade from top-right badge ("A-" in green pill)
  const overallEl = document.querySelector('[class*="current-grade"], [class*="grade-badge"], .current-grade') ||
    [...document.querySelectorAll('*')].find(el => {
      const text = el.textContent.trim();
      return /^[A-F][+-]?$/.test(text) && el.getBoundingClientRect().width < 80;
    });
  const overallGrade = overallEl ? overallEl.textContent.trim() : null;

  // Find grade rows — table rows or divs with score pill pattern "NN / NN"
  const tableRows = [...document.querySelectorAll('table tbody tr, [role="row"]')];
  const scoreDivs = [...document.querySelectorAll('main *')].filter(el => {
    const text = el.textContent || '';
    const rect = el.getBoundingClientRect();
    return /\d+\s*\/\s*\d+/.test(text) && rect.height > 20 && rect.height < 150 && rect.width > 300;
  });

  const rows = deduplicateElements([...tableRows, ...scoreDivs]);
  console.log(`[RangeKeeper] Gradebook rows: ${rows.length}`);

  const seenItems = new Set();

  rows.forEach((row, idx) => {
    const text = (row.textContent || '').trim();
    if (text.length < 5) return;

    // Assignment name — first meaningful text/link
    let assignmentName = null;
    const nameEl = row.querySelector('a, [class*="title"], [class*="name"], h3, h4, td:first-child');
    if (nameEl) assignmentName = nameEl.textContent.trim().split('\n')[0].trim();
    if (!assignmentName) {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3 && !/^\d/.test(l));
      assignmentName = lines[0]?.substring(0, 100);
    }
    if (!assignmentName || assignmentName.length < 2) return;
    if (seenItems.has(assignmentName)) return;
    seenItems.add(assignmentName);

    // Score pill (e.g., "45 / 50", "0 / 30", "505 / 540", "93.93%")
    const scoreMatch = text.match(/([\d.]+)\s*\/\s*([\d,]+)/);
    const pctMatch = text.match(/([\d.]+)%/);
    const score = scoreMatch ? scoreMatch[1] : null;
    const possible = scoreMatch ? scoreMatch[2].replace(/,/g,'') : null;
    const percentage = score && possible
      ? Math.round((parseFloat(score)/parseFloat(possible))*100)
      : pctMatch ? parseFloat(pctMatch[1]) : null;

    // Status
    let status = 'unknown';
    if (/graded/i.test(text)) status = 'graded';
    else if (/submitted/i.test(text)) status = 'submitted';
    else if (/late/i.test(text)) status = 'late';
    else if (/no participation/i.test(text)) status = 'missing';
    else if (/not submitted/i.test(text)) status = 'not_submitted';

    // Due date
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
    const dueDate = dateMatch ? dateMatch[1] : null;

    // View link
    const viewLink = row.querySelector('a[href*="attempt"], button, a');
    const viewUrl = viewLink?.getAttribute('href') || null;

    grades.push({
      id: `gradebook_${courseRef}_${assignmentName.replace(/\s+/g,'_').substring(0,40)}_${idx}`,
      courseId: courseRef,
      assignmentName: assignmentName,
      score: score,
      possible: possible,
      percentage: percentage,
      letterGrade: overallGrade,
      dueDate: dueDate,
      status: status,
      feedbackUrl: viewUrl,
      source: 'gradebook',
      scrapedAt: Date.now()
    });

    console.log(`[RangeKeeper] Grade: ${assignmentName} = ${score || pctMatch?.[1]+'%' || '?'}/${possible || ''} [${status}]`);
  });

  // Push overall course grade
  if (overallGrade && courseRef) {
    grades.push({
      id: `gradebook_overall_${courseRef}`,
      courseId: courseRef,
      assignmentName: '__OVERALL__',
      score: null, possible: null, percentage: null,
      letterGrade: overallGrade,
      status: 'overall',
      source: 'gradebook',
      scrapedAt: Date.now()
    });
  }

  console.log(`[RangeKeeper] Gradebook: ${grades.length} items for ${courseRef}`);
  return grades;
}

// ============================================================================
// FEEDBACK (grade detail/attempt view)
// ============================================================================

function scrapeFeedback() {
  console.log('[RangeKeeper] Scraping feedback...');
  const url = window.location.href;
  const body = document.body?.textContent || '';

  const courseCode = body.match(/(\d{6}-[A-Z]{2,5}-\d{2,4}-\d{2,4})/)?.[1];
  const header = document.querySelector('h1, h2, [class*="title"]');
  const assignmentName = header?.textContent?.trim() || null;

  const scoreMatch = body.match(/([\d.]+)\s*\/\s*([\d.]+)/);
  const score = scoreMatch?.[1] || null;
  const possible = scoreMatch?.[2] || null;

  // Instructor feedback text
  let instructorFeedback = null;
  for (const sel of ['[class*="feedback"]','[class*="comment"]','[class*="annotation"]','[class*="instructor"]']) {
    const el = document.querySelector(sel);
    if (el) { const t = el.textContent.trim(); if (t.length > 2) { instructorFeedback = t; break; } }
  }

  // Rubric
  const rubricRows = [...document.querySelectorAll('[class*="rubric"] tr, [class*="criterion"]')];
  const rubricScores = rubricRows.map(row => ({
    criterion: row.querySelector('td:first-child, [class*="name"]')?.textContent?.trim(),
    score: row.querySelector('td:last-child, [class*="score"]')?.textContent?.trim()
  })).filter(r => r.criterion);

  return {
    id: `feedback_${(courseCode||'').replace(/[-]/g,'_')}_${Date.now()}`,
    courseId: courseCode,
    assignmentName: assignmentName,
    score: score,
    possible: possible,
    percentage: score && possible ? Math.round((parseFloat(score)/parseFloat(possible))*100) : null,
    instructorFeedback: instructorFeedback,
    rubricScores: rubricScores,
    source: 'feedback-detail',
    scrapedAt: Date.now()
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function deduplicateElements(elements) {
  return elements.filter((el, i) => !elements.some((other, j) => j !== i && other.contains(el)));
}

// Export
if (typeof window !== 'undefined') {
  window.scrapeGradesFromActivity = scrapeGradesFromActivity;
  window.scrapeGradesFromGradesPage = scrapeGradesFromGradesPage;
  window.scrapeFeedback = scrapeFeedback;
}
