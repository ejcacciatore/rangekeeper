const fs = require('fs');
const path = require('path');

// Mock data based on the spec
const mockAuditData = {
  courses: {
    en103: {
      code: '202610-EN-103-025',
      title: 'EN 103 — English Composition',
      section: '202610-EN-103-025',
      instructor: "O'Rourke",
      bbId: '_413210_1',
      overallGrade: 'B',
      gradeSource: 'blackboard',
      gradebookItems: [
        { name: 'Annotated Bibliography', dueDate: '3/27/26', status: 'Graded', earnedPts: 0, maxPts: 100, pct: 0, isLate: true },
        { name: 'Research Paper', dueDate: '4/10/26', status: 'Upcoming', earnedPts: null, maxPts: null, pct: null, isLate: false }
      ],
      advisorChecks: [
        { flag: 'DIFF', claim: 'Grade pending — Annotated Bib update', actual: '0/100', note: 'BB shows 0/100 (Late). Not updated.' }
      ]
    },
    engr101: {
      code: '202610-ENGR-101-006',
      title: 'ENGR 101 — Engineering Orientation',
      section: '202610-ENGR-101-006',
      instructor: 'S. Smith',
      bbId: '_397881_1',
      overallGrade: 'B-',
      gradeSource: 'blackboard',
      gradebookItems: [
        { name: 'Attendance Feb 5', dueDate: '2/5/26', status: 'Graded', earnedPts: 0, maxPts: 1, pct: 0, isLate: false },
        { name: 'Attendance Feb 26', dueDate: '2/26/26', status: 'Graded', earnedPts: 0, maxPts: 1, pct: 0, isLate: false },
        { name: 'Attendance Mar 12', dueDate: '3/12/26', status: 'Graded', earnedPts: 0, maxPts: 1, pct: 0, isLate: false },
        { name: 'Attendance Mar 26', dueDate: '3/26/26', status: 'Graded', earnedPts: 0, maxPts: 1, pct: 0, isLate: false }
      ],
      advisorChecks: [
        { flag: 'DIFF', claim: 'B+ claim vs BB', actual: '79.7% (B-)', note: 'Actual grade deviates from advisor claim.' }
      ]
    }
  }
};

// Read template
const template = fs.readFileSync('C:/Users/ejcac/repos/rangekeeper-v2/rangekeeper/audit-template.html', 'utf8');

// Generate
const html = template
  .replace('[DATE]', new Date().toLocaleDateString())
  .replace('[TIMESTAMP]', new Date().toLocaleString())
  .replace('[JSON_DATA]', JSON.stringify(mockAuditData));

// Save test file
const outputPath = 'C:/Users/ejcac/repos/rangekeeper-v2/rangekeeper/test-audit-output.html';
fs.writeFileSync(outputPath, html);

console.log('Test audit generated at:', outputPath);
