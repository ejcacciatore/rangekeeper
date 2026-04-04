/**
 * RangeKeeper WebAssign Scraper
 * Integrated via Blackboard LTI Bridge
 * Handles Step 6 of the Audit Spec
 */

console.log('[RangeKeeper] WebAssign scraper loaded');

function scrapeWebAssignHome() {
  console.log('[RangeKeeper] Scraping WebAssign Home...');
  
  // Extract overall grade
  // Structure: <span> containing "95.37" inside a grade container
  const overallEl = [...document.querySelectorAll('span, div')].find(el => 
    /\b\d{1,3}\.\d{2}\b/.test(el.textContent) && 
    (el.className.includes('grade') || el.parentElement.className.includes('grade'))
  );
  
  const overallGrade = overallEl ? parseFloat(overallEl.textContent.match(/\b\d{1,3}\.\d{2}\b/)[0]) : null;

  // Extract Assignments
  const assignments = [];
  const rows = document.querySelectorAll('.assignment-row, tr.row'); // placeholders
  
  // WebAssign specific patterns:
  // "HW-S4.5-Optimization Problems"
  // "Tuesday, April 7, 2026 at 12:59 AM EDT"
  
  const allText = document.body.innerText;
  const assignmentMatches = [...allText.matchAll(/([A-Z0-9.-]+-[^\n]+)\s+(?:Homework|Test|Recitation)\s+([A-Za-z]+,\s+[A-Za-z]+\s+\d+,\s+\d+\s+at\s+[\d:]+\s+[AP]M\s+[A-Z]{3})/g)];
  
  assignmentMatches.forEach(m => {
    assignments.push({
      name: m[1].trim(),
      dueDate: m[2],
      isExtended: allText.includes(m[1] + ' Extended'),
      source: 'webassign-home'
    });
  });

  return {
    overallGrade,
    assignments,
    scrapedAt: Date.now()
  };
}

function scrapeWebAssignGrades() {
  console.log('[RangeKeeper] Scraping WebAssign Grades context...');
  
  const categories = [];
  // Pattern: "Homework (21 items) 94.50%"
  const catMatches = [...document.body.innerText.matchAll(/([A-Za-z]+)\s*\((\d+)\s+items?\)\s*(\d+\.?\d*)%/g)];
  
  catMatches.forEach(m => {
    categories.push({
      name: m[1],
      count: parseInt(m[2]),
      percentage: parseFloat(m[3])
    });
  });

  return {
    categories,
    scrapedAt: Date.now()
  };
}

// Export to window
if (typeof window !== 'undefined') {
  window.scrapeWebAssignHome = scrapeWebAssignHome;
  window.scrapeWebAssignGrades = scrapeWebAssignGrades;
}
