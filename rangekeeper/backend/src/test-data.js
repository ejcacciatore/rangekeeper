/**
 * Test Data Generator
 * Creates sample assignments for testing without needing real Blackboard access
 */

const { upsertCourse, upsertAssignment, getAssignments, getCourses } = require('./database');

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_COURSES = [
  {
    id: 'test_course_hist101',
    name: 'HIST 101: World History',
    term: 'Spring 2026',
    instructorName: 'Dr. Sarah Johnson',
    url: 'https://ualearn.blackboard.com/ultra/course/test_course_hist101',
    scrapedAt: Date.now(),
  },
  {
    id: 'test_course_math221',
    name: 'MATH 221: Calculus I',
    term: 'Spring 2026',
    instructorName: 'Prof. Michael Chen',
    url: 'https://ualearn.blackboard.com/ultra/course/test_course_math221',
    scrapedAt: Date.now(),
  },
  {
    id: 'test_course_eng102',
    name: 'ENG 102: Composition II',
    term: 'Spring 2026',
    instructorName: 'Dr. Emily Rodriguez',
    url: 'https://ualearn.blackboard.com/ultra/course/test_course_eng102',
    scrapedAt: Date.now(),
  },
];

function generateTestAssignments() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  return [
    // DUE IN 30 MINUTES (URGENT)
    {
      id: 'test_urgent_quiz',
      courseId: 'test_course_hist101',
      title: 'Chapter 5 Quiz',
      description: 'Online quiz covering chapters 4-5. 20 multiple choice questions, 30 minute time limit.',
      dueDate: now + (0.5 * oneHour), // 30 minutes from now
      points: 20,
      submitted: false,
      scrapedAt: now,
    },

    // DUE IN 4 HOURS (URGENT)
    {
      id: 'test_urgent_homework',
      courseId: 'test_course_math221',
      title: 'Problem Set 7',
      description: 'Complete problems 1-15 from Section 3.2. Show all work.',
      dueDate: now + (4 * oneHour),
      points: 50,
      submitted: false,
      scrapedAt: now,
    },

    // DUE TOMORROW (FIRM REMINDER)
    {
      id: 'test_tomorrow_essay',
      courseId: 'test_course_eng102',
      title: 'Argumentative Essay Draft',
      description: 'Submit a complete draft of your argumentative essay (minimum 1000 words).',
      dueDate: now + oneDay,
      points: 100,
      submitted: false,
      scrapedAt: now,
    },

    // DUE IN 2 DAYS (MODERATE REMINDER)
    {
      id: 'test_2day_discussion',
      courseId: 'test_course_hist101',
      title: 'Discussion Board: Industrial Revolution',
      description: 'Post your initial response (250 words) and reply to 2 peers.',
      dueDate: now + (2 * oneDay),
      points: 25,
      submitted: false,
      scrapedAt: now,
    },

    // DUE IN 3 DAYS (MODERATE REMINDER)
    {
      id: 'test_3day_lab',
      courseId: 'test_course_math221',
      title: 'Calculus Lab 4',
      description: 'Complete the Desmos lab activity and submit your responses.',
      dueDate: now + (3 * oneDay),
      points: 30,
      submitted: false,
      scrapedAt: now,
    },

    // DUE IN 5 DAYS (GENTLE FYI)
    {
      id: 'test_5day_reading',
      courseId: 'test_course_eng102',
      title: 'Reading Response: Chapter 8',
      description: 'Read chapter 8 and post a 200-word reflection.',
      dueDate: now + (5 * oneDay),
      points: 15,
      submitted: false,
      scrapedAt: now,
    },

    // DUE IN 1 WEEK (GENTLE FYI)
    {
      id: 'test_1week_project',
      courseId: 'test_course_hist101',
      title: 'Research Paper Outline',
      description: 'Submit a detailed outline for your final research paper.',
      dueDate: now + (7 * oneDay),
      points: 50,
      submitted: false,
      scrapedAt: now,
    },

    // OVERDUE (1 day past due)
    {
      id: 'test_overdue_homework',
      courseId: 'test_course_math221',
      title: 'Problem Set 6',
      description: 'Complete problems 1-12 from Section 3.1.',
      dueDate: now - oneDay,
      points: 50,
      submitted: false,
      scrapedAt: now - (2 * oneDay),
    },

    // COMPLETED (for reference)
    {
      id: 'test_completed_assignment',
      courseId: 'test_course_eng102',
      title: 'Grammar Exercise 4',
      description: 'Complete the online grammar exercises.',
      dueDate: now - (3 * oneDay),
      points: 10,
      submitted: true,
      grade: 10,
      scrapedAt: now - (5 * oneDay),
    },
  ];
}

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seedTestData() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🌱 Seeding Test Data');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Insert courses
    console.log('[Seed] Inserting courses...');
    for (const course of SAMPLE_COURSES) {
      await upsertCourse(course);
      console.log(`  ✅ ${course.name}`);
    }

    // Insert assignments
    console.log('\n[Seed] Inserting assignments...');
    const assignments = generateTestAssignments();
    for (const assignment of assignments) {
      await upsertAssignment(assignment);
      const urgency = getUrgencyLabel(assignment.dueDate);
      console.log(`  ✅ ${assignment.title} (${urgency})`);
    }

    // Verify
    console.log('\n[Seed] Verifying data...');
    const courses = await getCourses();
    const allAssignments = await getAssignments();
    
    console.log(`  📚 Courses: ${courses.length}`);
    console.log(`  📝 Assignments: ${allAssignments.length}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ✅ Test data seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);

  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
    process.exit(1);
  }
}

function getUrgencyLabel(dueDate) {
  const now = Date.now();
  const hoursUntil = (dueDate - now) / (1000 * 60 * 60);

  if (hoursUntil < 0) return 'OVERDUE';
  if (hoursUntil < 2) return 'URGENT <2h';
  if (hoursUntil < 6) return 'URGENT <6h';
  if (hoursUntil < 24) return 'Due tomorrow';
  if (hoursUntil < 72) return 'Due in 2-3 days';
  return 'Due this week';
}

// ============================================================================
// RUN
// ============================================================================

seedTestData();
