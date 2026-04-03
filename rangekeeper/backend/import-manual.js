/**
 * Manual data import from extension IndexedDB
 * Run with: node import-manual.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data/rangekeeper.db');
const db = new sqlite3.Database(DB_PATH);

// Courses from IndexedDB
const courses = [
  { id: '_389545_1', name: '202610-MATH-125-007', instructor_name: 'Jedidiah Agyei', term: 'Spring 2026' },
  { id: '_392267_1', name: '202610-MATH-125-107', instructor_name: 'Jedidiah Agyei', term: 'Spring 2026' },
  { id: '_397881_1', name: '202610-ENGR-101-006', instructor_name: 'Bridgett Monk', term: 'Spring 2026' },
  { id: '_398913_1', name: '202610-UA-101-030', instructor_name: 'Pete Ludovice', term: 'Spring 2026' },
  { id: '_401764_1', name: '202610-REL-100-919', instructor_name: 'Multiple Instructors', term: 'Spring 2026' },
  { id: '_413210_1', name: '202610-EN-103-025', instructor_name: "Thom O'Rourke", term: 'Spring 2026' }
];

// Sample assignments (you can see more in the screenshot)
const assignments = [
  { title: 'Alternative Writing Assignment, if you prefer not to take Thriving Survey C', dueDate: '2026-04-11T04:00:00.000Z', status: 'normal' },
  { title: 'Assignment: Financial Planning (Materials)', dueDate: '2026-04-11T04:00:00.000Z', status: 'normal' },
  { title: 'Eating With Cannibals Discussion (select here to begin)', dueDate: '2026-04-03T04:59:00.000Z', status: 'normal' },
  { title: 'Family Resemblance Characteristics Discussion (select here to begin)', dueDate: '2026-03-27T04:59:00.000Z', status: 'upcoming' },
  { title: 'Free Exercise of Religion Discussion (select here to begin)', dueDate: '2026-04-24T04:59:00.000Z', status: 'normal' },
  { title: "Heaven's Gate Reaction Discussion (select here to begin)", dueDate: '2026-04-10T04:59:00.000Z', status: 'normal' },
  { title: 'Module 10 Quiz', dueDate: '2026-04-24T04:00:00.000Z', status: 'normal' },
  { title: 'Module 6 Quiz', dueDate: '2026-03-27T04:00:00.000Z', status: 'upcoming' },
  { title: 'Module 7 Quiz', dueDate: '2026-04-03T04:00:00.000Z', status: 'normal' },
  { title: 'Module 8 Quiz', dueDate: '2026-04-10T04:00:00.000Z', status: 'normal' },
  { title: 'Module 9 Quiz', dueDate: '2026-04-17T04:00:00.000Z', status: 'normal' },
  { title: 'Making the Strange Familiar and the Familiar Strange Discussion (select here to begin)', dueDate: '2026-04-10T04:59:00.000Z', status: 'normal' },
  { title: 'Student Success Analysis (due April 17th by 11:59 pm)', dueDate: '2026-04-18T04:00:00.000Z', status: 'normal' },
  { title: 'Suri Lip Discussion (select here to begin)', dueDate: '2026-04-03T04:59:00.000Z', status: 'normal' },
  { title: 'Professional Development 6 (due Apr. 10th by 11:59 pm)', dueDate: '2026-04-11T04:00:00.000Z', status: 'normal' },
  { title: 'Religion and Civic Discourse Discussion (select here to begin)', dueDate: '2026-04-24T04:59:00.000Z', status: 'normal' },
  { title: 'Rituals Discussion (select here to begin)', dueDate: '2026-04-17T04:59:00.000Z', status: 'normal' },
  { title: 'TED Talk — Noah Feldman Discussion (select here to begin)', dueDate: '2026-03-27T04:59:00.000Z', status: 'upcoming' }
];

console.log('🔄 Importing courses...');

db.serialize(() => {
  // Insert courses
  const courseStmt = db.prepare(`
    INSERT OR REPLACE INTO courses (id, name, instructor_name, term, last_synced, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  courses.forEach(course => {
    courseStmt.run(
      course.id,
      course.name,
      course.instructor_name,
      course.term,
      now,
      now,
      now
    );
    console.log(`  ✅ ${course.name} - ${course.instructor_name}`);
  });
  courseStmt.finalize();

  console.log('\n🔄 Importing assignments...');

  // Insert assignments
  const assignmentStmt = db.prepare(`
    INSERT OR REPLACE INTO assignments (id, title, due_date, submitted, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  assignments.forEach((assignment, idx) => {
    const id = `manual_import_${idx}_${Date.now()}`;
    const dueTimestamp = new Date(assignment.dueDate).getTime();
    
    assignmentStmt.run(
      id,
      assignment.title,
      dueTimestamp,
      0, // not submitted
      now,
      now
    );
    console.log(`  ✅ ${assignment.title}`);
  });
  assignmentStmt.finalize();

  console.log('\n✅ Import complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   Courses: ${courses.length}`);
  console.log(`   Assignments: ${assignments.length}`);
  
  db.close();
});
