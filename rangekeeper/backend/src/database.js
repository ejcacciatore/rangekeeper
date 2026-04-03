/**
 * RangeKeeper Database Layer
 * SQLite with full schema for courses, assignments, grades, notifications
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../data/rangekeeper.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[Database] Error opening database:', err);
    process.exit(1);
  }
  console.log(`[Database] Connected to ${DB_PATH}`);
});

// ============================================================================
// SCHEMA INITIALIZATION
// ============================================================================

db.serialize(() => {
  // Courses
  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      term TEXT,
      instructor_name TEXT,
      url TEXT,
      last_synced INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Assignments
  db.run(`
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      due_date INTEGER,
      points REAL,
      submitted INTEGER DEFAULT 0,
      grade REAL,
      url TEXT,
      last_synced INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  // Grades
  db.run(`
    CREATE TABLE IF NOT EXISTS grades (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      assignment_id TEXT,
      score REAL,
      max_score REAL,
      percentage REAL,
      grade_posted_date INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (assignment_id) REFERENCES assignments(id)
    )
  `);

  // Announcements
  db.run(`
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      course_id TEXT,
      title TEXT NOT NULL,
      body TEXT,
      posted_date INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  // Notifications (track what we've sent to avoid duplicates)
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      assignment_id TEXT,
      type TEXT NOT NULL,
      urgency TEXT NOT NULL,
      sent_at INTEGER,
      channel TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (assignment_id) REFERENCES assignments(id)
    )
  `);

  // ICS Feeds
  db.run(`
    CREATE TABLE IF NOT EXISTS ics_feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      name TEXT,
      last_polled INTEGER,
      status TEXT DEFAULT 'active',
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // User Settings
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Create indexes for common queries
  db.run('CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at)');
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Run a query that doesn't return rows
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Get a single row
 */
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Get all rows
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ============================================================================
// COURSE OPERATIONS
// ============================================================================

async function upsertCourse(course) {
  const sql = `
    INSERT INTO courses (id, name, term, instructor_name, url, last_synced, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      term = excluded.term,
      instructor_name = excluded.instructor_name,
      url = excluded.url,
      last_synced = excluded.last_synced,
      updated_at = excluded.updated_at
  `;
  
  const now = Date.now();
  return run(sql, [
    course.id,
    course.name,
    course.term || null,
    course.instructorName || null,
    course.url || null,
    course.scrapedAt || now,
    now
  ]);
}

async function getCourses() {
  return all('SELECT * FROM courses ORDER BY name');
}

async function getCourse(id) {
  return get('SELECT * FROM courses WHERE id = ?', [id]);
}

// ============================================================================
// ASSIGNMENT OPERATIONS
// ============================================================================

async function upsertAssignment(assignment) {
  const sql = `
    INSERT INTO assignments (id, course_id, title, description, due_date, points, submitted, grade, url, last_synced, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      course_id = excluded.course_id,
      title = excluded.title,
      description = excluded.description,
      due_date = excluded.due_date,
      points = excluded.points,
      submitted = excluded.submitted,
      grade = excluded.grade,
      url = excluded.url,
      last_synced = excluded.last_synced,
      updated_at = excluded.updated_at
  `;
  
  const now = Date.now();
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate).getTime() : null;
  
  return run(sql, [
    assignment.id,
    assignment.courseId || null,
    assignment.title,
    assignment.description || null,
    dueDate,
    assignment.points || null,
    assignment.submitted ? 1 : 0,
    assignment.grade || null,
    assignment.url || null,
    assignment.scrapedAt || now,
    now
  ]);
}

async function getAssignments(filters = {}) {
  let sql = `
    SELECT a.*, c.name as course_name, c.term as course_term
    FROM assignments a
    LEFT JOIN courses c ON a.course_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (filters.courseId) {
    sql += ' AND a.course_id = ?';
    params.push(filters.courseId);
  }

  if (filters.submitted !== undefined) {
    sql += ' AND a.submitted = ?';
    params.push(filters.submitted ? 1 : 0);
  }

  if (filters.dueBefore) {
    sql += ' AND a.due_date < ?';
    params.push(filters.dueBefore);
  }

  if (filters.dueAfter) {
    sql += ' AND a.due_date > ?';
    params.push(filters.dueAfter);
  }

  sql += ' ORDER BY a.due_date ASC';

  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }

  return all(sql, params);
}

async function getAssignment(id) {
  const sql = `
    SELECT a.*, c.name as course_name, c.term as course_term
    FROM assignments a
    LEFT JOIN courses c ON a.course_id = c.id
    WHERE a.id = ?
  `;
  return get(sql, [id]);
}

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

async function logNotification(notification) {
  const sql = `
    INSERT INTO notifications (id, assignment_id, type, urgency, sent_at, channel)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return run(sql, [
    id,
    notification.assignmentId,
    notification.type,
    notification.urgency,
    Date.now(),
    notification.channel || 'unknown'
  ]);
}

async function hasNotificationBeenSent(assignmentId, type) {
  const sql = `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE assignment_id = ? AND type = ?
  `;
  
  const result = await get(sql, [assignmentId, type]);
  return result.count > 0;
}

// ============================================================================
// ICS FEED OPERATIONS
// ============================================================================

async function addICSFeed(url, name = null) {
  const sql = `
    INSERT INTO ics_feeds (url, name)
    VALUES (?, ?)
    ON CONFLICT(url) DO UPDATE SET
      name = excluded.name,
      status = 'active'
  `;
  
  return run(sql, [url, name]);
}

async function getICSFeeds() {
  return all('SELECT * FROM ics_feeds WHERE status = ?', ['active']);
}

async function updateICSFeedPoll(id) {
  return run(
    'UPDATE ics_feeds SET last_polled = ? WHERE id = ?',
    [Date.now(), id]
  );
}

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

async function setSetting(key, value) {
  const sql = `
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `;
  
  return run(sql, [key, JSON.stringify(value), Date.now()]);
}

async function getSetting(key, defaultValue = null) {
  const row = await get('SELECT value FROM settings WHERE key = ?', [key]);
  if (!row) return defaultValue;
  
  try {
    return JSON.parse(row.value);
  } catch {
    return row.value;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  db,
  run,
  get,
  all,
  
  // Courses
  upsertCourse,
  getCourses,
  getCourse,
  
  // Assignments
  upsertAssignment,
  getAssignments,
  getAssignment,
  
  // Notifications
  logNotification,
  hasNotificationBeenSent,
  
  // ICS Feeds
  addICSFeed,
  getICSFeeds,
  updateICSFeedPoll,
  
  // Settings
  setSetting,
  getSetting,
};
