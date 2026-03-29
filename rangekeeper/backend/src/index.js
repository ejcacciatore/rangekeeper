/**
 * RangeKeeper Backend API
 * Handles data sync, notifications, ICS polling, and Discord bot
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./database');
const { initDiscordBot } = require('./discord-bot');
const { startScheduler } = require('./scheduler');
const { startICSPoller } = require('./ics-poller');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/sync
 * Receives data from Chrome extension
 */
app.post('/api/sync', async (req, res) => {
  try {
    const { courses, assignments, grades, messages, feedback, announcements, currentPage } = req.body;

    console.log('[API] Received sync from page:', currentPage || 'unknown');
    console.log(`  - ${courses?.length || 0} courses`);
    console.log(`  - ${assignments?.length || 0} assignments`);
    console.log(`  - ${grades?.length || 0} grades`);
    console.log(`  - ${messages?.length || 0} messages`);
    console.log(`  - ${feedback?.length || 0} feedback`);
    console.log(`  - ${announcements?.length || 0} announcements`);

    // Save courses
    if (courses?.length > 0) {
      for (const course of courses) await db.upsertCourse(course);
    }

    // Save assignments
    if (assignments?.length > 0) {
      for (const assignment of assignments) await db.upsertAssignment(assignment);
    }

    // Save grades
    if (grades?.length > 0) {
      for (const grade of grades) {
        try { await db.run(
          `INSERT OR REPLACE INTO grades (id, course_id, assignment_name, score, possible, percentage, letter_grade, status, feedback, rubric_scores, source, scraped_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [grade.id, grade.courseId || grade.course_id, grade.assignmentName, grade.score,
           grade.possible, grade.percentage, grade.letterGrade, grade.status,
           grade.feedback || grade.instructorFeedback,
           grade.rubricScores ? JSON.stringify(grade.rubricScores) : null,
           grade.source, grade.scrapedAt || Date.now()]
        ); } catch(e) { /* table may not exist yet — create it */ await ensureGradesTables(); }
      }
    }

    // Save messages
    if (messages?.length > 0) {
      for (const msg of messages) {
        try { await db.run(
          `INSERT OR REPLACE INTO messages (id, type, course_id, sender, subject, preview, body, date, is_unread, unread_count, source, scraped_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [msg.id, msg.type, msg.courseId || msg.course_id, msg.sender,
           msg.subject, msg.preview, msg.body, msg.date,
           msg.isUnread ? 1 : 0, msg.unreadCount || 0,
           msg.source, msg.scrapedAt || Date.now()]
        ); } catch(e) { await ensureGradesTables(); }
      }
    }

    // Save feedback
    if (feedback?.length > 0) {
      for (const fb of feedback) {
        try { await db.run(
          `INSERT OR REPLACE INTO feedback (id, course_id, assignment_name, score, possible, instructor_feedback, rubric_scores, submission_date, graded_date, scraped_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [fb.id, fb.courseId, fb.assignmentName, fb.score, fb.possible,
           fb.instructorFeedback, fb.rubricScores ? JSON.stringify(fb.rubricScores) : null,
           fb.submissionDate, fb.gradedDate, fb.scrapedAt || Date.now()]
        ); } catch(e) { await ensureGradesTables(); }
      }
    }

    // Check for new grades/messages → Discord notifications
    if (grades?.length > 0) checkNewGradesForDiscord(grades);
    if (messages?.length > 0) checkNewMessagesForDiscord(messages);

    res.json({
      status: 'success',
      message: 'Data synced successfully',
      timestamp: Date.now(),
      synced: {
        courses: courses?.length || 0,
        assignments: assignments?.length || 0,
        grades: grades?.length || 0,
        messages: messages?.length || 0,
        feedback: feedback?.length || 0,
      }
    });

  } catch (err) {
    console.error('[API] Sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/assignments
 * Returns assignments for a date range
 */
app.get('/api/assignments', async (req, res) => {
  try {
    const { start, end, courseId, submitted, limit } = req.query;
    
    const filters = {};
    
    if (start) filters.dueAfter = new Date(start).getTime();
    if (end) filters.dueBefore = new Date(end).getTime();
    if (courseId) filters.courseId = courseId;
    if (submitted !== undefined) filters.submitted = submitted === 'true';
    if (limit) filters.limit = parseInt(limit);
    
    const assignments = await db.getAssignments(filters);
    
    res.json({
      assignments,
      count: assignments.length
    });
    
  } catch (err) {
    console.error('[API] Get assignments error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/assignments/:id
 * Get single assignment
 */
app.get('/api/assignments/:id', async (req, res) => {
  try {
    const assignment = await db.getAssignment(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json(assignment);
    
  } catch (err) {
    console.error('[API] Get assignment error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/grades
 */
app.get('/api/grades', async (req, res) => {
  try {
    const rows = await db.all(`SELECT * FROM grades ORDER BY scraped_at DESC LIMIT 200`).catch(() => []);
    res.json({ grades: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/messages
 */
app.get('/api/messages', async (req, res) => {
  try {
    const rows = await db.all(`SELECT * FROM messages ORDER BY scraped_at DESC LIMIT 200`).catch(() => []);
    res.json({ messages: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/feedback
 */
app.get('/api/feedback', async (req, res) => {
  try {
    const rows = await db.all(`SELECT * FROM feedback ORDER BY scraped_at DESC LIMIT 100`).catch(() => []);
    res.json({ feedback: rows, count: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/summary
 * Quick dashboard summary
 */
app.get('/api/summary', async (req, res) => {
  try {
    const [courses, assignments, grades, messages] = await Promise.all([
      db.all(`SELECT COUNT(*) as n FROM courses`).catch(() => [{n:0}]),
      db.all(`SELECT COUNT(*) as n FROM assignments`).catch(() => [{n:0}]),
      db.all(`SELECT COUNT(*) as n FROM grades WHERE assignment_name != '__OVERALL__'`).catch(() => [{n:0}]),
      db.all(`SELECT SUM(unread_count) as n FROM messages WHERE type='course-thread'`).catch(() => [{n:0}]),
    ]);
    res.json({
      courses: courses[0].n,
      assignments: assignments[0].n,
      grades: grades[0].n,
      unreadMessages: messages[0].n || 0,
      timestamp: Date.now()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/courses
 * Returns all courses
 */
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await db.getCourses();
    
    res.json({
      courses,
      count: courses.length
    });
    
  } catch (err) {
    console.error('[API] Get courses error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/ics/add
 * Student submits ICS feed URL
 */
app.post('/api/ics/add', async (req, res) => {
  try {
    const { icsUrl, name } = req.body;
    
    if (!icsUrl) {
      return res.status(400).json({ error: 'icsUrl is required' });
    }
    
    // Basic URL validation
    if (!icsUrl.startsWith('http://') && !icsUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    console.log('[API] Adding ICS feed:', icsUrl);
    
    await db.addICSFeed(icsUrl, name);
    
    res.json({
      status: 'success',
      message: 'ICS feed added successfully'
    });
    
  } catch (err) {
    console.error('[API] Add ICS error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/ics/feeds
 * List all ICS feeds
 */
app.get('/api/ics/feeds', async (req, res) => {
  try {
    const feeds = await db.getICSFeeds();
    res.json({ feeds });
  } catch (err) {
    console.error('[API] Get ICS feeds error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    components: {
      database: 'ok',
      discord: require('./discord-bot').isReady() ? 'connected' : 'disconnected',
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function ensureGradesTables() {
  await db.run(`CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    assignment_name TEXT,
    score TEXT,
    possible TEXT,
    percentage REAL,
    letter_grade TEXT,
    status TEXT,
    feedback TEXT,
    rubric_scores TEXT,
    source TEXT,
    scraped_at INTEGER
  )`).catch(() => {});

  await db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    type TEXT,
    course_id TEXT,
    sender TEXT,
    subject TEXT,
    preview TEXT,
    body TEXT,
    date TEXT,
    is_unread INTEGER DEFAULT 0,
    unread_count INTEGER DEFAULT 0,
    source TEXT,
    scraped_at INTEGER
  )`).catch(() => {});

  await db.run(`CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    course_id TEXT,
    assignment_name TEXT,
    score TEXT,
    possible TEXT,
    instructor_feedback TEXT,
    rubric_scores TEXT,
    submission_date TEXT,
    graded_date TEXT,
    scraped_at INTEGER
  )`).catch(() => {});
}

// Track notified items to avoid duplicate Discord pings
const notifiedGrades = new Set();
const notifiedMessages = new Set();

function checkNewGradesForDiscord(grades) {
  const { sendDiscordMessage } = require('./discord-bot');
  for (const g of grades) {
    if (!g.id || notifiedGrades.has(g.id)) continue;
    if (g.score || g.letterGrade) {
      const score = g.score && g.possible ? `${g.score}/${g.possible}` : g.letterGrade || 'New grade';
      sendDiscordMessage(`📊 **New Grade:** ${g.assignmentName || 'Assignment'} — **${score}**${g.courseId ? ` (${g.courseId})` : ''}`).catch(() => {});
      notifiedGrades.add(g.id);
    }
  }
}

function checkNewMessagesForDiscord(messages) {
  const { sendDiscordMessage } = require('./discord-bot');
  for (const m of messages) {
    if (!m.id || notifiedMessages.has(m.id)) continue;
    if (m.isUnread || m.type === 'message-detail') {
      sendDiscordMessage(`💬 **New Message from ${m.sender || 'Instructor'}:** ${(m.subject || m.preview || '').substring(0, 100)}`).catch(() => {});
      notifiedMessages.add(m.id);
    }
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function startServer() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎯 RangeKeeper Backend');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Initialize Discord bot (optional)
  if (process.env.DISCORD_BOT_TOKEN) {
    try {
      await initDiscordBot();
      console.log('[Init] ✅ Discord bot initialized\n');
    } catch (err) {
      console.error('[Init] ⚠️  Discord bot failed to initialize:', err.message);
      console.log('[Init] Continuing without Discord integration\n');
    }
  } else {
    console.log('[Init] ⚠️  DISCORD_BOT_TOKEN not set, skipping Discord integration\n');
  }

  // Ensure all tables exist
  await ensureGradesTables();

  // Start notification scheduler
  startScheduler();

  // Start ICS poller
  startICSPoller();

  // Start Express server (listen on 0.0.0.0 for extension access)
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n[Server] 🚀 Listening on http://0.0.0.0:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/health\n`);
  });
}

// ============================================================================
// START
// ============================================================================

startServer().catch(err => {
  console.error('[Fatal] Server initialization failed:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[Server] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
