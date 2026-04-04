const fs = require('fs');
const path = require('path');

// Configuration
const dataPath = 'C:/Users/ejcac/repos/rangekeeper-v2/rangekeeper/data/latest.json';
const htmlPath = 'C:/Users/ejcac/repos/rangekeeper-v2/rangekeeper/massimo-student-report.html';

function generate() {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    const now = new Date();
    const nowMs = now.getTime();
    
    // Helper to check if two dates are same calendar day
    const isSameDay = (d1, d2) => 
        d1.getFullYear() === d2.getFullYear() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getDate() === d2.getDate();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 1. CATEGORIZATION
    const allAssignments = data.assignments || [];
    
    const pastDue = allAssignments.filter(a => a.due_date < nowMs && a.submitted === 0);
    const dueToday = allAssignments.filter(a => isSameDay(new Date(a.due_date), today) && a.submitted === 0);
    const dueTomorrow = allAssignments.filter(a => isSameDay(new Date(a.due_date), tomorrow) && a.submitted === 0);
    
    const upcomingExams = allAssignments.filter(a => {
        const title = (a.title || '').toLowerCase();
        const isExamFormat = title.includes('exam') || title.includes('quiz') || title.includes('test') || title.includes('midterm');
        
        const d = new Date(a.due_date);
        const startOfToday = new Date(today);
        startOfToday.setHours(0,0,0,0);
        const endOfWindow = new Date(today);
        endOfWindow.setDate(endOfWindow.getDate() + 3);
        endOfWindow.setHours(23,59,59,999);

        return isExamFormat && d >= startOfToday && d <= endOfWindow && a.submitted === 0;
    });

    // Weekly Plan (next 7 days)
    const weekAhead = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(today);
        day.setDate(day.getDate() + i);
        const dayAssignments = allAssignments.filter(a => isSameDay(new Date(a.due_date), day));
        weekAhead.push({
            date: day,
            items: dayAssignments
        });
    }

    // 2. HTML GENERATION ENGINE
    
    // Generate Summary Cards
    const summaryCardsHtml = data.courses.map(course => {
        const courseId = course.id;
        
        // Find overall grade for this course
        const overallGradeObj = data.grades ? data.grades.find(g => 
            (g.courseId === courseId || g.course_id === courseId) && 
            g.assignmentName === '__OVERALL__'
        ) : null;
        
        const letterGrade = overallGradeObj ? (overallGradeObj.letterGrade || overallGradeObj.letter_grade || '—') : '—';
        const scoreDisplay = overallGradeObj && overallGradeObj.score ? `${overallGradeObj.score} / ${overallGradeObj.possible}` : 'No total points';
        
        const courseAssignments = allAssignments.filter(a => (a.courseId === courseId || a.course_id === courseId));
        const pending = courseAssignments.filter(a => a.submitted === 0).length;
        
        return `
        <div class="summary-card">
            <div class="course">${course.name}</div>
            <div class="grade ${letterGrade.startsWith('A') ? 'grade-A' : (letterGrade.startsWith('B') ? 'grade-B' : 'grade-pending')}">${letterGrade}</div>
            <div class="label">${scoreDisplay}</div>
            <div class="source">${pending} Pending Items</div>
        </div>`;
    }).join('');

    // Generate Messages Alert if unread exists
    let messageAlertHtml = '';
    const unreadMessages = data.messages ? data.messages.filter(m => (m.isUnread || m.is_unread === 1)) : [];
    if (unreadMessages.length > 0) {
        messageAlertHtml = `
        <div class="burn-alert warning">
            <div class="burn-title">💬 UNREAD MESSAGES: ${unreadMessages.length} NEW</div>
            <div class="burn-list">
                ${unreadMessages.slice(0, 3).map(m => `<div>• From ${m.sender}: "${m.subject || m.preview}"</div>`).join('')}
            </div>
        </div>`;
    }

    // Generate Burning Page Alerts
    let burningHtml = messageAlertHtml;
    if (pastDue.length > 0) {
        burningHtml += `
        <div class="burn-alert critical">
            <div class="burn-title">🔥 NEEDS FINISH TODAY: ${pastDue.length} PAST DUE ITEMS</div>
            <div class="burn-list">
                ${pastDue.map(a => `<div>• ${a.title} (Originally due ${new Date(a.due_date).toLocaleDateString()})</div>`).join('')}
            </div>
        </div>`;
    }
    
    if (dueToday.length > 0) {
        burningHtml += `
        <div class="burn-alert high">
            <div class="burn-title">⏰ DUE TODAY: ${dueToday.length} ITEMS</div>
            <div class="burn-list">
                ${dueToday.map(a => `<div>• ${a.title} - ${new Date(a.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`).join('')}
            </div>
        </div>`;
    }

    if (dueTomorrow.length > 0) {
        burningHtml += `
        <div class="burn-alert warning">
            <div class="burn-title">⚠️ WARNING: DUE TOMORROW</div>
            <div class="burn-list">
                ${dueTomorrow.map(a => `<div>• ${a.title}</div>`).join('')}
            </div>
        </div>`;
    }

    if (upcomingExams.length > 0) {
        burningHtml += `
        <div class="burn-alert exam">
            <div class="burn-title">🎓 EXAM/QUIZ COMING UP</div>
            <div class="burn-list">
                ${upcomingExams.map(a => `<div>• ${a.title} (${new Date(a.due_date).toLocaleDateString()}, ${new Date(a.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</div>`).join('')}
            </div>
        </div>`;
    }

    // Generate Weekly Planner HTML
    const weeklyPlannerHtml = weekAhead.map(day => {
        const isCurrentDay = isSameDay(day.date, today);
        const dayLabel = day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
        const items = day.items.length > 0 
            ? day.items.map(a => `<div class="plan-item ${a.submitted ? 'done' : ''}">${a.title}</div>`).join('')
            : '<div class="plan-empty">No assignments</div>';
            
        return `
        <div class="plan-day ${isCurrentDay ? 'today' : ''}">
            <div class="plan-header">${dayLabel} ${isCurrentDay ? '(Today)' : ''}</div>
            <div class="plan-content">${items}</div>
        </div>`;
    }).join('');

    // Generate Master List Rows
    const masterListRows = allAssignments.sort((a, b) => a.due_date - b.due_date).map((a, idx) => {
        const d = new Date(a.due_date);
        const isPast = a.due_date < nowMs;
        const status = a.submitted === 1 ? 'Graded/Done' : (isPast ? 'Past Due' : 'Upcoming');
        const statusClass = a.submitted === 1 ? 'status-graded' : (isPast ? 'status-pastdue' : 'status-ungraded');
        
        return `
        <tr class="master-row ${a.submitted ? 'row-done' : 'row-active'}">
            <td>${a.title}</td>
            <td>${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
            <td><span class="${statusClass}">${status}</span></td>
            <td>${data.courses.find(c => c.id === a.course_id)?.name || 'Unknown'}</td>
        </tr>`;
    }).join('');

    // 3. FINAL TEMPLATE ASSEMBLY
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RangeKeeper Command Center — Massimo McRae</title>
<style>
  :root {
    --green: #1a7f37; --green-bg: #dafbe1;
    --yellow: #9a6700; --yellow-bg: #fff8c5;
    --red: #cf222e; --red-bg: #ffebe9;
    --gray: #57606a; --gray-bg: #f6f8fa;
    --blue: #0969da; --blue-bg: #ddf4ff;
    --purple: #8250df; --purple-bg: #fbefff;
    --border: #d0d7de;
    --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: var(--font); font-size: 14px; background: #f6f8fa; color: #1f2328; line-height: 1.5; }
  
  header { background: #1f2328; color: white; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  header h1 { font-size: 18px; font-weight: 600; }
  header .meta { font-size: 11px; color: #8b949e; margin-top: 4px; }
  .sync-badge { background: #3fb950; color: #0d1117; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }

  .container { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }

  /* THE BURNING PAGE */
  .burning-section { margin-bottom: 32px; display: flex; flex-direction: column; gap: 12px; }
  .burn-alert { border-radius: 8px; border: 1px solid; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); animation: slideIn 0.3s ease-out; }
  @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  
  .burn-alert.critical { background: #ffebe9; border-color: #cf222e; }
  .burn-alert.critical .burn-title { color: #cf222e; font-weight: 800; font-size: 16px; }
  
  .burn-alert.high { background: #fff8c5; border-color: #9a6700; }
  .burn-alert.high .burn-title { color: #9a6700; font-weight: 800; font-size: 16px; }
  
  .burn-alert.warning { background: #ddf4ff; border-color: #0969da; }
  .burn-alert.warning .burn-title { color: #0969da; font-weight: 700; font-size: 15px; }

  .burn-alert.exam { background: #fbefff; border-color: #8250df; }
  .burn-alert.exam .burn-title { color: #8250df; font-weight: 800; font-size: 16px; }

  .burn-list { margin-top: 10px; font-size: 13px; font-weight: 500; display: flex; flex-direction: column; gap: 4px; }

  /* SUMMARY GRIDS */
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 32px; }
  .summary-card { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 16px; text-align: center; }
  .summary-card .course { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--gray); margin-bottom: 8px; }
  .summary-card .grade { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .summary-card .label { font-size: 11px; color: var(--gray); font-weight: 600; }
  .summary-card .source { font-size: 10px; color: var(--blue); margin-top: 8px; opacity: 0.8; }

  /* WEEKLY PLANNER */
  .section-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .weekly-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 32px; overflow-x: auto; padding-bottom: 8px; }
  .plan-day { background: white; border: 1px solid var(--border); border-radius: 8px; min-height: 120px; display: flex; flex-direction: column; }
  .plan-day.today { border: 2px solid var(--blue); box-shadow: 0 0 10px var(--blue-bg); }
  .plan-header { background: var(--gray-bg); padding: 8px; font-size: 11px; font-weight: 700; text-align: center; border-bottom: 1px solid var(--border); }
  .plan-day.today .plan-header { background: var(--blue); color: white; border-bottom: none; }
  .plan-content { padding: 8px; flex-grow: 1; display: flex; flex-direction: column; gap: 4px; }
  .plan-item { font-size: 10px; padding: 4px 6px; background: var(--gray-bg); border-radius: 4px; border-left: 3px solid var(--gray); }
  .plan-item.done { text-decoration: line-through; opacity: 0.5; border-left-color: var(--green); }
  .plan-empty { font-size: 10px; color: #999; font-style: italic; text-align: center; margin-top: 20px; }

  /* MASTER LIST */
  .master-container { background: white; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-top: 32px; }
  .master-header { padding: 16px 20px; background: var(--gray-bg); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .master-controls { display: flex; gap: 8px; }
  .btn { padding: 4px 12px; border: 1px solid var(--border); background: white; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 600; }
  .btn.active { background: var(--blue); color: white; border-color: var(--blue); }

  table { width: 100%; border-collapse: collapse; }
  th { background: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--gray); padding: 12px 20px; text-align: left; border-bottom: 1px solid var(--border); }
  td { padding: 12px 20px; border-bottom: 1px solid var(--border); vertical-align: middle; font-size: 13px; }
  tr:hover td { background: #f6f8fa; }
  .row-done { opacity: 0.6; background: #fdfdfd; }
  
  .status-graded { color: var(--green); background: var(--green-bg); padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px; }
  .status-pastdue { color: var(--red); background: var(--red-bg); padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px; }
  .status-ungraded { color: var(--gray); background: var(--gray-bg); padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 11px; }

  @media (max-width: 768px) {
    .summary-grid { grid-template-columns: 1fr 1fr; }
    .weekly-grid { grid-template-columns: repeat(4, 1fr); overflow-x: auto; }
  }
</style>
</head>
<body>
<header>
  <div>
    <h1>Massimo McRae — Command Center</h1>
    <div class="meta">UA/UALearn Core · Generated ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
  </div>
  <span class="sync-badge">● LIVE REPORT</span>
</header>

<div class="container">

  <!-- THE BURNING PAGE -->
  <div class="burning-section">
    ${burningHtml || '<div class="burn-alert warning" style="background:#dafbe1; border-color:#1a7f37"><div class="burn-title" style="color:#1a7f37">✅ ALL CLEAR: YOU ARE CAUGHT UP FOR TODAY!</div></div>'}
  </div>

  <!-- SUMMARY CARDS -->
  <div class="section-title">📊 Course Overview</div>
  <div class="summary-grid">
    ${summaryCardsHtml}
  </div>

  <!-- WEEKLY PLANNER -->
  <div class="section-title">📅 Weekly Plan (Next 7 Days)</div>
  <div class="weekly-grid">
    ${weeklyPlannerHtml}
  </div>

  <!-- MASTER LIST -->
  <div class="section-title">📂 Master Assignment List</div>
  <div class="master-container">
    <div class="master-header">
      <div style="font-weight:700">All ${allAssignments.length} Assignments</div>
      <div class="master-controls">
        <button class="btn active" onclick="filterList('all')">All</button>
        <button class="btn" onclick="filterList('active')">Active Only</button>
      </div>
    </div>
    <table id="masterTable">
      <thead>
        <tr>
          <th>Assignment Name</th>
          <th style="cursor:pointer" onclick="sortTable()">Due Date ↕</th>
          <th>Status</th>
          <th>Course</th>
        </tr>
      </thead>
      <tbody>
        ${masterListRows}
      </tbody>
    </table>
  </div>

</div>

<script>
  function filterList(type) {
    const rows = document.querySelectorAll('.master-row');
    const btns = document.querySelectorAll('.btn');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    rows.forEach(row => {
      if (type === 'all') {
        row.style.display = '';
      } else {
        row.style.display = row.classList.contains('row-done') ? 'none' : '';
      }
    });
  }

  let sortAsc = true;
  function sortTable() {
    const table = document.getElementById('masterTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
      const dateA = new Date(a.cells[1].textContent);
      const dateB = new Date(b.cells[1].textContent);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
    
    sortAsc = !sortAsc;
    tbody.innerHTML = '';
    rows.forEach(r => tbody.appendChild(r));
  }
</script>

</body>
</html>`;

    fs.writeFileSync(htmlPath, fullHtml);
    console.log('✅ Command Center Report generated successfully!');
}

generate();
