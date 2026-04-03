// RangeKeeper Data Fetcher
// Loads data from IndexedDB (populated by extension)

let cachedData = null;
let db = null;

// Open IndexedDB connection
async function openDatabase() {
  if (db) return db;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rangekeeper-db', 1);
    
    request.onerror = () => {
      console.error('[RangeKeeper] Failed to open IndexedDB:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      db = request.result;
      console.log('[RangeKeeper] ✅ Connected to IndexedDB');
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('courses')) {
        db.createObjectStore('courses', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('assignments')) {
        const assignmentStore = db.createObjectStore('assignments', { keyPath: 'id' });
        assignmentStore.createIndex('course_id', 'course_id', { unique: false });
        assignmentStore.createIndex('due_date', 'due_date', { unique: false });
      }
      if (!db.objectStoreNames.contains('grades')) {
        db.createObjectStore('grades', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'id' });
      }
    };
  });
}

// Load all records from a store
async function getAllFromStore(storeName) {
  const database = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      console.log(`[RangeKeeper] Loaded ${request.result.length} items from ${storeName}`);
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error(`[RangeKeeper] Failed to load ${storeName}:`, request.error);
      reject(request.error);
    };
  });
}

async function loadData() {
  if (cachedData) return cachedData;
  
  try {
    const [courses, assignments, grades, messages] = await Promise.all([
      getAllFromStore('courses'),
      getAllFromStore('assignments'),
      getAllFromStore('grades'),
      getAllFromStore('messages')
    ]);
    
    cachedData = {
      courses,
      assignments,
      grades,
      messages,
      generated_at: Date.now()
    };
    
    console.log('[RangeKeeper] ✅ Data loaded:', {
      courses: courses.length,
      assignments: assignments.length,
      grades: grades.length,
      messages: messages.length
    });
    
    return cachedData;
  } catch (error) {
    console.error('[RangeKeeper] Failed to load data from IndexedDB:', error);
    return { courses: [], assignments: [], grades: [], messages: [], generated_at: 0 };
  }
}

// Reload data (clear cache and fetch fresh)
async function reloadData() {
  cachedData = null;
  return loadData();
}

function getDueToday(assignments) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + (24 * 60 * 60 * 1000);
  
  return assignments.filter(a => 
    a.due_date >= startOfDay && 
    a.due_date < endOfDay &&
    !a.submitted
  );
}

function getDueThisWeek(assignments) {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  
  return assignments.filter(a => 
    a.due_date >= now && 
    a.due_date < (now + oneWeek) &&
    !a.submitted
  ).sort((a, b) => a.due_date - b.due_date);
}

function getOverdue(assignments) {
  const now = Date.now();
  return assignments.filter(a => a.due_date < now && !a.submitted);
}

function calculatePriority(assignment) {
  const now = Date.now();
  const hoursUntilDue = (assignment.due_date - now) / (1000 * 60 * 60);
  
  if (hoursUntilDue < 0 || hoursUntilDue < 6) return 2; // URGENT
  if (hoursUntilDue < 24 || (assignment.points && assignment.points > 50)) return 1; // HIGH
  return 0; // NORMAL
}

function getPriorityLabel(priority) {
  switch(priority) {
    case 2: return 'URGENT';
    case 1: return 'HIGH';
    default: return 'NORMAL';
  }
}

function getPriorityColor(priority) {
  switch(priority) {
    case 2: return '#dc2626'; // red
    case 1: return '#f59e0b'; // orange
    default: return '#10b981'; // green
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'No due date';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatTimeRemaining(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff < 0) return 'Overdue';
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function getCourseName(courseId, courses) {
  const course = courses.find(c => c.id === courseId);
  if (!course) return 'Unknown Course';
  
  // Parse course code (e.g., "202610-REL-100-919" -> "REL-100")
  const match = course.name.match(/\d+-([A-Z]+-\d+)/);
  return match ? match[1] : course.name;
}

function getCourseColor(courseId) {
  // Simple hash to color mapping
  const colors = [
    '#9E1B32', // Alabama Crimson
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#8b5cf6', // Purple
    '#ec4899'  // Pink
  ];
  
  const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Export functions
window.RangeKeeperData = {
  loadData,
  reloadData,
  getDueToday,
  getDueThisWeek,
  getOverdue,
  calculatePriority,
  getPriorityLabel,
  getPriorityColor,
  formatDate,
  formatTimeRemaining,
  getCourseName,
  getCourseColor
};
