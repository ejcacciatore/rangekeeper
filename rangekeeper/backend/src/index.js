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
    const { courses, assignments, grades, announcements } = req.body;
    
    console.log('[API] Received sync data:');
    console.log(`  - ${courses?.length || 0} courses`);
    console.log(`  - ${assignments?.length || 0} assignments`);
    console.log(`  - ${grades?.length || 0} grades`);
    console.log(`  - ${announcements?.length || 0} announcements`);
    
    // Save courses
    if (courses && courses.length > 0) {
      for (const course of courses) {
        await db.upsertCourse(course);
      }
    }
    
    // Save assignments
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        await db.upsertAssignment(assignment);
      }
    }
    
    // TODO: Save grades and announcements when implemented
    
    res.json({
      status: 'success',
      message: 'Data synced successfully',
      timestamp: Date.now(),
      synced: {
        courses: courses?.length || 0,
        assignments: assignments?.length || 0,
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

  // Start notification scheduler
  startScheduler();

  // Start ICS poller
  startICSPoller();

  // Start Express server
  app.listen(PORT, () => {
    console.log(`\n[Server] 🚀 Listening on http://localhost:${PORT}`);
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
